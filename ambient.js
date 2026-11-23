(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width: 760px), (pointer: coarse)').matches;
  function animateSurface(scene, sourceWidth, regions) {
    const image = scene.querySelector('img');
    const canvas = scene.querySelector('canvas');
    {
      const width = canvas.width;
      const height = canvas.height;
      canvas.style.aspectRatio = width + ' / ' + height;
      canvas.width = Math.round(width * (compact ? .55 : .82));
      canvas.height = Math.round(height * (compact ? .55 : .82));
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    const scale = W / sourceWidth;
    const patches = regions.map(({x,y,w,h,kind}) => {
      const layer = document.createElement('canvas');
      layer.width = Math.round(w * scale);
      layer.height = Math.round(h * scale);
      const paint = layer.getContext('2d');
      const mask = document.createElement('canvas');
      mask.width = layer.width;
      mask.height = layer.height;
      const alpha = mask.getContext('2d');
      const vertical = alpha.createLinearGradient(0,0,0,layer.height);
      vertical.addColorStop(0, kind !== 'sea' ? '#fff' : '#fff0');
      vertical.addColorStop(kind !== 'sea' ? .43 : .19,'#fff');
      vertical.addColorStop(.76,'#fff');
      vertical.addColorStop(1,'#fff0');
      alpha.fillStyle = vertical;
      alpha.fillRect(0,0,layer.width,layer.height);
      const horizontal = alpha.createLinearGradient(0,0,layer.width,0);
      horizontal.addColorStop(0, x === 0 ? '#fff' : '#fff0');
      horizontal.addColorStop(.12,'#fff');
      horizontal.addColorStop(.83,'#fff');
      horizontal.addColorStop(1,kind !== 'sea' ? '#fff' : '#fff0');
      alpha.globalCompositeOperation = 'destination-in';
      alpha.fillStyle = horizontal;
      alpha.fillRect(0,0,layer.width,layer.height);
      return {x,y,w,h,kind,layer,paint,mask};
    });

    let captured=false,capturing=false,captureFailed=false;
    async function capture(){
      if(!image.naturalWidth||capturing)return;
      capturing=true;
      try {
      const bitmap=await createImageBitmap(image);
      const ratio=bitmap.width/sourceWidth;
      for(const patch of patches){
        const source=document.createElement('canvas');
        source.width=patch.layer.width+24;source.height=patch.layer.height+24;
        source.getContext('2d').drawImage(bitmap,(patch.x-12/scale)*ratio,(patch.y-12/scale)*ratio,(patch.w+24/scale)*ratio,(patch.h+24/scale)*ratio,0,0,source.width,source.height);
        patch.source=source;
      }
      bitmap.close();captured=true;capturing=false;sync();
      } catch {capturing=false;captureFailed=true;sync();}
    }
    function draw(time) {
      if(!captured)return;
      ctx.clearRect(0,0,W,H);
      const ratio=image.naturalWidth/sourceWidth;
      for (const patch of patches) {
        const {x,y,w,h,layer,paint,mask,kind} = patch;
        paint.globalCompositeOperation = 'source-over';
        paint.clearRect(0,0,layer.width,layer.height);
        const rowHeight = compact ? 8 : 6;
        for (let row=0;row<layer.height;row+=rowHeight) {
          const depth = row/layer.height;
          const palm = kind !== 'sea';
          const garden = kind === 'garden';
          const dx = palm
            ? (Math.sin(time*.68-depth*1.65)*4.8 + Math.sin(time*1.12-depth*.73)*1.8) * (garden ? (.55+depth*.45)*4.1 : depth*depth)
            : Math.sin(time*1.3-depth*14)*6 + Math.sin(time*2.8+depth*7)*3;
          const dy = palm
            ? Math.sin(time*.71-depth*.64)*(garden ? 6.2 : 1.35)*depth
            : Math.sin(time*2.1-depth*18)*5.8*(.3+depth);
          const sourceX = Math.min(sourceWidth-w,Math.max(0,x+dx));
          const sourceY = Math.max(0,y+row/scale+dy);
          const count = Math.min(rowHeight,layer.height-row);
          paint.drawImage(patch.source,12+(sourceX-x)*scale,12+row+dy*scale,layer.width,count,0,row,layer.width,count);
        }
        paint.globalCompositeOperation = 'destination-in';
        paint.drawImage(mask,0,0);
        ctx.drawImage(layer,Math.round(x*scale),Math.round(y*scale));
      }
    }

    let visible = false;
    let unsubscribe;
    let last = -100;
    let seconds = 0;
    function tick(now) {
      if (!visible || motion.matches || document.hidden) return;
      if (now-last >= (compact ? 32 : 16)) {
        seconds += Math.min(now-last,80)/1000;
        last = now;
        draw(seconds);
      }

    }
    function sync() {
      unsubscribe?.();unsubscribe=null;
      scene.classList.toggle('in-view',visible && !document.hidden && !motion.matches);
      if (motion.matches) ctx.clearRect(0,0,W,H);
      if (visible && !motion.matches && !document.hidden && image.naturalWidth && !captureFailed) {
        if(!captured)capture();
        last = performance.now()-45;
        unsubscribe=window.SiteClock.subscribe(tick);
      }
    }
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        sync();
      });
      observer.observe(scene);
    }
    image.addEventListener('load',()=>{capture();sync()});
    motion.addEventListener('change',sync);
    document.addEventListener('visibilitychange',sync);
    sync();
  }

  const ns = 'http://www.w3.org/2000/svg';
  function svgElement(tag, attributes) {
    const element = document.createElementNS(ns,tag);
    for (const [name,value] of Object.entries(attributes)) element.setAttribute(name,value);
    return element;
  }
  function animateParticle(element, index, duration, distance) {
    element.style.setProperty('--cycle',duration+'s');
    element.style.setProperty('--phase',-(index*.79)+'s');
    element.style.setProperty('--distance',distance+'px');
  }
  function addBottleEffects(container, x, y, halfWidth, tint, lowerY = y + 555) {
    const product=container.classList.contains('flavor-effects');
    for (let i=0;i<(compact ? 4 : product ? 5 : 9);i++) {
      const side = i%2 ? 1 : -1;
      const px = x + side * (halfWidth - 8 - i%4*6);
      const py = y + 8 + (i*29)%103;
      const drop = svgElement('g',{'class':'condensation'});
      drop.append(
        svgElement('path',{d:`M${px} ${py-20} Q${px+2} ${py-10} ${px} ${py}`,fill:'none',stroke:'#eefaff','stroke-opacity':'.25','stroke-width':'.7'}),
        svgElement('ellipse',{cx:px,cy:py,rx:1.5+i%3*.5,ry:2.7+i%4*.6,fill:container.classList.contains('flavor-effects') ? '#e8f7ff99' : 'url(#condensation)'}),
        svgElement('circle',{cx:px-.55,cy:py-1,r:'.68',fill:'#fff','fill-opacity':'.74'})
      );
      animateParticle(drop,i,3.2+i%4*.72,31+i%4*9);
      container.append(drop);
    }
    for (let i=0;i<(compact ? 10 : product ? 14 : 24);i++) {
      const shoulder = i < (product ? 9 : 16);
      const px = x + (i*37)%(halfWidth*2-50)-halfWidth+25;
      const py = shoulder ? y + 88 + i%4*8 : lowerY + i%5*9;
      const bubble = svgElement('circle',{
        class:'bottle-fizz',cx:px,cy:py,r:.8+i%5*.38,fill:'none',stroke:tint,'stroke-width':'.95'
      });
      animateParticle(bubble,i,1.8+i%6*.39,-(shoulder ? 41+i%4*8 : 20+i%5*5));
      container.append(bubble);
    }
  }
  const flavors = document.querySelector('#cold-flavors');
  addBottleEffects(flavors,708,240,100,'#fff1ac');
  addBottleEffects(flavors,1173,244,104,'#ffd6d1');
  addBottleEffects(document.querySelector('#cold-artesanal'),0,84,121,'#c2eaff');


  function addFizz(container, x, y, width, count, tint, maxRise) {
    for (let i=0;i<(compact ? Math.ceil(count*.5) : count);i++) {
      const cx=x+(i*37)%width;
      const cy=y+(i*19)%44;
      const bubble=svgElement('circle',{
        class:'bottle-fizz',cx,cy,r:1+i%5*.52,fill:'none',stroke:tint,'stroke-width':'.92'
      });
      animateParticle(bubble,i,2.1+i%7*.32,-(maxRise*.45+i%7*maxRise*.091));
      container.append(bubble);
    }
  }

  const hero = document.querySelector('.hero-art');
  animateSurface(hero,1536,[
    {x:0,y:360,w:590,h:167,kind:'sea'},
    {x:825,y:368,w:223,h:134,kind:'sea'},
    {x:745,y:0,w:773,h:120,kind:'palm'},
    {x:785,y:120,w:310,h:76,kind:'palm'},
    {x:1240,y:120,w:278,h:100,kind:'palm'}
  ]);
  addFizz(document.querySelector('#glass-fizz'),1328,606,149,36,'#d1eeff',115);

  const about = document.querySelector('.about-scene');
  animateSurface(about,1440,[
    {x:1080,y:0,w:329,h:348,kind:'garden'},
    {x:1080,y:349,w:325,h:91,kind:'garden'}
  ]);
  const jars = about.querySelector('.about-fizz');
  addFizz(jars,456,735,355,25,'#ffd48e',138);
  addFizz(jars,915,748,165,13,'#ffd48e',105);
  addFizz(jars,1135,725,160,13,'#ffd48e',91);

})();
