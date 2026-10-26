import type {ScenePiece} from './scene-art';

export const LIFE_STEP_MS=120;
export const lifeStep=(time:number)=>Math.floor(time/LIFE_STEP_MS)*LIFE_STEP_MS;
/** Collection must remain visible as stillness, including on restored saves. */
export function lifePaused(map:string,flags:Record<string,boolean>){
 return map==='rillbridge'&&!flags.villageFreed||map==='cinderbank'&&!flags.coastCollectorWon||['refuge','breakwater','sanctuary'].includes(map)&&!flags.sanctuaryWardenWon;
}
export const swayingScenery=(piece:Pick<ScenePiece,'url'>)=>/(?:^|\/|-)(?:fir|palms?|tree|fern)(?:-|\.svg$)/.test(piece.url)||/(?:^|\/)canopy\.svg$/.test(piece.url);
function seed(text:string){let n=0;for(const c of text)n=(n*31+c.charCodeAt(0))>>>0;return n;}
/** Pivot at the planted base; buildings and walkable geometry never move. */
export function sceneryAngle(piece:Pick<ScenePiece,'url'|'x'|'y'|'height'>,time?:number){
 if(time===undefined||!swayingScenery(piece))return 0;
 const n=seed(`${piece.url}:${piece.x}:${piece.y}`),phase=n%628/100,t=lifeStep(time);
 const breeze=.75*Math.sin(t/(3300+n%1700)+phase)+.25*Math.sin(t/(1500+n%700)+phase*.6);
 return breeze*Math.min(.018,3/Math.max(1,piece.height));
}
export interface WaterLife {colors:readonly number[];minY:number;ink:string}
const coast={colors:[0x23425d,0x325c73,0x23465e,0x18394c,0x638399],minY:235,ink:'#9bbdc5'};
const sea={colors:[0x355b6d,0x688c96,0x527a8b],minY:355,ink:'#adc6c4'};
const river={colors:[0x315c60,0x638a7c],minY:200,ink:'#9dc3ad'};
const WATER:Record<string,WaterLife>={
 rillbridge:{colors:[0x142f40,0x284b63,0x315c74,0x203e56,0x60869a],minY:0,ink:'#8db4c8'},
 coast,infirmary:coast,refuge:sea,breakwater:sea,sanctuary:sea,
 riverhaven:river,canopy:river,rainhouse:river,
};
export const waterLife=(map:string)=>WATER[map];
export const cloudLife=(map:string)=>['airfield','airship','outermooring'].includes(map);
