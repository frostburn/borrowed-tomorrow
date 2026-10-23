import { createBattle } from '../rules/combat';
import { newGame } from '../rules/state';
import { characterProfiles,defaultBuild,newCharacterSettings,COMPANION_IDS,type CharacterProfile,type CompanionId } from '../rules/characters';
import type { EquipmentBonuses } from '../rules/inventory';
import { ENCOUNTERS } from '../content/chapter-six/north/encounters';
import { BATTLE_MAPS } from '../content/battle-maps';
import { sceneAssets } from '../content/scene-art';
import { DRAGON_ASSETS,winterDragonPresentation } from '../game/winter-dragon-presentation';
const encounter={...ENCOUNTERS['winter-dragon'],id:'dev-winter-dragon',flag:'devWinterDragon',xp:0,coins:0,item:undefined,journal:undefined};
export const DRAGON_PRESENTATION=winterDragonPresentation(encounter);
export const DRAGON_PREVIEW_ASSETS=[...DRAGON_ASSETS,...sceneAssets(BATTLE_MAPS['winter-dragon'])].map(a=>({...a,url:`${import.meta.env.BASE_URL}${a.url}`}));
export function createDragonPreview(profiles?:Record<CompanionId,CharacterProfile>,equipment?:Record<CompanionId,EquipmentBonuses>,party?:readonly CompanionId[]){
 if(!profiles){const settings=newCharacterSettings();for(const id of COMPANION_IDS)settings.characters[id]=defaultBuild(id,12);profiles=characterProfiles(settings);}
 const state=newGame();state.bandages=12;
 return createBattle(encounter,state,equipment,profiles,party??['kit','orrin','petra']);
}
