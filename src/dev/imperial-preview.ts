import { createBattle } from '../rules/combat';
import { newGame } from '../rules/state';
import { characterProfiles,defaultBuild,newCharacterSettings,COMPANION_IDS,type CharacterProfile,type CompanionId } from '../rules/characters';
import type { EquipmentBonuses } from '../rules/inventory';
import { ENCOUNTERS } from '../content/chapter-six/capital/encounters';
import { BATTLE_MAPS } from '../content/battle-maps';
import { sceneAssets } from '../content/scene-art';
import { IMPERIAL_ASSETS,imperialPresentation } from '../game/imperial-presentation';
const definitions={emperor:{...ENCOUNTERS['imperial-vessel'],id:'dev-emperor',flag:'devEmperor',xp:0,coins:0,item:undefined,journal:undefined},lightbearer:{...ENCOUNTERS.lightbearer,id:'dev-lightbearer',flag:'devLightbearer',xp:0,coins:0,item:undefined,journal:undefined}};
export const IMPERIAL_PRESENTATIONS={emperor:imperialPresentation(definitions.emperor),lightbearer:imperialPresentation(definitions.lightbearer)};
export const IMPERIAL_PREVIEW_ASSETS=[...IMPERIAL_ASSETS,...sceneAssets(BATTLE_MAPS['imperial-vessel']),...sceneAssets(BATTLE_MAPS.lightbearer)].map(a=>({...a,url:`${import.meta.env.BASE_URL}${a.url}`}));
export function createImperialPreview(mode:'emperor'|'lightbearer',profiles?:Record<CompanionId,CharacterProfile>,equipment?:Record<CompanionId,EquipmentBonuses>,party?:readonly CompanionId[]){
 if(!profiles){const settings=newCharacterSettings();for(const id of COMPANION_IDS)settings.characters[id]=defaultBuild(id,12);profiles=characterProfiles(settings);}
 const state=newGame();state.bandages=12;return createBattle(definitions[mode],state,equipment,profiles,party??['kit','orrin','petra']);
}
