import { cutout, garment, type ArmSkin } from './actor-garment';
import type { ActorDirection } from '../content/actors';
import { orient, project } from './actor-space';
import { patch, surface, acrossView, ROUND_SIDES, viewPoint, decal, limb, pelvis, trouserLeg, shoe, type CharacterTextures } from './actor-skin';
import { renderLayers, type PixelTexture, type SpriteLayer } from './layered-sprite';
import { armToGrip, referenceRig, type ReferencePose, type WeaponPose } from './reference-rig';
import { ORRIN_PROPORTIONS, type RigProportions } from './rig-proportions';
import { ANKLE_HEIGHT, FOOT_HEEL, FOOT_TOE, footPoint, REFERENCE_FRAMES } from './walk-cycle';

// Native waist registration, in the actor's anatomical coordinates.
const LOWER_BODY_ROOT={x:-1.5,y:-4};
export interface OrrinPose extends ReferencePose { action?:'windup'|'contact' }

/** Orrin carries his native downward-pointing tool, with only a small gait swing. */
export function orrinPose(phase:number,config:Readonly<RigProportions>=ORRIN_PROPORTIONS):OrrinPose {
  const pose=referenceRig(phase,'lance',config);
  // The native overalls hang behind the chest and slightly toward anatomical
  // left. Move the skeleton, not just its painted silhouette, so contacts and
  // workshop joint/floor guides retain the same registration.
  for(const side of ['left','right'] as const){
    const leg=pose[side];
    for(const point of [leg.hip,leg.knee,leg.ankle,leg.foot.origin,leg.foot.heel,leg.foot.toe]){
      point.x+=LOWER_BODY_ROOT.x;point.y+=LOWER_BODY_ROOT.y;
    }
  }
  const shoulder=pose.arms.right.shoulder,grip={...pose.arms.right.grip,z:pose.arms.right.grip.z-3};
  pose.arms.right=armToGrip(shoulder,grip,config);pose.weapon!.grip=pose.arms.right.grip;
  pose.weapon!.pitch=2*Math.sin(pose.phase*2*Math.PI)*Math.PI/180;
  return pose;
}
export const orrinFrame=(frame:number,config:Readonly<RigProportions>=ORRIN_PROPORTIONS)=>orrinPose(frame/REFERENCE_FRAMES,config);

export type OrrinAttackPhase='windup'|'contact';

/** Brace both feet and drive the steam lance forward without changing costume. */
export function orrinAttackPose(phase:OrrinAttackPhase,config:Readonly<RigProportions>=ORRIN_PROPORTIONS):OrrinPose {
  const pose=orrinPose(0,config),contact=phase==='contact';
  pose.hipHeight=config.hipHeight-.6;
  for(const side of ['left','right'] as const){
    const leg=pose[side],origin={x:leg.hip.x,y:LOWER_BODY_ROOT.y+(side==='left'?5:-5),z:0},transform={origin,pitch:0};
    leg.foot={...transform,heel:footPoint(transform,FOOT_HEEL*config.footScale,0),toe:footPoint(transform,FOOT_TOE*config.footScale,0),contact:'sole'};
    leg.planted=true;leg.phase=0;leg.hip={...leg.hip,z:pose.hipHeight};leg.ankle=footPoint(leg.foot,0,ANKLE_HEIGHT*config.footScale);
    const dy=leg.ankle.y-leg.hip.y,dz=leg.ankle.z-leg.hip.z,d=Math.hypot(dy,dz);
    if(d>config.legLength*2)throw new RangeError('Legs cannot reach the attack stance.');
    const bend=Math.sqrt(Math.max(0,config.legLength**2-d*d/4));
    leg.knee={x:leg.hip.x,y:leg.hip.y+dy/2-dz/d*bend,z:(leg.hip.z+leg.ankle.z)/2+dy/d*bend};
    const shoulder={x:pose.arms[side].shoulder.x,y:0,z:pose.hipHeight+config.shoulderHeight},right=side==='right';
    const reach=(config.upperArmLength+config.forearmLength)/15;
    const grip={x:shoulder.x,y:(right?(contact?11:-3):(contact?-3:3))*reach,z:shoulder.z-(right?(contact?7:9):12)};
    pose.arms[side]=armToGrip(shoulder,grip,config);
  }
  pose.weapon={...pose.weapon!,grip:pose.arms.right.grip,pitch:(contact?45:-15)*Math.PI/180};
  return {...pose,action:phase};
}

/** Native standing artwork has no gait rise. Bind the relaxed arm phase at
 * the resting hip height so sleeves and belt share exactly the same body bob. */
function orrinBind():OrrinPose {
  const pose=orrinPose(.25),rise=pose.hipHeight-ORRIN_PROPORTIONS.hipHeight;
  for(const arm of Object.values(pose.arms))for(const point of [arm.shoulder,arm.elbow,arm.wrist,arm.grip])point.z-=rise;
  return pose;
}

// Native rolled sleeves, bare forearms and work gloves. Each view has its own
// source pixels; even the far profile arm is bound independently, never flipped.
const ARM_SKINS:Record<ActorDirection,Record<'left'|'right',ArmSkin>>={
  front:{
    right:{shoulder:[30,29],elbow:[26.5,36],wrist:[26,40],grip:[27,41],
      sleeve:[[25,28,28,33],[28,31,26,33],[31,34,24,32],[34,36,23,31]],cuff:[[36,40,23,30]],hand:[[40,43,23,29]]},
    left:{shoulder:[51,29],elbow:[55,38],wrist:[55,43],grip:[55,45],
      sleeve:[[25,28,49,54],[28,31,49,56],[31,35,50,58],[35,38,52,58]],cuff:[[38,43,52,58]],hand:[[43,48,53,58]]},
  },
  left:{right:{shoulder:[36,29],elbow:[33.5,36],wrist:[33,40],grip:[31,43],
    sleeve:[[27,31,35,38],[31,36,34,37]],cuff:[[36,40,31,35]],hand:[[40,44,31,35]]},
    left:{shoulder:[44,29],elbow:[45,39],wrist:[44,45],grip:[44,47],
    sleeve:[[25,28,41,45],[28,31,40,47],[31,35,40,48],[35,39,41,49]],cuff:[[39,45,41,49]],hand:[[45,51,40,48]]}},
  right:{left:{shoulder:[43,28],elbow:[46,35],wrist:[47,39],grip:[48,41],
    sleeve:[[27,31,42,45],[31,35,43,47]],cuff:[[35,39,45,49]],hand:[[39,43,46,50]]},
    right:{shoulder:[36,29],elbow:[39,38],wrist:[41,43],grip:[44,44],
    sleeve:[[25,28,34,39],[28,31,33,41],[31,35,33,43],[35,38,35,43]],cuff:[[38,43,36,46]],hand:[[43,47,37,47]]}},
  back:{
    left:{shoulder:[30,29],elbow:[26,38],wrist:[26,44],grip:[27,46],
      sleeve:[[25,28,28,33],[28,31,26,33],[31,35,24,32],[35,38,23,31]],cuff:[[38,44,23,30]],hand:[[44,49,24,31]]},
    right:{shoulder:[51,29],elbow:[55,38],wrist:[56,42],grip:[55,43],
      sleeve:[[25,28,49,54],[28,31,49,56],[31,35,50,58],[35,38,52,59]],cuff:[[38,42,53,60]],hand:[[42,46,54,60]]},
  },
};

function arms(pose:OrrinPose,source:PixelTexture,direction:ActorDirection):SpriteLayer[]{
  const bind=orrinBind(),layers:SpriteLayer[]=[];
  for(const side of ['left','right'] as const){
    const skin=ARM_SKINS[direction][side];
    let pixels=source;
    if(pose.action&&((direction==='left'&&side==='right')||(direction==='right'&&side==='left'))){
      // Native far-hand fragments border the brass belt. Do not carry those
      // neighbouring buckle pixels along with a hand that reaches past the bib.
      pixels={...source,pixels:new Uint8ClampedArray(source.pixels)};
      for(let i=0;i<pixels.pixels.length;i+=4){
        const [r,g,b]=pixels.pixels.subarray(i,i+3);
        if(g>r*.6&&b<g*.6)pixels.pixels[i+3]=0;
      }
    }
    const arm=pose.arms[side],rest=bind.arms[side];
    layers.push(
      garment(`${side}-upper-arm`,pixels,skin.sleeve,skin.shoulder,skin.elbow,arm.shoulder,arm.elbow,rest.shoulder,rest.elbow,direction,pose.proportions.armWidth),
      garment(`${side}-forearm`,pixels,skin.cuff,skin.elbow,skin.wrist,arm.elbow,arm.wrist,rest.elbow,rest.wrist,direction,pose.proportions.armWidth),
      garment(`${side}-hand`,pixels,skin.hand,skin.wrist,skin.grip,arm.wrist,arm.grip,rest.wrist,rest.grip,direction,pose.proportions.armWidth));
  }
  return layers;
}

/** Overalls fill the volume behind moving sleeves and join the continuous seat. */
function body(pose:ReferencePose,texture:PixelTexture,trousers:PixelTexture,direction:ActorDirection):SpriteLayer {
  const rings=[[3,8.5,4.5],[7,10,5.6],[13,10.1,5.4],[17,8.8,4.5]] as const;
  const layer=surface('torso',rings.map(([z,width,depth],row)=>Array.from({length:ROUND_SIDES},(_,i)=>{
    const angle=i/ROUND_SIDES*Math.PI*2,c=Math.cos(angle),s=Math.sin(angle);
    return {point:{x:c*width+LOWER_BODY_ROOT.x*Math.max(0,1-(z-3)/14),y:s*depth+LOWER_BODY_ROOT.y*Math.max(0,1-(z-3)/14),z:pose.hipHeight+z},u:(acrossView(direction,c,s)+1)/2*texture.width,v:(1-row/(rings.length-1))*texture.height};
  })),0xffffff,texture);
  // The lower torso overlaps the seat in the depth buffer. It must use the
  // same cloth field, rather than stretching the dark bib into a false hole.
  const cloth=overallFabric({...layer,faces:layer.faces.map(face=>({...face}))},pose,trousers,direction);
  layer.faces.forEach((face,i)=>{
    if(face.points.some(index=>layer.vertices[index].z<=pose.hipHeight+7)){
      face.texture=trousers;face.uv=cloth.faces[i].uv;
    }
  });
  return layer;
}

/** Match the cloth field to Orrin's own seat, including the narrower profile
 * depth. The same projected field covers both thighs and their overlapping seat. */
function overallFabric(layer:SpriteLayer,pose:ReferencePose,texture:PixelTexture,direction:ActorDirection):SpriteLayer {
  const centre=project({x:LOWER_BODY_ROOT.x,y:LOWER_BODY_ROOT.y,z:pose.hipHeight},direction);
  const profile=direction==='left'||direction==='right';
  const width=profile?12*pose.proportions.legWidth/1.15:2*(pose.proportions.hipHalfWidth+4.5*pose.proportions.legWidth);
  const top=centre.y-5,height=pose.proportions.legLength+6;
  for(const face of layer.faces)face.uv=face.points.map(i=>{
    const p=project(layer.vertices[i],direction);
    return {u:(p.x-centre.x+width/2)/width*texture.width,v:(p.y-top)/height*texture.height};
  });
  return layer;
}

function overallSeat(pose:ReferencePose,texture:PixelTexture,direction:ActorDirection):SpriteLayer {
  const layer=pelvis(pose,texture,direction);
  for(const p of layer.vertices){p.x+=LOWER_BODY_ROOT.x;p.y+=LOWER_BODY_ROOT.y;}
  return overallFabric(layer,pose,texture,direction);
}

/** One native-scale leather field spans the calf and shoe. Projected UVs keep
 * the brass cuff highlight from repeating around every rounded mesh face. */
function bootFabric(layer:SpriteLayer,pose:ReferencePose,side:'left'|'right',texture:PixelTexture,direction:ActorDirection):SpriteLayer {
  const knee=project(pose[side].knee,direction),ankle=project(pose[side].ankle,direction);
  for(const face of layer.faces){
    if(!face.texture)continue;
    face.texture=texture;
    face.uv=face.points.map(index=>{
      const p=project(layer.vertices[index],direction),t=(p.y-knee.y)/Math.max(1,ankle.y-knee.y);
      const x=knee.x+(ankle.x-knee.x)*Math.max(0,Math.min(1,t));
      return {u:p.x-x+texture.width/2,v:t*7};
    });
  }
  return layer;
}

/** Registered directional cutouts; the partly hidden left nozzle is never mirrored. */
function lance(weapon:WeaponPose,textures:CharacterTextures,direction:ActorDirection,action?:OrrinAttackPhase):SpriteLayer {
  const source=textures[direction];
  const regions:Record<ActorDirection,readonly[number,number,number,number,number,number]>={
    front:[21,43,11,20,27,41],left:[22,44,13,10,31,43],right:[47,42,11,20,46,42],back:[51,43,8,21,52,42],
  };
  const [x,y,width,height,gx,gy]=regions[direction];
  const spans:Record<ActorDirection,readonly (readonly[number,number,number,number])[]>={
    front:[[43,48,25,29],[48,57,21,30],[57,63,21,28]],
    left:[[44,47,30,35],[47,50,26,34],[50,54,22,30]],
    right:[[42,46,47,52],[46,55,47,57],[55,62,51,58]],
    back:[[43,48,55,58],[48,51,53,59],[51,59,51,59],[59,64,53,59]],
  };
  const texture=cutout(source,spans[direction]);
  const bind=orrinBind().arms.right.grip,actual=project(weapon.grip,direction),rest=project(bind,direction);
  const grip={x:gx+actual.x-rest.x,y:gy+actual.y-rest.y},depth=orient(weapon.grip,direction).y+4,c=Math.cos(weapon.pitch),s=Math.sin(weapon.pitch);
  const mesh=decal('right-weapon',texture,[x,y,width,height],0,depth,direction),pivot=viewPoint(grip.x,grip.y,depth,direction);
  if(direction==='left'&&action){
    // The far carrying cutout contains only a visible nozzle. Turn the complete
    // native front tool skin on a view-facing plane when that arm reaches out;
    // this rotates the prop, never mirrors a character or changes its hand.
    mesh.faces[0].texture=cutout(textures.front,spans.front);
    mesh.faces[0].uv=[{u:21,v:43},{u:32,v:43},{u:32,v:63},{u:21,v:63}];
    const angle=weapon.pitch+Math.PI/4,cos=Math.cos(angle),sin=Math.sin(angle);
    mesh.vertices=[[21,43],[32,43],[32,63],[21,63]].map(([sx,sy])=>{
      const dx=sx-27,dy=sy-41;
      return viewPoint(grip.x+dx*cos-dy*sin,grip.y+dx*sin+dy*cos,depth,direction);
    });
    return mesh;
  }

  mesh.vertices=[[x,y],[x+width,y],[x+width,y+height],[x,y+height]].map(([sx,sy])=>{
    const p=viewPoint(grip.x+sx-gx,grip.y+sy-gy,depth,direction),dy=p.y-pivot.y,dz=p.z-pivot.z;
    return {x:p.x,y:pivot.y+dy*c-dz*s,z:pivot.z+dy*s+dz*c};
  });
  return mesh;
}

export function orrinLayers(pose:OrrinPose,direction:ActorDirection,textures:CharacterTextures):SpriteLayer[]{
  const source=textures[direction],head={...source,pixels:new Uint8ClampedArray(source.pixels)},torso={...source,pixels:new Uint8ClampedArray(source.pixels)};
  const armSpans=Object.values(ARM_SKINS[direction]).flatMap(skin=>[...skin.sleeve,...skin.cuff,...skin.hand]);
  for(let y=0;y<80;y++)for(let x=0;x<80;x++){
    const at=(y*80+x)*4;
    const lowerHead=direction==='front'?y<33&&x>=31&&x<50:direction==='left'?y<30&&x>=32&&x<41:direction==='right'?y<30&&x>=39&&x<48:y<28&&x>=34&&x<47;
    if(y>=25&&!lowerHead)head.pixels[at+3]=0;
    const oldArm=armSpans.some(([top,bottom,left,right])=>y>=top&&y<bottom&&x>=left&&x<right)
      ||direction==='left'&&y>=39&&y<46&&x<36
      ||direction==='left'&&y>=46&&x<35
      ||direction==='right'&&y>=42&&x>=47;
    const [r,g,b]=source.pixels.subarray(at,at+3);
    // The idle's trouser/crotch pixels must not sit above a second moving seat.
    // Keep the leather belt and pouches while removing the old navy lower body.
    const oldTrousers=y>=43&&b>r*.85&&b>g;
    if(oldArm||oldTrousers)torso.pixels[at+3]=0;
  }
  const trouserRegions:Record<ActorDirection,readonly[number,number,number,number]>={
    front:[33,43,18,14],left:[34,48,16,9],right:[28,46,13,12],back:[30,43,17,13],
  };
  const trousers=patch(source,...trouserRegions[direction],(r,g,b)=>r<g*1.4&&b>r*.85&&g>20);
  const bootRegions:Record<ActorDirection,readonly[number,number,number,number]>={front:[41,56,7,11],left:[42,56,8,11],right:[34,56,8,11],back:[35,57,8,10]};
  const boot=patch(source,...bootRegions[direction],(r,g,b)=>r>g*1.15&&g>b*1.1&&r>18);
  const bib=patch(source,35,30,10,10,(r,g,b)=>r<g*1.4&&b>r*.85);
  const layers:SpriteLayer[]=[body(pose,bib,trousers,direction),overallSeat(pose,trousers,direction)];
  for(const side of ['left','right'] as const){
    const leg=pose[side],{legWidth}=pose.proportions;
    layers.push(overallFabric(trouserLeg(side,pose,trousers,direction),pose,trousers,direction),
      bootFabric(limb(`${side}-shin`,leg.knee,leg.ankle,[3.2,2.8],[2.8,2.4],boot,direction,legWidth),pose,side,boot,direction),
      bootFabric(shoe(side,leg.foot,boot,direction,pose.proportions.footScale,legWidth*1.22),pose,side,boot,direction));
  }
  if(pose.action)for(const side of ['left','right'] as const){
    const contour={group:`${side}-leg`,color:0x100e18,priority:orient(pose[side].foot.origin,direction).y};
    for(const layer of layers)if(layer.id.startsWith(`${side}-`))layer.contour=contour;
  }
  layers.push(...arms(pose,source,direction));
  const dy=ORRIN_PROPORTIONS.hipHeight-pose.hipHeight,profile=direction==='left'||direction==='right';
  const rect:readonly[number,number,number,number]=[25,25,30,24];
  layers.push(decal('torso',torso,rect,dy,profile?11:6,direction),decal('head',head,[20,0,40,34],dy,profile?12:8,direction),lance(pose.weapon!,textures,direction,pose.action));
  return layers;
}
export const renderOrrin=(frame:number,direction:ActorDirection,textures:CharacterTextures)=>renderLayers(orrinLayers(frame<REFERENCE_FRAMES?orrinFrame(frame):orrinAttackPose(frame===REFERENCE_FRAMES?'windup':'contact'),direction,textures),direction);
