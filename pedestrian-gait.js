// A two-link leg keeps the hip fixed and bends at the knee, with a planted stance foot.
export function gaitSegments(phase) {
  const segments=[];
  const link=(name,a,b,width,depth)=>{
    const dy=a[1]-b[1],dz=b[2]-a[2];
    segments.push({name,x:a[0],y:(a[1]+b[1])/2,z:(a[2]+b[2])/2,
      width,length:Math.hypot(dy,dz),depth,angle:Math.atan2(-dz,dy),start:a,end:b});
  };
  for(const [side,x,offset] of [['left',-.047,0],['right',.047,Math.PI]]) {
    const p=phase+offset,hip=[x,.285,0];
    const ankle=[x,.026+.045*Math.max(0,-Math.sin(p)),.075*Math.cos(p)];
    const upper=.135,lower=.135,dy=hip[1]-ankle[1],dz=ankle[2];
    const distance=Math.min(upper+lower-.00001,Math.hypot(dy,dz));
    const direction=Math.atan2(-dz,dy);
    const angle=direction-Math.acos(Math.max(-1,Math.min(1,(upper*upper+distance*distance-lower*lower)/(2*upper*distance))));
    const knee=[x,hip[1]-upper*Math.cos(angle),-upper*Math.sin(angle)];
    link(side+'Thigh',hip,knee,.055,.065);link(side+'Shin',knee,ankle,.049,.058);
    segments.push({name:side+'Foot',x,y:ankle[1]-.012,z:ankle[2]+.018,width:.061,length:.024,depth:.105,angle:0});
    // Upper and lower arms are connected at the shoulder and elbow, opposite each leg.
    const shoulder=[x<0?-.11:.11,.483,0],armAngle=.27*Math.cos(p)+.06;
    const elbow=[shoulder[0],shoulder[1]-.105*Math.cos(armAngle),-.105*Math.sin(armAngle)];
    const forearmAngle=armAngle-.25-.12*Math.max(0,-Math.sin(p));
    const wrist=[shoulder[0],elbow[1]-.105*Math.cos(forearmAngle),elbow[2]-.105*Math.sin(forearmAngle)];
    link(side+'UpperArm',shoulder,elbow,.043,.05);link(side+'Forearm',elbow,wrist,.041,.047);
  }
  return segments;
}
