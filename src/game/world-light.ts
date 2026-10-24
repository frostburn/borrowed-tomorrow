/** Screen-ground coordinates, with lamp height in native actor pixels. */
export interface WorldLamp { x:number; y:number; height:number; radius:number; strength:number }
export interface WorldLight { ambient:readonly [number,number,number]; lamps:readonly WorldLamp[] }
export const NIGHT_AMBIENT=[.62,.70,.88] as const;
const WARM=[1.12,.78,.38] as const;
export function stationLight(pieces:readonly {x:number;y:number;url:string}[]):WorldLight{
  return {ambient:NIGHT_AMBIENT,lamps:pieces.filter(p=>p.url.endsWith('/lamp.svg')).map(p=>({x:p.x+24,y:p.y+134,height:108,radius:235,strength:1.15}))};
}

export function lampStrength(lamp:WorldLamp,x:number,y:number,height=32){
  const distance=Math.hypot(x-lamp.x,(y-lamp.y)*1.35,lamp.height-height);
  return lamp.strength*Math.max(0,1-distance/lamp.radius)**2;
}

/** A small material-neutral light field; original alpha and geometry survive. */
export function lightPixels(source:ImageData,output:ImageData,rig:WorldLight,x:number,y:number,originX:number,originY:number,scaleX=1,scaleY=1,rotation=0){
  const a=source.data,b=output.data,w=source.width,cos=Math.cos(rotation),sin=Math.sin(rotation);
  for(let i=0;i<a.length;i+=4){
    b[i+3]=a[i+3];if(!a[i+3]){b[i]=b[i+1]=b[i+2]=0;continue;}
    const sx=(i/4%w-originX)*scaleX,sy=(Math.floor(i/4/w)-originY)*scaleY;
    const wx=x+sx*cos-sy*sin,height=Math.max(0,-sx*sin-sy*cos);
    let warmth=0;
    for(const lamp of rig.lamps){
      // A restrained side plane catches the lamp without flattening the model's
      // authored shadows. Light reaches the head more than the feet.
      const side=1+Math.max(-.18,Math.min(.18,(wx-x)*(lamp.x-x)/5000));
      warmth+=lampStrength(lamp,wx,y,height)*side;
    }
    warmth=Math.min(.65,warmth);
    // Diffuse illumination multiplies reflectance: warm light must not bleach
    // dark eyes, cloth folds or tool details into one flat orange silhouette.
    for(let c=0;c<3;c++)b[i+c]=a[i+c]*(rig.ambient[c]+warmth*WARM[c]);
  }
}

/** Strongest local lamp supplies one readable cast shadow, rather than a fan. */
export function castShadow(rig:WorldLight,x:number,y:number){
  let lamp:WorldLamp|undefined,strength=0;
  for(const candidate of rig.lamps){const s=lampStrength(candidate,x,y);if(s>strength){lamp=candidate;strength=s;}}
  if(!lamp||strength<.025)return;
  const height=58,ratio=height/Math.max(40,lamp.height-height);
  return {dx:Math.max(-105,Math.min(105,(x-lamp.x)*ratio)),dy:Math.max(-42,Math.min(48,(y-lamp.y)*ratio*.45+8)),alpha:Math.min(.30,strength*.58)};
}
