import stationMap from './maps/station.json' with { type: 'json' };
import yardMap from './maps/yard.json' with { type: 'json' };
import tunnelMap from './maps/tunnel.json' with { type: 'json' };
import type { MapId, GameState } from '../../rules/state';
export const TILE = 24, WIDTH = 1008, HEIGHT = 624;
export interface MapObject { id: string; x: number; y: number; label: string; sprite?: string; doneFlag?: string; hiddenFlag?: string; requiredFlag?: string; sign?: boolean }
export interface MapData { id: MapId; name: string; subtitle: string; width?: number; height?: number; objects: MapObject[]; solid: [number, number, number, number][] }
export function collision(map: { layers: { type: string; objects?: { x: number; y: number; width: number; height: number }[] }[] }): [number, number, number, number][] {
  return map.layers.filter(l=>l.type==='objectgroup').flatMap(l=>l.objects??[]).map(o=>[o.x/TILE,o.y/TILE,o.width/TILE,o.height/TILE]);
}
export const MAPS: Record<'station'|'yard'|'tunnel', MapData> = {
  station: { id: 'station', name: 'Larkspur station', subtitle: 'The 18:40 has arrived. It is not on the timetable.',
    solid: collision(stationMap),
    objects: [
      { id: 'mira', x: 27, y: 10, label: 'Mira', sprite: 'mira', doneFlag: 'metMira', hiddenFlag: 'orrinJoined' },
      { id: 'orrin', x: 17, y: 14, label: 'Orrin', sprite: 'orrin', hiddenFlag: 'orrinJoined' },
      { id: 'master', x: 13, y: 7, label: 'Stationmaster', sprite: 'master' },
      { id: 'clerk', x: 28, y: 18, label: 'Iona · supplies & rest', sprite: 'clerk' },
      { id: 'notice', x: 20, y: 12, label: 'Branch closure notice', sign: true, doneFlag: 'noticeRead' },
      { id: 'to-yard', x: 2, y: 11, label: 'Old signal yard', sign: true },
      { id: 'b-family-larkspur', x: 23, y: 20, label: 'Mira and Bram', sprite: 'mira', requiredFlag: 'bEvacuated' },
      { id: 'train', x: 32, y: 10, label: 'The unscheduled train', sign: true },
    ] },
  yard: { id: 'yard', name: 'Old signal yard', subtitle: 'The abandoned line still has a pulse.',
    solid: collision(yardMap),
    objects: [
      { id: 'yard-fight', x: 24, y: 14, label: 'Track hounds', sprite: 'hound', hiddenFlag: 'yardCleared' },
      { id: 'relay', x: 12, y: 10, label: 'Old signal relay', sign: true, doneFlag: 'relayRepaired' },
      { id: 'scrap', x: 30, y: 20, label: 'A warm scrap heap', sprite: 'rock', doneFlag: 'scrapCleared' },
      { id: 'to-tunnel', x: 9, y: 8, label: 'Sealed tunnel', sign: true },
      { id: 'to-station', x: 37, y: 18, label: 'Larkspur station', sign: true },
    ] },
  tunnel: { id: 'tunnel', name: 'Rillbridge tunnel', subtitle: 'Somewhere ahead, a bell is ringing.',
    solid: collision(tunnelMap),
    objects: [
      { id: 'tunnel-fight', x: 19, y: 12, label: 'A warm furnace', sprite: 'guardian', hiddenFlag: 'tunnelCleared' },
      { id: 'timetable', x: 21, y: 8, label: 'The maintenance timetable', sign: true, doneFlag: 'timetableRead' },
      { id: 'cache', x: 22, y: 19, label: 'Maintenance supplies', sign: true, doneFlag: 'cacheTaken' },
      { id: 'inspector', x: 33, y: 13, label: 'The inspector', sprite: 'inspector', hiddenFlag: 'inspectorCleared' },
      { id: 'disk-b', x: 39, y: 13, label: 'Morning light', sign: true },
      { id: 'to-yard', x: 2, y: 13, label: 'Old signal yard', sign: true },
    ] },
};
export function visibleObjects(map: MapData, s: GameState): MapObject[] { return map.objects.filter(o => (!o.hiddenFlag || !s.flags[o.hiddenFlag]) && (!o.requiredFlag || s.flags[o.requiredFlag])); }
export const mapSize = (map:MapData) => ({width:map.width??WIDTH,height:map.height??HEIGHT});
export function walkable(map: MapData, x: number, y: number): boolean {
  return x >= 0 && x < Math.floor(mapSize(map).width/TILE) && y >= 0 && y < Math.floor(mapSize(map).height/TILE) && !map.solid.some(([sx, sy, w, h]) => x >= sx && x < sx + w && y >= sy && y < sy + h);
}
export function worldPath(map: MapData, from: { x: number; y: number }, to: { x: number; y: number }): { x: number; y: number }[] {
  if (!walkable(map, to.x, to.y)) return [];
  const columns=Math.floor(mapSize(map).width/TILE);
  const id = (p: { x: number; y: number }) => p.x + p.y * columns;
  const queue = [{ ...from }]; const previous = new Map<number, number>([[id(from), -1]]);
  for (let i = 0; i < queue.length; i++) {
    const p = queue[i]; if (p.x === to.x && p.y === to.y) break;
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const next = { x: p.x + dx, y: p.y + dy };
      if (!walkable(map, next.x, next.y) || previous.has(id(next))) continue;
      previous.set(id(next), id(p)); queue.push(next);
    }
  }
  if (!previous.has(id(to))) return [];
  const path = []; let current = id(to);
  while (current !== id(from)) { path.push({ x: current % columns, y: Math.floor(current / columns) }); current = previous.get(current)!; }
  return path.reverse();
}
