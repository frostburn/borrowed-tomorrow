import { SAY } from '../dialogue';
import { arrival } from '../maps';
import { restoreParty } from '../../rules/state';
import { buySupply } from '../../rules/supplies';
import type { StoryHost } from '../chapter-one/interactions';
import * as scenes from './scenes';

export function resumeChapterFive(h:StoryHost){
 const {state:s}=h,f=s.flags,map=s.location.map;
 if(map==='airfield'&&!f.airfieldSeen)return h.talk({...scenes.airfield(),done:()=>h.commit('airfieldSeen','airfieldSeen')});
 if(map==='airship'){
  if(!f.firstFlightSeen)return h.talk({...scenes.firstFlight(),done:()=>h.commit('firstFlightSeen','firstFlightSeen')});
  if(f.hammerplainComplete&&!f.fleetSighted)return h.talk({...scenes.fleet(),done:()=>h.commit('fleetSighted','fleetSighted')});
 }
 if(map==='hammerplain'){
  if(!f.hammerplainSeen)return h.talk({...scenes.hammerplain(),done:()=>{s.location=arrival('hammerplain','crew');h.commit('hammerplainSeen','hammerplainSeen');}});
  if(f.hammerplainFreed&&!f.hammerplainComplete)return h.talk({...scenes.workers(),done:()=>{s.location=arrival('hammerplain','engine');h.commit('hammerplainComplete','hammerplainComplete');}});
 }
 if(map==='coolingworks'&&!f.coolingSeen)return h.talk({...scenes.cooling(),done:()=>{s.location=arrival('coolingworks','junction');h.commit('coolingSeen','coolingSeen');}});
 if(map==='anchorforge'&&!f.forgeGantrySeen)return h.talk({...scenes.gantry(),done:()=>{s.location=arrival('anchorforge','stand');h.commit('forgeGantrySeen','forgeGantrySeen');}});
}
export function interactChapterFive(h:StoryHost,id:string){
 const {state:s}=h,f=s.flags;
 const say=(who:string,text:string)=>h.talk({lines:[SAY(who,text)]});
 const go=(map:'airfield'|'airship'|'hammerplain'|'coolingworks'|'anchorforge',name:string)=>{const p=arrival(map,name);h.travel(p.map,p.x,p.y);};
 const board=()=>f.airshipOwned?go('airship','airfield'):h.talk({...scenes.launch(),done:()=>{h.commit('airshipOwned');go('airship','airfield');}});
 switch(id){
  case 'airfield-supply':case 'ship-supply':case 'hammer-supply':return h.talk({lines:[SAY('Supplies','There’s room to rest, and bandages for eight marks.')],choices:[
   {label:'Rest · restore everyone’s HP and focus',action:()=>{restoreParty(s);h.refresh();h.save();h.toast('Everyone has rested.');}},
   {label:'Buy a bandage · 8 marks',action:()=>{if(!buySupply(s,'bandage'))return h.toast(s.bandages>=999?'The bandage bag is full.':'Not enough marks.');h.refresh();h.save();h.toast('Bandage added.');}},
   {label:'Leave',action:()=>{}},
  ]});
  case 'airfield-seizure':
   if(f.airfieldGuardWon)return say('Alda','The mooring’s free. Come up the gangway.');
   if(!f.airfieldSeen)return;
   return h.talk({lines:[SAY('Petra','An officer, a hound and a crow. There’s room to spread out between those crates.')],choices:[{label:'Clear the gangway',action:()=>h.battle('airfield-guard')},{label:'Check our equipment first',action:()=>{}}]});
  case 'airfield-alda':case 'airfield-board':return f.airfieldGuardWon?board():say('Alda','They’ve padlocked the brake. We need the guards off the gangway.');
  case 'ship-chart':return h.talk({lines:[SAY('Alda',f.hammerplainComplete?'Hammerplain’s marked clear. Where are we landing?':'Where are we landing?')],choices:[
   {label:f.hammerplainComplete?'Revisit Hammerplain · anchor disconnected':'Hammerplain · casting works',action:()=>go('hammerplain','start')},
   {label:'Dawnwatch · Act II coming next',disabled:true,action:()=>{}},
   {label:'Windmere · Act III coming later',disabled:true,action:()=>{}},
   {label:'Western airfield · supplies',action:()=>go('airfield','ship')},
   {label:'Stay aboard',action:()=>{}},
  ]});
  case 'ship-alda':return say('Alda',f.fleetSighted?'The fleet’s holding inland. Our landings are clear. Hammerplain’s fitters are checking the drive.':'Bram’s stores are delivered. We can make the anchor landings from here.');
  case 'ship-orrin':return say('Orrin',f.hammerplainComplete?'I nearly told her how to set her own choke. There’s a good chance I’ll hear about that for years.':'Hammerplain stamped its name on half the engines I used to repair. I’d like to see what they’re making now.');
  case 'ship-kit':return say('Kit',f.hammerplainComplete?'Hester sent a packing list. Every washer counted. I like her.':'Alda wants the delivery sacks tied on the left. I’ve checked which left this time.');
  case 'ship-petra':return say('Petra',f.fleetSighted?'Alban keeps his guns close to the bridge. If we have to board that ship, we’ll need a way past them.':'Dawnwatch has families inside the garrison walls. I won’t ask its soldiers to abandon them.');
  case 'ship-celia':return say('Celia',f.hammerplainComplete?'That boy in the street wouldn’t let go of his mother’s sleeve. I left them both sitting down with some water.':'Dena’s last message says Tomas has commandeered a second writing desk. The ward is managing.');
  case 'hammer-hester':case 'hammer-hester-after':return say('Hester',f.hammerplainComplete?'Both engines are holding. The street’s put the kettle on for the night shift.':f.hammerplainFreed?'Come over to the starters. I want you to hear this.':f.coolingOpened?'The upper gantry is through the cooling works. My crew’s bringing the starters behind you.':'The cooling race is east of here. Keep clear of the crane load.');
  case 'hammer-cooling':return go('coolingworks','start');
  case 'hammer-ship':return go('airship','hammerplain');
  case 'hammer-coat':
   if(f.forgeStoresWon)return say('Orrin','That safety coat’s good for anybody. We can fit it from Equipment.');
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
   if(f.furnaceWon)return h.toast('The carrier has stopped. Pull the anchor breaker above the gantry.');
   if(!f.forgeGantrySeen)return;
   return h.talk({lines:[SAY('Orrin','The red X hexes show where it will pour this round. Its tracks leave hot metal: six damage at round end. It shifts lanes before pouring.')],choices:[{label:'Hold off the furnace carrier',action:()=>{h.commit('furnaceConfronted');h.battle('hammer-carrier');}},{label:'Prepare our equipment first',action:()=>{}}]});
  case 'forge-anchor':
   if(!f.furnaceWon)return say('Hester','We can’t reach the breaker with the carrier firing.');
   if(f.hammerplainFreed)return say('Orrin','The contacts are open. The anchor can’t draw from Hammerplain.');
   return h.talk({...scenes.release(),done:()=>{s.location=arrival('anchorforge','breaker');h.commit('hammerplainFreed','hammerplainFreed');}});
  case 'forge-cooling':return go('coolingworks','forge');
  case 'forge-hester':return say('Hester',f.hammerplainFreed?'The starters are running. Come back down to the casting floor.':'Water’s holding. The crew is under cover until you stop the carrier.');
 }
}
