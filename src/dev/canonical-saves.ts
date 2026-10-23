import { ENCOUNTERS as FOUR_ENCOUNTERS } from '../content/chapter-four/encounters';
import { ENCOUNTERS } from '../content/chapter-one/encounters';
import { ENCOUNTERS as COAST_ENCOUNTERS } from '../content/chapter-two/encounters';
import { ENCOUNTERS as CAPITAL_ENCOUNTERS } from '../content/chapter-three/encounters';
import { equipItem, receiveItem } from '../rules/inventory';
import { beginChapterTwo, beginChapterThree, beginChapterFour, beginChapterFive, FIFTH_CHAPTER, FOURTH_CHAPTER, decodeSave, newGame, NEXT_CHAPTER, THIRD_CHAPTER, recruit, recruitOrrin, restoreParty } from '../rules/state';

/** Authored Chapter One completion, independent of workshop builds or saves. */
export function chapterTwoStart(){
  const state=newGame();
  for(const flag of ['festivalSeen','raidSeen','escapeWon','orrinJoined','workshopWon','villageSeen','collectorConfronted','collectorDefeated','villageFreed','passSeen','captainConfronted','captainDefeated','chapterOneComplete'])state.flags[flag]=true;
  state.xp=Object.values(ENCOUNTERS).reduce((sum,e)=>sum+e.xp,0);
  state.coins+=Object.values(ENCOUNTERS).reduce((sum,e)=>sum+e.coins,0);
  recruitOrrin(state);
  receiveItem(state.inventory,'brass-reflector');equipItem(state.inventory,'nell','brass-reflector');
  state.journal=['home','blessing','raid','escape','orrin','workshop','village','collector','freed','pass','captain','departure'];
  state.boundary=NEXT_CHAPTER;beginChapterTwo(state);restoreParty(state);
  return decodeSave(JSON.stringify(state));
}

/** Loading-gate raid, all passengers evacuated; Petra has refused Alban but not joined. */
export function chapterThreeStart(){
  const state=chapterTwoStart();
  for(const flag of ['coastSeen','kitJoined','raidPlanned','raidConfronted','trainRaidWon','prisonersFreed','wardSeen','settlementSeen','coastCollectorWon','evacuationReady','recaptureConfronted','recaptureWon','chapterTwoComplete'])state.flags[flag]=true;
  state.flags.raidDiversion=false;recruit(state,'kit');
  for(const id of ['coast-loading','coast-collector','coast-recapture']){
    const encounter=COAST_ENCOUNTERS[id];state.xp+=encounter.xp;state.coins+=encounter.coins;
    if(encounter.item)receiveItem(state.inventory,encounter.item);
  }
  equipItem(state.inventory,'kit','courier-sight');equipItem(state.inventory,'orrin','work-coat');
  state.journal.push('coast','kit','trainRaid','prisoners','ward','settlement','coastCollector','evacuation','recapture','capitalDeparture');
  state.boundary=THIRD_CHAPTER;beginChapterThree(state);restoreParty(state);
  return decodeSave(JSON.stringify(state));
}

/** Tomas and all passengers rescued; the chosen three arrive with Petra in reserve. */
export function chapterFourStart(){
  const state=chapterThreeStart();
  for(const flag of ['capitalSeen','capitalConfronted','capitalGateWon','petraJoined','worksSeen','worksWardenWon','tomasRescued','intakePlanned','conduitSeen','conduitGuardWon','extractionStopped','emperorMerged','chapterThreeComplete'])state.flags[flag]=true;
  state.flags.pressureRoute=false;recruit(state,'petra');receiveItem(state.inventory,'saber-hilt');
  for(const id of ['capital-arrest','works-warden','heart-feeds']){
    const e=CAPITAL_ENCOUNTERS[id];state.xp+=e.xp;state.coins+=e.coins;if(e.item)receiveItem(state.inventory,e.item);
  }
  equipItem(state.inventory,'nell','silver-reflector');equipItem(state.inventory,'petra','saber-hilt');equipItem(state.inventory,'orrin','insulated-coat');
  state.journal.push('capital','refusal','petra','works','warden','tomas','intake','conduit','heart','extraction','brokenDeparture');
  state.boundary=FOURTH_CHAPTER;beginChapterFour(state);restoreParty(state);
  return decodeSave(JSON.stringify(state));
}

/** Open coast, intact anchors; the working survey ship has not been acquired. */
export function chapterFiveStart(){
 const state=chapterFourStart();
 for(const flag of ['refugeSeen','worksArrival','worksRouteSet','worksGateWon','harborOpened','sanctuaryEntered','roadGuardWon','signalCut','sanctuaryWardenWon','anchorsKnown','seaWalkSeen','chapterFourComplete'])state.flags[flag]=true;
 state.flags.worksFlooded=false;const formation=[...state.activeParty];recruit(state,'celia');state.activeParty=formation;
 for(const id of ['works-dry','sanctuary-road','sanctuary-warden']){const e=FOUR_ENCOUNTERS[id];state.xp+=e.xp;state.coins+=e.coins;if(e.item)receiveItem(state.inventory,e.item);}
 equipItem(state.inventory,'nell','sun-prism');equipItem(state.inventory,'orrin','return-valve');equipItem(state.inventory,'petra','rescue-coat');
 state.journal.push('refugeSeen','worksArrival','worksClear','harborOpened','sanctuaryEntered','roadClear','signalCut','wardenFallen','anchorsKnown','anchorsDeparture');
 state.boundary=FIFTH_CHAPTER;beginChapterFive(state);restoreParty(state);return decodeSave(JSON.stringify(state));
}
