import { CHAPTER_THREE_MAPS } from './chapter-three/maps';
import { CHAPTER_FOUR_MAPS } from './chapter-four/maps';
import { CHAPTER_TWO_MAPS } from './chapter-two/maps';
import { CHAPTER_ONE_MAPS } from './chapter-one/maps';
import { gridPoint, mapPoints, properties, tileWalkable, type TileMap } from './tilemaps';
import type { Cinematic } from './cinematics';
import type { CharacterId } from './characters';
import type { MapId, GameState } from '../rules/state';
export const TILE = 24, WIDTH = 1008, HEIGHT = 624;
export interface MapObject { id: string; x: number; y: number; label: string; sprite?: string; spriteHiddenFlag?: string; doneFlag?: string; hiddenFlag?: string; requiredFlag?: string; accessFlag?: string; sign?: boolean; hitArea?: {x:number;y:number;width:number;height:number} }
export interface MapData { id: MapId; name: string; subtitle: string; width?: number; height?: number; art?:string; tiles?:TileMap; objects: MapObject[]; gates?: { x:number; y:number; width:number; height:number; openFlag:string }[]; solid: [number, number, number, number][] }
export const MAPS: Record<MapId, MapData> = {
  ...CHAPTER_FOUR_MAPS, ...CHAPTER_TWO_MAPS, ...CHAPTER_THREE_MAPS, ...CHAPTER_ONE_MAPS,
};
/** Named story endpoints live alongside the routes they use in the Tiled map. */
export function arrival(map:MapId,name:string){
  const point=mapPoints(MAPS[map].tiles!, 'Arrivals').find(p=>p.name===name);
  if(!point)throw new Error(`Missing arrival ${map}:${name}`);
  return {map,...gridPoint(point)};
}
export function stage(map:MapId,id:string):Cinematic['actors']{
  return mapPoints(MAPS[map].tiles!,`Scene:${id}`).map(p=>({id:p.name as CharacterId,at:gridPoint(p),hidden:properties(p).hidden===true}));
}
export function visibleObjects(map: MapData, s: GameState): MapObject[] { return map.objects.filter(o => (!o.hiddenFlag || !s.flags[o.hiddenFlag]) && (!o.requiredFlag || s.flags[o.requiredFlag])); }
export const mapSize = (map:MapData) => ({width:map.width??WIDTH,height:map.height??HEIGHT});
export function walkable(map: MapData, x: number, y: number, state?:Pick<GameState,'flags'>): boolean {
  return x >= 0 && x < Math.floor(mapSize(map).width/TILE) && y >= 0 && y < Math.floor(mapSize(map).height/TILE) && !(map.gates??[]).some(g=>!state?.flags[g.openFlag]&&x>=g.x&&x<g.x+g.width&&y>=g.y&&y<g.y+g.height) && (map.tiles?tileWalkable(map.tiles,x,y,state):!map.solid.some(([sx, sy, w, h]) => x >= sx && x < sx + w && y >= sy && y < sy + h));
}
export function worldPath(map: MapData, from: { x: number; y: number }, to: { x: number; y: number }, state?:Pick<GameState,'flags'>): { x: number; y: number }[] {
  if (!walkable(map, to.x, to.y, state)) return [];
  const columns=Math.floor(mapSize(map).width/TILE);
  const id = (p: { x: number; y: number }) => p.x + p.y * columns;
  const queue = [{ ...from }]; const previous = new Map<number, number>([[id(from), -1]]);
  for (let i = 0; i < queue.length; i++) {
    const p = queue[i]; if (p.x === to.x && p.y === to.y) break;
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const next = { x: p.x + dx, y: p.y + dy };
      if (!walkable(map, next.x, next.y, state) || previous.has(id(next))) continue;
      previous.set(id(next), id(p)); queue.push(next);
    }
  }
  if (!previous.has(id(to))) return [];
  const path = []; let current = id(to);
  while (current !== id(from)) { path.push({ x: current % columns, y: Math.floor(current / columns) }); current = previous.get(current)!; }
  return path.reverse();
}
