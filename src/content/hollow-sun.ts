import geometry from './hollow-sun.json';

/** One missing upper-left wedge; closed seams do not divide the rim into arcs. */
export function hollowSunPolygons(x:number,y:number,radius:number,aspect=1){
 const at=(angle:number,r:number)=>({x:x+Math.cos(angle*Math.PI/180)*r*radius,y:y+Math.sin(angle*Math.PI/180)*r*radius*aspect});
 const [start,end]=geometry.rimArc;
 const edge=(angle:number,outer:number,inner:number)=>{
  const profile=geometry.breakEdges.find(p=>p[0][0]===angle);
  if(!profile)return [[angle,outer],[angle,inner]];
  const interpolate=(r:number)=>{
   for(let i=0;i<profile.length-1;i++){
    const [a,u]=profile[i],[b,v]=profile[i+1];
    if(v<=r&&r<=u)return [a+(b-a)*(u-r)/(u-v),r];
   }
   return [angle,r];
  };
  return [interpolate(outer),...profile.filter(([,r])=>inner<r&&r<outer),interpolate(inner)];
 };
 const angles=Array.from({length:geometry.rays},(_,i)=>-90+i*360/geometry.rays);
 const rays=angles.filter(a=>(a-start+360)%360<=end-start).map(a=>{
  const i=angles.indexOf(a);
  return [at(a-geometry.rayHalfAngle,geometry.rayRoot),at(a+geometry.rayTipOffset,i%3===0?geometry.longRayTip:geometry.rayTip),at(a+geometry.rayHalfAngle,geometry.rayRoot)];
 });
 const divisions=[start,...Array.from({length:24},(_,i)=>-90+i*15).filter(a=>start<a&&a<end),end];
 const bands=divisions.slice(0,-1).map((a,i)=>{
  const b=divisions[i+1],first=edge(a,1,geometry.innerRadius),last=edge(b,1,geometry.innerRadius);
  return [first[0],...last,first.at(-1)!,...first.slice(1,-1).reverse()].map(([angle,r])=>at(angle,r));
 });
 const cracks=geometry.fractures.map(path=>path.map(([a,r])=>at(a,r)));
 return {rays,bands,cracks};
}
