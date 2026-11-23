(() => {
  const viewport=document.querySelector('.product-carousel');
  if(!viewport)return;
  const track=viewport.querySelector('.flavor-grid'),originals=[...track.children];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),speed=.065;
  let animation,cycle=0,visible=false,pointer=null,dragging=false,startX=0,startPhase=0,suppressClick=false,resizeTimer;
  const mod=(n,size)=>size?((n%size)+size)%size:0;
  const phase=()=>mod((animation?.currentTime||0)*speed,cycle);
  function sync(){if(animation)(visible&&!document.hidden&&!reduced.matches&&!dragging)?animation.play():animation.pause()}
  for(const side of ['before','after']){
    const fragment=document.createDocumentFragment();
    for(const card of originals){const clone=card.cloneNode(true);clone.dataset.copy=side;clone.setAttribute('aria-hidden','true');clone.querySelectorAll('a,button').forEach(a=>a.tabIndex=-1);fragment.append(clone)}
    side==='before'?track.prepend(fragment):track.append(fragment);
  }
  function measure(){
    const fraction=cycle?phase()/cycle:0;
    const next=track.children[originals.length].offsetLeft-track.firstElementChild.offsetLeft;
    if(!next||Math.abs(next-cycle)<.1)return;
    cycle=next;
    animation?.cancel();
    animation=track.animate([{transform:`translate3d(${-cycle}px,0,0)`},{transform:`translate3d(${-cycle*2}px,0,0)`}],{duration:cycle/speed,iterations:Infinity,easing:'linear'});
    animation.currentTime=fraction*cycle/speed;sync();
  }
  viewport.addEventListener('pointerdown',event=>{if(event.button)return;pointer=event.pointerId;startX=event.clientX;startPhase=phase();dragging=false},{passive:true});
  viewport.addEventListener('pointermove',event=>{
    if(pointer!==event.pointerId)return;
    const dx=event.clientX-startX;
    if(!dragging&&Math.abs(dx)<6)return;
    if(!dragging){startPhase=phase();startX=event.clientX;dragging=true;viewport.setPointerCapture(pointer);sync();}
    animation.currentTime=mod(startPhase-(event.clientX-startX),cycle)/speed;
    suppressClick=true;
  },{passive:true});
  const release=event=>{if(pointer===null||(event.pointerId!==undefined&&pointer!==event.pointerId))return;pointer=null;dragging=false;sync();setTimeout(()=>suppressClick=false,0)};
  window.addEventListener('pointerup',release,{passive:true});window.addEventListener('pointercancel',release,{passive:true});window.addEventListener('blur',release);
  viewport.addEventListener('click',event=>{if(suppressClick){event.preventDefault();event.stopPropagation()}},true);
  viewport.addEventListener('wheel',event=>{if(!animation||(!event.shiftKey&&Math.abs(event.deltaX)<=Math.abs(event.deltaY)))return;event.preventDefault();animation.currentTime=mod(phase()+(event.deltaX||event.deltaY),cycle)/speed},{passive:false});
  viewport.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight'].includes(event.key)||!animation)return;event.preventDefault();const step=originals[0].offsetWidth+parseFloat(getComputedStyle(track).gap);animation.currentTime=mod(phase()+(event.key==='ArrowRight'?step:-step),cycle)/speed});
  viewport.addEventListener('focusin',event=>{
    if(!animation||!event.target.matches(':focus-visible'))return;
    const card=event.target.closest('.flavor');if(!card)return;
    animation.currentTime=mod(card.offsetLeft-cycle-(viewport.clientWidth-card.offsetWidth)/2,cycle)/speed;
  });
  const images=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){const img=entry.target;if(img.dataset.src)img.src=img.dataset.src;images.unobserve(img)}},{rootMargin:'600px'});
  track.querySelectorAll('img[data-src]').forEach(img=>images.observe(img));
  let width=viewport.clientWidth;
  new ResizeObserver(([entry])=>{if(Math.abs(width-entry.contentRect.width)<.5)return;width=entry.contentRect.width;clearTimeout(resizeTimer);resizeTimer=setTimeout(measure,180)}).observe(viewport);
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync()}).observe(viewport);
  document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
  measure();
})();
