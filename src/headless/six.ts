import {CampaignSession} from './campaign';
import {readReportState} from './middle';
import {SIXTH_CHAPTER,SEVENTH_CHAPTER,maxHp,type GameState} from '../rules/state';
import {heroAvailable} from '../rules/availability';
import {IMPROVEMENTS,improvementProblem,maxFocus} from '../rules/improvements';

export const EXPEDITIONS=['jungle','desert','north']as const;
export type Expedition=typeof EXPEDITIONS[number];
export interface SixOptions {order:readonly Expedition[];palace:'gallery'|'channel';optional:boolean;through:'regions'|'6';improvements?:boolean}
export const defaultSix:SixOptions={order:EXPEDITIONS,palace:'gallery',optional:true,through:'6'};
export function validSixOrder(order:readonly Expedition[]){return order.length>=2&&order.length<=3&&new Set(order).size===order.length&&order.includes('desert')&&order.includes('north')&&order.every(r=>EXPEDITIONS.includes(r));}
export function readSixDeparture(raw:string):GameState{
 const s=readReportState(raw),f=s.flags;
 if(s.chapter==='chapter-five'&&s.boundary===SIXTH_CHAPTER&&f.chapterFiveComplete)return s;
 if(s.chapter==='chapter-six'&&s.boundary===null&&s.location.map==='outermooring'&&f.sixRoutesKnown&&!f.capitalStreetSeen&&!f.chapterSixComplete&&(!f.riverSeen||f.riverReported)&&(!f.desertSeen||f.desertReported)&&(!f.northSeen||f.northReported))return s;
 throw Error('Expected a Chapter Five departure or Chapter Six mooring checkpoint between completed expeditions');
}
function supplies(s:CampaignSession,id:string){
 if(s.state.party.some(u=>heroAvailable(s.state,u.id)&&(u.hp<maxHp(u.id,s.state)||u.focus<maxFocus(s.state,u.id))))s.visit(id,'Rest · restore everyone’s HP and focus');
 s.visit(id,'Browse medical supplies and trade gear');s.stockUp();s.closeShop();
}
/** Opt-in money sinks go through the actual clerk, course selection and confirmation. */
function improvement(s:CampaignSession,o:SixOptions,id:string,object:string,choice?:string){
 const i=IMPROVEMENTS.find(i=>i.id===id)!;
 if(!o.improvements||s.agent.spending!=='prepared'||improvementProblem(s.state,i)||s.state.coins-i.cost<80)return;
 s.visit(object,choice);
 if(i.service==='training')s.choose('Train Celia');
 s.choose(`${i.name} · ${i.cost} marks`);s.choose(`Confirm · ${i.cost} marks`);
 if(i.service==='training'){s.choose('Choose another character');s.choose('Leave training');}else s.choose('Leave');
}
function training(s:CampaignSession,o:SixOptions){
 for(const id of ['hp-celia','focus-celia'])improvement(s,o,id,'six-supplies','Training · permanent improvements');
}
function jungle(s:CampaignSession,o:SixOptions){
 supplies(s,'river-stores');s.visit('river-canopy');
 s.visit('river-patrol','Clear the lower crossing');s.prepare();s.visit('river-chain');
 if(o.optional){s.visit('river-cache','Open the survey locker');s.prepare();}
 supplies(s,'canopy-stores');s.visit('canopy-rainhouse');
 s.visit('rainhouse-guard','Clear the treatment terrace');s.prepare();
 s.visit('river-treatment','Bring Nell and begin the treatment');s.prepare();
 if(!s.state.flags.nellRecovered||!s.state.flags.riverRestSeen)throw Error('Treatment did not restore Nell and complete the river scene');
 s.visit('rainhouse-tavi');improvement(s,o,'kit-footing','river-tavi');s.visit('river-ship');
}
function desert(s:CampaignSession,o:SixOptions){
 if(o.optional){s.visit('namar-post');s.prepare();}
 supplies(s,'namar-supply');s.visit('namar-palace');s.visit('palace-audience');
 s.visit('palace-route',o.palace==='gallery'?'Break the gallery cordon · dry floor':'Take the service channel · shallow water');s.prepare();
 supplies(s,'palace-supply');s.visit('palace-roofs');
 s.visit('roof-guard','Clear the upper terrace');s.prepare();
 if(o.optional){s.visit('roof-chest');s.prepare();}
 supplies(s,'roof-rest');s.visit('roof-observatory');
 s.visit('sun-serpent','Face the sun serpent');s.prepare();
 if(!s.state.flags.desertSealBroken||s.state.location.map!=='namar')throw Error('Sun serpent victory did not release the western seal');
 s.visit('namar-ship');
}
function north(s:CampaignSession,o:SixOptions){
 supplies(s,'harbor-stores');s.visit('harbor-watch');
 s.visit('north-watch','Clear the winter patrol');s.prepare();s.visit('north-windlass');
 supplies(s,'watch-rest');s.visit('watch-glacier');s.visit('north-log');
 s.visit('north-hunters','Clear the upper ice shelf');s.prepare();
 if(o.optional){s.visit('glacier-cache','Open the relief stores');s.prepare();}
 supplies(s,'glacier-rest');s.visit('glacier-shrine');
 s.visit('north-dragon','Face the winter dragon');s.prepare();
 if(!s.state.flags.northSealBroken)throw Error('Winter dragon victory did not release the northern seal');
 s.visit('shrine-home');s.visit('harbor-ship');
}
async function capital(s:CampaignSession,o:SixOptions){
 const recovered=!!s.state.flags.nellRecovered;
 s.formation(recovered?(s.agent.build==='support'?['nell','celia','petra']:['nell','orrin','celia']):['kit','celia','petra']);s.prepare();training(s,o);supplies(s,'six-supplies');
 s.visit('six-capital-open');improvement(s,o,'nell-housing','capital-crew','Reinforce Nell’s lantern · 400 marks');supplies(s,'capital-stores');s.visit('capital-inner');
 s.visit('city-procession','Clear the procession machines');s.prepare();s.visit('city-palace');
 supplies(s,'palace-rest');s.visit('palace-command','Break the palace cordon');s.prepare();
 if(recovered){
  s.visit('palace-preparations');
  if(s.state.location.map!=='lastmorning')throw Error('Missing recovered-Nell vision');
  s.visit('morning-leave');
  if(!s.state.flags.capitalMorningLeft||String(s.state.location.map)!=='lastpalace')throw Error('Nell did not wake from the vision');
 }else if(s.state.flags.capitalAudienceSeen||s.state.flags.capitalMorningSeen)throw Error('Ill Nell entered the vision');
 if(o.optional){s.visit('palace-hunters','Clear the eastern cloister');s.prepare();s.visit('palace-locker');s.prepare();}
 supplies(s,'palace-rest');
 s.visit('palace-preparations',recovered?'Climb the crown stair':'Proceed with Nell still bound');
 await s.answerCheckpoint('capital-return',true);
 if(!s.state.flags.capitalAssaultCommitted||s.state.location.map!=='crown')throw Error('Crown stair did not open after the checkpoint');
 s.visit('capital-emperor','Face the Emperor');s.prepare();
 if(recovered){
  if(!s.state.flags.capitalReleased||!s.state.flags.capitalLandingSeen)throw Error('Missing capital liberation');
  s.visit('capital-departure','Prepare the final crossing');
  if(!s.state.flags.chapterSixComplete||s.state.boundary!==SEVENTH_CHAPTER)throw Error('Missing Chapter Seven departure');
 }else{
  if(!s.state.flags.lightbearerSeen||s.state.flags.capitalReleased)throw Error('Missing Lightbearer consequence');
  supplies(s,'crown-rest');s.visit('capital-lightbearer','Face the Lightbearer');
  if(!s.state.flags.nellLost||s.state.party.find(p=>p.id==='nell')!.hp!==0)throw Error('Nell is not recorded as lost');
  s.visit('last-ending');
  if(!s.state.flags.lightbearerEnding||s.state.boundary!==null||s.state.flags.chapterSixComplete)throw Error('Bad ending incorrectly permits continuation');
 }
 s.checkpoint(recovered?'chapter-six':'lightbearer-ending');
}
export async function playSix(s:CampaignSession,o:SixOptions=defaultSix){
 if(!validSixOrder(o.order))throw Error('Choose desert and north exactly once, optionally including jungle once');
 if(s.state.chapter==='chapter-five')s.beginNext();else s.resume();
 s.prepare();
 const complete={jungle:'riverReported',desert:'desertReported',north:'northReported'};
 for(const region of o.order){
  if(s.state.flags[complete[region]])continue;
  const recovered=!!s.state.flags.nellRecovered;
  s.formation(region==='jungle'?['kit','celia','petra']:region==='north'||s.agent.build==='support'?[recovered?'nell':'kit','celia','petra']:[recovered?'nell':'kit','orrin','celia']);
  s.prepare();training(s,o);supplies(s,'six-supplies');
  s.visit('six-chart',region==='jungle'?'Iria · Sera’s river healers':region==='desert'?'Namar · the western pact seal':'Skeld · the northern pact seal');
  ({jungle,desert,north})[region](s,o);
  if(!s.state.flags[complete[region]]||s.state.location.map!=='outermooring')throw Error(`${region} did not return to the ship`);
  s.checkpoint('six-'+region);
 }
 if(!s.state.flags.capitalOpened)throw Error('Both seals did not open the capital');
 s.checkpoint('six-regions');if(o.through==='regions')return;
 await capital(s,o);
}
