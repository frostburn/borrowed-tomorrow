import {ENCOUNTERS} from '../content/chapter-seven/encounters';
import {createBattle} from '../rules/combat';
import {chapterSevenRefugeStart} from './canonical-saves';
import {benefactorPresentation} from '../game/benefactor-presentation';
const ids=['benefactor-body','benefactor-sun','benefactor-heart'] as const;
export function benefactorCampaignPreview(form:0|1|2){
 const source=ENCOUNTERS[ids[form]],definition={...source,id:'dev-'+source.id,flag:'devBenefactorCampaign',xp:0,coins:0,item:undefined,journal:undefined};
 return {battle:createBattle(definition,chapterSevenRefugeStart()),presentation:benefactorPresentation(definition)};
}
