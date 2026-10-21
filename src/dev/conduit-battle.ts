import { createBattle, type Encounter } from '../rules/combat';
import { characterProfiles, defaultBuild, newCharacterSettings, COMPANION_IDS, type CharacterProfile, type CompanionId } from '../rules/characters';
import type { EquipmentBonuses } from '../rules/inventory';
import { newGame } from '../rules/state';
import { REGULATOR_ENCOUNTERS, type ConduitRoute } from '../content/chapter-three/regulator';

export const CONDUIT_ENCOUNTERS=Object.fromEntries((['feeds','pressure'] as const).map(route=>[route,{
 ...REGULATOR_ENCOUNTERS[`heart-${route}`],id:`dev-conduit-${route}`,name:`Heart regulator · ${route==='feeds'?'sealed intake':'pressure walk'} preview`,flag:'devConduit',xp:0,coins:0,item:undefined,journal:undefined,victory:undefined,
}])) as Record<ConduitRoute,Encounter>;

export function createConduitBattle(route:ConduitRoute='feeds',profiles?:Record<CompanionId,CharacterProfile>,equipment?:Record<CompanionId,EquipmentBonuses>,party:readonly CompanionId[]=['nell','orrin','kit']){
 if(!profiles){const settings=newCharacterSettings();for(const id of COMPANION_IDS)settings.characters[id]=defaultBuild(id,7);profiles=characterProfiles(settings);}
 const state=newGame();state.bandages=6;
 return createBattle(CONDUIT_ENCOUNTERS[route],state,equipment,profiles,party);
}
