import { beginChapterTwo, recruit, THIRD_CHAPTER, newGame, recruitOrrin, NEXT_CHAPTER, type GameState } from '../../src/rules/state';

import { receiveItem } from '../../src/rules/inventory';

const ordered = ['festivalSeen', 'raidSeen', 'escapeWon', 'orrinJoined', 'villageSeen', 'collectorConfronted', 'collectorDefeated', 'villageFreed', 'passSeen', 'captainConfronted', 'captainDefeated', 'chapterOneComplete'] as const;
export function checkpoint(last: typeof ordered[number]): GameState {
  const s = newGame();
  for (const flag of ordered.slice(0, ordered.indexOf(last) + 1)) s.flags[flag] = true;
  if (s.flags.orrinJoined) recruitOrrin(s);
  if (s.flags.escapeWon) { s.xp = 40; s.coins = 36; }
  if (s.flags.collectorDefeated) { s.xp = 85; s.coins = 62; }
  if (s.flags.captainDefeated) { s.xp = 150; s.coins = 102; }
  if (s.flags.chapterOneComplete) s.boundary = NEXT_CHAPTER;
  s.location = s.flags.passSeen ? { map: 'tunnel', x: 5, y: 14 }
    : s.flags.villageSeen ? { map: 'rillbridge', x: 15, y: 18 }
    : s.flags.escapeWon ? { map: 'yard', x: 35, y: 18 } : { map: 'station', x: 23, y: 15 };
  return s;
}

const coastOrder=['coastSeen','kitJoined','raidPlanned','raidConfronted','trainRaidWon','prisonersFreed','wardSeen','settlementSeen','coastCollectorWon','evacuationReady','recaptureConfronted','recaptureWon','chapterTwoComplete'] as const;
export function coastCheckpoint(last:typeof coastOrder[number]):GameState {
  const s=checkpoint('chapterOneComplete');beginChapterTwo(s);
  for(const flag of coastOrder.slice(0,coastOrder.indexOf(last)+1))s.flags[flag]=true;
  if(s.flags.kitJoined)recruit(s,'kit');
  if(s.flags.raidPlanned)s.flags.raidDiversion=false;
  if(s.flags.trainRaidWon){s.xp+=70;s.coins+=32;receiveItem(s.inventory,'courier-sight');}
  if(s.flags.coastCollectorWon){s.xp+=85;s.coins+=42;receiveItem(s.inventory,'work-coat');}
  if(s.flags.recaptureWon){s.xp+=90;s.coins+=50;}
  if(s.flags.chapterTwoComplete)s.boundary=THIRD_CHAPTER;
  s.location=s.flags.settlementSeen?{map:'cinderbank',x:27,y:22}:s.flags.wardSeen?{map:'infirmary',x:31,y:21}:{map:'coast',x:24,y:26};
  return s;
}
