(() => {
  const callbacks=new Set();let frame=0,running=false;
  const run=time=>{
    frame=0;if(document.hidden)return;
    running=true;
    for(const callback of callbacks){
      try{callback(time)}catch(error){callbacks.delete(callback);console.error('Motion callback failed',error)}
    }
    running=false;
    if(callbacks.size&&!frame)frame=requestAnimationFrame(run);
  };
  const wake=()=>{if(!running&&!frame&&!document.hidden&&callbacks.size)frame=requestAnimationFrame(run)};
  window.SiteClock={subscribe(callback){callbacks.add(callback);wake();return()=>{callbacks.delete(callback);if(!callbacks.size){cancelAnimationFrame(frame);frame=0}}}};
  document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(frame);frame=0;wake()});
})();
