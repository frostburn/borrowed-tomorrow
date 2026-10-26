/** Plain supplies have fixed effects, independent of skills, level and equipment. */
export const CONSUMABLES = {
  bandage: { name: 'Bandage', description: 'Restore 24 HP to one living ally. Range 3. Uses your action; no focus cost.', power: 24, cost: 8, effect: 'hp' },
  'field-bandage': { name: 'Field bandage', description: 'Restore 48 HP to one living ally. Range 3. Uses your action; no focus cost.', power: 48, cost: 18, effect: 'hp' },
  'focus-tonic': { name: 'Focus tonic', description: 'Restore 3 focus to yourself or one living ally. Range 3. Uses your action.', power: 3, cost: 14, effect: 'focus' },
} as const;
export type ConsumableId = keyof typeof CONSUMABLES;
export const PACKED_CONSUMABLES = ['field-bandage', 'focus-tonic'] as const;
export type PackedConsumableId = typeof PACKED_CONSUMABLES[number];
export const isConsumable = (id: string): id is ConsumableId => Object.hasOwn(CONSUMABLES, id);
export const consumableCount = (s: { bandages: number; inventory: { bag: Partial<Record<PackedConsumableId, number>> } }, id: ConsumableId) => id === 'bandage' ? s.bandages : s.inventory.bag[id] ?? 0;
