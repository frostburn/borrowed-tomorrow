import { actorPlanes } from './actor-planes';
import chapterOne from '../content/chapter-one/lighting.json' with { type:'json' };
import chapterTwo from '../content/chapter-two/lighting.json' with { type:'json' };
import chapterThree from '../content/chapter-three/lighting.json' with { type:'json' };
import chapterFour from '../content/chapter-four/lighting.json' with { type:'json' };
import chapterFive from '../content/chapter-five/lighting.json' with { type:'json' };
import chapterSix from '../content/chapter-six/lighting.json' with { type:'json' };
import chapterSeven from '../content/chapter-seven/lighting.json' with { type:'json' };
/** Screen-ground coordinates, with lamp height in native actor pixels. */
export interface WorldLamp { x:number; y:number; height:number; radius:number; strength:number; shadowStrength?:number; fill?:number; spill?:number; color?:readonly number[]; beam?:{reach:number;width:number;spread:number} }
export interface LightFocus { polygons:readonly (readonly {x:number;y:number}[])[]; strength:number }
export interface LightFlare { x:number; y:number; strength:number }
export interface WorldLight { ambient:readonly number[]; lamps:readonly WorldLamp[]; shadowOpacity?:number; focus?:LightFocus; groundAmbient?:readonly number[]; maxGain?:number; environmentShade?:number; flares?:readonly LightFlare[] }
/** Custom whole-image arenas supply their own native floor silhouette. */
export interface SceneIllumination { scene:string; ground:string; sample?:()=>WorldLight; floorLight?:boolean }
interface LightRegistry { profiles:Record<string,WorldLight & {propStrength?:number}>; props:Record<string,WorldLamp[]> }
const registries:readonly LightRegistry[]=[chapterOne,chapterTwo,chapterThree,chapterFour,chapterFive,chapterSix,chapterSeven];
export const NIGHT_AMBIENT=[.62,.70,.88] as const;
const WARM=[1.12,.78,.38] as const;
export function stationLight(pieces:readonly {x:number;y:number;url:string}[]):WorldLight{
  return sceneLight('station',pieces)!;
}
/** Shared with the compiler: visible emitters, local ambient and broad bounce. */
export function sceneLight(id:string,pieces:readonly {x:number;y:number;url:string}[]):WorldLight|undefined{
  const registry=registries.find(r=>id in r.profiles);if(!registry)return;
  const profile=registry.profiles[id];
  const lamps=[...profile.lamps];
  for(const piece of pieces){
    const name=piece.url.split('/').pop()!.replace(/\.svg$/,'');
    for(const light of registry.props[name]??[])lamps.push({...light,strength:light.strength*(profile.propStrength??1),x:piece.x+light.x,y:piece.y+light.y});
  }
  return {ambient:profile.ambient,lamps,shadowOpacity:profile.shadowOpacity};
}

export function lampStrength(lamp:WorldLamp,x:number,y:number,height=32){
  const distance=Math.hypot(x-lamp.x,(y-lamp.y)*1.35,lamp.height-height);
  return attenuation(lamp,x,y,distance);
}
/** Grounded actors keep their whole silhouette lit inside a focused region. */
export function focusExposure(focus:LightFocus|undefined,x:number,y:number){
  if(!focus)return 1;
  const inside=focus.polygons.some(points=>{
    let hit=false;
    for(let i=0,j=points.length-1;i<points.length;j=i++){
      const a=points[i],b=points[j];
      if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)hit=!hit;
    }
    return hit;
  });
  return inside?1:1-focus.strength*.7;
}
function attenuation(lamp:WorldLamp,x:number,y:number,distance:number){
  if(distance>=lamp.radius)return 0;
  let aperture=1;
  if(lamp.beam){
    const forward=y-lamp.y;
    if(forward<0||forward>lamp.beam.reach)return 0;
    const width=lamp.beam.width+forward*lamp.beam.spread;
    aperture=Math.min(1,Math.max(0,(width-Math.abs(x-lamp.x-forward*.10))/8));
  }
  return lamp.strength*Math.max(0,1-distance/lamp.radius)**2*aperture;
}

/** Conservative transformed frame bounds: never omit a partially lit edge. */
function frameLamps(rig:WorldLight,w:number,h:number,x:number,y:number,ox:number,oy:number,sx:number,sy:number,cos:number,sin:number){
  let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;
  for(const px of [0,w])for(const py of [0,h]){
    const dx=(px-ox)*sx,dy=(py-oy)*sy,wx=x+dx*cos-dy*sin,height=Math.max(0,-dx*sin-dy*cos);
    left=Math.min(left,wx);right=Math.max(right,wx);top=Math.min(top,height);bottom=Math.max(bottom,height);
  }
  return rig.lamps.filter(l=>{
    const dx=Math.max(left-l.x,0,l.x-right),dh=Math.max(top-l.height,0,l.height-bottom),dz=(l.y-y)*1.35;
    if(dx*dx+dh*dh+dz*dz>=l.radius*l.radius)return false;
    if(l.beam){const forward=y-l.y,width=l.beam.width+forward*l.beam.spread,center=l.x+forward*.1;
      if(forward<0||forward>l.beam.reach||right<=center-width||left>=center+width)return false;
    }
    return true;
  });
}

// Walking changes the world position, not the geometry of an upright native
// actor frame. Cache just its opaque samples; retain one transform per frame
// and let the frame's ImageData own its lifetime. Large boss sheets stay on
// the general path so their many poses cannot grow this small-sprite cache.
const samples=new WeakMap<ImageData,{pose:string;data:Float64Array}>();
function uprightSamples(source:ImageData,ox:number,oy:number,sx:number,sy:number){
  const pose=[ox,oy,sx,sy].join(':'),cached=samples.get(source);if(cached?.pose===pose)return cached.data;
  const planes=actorPlanes(source),a=source.data,values:number[]=[],signX=Math.sign(sx),signY=Math.sign(sy);
  for(let i=0;i<a.length;i+=4)if(a[i+3]){
    const at=i/4*3;
    values.push(i,(i/4%source.width-ox)*sx,Math.max(0,-(Math.floor(i/4/source.width)-oy)*sy),planes[at]/100*signX,planes[at+1]/100*signY,planes[at+2]/100);
  }
  const data=new Float64Array(values);samples.set(source,{pose,data});return data;
}

function lightUpright(source:ImageData,output:ImageData,rig:WorldLight,lamps:readonly WorldLamp[],x:number,y:number,ox:number,oy:number,sx:number,sy:number,exposure:number,ceiling:number){
  const a=source.data,b=output.data,geometry=uprightSamples(source,ox,oy,sx,sy);
  // These terms are identical for every pixel at this ground position.
  const depths=lamps.map(l=>(l.y-y)*1.35);
  b.fill(0);
  for(let at=0;at<geometry.length;at+=6){
    const i=geometry[at],wx=x+geometry[at+1],height=geometry[at+2],nx=geometry[at+3],ny=geometry[at+4],nz=geometry[at+5];
    let strength=0,red=0,green=0,blue=0;
    for(let n=0;n<lamps.length;n++){
      const lamp=lamps[n],lx=lamp.x-wx,ly=lamp.height-height,lz=depths[n],distance=Math.sqrt(lx*lx+ly*ly+lz*lz);
      const power=attenuation(lamp,wx,y,distance);if(!power)continue;
      const dot=(nx*lx+ny*ly+nz*lz)/Math.max(1,distance),band=dot>.55?1.08:dot>.05?.72:.30,fill=lamp.fill??0;
      const response=power*(fill+(1-fill)*band),color=lamp.color??WARM;
      strength+=power;red+=response*color[0];green+=response*color[1];blue+=response*color[2];
    }
    const factor=strength?Math.min(.65,strength)/strength:0;
    b[i]=a[i]*Math.min(ceiling,rig.ambient[0]+factor*red)*exposure;b[i+1]=a[i+1]*Math.min(ceiling,rig.ambient[1]+factor*green)*exposure;b[i+2]=a[i+2]*Math.min(ceiling,rig.ambient[2]+factor*blue)*exposure;b[i+3]=a[i+3];
  }
}

/** A small material-neutral light field; original alpha and geometry survive. */
export function lightPixels(source:ImageData,output:ImageData,rig:WorldLight,x:number,y:number,originX:number,originY:number,scaleX=1,scaleY=1,rotation=0){
  const a=source.data,b=output.data,w=source.width,cos=Math.cos(rotation),sin=Math.sin(rotation);
  const exposure=focusExposure(rig.focus,x,y),ceiling=rig.maxGain??Infinity;
  const lamps=frameLamps(rig,w,source.height,x,y,originX,originY,scaleX,scaleY,cos,sin);
  // Outside all lamp bounds, motion and surface normals cannot change ambient
  // illumination. Keep transparent RGB identical to the full lighting path.
  if(!lamps.length){
    for(let i=0;i<a.length;i+=4){
      b[i+3]=a[i+3];
      b[i]=a[i+3]?a[i]*Math.min(ceiling,rig.ambient[0])*exposure:0;b[i+1]=a[i+3]?a[i+1]*Math.min(ceiling,rig.ambient[1])*exposure:0;b[i+2]=a[i+3]?a[i+2]*Math.min(ceiling,rig.ambient[2])*exposure:0;
    }
    return;
  }
  if(rotation===0&&w<=80&&source.height<=80){lightUpright(source,output,rig,lamps,x,y,originX,originY,scaleX,scaleY,exposure,ceiling);return;}
  const planes=actorPlanes(source),signX=Math.sign(scaleX),signY=Math.sign(scaleY);
  for(let i=0;i<a.length;i+=4){
    b[i+3]=a[i+3];if(!a[i+3]){b[i]=b[i+1]=b[i+2]=0;continue;}
    const sx=(i/4%w-originX)*scaleX,sy=(Math.floor(i/4/w)-originY)*scaleY;
    const wx=x+sx*cos-sy*sin,height=Math.max(0,-sx*sin-sy*cos);
    const at=i/4*3,nx=planes[at]/100,ny=planes[at+1]/100,nz=planes[at+2]/100;
    const normalX=nx*signX*cos+ny*signY*sin,normalY=ny*signY*cos-nx*signX*sin;
    let strength=0,red=0,green=0,blue=0;
    for(const lamp of lamps){
      const lx=lamp.x-wx,ly=lamp.height-height,lz=(lamp.y-y)*1.35,distance=Math.sqrt(lx*lx+ly*ly+lz*lz);
      const power=attenuation(lamp,wx,y,distance);if(!power)continue;
      const length=Math.max(1,distance);
      const dot=(normalX*lx+normalY*ly+nz*lz)/length;
      const band=dot>.55?1.08:dot>.05?.72:.30,fill=lamp.fill??0;
      const response=power*(fill+(1-fill)*band),color=lamp.color??WARM;
      strength+=power;red+=response*color[0];green+=response*color[1];blue+=response*color[2];
    }
    const factor=strength?Math.min(.65,strength)/strength:0;
    // Diffuse illumination multiplies reflectance: warm light must not bleach
    // dark eyes, cloth folds or tool details into one flat orange silhouette.
    b[i]=a[i]*Math.min(ceiling,rig.ambient[0]+factor*red)*exposure;b[i+1]=a[i+1]*Math.min(ceiling,rig.ambient[1]+factor*green)*exposure;b[i+2]=a[i+2]*Math.min(ceiling,rig.ambient[2]+factor*blue)*exposure;
  }
}

/** A rounded actor turns its ground cross-section across the light direction.
 * A fixed screen-horizontal billboard becomes singular under side lighting.
 * Unproject the ground's depth compression before choosing the cross axis. */
export function shadowProjection(dx:number,dy:number):[number,number,number,number]{
  const depth=.45,length=Math.hypot(dx,dy/depth);
  if(length<1)return [1,0,0,-1/58];
  return [dy/depth/length,-dx*depth/length,-dx/58,-dy/58];
}

/** Keep up to three meaningful sources, with a shared opacity budget. */
export function castShadows(rig:WorldLight,x:number,y:number){
  const candidates=rig.lamps.map(light=>({light,strength:lampStrength(light,x,y)*(light.shadowStrength??1)})).filter(s=>s.strength>=.025).sort((a,b)=>b.strength-a.strength);
  const selected=candidates.filter(s=>s.strength>=candidates[0].strength*.18).slice(0,3);
  const total=selected.reduce((sum,s)=>sum+Math.min(.30,s.strength*.58),0),budget=Math.min(1,(rig.shadowOpacity??.45)/Math.max(.001,total));
  return selected.map(({light,strength})=>{
    const ratio=58/Math.max(40,light.height-58);
    return {dx:Math.max(-105,Math.min(105,(x-light.x)*ratio)),dy:Math.max(-42,Math.min(48,(y-light.y)*ratio*.45+8)),alpha:Math.min(.30,strength*.58)*budget,light};
  });
}
