import station from './maps/station.json' with { type: 'json' };
import yard from './maps/yard.json' with { type: 'json' };
import rillbridge from './maps/rillbridge.json' with { type: 'json' };
import tunnel from './maps/tunnel.json' with { type: 'json' };
import pursuit from './maps/battle-pursuit.json' with { type: 'json' };
import workshop from './maps/battle-workshop.json' with { type: 'json' };
import collector from './maps/battle-collector.json' with { type: 'json' };
import captain from './maps/battle-captain.json' with { type: 'json' };
import { gridPoint, mapPoints, properties, type TileMap } from '../tilemaps';
import type { MapData, MapObject } from '../maps';
import type { MapId } from '../../rules/state';

function world(id:MapId,tiles:TileMap):MapData{
  const p=properties(tiles);
  return {id,name:String(p.name),subtitle:String(p.subtitle),width:tiles.width*tiles.tilewidth,height:tiles.height*tiles.tileheight,tiles,solid:[],
    objects:mapPoints(tiles,'Interactions').map(o=>({id:o.name,...gridPoint(o),...properties(o)}) as MapObject)};
}
export const CHAPTER_ONE_MAPS = {station:world('station',station),yard:world('yard',yard),rillbridge:world('rillbridge',rillbridge),tunnel:world('tunnel',tunnel)};
export const CHAPTER_ONE_BATTLES:Record<string,TileMap> = {pursuit,workshop,collector,captain};
