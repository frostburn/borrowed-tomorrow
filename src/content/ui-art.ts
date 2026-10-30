import type { ItemId } from '../rules/inventory';
import type { SupplyId } from '../rules/supplies';

/** Native 32px objects, shared by equipment, transactions and reward notices. */
export const UI_ICONS=['marks','reflector','prism','nozzle','valve','ring','sight','stock','focus','clasp','hilt','brace','coat','heavy-coat','harness','bandage','field-bandage','tonic','letter','ledger','chart','mural','lantern','horn','light'] as const;
export type UIIcon=typeof UI_ICONS[number];
const equipmentIcons={
 'coastal-reflector':'reflector','sealed-nozzle':'nozzle','steady-stock':'stock','travel-coat':'coat',
 'crossing-coat':'coat','morning-reflector':'reflector','first-valve':'valve','first-focus':'focus','open-guard':'hilt','farroad-sight':'sight',
 'procession-coat':'coat','crown-nozzle':'nozzle','cloister-sight':'sight','palace-focus':'focus','unbroken-guard':'hilt',
 'stormlining-coat':'heavy-coat','ice-valve':'valve','winter-sight':'sight','pact-guard':'hilt',
 'reedweave-coat':'coat','rainhouse-focus':'focus','riverglass-reflector':'reflector','river-sight':'sight',
 'sunmesh-coat':'coat','fine-expansion-ring':'ring','sunstone-focus':'focus','solar-guard':'hilt','courier-harness':'harness',
 'fleet-sight':'sight','ward-focus':'focus','opal-reflector':'reflector','shield-brace':'brace','field-coat':'coat',
 'forge-valve':'valve','heat-coat':'heavy-coat','return-valve':'valve','field-clasp':'clasp','folding-sight':'sight','rescue-coat':'coat','sun-prism':'prism',
 'brass-reflector':'reflector','lance-nozzle':'nozzle','courier-sight':'sight','medic-clasp':'clasp','saber-hilt':'hilt',
 'baffled-nozzle':'nozzle','silver-reflector':'reflector','ratchet-sight':'sight','insulated-coat':'coat','work-coat':'coat','heavy-coat':'heavy-coat',
} as const satisfies Record<ItemId,UIIcon>;
export function itemIcon(id:SupplyId):UIIcon{
 if(id==='bandage'||id==='field-bandage')return id;
 return id==='focus-tonic'?'tonic':equipmentIcons[id];
}
/** Only actual reading/inspection labels, not every narrated object or location. */
export const OBJECT_CARDS=['letter','ledger','chart','mural','lantern','horn','bandage','light'] as const;
const objects:Record<string,typeof OBJECT_CARDS[number]>={
 'Transfer slip':'letter','The dispatch':'letter','The founding pledge':'ledger','The old diagram':'chart','The old mural':'mural','Festival lanterns':'lantern','The gate horn':'horn',
 'Supplies':'bandage',
 'The Benefactor':'light',
};
export const objectPortrait=(label:string)=>Object.hasOwn(objects,label)?`ui/portrait-${objects[label]}`:undefined;
export const uiArtAsset=(name:string)=>UI_ICONS.some(id=>name===`ui/${id}`)||OBJECT_CARDS.some(id=>name===`ui/portrait-${id}`);
