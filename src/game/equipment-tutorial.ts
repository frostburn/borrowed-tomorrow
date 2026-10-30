import {heroAvailable} from '../rules/availability';
import {canEquip,type ItemId} from '../rules/inventory';
import type {GameState,HeroId} from '../rules/state';
import type {ResourceGain} from './rewards';

export interface EquipmentHint {hero:HeroId;item:ItemId}
/** Only an actual new, usable bag addition can introduce equipment. Never opens on load. */
export function equipmentHint(state:GameState,gains:ResourceGain[]):EquipmentHint|undefined{
 if(state.flags.equipmentHintSeen)return;
 for(const gain of gains){
  const item=gain.item;if(!item||gain.quantity<=0||!state.inventory.bag[item])continue;
  const hero=state.party.find(p=>heroAvailable(state,p.id)&&canEquip(p.id,item)&&!Object.values(state.inventory.characters[p.id]).includes(item));
  if(hero)return {hero:hero.id,item};
 }
}
/** Mark only when the hint is actually displayed, before its normal checkpoint save. */
export function takeEquipmentHint(state:GameState,gains:ResourceGain[]){
 const hint=equipmentHint(state,gains);if(hint)state.flags.equipmentHintSeen=true;return hint;
}
export const EQUIPMENT_HINT='Equip gear to use its bonuses.';
