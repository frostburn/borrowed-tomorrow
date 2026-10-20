import { FOOT_HEEL, FOOT_TOE, footPoint, LEG_COLORS, type LegPose } from '../art/walk-cycle';
import { referenceRig, weaponPoint, type ArmPose, type ReferencePose, type WeaponPose } from '../art/reference-rig';
import type { Point3 } from '../art/actor-space';
import type { SpriteLayer } from '../art/layered-sprite';
import type { RigProportions } from '../art/rig-proportions';

export const REFERENCE_ARM_LAYERS = ['left-upper-arm','left-forearm','left-hand','left-weapon','right-upper-arm','right-forearm','right-hand','right-weapon'] as const;
export const REFERENCE_LAYERS = ['head','torso','satchel',...REFERENCE_ARM_LAYERS,'left-thigh','left-shin','left-foot','right-thigh','right-shin','right-foot'] as const;
export type ReferenceLayer=typeof REFERENCE_LAYERS[number];
export const layerName=(id:string)=>id.split('-').map(word=>word[0].toUpperCase()+word.slice(1)).join(' ');

/** Extrude a sagittal outline into one editable, independently visible pixel part. */
function part(id:string,profile:readonly (readonly [number,number])[],x:number,width:number,color:number):SpriteLayer {
  const count=profile.length,vertices:Point3[]=[];
  for(const side of [-1,1])for(const [y,z] of profile)vertices.push({x:x+side*width/2,y,z});
  const faces=[{points:Array.from({length:count},(_,i)=>i),color},{points:Array.from({length:count},(_,i)=>i+count),color}];
  for(let i=0;i<count;i++){const j=(i+1)%count;faces.push({points:[i,j,j+count,i+count],color});}
  return {id,vertices,faces};
}

function segment(id:string,a:Point3,b:Point3,width:number,thickness:number,color:number):SpriteLayer {
  const dy=b.y-a.y,dz=b.z-a.z,length=Math.hypot(dy,dz),ny=-dz/length*thickness/2,nz=dy/length*thickness/2;
  return part(id,[[a.y+ny,a.z+nz],[b.y+ny,b.z+nz],[b.y-ny,b.z-nz],[a.y-ny,a.z-nz]],a.x,width,color);
}

function legLayers(side:'left'|'right',leg:LegPose,colored:boolean,config:Readonly<RigProportions>):SpriteLayer[]{
  const color=colored?LEG_COLORS[side]:0x778594,a=leg.ankle;
  const shoe=(profile:readonly (readonly [number,number])[],width:number,material:number)=>{
    const mesh=part(`${side}-foot`,profile,a.x,width,material);
    mesh.vertices=mesh.vertices.map(p=>({...footPoint(leg.foot,p.y*config.footScale,p.z*config.footScale),x:a.x+(p.x-a.x)*config.footScale*config.legWidth}));
    return mesh;
  };
  return [segment(`${side}-thigh`,leg.hip,leg.knee,5.5*config.legWidth,5.5*config.legWidth,color),segment(`${side}-shin`,leg.knee,a,4.5*config.legWidth,4.5*config.legWidth,color),
    shoe([[FOOT_HEEL,0],[FOOT_TOE,0],[FOOT_TOE,1.2],[FOOT_HEEL,1.2]],6.5,0x38434b),
    shoe([[-3.8,1.2],[8,1.2],[8,2.2],[6.5,3.3],[1,5],[-3,5]],6,colored?(side==='left'?0x438e94:0xb77a3e):0x966b48)];
}

function armLayers(side:'left'|'right',arm:ArmPose,colored:boolean,config:Readonly<RigProportions>):SpriteLayer[]{
  const color=colored?LEG_COLORS[side]:0x8e9b9c,g=arm.grip,w=config.armWidth;
  return [segment(`${side}-upper-arm`,arm.shoulder,arm.elbow,4.5*w,4.5*w,color),
    segment(`${side}-forearm`,arm.elbow,arm.wrist,4*w,4*w,colored?color:0x778594),
    part(`${side}-hand`,[[g.y-1.7*w,g.z-1.6*w],[g.y+1.7*w,g.z-1.6*w],[g.y+1.7*w,g.z+1.6*w],[g.y-1.7*w,g.z+1.6*w]],g.x,4.5*w,0xe4c494)];
}

function weaponLayers(weapon:WeaponPose):SpriteLayer[]{
  const piece=(profile:readonly (readonly [number,number])[],width:number,color:number,unlit=false)=>{
    const mesh=part('right-weapon',profile,0,width,color);
    mesh.vertices=mesh.vertices.map(p=>weaponPoint(weapon,p.y,p.z,p.x));
    if(unlit)for(const face of mesh.faces)face.unlit=true;
    return mesh;
  };
  if(weapon.kind==='lantern')return [
    piece([[-2,-4],[-1,-4],[-1,0],[-2,0]],2,0x9c793f),
    piece([[1,-4],[2,-4],[2,0],[1,0]],2,0x9c793f),
    piece([[-2,-.8],[2,-.8],[2,0],[-2,0]],2,0x9c793f),
    piece([[-2.5,-10],[2.5,-10],[2.5,-5],[-2.5,-5]],5,0xffd57d,true),
    piece([[-3.2,-11],[3.2,-11],[3.2,-10],[-3.2,-10]],6.4,0xa87a3f),
    piece([[-3.2,-5],[3.2,-5],[2,-3.8],[-2,-3.8]],6.4,0xa87a3f),
  ];
  if(weapon.kind==='crossbow'){
    const stave=part('right-weapon',[[9,-.8],[11,-.8],[11,1],[9,1]],0,19,0xa8804b);
    stave.vertices=stave.vertices.map(p=>weaponPoint(weapon,p.y,p.z,p.x));
    const string=part('right-weapon',[[3,-.3],[3.6,-.3],[3.6,.3],[3,.3]],0,17,0xd6c097);
    string.vertices=string.vertices.map(p=>weaponPoint(weapon,p.y,p.z,p.x));
    return [piece([[-5,-1.5],[14,-1.5],[16,0],[14,1.5],[-5,1.5]],3,0x795238),
      piece([[-1,-4],[1,-4],[1,0],[-1,0]],2.5,0x573c2c),stave,string,
      piece([[4,1.5],[16,1.5],[16,2.2],[4,2.2]],1,0xa6b1b4)];
  }
  if(weapon.kind==='saber')return [
    piece([[-4,-1],[2,-1],[2,1],[-4,1]],2,0x674326),
    piece([[1,-1],[19,-1],[21,.4],[19,1.5],[1,1.5]],1.5,0xc9d1cb),
    piece([[0,-2.5],[2,-2.5],[2,3],[0,3]],4,0xb38a47),
  ];
  return [
    piece([[-9,-2],[-3,-2],[0,-.5],[0,1],[-4,2],[-9,2]],4,0x77583e),
    piece([[-1,-3],[2,-3],[2,1],[-1,1]],3,0x4a5960),
    piece([[1,-2],[8,-2],[8,2],[1,2]],5.5,0xb28a4f),
    piece([[6,-1],[16,-1],[16,1.5],[6,1.5]],3,0x9eafb2),
    piece([[15,-2],[18,-2],[18,2.5],[15,2.5]],5,0x687d86),
    piece([[17.5,-1],[18.2,-1],[18.2,1.5],[17.5,1.5]],3,0x293d45),
  ];
}

/** One mannequin and right-hand attachment in all views; nothing is mirrored. */
export function referenceLayers(pose:ReferencePose=referenceRig(0),colored=true):SpriteLayer[]{
  const z=pose.hipHeight,config=pose.proportions;
  const torso=part('torso',[[-4,z-1],[4,z-1],[5,z+13],[3,z+17],[-3,z+17],[-5,z+13]],0,15,0x8e9b9c);
  const neck=part('torso',[[-2,z+16],[2,z+16],[2,z+20],[-2,z+20]],0,6,0xe4c494);
  const head=part('head',[[-5,z+20],[-6,z+28],[-3,z+30],[3,z+30],[6,z+28],[5,z+20],[3,z+18],[-3,z+18]],0,13,0xe4c494);
  const nose=part('head',[[5,z+23],[8,z+23],[8,z+25],[5,z+26]],0,3,0xe4c494);
  const eyes:SpriteLayer={id:'head',vertices:[],faces:[]};
  for(const x of [-3,3]){
    const i=eyes.vertices.length;eyes.vertices.push({x:x-.7,y:6.1,z:z+26},{x:x+.7,y:6.1,z:z+26},{x:x+.7,y:6.1,z:z+27.5},{x:x-.7,y:6.1,z:z+27.5});
    eyes.faces.push({points:[i,i+1,i+2,i+3],color:0x1c2930,unlit:true});
  }
  for(const mesh of [torso,neck,head,nose,eyes])for(const p of mesh.vertices){
    const headPart=mesh===head||mesh===nose||mesh===eyes;
    p.z=z+(headPart?config.torsoHeight+(p.z-z-17)*config.headScale:(p.z-z)*config.torsoHeight/17);
    if(headPart){p.x*=config.headScale;p.y*=config.headScale;}
    else p.x*=config.shoulderHalfWidth/10;
  }
  return [...legLayers('left',pose.left,colored,config),...legLayers('right',pose.right,colored,config),torso,neck,head,nose,eyes,
    ...(pose.weapon?weaponLayers(pose.weapon):[]),...(pose.shield?shieldLayers(pose.shield.grip):[]),...armLayers('left',pose.arms.left,colored,config),...armLayers('right',pose.arms.right,colored,config)];
}

function shieldLayers(grip:Point3):SpriteLayer[]{
  return [7,5.5].map((radius,index)=>({id:'left-weapon',vertices:Array.from({length:16},(_,i)=>({x:grip.x+Math.cos(i*Math.PI/8)*radius,y:grip.y+2+index*.2,z:grip.z-1+Math.sin(i*Math.PI/8)*radius})),faces:[{points:Array.from({length:16},(_,i)=>i),color:index?0x805128:0xb38a47}]}));
}
