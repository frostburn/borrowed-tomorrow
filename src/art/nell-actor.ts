import { NELL_PROPORTIONS, type RigProportions } from './rig-proportions';
import { type ActorDirection } from '../content/actors';
import { orient, project, type Point3 } from './actor-space';
import { renderLayers, type PixelTexture, type SpriteLayer } from './layered-sprite';
import { referenceRig, type ReferencePose, type WeaponPose } from './reference-rig';
import { footPoint, REFERENCE_FRAMES, type FootPose } from './walk-cycle';

export type NellTextures=Record<ActorDirection,PixelTexture>;

/** Nell shares the gait solver, with dimensions registered to her native costume. */
export const nellPose=(phase:number,config:Readonly<RigProportions>=NELL_PROPORTIONS):ReferencePose=>referenceRig(phase,'lantern',config);
export const nellFrame=(frame:number,config:Readonly<RigProportions>=NELL_PROPORTIONS)=>nellPose(frame/REFERENCE_FRAMES,config);

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

interface SkinVertex { point:Point3;u:number;v:number }
const ROUND_SIDES=12;

/** A contoured skin surface, independent of the mannequin's rectangular parts. */
function surface(id:string,rings:SkinVertex[][],color:number,texture?:PixelTexture):SpriteLayer {
  const samples=rings.flat(),count=rings[0].length,faces:SpriteLayer['faces']=[];
  const face=(points:number[])=>faces.push({points,color,texture,unlit:!!texture,uv:texture?points.map(i=>({u:samples[i].u,v:samples[i].v})):undefined});
  for(let ring=0;ring<rings.length-1;ring++)for(let j=0;j<count;j++){
    const next=(j+1)%count,a=ring*count,b=(ring+1)*count;face([a+j,a+next,b+next,b+j]);
  }
  face(Array.from({length:count},(_,i)=>count-1-i));face(Array.from({length:count},(_,i)=>(rings.length-1)*count+i));
  return {id,vertices:samples.map(s=>s.point),faces};
}

const acrossView=(direction:ActorDirection,c:number,s:number)=>direction==='front'?-c:direction==='back'?c:direction==='left'?-s:s;

function limb(id:string,a:Point3,b:Point3,start:readonly[number,number],end:readonly[number,number],texture:PixelTexture,direction:ActorDirection):SpriteLayer {
  const dy=b.y-a.y,dz=b.z-a.z,d=Math.hypot(dy,dz),ny=-dz/d,nz=dy/d;
  const stations=[[-.09,.15],[0,.85],[.2,1.05],[.55,1],[.85,.98],[1,.8],[1.09,.15]] as const;
  return surface(id,stations.map(([t,round])=>Array.from({length:ROUND_SIDES},(_,i)=>{
    const angle=i/ROUND_SIDES*Math.PI*2,c=Math.cos(angle),s=Math.sin(angle),at=Math.max(0,Math.min(1,t));
    const rx=(start[0]+(end[0]-start[0])*at)*round,ry=(start[1]+(end[1]-start[1])*at)*round;
    return {point:{x:a.x+c*rx,y:a.y+dy*t+s*ry*ny,z:a.z+dz*t+s*ry*nz},
      u:(acrossView(direction,c,s)+1)/2*texture.width,v:at*texture.height};
  })),0xffffff,texture);
}

function rounded(id:string,center:Point3,radii:readonly[number,number,number],color:number):SpriteLayer {
  const rings=Array.from({length:7},(_,row)=>{
    const v=row/6,ring=Math.max(.04,Math.sin(v*Math.PI));
    return Array.from({length:ROUND_SIDES},(_,i)=>{const angle=i/ROUND_SIDES*Math.PI*2;
      return {point:{x:center.x+Math.cos(angle)*radii[0]*ring,y:center.y+Math.sin(angle)*radii[1]*ring,z:center.z+Math.cos(v*Math.PI)*radii[2]},u:0,v:0};});
  });
  return surface(id,rings,color);
}

function shoe(side:'left'|'right',foot:FootPose,texture:PixelTexture,direction:ActorDirection,scale:number):SpriteLayer {
  // Rounded heel, close ankle, raised instep and a low tapered toe. The two
  // sole contact endpoints remain at the accepted heel/toe pivots.
  const stations=[[-4,1.1,0,3.5],[-3.2,1.85,0,5.4],[-1.5,2.2,.05,6],[0,2.15,.15,5.4],[2.5,2.3,.15,4.1],[5.2,2.4,0,3.5],[6.9,1.6,0,2.8],[8,.3,0,1.5]] as const;
  const height=Math.max(...stations.map(station=>station[3]));
  const layer=surface(`${side}-foot`,stations.map(([y,width,bottom,top])=>Array.from({length:ROUND_SIDES},(_,i)=>{
    const angle=i/ROUND_SIDES*Math.PI*2,x=Math.cos(angle)*width,z=(bottom+top)/2+Math.sin(angle)*(top-bottom)/2;
    const p=footPoint(foot,y*scale,z*scale);p.x+=x*scale;
    const u=direction==='front'?-x/5+.5:direction==='back'?x/5+.5:direction==='left'?1-(y+4)/12:(y+4)/12;
    return {point:p,u:u*texture.width,v:(1-z/height)*texture.height};
  })),0xffffff,texture);
  for(const face of layer.faces)if(face.uv!.every(p=>p.v>texture.height*.82)){face.texture=undefined;face.color=0x39251f;face.unlit=false;}
  return layer;
}

function lantern(weapon:WeaponPose,source:PixelTexture,direction:ActorDirection):SpriteLayer[]{
  const regions:Record<ActorDirection,readonly[number,number,number,number,number,number]>={front:[22,42,11,17,27,40],left:[28,45,7,14,31,42],right:[44,43,10,16,47,40],back:[46,43,11,16,51,41]};
  const [x,y,width,height,gx,gy]=regions[direction],texture={...source,pixels:new Uint8ClampedArray(source.pixels)};
  for(let row=0;row<80;row++)for(let col=0;col<80;col++){
    const at=(row*80+col)*4,r=texture.pixels[at],g=texture.pixels[at+1],b=texture.pixels[at+2];
    const warm=r>g*1.08&&r<g*3.5&&g>b*1.05,dark=Math.max(r,g,b)<40;
    if(col<x||col>=x+width||row<y||row>=y+height||(!warm&&!dark))texture.pixels[at+3]=0;
  }
  const grip=project(weapon.grip,direction),depth=orient(weapon.grip,direction).y;
  const mesh=decal('right-weapon',texture,[x,y,width,height],0,depth,direction),c=Math.cos(weapon.pitch),s=Math.sin(weapon.pitch);
  mesh.vertices=[[x,y],[x+width,y],[x+width,y+height],[x,y+height]].map(([sx,sy])=>{
    const p=viewPoint(grip.x+sx-gx,grip.y+sy-gy,depth,direction),dy=p.y-weapon.grip.y,dz=p.z-weapon.grip.z;
    return {x:p.x,y:weapon.grip.y+dy*c-dz*s,z:weapon.grip.z+dy*s+dz*c};
  });
  return [mesh];
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
  // Native Nell has tall boots below the knee, rather than full-length trousers.
  const layers:SpriteLayer[]=[];
  for(const side of ['left','right'] as const){
    const leg=pose[side],arm=pose.arms[side],inside=side==='right'?-1:1;
    layers.push(limb(`${side}-thigh`,leg.hip,leg.knee,[2.8,2.6],[1.9,1.9],trousers,direction),
      limb(`${side}-shin`,leg.knee,leg.ankle,[1.95,1.85],[1.7,1.55],boot,direction),shoe(side,leg.foot,boot,direction,pose.proportions.footScale),
      limb(`${side}-upper-arm`,arm.shoulder,arm.elbow,[2.1,2.05],[1.6,1.55],sleeve,direction),
      limb(`${side}-forearm`,arm.elbow,arm.wrist,[1.65,1.55],[1.2,1.15],sleeve,direction),
      rounded(`${side}-hand`,arm.grip,[1.45,1.3,1.65],0xc59a68),
      rounded(`${side}-hand`,{x:arm.grip.x+inside*1.1,y:arm.grip.y+.7,z:arm.grip.z+.2},[.65,.75,.85],0xb38758));
  }
  const dy=NELL_PROPORTIONS.hipHeight-pose.hipHeight,bodyRect:readonly[number,number,number,number]=direction==='front'||direction==='back'?[33,27,14,22]:[34,27,12,22];
  layers.push(decal('torso',source,bodyRect,dy,4,direction),decal('head',head,[20,0,40,43],dy,7,direction));
  layers.push(...lantern(pose.weapon!,source,direction));
  return layers;
}
export const renderNell=(frame:number,direction:ActorDirection,textures:NellTextures)=>renderLayers(nellLayers(nellFrame(frame),direction,textures),direction);
