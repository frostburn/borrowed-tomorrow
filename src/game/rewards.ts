import { CONSUMABLES } from '../rules/consumables';
import { CHARACTERS } from '../content/characters';
import { equipmentOwner, ITEMS, type ItemId } from '../rules/inventory';
import { supplyCount,type SupplyId } from '../rules/supplies';
import type { GameState } from '../rules/state';
import { itemIcon,type UIIcon } from '../content/ui-art';
import { icon } from './item-icons';
const definitions={...ITEMS,...CONSUMABLES};
const supplies=Object.keys(definitions) as SupplyId[];
export const resourceSnapshot=(s:GameState)=>({marks:s.coins,supplies:Object.fromEntries(supplies.map(id=>[id,supplyCount(s,id)]))});
export interface ResourceGain {icon:UIIcon;name:string;quantity:number;item?:ItemId}
export const supplyGain=(id:SupplyId,quantity=1):ResourceGain=>({icon:itemIcon(id),name:definitions[id].name,quantity,...(id in ITEMS?{item:id as ItemId}:{})});
export const rewardLabel=(g:ResourceGain)=>{const owner=g.item&&equipmentOwner(g.item);return owner?`${g.name} · ${CHARACTERS[owner].name}`:g.name==='marks'?`${g.quantity} marks`:`${g.name} × ${g.quantity}`;};
/** Compare total owned copies, so fitting or removing gear is never new loot. */
export function resourceGains(before:ReturnType<typeof resourceSnapshot>,s:GameState):ResourceGain[]{
 const gains:ResourceGain[]=[];
 if(s.coins>before.marks)gains.push({icon:'marks',name:'marks',quantity:s.coins-before.marks});
 for(const id of supplies){const quantity=supplyCount(s,id)-before.supplies[id];if(quantity>0)gains.push(supplyGain(id,quantity));}
 return gains;
}
export const rewardList=(gains:ResourceGain[])=>gains.length?`<ul class="reward-list" aria-label="Received">${gains.map(g=>`<li>${icon(g.icon)}<span>${rewardLabel(g)}</span></li>`).join('')}</ul>`:'';
