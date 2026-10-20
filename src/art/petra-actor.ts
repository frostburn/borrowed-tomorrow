import type { ActorDirection } from '../content/actors';
import { cutout, garment, type ArmSkin, type Span } from './actor-garment';
import { orient, project } from './actor-space';
import { patch, surface, ROUND_SIDES, viewPoint, decal, limb, pelvis, trouserLeg, shoe, type CharacterTextures } from './actor-skin';
import { renderLayers, type PixelTexture, type SpriteLayer } from './layered-sprite';
import { armToGrip, referenceRig, type ReferencePose } from './reference-rig';
import { PETRA_PROPORTIONS, type RigProportions } from './rig-proportions';
import { ANKLE_HEIGHT, FOOT_HEEL, FOOT_TOE, footPoint, REFERENCE_FRAMES } from './walk-cycle';

export type PetraAction='saber'|'bash';
export interface PetraPose extends ReferencePose { action?:'windup'|'contact';attack?:PetraAction }
const ROOT={x:-.5,y:-2};

/** Restrained armored gait. Both weapons have anatomical attachments. */
export function petraPose(phase:number,config:Readonly<RigProportions>=PETRA_PROPORTIONS):PetraPose{
  const pose=referenceRig(phase,'saber',config);
  for(const side of ['left','right'] as const)for(const p of [pose[side].hip,pose[side].knee,pose[side].ankle,pose[side].foot.origin,pose[side].foot.heel,pose[side].foot.toe]){p.x+=ROOT.x;p.y+=ROOT.y;}
  return pose;
}
export const petraFrame=(frame:number,config:Readonly<RigProportions>=PETRA_PROPORTIONS)=>petraPose(frame/REFERENCE_FRAMES,config);

/** Saber cuts and shield bashes share two fixed feet, with distinct arm actions. */
export function petraAttackPose(phase:'windup'|'contact',attack:PetraAction='saber',config:Readonly<RigProportions>=PETRA_PROPORTIONS):PetraPose{
  const pose=petraPose(0,config),contact=phase==='contact';pose.hipHeight=config.hipHeight-.5;
  for(const side of ['left','right'] as const){
    const leg=pose[side],transform={origin:{x:leg.hip.x,y:ROOT.y+(side==='left'?4.5:-4.5),z:0},pitch:0};
    leg.foot={...transform,heel:footPoint(transform,FOOT_HEEL*config.footScale,0),toe:footPoint(transform,FOOT_TOE*config.footScale,0),contact:'sole'};
    leg.planted=true;leg.phase=0;leg.hip={...leg.hip,z:pose.hipHeight};leg.ankle=footPoint(leg.foot,0,ANKLE_HEIGHT*config.footScale);
    const dy=leg.ankle.y-leg.hip.y,dz=leg.ankle.z-leg.hip.z,d=Math.hypot(dy,dz);
    if(d>config.legLength*2)throw new RangeError('Legs cannot reach the attack stance.');
    const bend=Math.sqrt(Math.max(0,config.legLength**2-d*d/4));
    leg.knee={x:leg.hip.x,y:leg.hip.y+dy/2-dz/d*bend,z:(leg.hip.z+leg.ankle.z)/2+dy/d*bend};
    const right=side==='right',shoulder={...pose.arms[side].shoulder,z:pose.hipHeight+config.shoulderHeight};
    const grip=attack==='bash'
      ?{x:shoulder.x,y:right?1:contact?11:3,z:shoulder.z-(right?12:8)}
      :{x:right?(contact?config.shoulderHalfWidth*.7:shoulder.x):-config.shoulderHalfWidth*.75,y:right?(contact?10.5:-4):6,z:shoulder.z-(right?(contact?7.5:5):9)};
    pose.arms[side]=armToGrip(shoulder,grip,config);
  }
  pose.weapon={...pose.weapon!,grip:pose.arms.right.grip,pitch:(attack==='bash'?-70:contact?-10:65)*Math.PI/180};
  pose.shield={hand:'left',grip:pose.arms.left.grip,pitch:attack==='bash'&&contact?-.12:0};
  return {...pose,action:phase,attack};
}

function bind():PetraPose{
  const pose=petraPose(.25),rise=pose.hipHeight-PETRA_PROPORTIONS.hipHeight;
  for(const arm of Object.values(pose.arms))for(const p of Object.values(arm))p.z-=rise;
  return pose;
}

const ARMS:Record<ActorDirection,Record<'left'|'right',ArmSkin>>={
  front:{
    right:{shoulder:[31,29],elbow:[28,36],wrist:[27,41],grip:[28,44],sleeve:[[26,30,28,34],[30,34,27,33],[34,37,25,31]],cuff:[[37,41,24,30]],hand:[[41,45,24,31]]},
    left:{shoulder:[48,29],elbow:[51,36],wrist:[52,41],grip:[53,43],sleeve:[[26,30,46,51],[30,35,48,53]],cuff:[[35,41,49,54]],hand:[[41,45,50,54]]},
  },
  left:{
    right:{shoulder:[35,29],elbow:[33,36],wrist:[32,41],grip:[32,44],sleeve:[[27,31,33,37],[31,36,32,36]],cuff:[[36,41,31,35]],hand:[[41,45,30,35]]},
    left:{shoulder:[43,29],elbow:[45,35],wrist:[45,40],grip:[45,43],sleeve:[[25,29,40,46],[29,33,41,47]],cuff:[[33,40,42,48]],hand:[[40,45,42,48]]},
  },
  right:{
    left:{shoulder:[31,29],elbow:[29,35],wrist:[28,40],grip:[28,43],sleeve:[[27,31,29,33],[31,35,27,32]],cuff:[[35,40,26,31]],hand:[[40,45,26,31]]},
    right:{shoulder:[35,29],elbow:[36,36],wrist:[38,41],grip:[40,44],sleeve:[[25,29,33,39],[29,34,32,39],[34,37,33,40]],cuff:[[37,41,34,41]],hand:[[41,45,36,42]]},
  },
  back:{
    left:{shoulder:[31,29],elbow:[29,36],wrist:[28,41],grip:[28,44],sleeve:[[26,30,28,34],[30,36,27,33]],cuff:[[36,41,26,32]],hand:[[41,46,26,32]]},
    right:{shoulder:[48,29],elbow:[51,36],wrist:[52,41],grip:[53,44],sleeve:[[26,30,46,51],[30,34,47,53],[34,37,48,54]],cuff:[[37,41,49,55]],hand:[[41,46,50,56]]},
  },
};
const SHIELDS:Record<ActorDirection,readonly Span[]>={
  front:[[29,32,54,57],[32,48,52,58],[48,51,54,58]],
  left:[[30,33,42,49],[33,37,40,52],[37,47,39,54],[47,51,42,52],[51,53,46,50]],
  right:[[31,34,26,29],[34,48,25,30],[48,51,26,29]],
  back:[[30,33,26,29],[33,49,25,30],[49,53,26,29]],
};
const SABERS:Record<ActorDirection,readonly Span[]>={
  front:[[43,47,26,31],[47,51,25,29],[51,59,24,28],[59,64,22,27]],
  left:[[44,48,30,35],[48,53,29,34],[53,58,27,32]],
  right:[[43,46,38,43],[46,49,40,46],[49,52,43,49],[52,55,46,52],[55,59,49,55],[59,62,52,55]],
  back:[[44,48,53,57],[48,56,53,58],[56,61,55,60],[61,64,56,60]],
};
const TORSO:Record<ActorDirection,readonly Span[]>={
  front:[[26,30,32,47],[30,40,31,50],[40,45,31,51],[45,53,31,51]],
  left:[[25,29,34,43],[29,36,34,45],[36,43,33,46],[43,53,34,47]],
  right:[[25,29,33,42],[29,36,32,44],[36,44,31,44],[44,53,31,45]],
  back:[[26,30,32,48],[30,39,32,49],[39,46,32,50],[46,54,31,50]],
};

function armorArm(pose:PetraPose,source:PixelTexture,direction:ActorDirection):SpriteLayer[]{
  const rest=bind(),pixels={...source,pixels:new Uint8ClampedArray(source.pixels)},layers:SpriteLayer[]=[];
  for(const [top,bottom,left,right] of [...SHIELDS[direction],...SABERS[direction]])for(let y=top;y<bottom;y++)for(let x=left;x<right;x++)pixels.pixels[(y*80+x)*4+3]=0;
  const metal=patch(source,28,26,23,10,(r,g,b)=>r>g*1.15&&g>b*1.25&&g>30);
  const leather=patch(source,26,35,28,10,(r,g,b)=>r>g*1.15&&g>b&&r>25&&r<160);
  for(const side of ['left','right'] as const){
    const art=ARMS[direction][side],arm=pose.arms[side],at=rest.arms[side];
    const registered=(joint:'shoulder'|'elbow'|'wrist'|'grip')=>{
      const p=project(arm[joint],direction),b=project(at[joint],direction),s=art[joint];
      const reach=pose.action&&direction==='right'&&side==='left'?(joint==='shoulder'?0:joint==='elbow'?5:10):0;
      return viewPoint(s[0]+p.x-b.x+reach,s[1]+p.y-b.y,orient(arm[joint],direction).y+3,direction);
    };
    // Rounded armor beneath native cutouts keeps foreshortened limbs solid.
    layers.push(limb(`${side}-upper-arm`,registered('shoulder'),registered('elbow'),[2.1,1.9],[1.8,1.6],metal,direction,pose.proportions.armWidth),
      limb(`${side}-forearm`,registered('elbow'),registered('wrist'),[1.8,1.6],[1.7,1.4],leather,direction,pose.proportions.armWidth));
    for(const [id,spans,a,b] of [[`${side}-upper-arm`,art.sleeve,'shoulder','elbow'],[`${side}-forearm`,art.cuff,'elbow','wrist'],[`${side}-hand`,art.hand,'wrist','grip']] as const)
      layers.push(garment(id,pixels,spans,art[a],art[b],arm[a],arm[b],at[a],at[b],direction,pose.proportions.armWidth));
  }
  return layers;
}

function fabric(layer:SpriteLayer,pose:PetraPose,texture:PixelTexture,direction:ActorDirection):SpriteLayer{
  const centre=project({...ROOT,z:pose.hipHeight},direction),width=direction==='left'||direction==='right'?11:16;
  for(const face of layer.faces){face.texture=texture;face.unlit=true;face.uv=face.points.map(i=>{const p=project(layer.vertices[i],direction);return {u:(p.x-centre.x+width/2)/width*texture.width,v:(p.y-centre.y+4)/14*texture.height};});}
  return layer;
}

/** Native shield cutouts follow the left grip; the round face opens for a brace. */
function shield(pose:PetraPose,textures:CharacterTextures,direction:ActorDirection):SpriteLayer{
  const face=pose.action&&(direction==='front'||direction==='right')?'left':direction,spans=SHIELDS[face];
  const left=Math.min(...spans.map(s=>s[2])),right=Math.max(...spans.map(s=>s[3])),top=Math.min(...spans.map(s=>s[0])),bottom=Math.max(...spans.map(s=>s[1]));
  const actual=project(pose.shield!.grip,direction),rest=project(bind().shield!.grip,direction),anchor=pose.action&&direction==='right'?[38,43]:ARMS[direction].left.grip;
  const offset=face!==direction?{x:anchor[0]-(left+right)/2,y:anchor[1]-(top+bottom)/2}:{x:0,y:0};
  const depth=orient(pose.shield!.grip,direction).y+5,mesh=decal('left-weapon',cutout(textures[face],spans),[left,top,right-left,bottom-top],0,depth,direction);
  mesh.vertices=mesh.vertices.map(p=>{const s=project(p,direction);return viewPoint(s.x+actual.x-rest.x+offset.x,s.y+actual.y-rest.y+offset.y,depth,direction);});
  return mesh;
}

function saber(pose:PetraPose,textures:CharacterTextures,direction:ActorDirection):SpriteLayer{
  const face=pose.action&&direction==='left'?'front':direction,spans=SABERS[face],texture=cutout(textures[face],spans);
  const left=Math.min(...spans.map(s=>s[2])),right=Math.max(...spans.map(s=>s[3])),top=Math.min(...spans.map(s=>s[0])),bottom=Math.max(...spans.map(s=>s[1]));
  const actual=project(pose.arms.right.grip,direction),rest=project(bind().arms.right.grip,direction),art=ARMS[direction].right.grip,source=ARMS[face].right.grip;
  const angles={front:[135,-65],left:[-135,70],right:[-130,-40],back:[-145,65]};
  const angle=(pose.action&&pose.attack==='saber'?angles[direction][pose.action==='contact'?1:0]:2*Math.sin(pose.phase*Math.PI*2))*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle),depth=orient(pose.arms.right.grip,direction).y+4;
  const mesh=decal('right-weapon',texture,[left,top,right-left,bottom-top],0,depth,direction);
  mesh.vertices=[[left,top],[right,top],[right,bottom],[left,bottom]].map(([x,y])=>{
    const dx=x-source[0],dy=y-source[1];return viewPoint(art[0]+actual.x-rest.x+dx*c-dy*s,art[1]+actual.y-rest.y+dx*s+dy*c,depth,direction);
  });
  return mesh;
}

export function petraLayers(pose:PetraPose,direction:ActorDirection,textures:CharacterTextures):SpriteLayer[]{
  const source=textures[direction],head={...source,pixels:new Uint8ClampedArray(source.pixels)},torso={...source,pixels:new Uint8ClampedArray(source.pixels)};
  const remove=[...Object.values(ARMS[direction]).flatMap(a=>[...a.sleeve,...a.cuff,...a.hand]),...SHIELDS[direction],...SABERS[direction]];
  for(let y=0;y<80;y++)for(let x=0;x<80;x++){
    const at=(y*80+x)*4;
    if(y>=26)head.pixels[at+3]=0;
    if(!TORSO[direction].some(([t,b,l,r])=>y>=t&&y<b&&x>=l&&x<r)||remove.some(([t,b,l,r])=>y>=t&&y<b&&x>=l&&x<r))torso.pixels[at+3]=0;
  }
  const cloth=patch(source,33,43,17,12,(r,g,b)=>g>r*.95&&g>b*1.2&&g>15);
  const leather=patch(source,direction==='left'?38:33,56,10,11,(r,g,b)=>r>g*1.12&&g>b&&r>25);
  const seat=pelvis(pose,cloth,direction);for(const p of seat.vertices){p.x+=ROOT.x;p.y+=ROOT.y;}
  const layers:SpriteLayer[]=[fabric(seat,pose,cloth,direction)];
  for(const side of ['left','right'] as const){
    const leg=pose[side],parts=[fabric(trouserLeg(side,pose,cloth,direction),pose,cloth,direction),limb(`${side}-shin`,leg.knee,leg.ankle,[2.6,2.3],[2.2,1.9],leather,direction,pose.proportions.legWidth),shoe(side,leg.foot,leather,direction,pose.proportions.footScale,1.15*pose.proportions.legWidth)];
    for(const part of parts)part.contour={group:`${side}-leg`,color:0x1c1115,priority:orient(leg.foot.origin,direction).y};
    layers.push(...parts);
  }
  const lining=patch(torso,30,27,20,22,()=>true);
  const body=surface('torso',[[4,6.5,3.5],[10,7.3,4],[18,6.6,3]].map(([z,w,d])=>Array.from({length:ROUND_SIDES},(_,i)=>({point:{x:ROOT.x+Math.cos(i/ROUND_SIDES*Math.PI*2)*w,y:ROOT.y+Math.sin(i/ROUND_SIDES*Math.PI*2)*d,z:pose.hipHeight+z},u:0,v:0}))),0xffffff,lining);
  for(const face of body.faces)face.uv=face.points.map(i=>{const p=project(body.vertices[i],direction);return {u:p.x-30,v:p.y-(PETRA_PROPORTIONS.hipHeight-pose.hipHeight)-27};});
  const dy=PETRA_PROPORTIONS.hipHeight-pose.hipHeight,profile=direction==='left'||direction==='right';
  layers.push(body,decal('torso',torso,[25,26,33,28],dy,profile?6:5,direction),decal('head',head,[20,0,40,26],dy,profile?11:8,direction),...armorArm(pose,source,direction),shield(pose,textures,direction),saber(pose,textures,direction));
  return layers;
}
export const renderPetra=(frame:number,direction:ActorDirection,textures:CharacterTextures)=>renderLayers(petraLayers(frame<REFERENCE_FRAMES?petraFrame(frame):petraAttackPose(frame%2===0?'windup':'contact',frame>=8?'bash':'saber'),direction,textures),direction);
