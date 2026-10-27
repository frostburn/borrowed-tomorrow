import { CONSUMABLES } from '../rules/consumables';
import { ITEMS } from '../rules/inventory';
import { supplyCount,type SupplyId } from '../rules/supplies';
import type { GameState } from '../rules/state';
import { itemIcon,type UIIcon } from '../content/ui-art';
import { icon } from './item-icons';
const definitions={...ITEMS,...CONSUMABLES};
const supplies=Object.keys(definitions) as SupplyId[];
export const resourceSnapshot=(s:GameState)=>({marks:s.coins,supplies:Object.fromEntries(supplies.map(id=>[id,supplyCount(s,id)]))});
export interface ResourceGain {icon:UIIcon;name:string;quantity:number}
/** Compare total owned copies, so fitting or removing gear is never new loot. */
export function resourceGains(before:ReturnType<typeof resourceSnapshot>,s:GameState):ResourceGain[]{
 const gains:ResourceGain[]=[];
 if(s.coins>before.marks)gains.push({icon:'marks',name:'marks',quantity:s.coins-before.marks});
 for(const id of supplies){const quantity=supplyCount(s,id)-before.supplies[id];if(quantity>0)gains.push({icon:itemIcon(id),name:definitions[id].name,quantity});}
 return gains;
}
export const rewardList=(gains:ResourceGain[])=>gains.length?`<ul class="reward-list" aria-label="Received">${gains.map(g=>`<li>${icon(g.icon)}<span>${g.name==='marks'?`${g.quantity} marks`:`${g.name} × ${g.quantity}`}</span></li>`).join('')}</ul>`:'';
