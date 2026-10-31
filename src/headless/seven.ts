import {CampaignSession} from './campaign';
import {readReportState} from './middle';
import {SEVENTH_CHAPTER,maxHp,type GameState,type HeroId} from '../rules/state';
import {heroAvailable} from '../rules/availability';
import {CREW_SERVICES,IMPROVEMENTS,improvementProblem,maxFocus} from '../rules/improvements';
import {CHARACTERS} from '../content/characters';

export interface SevenOptions {optional:boolean;restBetweenForms:boolean;through:'refuge'|'7';improvements:boolean;party?:HeroId[]}
export const defaultSeven:SevenOptions={optional:true,restBetweenForms:true,through:'7',improvements:false};
/** Only complete departures and safe refuge checkpoints, never failed runs or
 * partially resolved source releases/transformations. Resources are untouched. */
export function readSevenDeparture(raw:string):GameState{
 const s=readReportState(raw),f=s.flags;
 if(s.chapter==='chapter-six'&&s.boundary===SEVENTH_CHAPTER&&f.chapterSixComplete&&f.nellRecovered)return s;
 if(s.chapter==='chapter-seven'&&s.boundary===null&&s.location.map==='lastrefuge'&&f.lastRefugeSeen&&!f.daysReturned&&!f.chapterSevenComplete&&(!f.benefactorBodyWon||f.hollowSunSeen)&&(!f.benefactorSunWon||f.fragmentReturned)&&!f.benefactorHeartWon)return s;
 throw Error('Expected an earned Chapter Six departure or Chapter Seven refuge checkpoint');
}
function supplies(s:CampaignSession,id:string){
 if(s.state.party.some(u=>heroAvailable(s.state,u.id)&&(u.hp<maxHp(u.id,s.state)||u.focus<maxFocus(s.state,u.id))))s.visit(id,'Rest · restore everyone’s HP and focus');
 s.visit(id,'Browse medical supplies and trade gear');s.stockUp();s.closeShop();
}
/** Optional active-party upgrades use the clerk's real purchase/confirmation
 * flow, retaining an 80-mark reserve. No unavailable local services are faked. */
function training(s:CampaignSession,o:SevenOptions,object:string){
 if(!o.improvements||s.agent.spending!=='prepared')return;
 const active=new Set(s.state.activeParty);
 const choices=[...IMPROVEMENTS.filter(i=>CREW_SERVICES.includes(i.service)),...IMPROVEMENTS.filter(i=>i.effect==='focus'),...IMPROVEMENTS.filter(i=>i.effect==='hp')];
 for(const i of choices){
  if(!active.has(i.hero)||improvementProblem(s.state,i)||s.state.coins-i.cost<80)continue;
  s.visit(object,'Training · permanent improvements');
  s.choose(i.service==='training'?`Train ${CHARACTERS[i.hero].name}`:'Specialist improvements');
  s.choose(`${i.name} · ${i.cost} marks`);s.choose(`Confirm · ${i.cost} marks`);
  if(s.dialogueOpen){s.choose(i.service==='training'?'Choose another character':'Back to training');s.choose('Leave training');}
 }
}
export function playSeven(s:CampaignSession,o:SevenOptions=defaultSeven){
 if(!['refuge','7'].includes(o.through)||o.party&&(!o.party.length||o.party.length>3||new Set(o.party).size!==o.party.length||o.party.some(id=>!s.state.party.some(p=>p.id===id)||!heroAvailable(s.state,id))))throw Error('Choose a valid endpoint and one to three distinct available companions');
 readSevenDeparture(JSON.stringify(s.state));
 if(s.state.chapter==='chapter-six')s.beginNext();else s.resume();
 if(o.party)s.formation(o.party);s.prepare();
 if(s.state.location.map==='hollowsill'){
  training(s,o,'sill-rest');supplies(s,'sill-rest');s.visit('sill-alda');s.visit('sill-cross');
  s.visit('water-hounds','Clear the platform');s.prepare();supplies(s,'water-rest');
  s.visit('water-collector','Break the first collector');s.prepare();s.visit('water-porter');s.visit('water-field');
  s.visit('field-farmer');supplies(s,'field-rest');s.visit('field-furnace','Stop the harvest keeper');s.prepare();
  if(o.optional){s.visit('field-reflector');s.prepare();}
  s.visit('field-ward');s.visit('ward-patient');supplies(s,'ward-seven-rest');
  s.visit('ward-engine-seven','Stop the original ward engine');s.prepare();s.visit('ward-patient');s.visit('ward-seasons');
  s.visit('season-nameplate');
  if(o.optional){s.visit('season-patrol','Clear the courier stair');s.prepare();supplies(s,'season-rest');}
  else {s.visit('season-ward');supplies(s,'ward-seven-rest');s.visit('ward-seasons');}
  s.visit('season-dragon','Break the last return');s.prepare();s.visit('season-refuge');
 }
 if(s.state.location.map!=='lastrefuge'||!s.state.flags.lastRefugeSeen)throw Error('Missing final refuge arrival');
 for(const id of ['refuge-nell','refuge-kit','refuge-orrin','refuge-celia','refuge-petra'])s.visit(id);
 training(s,o,'refuge-seven-rest');supplies(s,'refuge-seven-rest');s.checkpoint('seven-refuge');
 if(o.through==='refuge')return;
 s.visit('refuge-preparations','Climb to the Benefactor');
 for(const [flag,label,checkpoint]of [
  ['benefactorBodyWon','Face the Benefactor','seven-mantle'],
  ['benefactorSunWon','Face the hollow sun','seven-sun'],
  ['benefactorHeartWon','Break the exposed heart','seven-heart'],
 ]as const){
  if(s.state.flags[flag])continue;
  s.visit('throne-fight',label);s.prepare();
  if(flag!=='benefactorHeartWon'&&o.restBetweenForms){
   s.visit('throne-retreat');training(s,o,'refuge-seven-rest');supplies(s,'refuge-seven-rest');s.checkpoint(checkpoint);
   s.visit('refuge-preparations','Climb to the Benefactor');
  }
 }
 if(String(s.state.location.map)!=='homecoming'||!s.state.flags.daysReturned||!s.state.flags.homecomingSeen)throw Error('Missing release and homecoming');
 for(const id of ['home-tomas','home-iona','home-cap'])s.visit(id);
 s.visit('home-train');for(const id of ['sea-tomas','sea-kit','sea-petra','sea-celia','sea-orrin','sea-friends'])s.visit(id);
 s.visit('sea-ending');
 if(!s.state.flags.chapterSevenComplete||!s.state.flags.realSeaSeen||s.state.boundary!==null||String(s.state.location.map)!=='seaholiday'||s.state.flags.nellLost)throw Error('Missing recovered campaign ending');
 s.checkpoint('chapter-seven');
}
