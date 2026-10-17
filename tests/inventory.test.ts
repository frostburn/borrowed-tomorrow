import { expect, it } from 'vitest';
import { decodeInventory, equipmentBonuses, equipItem, newInventory, receiveItem, unequipItem } from '../src/rules/inventory';
import { ABILITIES, createBattle, damage } from '../src/rules/combat';
import { newGame, recruitOrrin } from '../src/rules/state';

it('acquisition leaves equipment alone, and swapping returns the old item to the bag', () => {
  const inventory = newInventory(); receiveItem(inventory, 'work-coat', 2); receiveItem(inventory, 'heavy-coat');
  expect(equipmentBonuses(inventory).nell.armor).toBe(0);
  expect(equipItem(inventory, 'nell', 'work-coat')).toBe(true);
  expect(equipItem(inventory, 'orrin', 'work-coat')).toBe(true);
  expect(inventory.bag['work-coat']).toBe(0);
  expect(equipItem(inventory, 'nell', 'heavy-coat')).toBe(true);
  expect(inventory.bag['work-coat']).toBe(1);
  expect(unequipItem(inventory, 'orrin', 'coat')).toBe(true);
  expect(inventory.bag['work-coat']).toBe(2);
});
it('refuses incompatible gear and a second claim on the same copy without changing state', () => {
  const inventory = newInventory(); receiveItem(inventory, 'brass-reflector'); receiveItem(inventory, 'heavy-coat');
  expect(equipItem(inventory, 'orrin', 'brass-reflector')).toBe(false);
  equipItem(inventory, 'nell', 'heavy-coat'); const before = structuredClone(inventory);
  expect(equipItem(inventory, 'orrin', 'heavy-coat')).toBe(false);
  expect(receiveItem(inventory, 'work-coat', -1)).toBe(false);
  expect(inventory).toEqual(before);
});
it('serializes copies and loadouts, rejecting malformed or incompatible equipment', () => {
  const inventory = newInventory(); receiveItem(inventory, 'work-coat', 2); equipItem(inventory, 'nell', 'work-coat');
  expect(decodeInventory(JSON.stringify(inventory))).toEqual(inventory);
  for (const text of ['null', '{}', JSON.stringify({ ...inventory, bag: { 'unknown': 1 } }), JSON.stringify({ ...inventory, bag: { 'work-coat': -1 } })]) expect(() => decodeInventory(text)).toThrow();
  inventory.characters.orrin.fitting = 'brass-reflector'; expect(() => decodeInventory(JSON.stringify(inventory))).toThrow();
});
it('equipped gear changes actual combat damage, armor and initiative only for its wearer', () => {
  const inventory = newInventory(), state = newGame(); recruitOrrin(state);
  // Old campaign gear must not leak into an explicit loadout.
  state.gear = ['work-coats', 'brass-lantern'];
  const before = createBattle('workshop', state, equipmentBonuses(inventory));
  receiveItem(inventory, 'brass-reflector'); receiveItem(inventory, 'heavy-coat');
  equipItem(inventory, 'nell', 'brass-reflector'); equipItem(inventory, 'nell', 'heavy-coat');
  const after = createBattle('workshop', state, equipmentBonuses(inventory));
  expect(damage(after.units[0], after.units[2], 'strike')).toBe(damage(before.units[0], before.units[2], 'strike') + 3);
  expect(damage(after.units[2], after.units[0], 'strike')).toBeLessThan(damage(before.units[2], before.units[0], 'strike'));
  expect(after.units[0].armor).toBe(2); expect(after.units[1].armor).toBe(0);
  expect(after.units[0].speed).toBe(before.units[0].speed - 2); expect(after.queue[0]).not.toBe('nell');
  expect(after.units[1].bonus).toBe(before.units[1].bonus); expect(ABILITIES.strike.power + after.units[0].bonus).toBe(14);
  expect(createBattle('workshop', state).units[1].armor).toBe(1);
});
