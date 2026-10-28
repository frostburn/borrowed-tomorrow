import {IMPROVEMENTS,improved,improvementProblem,maxFocus} from '../rules/improvements';
import {CampaignSession} from './campaign';
import {readReportState} from './middle';
import {FIFTH_CHAPTER,SIXTH_CHAPTER,maxHp,type GameState} from '../rules/state';
import {heroAvailable} from '../rules/availability';

export const REGIONS=['hammerplain','dawnwatch','windmere']as const;
export type Region=typeof REGIONS[number];
export interface FiveOptions {order:readonly Region[];forge:'lift'|'race';firstGun:'mortar'|'repeater';optional:boolean;through:'regions'|'5';improvements?:boolean}
export const defaultFive:FiveOptions={order:REGIONS,forge:'lift',firstGun:'mortar',optional:true,through:'5'};
export function readFiveDeparture(raw:string):GameState{
 const s=readReportState(raw);
 if(s.chapter==='chapter-four'&&s.boundary===FIFTH_CHAPTER&&s.flags.chapterFourComplete)return s;
 if(s.chapter==='chapter-five'&&s.boundary===null&&s.location.map==='airship'&&s.flags.airshipOwned&&s.flags.firstFlightSeen&&!s.flags.flagshipWon&&!s.flags.nellIll&&!s.flags.chapterFiveComplete&&REGIONS.every(r=>!s.flags[`${r}Seen`]||s.flags[`${r}Complete`]))return s;
 throw Error('Expected a Chapter Four departure or pre-finale Chapter Five ship checkpoint');
}
function supplies(s:CampaignSession,id:string){
 const state=s.state;
 if(state.party.some(u=>heroAvailable(state,u.id)&&(u.hp<maxHp(u.id,state)||u.focus<maxFocus(state,u.id))))s.visit(id,'Rest · restore everyone’s HP and focus');
 s.visit(id,'Browse medical supplies and trade gear');s.stockUp();s.closeShop();
}
/** Opt-in purchases use the same offers and confirmations as the player. */
function localImprovement(s:CampaignSession,o:FiveOptions,id:string,object:string){
 const i=IMPROVEMENTS.find(i=>i.id===id)!;
 if(!o.improvements||s.agent.spending!=='prepared'||improvementProblem(s.state,i)||s.state.coins-i.cost<80)return;
 s.visit(object);s.choose(`${i.name} · ${i.cost} marks`);s.choose(`Confirm · ${i.cost} marks`);s.choose('Leave');
}
function training(s:CampaignSession,o:FiveOptions){
 if(!o.improvements||s.agent.spending!=='prepared'||!improved(s.state,'orrin-counterbalance'))return;
 for(const id of ['hp-celia','focus-celia']){
  const i=IMPROVEMENTS.find(i=>i.id===id)!;
  if(improvementProblem(s.state,i)||s.state.coins-i.cost<80)continue;
  s.visit('ship-supply','Training · permanent improvements');s.choose('Train Celia');s.choose(`${i.name} · ${i.cost} marks`);s.choose(`Confirm · ${i.cost} marks`);s.choose('Choose another character');s.choose('Leave training');
 }
}
function hammerplain(s:CampaignSession,o:FiveOptions){
 if(o.optional){s.visit('hammer-coat','Open the safety store · fight its guards');s.prepare();}
 supplies(s,'hammer-supply');s.visit('hammer-cooling');
 s.visit('cooling-route',o.forge==='lift'?'Take the freight lift · ranged crows':'Take the race walk · shallow water');s.prepare();
 s.visit('cooling-wheel');s.visit('cooling-forge');supplies(s,'forge-supply');
 s.visit('forge-carrier','Hold off the furnace carrier');s.prepare();
 if(!s.state.flags.hammerplainFreed)throw Error('Furnace victory did not release the anchor');
 s.visit('forge-cooling');s.visit('cooling-return');localImprovement(s,o,'orrin-counterbalance','hammer-hester-after');s.visit('hammer-ship');
}
function dawnwatch(s:CampaignSession,o:FiveOptions){
 s.visit('dawn-gate');supplies(s,'dawn-supply');s.visit('dawn-barracks');
 for(const mortar of [o.firstGun==='mortar',o.firstGun!=='mortar']){
  s.visit(mortar?'watch-mortar':'watch-repeater',mortar?'Clear the western mortar':'Clear the eastern repeater');s.prepare();
 }
 if(o.optional){s.visit('watch-coat','Take the field coat');s.prepare();}
 s.visit('watch-town');supplies(s,'dawn-supply');s.visit('dawn-barracks');s.visit('watch-wall');
 s.visit('wall-commander','Face Commander Aurel');s.prepare();
 if(!s.state.flags.dawnwatchFreed)throw Error('Aurel victory did not release the anchor');
 s.visit('wall-barracks');s.visit('watch-town');s.visit('dawn-ship');
}
function windmere(s:CampaignSession,o:FiveOptions){
 supplies(s,'wind-supply');s.visit('wind-dispensary');
 s.visit('wind-lift-guard','Clear the water-lift brake');s.prepare();s.visit('wind-lift-wheel');
 if(o.optional){s.visit('wind-reflector','Take the opal reflector');s.prepare();}
 s.visit('wind-ward');s.visit('wind-transfer');supplies(s,'wind-supply');s.visit('wind-mirrorward');
 s.visit('wind-gallery-guard','Clear the gallery bridge');s.prepare();
 s.visit('wind-engine','Stop the mirrored ward engine');s.prepare();
 if(!s.state.flags.windmereFreed)throw Error('Ward victory did not release the anchor');
 s.visit('wind-gallery-return');s.visit('wind-ship');
}
export function playFive(s:CampaignSession,o:FiveOptions=defaultFive){
 if(o.order.length!==3||new Set(o.order).size!==3||!o.order.every(r=>REGIONS.includes(r)))throw Error('Choose each anchor region exactly once');
 if(s.state.chapter==='chapter-four'){
  s.beginNext();s.prepare();supplies(s,'airfield-supply');
  s.visit('airfield-seizure','Clear the gangway');s.prepare();s.visit('airfield-board');
 }else s.resume();
 for(const region of o.order){
  if(s.state.flags[`${region}Complete`])continue;
  s.formation(region==='hammerplain'?['nell','orrin',s.agent.build==='support'?'celia':'petra']:region==='dawnwatch'?['nell',s.agent.build==='support'?'celia':'kit','petra']:s.agent.build==='support'?['nell','celia','petra']:['nell','orrin','celia']);
  s.prepare();supplies(s,'ship-supply');training(s,o);
  s.visit('ship-chart',region==='hammerplain'?'Hammerplain · casting works':region==='dawnwatch'?'Dawnwatch · the lower town':'Windmere · the lakeside hospital');
  ({hammerplain,dawnwatch,windmere})[region](s,o);
  if(!s.state.flags[`${region}Complete`])throw Error(`${region} incomplete`);
  if(o.order.filter(r=>s.state.flags[`${r}Complete`]).length>=2&&!s.state.flags.emperorOfferTold)s.visit('ship-cabin');
  s.checkpoint('five-'+region);
 }
 // A ship save may have all three anchors done with the cabin still unvisited.
 if(!s.state.flags.emperorOfferTold)s.visit('ship-cabin');
 if(!s.state.flags.allAnchorsSeen||!s.state.flags.emperorOfferTold)throw Error('Missing alliance or Emperor offer');
 if(o.improvements&&s.agent.spending==='prepared'&&!improved(s.state,'orrin-counterbalance')&&s.state.coins>=580){
  s.visit('ship-chart','Revisit Hammerplain · anchor disconnected');localImprovement(s,o,'orrin-counterbalance','hammer-hester-after');s.visit('hammer-ship');
 }
 training(s,o);
 s.checkpoint('five-regions');if(o.through==='regions')return;
 s.formation(s.agent.build==='support'?['nell','celia','petra']:['nell','orrin','celia']);s.prepare();supplies(s,'ship-supply');training(s,o);
 s.visit('ship-chart','Capital approach · Alban’s flagship');s.choose(s.state.flags.flagshipApproachSeen?'Face Alban’s flagship':'Enter the capital crossing');s.prepare();
 if(!s.state.flags.nellIll||!s.state.flags.albanDestroyed||s.state.activeParty.includes('nell'))throw Error('Missing divine intervention');
 supplies(s,'ship-supply');s.visit('ship-herald','Defend the survey ship');s.prepare();
 if(!s.state.flags.chapterFiveComplete||!s.state.flags.retaliationWon||s.state.boundary!==SIXTH_CHAPTER)throw Error('Chapter Five incomplete');
 training(s,o);s.checkpoint('chapter-five');
}
