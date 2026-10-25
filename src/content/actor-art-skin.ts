import manifest from './raster-actors.json' with {type:'json'};

export type ActorArtSkin='vector'|'raster';
const KEY='borrowed-tomorrow-actor-art';
let session:ActorArtSkin|undefined;
export function actorArtSkin():ActorArtSkin {
  if(session)return session;
  try{return localStorage.getItem(KEY)==='vector'?'vector':'raster';}catch{return 'raster';}
}
/** Art settings are independent of campaign and workshop character saves. */
export function setActorArtSkin(skin:ActorArtSkin){
  session=skin;
  try{localStorage.setItem(KEY,skin);}catch{/* Session-only when storage is unavailable. */}
}
export const RASTER_ACTORS=manifest as Record<string,{url:string;width:number;height:number}>;
export function actorArtUrl(url:string,skin=actorArtSkin()){
  if(skin==='vector')return url;
  const at=url.indexOf('art/vector/');
  if(at<0)return url;
  const replacement=RASTER_ACTORS[url.slice(at)];
  return replacement?url.slice(0,at)+replacement.url:url;
}
const dimensions=new Map(Object.values(RASTER_ACTORS).map(asset=>[asset.url,asset]));
const textureDimensions=new Map(Object.entries(RASTER_ACTORS).map(([path,asset])=>{
  const name=path.slice(path.lastIndexOf('/')+1,-4);
  const key=path.includes('/animation/')?name.replace(/^(.*)-(front|left|right|back)$/, '$1-motion-$2'):name;
  return [key,asset] as const;
}));
export const actorTextureDimensions=(key:string)=>textureDimensions.get(key);
/** Restore logical coordinates before Phaser creates/crops native frames. */
export function rasterActorDimensions(url:string){
  const at=url.indexOf('art/raster-actors/');
  return at<0?undefined:dimensions.get(url.slice(at).split(/[?#]/)[0]);
}
