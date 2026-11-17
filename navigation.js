(() => {
  const sections = ['inicio', 'produtos', 'por-que', 'depoimentos', 'sobre', 'contato'];
  const header = document.querySelector('.top');
  const menu = [...header.querySelectorAll('nav a[data-section]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let pending;
  let frame;
  function goToSection(id, { history: push = true } = {}) {
    if (!sections.includes(id)) return;
    const target = document.getElementById(id);
    if (!target) {
      location.assign('/?section=' + encodeURIComponent(id));
      return;
    }
    if (pending === id) return;
    cancelAnimationFrame(frame);
    pending = id;
    if (push) {
      const url = new URL(location.href);
      url.searchParams.delete('section');
      url.hash = id;
      if (url.href !== location.href) window.history.pushState(null, '', url);
    }
    frame = requestAnimationFrame(() => {
      pending = null;
      target.setAttribute('tabindex', '-1');
      target.focus({preventScroll:true});
      const offset = header.getBoundingClientRect().height;
      window.scrollTo({top:window.scrollY + target.getBoundingClientRect().top - offset,behavior:reduced.matches?'instant':'smooth'});
    });
  }
  window.goToSection = goToSection;
  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-section]');
    if (!link || event.defaultPrevented || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    goToSection(link.dataset.section);
  });
  if (!document.getElementById('inicio')) return;
  const readSection = () => new URLSearchParams(location.search).get('section') || location.hash.slice(1);
  const initial = readSection();
  if (sections.includes(initial)) goToSection(initial,{history:false});
  window.addEventListener('popstate', () => goToSection(readSection() || 'inicio',{history:false}));
  let queued = false;
  function updateMenu() {
    queued = false;
    const edge = header.getBoundingClientRect().height + 26;
    let active = sections[0];
    for (const id of sections) {
      if (document.getElementById(id).getBoundingClientRect().top <= edge) active = id;
    }
    const atEnd = window.scrollY + innerHeight >= document.documentElement.scrollHeight - 2;
    if (atEnd && active === 'sobre') active = 'contato';
    for (const link of menu) {
      if (link.dataset.section === active) link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    }
  }
  window.addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(updateMenu);
  },{passive:true});
  window.addEventListener('resize',updateMenu);
  updateMenu();
})();
