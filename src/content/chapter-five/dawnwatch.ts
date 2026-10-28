import {offerImprovements} from '../improvements';
import { SAY } from '../dialogue';
import { arrival } from '../maps';
import type { StoryHost } from '../story-host';
import { receiveItem } from '../../rules/inventory';
import type { MapId } from '../../rules/state';
import * as scenes from './dawnwatch-scenes';
import { completedAnchors } from './progress';
export function resumeDawnwatch(h:StoryHost){
 const {state:s}=h,f=s.flags,map=s.location.map;
 if(map==='dawnwatch'){
  if(!f.dawnwatchSeen)return h.talk({...scenes.arrivalScene(),done:()=>{s.location=arrival('dawnwatch','gate');h.commit('dawnwatchSeen','dawnwatchSeen');}});
  if(f.dawnwatchFreed&&!f.dawnwatchComplete)return h.talk({...scenes.town(),done:()=>{s.location=arrival('dawnwatch','shelter');h.commit('dawnwatchComplete','dawnwatchComplete');}});
 }
 if(map==='watchbarracks'&&!f.watchGunsSeen)return h.talk({...scenes.guns(),done:()=>{s.location=arrival('watchbarracks','junction');h.commit('watchGunsSeen','watchGunsSeen');}});
 if(map==='signalwall'&&!f.aurelSeen)return h.talk({...scenes.commander(),done:()=>{s.location=arrival('signalwall','stand');h.commit('aurelSeen','aurelSeen');}});
 if(map==='observation'&&!f.emperorOfferSeen)return h.talk({...scenes.emperorOffer(),done:()=>{h.commit('emperorOfferSeen','emperorOfferSeen');const p=arrival('airship','cabin');h.travel(p.map,p.x,p.y);}});
}
export function interactDawnwatch(h:StoryHost,id:string){
 const {state:s}=h,f=s.flags;
 const say=(who:string,text:string)=>h.talk({lines:[SAY(who,text)]});
 const go=(map:MapId,name:string)=>{const p=arrival(map,name);h.travel(p.map,p.x,p.y);};
 const gun=(mortar:boolean)=>{
  if(!f.watchGunsSeen)return;
  const won=mortar?'mortarWon':'repeaterWon',other=mortar?'repeaterWon':'mortarWon';
  if(f[won])return h.toast(f[other]?'Both gun positions are clear. Take the signal-wall stair.':'This position is clear. Cross the terrace to the other gun.');
  const support=f[other]?'The other gun is silent. This crew has a guardian and a shield soldier.':mortar?'The eastern repeater’s spotter will mark a straight firing lane each round. Defeat the spotter to stop its fire.':'The western mortar’s spotter will mark a seven-hex blast each round. Defeat the spotter to stop its fire.';
  return h.talk({lines:[SAY('Petra',support)],choices:[
   {label:mortar?'Clear the western mortar':'Clear the eastern repeater',action:()=>{h.commit(mortar?'mortarConfronted':'repeaterConfronted');h.battle(`dawn-${mortar?'mortar':'repeater'}-${f[other]?'last':'first'}`);}},
   {label:'Prepare first',action:()=>{}},
  ]});
 };
 switch(id){
  case 'ship-cabin':return completedAnchors(s)>=2?go('observation','start'):say('Alda','The observation cabin’s empty. I keep the spare charts in there.');
  case 'cabin-deck':return go('airship','cabin');
  case 'dawn-ship':return go('airship','dawnwatch');
  case 'dawn-gate':
   if(f.dawnwatchComplete)return offerImprovements(h,'dawnwatch');
   if(!f.dawnwatchSeen)return;
   if(f.shelterOpened)return say('Enna',f.dawnwatchComplete?'The wheel key stays by the shelter door. Everybody on watch knows where it is.':'There’s water inside. We’ll keep the door open while you clear the gun terraces.');
   return h.talk({...scenes.shelter(),done:()=>{s.location=arrival('dawnwatch','shelter');h.commit('shelterOpened','shelterOpened');}});
  case 'dawn-barracks':return f.shelterOpened?go('watchbarracks','start'):h.toast('Open the shelter gate first.');
  case 'dawn-soldier':if(f.dawnwatchComplete)return offerImprovements(h,'dawnwatch');return say('Enna',f.shelterOpened?'I’ll stay at the gate. Both gun positions are above the barracks stair.':'The lever’s above us. I’ll help Petra lift it.');
  case 'dawn-soldier-after':return offerImprovements(h,'dawnwatch');
  case 'watch-plan':return h.talk({lines:[SAY('Petra',f.mortarWon&&f.repeaterWon?'Both guns are silent. The signal-wall stair is north.':'Which position? The other gun supports its crew until we defeat the spotter.')],choices:[
   {label:f.mortarWon?'Western mortar · position clear':'Western mortar · repeater lane support',disabled:!!f.mortarWon,action:()=>gun(true)},
   {label:f.repeaterWon?'Eastern repeater · position clear':'Eastern repeater · mortar blast support',disabled:!!f.repeaterWon,action:()=>gun(false)},
   {label:'Leave the terrace for now',action:()=>{}},
  ]});
  case 'watch-mortar':return gun(true);
  case 'watch-repeater':return gun(false);
  case 'watch-wall':return f.mortarWon&&f.repeaterWon?go('signalwall','start'):h.toast('Clear both the western mortar and the eastern repeater before climbing the signal wall.');
  case 'watch-town':return go('dawnwatch','barracks');
  case 'watch-coat':
   if(f.watchCoatTaken)return say('Kit','The field coat’s in our bag unless someone’s wearing it.');
   if(!f.mortarWon||!f.repeaterWon)return say('Petra','That locker’s between the guns. Clear both positions before we open it.');
   return h.talk({lines:[SAY('Petra','A light officers’ field coat. The lining’s intact. Anyone can wear it.')],choices:[
    {label:'Take the field coat',action:()=>{if(receiveItem(s.inventory,'field-coat'))h.commit('watchCoatTaken','watchCoatTaken');else h.toast('The bag cannot hold another field coat.');}},
    {label:'Leave it here',action:()=>{}},
   ]});
  case 'wall-commander':
   if(!f.aurelSeen)return;
   if(f.aurelWon)return h.toast('The platform is clear. Release the anchor at the town wheel.');
   return h.talk({lines:[SAY('Petra','He’ll order his shield troops one hex forward and give them six guard before attacking. Taunt him to break the order. His saber sweep hits everyone next to him.')],choices:[
    {label:'Face Commander Aurel',action:()=>{h.commit('aurelConfronted');h.battle('dawn-commander');}},
    {label:'Check our equipment first',action:()=>{}},
   ]});
  case 'wall-anchor':
   if(!f.aurelWon)return h.toast('Clear the command platform before reaching the wheel.');
   if(f.dawnwatchFreed)return say('Enna','The contacts are open. We control the signal lamps from the town now.');
   return h.talk({...scenes.release(),done:()=>{s.location=arrival('signalwall','release');h.commit('dawnwatchFreed','dawnwatchFreed');}});
  case 'wall-barracks':return go('watchbarracks','wall');
  case 'wall-sentry':return say('Enna',f.dawnwatchComplete?'The pilots have taken the charts to Alda. We’re keeping the shelter open.':f.dawnwatchFreed?'Bring those approach charts down to the shelter. We’ll find people who want to fly.':'The lower gate is still open. Nobody’s leaving those families outside.');
 }
}
