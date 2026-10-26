export type MapArtSkin='vector'|'raster';
const KEY='borrowed-tomorrow-map-art';
let session:MapArtSkin|undefined;
export function mapArtSkin():MapArtSkin {
  if(session)return session;
  try{return localStorage.getItem(KEY)==='vector'?'vector':'raster';}catch{return 'raster';}
}
/** Presentation preference, deliberately separate from campaign saves. */
export function setMapArtSkin(skin:MapArtSkin){
  session=skin;
  try{localStorage.setItem(KEY,skin);}catch{/* Still available for this session. */}
}
