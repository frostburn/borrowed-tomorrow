import { COMPANION_IDS, type CompanionId } from './party';

export const SLOTS = ['fitting', 'coat'] as const;
export type EquipmentSlot = typeof SLOTS[number];
export interface EquipmentBonuses { attack: number; armor: number; speed: number }
interface ItemDefinition { name: string; slot: EquipmentSlot; heroes: readonly CompanionId[]; description: string; bonuses: EquipmentBonuses }
export const ITEMS = {
 'crossing-coat':{name:'Crossing coat',slot:'coat',heroes:COMPANION_IDS,description:'A strong lining from the first collector’s store, cut to leave room at the shoulders.',bonuses:{attack:0,armor:6,speed:1}},
 'morning-reflector':{name:'Morning-glass reflector',slot:'fitting',heroes:['nell'],description:'The first keeper’s lamp glass, cleaned and fitted to Ansel’s lantern.',bonuses:{attack:11,armor:2,speed:2}},
 'first-valve':{name:'Original expansion valve',slot:'fitting',heroes:['orrin'],description:'A sound return valve from the harvest machine, adapted to the steam lance.',bonuses:{attack:11,armor:3,speed:1}},
 'first-focus':{name:'Unbound field focus',slot:'fitting',heroes:['celia'],description:'A hospice lens with the return contacts removed. It keeps the examination light steady.',bonuses:{attack:10,armor:4,speed:1}},
 'open-guard':{name:'Open-road saber guard',slot:'fitting',heroes:['petra'],description:'An intact guard from the seasons gate, fitted to Petra’s saber grip.',bonuses:{attack:11,armor:5,speed:1}},
 'farroad-sight':{name:'Far-road survey sight',slot:'fitting',heroes:['kit'],description:'A sight from the courier stair, with a wide field and quick folding rest.',bonuses:{attack:11,armor:1,speed:3}},
  'procession-coat':{name:'Lined ceremonial coat',slot:'coat',heroes:COMPANION_IDS,description:'A palace coat with its stiff train removed. Protective lining and room to move.',bonuses:{attack:0,armor:5,speed:1}},
  'crown-nozzle':{name:'Pressure-crown nozzle',slot:'fitting',heroes:['orrin'],description:'A guarded regulator from the palace service engine, fitted to the steam lance.',bonuses:{attack:9,armor:2,speed:0}},
  'cloister-sight':{name:'Cloister range sight',slot:'fitting',heroes:['kit'],description:'A compact survey sight from the palace roof walk. Fast to raise, with a narrow field.',bonuses:{attack:8,armor:0,speed:3}},
  'palace-focus':{name:'Palace medical focus',slot:'fitting',heroes:['celia'],description:'A treatment lens left in the service locker for the ward crews.',bonuses:{attack:8,armor:3,speed:0}},
  'unbroken-guard':{name:'Unbroken crown guard',slot:'fitting',heroes:['petra'],description:'A sound hand guard recovered beneath the fallen crown. Heavy, but strong.',bonuses:{attack:9,armor:4,speed:0}},
  'stormlining-coat':{name:'Storm-lined expedition coat',slot:'coat',heroes:COMPANION_IDS,description:'Skeld’s windproof layered coat. A short hem leaves the knees free.',bonuses:{attack:0,armor:4,speed:2}},
  'ice-valve':{name:'Cold-weather expansion valve',slot:'fitting',heroes:['orrin'],description:'A glacier salvage valve with a guarded return and quick pressure recovery.',bonuses:{attack:7,armor:3,speed:1}},
  'winter-sight':{name:'Winter range sight',slot:'fitting',heroes:['kit'],description:'A hooded expedition sight, clear even against a field of snow.',bonuses:{attack:8,armor:2,speed:1}},
  'pact-guard':{name:'Sanctuary saber guard',slot:'fitting',heroes:['petra'],description:'Signe’s spare ice-climbing guard, adapted to protect Petra’s sword hand.',bonuses:{attack:7,armor:3,speed:2}},
  'reedweave-coat':{name:'Reedweave travel coat',slot:'coat',heroes:COMPANION_IDS,description:'A light layered river coat. Protective lining without a heavy hem.',bonuses:{attack:0,armor:4,speed:1}},
  'rainhouse-focus':{name:'Rainhouse field focus',slot:'fitting',heroes:['celia'],description:'A treatment lens with a firm folding guard, adapted for Celia’s field work.',bonuses:{attack:6,armor:3,speed:1}},
  'riverglass-reflector':{name:'Riverglass lantern reflector',slot:'fitting',heroes:['nell'],description:'Ines’s spare examination-lamp reflector. A bright beam and a balanced grip.',bonuses:{attack:7,armor:2,speed:2}},
  'river-sight':{name:'River range sight',slot:'fitting',heroes:['kit'],description:'A weatherproof survey sight with a fast folding rest for Kit’s crossbow.',bonuses:{attack:7,armor:1,speed:2}},
  'sunmesh-coat':{name:'Sunmesh travel coat',slot:'coat',heroes:COMPANION_IDS,description:'A light metal weave beneath desert cloth. Protection against the observatory’s heat.',bonuses:{attack:0,armor:5,speed:0}},
  'fine-expansion-ring':{name:'Fine expansion ring',slot:'fitting',heroes:['orrin'],description:'A precisely cut observatory fitting for Orrin’s steam lance.',bonuses:{attack:8,armor:1,speed:1}},
  'sunstone-focus':{name:'Sunstone examination lens',slot:'fitting',heroes:['celia'],description:'A desert physician’s lens, fitted to Celia’s field focus.',bonuses:{attack:7,armor:2,speed:1}},
  'solar-guard':{name:'Solar saber guard',slot:'fitting',heroes:['petra'],description:'A bronze guard from the released apparatus. Protects Petra’s grip without weighing down her blade.',bonuses:{attack:6,armor:4,speed:1}},
  'courier-harness':{name:'Canal courier harness',slot:'coat',heroes:COMPANION_IDS,description:'Amal’s spare cross-body harness. Holds equipment close while climbing or running.',bonuses:{attack:0,armor:3,speed:2}},
  'fleet-sight':{name:'Fleet range sight',slot:'fitting',heroes:['kit'],description:'A brass ranging mechanism from the disabled bridge, fitted to Kit’s crossbow.',bonuses:{attack:7,armor:0,speed:1}},
  'ward-focus':{name:'Windmere medical focus',slot:'fitting',heroes:['celia'],description:'Sera’s spare treatment lens, steadied for field use.',bonuses:{attack:5,armor:2,speed:1}},
  'opal-reflector':{name:'Opal lantern reflector',slot:'fitting',heroes:['nell'],description:'An old examination-lamp reflector. A brighter beam and a lighter hand.',bonuses:{attack:6,armor:1,speed:1}},
  'shield-brace':{name:'Dawnwatch shield brace',slot:'fitting',heroes:['petra'],description:'A firm shield grip and reinforced saber strap from the town watch.',bonuses:{attack:4,armor:3,speed:0}},
  'field-coat':{name:'Officers’ field coat',slot:'coat',heroes:COMPANION_IDS,description:'A light lined coat from Dawnwatch’s field locker. Keeps its wearer quick on their feet.',bonuses:{attack:0,armor:3,speed:1}},
  'forge-valve':{name:'Balanced expansion valve',slot:'fitting',heroes:['orrin'],description:'A foundry valve with a smooth return stroke. Salvaged from the furnace carrier.',bonuses:{attack:6,armor:1,speed:1}},
  'heat-coat':{name:'Foundry safety coat',slot:'coat',heroes:COMPANION_IDS,description:'Layered heat shielding from Hammerplain’s safety store.',bonuses:{attack:0,armor:4,speed:0}},
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
  if (typeof raw.characters !== 'object' || Array.isArray(raw.characters) || Object.keys(raw.characters).length !== COMPANION_IDS.length) throw new Error('Invalid inventory roster.');
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
