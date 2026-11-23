(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const compact=matchMedia('(max-width:760px), (pointer:coarse)').matches;
  const masks=new Map(),states=new Set();
  const W=224,H=329,scale=W/672;
  function alphaFor(image){
    const key=image.currentSrc||image.src;
    if(masks.has(key))return masks.get(key);
    const mask=document.createElement('canvas');mask.width=W;mask.height=H;
    const context=mask.getContext('2d');if(!context)return null;
    context.drawImage(image,0,0,W,H);masks.set(key,mask);return mask;
  }
  function prepare(state){
    if(state.ready||!state.image.complete||!state.image.naturalWidth)return;
    state.mask=alphaFor(state.image);
    if(!state.mask)return;
    state.bubbles=Array.from({length:compact?10:14},(_,i)=>({x:337+(i*37)%210-105,y:i<9?181+88+i%4*8:837+i%5*9,r:.8+i%5*.38,period:1.8+i%6*.39,phase:i*.79,rise:i<9?41+i%4*8:20+i%5*5}));
    state.drops=Array.from({length:compact?4:5},(_,i)=>({x:337+(i%2?1:-1)*(122-i%4*6),y:189+(i*29)%103,r:1.5+i%3*.5,period:3.2+i%4*.72,phase:i*.79,rise:31+i%4*9}));
    state.ready=true;
  }
  function draw(state,now){
    if(now-state.last<16)return;state.last=now;
    const ctx=state.ctx,t=now/1000;
    ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,H);ctx.scale(scale,scale);ctx.strokeStyle='#e9f4ff';ctx.lineWidth=.95;
    for(const p of state.bubbles){const u=((t+p.phase)%p.period)/p.period;ctx.globalAlpha=u<.2?u/.2*.58:u<.83?.58-(u-.2)/.63*.26:(1-u)/.17*.32;ctx.beginPath();ctx.arc(p.x+3*u,p.y-p.rise*u,p.r,0,Math.PI*2);ctx.stroke();}
    ctx.fillStyle='#e8f7ff';
    for(const p of state.drops){const u=((t+p.phase)%p.period)/p.period;ctx.globalAlpha=u<.13?u/.13*.84:u>.87?(1-u)/.13*.77:.8;ctx.beginPath();ctx.ellipse(p.x+Math.sin(u*6)*1.5,p.y+p.rise*u,p.r,3.2,0,0,Math.PI*2);ctx.fill();}
    ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='destination-in';ctx.drawImage(state.mask,0,0);ctx.globalCompositeOperation='source-over';
  }
  function sync(state){
    state.unsubscribe?.();state.unsubscribe=null;
    if(!state.visible||document.hidden||reduced.matches){if(state.canvas.width){state.canvas.width=0;state.canvas.height=0;state.ctx=null;}return;}
    prepare(state);if(!state.ready)return;
    if(!state.canvas.width){state.canvas.width=W;state.canvas.height=H;}
    state.ctx=state.canvas.getContext('2d');if(!state.ctx)return;state.last=0;
    state.unsubscribe=window.SiteClock.subscribe(now=>draw(state,now));
  }
  const observer=new IntersectionObserver(entries=>{for(const entry of entries){const state=entry.target._productFizz;state.visible=entry.isIntersecting;sync(state)}});
  document.querySelectorAll('.flavor-photo').forEach(photo=>{
    const old=photo.querySelector('.flavor-effects');if(!old)return;
    const canvas=document.createElement('canvas');canvas.className='flavor-effects product-fizz-canvas';canvas.width=0;canvas.height=0;canvas.setAttribute('aria-hidden','true');old.replaceWith(canvas);
    const image=photo.querySelector('.flavor-bottle > img:not(.flavor-ingredients)');
    const state={canvas,image,visible:false,ready:false,last:0};states.add(state);photo._productFizz=state;
    image.addEventListener('load',()=>{state.ready=false;sync(state)});observer.observe(photo);
  });
  document.addEventListener('visibilitychange',()=>states.forEach(sync));reduced.addEventListener('change',()=>states.forEach(sync));
})();
