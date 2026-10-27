import {CampaignSession} from './campaign';
import {decodeSave} from '../rules/save';
import {FOURTH_CHAPTER,THIRD_CHAPTER,type GameState} from '../rules/state';

export interface MiddleOptions {conduit:'feeds'|'pressure';harbor:'dry'|'wet';optional:boolean;through:3|4}
export const defaultMiddle:MiddleOptions={conduit:'feeds',harbor:'dry',optional:true,through:4};
/** Decode a completed report or normal exported save without filling flags. */
export function readReportState(raw:string):GameState{
 const value:unknown=JSON.parse(raw);
 if(value&&typeof value==='object'&&'status' in value&&value.status!=='complete')throw Error('Cannot resume a failed simulation as a completed checkpoint');
 return decodeSave(JSON.stringify(value&&typeof value==='object'&&'state'in value?value.state:value));
}
export function readDeparture(raw:string):GameState{
 const state=readReportState(raw);
 if(!(state.chapter==='chapter-two'&&state.boundary===THIRD_CHAPTER&&state.flags.chapterTwoComplete)&&!(state.chapter==='chapter-three'&&state.boundary===FOURTH_CHAPTER&&state.flags.chapterThreeComplete))throw Error('Expected a completed Chapter Two or Three departure');
 return state;
}
export function playMiddle(s:CampaignSession,options:MiddleOptions=defaultMiddle){
 if(s.state.chapter==='chapter-two'){
  s.beginNext();s.visit('capital-cache');s.prepare();
  const target=s.agent.spending==='frugal'?2:3;
  while(s.state.bandages<target&&s.state.coins>=8)s.visit('capital-engine','Buy a bandage · 8 marks');
  if(s.agent.spending!=='baseline'){s.visit('capital-engine','Browse supplies and trade gear');s.stockUp();s.closeShop();}
  s.visit('capital-petra');s.prepare();s.formation(s.agent.build==='support'?['nell','orrin','petra']:['nell','kit','petra']);
  s.visit('capital-works');s.prepare();
  if(options.optional){s.visit('works-locker','Open the stores · fight the lock patrol');s.prepare();}
  s.visit('works-rest','Rest · restore everyone’s HP and focus');
  s.visit('works-plan',options.conduit==='feeds'?'Cut the crystal feeds · two earth plates':'Take the pressure walk · crows and vents');
  s.visit('works-depths');s.visit('heart-regulator');s.prepare();
  if(!s.state.flags.tomasRescued||!s.state.flags.extractionStopped||!s.state.flags.emperorMerged)throw Error('Missing Chapter Three aftermath');
  s.visit('capital-departure');s.checkpoint('chapter-three');
 }else if(options.through===3)throw Error('The input has already completed Chapter Three');
 if(options.through===3)return;
 s.beginNext();s.visit('refuge-rest','Browse medical supplies and trade gear');if(s.agent.spending==='baseline'){s.buy('field-bandage',2);s.buy('focus-tonic',1);}else s.stockUp();s.closeShop();
 s.visit('refuge-works');s.prepare();s.formation(s.agent.build==='support'?['nell','petra','celia']:['nell','orrin','celia']);
 if(s.agent.spending==='prepared'){s.visit('works-bench','Browse medical supplies and trade gear');s.stockUp();s.closeShop();}
 if(options.optional){s.visit('works-cart','Open the survey cart · fight its patrol');s.prepare();}
 s.visit('works-bench','Rest · restore everyone’s HP and focus');
 s.visit('works-approach',options.harbor==='dry'?'Take the dry chain walk · ranged crows':'Cross the pump floor · shallow water');s.prepare();
 s.visit('works-sanctuary');s.visit('sanctuary-chest');s.prepare();
 s.visit('sanctuary-bench','Rest · restore everyone’s HP and focus');s.visit('sanctuary-patrol');s.prepare();
 s.formation(['nell','celia','petra']);s.visit('sanctuary-bench','Rest · restore everyone’s HP and focus');s.visit('sanctuary-warden');s.prepare();
 if(!s.state.flags.harborOpened||!s.state.flags.signalCut||!s.state.flags.anchorsKnown)throw Error('Missing Chapter Four aftermath');
 s.visit('sanctuary-refuge');s.visit('refuge-tomas','Leave for the western airfield');s.checkpoint('chapter-four');
 if(!s.state.flags.chapterFourComplete||s.state.boundary!=='chapter-five:anchors')throw Error('Chapter Four is incomplete');
}
