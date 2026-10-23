import type { GameState } from '../../rules/state';
import { CHAPTER_SIX_MAPS } from './maps';
export const SIX_MAP_IDS=Object.keys(CHAPTER_SIX_MAPS);
export const SIX_PREREQUISITES:Record<string,string>={
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
 const gate:Record<string,string>={namar:'sixRoutesKnown',sunpalace:'desertSeen',skywalk:'palaceEscaped',observatory:'desertAscentWon'};
 if(gate[loc.map]&&!flags[gate[loc.map]])throw new Error('This desert route has not opened yet.');
 if(flags.palaceRouteChosen&&typeof flags.palaceWaterRoute!=='boolean')throw new Error('The palace escape route is missing.');
}
