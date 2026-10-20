import type { ActorDirection } from '../content/actors';
import { cutout, garment, type ArmSkin, type Span } from './actor-garment';
import { orient, project, type Point3 } from './actor-space';
import { patch, surface, ROUND_SIDES, viewPoint, decal, limb, pelvis, trouserLeg, shoe, type CharacterTextures } from './actor-skin';
import { renderLayers, type PixelTexture, type SpriteLayer } from './layered-sprite';
import { armToGrip, referenceRig, weaponPoint, type ReferencePose, type WeaponPose } from './reference-rig';
import { KIT_PROPORTIONS, type RigProportions } from './rig-proportions';
import { ANKLE_HEIGHT, FOOT_HEEL, FOOT_TOE, footPoint, REFERENCE_FRAMES } from './walk-cycle';

// Register the independently drawn views at their own native waist. The left
// profile's legs sit forward of the full seat; the other profile keeps its bind.
const LOWER_ROOTS:Record<ActorDirection,Readonly<{x:number;y:number}>>={
  front:{x:.5,y:-4},left:{x:-.5,y:-2},right:{x:-.5,y:-4},back:{x:-.5,y:-4},
};
const CARRY_PITCH=-65*Math.PI/180;
const lowerRoot=(pose:ReferencePose)=>({x:(pose.left.hip.x+pose.right.hip.x)/2,y:(pose.left.hip.y+pose.right.hip.y)/2});
export type KitAttackPhase='windup'|'contact';
export interface KitPose extends ReferencePose {
  action?:KitAttackPhase;
  satchel:{anchor:Point3;pitch:number};
}

/** A compact courier, carrying the crossbow low in his anatomical right hand. */
export function kitPose(phase:number,config:Readonly<RigProportions>=KIT_PROPORTIONS,direction:ActorDirection='front'):KitPose {
  const pose=referenceRig(phase,'crossbow',config),root=LOWER_ROOTS[direction];
  for(const side of ['left','right'] as const)for(const point of [pose[side].hip,pose[side].knee,pose[side].ankle,pose[side].foot.origin,pose[side].foot.heel,pose[side].foot.toe]){
    point.x+=root.x;point.y+=root.y;
  }
  return {...pose,satchel:{anchor:{x:-8,y:-2,z:pose.hipHeight+3},pitch:2*Math.sin(pose.phase*2*Math.PI)*Math.PI/180}};
}
export const kitFrame=(frame:number,config:Readonly<RigProportions>=KIT_PROPORTIONS,direction:ActorDirection='front')=>kitPose(frame/REFERENCE_FRAMES,config,direction);

/** Raise, brace, then release. The right hand holds the trigger while the left
 * reaches across to support the stock; both feet stay planted through contact. */
export function kitAttackPose(phase:KitAttackPhase,config:Readonly<RigProportions>=KIT_PROPORTIONS,direction:ActorDirection='front'):KitPose {
  const pose=kitPose(0,config,direction),contact=phase==='contact',root=lowerRoot(pose);pose.hipHeight=config.hipHeight-.5;
  for(const side of ['left','right'] as const){
    const leg=pose[side],transform={origin:{x:leg.hip.x,y:root.y+(side==='left'?5:-5),z:0},pitch:0};
    leg.foot={...transform,heel:footPoint(transform,FOOT_HEEL*config.footScale,0),toe:footPoint(transform,FOOT_TOE*config.footScale,0),contact:'sole'};
    leg.planted=true;leg.phase=0;leg.hip={...leg.hip,z:pose.hipHeight};leg.ankle=footPoint(leg.foot,0,ANKLE_HEIGHT*config.footScale);
    const dy=leg.ankle.y-leg.hip.y,dz=leg.ankle.z-leg.hip.z,d=Math.hypot(dy,dz);
    if(d>config.legLength*2)throw new RangeError('Legs cannot reach the attack stance.');
    const bend=Math.sqrt(Math.max(0,config.legLength**2-d*d/4));
    leg.knee={x:leg.hip.x,y:leg.hip.y+dy/2-dz/d*bend,z:(leg.hip.z+leg.ankle.z)/2+dy/d*bend};
    const right=side==='right',shoulder={x:pose.arms[side].shoulder.x,y:0,z:pose.hipHeight+config.shoulderHeight};
    const reach=(config.upperArmLength+config.forearmLength)/14.5;
    const grip={x:(right?5:1)*config.shoulderHalfWidth/9,y:(right?(contact?10:7):(contact?8:5))*reach,z:shoulder.z-(right?(contact?6:9):(contact?7:9.5))};
    pose.arms[side]=armToGrip(shoulder,grip,config);
  }
  pose.weapon={...pose.weapon!,grip:pose.arms.right.grip,pitch:(contact?0:-15)*Math.PI/180};
  pose.satchel={anchor:{...pose.satchel.anchor,z:pose.hipHeight+3},pitch:0};
  return {...pose,action:phase};
}

function kitBind():KitPose {
  const pose=kitPose(.25),rise=pose.hipHeight-KIT_PROPORTIONS.hipHeight;
  for(const arm of Object.values(pose.arms))for(const point of [arm.shoulder,arm.elbow,arm.wrist,arm.grip])point.z-=rise;
  pose.satchel.anchor.z-=rise;
  return pose;
}

// Half-open source spans. The native rolled cuffs, bare forearms and gloves
// articulate separately; no profile is flipped and no near arm is duplicated.
const ARM_SKINS:Record<ActorDirection,Record<'left'|'right',ArmSkin>>={
  front:{
    right:{shoulder:[33,30],elbow:[31,37],wrist:[31,42],grip:[29,44],sleeve:[[28,31,32,36],[31,34,31,36],[34,37,30,35]],cuff:[[37,40,29,35],[40,42,29,34]],hand:[[42,44,28,33],[44,47,28,32]]},
    left:{shoulder:[49,30],elbow:[52,37],wrist:[52,42],grip:[52,45],sleeve:[[28,31,47,51],[31,35,48,53],[35,37,49,55]],cuff:[[37,42,50,55]],hand:[[42,47,51,55]]},
  },
  left:{
    right:{shoulder:[36,31],elbow:[35,37],wrist:[34,41],grip:[33,44],sleeve:[[29,33,35,38],[33,36,34,37]],cuff:[[36,40,33,36]],hand:[[40,44,32,35]]},
    left:{shoulder:[43,31],elbow:[43,38],wrist:[43,43],grip:[43,45],sleeve:[[29,32,40,45],[32,35,40,46],[35,37,40,46]],cuff:[[37,40,40,46],[40,43,41,45]],hand:[[43,47,40,46]]},
  },
  right:{
    left:{shoulder:[43,31],elbow:[44,37],wrist:[44,41],grip:[44,44],sleeve:[[29,33,42,45],[33,36,43,46]],cuff:[[36,40,43,46]],hand:[[40,44,43,46]]},
    right:{shoulder:[36,31],elbow:[36,38],wrist:[37,42],grip:[38,45],sleeve:[[29,32,33,38],[32,35,33,39],[35,37,33,40]],cuff:[[37,40,33,40],[40,42,34,40]],hand:[[42,46,35,41]]},
  },
  back:{
    left:{shoulder:[31,30],elbow:[29,37],wrist:[29,42],grip:[29,44],sleeve:[[28,31,30,34],[31,34,28,34],[34,37,27,34]],cuff:[[37,40,27,33],[40,42,28,33]],hand:[[42,47,27,32]]},
    right:{shoulder:[47,30],elbow:[50,37],wrist:[51,41],grip:[51,44],sleeve:[[28,31,45,50],[31,34,46,51],[34,37,47,53]],cuff:[[37,40,49,54],[40,42,50,54]],hand:[[42,46,50,54]]},
  },
};
const BAG_SPANS:Record<ActorDirection,readonly Span[]>={
  front:[[42,46,48,51],[46,50,48,53],[50,53,48,51]],
  left:[[39,42,46,50],[42,47,46,52],[47,49,45,50]],
  right:[[40,44,29,33],[44,48,29,32]],
  back:[[41,45,31,36],[45,50,30,36],[47,51,31,35]],
};
const BOW_SPANS:Record<ActorDirection,readonly Span[]>={
  front:[[43,47,25,29],[47,51,23,29],[51,54,22,32],[54,57,23,27]],
  left:[[43,46,31,35],[46,49,29,34]],
  right:[[43,47,42,46],[47,50,41,48],[50,53,41,50],[53,57,43,48]],
  back:[[44,48,53,55],[48,52,51,56],[52,56,50,56],[56,58,52,55]],
};
const TORSO_SPANS:Record<ActorDirection,readonly Span[]>={
  front:[[26,28,33,49],[28,36,35,49],[36,41,34,50],[41,44,34,49]],
  left:[[26,29,34,46],[29,39,35,41],[39,44,35,46]],
  right:[[26,29,32,44],[29,39,39,44],[39,44,33,44]],
  back:[[26,29,30,48],[29,39,34,47],[39,44,33,48]],
};

function arms(pose:KitPose,source:PixelTexture,direction:ActorDirection):SpriteLayer[]{
  const bind=kitBind(),layers:SpriteLayer[]=[];
  const sleeve=patch(source,27,28,28,9,(r,g,b)=>b>r&&b>g*.9);
  const skin=patch(source,27,37,28,5,(r,g,b)=>r>g*1.1&&g>b*1.15&&r>100);
  const glove=patch(source,27,42,28,5,(r,g,b)=>r>g*1.2&&g>b*1.1&&r>24&&r<170);
  const bindGrip=project(bind.arms.right.grip,direction),gripArt=ARM_SKINS[direction].right.grip;
  const socket={x:gripArt[0]-bindGrip.x,y:gripArt[1]-bindGrip.y};
  for(const side of ['left','right'] as const){
    const art=ARM_SKINS[direction][side],arm=pose.arms[side],rest=bind.arms[side];
    const registered=(joint:'shoulder'|'elbow'|'wrist'|'grip')=>{
      const p=project(arm[joint],direction),b=project(rest[joint],direction),s=art[joint];
      // Both aiming hands share the weapon's native socket. Blending from the
      // fixed shoulder to that socket avoids two independent idle-hand offsets
      // pulling the support hand away from the crossbow in one profile.
      const blend=pose.action?(joint==='shoulder'?0:joint==='elbow'?.5:1):0;
      return viewPoint(p.x+(s[0]-b.x)*(1-blend)+socket.x*blend,p.y+(s[1]-b.y)*(1-blend)+socket.y*blend,orient(arm[joint],direction).y+1.5,direction);
    };
    const garmentPoint=(joint:'shoulder'|'elbow'|'wrist'|'grip')=>{
      const p=project(registered(joint),direction);
      return viewPoint(p.x,p.y,orient(arm[joint],direction).y,direction);
    };
    const bindPoint=(joint:'shoulder'|'elbow'|'wrist'|'grip')=>viewPoint(...art[joint],orient(rest[joint],direction).y,direction);
    const segment=(id:string,spans:readonly Span[],a:'shoulder'|'elbow'|'wrist',b:'elbow'|'wrist'|'grip')=>
      garment(id,source,spans,art[a],art[b],pose.action?garmentPoint(a):arm[a],pose.action?garmentPoint(b):arm[b],pose.action?bindPoint(a):rest[a],pose.action?bindPoint(b):rest[b],direction,pose.proportions.armWidth);
    // Native cutouts retain the rolled cuffs and directional shading. Rounded
    // backing keeps foreshortened, cross-body arms solid in front/back views.
    layers.push(armShell(`${side}-upper-arm`,registered('shoulder'),registered('elbow'),2.1*pose.proportions.armWidth,sleeve,direction),
      armShell(`${side}-forearm`,registered('elbow'),registered('wrist'),1.65*pose.proportions.armWidth,skin,direction),
      armShell(`${side}-hand`,registered('wrist'),registered('grip'),1.7*pose.proportions.armWidth,glove,direction),
      segment(`${side}-upper-arm`,art.sleeve,'shoulder','elbow'),segment(`${side}-forearm`,art.cuff,'elbow','wrist'),segment(`${side}-hand`,art.hand,'wrist','grip'));
  }
  return layers;
}

/** Full three-dimensional sleeves can bend across the chest, rather than
 * collapsing a view-facing cutout to a line when aiming toward the camera. */
function armShell(id:string,a:Point3,b:Point3,radius:number,texture:PixelTexture,direction:ActorDirection):SpriteLayer {
  const dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z,length=Math.hypot(dx,dy,dz),d={x:dx/length,y:dy/length,z:dz/length};
  const side=Math.hypot(d.z,d.x),u=side?{x:d.z/side,y:0,z:-d.x/side}:{x:1,y:0,z:0};
  const v={x:d.y*u.z-d.z*u.y,y:d.z*u.x-d.x*u.z,z:d.x*u.y-d.y*u.x};
  const layer=surface(id,[[-.16,.2],[0,.9],[.3,1],[.8,.9],[1, .8],[1.18,.15]].map(([t,round])=>Array.from({length:ROUND_SIDES},(_,i)=>{
    const c=Math.cos(i/ROUND_SIDES*Math.PI*2)*radius*round,s=Math.sin(i/ROUND_SIDES*Math.PI*2)*radius*round;
    return {point:{x:a.x+dx*t+u.x*c+v.x*s,y:a.y+dy*t+u.y*c+v.y*s,z:a.z+dz*t+u.z*c+v.z*s},u:0,v:0};
  })),0xffffff,texture);
  const top=project(a,direction),bottom=project(b,direction);
  for(const face of layer.faces)face.uv=face.points.map(i=>{const p=project(layer.vertices[i],direction);return {u:(p.x-(top.x+bottom.x)/2)/(radius*2)*texture.width+texture.width/2,v:(p.y-Math.min(top.y,bottom.y))/Math.max(2,Math.abs(top.y-bottom.y))*texture.height};});
  return layer;
}

function cloth(layer:SpriteLayer,pose:KitPose,texture:PixelTexture,direction:ActorDirection):SpriteLayer {
  const centre=project({...lowerRoot(pose),z:pose.hipHeight},direction),profile=direction==='left'||direction==='right';
  const width=profile?(direction==='left'?12:10)*pose.proportions.legWidth/.95:2*(pose.proportions.hipHalfWidth+4.2*pose.proportions.legWidth);
  for(const face of layer.faces){face.texture=texture;face.unlit=true;face.uv=face.points.map(i=>{
    const p=project(layer.vertices[i],direction);return {u:(p.x-centre.x+width/2)/width*texture.width,v:(p.y-centre.y+5)/(pose.proportions.legLength+6)*texture.height};
  });}
  return layer;
}

function body(pose:KitPose,texture:PixelTexture,trousers:PixelTexture,direction:ActorDirection):SpriteLayer {
  const root=lowerRoot(pose);
  const layer=surface('torso',[[4,6.4,3.3],[8,7.2,4],[13,7.5,3.7],[16,6.5,3]].map(([z,w,d])=>Array.from({length:ROUND_SIDES},(_,i)=>{
    const c=Math.cos(i/ROUND_SIDES*Math.PI*2),s=Math.sin(i/ROUND_SIDES*Math.PI*2),lower=Math.max(0,1-(z-4)/12);
    return {point:{x:c*w+root.x*lower,y:s*d+root.y*lower,z:pose.hipHeight+z},u:0,v:0};
  })),0xffffff,texture);
  const dy=KIT_PROPORTIONS.hipHeight-pose.hipHeight;
  // Sample the native torso in its own projected field. Wrapping a small blue
  // swatch around every ring had magnified its darkest row into a false hole.
  for(const face of layer.faces)face.uv=face.points.map(index=>{
    const p=project(layer.vertices[index],direction);return {u:p.x-27,v:p.y-dy-26};
  });
  // Below the native belt, use the seat's continuous brown fabric rather
  // than extending a dark blue jacket swatch into a false gap at the hips.
  const lower=cloth({...layer,faces:layer.faces.map(face=>({...face}))},pose,trousers,direction);
  layer.faces.forEach((face,i)=>{
    if(face.points.some(index=>layer.vertices[index].z<=pose.hipHeight+7)){
      face.texture=trousers;face.uv=lower.faces[i].uv;
    }
  });
  return layer;
}

function satchel(pose:KitPose,source:PixelTexture,direction:ActorDirection):SpriteLayer {
  const spans=BAG_SPANS[direction],left=Math.min(...spans.map(s=>s[2])),right=Math.max(...spans.map(s=>s[3])),top=Math.min(...spans.map(s=>s[0])),bottom=Math.max(...spans.map(s=>s[1]));
  const anchor=project(pose.satchel.anchor,direction),rest=project(kitBind().satchel.anchor,direction),depth=orient(pose.satchel.anchor,direction).y+4;
  const mesh=decal('satchel',cutout(source,spans),[left,top,right-left,bottom-top],0,depth,direction),pivot=viewPoint((left+right)/2+anchor.x-rest.x,top+anchor.y-rest.y,depth,direction);
  const c=Math.cos(pose.satchel.pitch),s=Math.sin(pose.satchel.pitch);
  mesh.vertices=mesh.vertices.map(p=>{
    const q={...p,z:p.z-(anchor.y-rest.y)},y=q.y-pivot.y,z=q.z-pivot.z;
    return {x:q.x,y:pivot.y+y*c-z*s,z:pivot.z+y*s+z*c};
  });
  return mesh;
}

/** Four independent native carry skins stay mounted to the right grip. */
function crossbow(weapon:WeaponPose,textures:CharacterTextures,direction:ActorDirection):SpriteLayer {
  const spans=BOW_SPANS[direction],texture=cutout(textures[direction],spans);
  const left=Math.min(...spans.map(s=>s[2])),right=Math.max(...spans.map(s=>s[3])),top=Math.min(...spans.map(s=>s[0])),bottom=Math.max(...spans.map(s=>s[1]));
  const grips={front:[29,44],left:[33,44],right:[38,45],back:[51,44]} as const;
  const [gx,gy]=grips[direction],actual=project(weapon.grip,direction),rest=project(kitBind().arms.right.grip,direction),depth=orient(weapon.grip,direction).y+4;
  const pivot=viewPoint(gx+actual.x-rest.x,gy+actual.y-rest.y,depth,direction),angle=weapon.pitch-CARRY_PITCH,c=Math.cos(angle),s=Math.sin(angle);
  const mesh=decal('right-weapon',texture,[left,top,right-left,bottom-top],0,depth,direction);
  mesh.vertices=[[left,top],[right,top],[right,bottom],[left,bottom]].map(([x,y])=>{
    const p=viewPoint(x+actual.x-rest.x,y+actual.y-rest.y,depth,direction),dy=p.y-pivot.y,dz=p.z-pivot.z;
    return {x:p.x,y:pivot.y+dy*c-dz*s,z:pivot.z+dy*s+dz*c};
  });
  return mesh;
}

/** Aimed views expose the bow's span and stock. Native wood/steel samples keep
 * its small carved silhouette readable when the carried cutout is foreshortened. */
function aimedCrossbow(weapon:WeaponPose,source:PixelTexture,direction:ActorDirection):SpriteLayer[] {
  const grip=project(weapon.grip,direction),rest=project(kitBind().arms.right.grip,direction),art=ARM_SKINS[direction].right.grip;
  weapon={...weapon,grip:viewPoint(grip.x+art[0]-rest.x,grip.y+art[1]-rest.y,orient(weapon.grip,direction).y,direction)};
  const wood=patch(source,22,44,11,13,(r,g,b)=>r>g*1.2&&g>b*1.1&&r>35);
  const part=(a:Point3,b:Point3,radius:number)=>armShell('right-weapon',weaponPoint(weapon,a.y,a.z,a.x),weaponPoint(weapon,b.y,b.z,b.x),radius,wood,direction);
  const layers=[part({x:0,y:-4,z:0},{x:0,y:12,z:0},1.2),part({x:0,y:0,z:-3},{x:0,y:0,z:0},1)];
  for(const sign of [-1,1]){
    layers.push(part({x:0,y:9,z:.1},{x:sign*5,y:9,z:.1},.85),part({x:sign*5,y:9,z:.1},{x:sign*7,y:7,z:.1},.65));
    const a=weaponPoint(weapon,7,0,sign*7),b=weaponPoint(weapon,1,0,0),r=.25;
    const mesh:SpriteLayer={id:'right-weapon',vertices:[{...a,z:a.z-r},{...b,z:b.z-r},{...b,z:b.z+r},{...a,z:a.z+r}],faces:[{points:[0,1,2,3],color:0xa9956b,unlit:true}]};
    layers.push(mesh);
  }
  return layers;
}

export function kitLayers(pose:KitPose,direction:ActorDirection,textures:CharacterTextures):SpriteLayer[]{
  const source=textures[direction],head={...source,pixels:new Uint8ClampedArray(source.pixels)},torso={...source,pixels:new Uint8ClampedArray(source.pixels)};
  const remove=[...Object.values(ARM_SKINS[direction]).flatMap(s=>[...s.sleeve,...s.cuff,...s.hand]),...BAG_SPANS[direction],...BOW_SPANS[direction]];
  for(let y=0;y<80;y++)for(let x=0;x<80;x++){
    const at=(y*80+x)*4;
    if(y>=26)head.pixels[at+3]=0;
    if(!TORSO_SPANS[direction].some(([t,b,l,r])=>y>=t&&y<b&&x>=l&&x<r)||remove.some(([t,b,l,r])=>y>=t&&y<b&&x>=l&&x<r))torso.pixels[at+3]=0;
  }
  const regions:Record<ActorDirection,readonly[number,number,number,number]>={front:[34,44,15,12],left:[38,46,10,9],right:[31,46,10,9],back:[31,44,15,12]} as const;
  const trousers=patch(source,...regions[direction],(r,g,b)=>r>g*1.15&&g>b*1.05&&r>24);
  const boots:Record<ActorDirection,readonly[number,number,number,number]>={front:[35,56,6,11],left:[40,56,6,11],right:[34,56,6,11],back:[31,56,6,11]} as const;
  const boot=patch(source,...boots[direction],(r,g,b)=>r>g*1.25&&g>b*1.1&&r>24);
  const jacket=patch(torso,27,26,29,18,()=>true),root=lowerRoot(pose);
  const seat=pelvis(pose,trousers,direction);for(const p of seat.vertices){
    // Keep the left profile's native rear fullness while bringing the legs
    // under the belly. Moving the complete seat would cut away his backside.
    if(direction==='left'&&p.y<0)p.y*=1.5;
    p.x+=root.x;p.y+=root.y;
  }
  const layers:SpriteLayer[]=[body(pose,jacket,trousers,direction),cloth(seat,pose,trousers,direction)];
  for(const side of ['left','right'] as const){
    const leg=pose[side],width=pose.proportions.legWidth,parts=[cloth(trouserLeg(side,pose,trousers,direction),pose,trousers,direction),
      limb(`${side}-shin`,leg.knee,leg.ankle,[2.8,2.5],[2.4,2.1],boot,direction,width),shoe(side,leg.foot,boot,direction,pose.proportions.footScale,width*1.1)];
    if(pose.action)for(const part of parts)part.contour={group:`${side}-leg`,color:0x201711,priority:orient(leg.foot.origin,direction).y};
    layers.push(...parts);
  }
  const dy=KIT_PROPORTIONS.hipHeight-pose.hipHeight,profile=direction==='left'||direction==='right';
  layers.push(decal('torso',torso,[27,26,29,18],dy,profile?8:5,direction),decal('head',head,[24,0,33,26],dy,profile?10:8,direction),satchel(pose,source,direction),...arms(pose,source,direction),...(pose.action?aimedCrossbow(pose.weapon!,textures.front,direction):[crossbow(pose.weapon!,textures,direction)]));
  return layers;
}
export const renderKit=(frame:number,direction:ActorDirection,textures:CharacterTextures)=>renderLayers(kitLayers(frame<REFERENCE_FRAMES?kitFrame(frame,KIT_PROPORTIONS,direction):kitAttackPose(frame===REFERENCE_FRAMES?'windup':'contact',KIT_PROPORTIONS,direction),direction,textures),direction);
