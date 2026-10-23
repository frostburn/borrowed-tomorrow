import { sickenNell } from '../rules/availability';
import { beginChapterSix,SIXTH_CHAPTER } from '../rules/state';
import { ENCOUNTERS as FOUR_ENCOUNTERS } from '../content/chapter-four/encounters';
import { ENCOUNTERS as FIVE_ENCOUNTERS } from '../content/chapter-five/encounters';
import { arrival } from '../content/maps';
import { ENCOUNTERS } from '../content/chapter-one/encounters';
import { ENCOUNTERS as COAST_ENCOUNTERS } from '../content/chapter-two/encounters';
import { ENCOUNTERS as CAPITAL_ENCOUNTERS } from '../content/chapter-three/encounters';
import { equipItem, receiveItem } from '../rules/inventory';
import { beginChapterTwo, beginChapterThree, beginChapterFour, beginChapterFive, FIFTH_CHAPTER, FOURTH_CHAPTER, newGame, NEXT_CHAPTER, THIRD_CHAPTER, recruit, recruitOrrin, restoreParty } from '../rules/state';
import { decodeSave } from '../rules/save';
import { ENCOUNTERS as JUNGLE_ENCOUNTERS } from '../content/chapter-six/jungle/encounters';
import { completeRiverTreatment } from '../content/chapter-six/jungle/recovery';

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

/** Authored Acts I–III completion. No live saves or workshop settings are read. */
export function chapterFiveFinaleStart(){
 const s=chapterFiveStart();
 for(const flag of [
  'airfieldSeen','airfieldGuardWon','airshipOwned','firstFlightSeen',
  'hammerplainSeen','coolingSeen','forgeRouteSet','forgeApproachWon','coolingOpened','forgeGantrySeen','furnaceConfronted','furnaceWon','hammerplainFreed','hammerplainComplete','fleetSighted',
  'dawnwatchSeen','shelterOpened','watchGunsSeen','mortarConfronted','mortarWon','repeaterConfronted','repeaterWon','aurelSeen','aurelConfronted','aurelWon','dawnwatchFreed','dawnwatchComplete',
  'emperorOfferSeen','emperorOfferTold','windmereSeen','dispensarySeen','windLiftConfronted','windLiftWon','waterLiftOpened','patientsTransferred','mirrorWardSeen','windGalleryWon','wardEngineConfronted','wardEngineWon','windmereFreed','windmereComplete','allAnchorsSeen',
 ])s.flags[flag]=true;
 s.flags.forgeFlooded=false;
 for(const id of ['airfield-guard','hammer-lift','hammer-carrier','dawn-mortar-first','dawn-repeater-last','dawn-commander','wind-lift','wind-gallery','wind-engine']){
  const e=FIVE_ENCOUNTERS[id];s.xp+=e.xp;s.coins+=e.coins;if(e.item)receiveItem(s.inventory,e.item);
 }
 s.flags.watchCoatTaken=true;s.flags.windReflectorTaken=true;
 receiveItem(s.inventory,'field-coat');receiveItem(s.inventory,'opal-reflector');
 for(const [hero,item]of [['nell','opal-reflector'],['orrin','forge-valve'],['petra','shield-brace'],['petra','field-coat'],['celia','ward-focus'],['celia','rescue-coat']]as const)equipItem(s.inventory,hero,item);
 s.journal.push('airfieldSeen','airfieldClear','firstFlightSeen','hammerplainSeen','coolingSeen','coolingClear','coolingOpened','forgeGantrySeen','furnaceFallen','hammerplainFreed','hammerplainComplete','fleetSighted','dawnwatchSeen','shelterOpened','watchGunsSeen','watchGunClear','aurelSeen','aurelFallen','dawnwatchFreed','dawnwatchComplete','watchCoatTaken','emperorOfferSeen','emperorOfferTold','windmereSeen','dispensarySeen','windLiftClear','waterLiftOpened','windReflectorTaken','patientsTransferred','mirrorWardSeen','windGalleryClear','wardEngineFallen','windmereFreed','windmereComplete','allAnchorsSeen');
 // Seven ordinary purchases at the existing eight-mark price, then a free rest.
 s.coins-=56;s.bandages=12;s.activeParty=['nell','orrin','petra'];
 s.location=arrival('airship','start');restoreParty(s);
 return decodeSave(JSON.stringify(s));
}

/** Chapter Five's actual completion, including the hunters and Nell's illness. */
export function chapterSixStart(){
 const s=chapterFiveFinaleStart();
 for(const flag of ['flagshipApproachSeen','flagshipConfronted','flagshipWon','benefactorClaimSeen','flagshipDestroyed','albanDestroyed','retaliationSeen','retaliationWon','chapterFiveComplete'])s.flags[flag]=true;
 for(const id of ['alban-flagship','benefactor-retaliation']){const e=FIVE_ENCOUNTERS[id];s.xp+=e.xp;s.coins+=e.coins;if(e.item)receiveItem(s.inventory,e.item);}
 sickenNell(s);equipItem(s.inventory,'kit','fleet-sight');
 s.journal.push('flagshipApproachSeen','flagshipFallen','benefactorClaimSeen','retaliationSeen','retaliationFallen','fiveDeparture');
 s.boundary=SIXTH_CHAPTER;beginChapterSix(s);restoreParty(s);
 return decodeSave(JSON.stringify(s));
}

/** Shared briefing complete, no desert progress: replay Iria's river arrival. */
export function chapterSixJungleStart(){
 const s=chapterSixStart();
 for(const flag of ['capitalSealed','sixRoutesKnown','jungleLeadKnown']){s.flags[flag]=true;s.journal.push(flag);}
 s.location=arrival('riverhaven','start');return decodeSave(JSON.stringify(s));
}

/** Authored jungle completion before the first desert visit; no live data. */
export function chapterSixRecoveredStart(){
 const s=chapterSixJungleStart();
 for(const flag of ['riverSeen','riverCrossingSeen','riverPatrolConfronted','riverPatrolWon','riverChainOpen','rainhouseSeen','rainhouseConfronted','rainhouseWon'])s.flags[flag]=true;
 for(const id of ['river-patrol','rainhouse-guard']){const e=JUNGLE_ENCOUNTERS[id];s.xp+=e.xp;s.coins+=e.coins;if(e.item)receiveItem(s.inventory,e.item);}
 s.journal.push('riverSeen','riverCrossingSeen','riverPatrolWon','riverChainOpen','rainhouseSeen','rainhouseWon');
 completeRiverTreatment(s);
 for(const flag of ['riverRestSeen','riverThanksSeen','riverReported']){s.flags[flag]=true;s.journal.push(flag);}
 // An authored review formation, selected after the cure, independent of saves.
 s.activeParty=['nell','kit','celia'];s.location=arrival('outermooring','namar');restoreParty(s);
 return decodeSave(JSON.stringify(s));
}
