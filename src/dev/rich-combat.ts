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

export type CombatPreset='prism'|'crossfire'|'stars'|'daybreak'|'lantern'|'recovery';
export const TACTICS_ENCOUNTER:Encounter={
 id:'workshop',name:'Combat review · the pressure yard',music:'battle',flag:'practice',xp:0,coins:0,coordinated:true,
 enemies:[{kind:'guardian',col:7,row:3,hp:240,bonus:6},{kind:'crow',col:8,row:1,hp:150,bonus:8},{kind:'hound',col:8,row:5,hp:180,bonus:9}],rocks:[],
 fixtures:[{id:'review-crates',name:'Timber barricade',kind:'barricade',col:5,row:4,hp:32},{id:'review-drum',name:'Pressure drum',kind:'drum',col:7,row:4,hp:24,power:24},{id:'review-valve',name:'Yard steam valve',kind:'valve',col:3,row:3,active:true,vents:[[5,2],[5,3],[5,4]]}],
};
export function richCombatPreview(preset:CombatPreset|'workshop',settings?:CharacterSettings,inventory?:Inventory){
 const builds=preset==='workshop'?structuredClone(settings!):newCharacterSettings();
 if(preset!=='workshop'){
  builds.party=preset==='crossfire'?['kit','petra','celia']:preset==='lantern'?['nell','kit','orrin']:preset==='daybreak'?['celia','petra','orrin']:preset==='recovery'||preset==='stars'?['celia','orrin','petra']:['nell','orrin','celia'];
  for(const hero of builds.party)builds.characters[hero]=defaultBuild(hero,preset==='daybreak'?13:10);
 }
 const state=newGame(),battle=createBattle(TACTICS_ENCOUNTER,state,equipmentBonuses(preset==='workshop'?inventory!:newInventory()),characterProfiles(builds),builds.party);
 builds.party.forEach((id,i)=>{const unit=battle.units.find(u=>u.id===id)!;unit.hex=offset(2,[3,4,1][i]);if(preset==='daybreak')unit.hp=Math.ceil(unit.maxHp*.35);});
 if(preset==='lantern')battle.units.find(u=>u.id==='kit')!.hex=offset(3,2);
 if(preset==='recovery'){const fallen=battle.units.find(u=>u.id==='orrin')!;fallen.hp=0;battle.queue=battle.queue.filter(id=>id!==fallen.id);}
 for(const u of battle.units.filter(u=>u.abilities.includes('relay')))delete u.intent;prepareRelay(battle);
 const presentation:BattlePresentation={tactical:true,encounter:TACTICS_ENCOUNTER,background:(scene,world)=>{drawTileMap(scene,world,BATTLE_MAPS.workshop,state);},facing:u=>u.side==='party'?facingAsset(u.kind as CompanionId,1,0):undefined};
 return {battle,presentation};
}
