(() => {
  const callbacks=new Set();let frame=0;
  const run=time=>{
    frame=0;if(document.hidden)return;
    for(const callback of callbacks){
      try{callback(time)}catch(error){callbacks.delete(callback);console.error('Motion callback failed',error)}
    }
    if(callbacks.size)frame=requestAnimationFrame(run);
  };
  const wake=()=>{if(!frame&&!document.hidden&&callbacks.size)frame=requestAnimationFrame(run)};
  window.SiteClock={subscribe(callback){callbacks.add(callback);wake();return()=>{callbacks.delete(callback);if(!callbacks.size){cancelAnimationFrame(frame);frame=0}}}};
  document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(frame);frame=0;wake()});
})();
