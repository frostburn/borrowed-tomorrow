import { ITEMS, ownedCopies, receiveItem, type ItemId } from './inventory';
import type { GameState } from './state';

export const SUPPLIES = [
  { id: 'bandage', cost: 8 },
  { id: 'brass-reflector', cost: 30 },
  { id: 'lance-nozzle', cost: 30 },
  { id: 'work-coat', cost: 15 },
  { id: 'heavy-coat', cost: 25 },
] as const satisfies readonly { id: ItemId | 'bandage'; cost: number }[];
export type SupplyId = typeof SUPPLIES[number]['id'];
export function canBuy(state: GameState, id: SupplyId) {
  const supply = SUPPLIES.find(s => s.id === id);
  if (!supply || state.coins < supply.cost) return false;
  if (id === 'bandage') return state.bandages < 999;
  return ITEMS[id].heroes.some(h => state.party.some(p => p.id === h)) &&
    ownedCopies(state.inventory, id) < (ITEMS[id].slot === 'fitting' ? 1 : 99);
}
export function buySupply(state: GameState, id: SupplyId): boolean {
  if (!canBuy(state, id)) return false;
  if (id === 'bandage') state.bandages++;
  else if (!receiveItem(state.inventory, id)) return false;
  state.coins -= SUPPLIES.find(s => s.id === id)!.cost;
  return true;
}
