import type { ActorDirection } from '../content/actors';
import { orient, project, type Point3 } from './actor-space';

export interface PixelTexture { width:number;height:number;pixels:Uint8ClampedArray }
export interface Face { points:number[];color:number;unlit?:boolean;texture?:PixelTexture;uv?:{u:number;v:number}[] }
export interface SpriteLayer { id:string;vertices:Point3[];faces:Face[];contour?:{group:string;color:number;priority:number} }
export const LAYERED_SIZE=80;
type Vertex=ReturnType<typeof project>;

/** Rasterize layers onto the native grid; no canvas transforms or antialiasing. */
export function renderLayers(layers:readonly SpriteLayer[],direction:ActorDirection,visible?:ReadonlySet<string>):Uint8ClampedArray {
  const size=LAYERED_SIZE,rgba=new Uint8ClampedArray(size*size*4),depth=new Float32Array(size*size).fill(-Infinity);
  const contours=new Map<string,number>(),styles:NonNullable<SpriteLayer['contour']>[]=[];
  const owners=layers.some(layer=>layer.contour)?new Uint16Array(size*size):undefined;
  let owner=0;
  for(const layer of layers){
    if(visible&&!visible.has(layer.id))continue;
    owner=0;
    if(layer.contour){
      const key=layer.contour.group;
      if(!contours.has(key)){styles.push(layer.contour);contours.set(key,styles.length);}
      owner=contours.get(key)!;
    }
    const vertices=layer.vertices.map(v=>project(v,direction));
    for(const face of layer.faces){
      const [a,b,c]=face.points.map(i=>orient(layer.vertices[i],direction));
      const u={x:b.x-a.x,y:b.y-a.y,z:b.z-a.z},v={x:c.x-a.x,y:c.y-a.y,z:c.z-a.z};
      const n={x:u.y*v.z-u.z*v.y,y:u.z*v.x-u.x*v.z,z:u.x*v.y-u.y*v.x};
      const length=Math.hypot(n.x,n.y,n.z);
      // Absolute normal handles either winding; geometry depth determines visibility.
      const light=face.unlit?1:.68+.32*Math.abs((-.4*n.x+.5*n.y+n.z)/(length*1.187));
      const color=[face.color>>16&255,face.color>>8&255,face.color&255].map(c=>Math.round(c*light));
      for(let i=1;i<face.points.length-1;i++)triangle(vertices[face.points[0]],vertices[face.points[i]],vertices[face.points[i+1]],color,face.texture,face.uv?[face.uv[0],face.uv[i],face.uv[i+1]]:undefined);
    }
  }
  // Outline the assembled silhouette. Optional anatomical groups also retain
  // a one-pixel seam on the nearer leg, without outlining knees/ankles inside
  // the same group or drawing through an occluding arm/weapon.
  const occupied=rgba.slice(),neighbours=[-1,1,-size,size];
  const ink=(i:number,color:number)=>rgba.set([color>>16&255,color>>8&255,color&255,255],i*4);
  for(let y=1;y<size-1;y++)for(let x=1;x<size-1;x++){
    const i=y*size+x,near=owners?.[i]??0;
    if(occupied[i*4+3]){
      if(near&&neighbours.some(d=>{
        const far=owners![i+d];return far&&far!==near&&styles[near-1].priority>styles[far-1].priority;
      }))ink(i,styles[near-1].color);
      continue;
    }
    const edge=neighbours.find(d=>occupied[(i+d)*4+3]);
    if(edge!==undefined){
      const group=owners?.[i+edge]??0;ink(i,group?styles[group-1].color:0x141f27);
    }
  }
  return rgba;

  function triangle(a:Vertex,b:Vertex,c:Vertex,color:number[],texture?:PixelTexture,uv?:{u:number;v:number}[]){
    const area=(b.y-c.y)*(a.x-c.x)+(c.x-b.x)*(a.y-c.y);if(Math.abs(area)<1e-8)return;
    const x0=Math.max(0,Math.floor(Math.min(a.x,b.x,c.x))),x1=Math.min(size-1,Math.ceil(Math.max(a.x,b.x,c.x)));
    const y0=Math.max(0,Math.floor(Math.min(a.y,b.y,c.y))),y1=Math.min(size-1,Math.ceil(Math.max(a.y,b.y,c.y)));
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
      const u=((b.y-c.y)*(x+.5-c.x)+(c.x-b.x)*(y+.5-c.y))/area;
      const v=((c.y-a.y)*(x+.5-c.x)+(a.x-c.x)*(y+.5-c.y))/area,w=1-u-v;
      if(u<0||v<0||w<0)continue;
      const z=u*a.depth+v*b.depth+w*c.depth,i=y*size+x;
      if(z<depth[i])continue;
      if(texture&&uv){
        const tx=Math.max(0,Math.min(texture.width-1,Math.floor(u*uv[0].u+v*uv[1].u+w*uv[2].u)));
        const ty=Math.max(0,Math.min(texture.height-1,Math.floor(u*uv[0].v+v*uv[1].v+w*uv[2].v))),at=(ty*texture.width+tx)*4;
        if(texture.pixels[at+3]<128)continue;
        rgba.set([texture.pixels[at],texture.pixels[at+1],texture.pixels[at+2],255],i*4);
      }else rgba.set([...color,255],i*4);
      depth[i]=z;if(owners)owners[i]=owner;
    }
  }
}
