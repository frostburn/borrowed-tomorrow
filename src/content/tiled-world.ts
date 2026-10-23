import { gridPoint, mapPoints, properties, type TileMap } from './tilemaps';
import type { MapData, MapObject, MapPerson } from './maps';
import type { MapId } from '../rules/state';

/** Tiled owns the scenery, footing and story destinations of a converted map. */
export function tiledWorld(id:MapId,tiles:TileMap):MapData{
  const p=properties(tiles);
  return {id,name:String(p.name),subtitle:String(p.subtitle),width:tiles.width*tiles.tilewidth,height:tiles.height*tiles.tileheight,cameraLeadY:Number(p.cameraLeadY??0),tiles,solid:[],
    people:mapPoints(tiles,'People').map(o=>({id:o.name,...gridPoint(o),...properties(o)}) as MapPerson),
    objects:mapPoints(tiles,'Interactions').map(o=>{
      const {approachX,approachY,...values}=properties(o);
      const area=o.width&&o.height?{x:o.x/24,y:o.y/24,width:o.width/24,height:o.height/24}:undefined;
      return {id:o.name,...gridPoint(o),...values,...(area?{x:Number(approachX),y:Number(approachY),hitArea:area}:{})} as MapObject;
    })};
}
