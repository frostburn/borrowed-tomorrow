import type { ActorDirection } from '../content/actors';
import { orient, project } from './actor-space';
import { patch, surface, acrossView, ROUND_SIDES, viewPoint, decal, limb, rounded, pelvis, trouserLeg, shoe, type CharacterTextures } from './actor-skin';
import { renderLayers, type PixelTexture, type SpriteLayer } from './layered-sprite';
import { armToGrip, referenceRig, type ReferencePose, type WeaponPose } from './reference-rig';
import { ORRIN_PROPORTIONS, type RigProportions } from './rig-proportions';
import { REFERENCE_FRAMES } from './walk-cycle';

/** Orrin carries his native downward-pointing tool, with only a small gait swing. */
export function orrinPose(phase:number,config:Readonly<RigProportions>=ORRIN_PROPORTIONS):ReferencePose {
  const pose=referenceRig(phase,'lance',config);
  const shoulder=pose.arms.right.shoulder,grip={...pose.arms.right.grip,z:pose.arms.right.grip.z-3};
  pose.arms.right=armToGrip(shoulder,grip,config);pose.weapon!.grip=pose.arms.right.grip;
  pose.weapon!.pitch=2*Math.sin(pose.phase*2*Math.PI)*Math.PI/180;
  return pose;
}
export const orrinFrame=(frame:number,config:Readonly<RigProportions>=ORRIN_PROPORTIONS)=>orrinPose(frame/REFERENCE_FRAMES,config);

function glove(side:'left'|'right',pose:ReferencePose,texture:PixelTexture,direction:ActorDirection):SpriteLayer {
  const grip=pose.arms[side].grip,scale=pose.proportions.armWidth;
  return surface(`${side}-hand`,Array.from({length:7},(_,row)=>{
    const v=row/6,ring=Math.max(.04,Math.sin(v*Math.PI));
    return Array.from({length:ROUND_SIDES},(_,i)=>{
      const angle=i/ROUND_SIDES*Math.PI*2,c=Math.cos(angle),s=Math.sin(angle);
      return {point:{x:grip.x+c*2.7*ring*scale,y:grip.y+s*2.3*ring*scale,z:grip.z+Math.cos(v*Math.PI)*2.8*scale},
        u:(acrossView(direction,c,s)+1)/2*texture.width,v:v*texture.height};
    });
  }),0xffffff,texture);
}

/** Overalls fill the volume behind moving sleeves and join the continuous seat. */
function body(pose:ReferencePose,texture:PixelTexture,direction:ActorDirection):SpriteLayer {
  const rings=[[3,8.5,4.5],[7,10,5.6],[13,10.1,5.4],[17,8.8,4.5]] as const;
  return surface('torso',rings.map(([z,width,depth],row)=>Array.from({length:ROUND_SIDES},(_,i)=>{
    const angle=i/ROUND_SIDES*Math.PI*2,c=Math.cos(angle),s=Math.sin(angle);
    return {point:{x:c*width,y:s*depth,z:pose.hipHeight+z},u:(acrossView(direction,c,s)+1)/2*texture.width,v:(1-row/(rings.length-1))*texture.height};
  })),0xffffff,texture);
}

/** Registered directional cutouts; the partly hidden left nozzle is never mirrored. */
function lance(weapon:WeaponPose,source:PixelTexture,direction:ActorDirection):SpriteLayer {
  const regions:Record<ActorDirection,readonly[number,number,number,number,number,number]>={
    front:[21,43,11,20,27,41],left:[22,44,13,10,31,43],right:[47,42,11,20,46,42],back:[51,43,8,21,52,42],
  };
  const [x,y,width,height,gx,gy]=regions[direction],texture={...source,pixels:new Uint8ClampedArray(source.pixels)};
  const spans:Record<ActorDirection,readonly (readonly[number,number,number,number])[]>={
    front:[[43,48,25,29],[48,57,21,30],[57,63,21,28]],
    left:[[44,47,30,35],[47,50,26,34],[50,54,22,30]],
    right:[[42,46,47,52],[46,55,47,57],[55,62,51,58]],
    back:[[43,48,51,57],[48,59,51,59],[59,64,53,59]],
  };
  for(let row=0;row<80;row++)for(let col=0;col<80;col++)
    if(!spans[direction].some(([top,bottom,left,right])=>row>=top&&row<bottom&&col>=left&&col<right))texture.pixels[(row*80+col)*4+3]=0;
  const grip=project(weapon.grip,direction),depth=orient(weapon.grip,direction).y,c=Math.cos(weapon.pitch),s=Math.sin(weapon.pitch);
  const mesh=decal('right-weapon',texture,[x,y,width,height],0,depth,direction);
  mesh.vertices=[[x,y],[x+width,y],[x+width,y+height],[x,y+height]].map(([sx,sy])=>{
    const p=viewPoint(grip.x+sx-gx,grip.y+sy-gy,depth,direction),dy=p.y-weapon.grip.y,dz=p.z-weapon.grip.z;
    return {x:p.x,y:weapon.grip.y+dy*c-dz*s,z:weapon.grip.z+dy*s+dz*c};
  });
  return mesh;
}

export function orrinLayers(pose:ReferencePose,direction:ActorDirection,textures:CharacterTextures):SpriteLayer[]{
  const source=textures[direction],head={...source,pixels:new Uint8ClampedArray(source.pixels)},torso={...source,pixels:new Uint8ClampedArray(source.pixels)};
  for(let y=0;y<80;y++)for(let x=0;x<80;x++){
    const at=(y*80+x)*4;
    const lowerHead=direction==='front'?y<33&&x>=31&&x<50:direction==='left'?y<30&&x>=32&&x<41:direction==='right'?y<30&&x>=39&&x<48:y<28&&x>=34&&x<47;
    if(y>=25&&!lowerHead)head.pixels[at+3]=0;
    const oldArm=direction==='left'&&x>=39&&x<48&&y>=31&&y<49
      ||direction==='right'&&x>=32&&x<43&&y>=31&&y<40
      ||direction==='right'&&x>=35&&x<47&&y>=40&&y<49
      ||direction==='left'&&y>=46&&x<35
      ||(direction==='front'||direction==='back')&&y>=31&&(x<31||x>=51)
      ||direction==='right'&&y>=42&&x>=47;
    if(oldArm)torso.pixels[at+3]=0;
  }
  const sleeveRects:Record<ActorDirection,readonly[number,number,number,number]>={front:[27,27,5,13],left:[42,27,5,13],right:[34,27,5,13],back:[27,27,5,13]};
  const gloveRects:Record<ActorDirection,readonly[number,number,number,number]>={front:[51,40,5,7],left:[42,41,6,7],right:[37,41,6,7],back:[25,40,6,7]};
  const sleeve=patch(source,...sleeveRects[direction],(r,g,b)=>r>110&&g>70&&b>30&&r>g*.95&&r<g*1.9);
  const gloves=patch(source,...gloveRects[direction],(r,g,b)=>r>35&&r<160&&r>g*1.2&&g>b*1.1);
  const trousers=patch(source,33,43,15,14,(r,g,b)=>r<g*1.4&&b>r*.85);
  const boot=patch(source,39,60,7,7,(r,g,b)=>r>g*1.15&&g>b*1.1&&r>35);
  const bib=patch(source,35,30,10,10,(r,g,b)=>r<g*1.4&&b>r*.85);
  const layers:SpriteLayer[]=[body(pose,bib,direction),pelvis(pose,trousers,direction)];
  for(const side of ['left','right'] as const){
    const leg=pose[side],arm=pose.arms[side],{armWidth,legWidth}=pose.proportions,inside=side==='right'?-1:1;
    layers.push(trouserLeg(side,pose,trousers,direction),
      limb(`${side}-shin`,leg.knee,leg.ankle,[3.2,2.8],[2.8,2.4],boot,direction,legWidth),shoe(side,leg.foot,boot,direction,pose.proportions.footScale,legWidth),
      limb(`${side}-upper-arm`,arm.shoulder,arm.elbow,[3.6,3.3],[3.1,2.8],sleeve,direction,armWidth),
      limb(`${side}-forearm`,arm.elbow,arm.wrist,[3.1,2.8],[2.4,2.2],gloves,direction,armWidth),glove(side,pose,gloves,direction),
      rounded(`${side}-hand`,{x:arm.grip.x+inside*2*armWidth,y:arm.grip.y+.8,z:arm.grip.z+.2},[1,1.2,1.4],0x745033,armWidth));
  }
  const dy=ORRIN_PROPORTIONS.hipHeight-pose.hipHeight,profile=direction==='left'||direction==='right';
  const rect:readonly[number,number,number,number]=[25,25,30,24];
  layers.push(decal('torso',torso,rect,dy,profile?11:6,direction),decal('head',head,[20,0,40,34],dy,profile?12:8,direction),lance(pose.weapon!,source,direction));
  return layers;
}
export const renderOrrin=(frame:number,direction:ActorDirection,textures:CharacterTextures)=>renderLayers(orrinLayers(orrinFrame(frame),direction,textures),direction);
