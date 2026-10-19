import { buySupply } from '../../rules/supplies';
import { receiveItem } from '../../rules/inventory';
import { FIFTH_CHAPTER,recruit,remember,restoreParty,type HeroId,type MapId } from '../../rules/state';
import { SAY } from '../dialogue';
import type { StoryHost } from '../chapter-one/interactions';
import * as scenes from './scenes';

// Chapter entry and loadState prepare this complete region before any viewpoint changes.
function groupAt(h:StoryHost,group:HeroId[],map:MapId,x:number,y:number){
 h.state.activeParty=group;h.state.location={map,x,y};h.refresh();h.save();resumeChapterFour(h);
}
export function resumeChapterFour(h:StoryHost){
 const s=h.state,f=s.flags;
 if(!f.brokenMorning)return h.talk({...scenes.morning(),done:()=>h.commit('brokenMorning','brokenMorning')});
 if(s.location.map==='breakwater'&&!f.worksArrival)return h.talk({...scenes.works(),done:()=>h.commit('worksArrival','worksArrival')});
 if(f.worksEvacuated&&!f.roadSeen)return h.talk({...scenes.road(),done:()=>{
  f.roadSeen=true;recruit(s,'celia');s.activeParty=['petra','celia'];remember(s,'roadSeen');h.refresh();h.save();
 }});
 if(f.roadGuardWon&&!f.sealLead){f.sealLead=true;s.activeParty=['celia','petra'];h.refresh();h.save();}
 if(f.sealSeen&&!f.partyReunited)return h.talk({...scenes.reunion(),done:()=>{
  const formation=[...s.reunionParty!];s.reunionParty=null;s.activeParty=formation;h.commit('partyReunited','partyReunited');
 }});
 if(s.location.map==='sanctuary'&&f.partyReunited&&!f.sanctuaryEntered)return h.talk({...scenes.threshold(),done:()=>h.commit('sanctuaryEntered','sanctuaryEntered')});
}
export function interactChapterFour(h:StoryHost,id:string){
 const s=h.state,f=s.flags,say=(who:string,text:string)=>h.talk({lines:[SAY(who,text)]});
 const rest=()=>h.talk({lines:[SAY(s.location.map==='refuge'?'Dena':'Field supplies',s.location.map==='refuge'?'There’s water on the stove. Sit down and let me check those cuts.':'Clean water and a field case are sheltered here.')],choices:[
  {label:'Rest · restore everyone’s HP and focus',action:()=>{restoreParty(s);h.refresh();h.save();h.toast('Everyone restored.');}},
  {label:'Buy a field bandage · 8 marks',action:()=>{if(buySupply(s,'bandage')){h.refresh();h.save();h.toast('Bandage added.');}else h.toast('You need 8 marks and room for a bandage.');}},
  {label:'Keep moving',action:()=>{}},
 ]});
 switch(id){
  case 'refuge-rest':case 'works-bench':case 'sanctuary-bench':rest();return;
  case 'refuge-tomas':
   if(f.chapterFourComplete)return h.boundary();
   if(!f.worksStarted)return h.talk({lines:[SAY('Tomas','Two short flashes from Breakwater. That’s Orrin. Dena says you’re sitting here until she’s checked that bump.')],choices:[
    {label:'Read Orrin’s signal',action:()=>{f.worksStarted=true;groupAt(h,['orrin','kit'],'breakwater',31,27);}},
    {label:'Prepare our equipment first',action:()=>{}},
   ]});
   if(!f.anchorsKnown)return say('Tomas',f.partyReunited?'Everyone’s here. Go and see what Celia found at the sanctuary. I’ll keep the messages moving.':'I’m keeping the passengers here. There’s room for the people from the works and the road.');
   h.talk({...scenes.decision(),choices:[
    {label:'Lead the counterattack · leave for the western airfield',action:()=>{
     f.chapterFourComplete=true;s.boundary=FIFTH_CHAPTER;s.location={map:'refuge',x:31,y:24};remember(s,'anchorsDeparture');h.refresh();h.save();h.endingMusic();h.boundary();
    }},
    {label:'Rest and prepare our equipment first',action:()=>{}},
   ]});return;
  case 'refuge-bram':return say('Bram',f.anchorsKnown?'The mill’s turning and all nineteen are accounted for. I’ve marked the western airfield road on Tomas’s map.':'All nineteen are in Dena’s ward. I’m making a list of the roads that still move.');
  case 'refuge-works':h.travel('breakwater',32,34);return;
  case 'refuge-sanctuary':h.travel('sanctuary',32,32);return;
  case 'works-bram':return say('Bram',f.worksGateWon?'The south gate has a manual chain. Open it and I’ll bring everyone through.':'There’s a manual chain on the south gate, but the machines have the return lock. Clear them first.');
  case 'works-approach':
   if(f.worksGateWon)return say('Orrin','The return lock’s loose. The south gate is ours to open.');
   if(f.worksRouteSet)return h.battle(f.worksFlooded?'works-wet':'works-dry');
   h.talk({lines:[SAY('Orrin','Dry walk: a guardian and two crows behind the blocks. Pump floor: a guardian and two hounds, with shallow water slowing us.'),SAY('Kit','We only need one route clear. Bram can bring everyone through the south gate.')],choices:[
    {label:'Take the dry service walk · ranged crows',action:()=>{f.worksFlooded=false;f.worksRouteSet=true;h.save();h.battle('works-dry');}},
    {label:'Cross the flooded pump floor · slower movement',action:()=>{f.worksFlooded=true;f.worksRouteSet=true;h.save();h.battle('works-wet');}},
    {label:'Prepare our equipment first',action:()=>{}},
   ]});return;
  case 'works-cart':
   if(f.worksStoresWon)return say('Kit','The surveyor’s range sight is in our bag. There’s nothing else in the cart.');
   h.talk({lines:[SAY('Kit','That folding sight fits my crossbow. There’s a crow and a hound on the cart’s lock line.')],choices:[
    {label:'Open the survey cart · fight its patrol',action:()=>h.battle('works-survey')},
    {label:'Leave the cart sealed',action:()=>{}},
   ]});return;
  case 'works-evacuate':
   if(!f.worksGateWon||f.worksEvacuated)return;
   h.talk({...scenes.worksEscape(),done:()=>{f.worksEvacuated=true;remember(s,'worksEvacuated');groupAt(h,['petra'],'sanctuary',27,30);}});return;
  case 'works-refuge':h.travel('refuge',20,24);return;
  case 'sanctuary-patrol':if(!f.roadGuardWon)h.battle('sanctuary-road');return;
  case 'sanctuary-seal':
   if(!f.sealLead||f.partyReunited)return;
   h.talk({...scenes.seal(),done:()=>{f.sealSeen=true;remember(s,'sealSeen');groupAt(h,['celia','petra'],'refuge',39,25);}});return;
  case 'sanctuary-warden':if(f.partyReunited&&!f.sanctuaryWardenWon)h.battle('sanctuary-warden');return;
  case 'sanctuary-record':
   if(!f.sanctuaryWardenWon)return;
   if(f.anchorsKnown)return say('Celia','Hammerplain, Dawnwatch and Windmere. The anchors hold the vessel steady. The hollow sun leads beyond it.');
   h.talk({...scenes.record(),done:()=>h.commit('anchorsKnown','anchorsKnown')});return;
  case 'sanctuary-chest':
   if(f.sanctuaryCache)return say('Celia','The silver clasp is in the equipment bag. The chest is empty.');
   h.talk({lines:[SAY('Celia','A silver field clasp. They used these to steady the light when treating people. This one still fits.')],done:()=>{receiveItem(s.inventory,'field-clasp');h.commit('sanctuaryCache');h.toast('Silver field clasp added to the bag · fits Celia.');}});return;
  case 'sanctuary-refuge':h.travel('refuge',43,25);return;
 }
}
