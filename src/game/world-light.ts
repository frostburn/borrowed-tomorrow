/** Screen-ground coordinates, with lamp height in native actor pixels. */
export interface WorldLamp { x:number; y:number; height:number; radius:number; strength:number; shadowStrength?:number; beam?:{reach:number;width:number;spread:number} }
export interface WorldLight { ambient:readonly [number,number,number]; lamps:readonly WorldLamp[] }
export const NIGHT_AMBIENT=[.62,.70,.88] as const;
const WARM=[1.12,.78,.38] as const;
export function stationLight(pieces:readonly {x:number;y:number;url:string}[]):WorldLight{
  const lamps:WorldLamp[]=pieces.filter(p=>p.url.endsWith('/lamp.svg')).map(p=>({x:p.x+24,y:p.y+134,height:108,radius:235,strength:1.15}));
  for(const house of pieces.filter(p=>p.url.endsWith('/station-house.svg'))){
    for(const x of [42,84,204])lamps.push({x:house.x+x,y:house.y+201,height:80,radius:185,strength:2.3,beam:{reach:90,width:14,spread:.38}});
  }
  // Small overhead festival lanterns act together as a broad warm fill. They
  // illuminate the whole dramatic space with restrained shadows alongside the sharper window and street lights.
  for(const strand of pieces.filter(p=>p.url.endsWith('/bunting.svg'))){
    for(const [x,y] of [[21,25],[75,37],[129,40],[183,30]])lamps.push({x:strand.x+x,y:strand.y+y+108,height:108,radius:330,strength:.70,shadowStrength:.3});
  }
  return {ambient:NIGHT_AMBIENT,lamps};
}

export function lampStrength(lamp:WorldLamp,x:number,y:number,height=32){
  const distance=Math.hypot(x-lamp.x,(y-lamp.y)*1.35,lamp.height-height);
  let aperture=1;
  if(lamp.beam){
    const forward=y-lamp.y;
    if(forward<0||forward>lamp.beam.reach)return 0;
    const width=lamp.beam.width+forward*lamp.beam.spread;
    aperture=Math.min(1,Math.max(0,(width-Math.abs(x-lamp.x-forward*.10))/8));
  }
  return lamp.strength*Math.max(0,1-distance/lamp.radius)**2*aperture;
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

/** Keep up to three meaningful sources, with a shared opacity budget. */
export function castShadows(rig:WorldLight,x:number,y:number){
  const candidates=rig.lamps.map(light=>({light,strength:lampStrength(light,x,y)*(light.shadowStrength??1)})).filter(s=>s.strength>=.025).sort((a,b)=>b.strength-a.strength);
  const selected=candidates.filter(s=>s.strength>=candidates[0].strength*.18).slice(0,3);
  const total=selected.reduce((sum,s)=>sum+Math.min(.30,s.strength*.58),0),budget=Math.min(1,.45/Math.max(.001,total));
  return selected.map(({light,strength})=>{
    const ratio=58/Math.max(40,light.height-58);
    return {dx:Math.max(-105,Math.min(105,(x-light.x)*ratio)),dy:Math.max(-42,Math.min(48,(y-light.y)*ratio*.45+8)),alpha:Math.min(.30,strength*.58)*budget,light};
  });
}
