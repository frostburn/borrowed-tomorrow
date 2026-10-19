import { CHAPTER_THREE_MAPS } from './chapter-three/maps';
import { CHAPTER_FOUR_MAPS } from './chapter-four/maps';
import { CHAPTER_TWO_MAPS } from './chapter-two/maps';
import stationMap from './chapter-one/maps/station.json' with { type: 'json' };
import yardMap from './chapter-one/maps/yard.json' with { type: 'json' };
import tunnelMap from './chapter-one/maps/tunnel.json' with { type: 'json' };
import villageMap from './chapter-one/maps/rillbridge.json' with { type: 'json' };
import type { MapId, GameState } from '../rules/state';
export const TILE = 24, WIDTH = 1008, HEIGHT = 624;
export interface MapObject { id: string; x: number; y: number; label: string; sprite?: string; spriteHiddenFlag?: string; doneFlag?: string; hiddenFlag?: string; requiredFlag?: string; accessFlag?: string; sign?: boolean; hitArea?: {x:number;y:number;width:number;height:number} }
export interface MapData { id: MapId; name: string; subtitle: string; width?: number; height?: number; art?:string; objects: MapObject[]; gates?: { x:number; y:number; width:number; height:number; openFlag:string }[]; solid: [number, number, number, number][] }
export function collision(map: { layers: { type: string; objects?: { x: number; y: number; width: number; height: number }[] }[] }): [number, number, number, number][] {
  return map.layers.filter(l=>l.type==='objectgroup').flatMap(l=>l.objects??[]).map(o=>[o.x/TILE,o.y/TILE,o.width/TILE,o.height/TILE]);
}
export const MAPS: Record<MapId, MapData> = {
  ...CHAPTER_FOUR_MAPS,
  ...CHAPTER_TWO_MAPS,
  ...CHAPTER_THREE_MAPS,
  station: { id: 'station', name: 'Larkspur station', subtitle: 'Festival night · Tomas is home from the capital.', solid: collision(stationMap), objects: [
    { id: 'tomas', x: 25, y: 13, label: 'Tomas · your brother', sprite: 'tomas', hiddenFlag: 'raidSeen' },
    { id: 'ansel', x: 20, y: 12, label: 'Stationmaster Ansel', sprite: 'master', hiddenFlag: 'raidSeen' },
    { id: 'memorial', x: 23, y: 13, label: 'Ansel’s cap', sign: true, requiredFlag: 'raidSeen', doneFlag: 'farewellSeen' },
    { id: 'iona', x: 28, y: 18, label: 'Iona · supplies & rest', sprite: 'clerk' },
    { id: 'blessing', x: 17, y: 14, label: 'Festival lanterns · the Benefactor', sign: true, doneFlag: 'blessingRead' },
    { id: 'pursuit', x: 20, y: 14, label: 'Break through the pursuit hounds', sprite: 'hound', requiredFlag: 'raidSeen', hiddenFlag: 'escapeWon' },
    { id: 'west-yard', x: 2, y: 11, label: 'Western workshop · Orrin', sign: true },
    { id: 'imperial-train', x: 32, y: 10, label: 'Imperial platform', sign: true },
  ] },
  yard: { id: 'yard', name: 'Orrin’s workshop', subtitle: 'A steam engine, a disused branch, and a way east.', solid: collision(yardMap), objects: [
    { id: 'orrin', x: 25, y: 13, label: 'Orrin · the independent engine', sprite: 'orrin', hiddenFlag: 'orrinJoined' },
    { id: 'engine', x: 28, y: 9, label: 'Orrin’s coal-fired engine', sign: true, requiredFlag: 'orrinJoined' },
    { id: 'workshop-cache', x: 30, y: 20, label: 'Engine shed', sprite: 'hound', hiddenFlag: 'workshopWon' },
    { id: 'branch', x: 9, y: 8, label: 'Rillbridge branch · eastbound', sign: true },
    { id: 'yard-home', x: 37, y: 18, label: 'Larkspur station', sign: true },
  ] },
  rillbridge: { id: 'rillbridge', name: 'Rillbridge', subtitle: 'The collector moves. The people do not.', width: 1595, height: 986, solid: collision(villageMap), objects: [
    { id: 'tilda', x: 44, y: 13, label: 'Tilda · the bakery', sprite: 'tilda' },
    { id: 'elspeth', x: 27, y: 19, label: 'Elspeth · the square', sprite: 'elspeth' },
    { id: 'still-water', x: 25, y: 15, label: 'Water hanging in the air', sign: true, doneFlag: 'waterSeen' },
    { id: 'collector', x: 58, y: 17, label: 'The imperial collector', sprite: 'guardian', hiddenFlag: 'collectorDefeated' },
    { id: 'release', x: 58, y: 17, label: 'Break open the collector', sign: true, requiredFlag: 'collectorDefeated', doneFlag: 'villageFreed' },
    { id: 'east-pass', x: 32, y: 11, label: 'Eastern pass · follow Tomas’s coach', sign: true },
    { id: 'village-yard', x: 2, y: 18, label: 'Return along the branch', sign: true },
  ] },
  tunnel: { id: 'tunnel', name: 'The eastern pass', subtitle: 'Captain Alban holds the crossing.', solid: collision(tunnelMap), objects: [
    { id: 'captain', x: 33, y: 14, label: 'Captain Alban', sprite: 'alban', hiddenFlag: 'captainDefeated' },
    { id: 'sun-mural', x: 21, y: 8, label: 'The hollow sun · an old mural', sign: true, doneFlag: 'muralRead' },
    { id: 'shelter', x: 22, y: 19, label: 'Old shelter · rest & supplies', sign: true },
    { id: 'departure', x: 37, y: 14, label: 'Board Orrin’s engine · Iron Coast', sign: true },
    { id: 'pass-village', x: 2, y: 13, label: 'Rillbridge', sign: true },
  ] },
};
export function visibleObjects(map: MapData, s: GameState): MapObject[] { return map.objects.filter(o => (!o.hiddenFlag || !s.flags[o.hiddenFlag]) && (!o.requiredFlag || s.flags[o.requiredFlag])); }
export const mapSize = (map:MapData) => ({width:map.width??WIDTH,height:map.height??HEIGHT});
export function walkable(map: MapData, x: number, y: number, state?:Pick<GameState,'flags'>): boolean {
  return x >= 0 && x < Math.floor(mapSize(map).width/TILE) && y >= 0 && y < Math.floor(mapSize(map).height/TILE) && !(map.gates??[]).some(g=>!state?.flags[g.openFlag]&&x>=g.x&&x<g.x+g.width&&y>=g.y&&y<g.y+g.height) && !map.solid.some(([sx, sy, w, h]) => x >= sx && x < sx + w && y >= sy && y < sy + h);
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
