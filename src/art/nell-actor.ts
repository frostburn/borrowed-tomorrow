import { type ActorDirection } from '../content/actors';
import { project, type Point3 } from './actor-space';
import { renderLayers, type PixelTexture, type SpriteLayer } from './layered-sprite';
import { referenceRig, weaponPoint, type ReferencePose, type WeaponPose } from './reference-rig';
import { REFERENCE_FRAMES } from './walk-cycle';
import { referenceLayers } from '../dev/reference-actor';

export const NELL_LEG_LENGTH=12;
export const NELL_HIP_DROP=5.8;
export type NellTextures=Record<ActorDirection,PixelTexture>;

/** Retarget only limb proportions. Keep the reference's feet, contacts and 40-pixel stride. */
export function nellPose(phase:number):ReferencePose {
  const pose=referenceRig(phase,'lantern'),drop=NELL_HIP_DROP;
  pose.hipHeight-=drop;
  for(const side of ['left','right'] as const){
    const leg=pose[side];leg.hip={...leg.hip,z:pose.hipHeight};
    const dy=leg.ankle.y,dz=leg.ankle.z-leg.hip.z,d=Math.hypot(dy,dz),bend=Math.sqrt(NELL_LEG_LENGTH**2-d*d/4);
    leg.knee={x:leg.hip.x,y:dy/2-dz/d*bend,z:(leg.hip.z+leg.ankle.z)/2+dy/d*bend};
    for(const joint of ['shoulder','elbow','wrist','grip'] as const)pose.arms[side][joint]={...pose.arms[side][joint],z:pose.arms[side][joint].z-drop};
  }
  pose.weapon={...pose.weapon!,grip:pose.arms.right.grip};
  return pose;
}
export const nellFrame=(frame:number)=>nellPose(frame/REFERENCE_FRAMES);

function patch(source:PixelTexture,x:number,y:number,width:number,height:number,accept:(r:number,g:number,b:number)=>boolean):PixelTexture {
  const pixels=new Uint8ClampedArray(width*height*4);
  for(let row=0;row<height;row++)pixels.set(source.pixels.subarray(((y+row)*source.width+x)*4,((y+row)*source.width+x+width)*4),row*width*4);
  const samples=Array.from({length:width*height},(_,i)=>i).filter(i=>pixels[i*4+3]>=128&&accept(pixels[i*4],pixels[i*4+1],pixels[i*4+2]));
  if(!samples.length)throw new Error('The Nell material patch contains no garment pixels.');
  for(let i=0;i<width*height;i++){
    if(samples.includes(i))continue;
    const nearest=samples.reduce((a,b)=>Math.hypot(a%width-i%width,Math.floor(a/width)-Math.floor(i/width))<=Math.hypot(b%width-i%width,Math.floor(b/width)-Math.floor(i/width))?a:b);
    pixels.set(pixels.subarray(nearest*4,nearest*4+4),i*4);
  }
  return {width,height,pixels};
}

function viewPoint(x:number,y:number,depth:number,direction:ActorDirection):Point3 {
  const v={x:x-40,y:depth,z:68+depth*.45-y};
  switch(direction){
    case 'front':return {x:-v.x,y:v.y,z:v.z};
    case 'back':return {x:v.x,y:-v.y,z:v.z};
    case 'right':return {x:v.y,y:v.x,z:v.z};
    case 'left':return {x:-v.y,y:-v.x,z:v.z};
  }
}

function decal(id:string,texture:PixelTexture,rect:readonly[number,number,number,number],dy:number,depth:number,direction:ActorDirection):SpriteLayer {
  const [x,y,w,h]=rect;
  return {id,vertices:[[x,y],[x+w,y],[x+w,y+h],[x,y+h]].map(([sx,sy])=>viewPoint(sx,sy+dy,depth,direction)),
    faces:[{points:[0,1,2,3],color:0xffffff,unlit:true,texture,uv:[{u:x,v:y},{u:x+w,v:y},{u:x+w,v:y+h},{u:x,v:y+h}]}]};
}

function cloth(layer:SpriteLayer,a:Point3,b:Point3,texture:PixelTexture):SpriteLayer {
  const dy=b.y-a.y,dz=b.z-a.z,d=Math.hypot(dy,dz),xs=layer.vertices.map(p=>p.x),x0=Math.min(...xs),width=Math.max(...xs)-x0;
  const across=(p:Point3)=>(-dz*(p.y-a.y)+dy*(p.z-a.z))/d;
  const edge=Math.max(...layer.vertices.map(p=>Math.abs(across(p))));
  for(const [index,face] of layer.faces.entries()){
    face.texture=texture;face.unlit=true;
    face.uv=face.points.map(i=>{const p=layer.vertices[i];return {u:(index<2?(across(p)/edge+1)/2:(p.x-x0)/width)*texture.width,
      v:((p.y-a.y)*dy+(p.z-a.z)*dz)/(d*d)*texture.height};});
  }
  return layer;
}

function cage(weapon:WeaponPose):SpriteLayer[]{
  const result:SpriteLayer[]=[];
  for(const x of [-2.5,2.5])for(const y of [-2.5,2.5]){
    const vertices:Point3[]=[];
    for(const z of [-10,-5])for(const dx of [-.4,.4])for(const dy of [-.4,.4])vertices.push(weaponPoint(weapon,y+dy,z,x+dx));
    result.push({id:'right-weapon',vertices,faces:[[0,1,3,2],[4,5,7,6],[0,1,5,4],[2,3,7,6],[0,2,6,4],[1,3,7,5]].map(points=>({points,color:0x9f6a2d}))});
  }
  return result;
}

/** Directional native pixels supply identity; joint geometry supplies every moving limb. */
export function nellLayers(pose:ReferencePose,direction:ActorDirection,textures:NellTextures):SpriteLayer[]{
  const source=textures[direction],head={...source,pixels:new Uint8ClampedArray(source.pixels)};
  for(let y=28;y<80;y++)for(let x=0;x<80;x++){
    const at=(y*80+x)*4,r=head.pixels[at],g=head.pixels[at+1],b=head.pixels[at+2];
    const braid=direction==='front'?y<38&&((x>=29&&x<35)||(x>45&&x<52)):direction==='back'?y<41&&((x>=31&&x<36)||(x>44&&x<50)):direction==='left'?y<42&&x>44:y<42&&x<36;
    const hair=braid&&r>g*1.25&&g>r*.32&&b<g*.85;
    if(!hair)head.pixels[at+3]=0;
  }
  const trousers=patch(source,37,45,6,10,(r,g,b)=>r<g*1.4&&b>r*.8),sleeve=patch(source,direction==='right'?33:29,30,4,10,(r,g,b)=>r>g*1.7&&r>b*1.4&&r>65),boot=patch(source,37,58,6,9,(r,g,b)=>r>g*1.2&&g>b*1.1);
  const lampRect:Record<ActorDirection,readonly[number,number,number,number]>={front:[23,47,8,10],left:[29,47,5,8],right:[45,47,8,10],back:[48,48,7,9]};
  const lamp=patch(source,...lampRect[direction],(r,g,b)=>r>g*1.1&&g>b*1.1);
  // Keep cuffs visible and give the lower shin a boot shaft.
  const shin={...trousers,pixels:new Uint8ClampedArray(trousers.pixels)};
  for(let y=6;y<10;y++)for(let x=0;x<6;x++)shin.pixels.set(boot.pixels.subarray(((y-6)*6+x)*4,((y-6)*6+x)*4+4),(y*6+x)*4);
  const layers=referenceLayers(pose,false).filter(layer=>layer.id!=='head'&&layer.id!=='torso');
  for(const layer of layers){
    const side=layer.id.startsWith('left-')?'left':'right',leg=pose[side],arm=pose.arms[side];
    if(layer.id.endsWith('-thigh'))cloth(layer,leg.hip,leg.knee,trousers);
    else if(layer.id.endsWith('-shin'))cloth(layer,leg.knee,leg.ankle,shin);
    else if(layer.id.endsWith('-upper-arm'))cloth(layer,arm.shoulder,arm.elbow,sleeve);
    else if(layer.id.endsWith('-forearm'))cloth(layer,arm.elbow,arm.wrist,sleeve);
    else if(layer.id.endsWith('-hand'))for(const face of layer.faces)face.color=0xc59a68;
    else if(layer.id.endsWith('-foot')||layer.id==='right-weapon'){
      for(const face of layer.faces){
        if(face.color===0x38434b){face.color=0x39251f;continue;}
        if(layer.id==='right-weapon'&&face.color!==0xffd57d)continue;
        const texture=layer.id==='right-weapon'?lamp:boot;
        const projected=layer.vertices.map(p=>project(p,direction)),xx=projected.map(p=>p.x),yy=projected.map(p=>p.y),x0=Math.min(...xx),y0=Math.min(...yy),w=Math.max(...xx)-x0,h=Math.max(...yy)-y0;
        face.texture=texture;face.unlit=true;face.uv=face.points.map(i=>({u:(projected[i].x-x0)/w*texture.width,v:(projected[i].y-y0)/h*texture.height}));
      }
    }
  }
  const dy=30.3-(pose.hipHeight+NELL_HIP_DROP),bodyRect:readonly[number,number,number,number]=direction==='front'||direction==='back'?[33,27,14,22]:[34,27,12,22];
  layers.push(decal('torso',source,bodyRect,dy,4,direction),decal('head',head,[20,0,40,43],dy,7,direction));
  layers.push(...cage(pose.weapon!));
  return layers;
}
export const renderNell=(frame:number,direction:ActorDirection,textures:NellTextures)=>renderLayers(nellLayers(nellFrame(frame),direction,textures),direction);
