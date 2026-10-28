import {createBattle,type Encounter} from '../rules/combat';
import {newGame} from '../rules/state';
import {characterProfiles,defaultBuild,newCharacterSettings,type CharacterSettings} from '../rules/characters';
import {newInventory,equipmentBonuses,type Inventory} from '../rules/inventory';
import {prepareRelay} from '../rules/combat-tactics';
import {offset} from '../rules/hex';
import {BATTLE_MAPS} from '../content/battle-maps';
import {drawTileMap} from '../game/tilemap';
import type {BattlePresentation} from '../game/battle-presentation';
import {facingAsset} from '../content/actors';
import type {CompanionId} from '../rules/party';

export type CombatPreset='rally-ring'|'rally-self'|'rally-party'|'prism'|'crossfire'|'stars'|'daybreak'|'lantern'|'lantern-wide'|'lantern-full'|'recovery';
export const TACTICS_ENCOUNTER:Encounter={
 id:'workshop',name:'Combat review · the pressure yard',music:'battle',flag:'practice',xp:0,coins:0,coordinated:true,
 enemies:[{kind:'guardian',col:7,row:3,hp:240,bonus:6},{kind:'crow',col:8,row:1,hp:150,bonus:8},{kind:'hound',col:8,row:5,hp:180,bonus:9}],rocks:[],
 fixtures:[{id:'review-crates',name:'Timber barricade',kind:'barricade',col:5,row:4,hp:32},{id:'review-drum',name:'Pressure drum',kind:'drum',col:7,row:4,hp:24,power:24},{id:'review-valve',name:'Yard steam valve',kind:'valve',col:3,row:3,vents:[[5,2],[5,3],[5,4]]}],
};
export function richCombatPreview(preset:CombatPreset|'workshop',settings?:CharacterSettings,inventory?:Inventory){
 const lantern=preset.startsWith('lantern'),rally=preset.startsWith('rally-');
 const builds=preset==='workshop'?structuredClone(settings!):newCharacterSettings();
 if(preset!=='workshop'){
  builds.party=rally?['celia','orrin','kit']:preset==='crossfire'?['kit','petra','celia']:lantern?['nell','kit','orrin']:preset==='daybreak'?['celia','petra','orrin']:preset==='recovery'||preset==='stars'?['celia','orrin','petra']:['nell','orrin','celia'];
  for(const hero of builds.party)builds.characters[hero]=defaultBuild(hero,preset==='daybreak'||preset==='lantern-full'?13:preset==='lantern'?7:10);
 }
 const state=newGame(),battle=createBattle(TACTICS_ENCOUNTER,state,equipmentBonuses(preset==='workshop'?inventory!:newInventory()),characterProfiles(builds),builds.party);
 builds.party.forEach((id,i)=>{const unit=battle.units.find(u=>u.id===id)!;unit.hex=offset(2,[3,4,1][i]);if(preset==='daybreak')unit.hp=Math.ceil(unit.maxHp*.35);});
 if(rally){
  const celia=battle.units.find(u=>u.id==='celia')!;celia.skills!.rally=preset==='rally-ring'?1:preset==='rally-self'?2:3;celia.hex=offset(2,3);
  battle.units.find(u=>u.id==='orrin')!.hex=offset(3,3);battle.units.find(u=>u.id==='kit')!.hex=offset(2,2);
  for(const u of battle.units.filter(u=>u.side==='party'))u.focus=u===celia?6:1;
  battle.queue=['celia',...battle.queue.filter(id=>id!=='celia')];
 }
 if(lantern)battle.units.find(u=>u.id==='kit')!.hex=offset(3,2);
 if(preset==='recovery'){const fallen=battle.units.find(u=>u.id==='orrin')!;fallen.hp=0;battle.queue=battle.queue.filter(id=>id!==fallen.id);}
 for(const u of battle.units.filter(u=>u.abilities.includes('relay')))delete u.intent;prepareRelay(battle);
 const presentation:BattlePresentation={tactical:true,encounter:TACTICS_ENCOUNTER,background:(scene,world)=>{drawTileMap(scene,world,BATTLE_MAPS.workshop,state);},facing:u=>u.side==='party'?facingAsset(u.kind as CompanionId,1,0):undefined};
 return {battle,presentation};
}
