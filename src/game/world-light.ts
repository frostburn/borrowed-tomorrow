import { actorPlanes } from './actor-planes';
import chapterOne from '../content/chapter-one/lighting.json' with { type:'json' };
import chapterTwo from '../content/chapter-two/lighting.json' with { type:'json' };
import chapterThree from '../content/chapter-three/lighting.json' with { type:'json' };
import chapterFour from '../content/chapter-four/lighting.json' with { type:'json' };
import chapterFive from '../content/chapter-five/lighting.json' with { type:'json' };
import chapterSix from '../content/chapter-six/lighting.json' with { type:'json' };
/** Screen-ground coordinates, with lamp height in native actor pixels. */
export interface WorldLamp { x:number; y:number; height:number; radius:number; strength:number; shadowStrength?:number; fill?:number; color?:readonly number[]; beam?:{reach:number;width:number;spread:number} }
export interface WorldLight { ambient:readonly number[]; lamps:readonly WorldLamp[]; shadowOpacity?:number }
/** Custom whole-image arenas supply their own native floor silhouette. */
export interface SceneIllumination { scene:string; ground:string }
interface LightRegistry { profiles:Record<string,WorldLight & {propStrength?:number}>; props:Record<string,WorldLamp[]> }
const registries:readonly LightRegistry[]=[chapterOne,chapterTwo,chapterThree,chapterFour,chapterFive,chapterSix];
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

/** A small material-neutral light field; original alpha and geometry survive. */
export function lightPixels(source:ImageData,output:ImageData,rig:WorldLight,x:number,y:number,originX:number,originY:number,scaleX=1,scaleY=1,rotation=0){
  const a=source.data,b=output.data,w=source.width,cos=Math.cos(rotation),sin=Math.sin(rotation),planes=actorPlanes(source);
  const lamps=frameLamps(rig,w,source.height,x,y,originX,originY,scaleX,scaleY,cos,sin);
  for(let i=0;i<a.length;i+=4){
    b[i+3]=a[i+3];if(!a[i+3]){b[i]=b[i+1]=b[i+2]=0;continue;}
    const sx=(i/4%w-originX)*scaleX,sy=(Math.floor(i/4/w)-originY)*scaleY;
    const wx=x+sx*cos-sy*sin,height=Math.max(0,-sx*sin-sy*cos);
    const at=i/4*3,nx=planes[at]/100,ny=planes[at+1]/100,nz=planes[at+2]/100;
    const normalX=nx*Math.sign(scaleX)*cos+ny*Math.sign(scaleY)*sin,normalY=ny*Math.sign(scaleY)*cos-nx*Math.sign(scaleX)*sin;
    let strength=0,red=0,green=0,blue=0;
    for(const lamp of lamps){
      const lx=lamp.x-wx,ly=lamp.height-height,lz=(lamp.y-y)*1.35,distance=Math.hypot(lx,ly,lz);
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
    b[i]=a[i]*(rig.ambient[0]+factor*red);b[i+1]=a[i+1]*(rig.ambient[1]+factor*green);b[i+2]=a[i+2]*(rig.ambient[2]+factor*blue);
  }
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
