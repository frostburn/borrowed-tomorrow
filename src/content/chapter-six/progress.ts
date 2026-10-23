import { SEVENTH_CHAPTER,type GameState } from '../../rules/state';
import { CHAPTER_SIX_MAPS } from './maps';
export const SIX_MAP_IDS=Object.keys(CHAPTER_SIX_MAPS);
export const SIX_PREREQUISITES:Record<string,string>={
 capitalStreetSeen:'capitalQuaySeen',capitalProcessionConfronted:'capitalStreetSeen',capitalProcessionWon:'capitalProcessionConfronted',capitalStreetFreed:'capitalProcessionWon',capitalPalaceSeen:'capitalStreetFreed',capitalCommandConfronted:'capitalPalaceSeen',capitalCommandWon:'capitalCommandConfronted',capitalHallOpened:'capitalCommandWon',capitalHuntersConfronted:'capitalPalaceSeen',capitalHuntersWon:'capitalHuntersConfronted',capitalFocusTaken:'capitalPalaceSeen',capitalAudienceSeen:'capitalHallOpened',capitalMorningSeen:'capitalAudienceSeen',capitalMorningQuestion:'capitalMorningSeen',capitalMorningLeft:'capitalMorningQuestion',capitalWarningSeen:'capitalHallOpened',capitalAssaultCommitted:'capitalWarningSeen',capitalRiskAccepted:'capitalAssaultCommitted',emperorSeen:'capitalAssaultCommitted',emperorConfronted:'emperorSeen',emperorWon:'emperorConfronted',emperorFallen:'emperorWon',capitalReleased:'emperorFallen',capitalLandingSeen:'capitalReleased',chapterSixComplete:'capitalLandingSeen',lightbearerSeen:'emperorFallen',lightbearerConfronted:'lightbearerSeen',lightbearerWon:'lightbearerConfronted',nellLost:'lightbearerWon',emptySeatSeen:'nellLost',lightbearerEnding:'emptySeatSeen',
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
 if(!flags.chapterFiveComplete||!flags.nellIll||!flags.allAnchorsSeen||!flags.emperorOfferTold||(boundary!==null&&boundary!==SEVENTH_CHAPTER)||!SIX_MAP_IDS.includes(loc.map))throw new Error('The capital approach checkpoint is incomplete.');
 if(flags.capitalOpened&&(!flags.northSealBroken||!flags.desertSealBroken))throw new Error('Both foreign seals must be released before the capital opens.');
 if(Boolean(flags.chapterSixComplete)!==(boundary===SEVENTH_CHAPTER))throw new Error('The hollow-sun departure is incomplete.');
 if(flags.capitalAssaultCommitted&&(typeof flags.capitalRiskAccepted!=='boolean'||flags.capitalRiskAccepted===Boolean(flags.nellRecovered)))throw new Error('The final preparation choice is inconsistent.');
 if((flags.capitalAudienceSeen||loc.map==='lastmorning')&&!flags.nellRecovered)throw new Error('The remembered morning requires Nell’s recovery.');
 if(flags.capitalAssaultCommitted&&flags.nellRecovered&&!flags.capitalMorningLeft)throw new Error('Nell has not left the remembered morning.');
 if((flags.lightbearerSeen||flags.nellLost||flags.lightbearerEnding)&&(!flags.capitalRiskAccepted||flags.nellRecovered))throw new Error('The Lightbearer route requires an untreated binding.');
 if((flags.capitalReleased||flags.chapterSixComplete)&&(!flags.nellRecovered||flags.capitalRiskAccepted||flags.nellLost))throw new Error('The hopeful departure requires Nell’s recovery.');
 if(flags.nellLost&&loc.map!=='crown'&&loc.map!=='laststation')throw new Error('The Lightbearer aftermath cannot return to the foreign routes.');
 if(flags.capitalAssaultCommitted&&!flags.capitalReleased&&!['crown','lastpalace','laststation'].includes(loc.map))throw new Error('The final assault is still in progress.');
 const gate:Record<string,string>={stillcity:'capitalQuaySeen',lastpalace:'capitalStreetFreed',lastmorning:'capitalAudienceSeen',crown:'capitalAssaultCommitted',laststation:'nellLost',bellharbor:'sixRoutesKnown',frostwatch:'northSeen',glacier:'northPassOpened',wintershrine:'northHuntersWon',capitalquay:'capitalOpened',riverhaven:'jungleLeadKnown',canopy:'riverSeen',rainhouse:'riverChainOpen',namar:'sixRoutesKnown',sunpalace:'desertSeen',skywalk:'palaceEscaped',observatory:'desertAscentWon'};
 if(gate[loc.map]&&!flags[gate[loc.map]])throw new Error('This Chapter Six route has not opened yet.');
 if(Boolean(flags.riverCareArrived)!==Boolean(flags.nellRecovered))throw new Error('The river treatment checkpoint is incomplete.');
 if(flags.palaceRouteChosen&&typeof flags.palaceWaterRoute!=='boolean')throw new Error('The palace escape route is missing.');
}
