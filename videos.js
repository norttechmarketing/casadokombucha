(() => {
  let api,playing;
  function loadApi(){
    if(window.YT?.Player)return Promise.resolve(window.YT);
    if(api)return api;
    api=new Promise((resolve,reject)=>{
      const previous=window.onYouTubeIframeAPIReady,script=document.createElement('script');
      const fail=()=>{clearTimeout(timer);script.remove();if(window.onYouTubeIframeAPIReady===ready)window.onYouTubeIframeAPIReady=previous;reject(new Error('Player indisponível'))};
      const ready=()=>{clearTimeout(timer);previous?.();resolve(window.YT)};
      const timer=setTimeout(fail,12000);
      window.onYouTubeIframeAPIReady=ready;script.src='https://www.youtube.com/iframe_api';script.async=true;script.onerror=fail;document.head.append(script);
    }).catch(error=>{api=undefined;throw error});
    return api;
  }
  const videos=[];
  for(const card of document.querySelectorAll('[data-video]')){
    const open=card.querySelector('.video-open'),controls=card.querySelector('.video-controls'),play=controls.querySelector('[data-play]'),mute=controls.querySelector('[data-mute]'),status=card.querySelector('.video-status');
    let frame=card.querySelector('iframe'),player,visible=false,attempt=0;
    const template=frame.cloneNode(false);
    const pause=()=>player?.pauseVideo?.();
    const button=(element,label,pressed)=>{element.setAttribute('aria-label',label);element.title=label;element.setAttribute('aria-pressed',String(pressed))};
    function recover(message){
      attempt++;
      if(playing===player)playing=undefined;
      player?.destroy?.();player=undefined;
      if(!frame.isConnected){frame=template.cloneNode(false);card.insertBefore(frame,controls)}
      frame.removeAttribute('src');frame.hidden=true;controls.hidden=true;open.hidden=false;open.disabled=false;status.textContent=message;
    }
    new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(!visible)pause()}).observe(card);
    videos.push({pause});
    open.addEventListener('click',async()=>{
      const id=++attempt;open.disabled=true;status.textContent='Carregando vídeo…';
      try{
        const yt=await loadApi();if(id!==attempt)return;
        const params=new URLSearchParams({enablejsapi:'1',controls:'0',playsinline:'1',rel:'0',autoplay:'1',mute:'0',origin:location.origin});
        frame.src='https://www.youtube-nocookie.com/embed/'+card.dataset.video+'?'+params;open.hidden=true;frame.hidden=false;
        player=new yt.Player(frame,{events:{
          onReady:({target})=>{if(id!==attempt)return;status.textContent='';controls.hidden=false;target.unMute();button(mute,'Silenciar',false);if(visible&&!document.hidden){target.playVideo();play.focus({preventScroll:true})}else target.pauseVideo()},
          onStateChange:({target,data})=>{if(id!==attempt)return;const active=data===yt.PlayerState.PLAYING;if(active&&(!visible||document.hidden)){target.pauseVideo();return}button(play,active?'Pausar':'Reproduzir',active);if(active&&playing!==target){playing?.pauseVideo?.();playing=target}},
          onError:()=>{if(id===attempt)recover('Vídeo indisponível. Toque na capa para tentar novamente.')}
        }});
      }catch{if(id===attempt)recover('Não foi possível carregar o vídeo. Toque na capa para tentar novamente.')}
    });
    play.addEventListener('click',()=>{if(!player?.getPlayerState)return;player.getPlayerState()===window.YT.PlayerState.PLAYING?player.pauseVideo():player.playVideo()});
    mute.addEventListener('click',()=>{if(!player?.isMuted)return;const muted=!player.isMuted();muted?player.mute():player.unMute();button(mute,muted?'Ativar som':'Silenciar',muted)});
  }
  document.addEventListener('visibilitychange',()=>{if(document.hidden)videos.forEach(video=>video.pause())});
})();
