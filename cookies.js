(() => {
  const panel = document.querySelector('#cookies-preferencias');
  const key = 'casa-kombucha.cookies.v1';
  function preference() {
    try { return localStorage.getItem(key); } catch { return null; }
  }
  for (const button of document.querySelectorAll('[data-cookie-settings]')) {
    button.hidden = false;
    button.addEventListener('click', () => {
      panel.hidden = false;
      panel.querySelector('button').focus();
    });
  }
  panel.addEventListener('click', event => {
    const choice = event.target.closest('[data-cookie-choice]');
    if (!choice) return;
    try { localStorage.setItem(key,choice.dataset.cookieChoice); } catch {}
    panel.hidden = true;
  });
  if (!preference()) panel.hidden = false;
})();
