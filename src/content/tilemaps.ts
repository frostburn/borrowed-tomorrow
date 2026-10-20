import pageDefinitions from '../../assets/tiles/tile-definitions';
import tileset from '../../assets/tiles/chapter-one.tileset.json' with { type: 'json' };
import type { GameState } from '../rules/state';

export const TILESET = {...tileset,tiles:pageDefinitions.flatMap((p,i)=>p.tiles.map(t=>({...t,id:t.id+tileset.pages[i].firstgid-1})))};
export const TILE_PAGES = TILESET.pages;
/** Only pages referenced by this map are required to enter it. */
export function tilePages(map:TileMap){
  const gids=new Set(map.layers.flatMap(l=>l.data??[]));
  return TILE_PAGES.filter(p=>{for(const gid of gids)if(gid>=p.firstgid&&gid<p.firstgid+p.tilecount)return true;return false;});
}
export const tileFrame = (gid:number) => {
  const page=TILE_PAGES.find(p=>gid>=p.firstgid&&gid<p.firstgid+p.tilecount)!;
  return {key:page.name,frame:gid-page.firstgid};
};
export interface Property { name:string; type:string; value:string|number|boolean }
export interface TileLayer { id:number; name:string; type:string; width?:number; height?:number; data?:number[]; visible:boolean; properties?:Property[]; objects?:TileObject[] }
export interface TileObject { name:string; x:number; y:number; width?:number; height?:number; properties?:Property[] }
export interface TileMap { width:number; height:number; tilewidth:number; tileheight:number; layers:TileLayer[]; properties:Property[]; tilesets:{firstgid:number;source:string}[] }
export const properties = (object:{properties?:Property[]}) => Object.fromEntries((object.properties??[]).map(p=>[p.name,p.value]));
export const tileProperties = TILESET.tiles.map(properties);
export function layerVisible(layer:TileLayer,state?:Pick<GameState,'flags'>){
  const p=properties(layer),flags=state?.flags??{};
  return layer.visible&&(!p.requiredFlag||!!flags[String(p.requiredFlag)])&&(!p.hiddenFlag||!flags[String(p.hiddenFlag)]);
}
/** Upper floor tiles (for example a bridge) can replace the terrain below them. */
export function tileWalkable(map:TileMap,x:number,y:number,state?:Pick<GameState,'flags'>){
  let walkable=false;
  for(const layer of map.layers){
    if(!layer.data||!layerVisible(layer,state))continue;
    const gid=layer.data[y*map.width+x],value=tileProperties[gid-1]?.walkable;
    if(typeof value==='boolean')walkable=value;
  }
  return walkable;
}
export const mapPoints = (map:TileMap,group:string) => map.layers.find(l=>l.type==='objectgroup'&&l.name===group)?.objects??[];
export const gridPoint = (point:TileObject) => ({x:Math.floor(point.x/24),y:Math.floor(point.y/24)});
