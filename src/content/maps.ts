import {CHAPTER_SEVEN_MAPS} from './chapter-seven/maps';
import { CHAPTER_SIX_MAPS } from './chapter-six/maps';
import { partyLeader } from '../rules/state';
import type { InteractionKind } from './interaction-markers';
import { CHAPTER_FIVE_MAPS } from './chapter-five/maps';
import { CHAPTER_THREE_MAPS } from './chapter-three/maps';
import { CHAPTER_FOUR_MAPS } from './chapter-four/maps';
import { CHAPTER_TWO_MAPS } from './chapter-two/maps';
import { CHAPTER_ONE_MAPS } from './chapter-one/maps';
import { gridPoint, mapPoints, properties, tileWalkable, type TileMap } from './tilemaps';
import type { Cinematic } from './cinematics';
import type { CharacterId } from './characters';
import type { CivilianSprite } from './civilians';
import type { MapId, GameState } from '../rules/state';
export const TILE = 24, WIDTH = 1008, HEIGHT = 624;
export interface MapObject { kind:InteractionKind; rest?:boolean; marker?:boolean; storyUntil?:string; id: string; x: number; y: number; label: string; sprite?: string; spriteHiddenFlag?: string; doneFlag?: string; hiddenFlag?: string; requiredFlag?: string; accessFlag?: string; markerFlags?:string; sign?: boolean; hitArea?: {x:number;y:number;width:number;height:number} }
export interface MapPerson { id:string; x:number; y:number; sprite:CivilianSprite; projection?:boolean; hiddenFlag?:string; requiredFlag?:string }
export interface MapData { id: MapId; name: string; subtitle: string; width?: number; height?: number; cameraLeadY?:number; art?:string; tiles?:TileMap; objects: MapObject[]; people?:MapPerson[]; gates?: { x:number; y:number; width:number; height:number; openFlag:string }[]; solid: [number, number, number, number][] }
export const MAPS: Record<MapId, MapData> = {
  ...CHAPTER_SIX_MAPS,...CHAPTER_SEVEN_MAPS, ...CHAPTER_FIVE_MAPS, ...CHAPTER_FOUR_MAPS, ...CHAPTER_TWO_MAPS, ...CHAPTER_THREE_MAPS, ...CHAPTER_ONE_MAPS,
};
/** Named story endpoints live alongside the routes they use in the Tiled map. */
export function arrival(map:MapId,name:string){
  const point=mapPoints(MAPS[map].tiles!, 'Arrivals').find(p=>p.name===name);
  if(!point)throw new Error(`Missing arrival ${map}:${name}`);
  return {map,...gridPoint(point)};
}
export function stage(map:MapId,id:string):Cinematic['actors']{
  return mapPoints(MAPS[map].tiles!,`Scene:${id}`).map(p=>({id:p.name as CharacterId,at:gridPoint(p),hidden:properties(p).hidden===true,projection:properties(p).projection===true}));
}
export function visibleObjects(map: MapData, s: GameState): MapObject[] { return map.objects.filter(o => (map.id!=='airship'||o.sprite!==partyLeader(s))&&(!o.hiddenFlag || !s.flags[o.hiddenFlag]) && (!o.requiredFlag || s.flags[o.requiredFlag])); }
export function visiblePeople(map:MapData,s:Pick<GameState,'flags'>):MapPerson[]{ return (map.people??[]).filter(p=>(!p.hiddenFlag||!s.flags[p.hiddenFlag])&&(!p.requiredFlag||s.flags[p.requiredFlag])); }
export const mapSize = (map:MapData) => ({width:map.width??WIDTH,height:map.height??HEIGHT});
export function walkable(map: MapData, x: number, y: number, state?:Pick<GameState,'flags'>): boolean {
  return x >= 0 && x < Math.floor(mapSize(map).width/TILE) && y >= 0 && y < Math.floor(mapSize(map).height/TILE) && !(map.gates??[]).some(g=>!state?.flags[g.openFlag]&&x>=g.x&&x<g.x+g.width&&y>=g.y&&y<g.y+g.height) && (map.tiles?tileWalkable(map.tiles,x,y,state):!map.solid.some(([sx, sy, w, h]) => x >= sx && x < sx + w && y >= sy && y < sy + h));
}
function searchWorld(map:MapData,from:{x:number;y:number},state?:Pick<GameState,'flags'>,to?:{x:number;y:number}){
  const columns=Math.floor(mapSize(map).width/TILE);
  const id = (p: { x: number; y: number }) => p.x + p.y * columns;
  const queue = [{ ...from }]; const previous = new Map<number, number>([[id(from), -1]]);
  for (let i = 0; i < queue.length; i++) {
    const p = queue[i]; if (to&&p.x === to.x && p.y === to.y) break;
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const next = { x: p.x + dx, y: p.y + dy };
      if (!walkable(map, next.x, next.y, state) || previous.has(id(next))) continue;
      previous.set(id(next), id(p)); queue.push(next);
    }
  }
  return {queue,previous,id,columns};
}
/** Layout edits may cover a saved floor or crop it away. Keep valid current
 * saves on the nearest floor connected to the map's authored safe arrival. */
export function restorePoint(map:MapData,point:{x:number;y:number},state?:Pick<GameState,'flags'>):{x:number;y:number}|undefined{
  if(walkable(map,point.x,point.y,state))return {x:point.x,y:point.y};
  if(!map.tiles)return;
  const name=properties(map.tiles).safeArrival,anchor=mapPoints(map.tiles,'Arrivals').find(p=>p.name===name);
  if(!anchor)return;
  const start=gridPoint(anchor);if(!walkable(map,start.x,start.y,state))return;
  const distance=(p:{x:number;y:number})=>Math.abs(p.x-point.x)+Math.abs(p.y-point.y);
  return searchWorld(map,start,state).queue.reduce((best,p)=>distance(p)<distance(best)?p:best,start);
}
export function worldPath(map: MapData, from: { x: number; y: number }, to: { x: number; y: number }, state?:Pick<GameState,'flags'>): { x: number; y: number }[] {
  if (!walkable(map, to.x, to.y, state)) return [];
  const {previous,id,columns}=searchWorld(map,from,state,to);
  if (!previous.has(id(to))) return [];
  const path = []; let current = id(to);
  while (current !== id(from)) { path.push({ x: current % columns, y: Math.floor(current / columns) }); current = previous.get(current)!; }
  return path.reverse();
}
