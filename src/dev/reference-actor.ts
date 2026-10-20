import { LEG_COLORS, referencePose, type LegPose, type WalkPose } from '../art/walk-cycle';
import type { Point3 } from '../art/actor-space';
import type { SpriteLayer } from '../art/layered-sprite';

export const REFERENCE_LAYERS = ['head','torso','left-thigh','left-shin','left-foot','right-thigh','right-shin','right-foot'] as const;
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

function legLayers(side:'left'|'right',leg:LegPose,colored:boolean):SpriteLayer[]{
  const color=colored?LEG_COLORS[side]:0x778594,a=leg.ankle;
  return [segment(`${side}-thigh`,leg.hip,leg.knee,5.5,5.5,color),segment(`${side}-shin`,leg.knee,a,4.5,4.5,color),
    part(`${side}-foot`,[[a.y-3,a.z-3],[a.y+5,a.z-3],[a.y+5,a.z-1],[a.y+2,a.z+2],[a.y-3,a.z+2]],a.x,5.5,colored?color:0x725342)];
}

/** Armless mannequin: same parts and anatomy in all views; nothing is mirrored. */
export function referenceLayers(pose:WalkPose=referencePose(0),colored=true):SpriteLayer[]{
  const z=pose.hipHeight;
  const torso=part('torso',[[-4,z-1],[4,z-1],[5,z+13],[3,z+17],[-3,z+17],[-5,z+13]],0,15,0x8e9b9c);
  const neck=part('torso',[[-2,z+16],[2,z+16],[2,z+20],[-2,z+20]],0,6,0xe4c494);
  const head=part('head',[[-5,z+20],[-6,z+28],[-3,z+30],[3,z+30],[6,z+28],[5,z+20],[3,z+18],[-3,z+18]],0,13,0xe4c494);
  const nose=part('head',[[5,z+23],[8,z+23],[8,z+25],[5,z+26]],0,3,0xe4c494);
  const eyes:SpriteLayer={id:'head',vertices:[],faces:[]};
  for(const x of [-3,3]){
    const i=eyes.vertices.length;eyes.vertices.push({x:x-.7,y:6.1,z:z+26},{x:x+.7,y:6.1,z:z+26},{x:x+.7,y:6.1,z:z+27.5},{x:x-.7,y:6.1,z:z+27.5});
    eyes.faces.push({points:[i,i+1,i+2,i+3],color:0x1c2930,unlit:true});
  }
  return [...legLayers('left',pose.left,colored),...legLayers('right',pose.right,colored),torso,neck,head,nose,eyes];
}
