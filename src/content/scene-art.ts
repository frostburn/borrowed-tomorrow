import seventh from './chapter-seven/scene-art.json' with {type:'json'};
import sixth from './chapter-six/scene-art.json' with { type: 'json' };
import fifth from './chapter-five/scene-art.json' with { type: 'json' };
import first from './chapter-one/scene-art.json' with { type: 'json' };
import second from './chapter-two/scene-art.json' with { type: 'json' };
import third from './chapter-three/scene-art.json' with { type: 'json' };
import fourth from './chapter-four/scene-art.json' with { type: 'json' };
import raster from './raster-map-art.json' with { type:'json' };
import benefactor from './benefactor-domain-art.json' with {type:'json'};
import { layerVisible, properties, type TileMap } from './tilemaps';
import type { GameState } from '../rules/state';
import {mapArtSkin,type MapArtSkin} from './map-art-skin';

const firstScenes={...first,station:raster.station},sixthScenes={...sixth,stillcity:raster.stillcity};
const vectorScenes={...first,...second,...third,...fourth,...fifth,...sixth,...seventh};
const seventhScenes={...seventh,...Object.fromEntries(['body','sun','heart'].map(form=>[`battle-benefactor-${form}`,benefactor]))};
const scenes={...firstScenes,...second,...third,...fourth,...fifth,...sixthScenes,...seventhScenes};

export interface ScenePiece { key:string; url:string; x:number; y:number; width:number; height:number; depth:number; layerId:number }
export const benefactorDomainArt=(skin:MapArtSkin=mapArtSkin()):ScenePiece[]=>skin==='raster'?benefactor:seventh['battle-benefactor-body'];
/** Whole vector or native raster planes/props; Tiled owns layout and collision. */
export function sceneArt(map?:TileMap,skin:MapArtSkin=mapArtSkin()):ScenePiece[]|undefined {
  const id=map&&properties(map).sceneArt;
  return id ? ((skin==='vector'?vectorScenes:scenes) as Record<string,ScenePiece[]>)[String(id)] : undefined;
}
export function visibleSceneArt(map:TileMap,state?:Pick<GameState,'flags'>,hidden?:Set<number>){
  return sceneArt(map)?.filter(piece=>map.layers.some(layer=>layer.id===piece.layerId&&!hidden?.has(layer.id)&&layerVisible(layer,state)));
}
const assets=(pieces:ScenePiece[])=>[...new Map(pieces.map(piece=>[piece.key,{key:piece.key,url:piece.url}])).values()];
export const SCENE_ASSETS=assets([...Object.values(vectorScenes).flat(),...Object.values(scenes).flat()]);
export const CHAPTER_ONE_SCENE_ASSETS=assets([...Object.values(first).flat(),...Object.values(firstScenes).flat()]);
export const sceneAssets=(map:TileMap)=>assets(sceneArt(map)??[]);
