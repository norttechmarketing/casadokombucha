(() => {
  const sections = ['inicio', 'produtos', 'por-que', 'depoimentos', 'sobre', 'contato'];
  const header = document.querySelector('.top');
  const menu = [...header.querySelectorAll('nav a[data-section]')];
  const fixedHeader = matchMedia('(min-width: 761px)');
  const headerOffset = () => fixedHeader.matches ? header.getBoundingClientRect().height : 0;
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
      const offset = headerOffset();
      if(window.lenis)window.lenis.scrollTo(target,{duration:1.2,offset:-offset});
      else window.scrollTo({top:window.scrollY + target.getBoundingClientRect().top - offset,behavior:'instant'});
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
  let queued = false, positions=[],offset=0,lastActive;
  function measureSections(){
    const y=scrollY;
    offset=headerOffset();
    positions=sections.map(id=>({id,top:document.getElementById(id).getBoundingClientRect().top+y}));
    window.lenis?.resize();
    updateMenu();
  }
  function updateMenu() {
    queued = false;
    const edge = scrollY + offset + 26;
    let active = sections[0];
    for (const section of positions) {
      if (section.top <= edge) active = section.id;
    }
    const atEnd = window.scrollY + innerHeight >= document.documentElement.scrollHeight - 2;
    if (atEnd && active === 'sobre') active = 'contato';
    if(active===lastActive)return;
    lastActive=active;
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
  let resizeTimer;
  window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(measureSections,180)},{passive:true});
  window.addEventListener('load',measureSections,{once:true});
  document.fonts?.ready.then(measureSections);
  document.addEventListener('toggle',event=>{if(event.target.matches?.('details'))requestAnimationFrame(measureSections)},true);
  measureSections();
})();
