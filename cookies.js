(() => {
  const panel=document.querySelector('#cookies-preferencias');if(!panel)return;
  const key='casa-kombucha.cookies.v1';let trigger;
  const preference=()=>{try{return localStorage.getItem(key)}catch{return null}};
  const close=()=>{panel.hidden=true;trigger?.focus({preventScroll:true});trigger=undefined};
  panel.setAttribute('data-lenis-prevent','');
  for(const button of document.querySelectorAll('[data-cookie-settings]')){button.hidden=false;button.addEventListener('click',()=>{trigger=button;panel.hidden=false;panel.querySelector('button')?.focus({preventScroll:true})})}
  panel.addEventListener('click',event=>{const choice=event.target.closest('[data-cookie-choice]');if(!choice)return;try{localStorage.setItem(key,choice.dataset.cookieChoice)}catch{}close()});
  panel.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();close()}});
  if(!preference())panel.hidden=false;
})();
