import { ENCOUNTERS } from '../content/chapter-one/encounters';
import { ENCOUNTERS as COAST_ENCOUNTERS } from '../content/chapter-two/encounters';
import { equipItem, receiveItem } from '../rules/inventory';
import { beginChapterTwo, beginChapterThree, decodeSave, newGame, NEXT_CHAPTER, THIRD_CHAPTER, recruit, recruitOrrin, restoreParty } from '../rules/state';

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
