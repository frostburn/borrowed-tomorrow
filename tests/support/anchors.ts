import { chapterFiveStart } from '../../src/dev/canonical-saves';
import { ENCOUNTERS } from '../../src/content/chapter-five/encounters';
import { arrival } from '../../src/content/maps';
import { receiveItem } from '../../src/rules/inventory';
import { restoreParty,FIFTH_CHAPTER } from '../../src/rules/state';
export const anchorOrder=['airfieldSeen','airfieldGuardWon','airshipOwned','firstFlightSeen','hammerplainSeen','coolingSeen','forgeRouteSet','forgeApproachWon','coolingOpened','forgeGantrySeen','furnaceConfronted','furnaceWon','hammerplainFreed','hammerplainComplete','fleetSighted']as const;
export function anchorCheckpoint(flag:typeof anchorOrder[number]){
 const s=chapterFiveStart();for(const f of anchorOrder.slice(0,anchorOrder.indexOf(flag)+1))s.flags[f]=true;
 if(s.flags.forgeRouteSet)s.flags.forgeFlooded=false;
 for(const id of ['airfield-guard','hammer-lift','hammer-carrier']){const e=ENCOUNTERS[id];if(s.flags[e.flag]){s.xp+=e.xp;s.coins+=e.coins;if(e.item)receiveItem(s.inventory,e.item);}}
 s.location=s.flags.fleetSighted||flag==='firstFlightSeen'||flag==='airshipOwned'?arrival('airship','start'):s.flags.hammerplainComplete?arrival('hammerplain','freed'):s.flags.forgeGantrySeen||s.flags.furnaceConfronted||s.flags.furnaceWon||s.flags.hammerplainFreed?arrival('anchorforge','start'):s.flags.coolingSeen?arrival('coolingworks','start'):s.flags.hammerplainSeen?arrival('hammerplain','start'):arrival('airfield','start');
 restoreParty(s);return s;
}
export function anchorDeparture(){const s=chapterFiveStart();s.chapter='chapter-four';s.boundary=FIFTH_CHAPTER;s.location=arrival('refuge','departure');return s;}
export const dawnwatchOrder=['dawnwatchSeen','shelterOpened','watchGunsSeen','mortarConfronted','mortarWon','repeaterConfronted','repeaterWon','aurelSeen','aurelConfronted','aurelWon','dawnwatchFreed','dawnwatchComplete']as const;
export function dawnwatchCheckpoint(flag:typeof dawnwatchOrder[number],hammerplain=false){
 const s=anchorCheckpoint(hammerplain?'fleetSighted':'firstFlightSeen');
 for(const f of dawnwatchOrder.slice(0,dawnwatchOrder.indexOf(flag)+1))s.flags[f]=true;
 for(const id of ['dawn-mortar-first','dawn-repeater-last','dawn-commander']){const e=ENCOUNTERS[id];if(s.flags[e.flag]){s.xp+=e.xp;s.coins+=e.coins;if(e.item)receiveItem(s.inventory,e.item);}}
 s.location=s.flags.aurelSeen?arrival('signalwall','stand'):s.flags.watchGunsSeen?arrival('watchbarracks','junction'):arrival('dawnwatch','gate');
 restoreParty(s);return s;
}

export const windmereOrder=['windmereSeen','dispensarySeen','windLiftConfronted','windLiftWon','waterLiftOpened','patientsTransferred','mirrorWardSeen','windGalleryWon','wardEngineConfronted','wardEngineWon','windmereFreed','windmereComplete']as const;
export function windmereCheckpoint(flag:typeof windmereOrder[number],previous:'none'|'hammerplain'|'dawnwatch'|'both'='none'){
 const s=previous==='dawnwatch'||previous==='both'?dawnwatchCheckpoint('dawnwatchComplete',previous==='both'):anchorCheckpoint(previous==='hammerplain'?'fleetSighted':'firstFlightSeen');
 if(previous!=='none')s.flags.fleetSighted=true;
 for(const f of windmereOrder.slice(0,windmereOrder.indexOf(flag)+1))s.flags[f]=true;
 for(const id of ['wind-lift','wind-gallery','wind-engine']){const e=ENCOUNTERS[id];if(s.flags[e.flag]){s.xp+=e.xp;s.coins+=e.coins;if(e.item)receiveItem(s.inventory,e.item);}}
 s.location=s.flags.mirrorWardSeen?arrival('mirrorward','stand'):s.flags.dispensarySeen?arrival('dispensary','junction'):arrival('windmere','ward');restoreParty(s);return s;
}
