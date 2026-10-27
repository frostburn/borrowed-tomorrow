import { CONSUMABLES, consumableCount, isConsumable, type ConsumableId } from './consumables';
import { ITEMS, ownedCopies, receiveItem, type ItemId } from './inventory';
import type { GameState } from './state';

export type ShopId = 'station' | 'coast' | 'ward' | 'conduit' | 'field';
const STARTER_GEAR = [
  { id: 'brass-reflector', cost: 30 }, { id: 'lance-nozzle', cost: 30 },
  { id: 'work-coat', cost: 15 }, { id: 'heavy-coat', cost: 25 },
] as const;
const COAST_GEAR = [
  { id: 'coastal-reflector', cost: 46 }, { id: 'sealed-nozzle', cost: 46 },
  { id: 'steady-stock', cost: 44 }, { id: 'travel-coat', cost: 32 },
] as const;
const CONDUIT_GEAR = [...COAST_GEAR, {id:'insulated-coat',cost:48}, {id:'saber-hilt',cost:58}] as const;
const MEDICAL_GEAR = [{id:'insulated-coat',cost:48}, {id:'medic-clasp',cost:36}, {id:'travel-coat',cost:32}] as const;
const medicine = (id: ConsumableId) => ({ id, cost: CONSUMABLES[id].cost });
export const shopStock = (shop: ShopId) => shop === 'station'
  ? [medicine('bandage'), ...STARTER_GEAR]
  : shop === 'field' ? [medicine('bandage'), medicine('field-bandage'), medicine('focus-tonic'), ...MEDICAL_GEAR]
  : shop === 'conduit' ? [medicine('bandage'), ...CONDUIT_GEAR]
  : [medicine('bandage'), ...COAST_GEAR, ...STARTER_GEAR];
export type SupplyId = ItemId | ConsumableId;
export const supplyCount = (state: GameState, id: SupplyId) => isConsumable(id) ? consumableCount(state, id) : ownedCopies(state.inventory, id);
export function canBuy(state: GameState, id: SupplyId, shop: ShopId = 'station') {
  const supply = shopStock(shop).find(s => s.id === id);
  if (shop === 'conduit' && !['chapter-three','chapter-four','chapter-five','chapter-six','chapter-seven'].includes(state.chapter)) return false;
  if (shop === 'field' && !['chapter-four','chapter-five','chapter-six','chapter-seven'].includes(state.chapter)) return false;
  if (!supply || state.coins < supply.cost || shop !== 'station' && state.chapter === 'chapter-one') return false;
  if (isConsumable(id)) return supplyCount(state, id) < (id === 'bandage' ? 999 : 99);
  return ITEMS[id].heroes.some(h => state.party.some(p => p.id === h)) &&
    ownedCopies(state.inventory, id) < (ITEMS[id].slot === 'fitting' ? 1 : 99);
}
export function buySupply(state: GameState, id: SupplyId, shop: ShopId = 'station'): boolean {
  if (!canBuy(state, id, shop)) return false;
  if (id === 'bandage') state.bandages++;
  else if (isConsumable(id)) state.inventory.bag[id] = (state.inventory.bag[id] ?? 0) + 1;
  else if (!receiveItem(state.inventory, id)) return false;
  state.coins -= shopStock(shop).find(s => s.id === id)!.cost;
  return true;
}
/** Only spare equipment is sold. Story objects are not equipment. */
export function sellPrice(id: ItemId): number {
  const purchase = [...STARTER_GEAR, ...CONDUIT_GEAR, ...MEDICAL_GEAR].find(s => s.id === id);
  if (purchase) return Math.floor(purchase.cost / 2);
  const b = ITEMS[id].bonuses;
  return Math.max(4, b.attack * 4 + b.armor * 4 + Math.max(0, b.speed) * 2);
}
export function canSell(state: GameState, id: ItemId): boolean {
  return Object.hasOwn(ITEMS, id) && (state.inventory.bag[id] ?? 0) > 0 && state.coins + sellPrice(id) <= 1e7;
}
export function sellEquipment(state: GameState, id: ItemId): boolean {
  if (!canSell(state, id)) return false;
  state.inventory.bag[id]!--;
  state.coins += sellPrice(id);
  return true;
}
