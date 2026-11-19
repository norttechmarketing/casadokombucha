(() => {
  const viewport=document.querySelector('.product-carousel');
  if (!viewport) return;
  const track=viewport.querySelector('.flavor-grid');
  const originals=[...track.children];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let visible=false, dragging=false;
  let wakeAt=0, frame=0, last=0, cycle=0, position=0;
  for (const side of ['before','after']) {
    const group=document.createDocumentFragment();
    for (const source of originals) {
      const clone=source.cloneNode(true);
      clone.dataset.copy=side;
      clone.setAttribute('aria-hidden','true');
      clone.querySelectorAll('a,button').forEach(link=>link.tabIndex=-1);
      group.append(clone);
    }
    if(side==='before')track.prepend(group);
    else track.append(group);
  }
  const first=track.children[originals.length];
  const imageObserver=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(!entry.isIntersecting)continue;
      const image=entry.target;
      if(image.dataset.src)image.src=image.dataset.src;
      imageObserver.unobserve(image);
    }
  },{rootMargin:'600px'});
  track.querySelectorAll('img[data-src]').forEach(image=>imageObserver.observe(image));
  function measure() {
    const fraction=cycle ? position/cycle : 0;
    cycle=first.offsetLeft-track.firstElementChild.offsetLeft;
    position=fraction*cycle;
    viewport.scrollLeft=cycle;
    track.style.transform=`translate3d(${-position}px,0,0)`;
  }
  function normalize() {
    if(!cycle) return;
    const x=viewport.scrollLeft;
    if(x<cycle*.5) viewport.scrollLeft=x+cycle;
    else if(x>=cycle*2.5) viewport.scrollLeft=x-cycle;
  }
  function stop() {cancelAnimationFrame(frame);frame=0;last=0;}
  function tick(now) {
    frame=0;
    if(!visible || document.hidden || reduced.matches || dragging) return;
    const dt=last ? Math.min(now-last,50) : 0;
    last=now;
    if(now>=wakeAt) {
      position+=dt*.065;
      if(cycle)position%=cycle;
      track.style.transform=`translate3d(${-position}px,0,0)`;
    }
    frame=requestAnimationFrame(tick);
  }
  function sync() {
    stop();
    if(visible&&!document.hidden&&!reduced.matches&&!dragging)frame=requestAnimationFrame(tick);
  }
  viewport.addEventListener('pointerdown',event=>{
    if(event.pointerType==='mouse') return;
    dragging=true;sync();
  },{passive:true});
  const release=()=>{
    if(!dragging)return;
    dragging=false;wakeAt=performance.now()+150;sync();
  };
  window.addEventListener('pointerup',release,{passive:true});
  window.addEventListener('pointercancel',release,{passive:true});
  window.addEventListener('blur',release);
  viewport.addEventListener('wheel',event=>{
    if(Math.abs(event.deltaX)<=Math.abs(event.deltaY)&&!event.shiftKey)return;
    wakeAt=performance.now()+150;
  },{passive:true});
  viewport.addEventListener('keydown',event=>{
    if(['ArrowLeft','ArrowRight','Home','End','PageUp','PageDown'].includes(event.key))wakeAt=performance.now()+150;
  });
  let scrollFrame=0;
  viewport.addEventListener('scroll',()=>{
    if(scrollFrame||(!dragging&&performance.now()>=wakeAt))return;
    scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;normalize()});
  },{passive:true});
  document.addEventListener('visibilitychange',sync);
  reduced.addEventListener('change',sync);
  let measuredWidth=0,resizeTimer;
  new ResizeObserver(([entry])=>{
    const width=entry.contentRect.width;
    if(Math.abs(width-measuredWidth)<.5)return;
    measuredWidth=width;clearTimeout(resizeTimer);
    resizeTimer=setTimeout(()=>{measure();sync()},180);
  }).observe(viewport);
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();}).observe(viewport);
  measure();
})();
