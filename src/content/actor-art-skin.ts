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
export interface RasterAtlasPage {url:string;x:number;y:number;width:number;height:number}
export interface RasterActorAsset {url:string;width:number;height:number;pages?:RasterAtlasPage[]}
export const RASTER_ACTORS=manifest as Record<string,RasterActorAsset>;
export function actorArtUrl(url:string,skin=actorArtSkin()){
  if(skin==='vector')return url;
  const at=url.indexOf('art/vector/');
  if(at<0)return url;
  const replacement=RASTER_ACTORS[url.slice(at)];
  return replacement?url.slice(0,at)+replacement.url:url;
}
const dimensions=new Map<string,RasterActorAsset|RasterAtlasPage>(Object.values(RASTER_ACTORS).flatMap(asset=>(asset.pages??[asset]).map(page=>[page.url,page] as const)));
const textureDimensions=new Map(Object.entries(RASTER_ACTORS).map(([path,asset])=>{
  const name=path.slice(path.lastIndexOf('/')+1,-4);
  const key=path.includes('/animation/')?name.replace(/^(.*)-(front|left|right|back)$/, '$1-motion-$2'):name;
  return [key,asset] as const;
}));
export const actorTextureDimensions=(key:string)=>textureDimensions.get(key);
export const actorAtlasPageKey=(key:string,page:number)=>`${key}-raster-page-${page}`;
export const actorAtlasPages=(prefix:string)=>Object.entries(RASTER_ACTORS).filter(([path])=>path.startsWith(`art/vector/${prefix}/`)).flatMap(([path,asset])=>{
  const key=path.slice(path.lastIndexOf('/')+1,-4);
  return asset.pages?.map((page,i)=>({key:actorAtlasPageKey(key,i),url:page.url}))??[];
});
/** Restore logical coordinates before Phaser creates/crops native frames. */
export function rasterActorDimensions(url:string){
  const at=url.indexOf('art/raster-actors/');
  return at<0?undefined:dimensions.get(url.slice(at).split(/[?#]/)[0]);
}
