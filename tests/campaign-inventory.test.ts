import { expect, it } from 'vitest';
import { awardVictory, createBattle } from '../src/rules/combat';
import { decodeSave, newGame, recruitOrrin } from '../src/rules/state';
import { equipItem, equipmentBonuses, ownedCopies, receiveItem } from '../src/rules/inventory';
import { buySupply } from '../src/rules/supplies';
import { checkpoint } from './support/progress';

it('migrates version-five equipment without changing the departure or duplicating copies',()=>{
  const state=checkpoint('chapterOneComplete');state.bandages=17;state.playSeconds=913;
  const {inventory:_,...fields}=state;
  const legacy={...fields,version:5,gear:['brass-lantern','work-coats','work-coats']};
  const migrated=decodeSave(JSON.stringify(legacy));
  expect(migrated).toMatchObject({...fields,version:8});expect(migrated).not.toHaveProperty('gear');
  expect(equipmentBonuses(migrated.inventory)).toMatchObject({nell:{attack:3,armor:1,speed:0},orrin:{attack:0,armor:1,speed:0}});
  expect(ownedCopies(migrated.inventory,'brass-reflector')).toBe(1);expect(ownedCopies(migrated.inventory,'work-coat')).toBe(2);
  expect(decodeSave(JSON.stringify(migrated))).toEqual(migrated);
  expect(legacy.gear).toEqual(['brass-lantern','work-coats','work-coats']);
});
it('preserves the old coat upgrade for Orrin when he is recruited after migration',()=>{
  const {inventory:_,...fields}=newGame();
  const state=decodeSave(JSON.stringify({...fields,version:5,gear:['work-coats']}));
  expect(state.party).toHaveLength(1);recruitOrrin(state);
  expect(createBattle('workshop',state).units.filter(u=>u.side==='party').map(u=>u.armor)).toEqual([1,1]);
  expect(ownedCopies(state.inventory,'work-coat')).toBe(2);
});
it('rejects invalid inventory and legacy gear while retaining old-story rejection',()=>{
  const s=newGame();
  for(const bad of [
    {...s,inventory:undefined},{...s,inventory:{...s.inventory,bag:{'work-coat':100}}},
    {...s,inventory:{...s.inventory,characters:{...s.inventory.characters,nell:{coat:'lance-nozzle',fitting:null}}}},
    {...s,version:5,gear:['unknown']},{...s,version:5,gear:undefined},
  ])expect(()=>decodeSave(JSON.stringify(bad))).toThrow();
  for(const version of [1,2,3,4])expect(()=>decodeSave(JSON.stringify({...s,version}))).toThrow('previous story');
});
it('buys individual copies into the bag and never charges for unavailable purchases',()=>{
  const s=newGame();s.coins=100;
  expect(buySupply(s,'lance-nozzle')).toBe(false);expect(s.coins).toBe(100);
  expect(buySupply(s,'work-coat')).toBe(true);expect(buySupply(s,'work-coat')).toBe(true);
  expect(s.coins).toBe(70);expect(s.inventory.bag['work-coat']).toBe(2);expect(s.inventory.characters.nell.coat).toBeNull();
  recruitOrrin(s);expect(buySupply(s,'lance-nozzle')).toBe(true);expect(s.coins).toBe(40);
  const before=structuredClone(s);expect(buySupply(s,'lance-nozzle')).toBe(false);expect(s).toEqual(before);
  s.coins=7;const poor=structuredClone(s);expect(buySupply(s,'bandage')).toBe(false);expect(s).toEqual(poor);
});
it('honors total copy limits and bandage capacity without losing money',()=>{
  const s=newGame();s.coins=100;receiveItem(s.inventory,'work-coat',99);equipItem(s.inventory,'nell','work-coat');s.bandages=999;
  const before=structuredClone(s);expect(buySupply(s,'work-coat')).toBe(false);expect(buySupply(s,'bandage')).toBe(false);expect(s).toEqual(before);
});
it('awards the reflector to the bag once and applies its bonus only after equipping',()=>{
  const s=checkpoint('orrinJoined'),before=createBattle('workshop',s).units[0].bonus;
  const b=createBattle('workshop',s);b.result='victory';awardVictory(b,s);
  expect(s.inventory.bag['brass-reflector']).toBe(1);expect(s.inventory.characters.nell.fitting).toBeNull();
  // The level increase still applies independently of equipment.
  const unequipped=createBattle('workshop',s).units[0].bonus;expect(unequipped).toBeGreaterThanOrEqual(before);
  awardVictory(b,s);expect(ownedCopies(s.inventory,'brass-reflector')).toBe(1);
  equipItem(s.inventory,'nell','brass-reflector');expect(createBattle('workshop',s).units[0].bonus).toBe(unequipped+3);
  expect(decodeSave(JSON.stringify(s))).toEqual(s);
});
