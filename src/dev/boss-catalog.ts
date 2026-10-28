import {ENCOUNTERS} from '../content/encounters';
import {createBattle} from '../rules/combat';
import {newGame} from '../rules/state';
import {characterProfiles,defaultBuild,newCharacterSettings,type CharacterProfile,type CompanionId} from '../rules/characters';
import type {EquipmentBonuses} from '../rules/inventory';

interface CampaignBoss {id:string;encounter:string;chapter:number;label:string;level:number;party:readonly CompanionId[];hint:string}
export const CAMPAIGN_BOSSES=[
 {id:'collector',encounter:'collector',chapter:1,label:'Collector guard',level:2,party:['nell','orrin'],hint:'The collector’s guard and its escorts use the original Rillbridge arena.'},
 {id:'alban',encounter:'captain',chapter:1,label:'Captain Alban',level:3,party:['nell','orrin'],hint:'Alban and two pursuit hounds hold the eastern pass. Keep clear of the hot vents.'},
 {id:'petra',encounter:'coast-recapture',chapter:2,label:'Petra',level:5,party:['nell','orrin','kit'],hint:'Petra holds the last crossing with two signal crows. This is her opposing campaign formation.'},
 {id:'engine-warden',encounter:'works-warden',chapter:3,label:'Engine Warden',level:6,party:['nell','orrin','kit'],hint:'The Engine Warden and its escorts guard the execution gallery.'},
 {id:'sanctuary-warden',encounter:'sanctuary-warden',chapter:4,label:'Sanctuary Warden',level:8,party:['nell','orrin','celia'],hint:'The bronze ring’s keeper fights behind a crow screen. The shallow side lanes remain intact.'},
 {id:'furnace',encounter:'hammer-carrier',chapter:5,label:'Furnace carrier',level:10,party:['nell','orrin','kit'],hint:'Watch the marked pour and lingering hot tracks. Target the carrier’s body or any occupied hex.'},
 {id:'ward',encounter:'wind-engine',chapter:5,label:'Mirrored ward engine',level:10,party:['nell','kit','celia'],hint:'Break the lit projection to interrupt its tracked beam and expose the core. Areas hit each unit once.'},
 {id:'aurel',encounter:'dawn-commander',chapter:5,label:'Commander Aurel',level:10,party:['nell','orrin','petra'],hint:'Aurel’s soldiers coordinate with their commander. Break his support rather than treating them as isolated enemies.'},
 {id:'rainhouse',encounter:'rainhouse-guard',chapter:6,label:'Rainhouse claimant',level:12,party:['kit','orrin','petra'],hint:'The claimant and glasswings defend the treatment terrace. Nell stays out of the treatment expedition preset.'},
 {id:'domain-collector',encounter:'domain-collector',chapter:7,label:'First collector',level:14,party:['nell','kit','celia'],hint:'The original pressure casing returns with its domain arena and stronger escorts.'},
 {id:'domain-furnace',encounter:'domain-furnace',chapter:7,label:'Harvest keeper',level:14,party:['nell','kit','celia'],hint:'The first harvest retains the carrier’s pour cycles, with its own field, enemies and battle theme.'},
 {id:'domain-ward',encounter:'domain-ward',chapter:7,label:'Original ward lens',level:14,party:['nell','kit','celia'],hint:'The first hospice retains the ward’s mirrors and interruption rules on its own floor.'},
 {id:'domain-dragon',encounter:'domain-dragon',chapter:7,label:'Seasons gate dragon',level:14,party:['nell','kit','celia'],hint:'The domain’s dragon retains its fixed warnings, breath pulls and loose ice.'},
]as const satisfies readonly CampaignBoss[];
export type CampaignBossId=typeof CAMPAIGN_BOSSES[number]['id'];
const existing=[
 {id:'conduit',chapter:3,label:'Heart regulator'},
 {id:'flagship',chapter:5,label:'Alban’s flagship'},
 {id:'serpent',chapter:6,label:'Sun serpent'},{id:'dragon',chapter:6,label:'Winter dragon'},
 {id:'emperor',chapter:6,label:'The Emperor'},{id:'lightbearer',chapter:6,label:'The Lightbearer'},
 {id:'benefactor',chapter:7,label:'The Benefactor'},
]as const;
export const BOSS_CHOICES=[...CAMPAIGN_BOSSES,...existing];
export type WorkshopBoss=typeof BOSS_CHOICES[number]['id'];
export const campaignBoss=(id:string)=>CAMPAIGN_BOSSES.find(entry=>entry.id===id);
export const workshopBoss=(id:string|null):WorkshopBoss=>BOSS_CHOICES.some(entry=>entry.id===id)?id as WorkshopBoss:'benefactor';

/** Keep authored IDs for map/pattern selection, with isolated builds and no rewards. */
export function createCampaignBoss(id:CampaignBossId,profiles?:Record<CompanionId,CharacterProfile>,equipment?:Record<CompanionId,EquipmentBonuses>,party?:readonly CompanionId[]){
 const entry=campaignBoss(id)!,source=ENCOUNTERS[entry.encounter];
 const encounter={...structuredClone(source),flag:'devCampaignBoss',xp:0,coins:0,item:undefined,journal:undefined,victory:undefined};
 if(!profiles){const settings=newCharacterSettings();for(const hero of Object.keys(settings.characters)as CompanionId[])settings.characters[hero]=defaultBuild(hero,entry.level);profiles=characterProfiles(settings);}
 const state=newGame();state.bandages=entry.chapter<=3?6:12;state.coins=0;
 return {encounter,battle:createBattle(encounter,state,equipment,profiles,party??entry.party)};
}
