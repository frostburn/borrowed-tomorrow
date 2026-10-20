import type { ActorDirection } from '../content/actors';
import { orient, project, type Point3 } from './actor-space';
import { patch, surface, acrossView, ROUND_SIDES, viewPoint, decal, limb, pelvis, trouserLeg, shoe, type CharacterTextures } from './actor-skin';
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

/** Native standing artwork has no gait rise. Bind the relaxed arm phase at
 * the resting hip height so sleeves and belt share exactly the same body bob. */
function orrinBind():ReferencePose {
  const pose=orrinPose(.25),rise=pose.hipHeight-ORRIN_PROPORTIONS.hipHeight;
  for(const arm of Object.values(pose.arms))for(const point of [arm.shoulder,arm.elbow,arm.wrist,arm.grip])point.z-=rise;
  return pose;
}

type Span=readonly [top:number,bottom:number,left:number,right:number];
type ScreenPoint=readonly [number,number];
interface ArmSkin {
  shoulder:ScreenPoint;elbow:ScreenPoint;wrist:ScreenPoint;grip:ScreenPoint;
  sleeve:readonly Span[];cuff:readonly Span[];hand:readonly Span[];
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

function cutout(source:PixelTexture,spans:readonly Span[]):PixelTexture {
  const pixels=new Uint8ClampedArray(source.pixels.length);
  for(const [top,bottom,left,right] of spans)for(let y=top;y<bottom;y++)for(let x=left;x<right;x++){
    const at=(y*source.width+x)*4;pixels.set(source.pixels.subarray(at,at+4),at);
  }
  return {...source,pixels};
}

/** Articulate native garment pixels around the rig, preserving their cross-section
 * and directional shading instead of wrapping a small swatch around a tube. */
function garment(id:string,source:PixelTexture,spans:readonly Span[],a:ScreenPoint,b:ScreenPoint,
  worldA:Point3,worldB:Point3,bindA:Point3,bindB:Point3,direction:ActorDirection,fullness:number):SpriteLayer {
  const texture=cutout(source,spans),left=Math.min(...spans.map(s=>s[2])),right=Math.max(...spans.map(s=>s[3]));
  const top=Math.min(...spans.map(s=>s[0])),bottom=Math.max(...spans.map(s=>s[1]));
  const pa=project(worldA,direction),pb=project(worldB,direction),ba=project(bindA,direction),bb=project(bindB,direction);
  const ax=a[0]+pa.x-ba.x,ay=a[1]+pa.y-ba.y,bx=b[0]+pb.x-bb.x,by=b[1]+pb.y-bb.y;
  const dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy),tx=bx-ax,ty=by-ay,targetLength=Math.max(.1,Math.hypot(tx,ty));
  const da=orient(worldA,direction).y+3.5,db=orient(worldB,direction).y+3.5;
  const vertices=[[left,top],[right,top],[right,bottom],[left,bottom]].map(([x,y])=>{
    const along=((x-a[0])*dx+(y-a[1])*dy)/(length*length),across=((x-a[0])*-dy+(y-a[1])*dx)/length*fullness;
    return viewPoint(ax+along*tx-across*ty/targetLength,ay+along*ty+across*tx/targetLength,da+(db-da)*along,direction);
  });
  return {id,vertices,faces:[{points:[0,1,2,3],color:0xffffff,unlit:true,texture,uv:[{u:left,v:top},{u:right,v:top},{u:right,v:bottom},{u:left,v:bottom}]}]};
}

function arms(pose:ReferencePose,source:PixelTexture,direction:ActorDirection):SpriteLayer[]{
  const bind=orrinBind(),layers:SpriteLayer[]=[];
  for(const side of ['left','right'] as const){
    const skin=ARM_SKINS[direction][side];
    const arm=pose.arms[side],rest=bind.arms[side];
    layers.push(
      garment(`${side}-upper-arm`,source,skin.sleeve,skin.shoulder,skin.elbow,arm.shoulder,arm.elbow,rest.shoulder,rest.elbow,direction,pose.proportions.armWidth),
      garment(`${side}-forearm`,source,skin.cuff,skin.elbow,skin.wrist,arm.elbow,arm.wrist,rest.elbow,rest.wrist,direction,pose.proportions.armWidth),
      garment(`${side}-hand`,source,skin.hand,skin.wrist,skin.grip,arm.wrist,arm.grip,rest.wrist,rest.grip,direction,pose.proportions.armWidth));
  }
  return layers;
}

/** Overalls fill the volume behind moving sleeves and join the continuous seat. */
function body(pose:ReferencePose,texture:PixelTexture,direction:ActorDirection):SpriteLayer {
  const rings=[[3,8.5,4.5],[7,10,5.6],[13,10.1,5.4],[17,8.8,4.5]] as const;
  return surface('torso',rings.map(([z,width,depth],row)=>Array.from({length:ROUND_SIDES},(_,i)=>{
    const angle=i/ROUND_SIDES*Math.PI*2,c=Math.cos(angle),s=Math.sin(angle);
    return {point:{x:c*width,y:s*depth,z:pose.hipHeight+z},u:(acrossView(direction,c,s)+1)/2*texture.width,v:(1-row/(rings.length-1))*texture.height};
  })),0xffffff,texture);
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
function lance(weapon:WeaponPose,source:PixelTexture,direction:ActorDirection):SpriteLayer {
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
  mesh.vertices=[[x,y],[x+width,y],[x+width,y+height],[x,y+height]].map(([sx,sy])=>{
    const p=viewPoint(grip.x+sx-gx,grip.y+sy-gy,depth,direction),dy=p.y-pivot.y,dz=p.z-pivot.z;
    return {x:p.x,y:pivot.y+dy*c-dz*s,z:pivot.z+dy*s+dz*c};
  });
  return mesh;
}

export function orrinLayers(pose:ReferencePose,direction:ActorDirection,textures:CharacterTextures):SpriteLayer[]{
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
    if(oldArm)torso.pixels[at+3]=0;
  }
  const trousers=patch(source,33,43,15,14,(r,g,b)=>r<g*1.4&&b>r*.85);
  const bootRegions:Record<ActorDirection,readonly[number,number,number,number]>={front:[41,56,7,11],left:[42,56,8,11],right:[34,56,8,11],back:[35,57,8,10]};
  const boot=patch(source,...bootRegions[direction],(r,g,b)=>r>g*1.15&&g>b*1.1&&r>18);
  const bib=patch(source,35,30,10,10,(r,g,b)=>r<g*1.4&&b>r*.85);
  const layers:SpriteLayer[]=[body(pose,bib,direction),pelvis(pose,trousers,direction)];
  for(const side of ['left','right'] as const){
    const leg=pose[side],{legWidth}=pose.proportions;
    layers.push(trouserLeg(side,pose,trousers,direction),
      bootFabric(limb(`${side}-shin`,leg.knee,leg.ankle,[3.2,2.8],[2.8,2.4],boot,direction,legWidth),pose,side,boot,direction),
      bootFabric(shoe(side,leg.foot,boot,direction,pose.proportions.footScale,legWidth*1.22),pose,side,boot,direction));
  }
  layers.push(...arms(pose,source,direction));
  const dy=ORRIN_PROPORTIONS.hipHeight-pose.hipHeight,profile=direction==='left'||direction==='right';
  const rect:readonly[number,number,number,number]=[25,25,30,24];
  layers.push(decal('torso',torso,rect,dy,profile?11:6,direction),decal('head',head,[20,0,40,34],dy,profile?12:8,direction),lance(pose.weapon!,source,direction));
  return layers;
}
export const renderOrrin=(frame:number,direction:ActorDirection,textures:CharacterTextures)=>renderLayers(orrinLayers(orrinFrame(frame),direction,textures),direction);
