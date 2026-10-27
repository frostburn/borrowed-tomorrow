import { SAY } from '../dialogue';
import { arrival } from '../maps';
import { FIFTH_CHAPTER, recruit, remember, restoreParty } from '../../rules/state';
import { buySupply } from '../../rules/supplies';
import { receiveItem } from '../../rules/inventory';
import type { StoryHost } from '../story-host';
import * as scenes from './scenes';

export function resumeChapterFour(h:StoryHost){
 const {state:s}=h,f=s.flags;
 if(!f.refugeSeen)return h.talk({...scenes.home(),done:()=>h.commit('refugeSeen','refugeSeen')});
 if(s.location.map==='breakwater'&&!f.worksArrival)return h.talk({...scenes.harbor(),done:()=>{
  const formation=[...s.activeParty];recruit(s,'celia');s.activeParty=formation;
  h.commit('worksArrival','worksArrival');
 }});
 if(s.location.map==='sanctuary'&&!f.sanctuaryEntered)return h.talk({...scenes.terrace(),done:()=>h.commit('sanctuaryEntered','sanctuaryEntered')});
}
export function interactChapterFour(h:StoryHost,id:string){
 const {state:s}=h,f=s.flags;
 const say=(who:string,text:string)=>h.talk({lines:[SAY(who,text)]});
 const go=(map:'refuge'|'breakwater'|'sanctuary',name:string)=>{const p=arrival(map,name);h.travel(p.map,p.x,p.y);};
 switch(id){
  case 'refuge-rest':case 'works-bench':case 'sanctuary-bench':return h.talk({lines:[SAY('Supplies','There’s a sheltered place to rest, and bandages for eight marks.')],choices:[
   {label:'Rest · restore everyone’s HP and focus',action:()=>{restoreParty(s);h.refresh();h.save();h.toast('Everyone has rested.');}},
   {label:'Buy a bandage · 8 marks',action:()=>{if(!buySupply(s,'bandage'))return h.toast(s.bandages>=999?'The bandage bag is full.':'Not enough marks.');h.refresh();h.save();h.toast('Bandage added.');}},
   {label:'Browse medical supplies and trade gear',action:()=>h.shop('field')},
   {label:'Leave',action:()=>{}},
  ]});
  case 'refuge-tomas':
   if(f.chapterFourComplete)return say('Tomas','I’ll keep the messages coming. The western airfield is marked on your map.');
   if(!f.anchorsKnown)return say('Tomas',f.harborOpened?'The ferry crews are here. Bram’s already taking food back across the basin. Find the sanctuary signal; we’ll keep everyone warm.':'Dena’s got the ward. I’ve got the messages. Take those blankets down the eastern harbor path.');
   return h.talk({...(f.seaWalkSeen?{lines:[SAY('Tomas','The airfield road is marked. Ready to go?')]}:scenes.decision()),choices:[
    {label:'Leave for the western airfield',action:()=>{f.seaWalkSeen=true;s.flags.chapterFourComplete=true;remember(s,'anchorsDeparture');s.boundary=FIFTH_CHAPTER;s.location=arrival('refuge','departure');h.refresh();h.save();h.boundary();}},
    {label:'Prepare our equipment first',action:()=>{f.seaWalkSeen=true;h.save();}},
   ]});
  case 'refuge-bram':return say('Bram',f.sanctuaryWardenWon?'A whole tide came in without stopping. First ferry leaves at dawn, if you want anything brought up.':'The gate’s open. I can keep this ward fed while you deal with the signal.');
  case 'refuge-works':return go('breakwater','refuge');
  case 'works-bram':return say('Bram',f.worksGateWon?'The winding wheel is on the middle pier. Turn it and I’ll bring the ferry through.':'The crews have the upper deck. We need the guards off the winding gear.');
  case 'works-approach':
   if(f.worksGateWon)return h.toast('The guards are down. Turn the winding wheel on the middle pier.');
   if(!f.worksArrival)return;
   return h.talk({lines:[SAY('Orrin','The dry chain walk has a guardian and two ranged crows. Down on the pump floor it’s a guardian and two hounds; the water slows movement.')],choices:[
    {label:'Take the dry chain walk · ranged crows',action:()=>{f.worksRouteSet=true;f.worksFlooded=false;h.save();h.battle('works-dry');}},
    {label:'Cross the pump floor · shallow water',action:()=>{f.worksRouteSet=true;f.worksFlooded=true;h.save();h.battle('works-wet');}},
    {label:'Check our equipment first',action:()=>{}},
   ]});
  case 'works-cart':
   if(f.worksStoresWon)return say('Kit','That sight folds down small enough for the satchel. A good find.');
   return h.talk({lines:[SAY('Kit','A survey sight, still in its case. There’s a crow and a hound guarding the cart.')],choices:[
    {label:'Open the survey cart · fight its patrol',action:()=>h.battle('works-survey')},
    {label:'Leave the cart sealed',action:()=>{}},
   ]});
  case 'works-wheel':
   if(!f.worksGateWon)return say('Orrin','The guards have the brake locked. We have to clear them first.');
   if(f.harborOpened)return say('Orrin','Bram can work it by hand now. No crystal needed.');
   return h.talk({...scenes.openGate(),done:()=>{s.location=arrival('breakwater','gate');h.commit('harborOpened','harborOpened');}});
  case 'works-sanctuary':return f.harborOpened?go('sanctuary','harbor'):h.toast('Open the harbor gate to reach the stair.');
  case 'works-refuge':return go('refuge','harbor');
  case 'sanctuary-patrol':return h.battle('sanctuary-road');
  case 'sanctuary-cable':
   if(!f.roadGuardWon)return say('Orrin','The bridge guards have that clamp covered.');
   if(f.signalCut)return say('Orrin','The palace line is disconnected. Only the warden’s local reserve is running.');
   return h.talk({...scenes.cable(),done:()=>{s.location=arrival('sanctuary','cable');h.commit('signalCut','signalCut');}});
  case 'sanctuary-warden':return f.signalCut?h.battle('sanctuary-warden'):say('Celia','The return line is feeding its shield. Disconnect the cable at the eastern bridge first.');
  case 'sanctuary-record':
   if(f.anchorsKnown)return say('Celia','Hammerplain, Dawnwatch and Windmere. Tomas has our copy. The original stays where people can read it.');
   return h.talk({...scenes.record(),done:()=>h.commit('anchorsKnown','anchorsKnown')});
  case 'sanctuary-chest':
   if(f.sanctuaryCache)return say('Celia','Nothing else in the chest.');
   return h.talk({lines:[SAY('Celia','My old field clasp. It keeps the pages dry. I thought I’d lost it.')],done:()=>{if(!f.sanctuaryCache){receiveItem(s.inventory,'field-clasp');h.commit('sanctuaryCache');h.toast('Silver field clasp added to the bag.');}}});
  case 'sanctuary-refuge':return go('refuge','harbor');
  case 'sanctuary-harbor':return go('breakwater','sanctuary');
 }
}
