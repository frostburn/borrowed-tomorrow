import type { HeroId } from './state';

export const SLOTS = ['fitting', 'coat'] as const;
export type EquipmentSlot = typeof SLOTS[number];
export interface EquipmentBonuses { attack: number; armor: number; speed: number }
interface ItemDefinition { name: string; slot: EquipmentSlot; heroes: readonly HeroId[]; description: string; bonuses: EquipmentBonuses }
export const ITEMS = {
  'brass-reflector': { name: 'Brass reflector', slot: 'fitting', heroes: ['nell'], description: 'A brighter lantern beam.', bonuses: { attack: 3, armor: 0, speed: 0 } },
  'lance-nozzle': { name: 'Pressure nozzle', slot: 'fitting', heroes: ['orrin'], description: 'A tighter jet from the steam lance.', bonuses: { attack: 3, armor: 0, speed: 0 } },
  'work-coat': { name: 'Reinforced work coat', slot: 'coat', heroes: ['nell', 'orrin'], description: 'Padded canvas. One coat protects one wearer.', bonuses: { attack: 0, armor: 1, speed: 0 } },
  'heavy-coat': { name: 'Heavy work coat', slot: 'coat', heroes: ['nell', 'orrin'], description: 'Extra protection, but slower to act.', bonuses: { attack: 0, armor: 2, speed: -2 } },
} as const satisfies Record<string, ItemDefinition>;
export type ItemId = keyof typeof ITEMS;
export interface Inventory {
  version: 1;
  bag: Partial<Record<ItemId, number>>;
  characters: Record<HeroId, Record<EquipmentSlot, ItemId | null>>;
}
export function newInventory(): Inventory {
  return { version: 1, bag: {}, characters: { nell: { fitting: null, coat: null }, orrin: { fitting: null, coat: null } } };
}
export const canEquip = (hero: HeroId, item: ItemId) => (ITEMS[item].heroes as readonly HeroId[]).includes(hero);
export const ownedCopies = (inventory: Inventory, item: ItemId) => (inventory.bag[item] ?? 0) + Object.values(inventory.characters).flatMap(slots => Object.values(slots)).filter(id => id === item).length;
export function receiveItem(inventory: Inventory, item: ItemId, quantity = 1): boolean {
  if (!Number.isInteger(quantity) || quantity < 1 || ownedCopies(inventory, item) + quantity > 99) return false;
  inventory.bag[item] = (inventory.bag[item] ?? 0) + quantity;
  return true;
}
export function equipItem(inventory: Inventory, hero: HeroId, item: ItemId): boolean {
  if (!canEquip(hero, item) || !(inventory.bag[item] ?? 0)) return false;
  const slot = ITEMS[item].slot, previous = inventory.characters[hero][slot];
  if (previous === item || previous && (inventory.bag[previous] ?? 0) >= 99) return false;
  inventory.bag[item] = inventory.bag[item]! - 1;
  if (previous) inventory.bag[previous] = (inventory.bag[previous] ?? 0) + 1;
  inventory.characters[hero][slot] = item;
  return true;
}
export function unequipItem(inventory: Inventory, hero: HeroId, slot: EquipmentSlot): boolean {
  const previous = inventory.characters[hero][slot];
  if (!previous || (inventory.bag[previous] ?? 0) >= 99) return false;
  inventory.bag[previous] = (inventory.bag[previous] ?? 0) + 1;
  inventory.characters[hero][slot] = null;
  return true;
}
export function equipmentBonuses(inventory: Inventory): Record<HeroId, EquipmentBonuses> {
  const bonuses = { nell: { attack: 0, armor: 0, speed: 0 }, orrin: { attack: 0, armor: 0, speed: 0 } };
  for (const hero of ['nell', 'orrin'] as const) for (const slot of SLOTS) {
    const item = inventory.characters[hero][slot];
    if (item) for (const stat of ['attack', 'armor', 'speed'] as const) bonuses[hero][stat] += ITEMS[item].bonuses[stat];
  }
  return bonuses;
}
export function decodeInventory(text: string): Inventory {
  const raw = JSON.parse(text);
  if (!raw || raw.version !== 1 || !raw.bag || typeof raw.bag !== 'object' || Array.isArray(raw.bag) || !raw.characters) throw new Error('Invalid inventory.');
  const inventory = newInventory();
  for (const [item, count] of Object.entries(raw.bag)) {
    if (!Object.hasOwn(ITEMS, item) || !Number.isInteger(count) || (count as number) < 0 || (count as number) > 99) throw new Error('Invalid item count.');
    inventory.bag[item as ItemId] = count as number;
  }
  for (const hero of ['nell', 'orrin'] as const) for (const slot of SLOTS) {
    const item = raw.characters[hero]?.[slot];
    if (item !== null && (typeof item !== 'string' || !Object.hasOwn(ITEMS, item) || ITEMS[item as ItemId].slot !== slot || !canEquip(hero, item as ItemId))) throw new Error('Invalid equipment.');
    inventory.characters[hero][slot] = item;
  }
  if ((Object.keys(ITEMS) as ItemId[]).some(item => ownedCopies(inventory, item) > 99)) throw new Error('Too many copies.');
  return inventory;
}
