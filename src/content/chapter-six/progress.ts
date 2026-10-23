import type { GameState } from '../../rules/state';
import { CHAPTER_SIX_MAPS } from './maps';
export const SIX_MAP_IDS=Object.keys(CHAPTER_SIX_MAPS);
export const SIX_PREREQUISITES:Record<string,string>={
 northSeen:'sixRoutesKnown',northWatchSeen:'northSeen',northWatchConfronted:'northWatchSeen',northWatchWon:'northWatchConfronted',northPassOpened:'northWatchWon',northLogRead:'northPassOpened',northHuntersConfronted:'northLogRead',northHuntersWon:'northHuntersConfronted',winterShrineSeen:'northHuntersWon',winterDragonConfronted:'winterShrineSeen',winterDragonWon:'winterDragonConfronted',northSealBroken:'winterDragonWon',northReturned:'northSealBroken',northReported:'northReturned',northCacheConfronted:'northPassOpened',northCacheWon:'northCacheConfronted',capitalOpened:'northSealBroken',capitalQuaySeen:'capitalOpened',
 riverSeen:'jungleLeadKnown',riverCrossingSeen:'riverSeen',riverPatrolConfronted:'riverCrossingSeen',riverPatrolWon:'riverPatrolConfronted',riverChainOpen:'riverPatrolWon',rainhouseSeen:'riverChainOpen',rainhouseConfronted:'rainhouseSeen',rainhouseWon:'rainhouseConfronted',riverCareArrived:'rainhouseWon',nellRecovered:'riverCareArrived',riverRestSeen:'nellRecovered',riverThanksSeen:'riverRestSeen',riverReported:'riverThanksSeen',riverCacheWon:'riverCrossingSeen',
 capitalSealed:'chapterFiveComplete',sixRoutesKnown:'capitalSealed',jungleLeadKnown:'sixRoutesKnown',
 desertSeen:'sixRoutesKnown',desertMailSent:'desertSeen',palaceCoup:'desertSeen',palaceRouteChosen:'palaceCoup',palaceEscapeWon:'palaceRouteChosen',palaceEscaped:'palaceEscapeWon',
 desertAscentSeen:'palaceEscaped',desertAscentWon:'desertAscentSeen',desertFocusTaken:'desertAscentWon',sunSerpentSeen:'desertAscentWon',sunSerpentConfronted:'sunSerpentSeen',sunSerpentWon:'sunSerpentConfronted',
 desertReleaseReady:'sunSerpentWon',desertSealBroken:'desertReleaseReady',desertReported:'desertSealBroken',
};
/** The expedition is part of Chapter Six; a western seal alone grants no departure. */
export function validateSix(chapter:unknown,boundary:unknown,loc:GameState['location'],flags:Record<string,boolean>){
 if(chapter!=='chapter-six'){
  if(Object.keys(SIX_PREREQUISITES).some(id=>flags[id]))throw new Error('The Chapter Six route has not opened yet.');
  return;
 }
 if(!flags.chapterFiveComplete||!flags.nellIll||!flags.allAnchorsSeen||!flags.emperorOfferTold||boundary!==null||!SIX_MAP_IDS.includes(loc.map))throw new Error('The capital approach checkpoint is incomplete.');
 if(flags.capitalOpened&&(!flags.northSealBroken||!flags.desertSealBroken))throw new Error('Both foreign seals must be released before the capital opens.');
 const gate:Record<string,string>={bellharbor:'sixRoutesKnown',frostwatch:'northSeen',glacier:'northPassOpened',wintershrine:'northHuntersWon',capitalquay:'capitalOpened',riverhaven:'jungleLeadKnown',canopy:'riverSeen',rainhouse:'riverChainOpen',namar:'sixRoutesKnown',sunpalace:'desertSeen',skywalk:'palaceEscaped',observatory:'desertAscentWon'};
 if(gate[loc.map]&&!flags[gate[loc.map]])throw new Error('This Chapter Six route has not opened yet.');
 if(Boolean(flags.riverCareArrived)!==Boolean(flags.nellRecovered))throw new Error('The river treatment checkpoint is incomplete.');
 if(flags.palaceRouteChosen&&typeof flags.palaceWaterRoute!=='boolean')throw new Error('The palace escape route is missing.');
}
