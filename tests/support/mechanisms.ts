import {coastCheckpoint,brokenCheckpoint} from './progress';
import {anchorCheckpoint,dawnwatchCheckpoint,windmereCheckpoint} from './anchors';
import {northCheckpoint} from './north';
import {chapterSevenRefugeStart} from '../../src/dev/canonical-saves';
import {SEVEN_PREREQUISITES} from '../../src/content/chapter-seven/progress';
import type {GameState,MapId} from '../../src/rules/state';
const at=(s:GameState,map:MapId,x:number,y:number)=>({...s,location:{map,x,y}});
export const mechanismCases=[
 {name:'coach',scene:'two-prisoners',text:'Kit slides the door',flag:'prisonersFreed',object:'prison-coach',roi:{x:714,y:230,w:38,h:72},save:()=>at(coastCheckpoint('trainRaidWon'),'coast',27,14)},
 {name:'harbor',scene:'four-gate',text:'The chain catches',flag:'harborOpened',roi:{x:960,y:300,w:216,h:140},save:()=>at(brokenCheckpoint('worksGateWon'),'breakwater',34,25)},
 {name:'clamp',scene:'four-cable',text:'Orrin releases the clamp',flag:'signalCut',roi:{x:1022,y:520,w:96,h:64},save:()=>at(brokenCheckpoint('roadGuardWon'),'sanctuary',43,28)},
 {name:'cooling',scene:'five-water',text:'Hester lowers the lever',flag:'coolingOpened',object:'cooling-wheel',roi:{x:1082,y:464,w:70,h:68},save:()=>at(anchorCheckpoint('forgeApproachWon'),'coolingworks',44,24)},
 {name:'lift',scene:'five-wind-lift',text:'Water fills the lower chamber',flag:'waterLiftOpened',object:'wind-lift-wheel',roi:{x:1032,y:460,w:65,h:72},save:()=>at(windmereCheckpoint('windLiftWon'),'dispensary',43,25)},
 {name:'forge',scene:'five-release',text:'The breaker falls',flag:'hammerplainFreed',roi:{x:734,y:163,w:111,h:180},save:()=>anchorCheckpoint('furnaceWon')},
 {name:'watch',scene:'five-watch-release',text:'Enna hauls the release wheel',flag:'dawnwatchFreed',roi:{x:752,y:214,w:64,h:174},save:()=>dawnwatchCheckpoint('aurelWon')},
 {name:'ward',scene:'five-wind-release',text:'The shutters close',flag:'windmereFreed',roi:{x:776,y:270,w:78,h:92},save:()=>windmereCheckpoint('wardEngineWon')},
 {name:'north',scene:'six-north-gate',text:'The windlass turns',flag:'northPassOpened',object:'north-windlass',roi:{x:1140,y:526,w:216,h:54},save:()=>at(northCheckpoint('northWatchWon'),'frostwatch',44,25)},
 {name:'seasons',scene:'seven-seasons-free',text:'The ice breaks away',flag:'seasonsFreed',roi:{x:675,y:430,w:212,h:128},save:()=>{
  const s=chapterSevenRefugeStart();for(const f of Object.keys(SEVEN_PREREQUISITES).slice(Object.keys(SEVEN_PREREQUISITES).indexOf('seasonsFreed')))delete s.flags[f];return at(s,'seasonstreet',32,29);
 }},
] satisfies {name:string;scene:string;text:string;flag:string;object?:string;roi:{x:number;y:number;w:number;h:number};save:()=>GameState}[];
