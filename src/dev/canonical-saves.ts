import { ENCOUNTERS } from '../content/chapter-one/encounters';
import { equipItem, receiveItem } from '../rules/inventory';
import { beginChapterTwo, decodeSave, newGame, NEXT_CHAPTER, recruitOrrin, restoreParty } from '../rules/state';

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
