import { MAPS as A_MAPS } from './disk-a/maps';
import { B_MAPS } from './disk-b/maps';
import { D_MAPS } from './disk-d/maps';
import { C_MAPS } from './disk-c/maps';
import type { MapId } from '../rules/state';
import type { MapData } from './disk-a/maps';
export { HEIGHT,TILE,WIDTH,visibleObjects,walkable,worldPath,mapSize } from './disk-a/maps';
export type { MapData,MapObject } from './disk-a/maps';
export const MAPS:Record<MapId,MapData>={...A_MAPS,...B_MAPS,...C_MAPS,...D_MAPS};
