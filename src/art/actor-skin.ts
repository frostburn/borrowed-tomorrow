import type { ActorDirection } from '../content/actors';
import { project, type Point3 } from './actor-space';
import type { PixelTexture, SpriteLayer } from './layered-sprite';
import type { ReferencePose } from './reference-rig';
import { footPoint, type FootPose } from './walk-cycle';

export type CharacterTextures=Record<ActorDirection,PixelTexture>;

export function patch(source:PixelTexture,x:number,y:number,width:number,height:number,accept:(r:number,g:number,b:number)=>boolean):PixelTexture {
  const pixels=new Uint8ClampedArray(width*height*4);
  for(let row=0;row<height;row++)pixels.set(source.pixels.subarray(((y+row)*source.width+x)*4,((y+row)*source.width+x+width)*4),row*width*4);
  const samples=Array.from({length:width*height},(_,i)=>i).filter(i=>pixels[i*4+3]>=128&&accept(pixels[i*4],pixels[i*4+1],pixels[i*4+2]));
  if(!samples.length)throw new Error('The character material patch contains no garment pixels.');
  for(let i=0;i<width*height;i++){
    if(samples.includes(i))continue;
    const nearest=samples.reduce((a,b)=>Math.hypot(a%width-i%width,Math.floor(a/width)-Math.floor(i/width))<=Math.hypot(b%width-i%width,Math.floor(b/width)-Math.floor(i/width))?a:b);
    pixels.set(pixels.subarray(nearest*4,nearest*4+4),i*4);
  }
  return {width,height,pixels};
}

export function viewPoint(x:number,y:number,depth:number,direction:ActorDirection):Point3 {
  const v={x:x-40,y:depth,z:68+depth*.45-y};
  switch(direction){
    case 'front':return {x:-v.x,y:v.y,z:v.z};
    case 'back':return {x:v.x,y:-v.y,z:v.z};
    case 'right':return {x:v.y,y:v.x,z:v.z};
    case 'left':return {x:-v.y,y:-v.x,z:v.z};
  }
}

export function decal(id:string,texture:PixelTexture,rect:readonly[number,number,number,number],dy:number,depth:number,direction:ActorDirection):SpriteLayer {
  const [x,y,w,h]=rect;
  return {id,vertices:[[x,y],[x+w,y],[x+w,y+h],[x,y+h]].map(([sx,sy])=>viewPoint(sx,sy+dy,depth,direction)),
    faces:[{points:[0,1,2,3],color:0xffffff,unlit:true,texture,uv:[{u:x,v:y},{u:x+w,v:y},{u:x+w,v:y+h},{u:x,v:y+h}]}]};
}

interface SkinVertex { point:Point3;u:number;v:number }
export const ROUND_SIDES=12;

/** A contoured skin surface, independent of the mannequin's rectangular parts. */
export function surface(id:string,rings:SkinVertex[][],color:number,texture?:PixelTexture):SpriteLayer {
  const samples=rings.flat(),count=rings[0].length,faces:SpriteLayer['faces']=[];
  const face=(points:number[])=>faces.push({points,color,texture,unlit:!!texture,uv:texture?points.map(i=>({u:samples[i].u,v:samples[i].v})):undefined});
  for(let ring=0;ring<rings.length-1;ring++)for(let j=0;j<count;j++){
    const next=(j+1)%count,a=ring*count,b=(ring+1)*count;face([a+j,a+next,b+next,b+j]);
  }
  face(Array.from({length:count},(_,i)=>count-1-i));face(Array.from({length:count},(_,i)=>(rings.length-1)*count+i));
  return {id,vertices:samples.map(s=>s.point),faces};
}

export const acrossView=(direction:ActorDirection,c:number,s:number)=>direction==='front'?-c:direction==='back'?c:direction==='left'?-s:s;

export function limb(id:string,a:Point3,b:Point3,start:readonly[number,number],end:readonly[number,number],texture:PixelTexture,direction:ActorDirection,fullness=1):SpriteLayer {
  const dy=b.y-a.y,dz=b.z-a.z,d=Math.hypot(dy,dz),ny=-dz/d,nz=dy/d;
  const stations=[[-.09,.15],[0,.85],[.2,1.05],[.55,1],[.85,.98],[1,.8],[1.09,.15]] as const;
  return surface(id,stations.map(([t,round])=>Array.from({length:ROUND_SIDES},(_,i)=>{
    const angle=i/ROUND_SIDES*Math.PI*2,c=Math.cos(angle),s=Math.sin(angle),at=Math.max(0,Math.min(1,t));
    const rx=(start[0]+(end[0]-start[0])*at)*round*fullness,ry=(start[1]+(end[1]-start[1])*at)*round*fullness;
    return {point:{x:a.x+c*rx,y:a.y+dy*t+s*ry*ny,z:a.z+dz*t+s*ry*nz},
      u:(acrossView(direction,c,s)+1)/2*texture.width,v:at*texture.height};
  })),0xffffff,texture);
}

export function rounded(id:string,center:Point3,radii:readonly[number,number,number],color:number,scale=1):SpriteLayer {
  const rings=Array.from({length:7},(_,row)=>{
    const v=row/6,ring=Math.max(.04,Math.sin(v*Math.PI));
    return Array.from({length:ROUND_SIDES},(_,i)=>{const angle=i/ROUND_SIDES*Math.PI*2;
      return {point:{x:center.x+Math.cos(angle)*radii[0]*ring*scale,y:center.y+Math.sin(angle)*radii[1]*ring*scale,z:center.z+Math.cos(v*Math.PI)*radii[2]*scale},u:0,v:0};});
  });
  return surface(id,rings,color);
}

/** One projected fabric field spans the seat and legs, without a UV seam at each hip. */
export function trouserFabric(layer:SpriteLayer,pose:ReferencePose,texture:PixelTexture,direction:ActorDirection):SpriteLayer {
  const width=pose.proportions.hipHalfWidth+4.5*pose.proportions.legWidth;
  const top=68-pose.hipHeight-5,height=pose.proportions.legLength+6;
  for(const face of layer.faces)face.uv=face.points.map(index=>{
    const p=project(layer.vertices[index],direction);
    return {u:(p.x-40+width)/(width*2)*texture.width,v:(p.y-top)/height*texture.height};
  });
  return layer;
}

/** Full upper trouser legs stay anchored at the waist before bending toward the knees. */
export function trouserLeg(side:'left'|'right',pose:ReferencePose,texture:PixelTexture,direction:ActorDirection):SpriteLayer {
  const {hip,knee}=pose[side],fullness=pose.proportions.legWidth,dy=knee.y-hip.y,dz=knee.z-hip.z;
  // The top three rings belong to the waist/seat, not a capped cylinder rotating
  // on the hip. The lower rings progressively follow the upper-leg bone.
  const rings=[
    {y:0,z:5,rx:3.8,ry:2.2,turn:0},{y:0,z:2,rx:4.25,ry:3.2,turn:0},
    {y:dy*.12,z:dz*.12,rx:4.35,ry:3.5,turn:.3},
    {y:dy*.4,z:dz*.4,rx:4.1,ry:3.3,turn:.75},
    {y:dy*.75,z:dz*.75,rx:3.6,ry:3.05,turn:1},
    {y:dy*1.02,z:dz*1.02,rx:3.05,ry:2.7,turn:1},
    {y:dy*1.12,z:dz*1.12,rx:2.4,ry:2.1,turn:1},
  ];
  const layer=surface(`${side}-thigh`,rings.map(({y,z,rx,ry,turn})=>Array.from({length:ROUND_SIDES},(_,i)=>{
    const angle=i/ROUND_SIDES*Math.PI*2,c=Math.cos(angle),s=Math.sin(angle),tilt=Math.atan2(dy,-dz)*turn;
    return {point:{x:hip.x+c*rx*fullness,y:hip.y+y+s*ry*fullness*Math.cos(tilt),z:hip.z+z+s*ry*fullness*Math.sin(tilt)},u:0,v:0};
  })),0xffffff,texture);
  return trouserFabric(layer,pose,texture,direction);
}

/** A continuous trouser seat overlaps the waist and both upper thigh caps. */
export function pelvis(pose:ReferencePose,texture:PixelTexture,direction:ActorDirection):SpriteLayer {
  const {hipHalfWidth,legWidth}=pose.proportions,width=hipHalfWidth+4.1*legWidth;
  const stations=[[5,.8,2.4],[3.5,.98,3.3],[1,1,3.8],[-1.5,.94,3.1],[-4,.7,2.2]] as const;
  const layer=surface('torso',stations.map(([z,full,depth],row)=>Array.from({length:ROUND_SIDES},(_,i)=>{
    const angle=i/ROUND_SIDES*Math.PI*2,c=Math.cos(angle),s=Math.sin(angle);
    return {point:{x:c*width*full,y:s*depth,z:pose.hipHeight+z},u:(acrossView(direction,c,s)+1)/2*texture.width,v:row/(stations.length-1)*texture.height};
  })),0xffffff,texture);
  return trouserFabric(layer,pose,texture,direction);
}

export function shoe(side:'left'|'right',foot:FootPose,texture:PixelTexture,direction:ActorDirection,scale:number,widthScale:number):SpriteLayer {
  // Rounded heel, close ankle, raised instep and a low tapered toe. The two
  // sole contact endpoints remain at the accepted heel/toe pivots.
  const stations=[[-4,1.1,0,3.5],[-3.2,1.85,0,5.4],[-1.5,2.2,.05,6],[0,2.15,.15,5.4],[2.5,2.3,.15,4.1],[5.2,2.4,0,3.5],[6.9,1.6,0,2.8],[8,.3,0,1.5]] as const;
  const height=Math.max(...stations.map(station=>station[3]));
  const layer=surface(`${side}-foot`,stations.map(([y,width,bottom,top])=>Array.from({length:ROUND_SIDES},(_,i)=>{
    const angle=i/ROUND_SIDES*Math.PI*2,x=Math.cos(angle)*width,z=(bottom+top)/2+Math.sin(angle)*(top-bottom)/2;
    const p=footPoint(foot,y*scale,z*scale);p.x+=x*scale*1.5*widthScale;
    const u=direction==='front'?-x/5+.5:direction==='back'?x/5+.5:direction==='left'?1-(y+4)/12:(y+4)/12;
    return {point:p,u:u*texture.width,v:(1-z/height)*texture.height};
  })),0xffffff,texture);
  for(const face of layer.faces)if(face.uv!.every(p=>p.v>texture.height*.82)){face.texture=undefined;face.color=0x39251f;face.unlit=false;}
  return layer;
}
