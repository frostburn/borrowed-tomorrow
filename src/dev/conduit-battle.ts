import { active, cast, createBattle, enemyTurn, tauntTarget, type Battle, type Encounter, type Unit } from '../rules/combat';
import { blast, cells, column, key, offset, type Hex } from '../rules/hex';
import { occupiedHexes } from '../rules/footprint';
import { characterProfiles, defaultBuild, newCharacterSettings, COMPANION_IDS, type CharacterProfile, type CompanionId } from '../rules/characters';
import type { EquipmentBonuses } from '../rules/inventory';
import { newGame } from '../rules/state';

export type ConduitRoute='feeds'|'pressure';
export const REGULATOR_ID='conduit-regulator';
// Rear contact and two forward feet: three mutually adjacent axial cells.
export const REGULATOR_FOOTPRINT:Hex[]=[{q:0,r:0},{q:-1,r:1},{q:0,r:1}];
export const CONDUIT_ENCOUNTERS:Record<ConduitRoute,Encounter>={
  feeds:{id:'dev-conduit-feeds',name:'Heart regulator · sealed intake preview',music:'switching',flag:'devConduit',xp:0,coins:0,
    enemies:[{kind:'guardian',name:'Heart regulator',col:5,row:2,hp:210,bonus:3,sealed:true},{kind:'hound',name:'Feed hound',col:8,row:4,hp:45}],grounding:[[3,5],[7,5]],rocks:[[1,3],[9,3]]},
  pressure:{id:'dev-conduit-pressure',name:'Heart regulator · pressure walk preview',music:'switching',flag:'devConduit',xp:0,coins:0,
    enemies:[{kind:'guardian',name:'Heart regulator',col:5,row:2,hp:190,bonus:2},{kind:'crow',name:'Pressure crow',col:2,row:3,hp:36},{kind:'crow',name:'Pressure crow',col:8,row:3,hp:36}],vents:[[3,4],[5,4],[7,4],[5,5]],rocks:[[1,2],[9,2]]},
};
type Intent=NonNullable<Unit['intent']>&{baseCells:Hex[];baseName:string};
export const regulatorUnit=(b:Battle)=>b.units.find(u=>u.id===REGULATOR_ID)!;

export function createConduitBattle(route:ConduitRoute='feeds',profiles?:Record<CompanionId,CharacterProfile>,equipment?:Record<CompanionId,EquipmentBonuses>,party:readonly CompanionId[]=['nell','orrin','kit']){
  if(route==='feeds'&&party.length<2)throw new Error('The sealed intake needs at least two companions for its earth plates.');
  if(!profiles){const settings=newCharacterSettings();for(const id of COMPANION_IDS)settings.characters[id]=defaultBuild(id,7);profiles=characterProfiles(settings);}
  const state=newGame();state.bandages=6;
  const b=createBattle(CONDUIT_ENCOUNTERS[route],state,equipment,profiles,party),boss=b.units.find(u=>u.side==='enemy')!,oldId=boss.id;
  Object.assign(boss,{id:REGULATOR_ID,kind:'conduit-regulator',role:'Extraction keeper',armor:2,anchored:true,movement:0,footprint:REGULATOR_FOOTPRINT.map(h=>({...h})),abilities:['judgment','strike']});
  b.queue=b.queue.map(id=>id===oldId?REGULATOR_ID:id);
  b.units.filter(u=>u.side==='party').forEach((u,i)=>{u.hex=offset(party.length===3?[3,5,7][i]:party.length===2?[4,6][i]:5,6);});
  prepareConduit(b);return b;
}

/** Announce once per round. Moving or breaking the seal never relocates a warning. */
export function prepareConduit(b:Battle){
  const boss=regulatorUnit(b);if(!boss||boss.hp<=0||b.result)return;
  let intent=boss.intent as Intent|undefined;
  if(intent?.round!==b.round){
    const occupied=new Set(occupiedHexes(boss).map(key)),heroes=b.units.filter(u=>u.side==='party'&&u.hp>0);
    let warning:Hex[],name:string;
    if(b.round%3===1){warning=blast(heroes[Math.floor(b.round/3)%heroes.length].hex);name='Pressure lock';}
    else if(b.round%3===2){warning=cells().filter(h=>h.r>=4&&[3,5,7].includes(column(h)));name='Scouring jets';}
    else{warning=cells().filter(h=>h.r===4);name='Crossfeed purge';}
    intent={round:b.round,phase:'Pressure cycle',name,cells:warning.filter(h=>!occupied.has(key(h))),power:16,baseCells:warning,baseName:name};boss.intent=intent;
  }
  const forced=tauntTarget(b,boss);
  intent.cells=forced?occupiedHexes(forced):intent.baseCells;
  intent.name=forced?`Pressure lock on ${forced.name}`:intent.baseName;
}

export const conduitTurn:typeof enemyTurn=(b,onRetaliation,onAction)=>{
  const u=active(b);if(u?.id!==REGULATOR_ID)return enemyTurn(b,onRetaliation,onAction);
  prepareConduit(b);const aim={...u.hex};
  if(cast(b,u,'judgment',aim,onRetaliation)){onAction?.('judgment',aim);return 'judgment';}
};
