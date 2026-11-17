const compactMotion = matchMedia('(max-width: 760px), (pointer: coarse)');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const waves = [...document.querySelectorAll('.section-wave')];
const watched = [...document.querySelectorAll('.reveal, .section-wave')];
const clamp = (value, low = 0, high = 1) => Math.min(high, Math.max(low, value));
const smooth = (value) => {
  const n = clamp(value);
  return n * n * n * (n * (n * 6 - 15) + 10);
};

const why = document.querySelector('.why');
const whyFizz = why.querySelector('.why-fizz');
const products = document.querySelectorAll('.flavor-photo');

const hero = document.querySelector('.hero');
const heroIntro = hero.querySelector('.hero-intro');
if (!reduced.matches && hero.getBoundingClientRect().bottom > 0) {
  const bubbles = document.createDocumentFragment();
  for (let i=0;i<(compactMotion.matches ? 64 : 156);i++) {
    const bubble = document.createElement('span');
    bubble.style.setProperty('--x', (Math.random()*100).toFixed(2)+'%');
    bubble.style.setProperty('--size', (7+Math.random()**1.6*65).toFixed(1)+'px');
    bubble.style.setProperty('--wait', (-.95+Math.random()*1.77).toFixed(2)+'s');
    bubble.style.setProperty('--speed', (1.48+Math.random()*.68).toFixed(2)+'s');
    bubble.style.setProperty('--drift', (Math.random()*102-51).toFixed(1)+'px');
    bubbles.append(bubble);
  }
  heroIntro.append(bubbles);
  hero.classList.add('is-introducing');
  const finishIntro = () => {
    hero.classList.remove('is-introducing');
    heroIntro.replaceChildren();
  };
  hero.addEventListener('focusin',finishIntro,{once:true});
  setTimeout(finishIntro,compactMotion.matches ? 1750 : 2850);
}

for (const photo of products) {
  let touch = null;
  function reset() {
    touch = null;
    for (const name of ['--bottle-x','--bottle-y','--bottle-turn']) photo.style.removeProperty(name);
  }
  function follow(event) {
    if (reduced.matches || (event.pointerType !== 'mouse' && touch !== event.pointerId)) return;
    const bounds = photo.getBoundingClientRect();
    const x = clamp((event.clientX-bounds.left)/bounds.width*2-1,-1,1);
    const y = clamp((event.clientY-bounds.top)/bounds.height*2-1,-1,1);
    const distance = event.pointerType === 'mouse' ? 8 : 5;
    photo.style.setProperty('--bottle-x', (x*distance).toFixed(2)+'px');
    photo.style.setProperty('--bottle-y', (y*distance*.65).toFixed(2)+'px');
    photo.style.setProperty('--bottle-turn', (x*1.15).toFixed(2)+'deg');
  }
  photo.addEventListener('pointerdown',(event) => {
    if (event.pointerType !== 'mouse') touch=event.pointerId;
    follow(event);
  },{passive:true});
  photo.addEventListener('pointermove',follow,{passive:true});
  for (const event of ['pointerleave','pointerup','pointercancel']) photo.addEventListener(event,reset);
  reduced.addEventListener('change',reset);
}

function fizzWhy() {
  if (reduced.matches) return;
  const burstCount = compactMotion.matches ? 32 : 64;
  const steadyCount = compactMotion.matches ? 24 : 36;
  const bubbles = document.createDocumentFragment();
  for (let i=0;i<burstCount+steadyCount;i++) {
    const bubble = document.createElement('span');
    const steady = i >= burstCount;
    bubble.className = steady ? 'why-steady' : 'why-burst';
    bubble.style.setProperty('--x', (2+(i*37)%96)+'%');
    bubble.style.setProperty('--y', (12+(i*23)%92)+'%');
    bubble.style.setProperty('--size', (5+i%11*2)+'px');
    bubble.style.setProperty('--wait', (steady ? -(i%15)*.3 : (i%11)*.076)+'s');
    bubble.style.setProperty('--float', (70+i%13*12)+'px');
    bubble.style.setProperty('--cycle', (3.7+i%9*.27)+'s');
    bubbles.append(bubble);
  }
  whyFizz.append(bubbles);
  whyFizz.classList.add('is-fizzing');
  setTimeout(() => whyFizz.querySelectorAll('.why-burst').forEach(bubble=>bubble.remove()),2900);
}

if ('IntersectionObserver' in window) {
  document.documentElement.classList.add('motion');
  const reveal = new IntersectionObserver((entries) => {
    for (const {isIntersecting, target} of entries) {
      if (!isIntersecting) continue;
      target.classList.add('is-visible');
      reveal.unobserve(target);
    }
  }, {threshold: .12});
  watched.forEach((element) => reveal.observe(element));
  let didFizz = false;
  const sceneObserver = new IntersectionObserver(entries => {
    for (const {target,isIntersecting} of entries) {
      target.classList.toggle('in-view',isIntersecting);
      if (target === why && isIntersecting && !didFizz && !reduced.matches) {
        didFizz = true;
        fizzWhy();
      }
    }
  });
  document.querySelectorAll('.why,.service-strip,.contact,.site-footer').forEach(scene => sceneObserver.observe(scene));
}

let queued = false;
function paintScroll() {
  queued = false;
  if (reduced.matches) {
    return;
  }
  for (const wave of waves) {
    const {top, height} = wave.getBoundingClientRect();
    if (top > innerHeight + 30 || top + height < -30) continue;
    const p = smooth((innerHeight - top) / (innerHeight * .6));
    wave.style.setProperty('--crest', (.26 + p * .74).toFixed(3));
    wave.style.setProperty('--wave-x', ((1 - p) * 7).toFixed(2) + '%');
  }
}
function queueScroll() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(paintScroll);
}
window.addEventListener('scroll', queueScroll, {passive:true});
window.addEventListener('resize', queueScroll);
reduced.addEventListener('change', queueScroll);
queueScroll();

const attribution = new URLSearchParams(location.search);
document.querySelectorAll('[data-whatsapp]').forEach((link) => {
  link.addEventListener('click', () => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'whatsapp_click',
      cta_location: link.dataset.whatsapp,
      campaign_source: attribution.get('utm_source') || undefined,
      campaign_name: attribution.get('utm_campaign') || undefined
    });
  });
});
