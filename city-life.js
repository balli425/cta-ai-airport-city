import * as T from './vendor/three.module.js';

// All motion uses the world's simulation time: pause and reduced motion apply together.
export function createCityLife(scene, palette) {
  const material = color => new T.MeshStandardMaterial({color, roughness:.7});
  const box = new T.BoxGeometry(1,1,1), ball = new T.SphereGeometry(.5,8,6);
  const matrix = new T.Matrix4();
  function loop(points) {
    const vectors=points.map(([x,z])=>new T.Vector3(x,0,z));
    const curve=new T.CatmullRomCurve3(vectors,true,'centripetal');
    return {curve,length:curve.getLength()};
  }
  // Front courts, waterfront and side streets; no route crosses the teaching rooms.
  const walkingRoutes=[
    loop([[-7.5,3.7],[-6.2,4.2],[-4.5,4.2],[-3.6,3.5],[-4.6,3.35],[-6.5,3.35]]),
    loop([[3.7,3.9],[5.2,4.4],[7.2,4.1],[7.5,3.5],[5.8,3.45],[4.2,3.45]]),
    loop([[-1.8,-3.15],[0,-2.7],[1.8,-3.15],[1.5,-3.5],[0,-3.3],[-1.5,-3.5]]),
    loop([[-6.8,5.35],[-3,5.35],[1.4,5.35],[5.4,5.35],[6.8,5.85],[2,5.85],[-3,5.85],[-6.8,5.85]]),
    loop([[-2.8,3.7],[-2.8,.25],[-3.1,-2.6],[-3.5,-2.5],[-3.25,.2],[-3.2,3.7]]),
    loop([[2.55,4.4],[2.55,.1],[2.55,-5.7],[2.25,-5.7],[2.15,0],[2.15,4.4]]),
    loop([[-9.8,-2],[-9.8,1],[-9.1,4.5],[-8.7,4.7],[-9.45,1],[-9.45,-2]])
  ];
  const count=70, shirts=[palette.blue,palette.coral,palette.gold,palette.green,0xf3eddb,0x384c62];
  const specs=[
    {name:'body',geometry:box,color:palette.blue},
    {name:'head',geometry:ball,color:0xe5be96},
    {name:'hair',geometry:ball,color:0x3b3a35},
    {name:'leftLeg',geometry:box,color:palette.dark},
    {name:'rightLeg',geometry:box,color:palette.dark},
    {name:'leftArm',geometry:box,color:0xe5be96},
    {name:'rightArm',geometry:box,color:0xe5be96}
  ];
  specs.forEach(spec=>{
    spec.mesh=new T.InstancedMesh(spec.geometry,material(spec.color),count);
    spec.mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);spec.mesh.castShadow=true;
    spec.mesh.frustumCulled=false;spec.mesh.name='city-pedestrians-'+spec.name;scene.add(spec.mesh);
    if(spec.name==='body')for(let i=0;i<count;i++)spec.mesh.setColorAt(i,new T.Color(shirts[i%shirts.length]));
  });
  const root=new T.Object3D(),limb=new T.Object3D();
  function stamp(spec,i,x,y,z,sx,sy,sz,rx=0){
    limb.position.set(x,y,z);limb.rotation.set(rx,0,0);limb.scale.set(sx,sy,sz);limb.updateMatrix();
    matrix.multiplyMatrices(root.matrix,limb.matrix);spec.mesh.setMatrixAt(i,matrix);
  }
  const carMat=[palette.blue,palette.coral,palette.gold,palette.white].map(material);
  const glass=material(0x173e59),rubber=material(0x24303a),white=material(palette.white);
  function mesh(parent,geometry,mat,x,y,z,sx,sy,sz){
    const item=new T.Mesh(geometry,mat);item.position.set(x,y,z);item.scale.set(sx,sy,sz);
    item.castShadow=true;parent.add(item);return item;
  }
  function avenue(x,z0,z1,lane){
    return loop([[x-lane,z0],[x-lane,z1-.5],[x,z1],[x+lane,z1-.5],[x+lane,z0+.5],[x,z0-.1]]);
  }
  const roads=[avenue(-7.8,-5.8,4.9,.23),avenue(3.25,-7.4,5.8,.19)];
  const cars=[];
  for(let i=0;i<10;i++){
    const group=new T.Group(),bus=i===3||i===8, length=bus?1.18:.77;
    group.name=bus?'city-shuttle':'city-car';
    mesh(group,box,carMat[i%4],0,.22,0,.38,.23,length);
    mesh(group,box,glass,0,bus?.43:.4,-.02,.32,bus?.25:.2,length*.6);
    mesh(group,box,carMat[i%4],0,bus?.58:.51,-.02,.35,.045,length*.63);
    for(const side of [-1,1])for(const end of [-1,1]){
      const wheel=mesh(group,new T.CylinderGeometry(.09,.09,.055,8),rubber,side*.2,.12,end*length*.31,1,1,1);wheel.rotation.z=Math.PI/2;
    }
    for(const side of [-1,1])mesh(group,box,white,side*.12,.23,length*.51,.075,.065,.025);
    scene.add(group);cars.push({group,route:roads[i%2],offset:Math.floor(i/2)/5,speed:.75+(i%3)*.08});
  }
  // Architectural helicopter: glazed cabin, tail boom, skids, main and tail rotors.
  const helicopter=new T.Group();helicopter.name='city-helicopter';
  const blue=material(palette.blue),red=material(palette.coral),gold=material(palette.gold);
  mesh(helicopter,ball,white,0,0,0,.85,.72,1.5);
  mesh(helicopter,ball,glass,0,.06,.49,.73,.6,.72);
  mesh(helicopter,box,blue,0,-.18,-.02,.81,.19,.94);
  mesh(helicopter,box,white,0,.08,-1.1,.14,.16,1.45);
  mesh(helicopter,box,red,0,.4,-1.67,.09,.65,.38);
  mesh(helicopter,box,gold,0,.08,-1.4,.86,.05,.25);
  for(const side of [-1,1]){
    mesh(helicopter,box,glass,side*.4,-.52,.02,.05,.055,1.4);
    for(const z of [-.4,.45]){const strut=mesh(helicopter,box,glass,side*.32,-.34,z,.045,.38,.045);strut.rotation.z=side*.4;}
  }
  mesh(helicopter,box,glass,0,.52,-.1,.07,.45,.07);
  const rotor=new T.Group();rotor.position.set(0,.76,-.1);helicopter.add(rotor);
  for(const angle of [0,Math.PI/2]){const blade=mesh(rotor,box,glass,0,0,0,3.35,.028,.095);blade.rotation.y=angle;}
  mesh(rotor,ball,gold,0,.01,0,.16,.09,.16);
  const tailRotor=new T.Group();tailRotor.position.set(.12,.3,-1.65);helicopter.add(tailRotor);
  mesh(tailRotor,box,glass,0,0,0,.025,.65,.055);mesh(tailRotor,box,glass,0,0,0,.025,.055,.65);
  scene.add(helicopter);
  function update(time){
    time=Math.max(0,Number.isFinite(time)?time:0);
    for(let i=0;i<count;i++){
      const route=walkingRoutes[i%walkingRoutes.length],u=(i*.61803398875+time*(.19+(i%4)*.025)/route.length)%1;
      const p=route.curve.getPointAt(u),t=route.curve.getTangentAt(u),stride=Math.sin(time*6.5+i)*.58;
      root.position.set(p.x,.54,p.z);root.rotation.set(0,Math.atan2(t.x,t.z),0);root.scale.setScalar(1.1+(i%3)*.06);root.updateMatrix();
      stamp(specs[0],i,0,.3,0,.15,.24,.11);stamp(specs[1],i,0,.51,0,.15,.17,.15);stamp(specs[2],i,0,.565,-.015,.155,.08,.15);
      stamp(specs[3],i,-.045,.12,Math.sin(stride)*.04,.05,.22,.065,stride);
      stamp(specs[4],i,.045,.12,-Math.sin(stride)*.04,.05,.22,.065,-stride);
      stamp(specs[5],i,-.105,.3,-Math.sin(stride)*.045,.045,.22,.05,-stride);
      stamp(specs[6],i,.105,.3,Math.sin(stride)*.045,.045,.22,.05,stride);
    }
    specs.forEach(s=>{s.mesh.instanceMatrix.needsUpdate=true;});
    cars.forEach(car=>{
      const u=(car.offset+time*car.speed/car.route.length)%1;
      const p=car.route.curve.getPointAt(u),t=car.route.curve.getTangentAt(u);
      car.group.position.set(p.x,.46,p.z);car.group.rotation.y=Math.atan2(t.x,t.z);
    });
    const a=time*.115+.55;
    helicopter.position.set(Math.cos(a)*10,7.9+Math.sin(a*2)*.55,Math.sin(a)*7.5-1);
    helicopter.rotation.set(.04,Math.atan2(-10*Math.sin(a),7.5*Math.cos(a)),-.1);
    rotor.rotation.y=time*32;tailRotor.rotation.x=time*43;
  }
  update(0);
  return {update};
}

