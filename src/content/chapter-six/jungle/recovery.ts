import {maxFocus} from '../../../rules/improvements';
import { maxHp,remember,type GameState } from '../../../rules/state';
import { receiveItem } from '../../../rules/inventory';
/** One completed treatment. Ordinary rests and encounter victories never call this. */
export function completeRiverTreatment(s:GameState):boolean{
 if(s.flags.capitalAssaultCommitted||s.flags.nellLost||s.chapter!=='chapter-six'||!s.flags.rainhouseWon||!s.flags.nellIll||s.flags.nellRecovered)return false;
 s.flags.riverCareArrived=true;s.flags.nellRecovered=true;
 s.xp+=120;receiveItem(s.inventory,'riverglass-reflector');
 const nell=s.party.find(h=>h.id==='nell')!;nell.hp=maxHp('nell',s);nell.focus=maxFocus(s,'nell');
 remember(s,'nellRecovered');return true;
}
