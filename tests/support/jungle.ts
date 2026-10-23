import { chapterSixJungleStart } from '../../src/dev/canonical-saves';
import { arrival } from '../../src/content/maps';
import { ENCOUNTERS } from '../../src/content/chapter-six/jungle/encounters';
import { completeRiverTreatment } from '../../src/content/chapter-six/jungle/recovery';
import { receiveItem } from '../../src/rules/inventory';
export const jungleOrder=['riverSeen','riverCrossingSeen','riverPatrolConfronted','riverPatrolWon','riverChainOpen','rainhouseSeen','rainhouseConfronted','rainhouseWon','nellRecovered','riverRestSeen','riverThanksSeen','riverReported']as const;
/** Valid authored checkpoints for reload, render and order tests. */
export function jungleCheckpoint(flag:typeof jungleOrder[number]){
 const s=chapterSixJungleStart(),index=jungleOrder.indexOf(flag);
 for(const f of jungleOrder.slice(0,Math.min(index+1,8)))s.flags[f]=true;
 for(const e of Object.values(ENCOUNTERS))if(s.flags[e.flag]){s.xp+=e.xp;s.coins+=e.coins;if(e.item)receiveItem(s.inventory,e.item);}
 if(index>=8)completeRiverTreatment(s);
 for(const f of jungleOrder.slice(9,index+1))s.flags[f]=true;
 s.location=index>=11?arrival('outermooring','namar'):index>=10?arrival('riverhaven','return'):index>=5?arrival('rainhouse','stand'):index>=1?arrival('canopy','start'):arrival('riverhaven','start');
 return s;
}
