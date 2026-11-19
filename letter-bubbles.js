(() => {
  const host=document.querySelector('.fizz-letters');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  if(!host)return;
  const ns='http://www.w3.org/2000/svg',label=host.textContent;
  const make=(tag,attrs)=>{const e=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);return e};
  function render(){
    host.querySelector('svg')?.remove();
    if(reduced.matches)return;
    const marker=document.createElement('span');marker.style.cssText='display:inline-block;width:0;height:0';host.append(marker);
    const rect=host.getBoundingClientRect(),baseline=marker.getBoundingClientRect().top-rect.top;marker.remove();
    const svg=make('svg',{'class':'letter-fizz-art',viewBox:`0 0 ${rect.width} ${rect.height}`,'aria-hidden':'true'});
    const defs=make('defs',{}),clip=make('clipPath',{id:'letter-bubble-clip'}),text=make('text',{x:0,y:baseline});text.textContent=label;clip.append(text);defs.append(clip);svg.append(defs);
    const group=make('g',{'clip-path':'url(#letter-bubble-clip)'});
    for(let i=0;i<12;i++){const circle=make('circle',{cx:(i*37)%rect.width,cy:rect.height+5,r:1.2+i%3*.6,fill:'none',stroke:'#eeffdc','stroke-width':1,'class':'letter-bubble'});circle.style.cssText=`--rise:${-rect.height-12}px;--phase:${-i*.37}s;--duration:${2.6+i%4*.3}s`;group.append(circle)}
    svg.append(group);host.append(svg);
  }
  let timer;
  const queue=()=>{clearTimeout(timer);timer=setTimeout(render,180)};
  document.fonts.ready.then(render);window.addEventListener('resize',queue,{passive:true});reduced.addEventListener('change',render);
})();
