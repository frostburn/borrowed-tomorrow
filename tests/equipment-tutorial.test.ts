import {expect,it} from 'vitest';
import {equipmentHint,takeEquipmentHint} from '../src/game/equipment-tutorial';
import {rewardLabel,rewardList,resourceSnapshot,resourceGains,supplyGain} from '../src/game/rewards';
import {newGame,recruitOrrin} from '../src/rules/state';
import {receiveItem,equipItem} from '../src/rules/inventory';
import {decodeSave} from '../src/rules/save';

it('labels every tool with its character instead of a count, leaving shared coats and supplies counted',()=>{
 expect(rewardLabel(supplyGain('brass-reflector',2))).toBe('Brass reflector · Nell');
 expect(rewardLabel(supplyGain('lance-nozzle'))).toBe('Pressure nozzle · Orrin');
 expect(rewardLabel(supplyGain('courier-sight'))).toBe('Courier sight · Kit');
 expect(rewardLabel(supplyGain('work-coat',2))).toBe('Reinforced work coat × 2');
 expect(rewardLabel(supplyGain('bandage',3))).toBe('Bandage × 3');
 expect(rewardList([supplyGain('medic-clasp')])).toContain('Medic clasp · Celia');
});
it('offers equipping once for new compatible bag gear and persists the flag without fitting anything automatically',()=>{
 const s=newGame(),before=resourceSnapshot(s);receiveItem(s.inventory,'brass-reflector');const gains=resourceGains(before,s);
 expect(equipmentHint(s,gains)).toEqual({hero:'nell',item:'brass-reflector'});expect(s.flags.equipmentHintSeen).toBeUndefined();
 const inventory=structuredClone(s.inventory);expect(takeEquipmentHint(s,gains)).toEqual({hero:'nell',item:'brass-reflector'});expect(s.inventory).toEqual(inventory);
 expect(takeEquipmentHint(s,gains)).toBeUndefined();expect(decodeSave(JSON.stringify(s)).flags.equipmentHintSeen).toBe(true);
 receiveItem(s.inventory,'work-coat');expect(equipmentHint(s,[supplyGain('work-coat')])).toBeUndefined();
});
it('does not consume the hint for consumables, missing bag copies, unrecruited recipients or unavailable Nell',()=>{
 const s=newGame();expect(takeEquipmentHint(s,[supplyGain('bandage')])).toBeUndefined();expect(takeEquipmentHint(s,[supplyGain('brass-reflector')])).toBeUndefined();
 receiveItem(s.inventory,'lance-nozzle');expect(takeEquipmentHint(s,[supplyGain('lance-nozzle')])).toBeUndefined();expect(s.flags.equipmentHintSeen).toBeUndefined();
 receiveItem(s.inventory,'brass-reflector');s.flags.nellIll=true;expect(takeEquipmentHint(s,[supplyGain('brass-reflector')])).toBeUndefined();
 recruitOrrin(s);expect(takeEquipmentHint(s,[supplyGain('lance-nozzle')])).toEqual({hero:'orrin',item:'lance-nozzle'});
});
it('does not mistake moving already owned gear between slots and the bag for a new reward',()=>{
 const s=newGame();receiveItem(s.inventory,'brass-reflector');const before=resourceSnapshot(s);equipItem(s.inventory,'nell','brass-reflector');
 expect(equipmentHint(s,resourceGains(before,s))).toBeUndefined();expect(s.flags.equipmentHintSeen).toBeUndefined();
});
