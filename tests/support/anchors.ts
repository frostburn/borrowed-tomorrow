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
