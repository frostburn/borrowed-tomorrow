import seventh from './chapter-seven/scene-art.json' with {type:'json'};
import sixth from './chapter-six/scene-art.json' with { type: 'json' };
import fifth from './chapter-five/scene-art.json' with { type: 'json' };
import first from './chapter-one/scene-art.json' with { type: 'json' };
import second from './chapter-two/scene-art.json' with { type: 'json' };
import third from './chapter-three/scene-art.json' with { type: 'json' };
import fourth from './chapter-four/scene-art.json' with { type: 'json' };
import { layerVisible, properties, type TileMap } from './tilemaps';
import type { GameState } from '../rules/state';

const scenes={...first,...second,...third,...fourth,...fifth,...sixth,...seventh} as Record<string,ScenePiece[]>;

export interface ScenePiece { key:string; url:string; x:number; y:number; width:number; height:number; depth:number; layerId:number; motion?:{kind:'sail'|'moored'|'hover';distance?:number;after?:string} }
/** Whole SVG planes and props; Tiled remains the layout/collision source. */
export function sceneArt(map?:TileMap):ScenePiece[]|undefined {
  const id=map&&properties(map).sceneArt;
  return id ? (scenes as Record<string,ScenePiece[]>)[String(id)] : undefined;
}
export function visibleSceneArt(map:TileMap,state?:Pick<GameState,'flags'>,hidden?:Set<number>){
  return sceneArt(map)?.filter(piece=>map.layers.some(layer=>layer.id===piece.layerId&&!hidden?.has(layer.id)&&layerVisible(layer,state)));
}
const assets=(pieces:ScenePiece[])=>[...new Map(pieces.map(piece=>[piece.key,{key:piece.key,url:piece.url}])).values()];
export const SCENE_ASSETS=assets(Object.values(scenes).flat());
export const CHAPTER_ONE_SCENE_ASSETS=assets(Object.values(first).flat());
export const sceneAssets=(map:TileMap)=>assets(sceneArt(map)??[]);
