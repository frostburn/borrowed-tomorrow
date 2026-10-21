import scenes from './chapter-one/scene-art.json' with { type: 'json' };
import { layerVisible, properties, type TileMap } from './tilemaps';
import type { GameState } from '../rules/state';

export interface ScenePiece { key:string; url:string; x:number; y:number; width:number; height:number; depth:number; layerId:number }
/** Whole SVG planes and props; Tiled remains the layout/collision source. */
export function sceneArt(map?:TileMap):ScenePiece[]|undefined {
  const id=map&&properties(map).sceneArt;
  return id ? (scenes as Record<string,ScenePiece[]>)[String(id)] : undefined;
}
export function visibleSceneArt(map:TileMap,state?:Pick<GameState,'flags'>,hidden?:Set<number>){
  return sceneArt(map)?.filter(piece=>map.layers.some(layer=>layer.id===piece.layerId&&!hidden?.has(layer.id)&&layerVisible(layer,state)));
}
export const SCENE_ASSETS=[...new Map(Object.values(scenes).flat().map(piece=>[piece.key,{key:piece.key,url:piece.url}])).values()];
