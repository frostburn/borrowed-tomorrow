import { chapterSixStart } from '../../src/dev/canonical-saves';
import { ENCOUNTERS } from '../../src/content/chapter-six/encounters';
import { arrival } from '../../src/content/maps';
import { receiveItem } from '../../src/rules/inventory';
import { restoreParty } from '../../src/rules/state';
export const desertOrder=['capitalSealed','sixRoutesKnown','jungleLeadKnown','desertSeen','palaceCoup','palaceRouteChosen','palaceEscapeWon','palaceEscaped','desertAscentSeen','desertAscentWon','sunSerpentSeen','sunSerpentConfronted','sunSerpentWon','desertReleaseReady','desertSealBroken','desertReported']as const;
export function desertCheckpoint(flag:typeof desertOrder[number]){
 const s=chapterSixStart();for(const f of desertOrder.slice(0,desertOrder.indexOf(flag)+1))s.flags[f]=true;
 if(s.flags.palaceRouteChosen)s.flags.palaceWaterRoute=false;
 for(const id of ['palace-gallery','desert-ascent','sun-serpent']){const e=ENCOUNTERS[id];if(s.flags[e.flag]){s.xp+=e.xp;s.coins+=e.coins;if(e.item)receiveItem(s.inventory,e.item);}}
 s.location=s.flags.desertReported?arrival('outermooring','start'):s.flags.desertReleaseReady?arrival('namar','return'):s.flags.sunSerpentSeen?arrival('observatory','stand'):s.flags.desertAscentSeen?arrival('skywalk','terrace'):s.flags.palaceCoup?arrival('sunpalace','escape'):s.flags.desertSeen?arrival('namar','start'):arrival('outermooring','start');
 restoreParty(s);return s;
}
