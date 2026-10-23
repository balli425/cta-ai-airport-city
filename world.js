import { createNightLighting } from './night-lighting.js?v=20261023-6';
import { createFlightNavigation } from './navigation.js?v=20261023-6';
import * as T from 'three';
import { createCityLife } from './city-life.js?v=20261023-6';
import { OrbitControls } from './vendor/OrbitControls.js';

export function createWorld(container, labelLayer, courses, onSelect) {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile=innerWidth<761;
  const scene=new T.Scene();
  const renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.35:1.65));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
  renderer.setClearColor(0x000000,0);
  renderer.domElement.setAttribute('aria-label','築匠 AI 空港城市的 3D 原創場景，課程內容可由文字清單操作');
  renderer.domElement.setAttribute('role','img');
  container.prepend(renderer.domElement);
  let camera=new T.OrthographicCamera(-15,15,8,-8,.1,180);
  const homeTarget=new T.Vector3(0,1.2,-.4),homePosition=new T.Vector3(16,20,27).add(homeTarget);
  camera.position.copy(homePosition);
  if(mobile)camera.zoom=1.08;
  const controls=new OrbitControls(camera,renderer.domElement);
  controls.target.copy(homeTarget);controls.enableDamping=!reduced;controls.dampingFactor=.065;
  controls.enablePan=true;controls.enableRotate=true;controls.screenSpacePanning=false;controls.mouseButtons.LEFT=T.MOUSE.PAN;controls.mouseButtons.MIDDLE=T.MOUSE.ROTATE;controls.mouseButtons.RIGHT=T.MOUSE.PAN;controls.minPolarAngle=.3;controls.maxPolarAngle=1.25;controls.minZoom=.7;controls.maxZoom=3.4;
  const overviewCamera=camera;
  const flight=createFlightNavigation(renderer.domElement,()=>{reset();document.querySelector('#roam').setAttribute('aria-pressed','false');});
  function setRoaming(active){
    transition=null;flight.setActive(active);controls.enabled=!active;
    camera=active?flight.camera:overviewCamera;
    renderer.domElement.style.cursor=active?'crosshair':'grab';resize();
  }
  const hemi=new T.HemisphereLight(0xfffae9,0x789489,2.1);scene.add(hemi);
  const sun=new T.DirectionalLight(0xffecd0,2.8);sun.position.set(-10,22,12);sun.castShadow=true;
  Object.assign(sun.shadow.camera,{left:-22,right:22,top:18,bottom:-18,near:1,far:65});
  sun.shadow.mapSize.set(1536,1536);sun.shadow.normalBias=.035;sun.shadow.bias=-.00015;sun.shadow.radius=3;scene.add(sun);
  const fill=new T.DirectionalLight(0xb4d5df,1.2);fill.position.set(10,5,-15);scene.add(fill);
  const palette={cream:0xe7e5d8,white:0xf8f7ed,sand:0xc8c5af,gold:0xe6ba29,green:0x467663,leaf:0x87a87e,dark:0x174e75,wood:0xa5a49a,coral:0xc64630,blue:0x205b8c,glass:0x7cabbc};
  const nightLighting=createNightLighting(scene,mobile);
  const g={
    box:new T.BoxGeometry(1,1,1),cyl:new T.CylinderGeometry(.5,.5,1,14),
    sphere:new T.IcosahedronGeometry(.5,1),smooth:new T.SphereGeometry(.5,12,8),
    cone:new T.ConeGeometry(.5,1,7),hex:new T.CylinderGeometry(.5,.5,1,6),
    ring:new T.TorusGeometry(.5,.035,6,40)
  };
  const batch=new Map(),matrix=new T.Matrix4(),position=new T.Vector3(),scale=new T.Vector3(),quaternion=new T.Quaternion(),euler=new T.Euler();
  const colliders=[],lights=[],boats=[],leaves=[],labels=[],connections=[];
  let paused=reduced,night=false,time=0,prev=performance.now(),selected='foundation',transition=null;
  function part(kind,x,y,z,sx,sy,sz,color,rx=0,ry=0,rz=0){
    let arr=batch.get(kind);if(!arr)batch.set(kind,arr=[]);
    position.set(x,y,z);scale.set(sx,sy,sz);quaternion.setFromEuler(euler.set(rx,ry,rz));
    matrix.compose(position,quaternion,scale);arr.push({matrix:matrix.clone(),color});
  }
  function box(x,y,z,w,h,d,c,ry=0){part('box',x,y,z,w,h,d,c,0,ry)}
  function cylinder(x,y,z,r,h,c){part('cyl',x,y,z,r*2,h,r*2,c)}
  function sphere(x,y,z,r,c,squash=1){part('sphere',x,y,z,r*2,r*2*squash,r*2,c)}
  const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.8,...extra});
  const loader=new T.TextureLoader();
  const logoTexture=loader.load('./assets/cta-logo-original.jpg');
  logoTexture.colorSpace=T.SRGBColorSpace;
  const exampleTexture=loader.load('./assets/architecture-example.jpg');exampleTexture.colorSpace=T.SRGBColorSpace;
  const glassMaterial=mat(palette.glass,{transparent:true,opacity:.58,metalness:.25,roughness:.15});
  function glass(x,y,z,w,h,d){const m=new T.Mesh(g.box,glassMaterial);m.position.set(x,y,z);m.scale.set(w,h,d);m.castShadow=false;m.receiveShadow=true;scene.add(m);return m}
  function picture(x,y,z,w,h,texture,rotation=0){
    const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texture,side:T.DoubleSide}));
    m.position.set(x,y,z);m.rotation.y=rotation;scene.add(m);return m;
  }
  function canvasTexture(draw,w=768,h=384){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;}
  function board(text,sub,color='#547762'){
    return canvasTexture((ctx,w,h)=>{ctx.fillStyle='#f4f1e6';ctx.fillRect(0,0,w,h);ctx.strokeStyle=color;ctx.lineWidth=4;ctx.strokeRect(22,22,w-44,h-44);ctx.fillStyle=color;ctx.font='500 28px sans-serif';ctx.fillText('CTArch / AI LEARNING',50,76);ctx.font='600 90px sans-serif';ctx.fillText(text,50,200);ctx.fillStyle='#7c8872';ctx.font='28px sans-serif';ctx.fillText(sub,52,270);});
  }
  const flowTexture=canvasTexture((ctx,w,h)=>{
    ctx.fillStyle='#243d42';ctx.fillRect(0,0,w,h);ctx.fillStyle='#ccd4b6';ctx.font='22px sans-serif';ctx.fillText('IDEA → WORKFLOW',40,55);
    [0,1,2].forEach(i=>{const x=40+i*246;ctx.fillStyle=['#6f9275','#b09b6c','#8195a9'][i];ctx.fillRect(x,110,185,110);ctx.fillStyle='#f6f7e6';ctx.font='bold 40px sans-serif';ctx.fillText(['依據','需求','驗收'][i],x+48,180);if(i<2){ctx.fillStyle='#b7c6a1';ctx.font='40px sans-serif';ctx.fillText('→',x+197,178);}});
    ctx.fillStyle='#91a996';ctx.font='22px sans-serif';ctx.fillText('BUILD · TEST · IMPROVE',40,310);
  });
  // The water is a flat, lightweight procedural shader rather than a video.
  const waterMat=new T.ShaderMaterial({
    transparent:true,uniforms:{uTime:{value:0},uNight:{value:0}},
    vertexShader:'varying vec3 vP; void main(){vP=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`varying vec3 vP;uniform float uTime,uNight;
    void main(){float r=length(vP.xz);float fade=1.-smoothstep(13.,23.,r);
    vec3 day=vec3(.27,.52,.64),dusk=vec3(.07,.16,.25);
    float wave=sin(vP.x*3.2+vP.z*2.5+uTime*.5)*sin(vP.z*4.-uTime*.45);
    float line=smoothstep(.91,.99,wave)*.04;
    vec3 c=mix(day,dusk,uNight)+line;gl_FragColor=vec4(c,fade*.92);}`
  });
  const water=new T.Mesh(new T.PlaneGeometry(55,55),waterMat);
  water.rotation.x=-Math.PI/2;water.position.y=-.72;scene.add(water);
  // Layered contours around the archipelago echo a site plan.
  [13.5,16,18.5].forEach((r,i)=>{
    const geo=new T.EllipseCurve(0,0,r,r*.72,0,Math.PI*2).getPoints(180);
    const pts=geo.map(p=>new T.Vector3(p.x,-.69,p.y-1));
    const l=new T.LineLoop(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color:0x99b4a4,transparent:true,opacity:.16-i*.035}));scene.add(l);
  });
  function tree(x,z,s=1){
    const y=.5;
    cylinder(x,y+.5*s,z,.075*s,1.05*s,palette.wood);
    sphere(x,y+1.27*s,z,.52*s,palette.leaf,.9);
    sphere(x-.26*s,y+1.1*s,z+.1*s,.35*s,palette.green);
    sphere(x+.26*s,y+1.15*s,z-.1*s,.32*s,0xa2b38a);
    sphere(x+.04*s,y+1.56*s,z-.03*s,.27*s,0xb1be93);
  }
  function planter(x,z,w=1.0,d=.5){
    box(x,.63,z,w,.3,d,palette.cream);
    box(x,.81,z,w*.91,.12,d*.88,palette.green);
    for(let i=0;i<3;i++)sphere(x+(i-1)*w*.24,.98,z,.22,0x92a279,.8);
  }
  function bench(x,z,ry=0){
    for(let i=0;i<3;i++)box(x,.85,z+(i-1)*.1,.9,.07,.075,palette.wood,ry);
    for(const dx of [-.32,.32])box(x+dx,.66,z,.06,.33,.33,palette.dark,ry);
    box(x,1.1,z-.2,.9,.2,.055,palette.wood,ry);
  }
  function lamp(x,z){
    nightLighting.pool(x,z,1.0);
    cylinder(x,1.13,z,.035,1.24,palette.dark);
    box(x,1.78,z,.25,.07,.25,palette.dark);
    const bulb=new T.Mesh(g.smooth,new T.MeshBasicMaterial({color:0xffe5a4}));bulb.position.set(x,1.71,z);bulb.scale.set(.14,.11,.14);scene.add(bulb);lights.push(bulb);
    const glow=new T.Mesh(new T.CircleGeometry(.42,20),new T.MeshBasicMaterial({color:0xffd48b,transparent:true,opacity:0,depthWrite:false}));
    glow.rotation.x=-Math.PI/2;glow.position.set(x,.53,z);scene.add(glow);lights.push(glow);
  }
  const centers={foundation:new T.Vector3(-5.5,0,2),animation:new T.Vector3(5.55,0,2),agent:new T.Vector3(0,0,-5.45)};
  const islandRadius=3.25;
  function island(id,color){
    const c=centers[id],r=islandRadius;
    const top=new T.Mesh(new T.CylinderGeometry(r,r,.12,6),mat(palette.cream));
    top.position.set(c.x,.47,c.z);top.receiveShadow=true;top.userData.course=id;scene.add(top);
    const bounds={foundation:[3.65,2.4,2.8,.0,1.55,-.25],animation:[4.05,3.0,3.15,0,2.1,-.05],agent:[3.8,3.0,3.1,0,1.9,-.25]}[id];
    const hitbox=new T.Mesh(new T.BoxGeometry(bounds[0],bounds[1],bounds[2]),new T.MeshBasicMaterial({visible:false}));
    hitbox.position.set(c.x+bounds[3],bounds[4],c.z+bounds[5]);hitbox.userData.course=id;scene.add(hitbox);colliders.push(hitbox);
    // Paving, drainage edge and a fine inner circulation ring.
    const path=new T.Mesh(new T.RingGeometry(2.46,2.73,6),mat(0xd7d5c3,{side:T.DoubleSide}));
    path.rotation.x=-Math.PI/2;path.rotation.z=Math.PI/6;path.position.set(c.x,.531,c.z);path.receiveShadow=true;scene.add(path);
    const outline=new T.Mesh(new T.TorusGeometry(2.6,.018,4,6),mat(color));
    outline.rotation.x=Math.PI/2;outline.rotation.z=Math.PI/6;outline.position.set(c.x,.55,c.z);scene.add(outline);
    for(let n=0;n<6;n++){
      const a=n*Math.PI/3+Math.PI/6;
      const x=c.x+Math.cos(a)*2.55,z=c.z+Math.sin(a)*2.55;
      if(n!==1&&n!==4)tree(x,z,.65+(n%3)*.1);
      if(n%2===0)lamp(c.x+Math.cos(a+.25)*2.55,c.z+Math.sin(a+.25)*2.55);
    }
    // Waterfront timber deck and descending steps.
    for(let i=0;i<8;i++)box(c.x-1.02+i*.29,.53,c.z+2.8,.25,.12,.62,palette.wood);
    for(let i=0;i<5;i++)box(c.x+1.65,.46-i*.12,c.z+2.3+i*.19,.65,.13,.24,palette.cream);
    for(const dx of [-1.12,1.12])cylinder(c.x+dx,.24,c.z+3,.04,.65,palette.dark);
    bench(c.x-1.9,c.z+1.1);planter(c.x+1.9,c.z+.55,.7,.5);
    // Course selection uses a semantic HTML button projected from a 3D coordinate.
    const course=courses.find(c=>c.id===id);
    const b=document.createElement('button');b.className='island-label'+(id==='foundation'?' selected':'');
    b.style.setProperty('--island-color',course.color);b.dataset.island=id;
    b.setAttribute('aria-label','探索 '+course.name);b.setAttribute('aria-pressed',String(id==='foundation'));
    b.innerHTML='<span class="number">'+course.number+'</span><span class="label-name">'+course.name+'</span>';
    labelLayer.append(b);labels.push({element:b,at:new T.Vector3(c.x,1.0,c.z+3.12),id});
  }
  island('foundation',palette.green);island('animation',palette.coral);island('agent',palette.blue);

  // One continuous city island: three teaching districts share the same urban ground.
  const coast=[[-5,-10],[3,-10.5],[8.2,-8.4],[10.8,-4.7],[11,3.8],[8.2,7.8],[1,9],[-7.8,7.5],[-11,3],[-10.7,-4.7]];
  const shape=new T.Shape();coast.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();
  const landGeometry=new T.ExtrudeGeometry(shape,{depth:.95,bevelEnabled:false});landGeometry.rotateX(-Math.PI/2);
  const land=new T.Mesh(landGeometry,mat(palette.cream));land.position.y=-.55;land.receiveShadow=true;land.castShadow=true;scene.add(land);
  const edgePts=coast.map(([x,z])=>new T.Vector3(x,.42,z));edgePts.push(edgePts[0].clone());
  const quay=new T.Line(new T.BufferGeometry().setFromPoints(edgePts),new T.LineBasicMaterial({color:palette.dark}));scene.add(quay);
  // A legible urban grid, designed plazas, coastal promenade and primary-color accents.
  box(0,.425,-.8,19.4,.035,1.15,0xaeb5b2);
  box(-7.8,.425,-1,1.0,.035,14.4,0xaeb5b2);
  box(3.25,.425,-.5,.85,.035,15,0xaeb5b2);
  for(let i=0;i<15;i++)box(-9+i*1.3,.45,-.8,.55,.018,.045,palette.white);
  for(let i=0;i<13;i++)box(-7.8,.45,-7+i*1.1,.045,.018,.45,palette.white);
  for(let i=0;i<6;i++)box(-1.8+i*.22,.45,-1.18,.11,.02,.62,palette.white);
  box(-.2,.44,5.6,14.5,.05,1.1,palette.white);
  for(let i=0;i<24;i++)box(-7+i*.6,.48,5.6,.02,.025,1.05,palette.sand);
  for(const xx of [-9.0,-8.1,-7.2,-6.3,5.9,6.8,7.7])tree(xx,6.45,.65);
  // Modernist perimeter blocks: pilotis, ribbon windows, roof gardens and brise-soleil.
  function urbanBlock(x,z,w,d,floors,accent){
    const floor=.72,base=1.15;
    for(const dx of [-w*.4,w*.4])for(const dz of [-d*.35,d*.35])cylinder(x+dx,.82,z+dz,.055,.78,palette.white);
    box(x,base+floors*floor/2,z,w,floors*floor,d,palette.white);
    for(let f=0;f<floors;f++){
      const y=base+.34+f*floor;
      box(x,y,z+d*.51,w*.87,.27,.045,palette.dark);
      box(x+w*.51,y,z,.045,.27,d*.82,palette.dark);
      for(let column=0;column<5;column++){
        if((column+f)%4!==0)nightLighting.window(x-w*.34+column*w*.17,y,z+d*.58,w*.135,.22);
        if((column+f)%3!==0)nightLighting.window(x+w*.55,y,z-d*.32+column*d*.16,d*.125,.22,Math.PI/2);
        if((column+f)%3!==1)nightLighting.window(x-w*.55,y,z-d*.32+column*d*.16,d*.125,.22,Math.PI/2);
      }

      for(let c=0;c<5;c++)box(x-w*.4+c*w*.2,y,z+d*.545,.025,.28,.05,palette.white);
      box(x,base+f*floor,z,w*1.05,.075,d*1.05,palette.white);
    }
    box(x-w*.42,base+floors*floor/2,z-d*.2,w*.14,floors*floor+.25,d*.7,accent);
    const roof=base+floors*floor;
    box(x,roof+.09,z,w*1.08,.13,d*1.1,palette.white);
    box(x+w*.15,roof+.18,z,w*.4,.12,d*.55,palette.green);
    cylinder(x+w*.1,roof+.55,z,.035,.7,palette.wood);sphere(x+w*.1,roof+.95,z,.3,palette.leaf);
    box(x-w*.18,roof+.3,z-d*.15,w*.36,.38,d*.32,accent);
  }
  urbanBlock(-8.7,-6.4,1.5,1.5,4,palette.blue);
  urbanBlock(-6.3,-7.7,1.7,1.1,3,palette.coral);
  urbanBlock(-9.1,-3.5,1.2,1.8,5,palette.gold);
  urbanBlock(-3.5,-8.5,1.8,1.2,4,palette.blue);
  urbanBlock(2.7,-8.4,1.5,1.4,4,palette.coral);
  urbanBlock(5.4,-7.4,1.6,1.2,3,palette.gold);
  urbanBlock(-9,1.6,1.0,1.7,2,palette.blue);
  urbanBlock(8.7,4.3,1.2,1.7,3,palette.coral);
  // Airport apron and a graphic runway occupy the eastern waterfront.
  box(8.8,.44,-2.6,1.45,.06,9.6,palette.dark);
  box(7.3,.43,-3,1.5,.045,5.1,0xc3c6bf);
  for(let i=0;i<13;i++)box(8.8,.48,-6.8+i*.68,.08,.02,.32,palette.white);
  for(const zz of [-6.9,1.5])for(let i=0;i<5;i++)box(8.26+i*.27,.48,zz,.12,.02,.65,palette.white);
  for(let i=0;i<12;i++){sphere(8.05,.51,-6.6+i*.72,.028,palette.gold);sphere(9.55,.51,-6.6+i*.72,.028,palette.gold);}
  part('smooth',7.15,.85,-3.2,.45,.4,2.15,palette.white);
  box(7.15,.91,-3.0,2.5,.07,.42,palette.white);
  box(7.15,1.08,-2.3,.09,.56,.42,palette.coral);
  box(7.15,1,-3.72,.25,.16,.43,palette.dark);
  // Central signal tower and terminal: sculptural white volumes and an orbital antenna.
  box(.1,.9,-.65,3.25,.12,2.7,palette.white);
  for(const xx of [-1.25,1.4])for(const zz of [-1.65,.35])cylinder(xx,1.35,zz,.075,1.2,palette.white);
  box(.1,2.0,-.65,3.25,.15,2.7,palette.white);
  glass(.1,1.55,.69,2.8,.74,.04);
  box(-.5,3.25,-1.15,.8,4.9,.85,palette.white);
  box(-.96,3.25,-1.15,.1,4.9,.85,palette.coral);
  box(-.5,5.7,-1.15,2.45,.18,1.8,palette.white);
  glass(-.5,6.1,-.24,2.15,.7,.04);
  box(-.5,6.13,-1.15,2.25,.68,1.65,palette.dark);
  box(-.5,6.56,-1.15,2.6,.15,1.95,palette.white);
  const orbit=new T.Mesh(new T.TorusGeometry(1.05,.03,8,72),mat(palette.gold));orbit.position.set(-.5,7.05,-1.15);orbit.rotation.x=.85;orbit.rotation.z=.4;scene.add(orbit);
  cylinder(-.5,7.05,-1.15,.035,.85,palette.dark);sphere(-.5,7.55,-1.15,.14,palette.coral);
  // An exposed architectural promenade links the terminal to its roof terrace.
  part('box',-2.12,1.26,-.65,.82,.12,3.5,palette.white,-.36,0,0);
  for(const side of [-1,1])part('box',-2.12+side*.38,1.58,-.65,.035,.04,3.5,palette.gold,-.36,0,0);
  for(let i=0;i<9;i++)box(-1.15+i*.22,.45,4.35,.11,.035,.8,palette.dark);
  box(-4.7,.44,5.6,3.8,.04,1.4,palette.white);
  box(4.8,.44,5.6,3.8,.04,1.4,palette.white);
  for(const x of [-4.7,4.8]){planter(x,5.6,1.2,.4);bench(x+1.15,5.6);}
  // A satellite above the city gives the learning-airport metaphor a clear focal point.
  const satellite=new T.Group();
  const core=new T.Mesh(new T.BoxGeometry(.44,.44,.44),mat(palette.gold));satellite.add(core);
  for(const sign of [-1,1]){
    const panel=new T.Mesh(new T.BoxGeometry(1.1,.04,.7),mat(palette.dark));panel.position.x=sign*.85;satellite.add(panel);
    for(let i=0;i<4;i++){const l=new T.Mesh(new T.BoxGeometry(.012,.045,.67),mat(0x83b1ca));l.position.x=sign*.85-.4+i*.27;satellite.add(l);}
  }
  satellite.position.set(2.8,8.7,-4.4);satellite.rotation.set(.15,.35,.2);scene.add(satellite);
  const signalCurve=new T.QuadraticBezierCurve3(new T.Vector3(-.5,7.5,-1.15),new T.Vector3(1.1,9.1,-2.6),satellite.position.clone());
  const signal=new T.Line(new T.BufferGeometry().setFromPoints(signalCurve.getPoints(36)),new T.LineDashedMaterial({color:palette.gold,dashSize:.1,gapSize:.15,transparent:true,opacity:.6}));signal.computeLineDistances();scene.add(signal);

  // 01: a light-filled architectural studio with a courtyard and exhibition easels.
  {
    const {x,z}=centers.foundation;
    box(x,.65,z-.25,3.55,.2,2.65,palette.white);
    box(x-.25,1.5,z-.8,2.9,1.6,.9,palette.white);
    box(x-1.25,1.4,z+.2,.48,1.3,1.2,palette.white);
    glass(x+.25,1.48,z+.38,2.6,1.45,.06);
    for(let i=0;i<6;i++)box(x-1+i*.46,1.5,z+.43,.035,1.5,.06,palette.gold);
    glass(x+1.4,1.48,z-.35,.04,1.45,1.5);
    for(let i=0;i<4;i++)box(x+1.43,1.5,z-.9+i*.46,.05,1.5,.035,palette.gold);
    box(x,2.34,z-.28,3.65,.15,2.75,palette.white);
    box(x,2.44,z-.28,3.5,.06,2.6,palette.sand);
    for(let i=0;i<8;i++)box(x-1.55+i*.44,2.55,z-.35,.055,.14,2.45,palette.white);
    box(x-1.58,1.63,z-.15,.2,1.65,1.5,palette.coral);
    box(x+.1,.78,z+.85,2.7,.1,.8,palette.sand);
    for(let i=0;i<3;i++)box(x+.1,.61+i*.05,z+1.48-i*.18,2.75,.1,.21,palette.white);
    // An interior work table, model blocks, stools and a terrace roof garden.
    box(x,1.1,z,1.65,.1,.7,palette.wood);
    for(const dx of [-.63,.63])for(const dz of [-.23,.23])cylinder(x+dx,.88,z+dz,.025,.4,palette.dark);
    for(let i=0;i<3;i++){box(x-.5+i*.5,1.25,z,.27,.22,.25,[palette.white,palette.sand,palette.green][i]);cylinder(x-.5+i*.5,.8,z+.5,.13,.42,palette.sand);}
    planter(x-.8,z-1.6,1.25,.35);tree(x+1.85,z-1.3,.72);
    const tex=board('DESIGN','IMAGES · DOCUMENTS · TOOLS');
    box(x-.7,1.06,z+1.78,1.04,.72,.06,palette.dark);
    picture(x-.7,1.06,z+1.818,.98,.66,tex);
    cylinder(x-.7,.75,z+1.77,.025,.45,palette.wood);
    box(x+.73,1.13,z+1.95,1.05,.68,.06,palette.gold);
    picture(x+.73,1.13,z+1.986,.99,.61,exampleTexture);
    for(const dx of [-.35,.35])box(x+.73+dx,.74,z+1.9,.04,.64,.05,palette.wood);
    for(let i=0;i<6;i++)box(x-1.6,.55,z-1.2+i*.3,.1,.05,.2,palette.gold);
  }
  // 02: an open-air film pavilion with storyboard frames and a miniature camera.
  {
    const {x,z}=centers.animation;
    box(x,.7,z-.25,3.9,.3,2.8,palette.sand);
    box(x,.91,z-.25,3.8,.13,2.7,palette.white);
    box(x,2.18,z-1.12,3.55,2.4,.14,palette.coral);
    box(x,2.18,z-1.01,3.2,2.04,.1,palette.dark);
    picture(x,2.18,z-.945,3.01,1.85,exampleTexture);
    // Thin architectural canopy on four slender columns.
    box(x,3.58,z-.05,4.0,.13,3.1,palette.white);
    box(x,3.68,z-.05,3.86,.08,2.96,palette.white);
    for(const dx of [-1.8,1.8])for(const dz of [-1.25,1.24])cylinder(x+dx,2.22,z+dz,.045,2.85,palette.coral);
    for(let i=0;i<7;i++)box(x-1.62+i*.54,3.8,z-.05,.045,.16,2.9,palette.white);
    box(x-1.9,2.1,z-.65,.17,2.45,1.25,palette.blue);
    for(let row=0;row<2;row++)for(let col=0;col<4;col++){
      const xx=x-1.1+col*.72,zz=z+.25+row*.65;
      box(xx,1.24,zz,.45,.1,.4,palette.coral);box(xx,1.51,zz+.18,.45,.5,.08,palette.coral);
      for(const dx of [-.15,.15])box(xx+dx,1.08,zz,.04,.28,.32,palette.dark);
    }
    // Storyboard pedestals.
    const colors=[0x9aab83,0xc99d73,0x849caa];
    for(let i=0;i<3;i++){
      const xx=x-1.25+i*1.1;
      box(xx,.9,z+2,.82,.64,.12,palette.white);
      picture(xx,.94,z+2.07,.7,.4,board('0'+(i+1),['CONCEPT','STORY','MOTION'][i],['#547762','#b68061','#667d9a'][i]));
      cylinder(xx,.68,z+2,.025,.3,colors[i]);
    }
    // Camera and tripod, aimed at the pavilion.
    box(x-2.2,1.42,z+.9,.4,.3,.27,palette.dark);
    part('cyl',x-2.2,1.42,z+.69,.15,.22,.15,palette.dark,Math.PI/2);
    for(const dx of [-.14,.14])cylinder(x-2.2+dx,1.64,z+.91,.13,.07,palette.dark);
    for(const rz of [-.27,.27])part('box',x-2.2+rz*.7,.97,z+.92,.035,.73,.035,palette.dark,0,0,rz);
    box(x-2.2,.97,z+1.12,.035,.73,.035,palette.dark);
    // Film-strip boardwalk.
    for(let i=0;i<10;i++){
      box(x+2.35,.57,z-1.3+i*.28,.52,.055,.24,palette.dark);
      box(x+2.35,.6,z-1.3+i*.28,.3,.025,.17,palette.sand);
    }
    tree(x-2.3,z-1.8,.75);
  }
  // 03: a workshop with an observable workflow and modular server garden.
  {
    const {x,z}=centers.agent;
    box(x,.69,z-.22,3.65,.28,2.9,palette.white);
    box(x-.75,1.6,z-.75,1.95,1.55,1.3,palette.blue);
    box(x+.95,1.35,z-.8,1.35,1.05,1.2,palette.white);
    box(x-.75,2.48,z-.75,2.17,.15,1.55,palette.dark);
    box(x+.95,1.99,z-.8,1.55,.12,1.4,palette.sand);
    for(let i=0;i<5;i++)box(x-1.53+i*.38,1.65,z-.08,.18,.83,.03,0xc2d2c8);
    glass(x+.95,1.38,z-.17,1.15,.78,.06);
    box(x+.05,1.13,z+.65,2.9,.1,.7,palette.wood);
    for(const dx of [-1.3,1.3])box(x+dx,.93,z+.65,.08,.4,.6,palette.dark);
    for(let i=0;i<3;i++){
      const xx=x-.94+i*.94;
      box(xx,1.45,z+.48,.6,.46,.05,palette.dark);
      picture(xx,1.45,z+.511,.53,.38,flowTexture);
      box(xx,1.22,z+.71,.56,.045,.22,palette.blue);
      cylinder(xx,.92,z+1.18,.18,.35,palette.blue);
    }
    box(x,3.04,z-.78,2.65,.95,.08,palette.dark);
    picture(x,3.04,z-.733,2.51,.83,flowTexture);
    for(const dx of [-1.1,1.1])box(x+dx,2.66,z-.8,.04,.5,.04,palette.gold);
    for(let i=0;i<3;i++){
      const xx=x-1.18+i*1.18;
      box(xx,.76,z+1.88,.67,.46,.67,[palette.green,palette.gold,palette.blue][i]);
      sphere(xx,1.2,z+1.88,.21,palette.white);
      if(i<2)box(xx+.59,.9,z+1.88,.5,.04,.04,palette.gold);
    }
    tree(x-2.2,z-.85,.75);tree(x+2.15,z-1.75,.8);planter(x+2.2,z+.85,.45,.85);
    for(let i=0;i<4;i++)box(x-1.3+i*.9,.53,z+1.3,.45,.03,.12,palette.sand);
  }
  // The CTArch common ground links the three studios.
  const hub=new T.Mesh(new T.CylinderGeometry(1.55,1.4,.62,32),mat(palette.cream));
  hub.position.set(0,.2,.75);hub.receiveShadow=true;hub.castShadow=true;scene.add(hub);
  const hubRing=new T.Mesh(new T.TorusGeometry(1.35,.035,8,64),mat(palette.gold));
  hubRing.rotation.x=Math.PI/2;hubRing.position.set(0,2.7,.75);scene.add(hubRing);
  for(let i=0;i<8;i++){let a=i*Math.PI/4;cylinder(Math.cos(a)*1.35,1.6,.75+Math.sin(a)*1.35,.025,2.2,palette.gold);}
  cylinder(0,.63,.75,.7,.24,palette.white);
  picture(0,1.55,.85,1.13,1.13,logoTexture);
  box(0,1.55,.79,1.23,1.23,.08,palette.white);
  cylinder(0,1,.8,.035,.8,palette.gold);
  // Footbridges follow explicit curves, with repeated timber treads and handrails.
  const routes=[
    [new T.Vector3(-2.8,.56,1.7),new T.Vector3(-1.2,.56,1.0)],
    [new T.Vector3(2.85,.56,1.7),new T.Vector3(1.2,.56,1.0)],
    [new T.Vector3(0,.56,-2.62),new T.Vector3(0,.56,-.55)]
  ];
  routes.forEach(([a,b])=>{
    const d=new T.Vector3().subVectors(b,a),length=d.length(),angle=Math.atan2(d.x,d.z);
    const mid=a.clone().add(b).multiplyScalar(.5);
    box(mid.x,.43,mid.z,.8,.15,length,palette.dark,angle);
    const n=Math.ceil(length/.16);
    for(let i=0;i<=n;i++){const p=a.clone().lerp(b,i/n);box(p.x,.57,p.z,.83,.08,.12,palette.wood,angle);}
    for(const side of [-1,1]){
      const off=new T.Vector3(Math.cos(angle)*.37,0,-Math.sin(angle)*.37);
      for(let i=0;i<4;i++){const p=a.clone().lerp(b,i/3).addScaledVector(off,side);cylinder(p.x,.92,p.z,.022,.65,palette.gold);}
      box(mid.x+off.x*side,1.2,mid.z+off.z*side,.028,.028,length,palette.gold,angle);
    }
  });
  // Three quiet dotted connections animate knowledge moving between studios.
  Object.values(centers).forEach((c,i)=>{
    const path=new T.QuadraticBezierCurve3(new T.Vector3(c.x,1.0,c.z),new T.Vector3(c.x*.5,3.8,c.z*.5),new T.Vector3(0,1.1,.75));
    const pts=path.getPoints(60);
    const l=new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineDashedMaterial({color:[palette.green,palette.coral,palette.blue][i],dashSize:.08,gapSize:.16,transparent:true,opacity:.32}));
    l.computeLineDistances();scene.add(l);
    const dot=new T.Mesh(new T.SphereGeometry(.055,8,6),new T.MeshBasicMaterial({color:[0x789966,0xcf9a75,0x8a9fab][i]}));scene.add(dot);connections.push({path,dot,offset:i/3});
  });
  const cityLife=createCityLife(scene,palette);
  // A few off-shore islets, reed beds and small boats complete the waterfront.
  for(const [x,z,r] of []){
    const m=new T.Mesh(new T.CylinderGeometry(r,r*.85,.35,8),mat(palette.sand));m.position.set(x,-.48,z);m.receiveShadow=true;scene.add(m);
    if(r>1){tree(x,z,.65);sphere(x+.4,-.13,z+.4,.3,palette.cream,.6);}
    for(let i=0;i<4;i++)part('cone',x-r+.2+i*.25,-.15,z+r*.6,.08,.45,.08,palette.green);
  }
  for(let i=0;i<4;i++){
    const group=new T.Group(),hull=new T.Mesh(new T.ConeGeometry(.23,.85,4),mat(i%2?palette.white:palette.wood));
    hull.rotation.x=Math.PI/2;hull.scale.z=.45;group.add(hull);
    const mast=new T.Mesh(new T.CylinderGeometry(.012,.012,.8,5),mat(palette.dark));mast.position.y=.35;group.add(mast);
    const sail=new T.Mesh(new T.ConeGeometry(.24,.6,3),mat(palette.white));sail.position.set(.14,.45,0);sail.scale.z=.06;group.add(sail);
    group.position.set([-13,13,-3,12][i],-.5,[1,7,11,-5][i]);scene.add(group);boats.push({group,x:group.position.x,z:group.position.z,phase:i*1.3});
  }
  // Static repeated parts share geometry/material and are issued as instanced draws.
  for(const [kind,items] of batch){
    const mesh=new T.InstancedMesh(g[kind],new T.MeshStandardMaterial({roughness:.82}),items.length);
    items.forEach((item,i)=>{mesh.setMatrixAt(i,item.matrix);mesh.setColorAt(i,new T.Color(item.color));});
    mesh.castShadow=true;mesh.receiveShadow=true;mesh.computeBoundingSphere();scene.add(mesh);
  }
  // Warm interior light and ground spill make night mode a lit city.
  for(const [x,y,z,w,h] of [[-5.25,1.48,2.48,2.4,1.15],[-4.05,1.48,1.65,.9,1.1],[.95,1.38,-5.25,1.0,.68],[-.5,6.1,-.2,2.05,.54],[.1,1.55,.73,2.6,.6]])nightLighting.window(x,y,z,w,h);
  for(let i=0;i<5;i++)nightLighting.window(-1.53+i*.38,1.65,-5.52,.16,.68);
  for(const [x,z] of [[-5.5,3.5],[5.55,3.8],[0,-3.3],[0,.8],[-6,5.7],[-2,5.7],[2,5.7],[6,5.7],[-7.5,-3],[-7.5,0],[3.25,-3]])nightLighting.pool(x,z,1.6);
  for(let i=0;i<13;i++)for(const x of [8.05,9.55])nightLighting.beacon(x,.55,-6.6+i*.72,.05);
  nightLighting.beacon(-.5,7.56,-1.15,.11);
  for(const [x,y,z,power] of [[-5.4,2.6,2.8,30],[5.5,3,2.4,38],[0,3,-4.7,32],[0,3.2,.7,32],[7.4,2.4,-2.7,22]])nightLighting.point(x,y,z,power,7);
  nightLighting.finish();
  const clock=new T.Clock();
  const ray=new T.Raycaster(),mouse=new T.Vector2(),start=new T.Vector2();
  renderer.domElement.addEventListener('pointerdown',e=>start.set(e.clientX,e.clientY));
  renderer.domElement.addEventListener('pointerup',e=>{
    if(start.distanceTo(new T.Vector2(e.clientX,e.clientY))>6)return;
    const r=renderer.domElement.getBoundingClientRect();mouse.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);
    ray.setFromCamera(mouse,camera);const hit=ray.intersectObjects(colliders,false)[0];
    if(hit){const id=hit.object.userData.course;selected=id;onSelect(id);focus(id);}
  });
  renderer.domElement.addEventListener('pointermove',e=>{
    if(flight.active)return;
    if(e.buttons)return;const r=renderer.domElement.getBoundingClientRect();mouse.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);
    ray.setFromCamera(mouse,camera);renderer.domElement.style.cursor=ray.intersectObjects(colliders,false).length?'pointer':'grab';
  });
  controls.addEventListener('start',()=>{transition=null});
  function resize(){
    const w=container.clientWidth,h=container.clientHeight;renderer.setSize(w,h);
    const aspect=w/h;
    const viewHeight=innerWidth<761?Math.max(19,27/aspect):Math.max(16.2,29/aspect);
    flight.camera.aspect=aspect;flight.camera.updateProjectionMatrix();
    overviewCamera.left=-viewHeight*aspect/2;overviewCamera.right=viewHeight*aspect/2;overviewCamera.top=viewHeight/2;overviewCamera.bottom=-viewHeight/2;
    if(innerWidth<761)overviewCamera.setViewOffset(w,h,0,h*.11,w,h);else overviewCamera.clearViewOffset();
    overviewCamera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(container);resize();
  function move(target,pos,zoom){
    if(reduced){controls.target.copy(target);camera.position.copy(pos);camera.zoom=zoom;camera.updateProjectionMatrix();return;}
    transition={from:controls.target.clone(),to:target,fromPos:camera.position.clone(),toPos:pos,fromZoom:camera.zoom,toZoom:zoom,at:performance.now()};
  }
  function focus(id){
    selected=id;const c=centers[id];if(!c||flight.active)return;
    const target=c.clone().add(new T.Vector3(0,1.0,.1));
    move(target,target.clone().add(new T.Vector3(10,14,22)),innerWidth<761?1.8:1.65);
  }
  function reset(){if(flight.active)setRoaming(false);selected='';move(homeTarget.clone(),homePosition.clone(),innerWidth<761?1.08:1);}
  const dayHemi=new T.Color(0xfffae9),nightHemi=new T.Color(0xb4c7ef);
  let nightBlend=0;
  function animate(now){
    requestAnimationFrame(animate);
    const delta=Math.max(0,Math.min((now-prev)/1000,.05));prev=now;
    if(document.hidden)return;
    if(!paused)time+=delta;
    if(transition){
      let f=Math.min(1,(now-transition.at)/1000),s=f*f*(3-2*f);
      controls.target.lerpVectors(transition.from,transition.to,s);camera.position.lerpVectors(transition.fromPos,transition.toPos,s);camera.zoom=T.MathUtils.lerp(transition.fromZoom,transition.toZoom,s);camera.updateProjectionMatrix();
      if(f===1)transition=null;
    }
    if(flight.active)flight.update(delta);else controls.update();
    nightBlend=T.MathUtils.lerp(nightBlend,night?1:0,reduced?1:.05);
    hemi.color.copy(dayHemi).lerp(nightHemi,nightBlend);hemi.intensity=2.1-nightBlend*1.35;
    sun.intensity=2.8-nightBlend*2.6;sun.color.set(nightBlend>.5?0xb5c9e7:0xffecd0);fill.intensity=1.2-nightBlend*.5;
    renderer.toneMappingExposure=1.25-nightBlend*.2;
    waterMat.uniforms.uTime.value=time;waterMat.uniforms.uNight.value=nightBlend;
    lights.forEach((m,i)=>{if(i%2)m.material.opacity=nightBlend*.4;else m.visible=nightBlend>.25;});
    nightLighting.update(nightBlend);
    cityLife.update(time);
    boats.forEach(b=>{b.group.position.y=-.45+Math.sin(time*1.5+b.phase)*.025;b.group.rotation.y=b.phase+Math.sin(time*.1)*.2;b.group.position.x=b.x+Math.sin(time*.12+b.phase)*.3;});
    connections.forEach(c=>c.dot.position.copy(c.path.getPoint((time*.08+c.offset)%1)));
    const w=container.clientWidth,h=container.clientHeight;
    // Course labels stay clear of the responsive HUD at every selected text size.
    const sceneRect=container.getBoundingClientRect();
    const obstacles=[...document.querySelectorAll('.city-hud-main,.experience-toolbar,.masthead')].map(e=>e.getBoundingClientRect());
    const placed=[];
    labels.forEach(l=>{
      const p=l.at.clone().project(camera),lw=l.element.offsetWidth||170,lh=l.element.offsetHeight||50;
      let x=(p.x*.5+.5)*w,y=(-p.y*.5+.5)*h;
      x=Math.max(lw/2+8,Math.min(w-lw/2-8,x));
      for(const rect of [...obstacles,...placed]){
        const left=rect.left-sceneRect.left,right=rect.right-sceneRect.left,top=rect.top-sceneRect.top,bottom=rect.bottom-sceneRect.top;
        if(x+lw/2>left-8&&x-lw/2<right+8&&y+lh/2>top-8&&y-lh/2<bottom+8){
          y=rect===obstacles[2]?bottom+lh/2+12:top-lh/2-12;
        }
      }
      l.element.style.left=x+'px';l.element.style.top=y+'px';
      l.element.hidden=p.z>1||p.x<-1.1||p.x>1.1||p.y<-1.1||p.y>1.1;
      if(!l.element.hidden)placed.push({left:sceneRect.left+x-lw/2,right:sceneRect.left+x+lw/2,top:sceneRect.top+y-lh/2,bottom:sceneRect.top+y+lh/2});
    });
    renderer.render(scene,camera);
  }
  requestAnimationFrame(animate);
  return {focus,reset,setRoaming,setNight(value){night=value},setPaused(value){paused=value}};
}
