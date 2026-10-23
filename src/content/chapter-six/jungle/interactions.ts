import type { StoryHost } from '../../story-host';
import { arrival } from '../../maps';
import { SAY,type Dialogue } from '../../dialogue';
import { remember,restoreParty,type MapId } from '../../../rules/state';
import { buySupply } from '../../../rules/supplies';
import { completeRiverTreatment } from './recovery';
import * as scenes from './scenes';
const go=(h:StoryHost,map:MapId,name='start')=>{const p=arrival(map,name);h.travel(p.map,p.x,p.y);};
export function resumeJungle(h:StoryHost):boolean{
 const s=h.state,f=s.flags,m=s.location.map;
 const show=(d:Dialogue,flag:string)=>{h.talk({...d,done:()=>h.commit(flag,flag)});return true;};
 if(m==='outermooring'&&f.nellRecovered&&!f.riverReported){
  h.talk({...scenes.home(s),done:()=>{
   if(f.desertSealBroken&&!f.desertReported){f.desertReported=true;remember(s,'desertReported');}
   h.commit('riverReported','riverReported');
  }});return true;
 }
 if(m==='riverhaven'){
  if(!f.riverSeen)return show(scenes.arrival(),'riverSeen');
  if(f.riverRestSeen&&!f.riverThanksSeen)return show(scenes.thanks(),'riverThanksSeen');
 }
 if(m==='canopy'&&!f.riverCrossingSeen)return show(scenes.crossing(),'riverCrossingSeen');
 if(m==='rainhouse'){
  if(!f.rainhouseSeen)return show(scenes.rainhouse(),'rainhouseSeen');
  if(f.nellRecovered&&!f.riverRestSeen)return show(scenes.rest(),'riverRestSeen');
 }
 return false;
}
export function interactJungle(h:StoryHost,id:string):boolean{
 const s=h.state,f=s.flags;
 const say=(who:string,text:string)=>h.talk({lines:[SAY(who,text)]});
 const fight=(who:string,text:string,label:string,encounter:string,flag?:string)=>h.talk({lines:[SAY(who,text)],choices:[{label,action:()=>{if(flag)h.commit(flag);h.battle(encounter);}},{label:'Prepare first',action:()=>{}}]});
 if(['river-stores','canopy-stores','rainhouse-rest'].includes(id)){
  h.talk({lines:[SAY('Celia','Clean water and a place to sit. Let me check the dressings before we move on.')],choices:[
   {label:'Rest · restore everyone’s HP and focus',action:()=>{restoreParty(s);h.refresh();h.save();h.toast('Your companions have rested.');}},
   {label:'Buy a bandage · 8 marks',action:()=>{if(!buySupply(s,'bandage'))return h.toast(s.bandages>=999?'The bandage bag is full.':'Not enough marks.');h.refresh();h.save();h.toast('Bandage added.');}},
   {label:'Keep going',action:()=>{}},
  ]});return true;
 }
 switch(id){
  case 'river-ines':say('Ines',f.nellRecovered?'Leave Celia’s notes on my table. I’ll put them with the treatment record before Tavi takes the next post.':'The equipment is packed. Open the boat chain first, then check the rain house landing. We’ll keep Nell on your ship until the passage is safe.');break;
  case 'river-tavi':say('Tavi',f.nellRecovered?'We’re taking the regular patients upriver again. There’s always room for you on the launch.':f.riverChainOpen?'Ines is preparing the treatment boat. Check the upper landing before we bring Nell.':'The chain is on the middle bridge. The eastern path gets us to its capstan.');break;
  case 'river-notice':say('Kit','The baskets have destinations tied to them. Ines has put our ship on her list beside the regular calls.');break;
  case 'river-canopy':go(h,'canopy');break;
  case 'river-ship':go(h,'outermooring','namar');break;
  case 'canopy-village':go(h,'riverhaven','canopy');break;
  case 'river-patrol':
   if(!f.riverPatrolWon)fight('Petra','The machines hold the bridge. Give the hounds room to come off the rail.','Clear the lower crossing','river-patrol','riverPatrolConfronted');break;
  case 'river-chain':
   if(!f.riverPatrolWon){say('Orrin','Clear the patrol before we put our hands on the capstan.');break;}
   if(f.riverChainOpen)break;
   h.talk({...scenes.chain(),done:()=>h.commit('riverChainOpen','riverChainOpen')});break;
  case 'canopy-rainhouse':
   if(!f.riverChainOpen){h.toast('Open the boat chain at the capstan first.');break;}go(h,'rainhouse');break;
  case 'river-cache':
   if(!f.riverCacheWon)fight('Kit','There’s a range sight in that survey locker. Two crows are still watching it from the roof.','Open the survey locker','river-cache');break;
  case 'rainhouse-guard':
   if(!f.rainhouseWon)fight('Petra','That herald has the landing bell. Keep the wings from getting behind us.','Clear the treatment terrace','rainhouse-guard','rainhouseConfronted');break;
  case 'river-treatment':
   if(!f.rainhouseWon){say('Celia','The deck has to be clear before Nell and the healers come across.');break;}
   if(f.nellRecovered)break;
   h.talk({lines:[SAY('Celia','Ines is ready at the bend. We can bring Nell to the covered deck now.')],choices:[
    {label:'Bring Nell and begin the treatment',action:()=>h.talk({...scenes.treatment(),done:()=>{
     if(completeRiverTreatment(s)){h.commit('nellRecovered');resumeJungle(h);}
    }})},
    {label:'Wait at the rain house',action:()=>{}},
   ]});break;
  case 'rainhouse-ines':say('Ines','The binding has settled. The lamp is still hers; it no longer pulls at her pulse. Send us Sera’s reply when it comes.');break;
  case 'rainhouse-tavi':go(h,'riverhaven','return');break;
  case 'rainhouse-canopy':go(h,'canopy','rainhouse');break;
  default:return false;
 }
 return true;
}
