import { createBattle,enemyTurn } from '../rules/combat';
import { characterProfiles,defaultBuild,newCharacterSettings,COMPANION_IDS,type CharacterProfile,type CompanionId } from '../rules/characters';
import type { EquipmentBonuses } from '../rules/inventory';
import { newGame } from '../rules/state';
import { FLAGSHIP_ENCOUNTER as CAMPAIGN_FLAGSHIP } from '../content/chapter-five/flagship';
import { FLAGSHIP_PARTS,flagshipPart,prepareFlagship } from '../rules/flagship';
export { FLAGSHIP_PARTS,flagshipPart,isFlagshipPart,prepareFlagship } from '../rules/flagship';
export const FLAGSHIP_ENCOUNTER={...CAMPAIGN_FLAGSHIP,id:'dev-flagship',name:'Alban’s flagship · boss preview',flag:'devFlagship',xp:0,coins:0,item:undefined,journal:undefined};
export const flagshipTurn=enemyTurn;

/** Only the workshop supplies preset builds, bandages and an exposed-bridge shortcut. */
export function createFlagshipBattle(profiles?:Record<CompanionId,CharacterProfile>,equipment?:Record<CompanionId,EquipmentBonuses>,party?:readonly CompanionId[],exposed=false){
  if(!profiles){const settings=newCharacterSettings();for(const id of COMPANION_IDS)settings.characters[id]=defaultBuild(id,10);profiles=characterProfiles(settings);}
  const state=newGame();state.bandages=12;
  const b=createBattle(FLAGSHIP_ENCOUNTER,state,equipment,profiles,party??['nell','orrin','petra']);
  if(exposed){for(const id of FLAGSHIP_PARTS.slice(0,2))flagshipPart(b,id).hp=0;b.queue=b.queue.filter(id=>b.units.find(u=>u.id===id)!.hp>0);}
  prepareFlagship(b);return b;
}
