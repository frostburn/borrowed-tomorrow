import { add, distance, type Hex } from './hex';

export interface Body { hex:Hex; footprint?:readonly Hex[] }
/** Offsets are axial and move with the anchor; omitted footprints occupy one hex. */
export function occupiedHexes(unit:Body,anchor=unit.hex):Hex[]{
  return unit.footprint?.length?unit.footprint.map(part=>add(anchor,part)):[anchor];
}
export function bodyDistance(a:Body,b:Body){
  return Math.min(...occupiedHexes(a).flatMap(x=>occupiedHexes(b).map(y=>distance(x,y))));
}
