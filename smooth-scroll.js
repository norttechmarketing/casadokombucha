(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const touch=matchMedia('(pointer: coarse)');
  let frame=0;
  function setup(){
    cancelAnimationFrame(frame);
    window.lenis?.destroy();window.lenis=null;
    if(reduced.matches||touch.matches||!window.Lenis)return;
    const lenis=window.lenis=new Lenis({duration:1.2,lerp:0,smoothWheel:true,syncTouch:false,autoResize:false,
      virtualScroll:({event})=>!event.shiftKey&&Math.abs(event.deltaY)>=Math.abs(event.deltaX),
      prevent:node=>node.matches?.('[data-lenis-prevent]')});
    const tick=time=>{if(document.hidden)return;lenis.raf(time);frame=requestAnimationFrame(tick)};
    frame=requestAnimationFrame(tick);
  }
  let timer;
  const resize=()=>{clearTimeout(timer);timer=setTimeout(()=>window.lenis?.resize(),180)};
  window.addEventListener('resize',resize,{passive:true});
  window.addEventListener('load',resize,{once:true});
  document.fonts?.ready.then(resize);
  document.querySelectorAll('img').forEach(img=>img.addEventListener('load',resize,{once:true}));
  document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(frame);if(!document.hidden&&window.lenis){const tick=time=>{if(document.hidden)return;window.lenis?.raf(time);frame=requestAnimationFrame(tick)};frame=requestAnimationFrame(tick)}});
  reduced.addEventListener('change',setup);touch.addEventListener('change',setup);
  document.addEventListener('site:menu',event=>event.detail?.open?window.lenis?.stop():window.lenis?.start());
  setup();
})();
