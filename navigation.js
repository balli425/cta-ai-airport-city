import * as T from './vendor/three.module.js';

export function moveFlight(camera, keys, delta, yaw) {
  const forward=Number(keys.has('KeyW'))-Number(keys.has('KeyS'));
  const side=Number(keys.has('KeyD'))-Number(keys.has('KeyA'));
  const rise=Number(keys.has('KeyE'))-Number(keys.has('KeyQ'));
  const length=Math.hypot(forward,side,rise)||1;
  const distance=Math.max(0,Math.min(delta,.05))*(keys.has('ShiftLeft')||keys.has('ShiftRight')?7:3.5)/length;
  camera.position.x+=(Math.cos(yaw)*side-Math.sin(yaw)*forward)*distance;
  camera.position.z+=(-Math.sin(yaw)*side-Math.cos(yaw)*forward)*distance;
  camera.position.y=T.MathUtils.clamp(camera.position.y+rise*distance,1.3,18);
  camera.position.x=T.MathUtils.clamp(camera.position.x,-18,18);
  camera.position.z=T.MathUtils.clamp(camera.position.z,-17,17);
}

export function createFlightNavigation(canvas,onExit) {
  const camera=new T.PerspectiveCamera(58,1,.1,180),keys=new Set();
  let active=false,yaw=0,pitch=-.16,previous=null;
  const look=()=>{camera.rotation.set(pitch,yaw,0,'YXZ');};
  canvas.tabIndex=0;
  function stopKeys(){keys.clear();previous=null;}
  window.addEventListener('blur',stopKeys);
  canvas.addEventListener('blur',stopKeys);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopKeys();});
  canvas.addEventListener('keydown',event=>{
    if(!active||document.querySelector('dialog[open]'))return;
    if(event.code==='Escape'){event.preventDefault();onExit();return;}
    if(['KeyW','KeyA','KeyS','KeyD','KeyQ','KeyE','ShiftLeft','ShiftRight'].includes(event.code)){
      event.preventDefault();keys.add(event.code);
    }
  });
  canvas.addEventListener('keyup',event=>keys.delete(event.code));
  canvas.addEventListener('pointerdown',event=>{if(active){canvas.focus({preventScroll:true});previous={x:event.clientX,y:event.clientY};}});
  canvas.addEventListener('pointermove',event=>{
    if(!active||!(event.buttons&1)||!previous)return;
    yaw-=(event.clientX-previous.x)*.004;
    pitch=T.MathUtils.clamp(pitch-(event.clientY-previous.y)*.004,-1.15,1.15);
    previous={x:event.clientX,y:event.clientY};look();
  });
  canvas.addEventListener('pointerup',()=>previous=null);
  canvas.addEventListener('pointercancel',stopKeys);
  return {camera,update(delta){if(active&&!document.querySelector('dialog[open]'))moveFlight(camera,keys,delta,yaw);},
    setActive(value){active=value;stopKeys();if(active){camera.position.set(0,3.8,10);yaw=0;pitch=-.16;look();canvas.focus({preventScroll:true});}},
    get active(){return active;}};
}
