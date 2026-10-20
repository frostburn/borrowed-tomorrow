import type { ActorDirection } from '../content/actors';
import { orient, project, type Point3 } from './actor-space';

export interface Face { points:number[];color:number;unlit?:boolean }
export interface SpriteLayer { id:string;vertices:Point3[];faces:Face[] }
export const LAYERED_SIZE=80;
type Vertex=ReturnType<typeof project>;

/** Rasterize layers onto the native grid; no canvas transforms or antialiasing. */
export function renderLayers(layers:readonly SpriteLayer[],direction:ActorDirection,visible?:ReadonlySet<string>):Uint8ClampedArray {
  const size=LAYERED_SIZE,rgba=new Uint8ClampedArray(size*size*4),depth=new Float32Array(size*size).fill(-Infinity);
  for(const layer of layers){
    if(visible&&!visible.has(layer.id))continue;
    const vertices=layer.vertices.map(v=>project(v,direction));
    for(const face of layer.faces){
      const [a,b,c]=face.points.map(i=>orient(layer.vertices[i],direction));
      const u={x:b.x-a.x,y:b.y-a.y,z:b.z-a.z},v={x:c.x-a.x,y:c.y-a.y,z:c.z-a.z};
      const n={x:u.y*v.z-u.z*v.y,y:u.z*v.x-u.x*v.z,z:u.x*v.y-u.y*v.x};
      const length=Math.hypot(n.x,n.y,n.z);
      // Absolute normal handles either winding; geometry depth determines visibility.
      const light=face.unlit?1:.68+.32*Math.abs((-.4*n.x+.5*n.y+n.z)/(length*1.187));
      const color=[face.color>>16&255,face.color>>8&255,face.color&255].map(c=>Math.round(c*light));
      for(let i=1;i<face.points.length-1;i++)triangle(vertices[face.points[0]],vertices[face.points[i]],vertices[face.points[i+1]],color);
    }
  }
  // One native pixel outlines the assembled silhouette, rather than fattening joints.
  const occupied=rgba.slice();
  for(let y=1;y<size-1;y++)for(let x=1;x<size-1;x++){
    const i=y*size+x;if(occupied[i*4+3])continue;
    if([-1,1,-size,size].some(d=>occupied[(i+d)*4+3]))rgba.set([20,31,39,255],i*4);
  }
  return rgba;

  function triangle(a:Vertex,b:Vertex,c:Vertex,color:number[]){
    const area=(b.y-c.y)*(a.x-c.x)+(c.x-b.x)*(a.y-c.y);if(Math.abs(area)<1e-8)return;
    const x0=Math.max(0,Math.floor(Math.min(a.x,b.x,c.x))),x1=Math.min(size-1,Math.ceil(Math.max(a.x,b.x,c.x)));
    const y0=Math.max(0,Math.floor(Math.min(a.y,b.y,c.y))),y1=Math.min(size-1,Math.ceil(Math.max(a.y,b.y,c.y)));
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
      const u=((b.y-c.y)*(x+.5-c.x)+(c.x-b.x)*(y+.5-c.y))/area;
      const v=((c.y-a.y)*(x+.5-c.x)+(a.x-c.x)*(y+.5-c.y))/area,w=1-u-v;
      if(u<0||v<0||w<0)continue;
      const z=u*a.depth+v*b.depth+w*c.depth,i=y*size+x;
      if(z<depth[i])continue;depth[i]=z;rgba.set([...color,255],i*4);
    }
  }
}
