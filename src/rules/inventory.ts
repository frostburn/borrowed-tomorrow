import { COMPANION_IDS, type CompanionId } from './party';

export const SLOTS = ['fitting', 'coat'] as const;
export type EquipmentSlot = typeof SLOTS[number];
export interface EquipmentBonuses { attack: number; armor: number; speed: number }
interface ItemDefinition { name: string; slot: EquipmentSlot; heroes: readonly CompanionId[]; description: string; bonuses: EquipmentBonuses }
export const ITEMS = {
  'return-valve': {name:'Counterweighted return valve',slot:'fitting',heroes:['orrin'],description:'A salvage fitting from the works. A powerful jet with a guarded return stroke.',bonuses:{attack:5,armor:1,speed:0}},
  'field-clasp': {name:'Silver field clasp',slot:'fitting',heroes:['celia'],description:'A sanctuary field clasp that steadies Celia’s celestial light and keeps her kit close.',bonuses:{attack:3,armor:1,speed:1}},
  'folding-sight': {name:'Folding range sight',slot:'fitting',heroes:['kit'],description:'A surveyor’s range sight, adapted to Kit’s crossbow.',bonuses:{attack:5,armor:0,speed:1}},
  'rescue-coat': {name:'Braced rescue coat',slot:'coat',heroes:COMPANION_IDS,description:'A reinforced evacuation coat. Sturdy protection without slowing movement.',bonuses:{attack:0,armor:3,speed:0}},
  'sun-prism': {name:'Guardian prism',slot:'fitting',heroes:['nell'],description:'A cut lens from the sanctuary. Strengthens Nell’s lantern and protects her hand.',bonuses:{attack:5,armor:2,speed:0}},
  'brass-reflector': { name: 'Brass reflector', slot: 'fitting', heroes: ['nell'], description: 'A brighter lantern beam.', bonuses: { attack: 3, armor: 0, speed: 0 } },
  'lance-nozzle': { name: 'Pressure nozzle', slot: 'fitting', heroes: ['orrin'], description: 'A tighter jet from the steam lance.', bonuses: { attack: 3, armor: 0, speed: 0 } },
  'courier-sight': { name: 'Courier sight', slot: 'fitting', heroes: ['kit'], description: 'A light sight for Kit’s crossbow.', bonuses: { attack: 3, armor: 0, speed: 1 } },
  'medic-clasp': { name: 'Medic clasp', slot: 'fitting', heroes: ['celia'], description: 'Keeps Celia’s field kit ready to hand.', bonuses: { attack: 0, armor: 1, speed: 1 } },
  'saber-hilt': { name: 'Balanced saber hilt', slot: 'fitting', heroes: ['petra'], description: 'A firm grip for Petra’s saber and shield.', bonuses: { attack: 3, armor: 1, speed: 0 } },
  'baffled-nozzle': { name: 'Baffled pressure nozzle', slot: 'fitting', heroes: ['orrin'], description: 'A tighter steam jet and quicker valve return for Orrin’s lance.', bonuses: { attack: 4, armor: 0, speed: 1 } },
  'silver-reflector': { name: 'Silver reflector', slot: 'fitting', heroes: ['nell'], description: 'A silvered engine lens. Strengthens Nell’s lantern and shields its handle.', bonuses: { attack: 4, armor: 1, speed: 0 } },
  'ratchet-sight': { name: 'Ratchet sight', slot: 'fitting', heroes: ['kit'], description: 'A precise repeating-crossbow mechanism for Kit.', bonuses: { attack: 4, armor: 0, speed: 1 } },
  'insulated-coat': { name: 'Insulated work coat', slot: 'coat', heroes: COMPANION_IDS, description: 'Light heat-resistant lining. Protection without a speed penalty.', bonuses: { attack: 0, armor: 2, speed: 0 } },
  'work-coat': { name: 'Reinforced work coat', slot: 'coat', heroes: COMPANION_IDS, description: 'Padded canvas. One coat protects one wearer.', bonuses: { attack: 0, armor: 1, speed: 0 } },
  'heavy-coat': { name: 'Heavy work coat', slot: 'coat', heroes: COMPANION_IDS, description: 'Extra protection, but slower to act.', bonuses: { attack: 0, armor: 2, speed: -2 } },
} as const satisfies Record<string, ItemDefinition>;
export type ItemId = keyof typeof ITEMS;
export interface Inventory {
  version: 2;
  bag: Partial<Record<ItemId, number>>;
  characters: Record<CompanionId, Record<EquipmentSlot, ItemId | null>>;
}
export function newInventory(): Inventory {
  return { version: 2, bag: {}, characters: Object.fromEntries(COMPANION_IDS.map(id => [id, { fitting: null, coat: null }])) as Inventory['characters'] };
}
export const canEquip = (hero: CompanionId, item: ItemId) => (ITEMS[item].heroes as readonly CompanionId[]).includes(hero);
export const ownedCopies = (inventory: Inventory, item: ItemId) => (inventory.bag[item] ?? 0) + Object.values(inventory.characters).flatMap(slots => Object.values(slots)).filter(id => id === item).length;
export function receiveItem(inventory: Inventory, item: ItemId, quantity = 1): boolean {
  if (!Number.isInteger(quantity) || quantity < 1 || ownedCopies(inventory, item) + quantity > 99) return false;
  inventory.bag[item] = (inventory.bag[item] ?? 0) + quantity;
  return true;
}
export function equipItem(inventory: Inventory, hero: CompanionId, item: ItemId): boolean {
  if (!canEquip(hero, item) || !(inventory.bag[item] ?? 0)) return false;
  const slot = ITEMS[item].slot, previous = inventory.characters[hero][slot];
  if (previous === item || previous && (inventory.bag[previous] ?? 0) >= 99) return false;
  inventory.bag[item] = inventory.bag[item]! - 1;
  if (previous) inventory.bag[previous] = (inventory.bag[previous] ?? 0) + 1;
  inventory.characters[hero][slot] = item;
  return true;
}
export function unequipItem(inventory: Inventory, hero: CompanionId, slot: EquipmentSlot): boolean {
  const previous = inventory.characters[hero][slot];
  if (!previous || (inventory.bag[previous] ?? 0) >= 99) return false;
  inventory.bag[previous] = (inventory.bag[previous] ?? 0) + 1;
  inventory.characters[hero][slot] = null;
  return true;
}
export function equipmentBonuses(inventory: Inventory): Record<CompanionId, EquipmentBonuses> {
  const bonuses = Object.fromEntries(COMPANION_IDS.map(id => [id, { attack: 0, armor: 0, speed: 0 }])) as Record<CompanionId, EquipmentBonuses>;
  for (const hero of COMPANION_IDS) for (const slot of SLOTS) {
    const item = inventory.characters[hero][slot];
    if (item) for (const stat of ['attack', 'armor', 'speed'] as const) bonuses[hero][stat] += ITEMS[item].bonuses[stat];
  }
  return bonuses;
}
export function decodeInventory(text: string): Inventory {
  const raw = JSON.parse(text);
  if (!raw || raw.version !== 2 || !raw.bag || typeof raw.bag !== 'object' || Array.isArray(raw.bag) || !raw.characters) throw new Error('Invalid inventory.');
  const inventory = newInventory();
  for (const [item, count] of Object.entries(raw.bag)) {
    if (!Object.hasOwn(ITEMS, item) || !Number.isInteger(count) || (count as number) < 0 || (count as number) > 99) throw new Error('Invalid item count.');
    inventory.bag[item as ItemId] = count as number;
  }
  for (const hero of COMPANION_IDS) for (const slot of SLOTS) {
    const slots = raw.characters[hero];
    const item = slots?.[slot];
    if (item !== null && (typeof item !== 'string' || !Object.hasOwn(ITEMS, item) || ITEMS[item as ItemId].slot !== slot || !canEquip(hero, item as ItemId))) throw new Error('Invalid equipment.');
    inventory.characters[hero][slot] = item;
  }
  if ((Object.keys(ITEMS) as ItemId[]).some(item => ownedCopies(inventory, item) > 99)) throw new Error('Too many copies.');
  return inventory;
}
