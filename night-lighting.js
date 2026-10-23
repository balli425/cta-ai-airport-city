import * as T from './vendor/three.module.js';

export function createNightLighting(scene, mobile=false) {
  const group=new T.Group();group.name='city-night-lighting';scene.add(group);
  const windows=[],beacons=[],points=[];
  const windowMaterial=new T.MeshBasicMaterial({color:0xffd994,transparent:true,opacity:0,toneMapped:false});
  const beaconMaterial=new T.MeshBasicMaterial({color:0xffeac0,toneMapped:false});
  const glowCanvas=document.createElement('canvas');glowCanvas.width=128;glowCanvas.height=128;
  const ctx=glowCanvas.getContext('2d'),gradient=ctx.createRadialGradient(64,64,0,64,64,64);
  gradient.addColorStop(0,'rgba(255,213,135,0.7)');gradient.addColorStop(.4,'rgba(255,203,112,0.32)');gradient.addColorStop(1,'rgba(255,194,91,0)');
  ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
  const texture=new T.CanvasTexture(glowCanvas);texture.colorSpace=T.SRGBColorSpace;
  const poolMaterial=new T.MeshBasicMaterial({map:texture,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false});
  function window(x,y,z,w,h,rotation=0){
    const object=new T.Object3D();object.position.set(x,y,z);object.rotation.y=rotation;object.scale.set(w,h,.025);object.updateMatrix();windows.push(object.matrix.clone());
  }
  function pool(x,z,r=1.2,y=.56){
    const mesh=new T.Mesh(new T.PlaneGeometry(r*2,r*2),poolMaterial);mesh.rotation.x=-Math.PI/2;mesh.position.set(x,y,z);group.add(mesh);
  }
  function beacon(x,y,z,r=.055){
    const mesh=new T.Mesh(new T.SphereGeometry(r,8,6),beaconMaterial);mesh.position.set(x,y,z);group.add(mesh);beacons.push(mesh);
  }
  function point(x,y,z,power=24,distance=8){
    if(mobile&&points.length>=3)return;
    const light=new T.PointLight(0xffd58d,0,distance,2);light.position.set(x,y,z);light.userData.nightPower=power;scene.add(light);points.push(light);
  }
  function finish(){
    const mesh=new T.InstancedMesh(new T.BoxGeometry(1,1,1),windowMaterial,windows.length);mesh.name='warm-lit-windows';
    windows.forEach((matrix,i)=>mesh.setMatrixAt(i,matrix));mesh.computeBoundingSphere();group.add(mesh);
  }
  function update(blend){
    group.visible=blend>.005;windowMaterial.opacity=blend*.94;poolMaterial.opacity=blend*.95;
    points.forEach(light=>light.intensity=light.userData.nightPower*blend);
  }
  update(0);
  return {window,pool,beacon,point,finish,update};
}
