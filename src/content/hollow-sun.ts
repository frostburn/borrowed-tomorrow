import geometry from './hollow-sun.json';

/** The same open emblem as the authored SVGs; never fill its central aperture. */
export function hollowSunPolygons(x:number,y:number,radius:number,aspect=1){
 const at=(angle:number,r:number)=>({x:x+Math.cos(angle*Math.PI/180)*r*radius,y:y+Math.sin(angle*Math.PI/180)*r*radius*aspect});
 const rays=Array.from({length:geometry.rays},(_,i)=>{
  const a=-90+i*360/geometry.rays;
  return [at(a-geometry.rayHalfAngle,geometry.rayRoot),at(a+geometry.rayTipOffset,i%3===0?geometry.longRayTip:geometry.rayTip),at(a+geometry.rayHalfAngle,geometry.rayRoot)];
 });
 const bands=Array.from({length:24},(_,i)=>{
  const a=-90+i*15,b=a+15;
  return [at(a,1),at(b,1),at(b,geometry.innerRadius),at(a,geometry.innerRadius)];
 });
 return {rays,bands};
}
