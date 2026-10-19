import { beginChapterTwo, beginChapterThree, beginChapterFour, separatedGroup, recruit, THIRD_CHAPTER, newGame, recruitOrrin, NEXT_CHAPTER, type GameState } from '../../src/rules/state';

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

const palaceOrder=['capitalSeen','capitalConfronted','capitalGateWon','petraJoined','worksSeen','worksWardenWon','tomasRescued','intakePlanned','conduitSeen','conduitGuardWon','extractionStopped','emperorMerged','chapterThreeComplete'] as const;
export function palaceCheckpoint(last:typeof palaceOrder[number]):GameState{
  const s=coastCheckpoint('chapterTwoComplete');beginChapterThree(s);
  for(const flag of palaceOrder.slice(0,palaceOrder.indexOf(last)+1))s.flags[flag]=true;
  if(s.flags.capitalGateWon){s.xp+=85;s.coins+=48;}
  if(s.flags.petraJoined){recruit(s,'petra');receiveItem(s.inventory,'saber-hilt');}
  if(s.flags.worksWardenWon){s.xp+=100;s.coins+=58;receiveItem(s.inventory,'silver-reflector');}
  if(s.flags.intakePlanned)s.flags.pressureRoute=false;
  if(s.flags.conduitGuardWon){s.xp+=135;s.coins+=80;receiveItem(s.inventory,'insulated-coat');}
  s.location=s.flags.emperorMerged?{map:'northglass',x:46,y:17}:s.flags.conduitSeen?{map:'conduit',x:25,y:30}:s.flags.worksSeen?{map:'relayhall',x:22,y:16}:{map:'northglass',x:32,y:31};
  if(s.flags.chapterThreeComplete){s.boundary='chapter-four:broken-world';s.location={map:'northglass',x:32,y:33};}
  return s;
}

const brokenOrder=['brokenMorning','worksStarted','worksArrival','worksRouteSet','worksGateWon','worksEvacuated','roadSeen','celiaJoined','roadGuardWon','sealLead','sealSeen','partyReunited','sanctuaryEntered','sanctuaryWardenWon','anchorsKnown','chapterFourComplete'] as const;
export function brokenCheckpoint(last:typeof brokenOrder[number]):GameState{
 const s=palaceCheckpoint('chapterThreeComplete');beginChapterFour(s);
 for(const flag of brokenOrder.slice(0,brokenOrder.indexOf(last)+1))s.flags[flag]=true;
 if(s.flags.worksRouteSet)s.flags.worksFlooded=false;
 if(s.flags.worksGateWon){s.xp+=130;s.coins+=68;receiveItem(s.inventory,'return-valve');}
 if(s.flags.roadSeen)recruit(s,'celia');
 if(s.flags.roadGuardWon){s.xp+=145;s.coins+=72;receiveItem(s.inventory,'rescue-coat');}
 if(s.flags.sanctuaryWardenWon){s.xp+=210;s.coins+=108;receiveItem(s.inventory,'sun-prism');}
 if(s.flags.partyReunited){s.activeParty=[...s.reunionParty!];s.reunionParty=null;}
 else s.activeParty=separatedGroup(s.flags);
 s.location=s.flags.partyReunited?{map:'refuge',x:31,y:24}:s.flags.sealSeen?{map:'refuge',x:34,y:26}:s.flags.worksEvacuated?{map:'sanctuary',x:27,y:30}:s.flags.worksStarted?{map:'breakwater',x:31,y:27}:{map:'refuge',x:31,y:22};
 if(s.flags.sanctuaryEntered&&!s.flags.anchorsKnown)s.location={map:'sanctuary',x:32,y:30};
 if(s.flags.chapterFourComplete)s.boundary='chapter-five:anchors';
 return s;
}
