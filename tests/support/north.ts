import { chapterSixNorthStart } from '../../src/dev/canonical-saves';
import { arrival } from '../../src/content/maps';
import { ENCOUNTERS } from '../../src/content/chapter-six/north/encounters';
import { receiveItem } from '../../src/rules/inventory';
export const northOrder=['northSeen','northWatchSeen','northWatchConfronted','northWatchWon','northPassOpened','northLogRead','northHuntersConfronted','northHuntersWon','winterShrineSeen','winterDragonConfronted','winterDragonWon','northSealBroken','northReturned','northReported']as const;
export function northCheckpoint(flag:typeof northOrder[number],recovered=false){
 const s=chapterSixNorthStart(recovered),index=northOrder.indexOf(flag);
 for(const f of northOrder.slice(0,index+1)){s.flags[f]=true;s.journal.push(f);}
 for(const e of Object.values(ENCOUNTERS))if(s.flags[e.flag]){s.xp+=e.xp;s.coins+=e.coins;if(e.item)receiveItem(s.inventory,e.item);}
 s.location=index>=13?arrival('outermooring','namar'):index>=12?arrival('bellharbor','return'):index>=8?arrival('wintershrine','stand'):index>=5?arrival('glacier','wreck'):index>=1?arrival('frostwatch','start'):arrival('bellharbor','start');
 return s;
}
