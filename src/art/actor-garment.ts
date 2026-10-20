import type { ActorDirection } from '../content/actors';
import { orient, project, type Point3 } from './actor-space';
import { viewPoint } from './actor-skin';
import type { PixelTexture, SpriteLayer } from './layered-sprite';

export type Span=readonly [top:number,bottom:number,left:number,right:number];
export type ScreenPoint=readonly [number,number];
export interface ArmSkin {
  shoulder:ScreenPoint;elbow:ScreenPoint;wrist:ScreenPoint;grip:ScreenPoint;
  sleeve:readonly Span[];cuff:readonly Span[];hand:readonly Span[];
}
export function cutout(source:PixelTexture,spans:readonly Span[]):PixelTexture {
  const pixels=new Uint8ClampedArray(source.pixels.length);
  for(const [top,bottom,left,right] of spans)for(let y=top;y<bottom;y++)for(let x=left;x<right;x++){
    const at=(y*source.width+x)*4;pixels.set(source.pixels.subarray(at,at+4),at);
  }
  return {...source,pixels};
}

/** Articulate native garment pixels around the rig, preserving their cross-section
 * and directional shading instead of wrapping a small swatch around a tube. */
export function garment(id:string,source:PixelTexture,spans:readonly Span[],a:ScreenPoint,b:ScreenPoint,
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
