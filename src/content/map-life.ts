import type {ScenePiece} from './scene-art';

export const LIFE_STEP_MS=120;
export const lifeStep=(time:number)=>Math.floor(time/LIFE_STEP_MS)*LIFE_STEP_MS;
/** Collection must remain visible as stillness, including on restored saves. */
export function lifePaused(map:string,flags:Record<string,boolean>){
 const release:Record<string,string>={rillbridge:'villageFreed',cinderbank:'coastCollectorWon',refuge:'sanctuaryWardenWon',breakwater:'sanctuaryWardenWon',sanctuary:'sanctuaryWardenWon',stillcity:'capitalStreetFreed',takenwater:'takenPeopleFreed',firstfield:'harvestFreed',quietward:'wardPeopleFreed',seasonstreet:'seasonsFreed'};
 return !!release[map]&&!flags[release[map]];
}
export const swayingScenery=(piece:Pick<ScenePiece,'url'>)=>/(?:^|\/|-)(?:fir|palms?|tree|fern)(?:-|\.svg$)/.test(piece.url)||/(?:^|\/)canopy\.svg$/.test(piece.url);
function seed(text:string){let n=0;for(const c of text)n=(n*31+c.charCodeAt(0))>>>0;return n;}
export const movingScenery=(piece:ScenePiece)=>!!piece.motion||swayingScenery(piece);
/** Cosmetic offsets only. Moored boats never sail away or move their gangway. */
export function sceneryPose(piece:ScenePiece,time?:number,flags:Record<string,boolean>={}){
 const motion=piece.motion;
 if(time===undefined||motion?.after&&!flags[motion.after])return {dx:0,dy:0,rotation:0};
 const n=seed(`${piece.key}:${piece.x}:${piece.y}`),phase=n%628/100,t=lifeStep(time);
 const snap=(value:number)=>Math.round(value/2)*2;
 if(motion?.kind==='sail')return {dx:snap((motion.distance??40)*Math.sin(t/(65000+n%17000)+phase)),dy:0,rotation:0};
 if(motion?.kind==='moored')return {dx:0,dy:snap(1.2*Math.sin(t/(4300+n%1700)+phase)),rotation:0};
 if(motion?.kind==='hover')return {dx:snap(4*Math.sin(t/17000+phase)),dy:snap(2*Math.sin(t/6300+phase)),rotation:0};
 return {dx:0,dy:0,rotation:sceneryAngle(piece,time)};
}
export interface SteamSource {x:number;y:number;depth:number;phase:number}
/** Exhaust belongs to an existing chimney, never to a navigation cell. */
export function steamSources(pieces:readonly ScenePiece[]):SteamSource[]{
 return pieces.flatMap(p=>{
  const name=p.url.split('/').at(-1);
  const chimneys=name==='engine.svg'?[[67,25]]:name==='engine-right.svg'?[[221,25]]:name==='ward-stove.svg'?[[29,0]]:name==='casting-hall.svg'?[[92,-12],[502,-12]]:[];
  return chimneys.map(([x,y])=>({x:p.x+x,y:p.y+y,depth:p.depth+.1,phase:seed(`${p.key}:${p.x+x}:${p.y+y}`)%6000}));
 });
}
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
const shore={colors:[0x5b8e9a,0xaac5c0,0xc9d8cb],minY:320,ink:'#d4dfcf'};
const hanging={colors:[0x28596b,0x507f88,0x8bafb0],minY:0,ink:'#b2cccb'};
const WATER:Record<string,WaterLife>={
 rillbridge:{colors:[0x142f40,0x284b63,0x315c74,0x203e56,0x60869a],minY:0,ink:'#8db4c8'},
 coast,refuge:sea,breakwater:sea,sanctuary:sea,
 riverhaven:river,canopy:river,rainhouse:river,
 bellharbor:{colors:[0x345a75,0x426e87],minY:430,ink:'#b0cdd5'},
 namar:{colors:[0x315b64,0x638a87],minY:430,ink:'#aac8b5'},
 coolingworks:{colors:[0x9abcb0],minY:450,ink:'#d0d9b7'},
 lastshore:shore,seaholiday:shore,
 hollowsill:hanging,takenwater:hanging,lastrefuge:hanging,
};
export const waterLife=(map:string)=>WATER[map];
export interface SkyLife {colors:readonly number[];maxY:number;ink:string}
const blueSky={colors:[0x384f62,0x788e96,0xc5b89a],maxY:380,ink:'#d0d9d1'};
const seaSky={colors:[0x53677d,0x888a88,0xc3a07a],maxY:330,ink:'#d6c5ad'};
const northernSky={colors:[0x7d9eae],maxY:420,ink:'#e0e8df'};
const desertSky={colors:[0x33434f,0xbd8b78],maxY:220,ink:'#e0b5a0'};
const capitalSky={colors:[0x33434f,0x7e9698],maxY:325,ink:'#d1d8c9'};
const SKY:Record<string,SkyLife>={
 coast:{colors:[0x788e9c,0x9da395],maxY:160,ink:'#b5c3c2'},
 refuge:seaSky,breakwater:seaSky,sanctuary:seaSky,
 airfield:blueSky,airship:blueSky,hammerplain:blueSky,coolingworks:blueSky,dawnwatch:blueSky,signalwall:blueSky,windmere:blueSky,
 outermooring:capitalSky,capitalquay:capitalSky,
 namar:desertSky,skywalk:desertSky,observatory:desertSky,
 bellharbor:northernSky,frostwatch:northernSky,glacier:northernSky,wintershrine:northernSky,
 crown:{colors:[0x314958],maxY:300,ink:'#bdc9c7'},
 lastshore:{colors:[0x9fb8bc],maxY:310,ink:'#e4dfc9'},seaholiday:{colors:[0x9fb8bc],maxY:310,ink:'#e4dfc9'},
};
export const cloudLife=(map:string)=>SKY[map];
export const snowLife=(map:string)=>['bellharbor','frostwatch','glacier','wintershrine','seasonstreet'].includes(map);
