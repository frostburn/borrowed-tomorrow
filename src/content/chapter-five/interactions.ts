import {offerImprovements,trainingChoice} from '../improvements';
import { beginFlagship,interactFinale,resumeFinale,flagshipReady,beginRetaliation } from './finale';
import { completedAnchors } from './progress';
import { resumeDawnwatch,interactDawnwatch } from './dawnwatch';
import { resumeWindmere,interactWindmere } from './windmere';
import { alliance } from './windmere-scenes';
import { emperorTold } from './dawnwatch-scenes';
import { SAY } from '../dialogue';
import { arrival } from '../maps';
import { restoreParty } from '../../rules/state';
import type { StoryHost } from '../story-host';
import * as scenes from './scenes';
import * as companions from './companion-scenes';

export function resumeChapterFive(h:StoryHost){
 const {state:s}=h,f=s.flags,map=s.location.map;
 if(resumeFinale(h))return;
 if(map==='airfield'&&!f.airfieldSeen)return h.talk({...scenes.airfield(),done:()=>h.commit('airfieldSeen','airfieldSeen')});
 if(map==='airship'){
  if(!f.firstFlightSeen)return h.talk({...scenes.firstFlight(),done:()=>h.commit('firstFlightSeen','firstFlightSeen')});
  if(completedAnchors(s)&&!f.fleetSighted)return h.talk({...scenes.fleet(f.hammerplainComplete?'hammerplain':f.dawnwatchComplete?'dawnwatch':'windmere'),done:()=>h.commit('fleetSighted','fleetSighted')});
  if(f.emperorOfferSeen&&!f.emperorOfferTold)return h.talk({...emperorTold(),done:()=>{h.commit('emperorOfferTold','emperorOfferTold');resumeChapterFive(h);}});
 }
 if(map==='airship'&&completedAnchors(s)===3&&!f.allAnchorsSeen)return h.talk({...alliance(),done:()=>h.commit('allAnchorsSeen','allAnchorsSeen')});
 if(map==='hammerplain'){
  if(!f.hammerplainSeen)return h.talk({...scenes.hammerplain(),done:()=>{s.location=arrival('hammerplain','crew');h.commit('hammerplainSeen','hammerplainSeen');}});
  if(f.hammerplainFreed&&!f.hammerplainComplete)return h.talk({...scenes.workers(),done:()=>{s.location=arrival('hammerplain','engine');h.commit('hammerplainComplete','hammerplainComplete');}});
 }
 if(map==='coolingworks'&&!f.coolingSeen)return h.talk({...scenes.cooling(),done:()=>{s.location=arrival('coolingworks','junction');h.commit('coolingSeen','coolingSeen');}});
 resumeDawnwatch(h);resumeWindmere(h);
 if(map==='anchorforge'&&!f.forgeGantrySeen)return h.talk({...scenes.gantry(),done:()=>{s.location=arrival('anchorforge','stand');h.commit('forgeGantrySeen','forgeGantrySeen');}});
}
export function interactChapterFive(h:StoryHost,id:string){
 const {state:s}=h,f=s.flags;
 const say=(who:string,text:string)=>h.talk({lines:[SAY(who,text)]});
 const go=(map:'airfield'|'airship'|'hammerplain'|'coolingworks'|'anchorforge'|'dawnwatch'|'windmere',name:string)=>{const p=arrival(map,name);h.travel(p.map,p.x,p.y);};
 const board=()=>f.airshipOwned?go('airship','airfield'):h.talk({...scenes.launch(),done:()=>{h.commit('airshipOwned');go('airship','airfield');}});
 switch(id){
  case 'airfield-supply':case 'ship-supply':case 'hammer-supply':case 'forge-supply':case 'dawn-supply':case 'wind-supply':return h.talk({lines:[SAY('Supplies','There’s room to rest, and bandages for eight marks.')],choices:[
   {label:'Rest · restore everyone’s HP and focus',action:()=>{restoreParty(s);h.refresh();h.save();h.toast('Everyone has rested.');}},
   {label:'Browse medical supplies and trade gear',action:()=>h.shop('field')},
   ...(id==='ship-supply'?[trainingChoice(h)]:[]),
   {label:'Leave',action:()=>{}},
  ]});
  case 'airfield-seizure':
   if(f.airfieldGuardWon)return say('Alda','The mooring’s free. Come up the gangway.');
   if(!f.airfieldSeen)return;
   return h.talk({lines:[SAY('Petra','An officer, a hound and a crow. There’s room to spread out between those crates.')],choices:[{label:'Clear the gangway',action:()=>h.battle('airfield-guard')},{label:'Check our equipment first',action:()=>{}}]});
  case 'airfield-alda':case 'airfield-board':return f.airfieldGuardWon?board():say('Alda','They’ve padlocked the brake. We need the guards off the gangway.');
  case 'ship-chart':if(f.nellIll&&!f.retaliationWon)return beginRetaliation(h);return h.talk({lines:[SAY('Alda',completedAnchors(s)>=2&&!f.emperorOfferSeen?'There’s a light in the observation cabin. I didn’t leave one burning. You can reach it from the aft hatch.':completedAnchors(s)?'I’ve marked our cleared anchors. Where are we landing?':'Where are we landing?')],choices:[
   {label:f.hammerplainComplete?'Revisit Hammerplain · anchor disconnected':'Hammerplain · casting works',action:()=>go('hammerplain','start')},
   {label:f.dawnwatchComplete?'Revisit Dawnwatch · anchor disconnected':'Dawnwatch · the lower town',action:()=>go('dawnwatch','start')},
   {label:f.windmereComplete?'Revisit Windmere · anchor disconnected':'Windmere · the lakeside hospital',action:()=>go('windmere','start')},
   ...(completedAnchors(s)===3?[{label:f.chapterFiveComplete?'Capital course · Chapter Six departure':f.flagshipWon?'Board the flagship · command deck':'Capital approach · Alban’s flagship',disabled:!flagshipReady(h),action:()=>beginFlagship(h)}]:[]),
   {label:'Western airfield · supplies',action:()=>go('airfield','ship')},
   {label:'Stay aboard',action:()=>{}},
  ]});
  case 'ship-alda':if(f.chapterFiveComplete)return say('Alda','We’re holding for the outer mooring. The medics are staying with Nell.');if(f.nellIll)return say('Alda','Clear those creatures off the forward rail. The medics have Nell below.');if(f.flagshipWon)return say('Alda','The marines have lowered their weapons. We can board the command deck.');if(completedAnchors(s)===3&&f.emperorOfferTold)return say('Alda','The capital approach is blocked. We have all three crews aboard; the regional landings are still open for supplies.');if(completedAnchors(s)>=2&&!f.emperorOfferSeen)return say('Alda','There’s a light in the observation cabin. Take the aft hatch and have a look.');return say('Alda',f.dawnwatchComplete?'Dawnwatch’s pilots have the signals aboard. Their launches can escort us through the inland cloud.':f.windmereComplete?'Windmere’s medical crew is aboard. The fleet is holding inland; our regional landings are clear.':f.fleetSighted?'The fleet’s holding inland. Our landings are clear. Hammerplain’s fitters are checking the drive.':'Bram’s stores are delivered. We can make the anchor landings from here.');
  case 'ship-orrin':if(f.nellIll)return say('Orrin','The fitters have the drive. I’m staying by the medical hatch.');if(f.flagshipWon)return say('Orrin','The gangway’s holding. Alda can keep us alongside.');return h.talk(companions.engineWatch(!!f.hammerplainComplete));
  case 'ship-kit':if(f.nellIll)return say('Kit','Celia’s notes are packed. I know the Windmere landing; I can get them to Sera.');return say('Kit',f.dawnwatchComplete?'The pilots are in the same book as the railway crews now. If a signal fails, they know where to send a runner.':f.hammerplainComplete?'Hester sent a packing list. Every washer counted. I like her.':'Alda wants the delivery sacks tied on the left. I’ve checked which left this time.');
  case 'ship-petra':if(f.nellIll)return say('Petra','I wanted Alban to stand in front of the people he hurt. That light took his men with him.');if(f.flagshipWon)return say('Petra','Alban’s waiting on the command deck. Keep the gangway clear.');return h.talk(companions.shieldRoom(!!f.dawnwatchComplete));
  case 'ship-celia':if(f.nellIll)return say('Celia','She’s resting. Leave the lantern where I can watch it.');if(f.flagshipWon)return say('Celia','The boarding crew have laid down their weapons. We can cross.');return h.talk(companions.putThingsDown(!!f.windmereComplete));
  case 'hammer-hester':case 'hammer-hester-after':if(f.hammerplainComplete)return offerImprovements(h,'hammerplain');return say('Hester',f.hammerplainComplete?'Both engines are holding. The street’s put the kettle on for the night shift.':f.hammerplainFreed?'Come over to the starters. I want you to hear this.':f.coolingOpened?'The upper gantry is through the cooling works. My crew’s bringing the starters behind you.':'The cooling race is east of here. Keep clear of the crane load.');
  case 'hammer-cooling':return go('coolingworks','start');
  case 'hammer-ship':return go('airship','hammerplain');
  case 'hammer-coat':
   if(f.forgeStoresWon)return say('Orrin','That safety coat’s good for anybody.');
   return h.talk({lines:[SAY('Hester','The safety store’s still locked. There’s a heat coat in it, if you can get past the guardian and its hound.')],choices:[{label:'Open the safety store · fight its guards',action:()=>h.battle('hammer-stores')},{label:'Leave the store sealed',action:()=>{}}]});
  case 'cooling-route':
   if(f.forgeApproachWon)return h.toast(f.coolingOpened?'The cooling gate is open. Take the upper gantry.':'Turn the red cooling wheel on the eastern walkway.');
   if(!f.coolingSeen)return;
   return h.talk({lines:[SAY('Petra','Crows on the dry freight lift. Hounds on the shallow race walk. Which ground do we want?')],choices:[
    {label:'Take the freight lift · ranged crows',action:()=>{f.forgeRouteSet=true;f.forgeFlooded=false;h.save();h.battle('hammer-lift');}},
    {label:'Take the race walk · shallow water',action:()=>{f.forgeRouteSet=true;f.forgeFlooded=true;h.save();h.battle('hammer-race');}},
    {label:'Prepare first',action:()=>{}},
   ]});
  case 'cooling-wheel':
   if(!f.forgeApproachWon)return say('Hester','The guards have the brake covered. Clear the approach first.');
   if(f.coolingOpened)return say('Hester','Water’s flowing. The upper walkway leads to the gantry.');
   return h.talk({...scenes.water(),done:()=>{s.location=arrival('coolingworks','wheel');h.commit('coolingOpened','coolingOpened');}});
  case 'cooling-forge':return f.coolingOpened?go('anchorforge','start'):h.toast('Open the manual cooling gate first.');
  case 'cooling-return':return go('hammerplain','cooling');
  case 'forge-carrier':
   if(f.furnaceWon)return h.toast('The carrier has stopped. The anchor breaker is exposed.');
   if(!f.forgeGantrySeen)return;
   return h.talk({lines:[SAY('Orrin','Watch where it points that ladle. The metal behind its tracks will burn straight through your boots.')],choices:[{label:'Hold off the furnace carrier',action:()=>{h.commit('furnaceConfronted');h.battle('hammer-carrier');}},{label:'Prepare our equipment first',action:()=>{}}]});
  case 'forge-anchor':
   if(!f.furnaceWon)return say('Hester','We can’t reach the breaker with the carrier firing.');
   if(f.hammerplainFreed)return say('Orrin','The contacts are open. The anchor can’t draw from Hammerplain.');
   return h.talk({...scenes.release(),done:()=>{s.location=arrival('anchorforge','breaker');h.commit('hammerplainFreed','hammerplainFreed');}});
  case 'forge-cooling':return go('coolingworks','forge');
  case 'forge-hester':return say('Hester',f.hammerplainFreed?'The starters are running. Come back down to the casting floor.':'Water’s holding. The crew is under cover until you stop the carrier.');
  case 'ship-herald':case 'ship-nell':case 'ship-capital':return interactFinale(h,id);
  default:if(id.startsWith('flagship-'))return interactFinale(h,id);return id.startsWith('wind-')?interactWindmere(h,id):interactDawnwatch(h,id);
 }
}
