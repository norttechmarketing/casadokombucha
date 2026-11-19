(() => {
  let api;
  function loadApi() {
    if (!api) {
      api = new Promise((resolve,reject) => {
        const previous = window.onYouTubeIframeAPIReady;
        const script = document.createElement('script');
        const timer = setTimeout(() => reject(new Error('Tempo de carregamento esgotado')),12000);
        window.onYouTubeIframeAPIReady = () => {
          clearTimeout(timer);
          previous?.();
          resolve(window.YT);
        };
        script.src = 'https://www.youtube.com/iframe_api';
        script.onerror = () => { clearTimeout(timer); reject(new Error('Player indisponível')); };
        document.head.append(script);
      }).catch(error => { api = undefined; throw error; });
    }
    return api;
  }

  let playing;
  for (const card of document.querySelectorAll('[data-video]')) {
    const open = card.querySelector('.video-open');
    const frame = card.querySelector('iframe');
    const controls = card.querySelector('.video-controls');
    const play = controls.querySelector('[data-play]');
    const mute = controls.querySelector('[data-mute]');
    const status = card.querySelector('.video-status');
    let player;
    const pause=()=>{if(player?.pauseVideo)player.pauseVideo()};
    const observer=new IntersectionObserver(([entry])=>{if(!entry.isIntersecting)pause()});
    observer.observe(card);
    document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});
    function setButton(button,label,pressed) {
      button.setAttribute('aria-label',label);
      button.title=label;
      button.setAttribute('aria-pressed',String(pressed));
    }
    open.addEventListener('click',async () => {
      open.disabled=true;
      status.textContent='Carregando vídeo…';
      const params=new URLSearchParams({enablejsapi:'1',controls:'0',playsinline:'1',rel:'0',autoplay:'1',mute:'0',origin:location.origin});
      try {
        frame.src='https://www.youtube-nocookie.com/embed/'+card.dataset.video+'?'+params;
        open.hidden=true;
        frame.hidden=false;
        const yt=await loadApi();
        player=new yt.Player(frame,{
          events:{
            onReady:({target})=>{
              status.textContent='';
              controls.hidden=false;
              target.unMute();
              setButton(mute,'Silenciar',false);
              target.playVideo();
              play.focus({preventScroll:true});
            },
            onStateChange:({target,data})=>{
              const active=data===yt.PlayerState.PLAYING;
              setButton(play,active?'Pausar':'Reproduzir',active);
              if (active && playing!==target) {
                playing?.pauseVideo();
                playing=target;
              }
            },
            onError:()=>{
              status.textContent='Vídeo indisponível para reprodução nesta página.';
              controls.hidden=true;
            }
          }
        });
      } catch {
        status.textContent='Não foi possível carregar o vídeo. Tente novamente.';
        frame.removeAttribute('src');
        frame.hidden=true;
        open.hidden=false;
        open.disabled=false;
      }
    });
    play.addEventListener('click',()=>{
      if (player.getPlayerState()===window.YT.PlayerState.PLAYING) player.pauseVideo();
      else player.playVideo();
    });
    mute.addEventListener('click',()=>{
      const muted=!player.isMuted();
      if (muted) player.mute();
      else player.unMute();
      setButton(mute,muted?'Ativar som':'Silenciar',muted);
    });
  }
})();
