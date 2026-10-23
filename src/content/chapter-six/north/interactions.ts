import type { StoryHost } from '../../story-host';
import { arrival } from '../../maps';
import { SAY,type Dialogue } from '../../dialogue';
import { restoreParty,type MapId } from '../../../rules/state';
import { buySupply } from '../../../rules/supplies';
import * as scenes from './scenes';
const go=(h:StoryHost,map:MapId,name='start')=>{const p=arrival(map,name);h.travel(p.map,p.x,p.y);};
export function resumeNorth(h:StoryHost,again:()=>void):boolean{
 const s=h.state,f=s.flags,m=s.location.map;
 const show=(d:Dialogue,flag:string,after?:()=>void)=>{h.talk({...d,done:()=>{h.commit(flag,flag);after?.();}});return true;};
 if(m==='bellharbor'){
  if(!f.northSeen)return show(scenes.arrival(s),'northSeen');
  if(f.northSealBroken&&!f.northReturned)return show(scenes.returned(s),'northReturned');
 }
 if(m==='frostwatch'&&!f.northWatchSeen)return show(scenes.watch(s),'northWatchSeen');
 if(m==='wintershrine'&&!f.winterShrineSeen)return show(scenes.shrine(s),'winterShrineSeen');
 if(m==='capitalquay'&&!f.capitalQuaySeen)return show(scenes.quay(s),'capitalQuaySeen');
 if(m==='outermooring'){
  if(f.northReturned&&!f.northReported)return show(scenes.home(s),'northReported',again);
  if(f.northSealBroken&&f.desertSealBroken&&!f.capitalOpened)return show(scenes.opened(s),'capitalOpened');
 }
 return false;
}
export function interactNorth(h:StoryHost,id:string):boolean{
 const s=h.state,f=s.flags;
 const say=(who:string,text:string)=>h.talk({lines:[SAY(who,text)]});
 const fight=(text:string,label:string,encounter:string,flag:string)=>h.talk({lines:[SAY('Petra',text)],choices:[{label,action:()=>{h.commit(flag);h.battle(encounter);}},{label:'Prepare first',action:()=>{}}]});
 if(['harbor-stores','watch-rest','glacier-rest','shrine-rest','capital-stores'].includes(id)){
  h.talk({lines:[SAY('Celia','There’s water under cover. Sit down and let me check the dressings.')],choices:[
   {label:'Rest · restore everyone’s HP and focus',action:()=>{restoreParty(s);h.refresh();h.save();h.toast('Your companions have rested.');}},
   {label:'Buy a bandage · 8 marks',action:()=>{if(!buySupply(s,'bandage'))return h.toast(s.bandages>=999?'The bandage bag is full.':'Not enough marks.');h.refresh();h.save();h.toast('Bandage added.');}},
   {label:'Keep going',action:()=>{}},
  ]});return true;
 }
 switch(id){
  case 'north-king':say('King Edric','Signe has my commission. Open the mountain passage and she can withdraw the seal.');break;
  case 'north-signe':say('Signe',f.northSealBroken?'The sanctuary road stays open. We’ve put supplies at every shelter.':'The eastern quay leads to Frostwatch. The expedition is ready to follow us through.');break;
  case 'north-egil':say('Egil',f.northReturned?'They’ve put the nameplate beside the harbor log. I’ll sit there with the families until my watch.':'Two short bells for an open berth. On this coast you wait for an answer before you round the next headland.');break;
  case 'north-records':say('King Edric','The families can read the original log and the orders beside it. We’re keeping both here.');break;
  case 'harbor-watch':if(f.northSeen)go(h,'frostwatch');break;
  case 'harbor-ship':go(h,'outermooring','namar');break;
  case 'watch-harbor':go(h,'bellharbor','watch');break;
  case 'north-watch':if(!f.northWatchWon)fight('The guardian holds the road. Keep room beside the hounds so they can’t pin us against the gate.','Clear the winter patrol','north-watch','northWatchConfronted');break;
  case 'north-windlass':
   if(!f.northWatchWon){say('Orrin','Clear the patrol before we take the weight off this catch.');break;}
   if(!f.northPassOpened)h.talk({...scenes.gate(s),done:()=>h.commit('northPassOpened','northPassOpened')});break;
  case 'watch-glacier':if(f.northPassOpened)go(h,'glacier');else h.toast('Open the passage gate at the windlass first.');break;
  case 'north-log':if(!f.northLogRead)h.talk({...scenes.wrecks(s),done:()=>h.commit('northLogRead','northLogRead')});break;
  case 'north-hunters':
   if(!f.northLogRead){say('Signe','Egil found a marked dispatch case beside the wreck. Let’s help him open it before we climb.');break;}
   if(!f.northHuntersWon)fight('The tall creature has a clear line down the shelf. Spread out before the wings reach us.','Clear the upper ice shelf','north-hunters','northHuntersConfronted');break;
  case 'glacier-cache':if(!f.northCacheWon)fight('The crows are watching that stores hatch. We can take the sight if we clear them.','Open the relief stores','north-cache','northCacheConfronted');break;
  case 'glacier-shrine':if(f.northHuntersWon)go(h,'wintershrine');else h.toast('Clear the divine hunters from the upper shelf first.');break;
  case 'glacier-watch':go(h,'frostwatch','glacier');break;
  case 'north-dragon':
   if(!f.winterDragonWon)fight('Brace when it draws breath. Move off the shelf it marks; the loose ice will slow us down.','Face the winter dragon','winter-dragon','winterDragonConfronted');break;
  case 'north-release':
   if(!f.winterDragonWon){say('Signe','The dragon’s claws are over the mounting. We can’t lift it yet.');break;}
   if(!f.northSealBroken)h.talk({...scenes.release(s),done:()=>h.commit('northSealBroken','northSealBroken')});break;
  case 'shrine-glacier':go(h,'glacier','shrine');break;
  case 'shrine-home':if(f.northSealBroken)go(h,'bellharbor','return');break;
  case 'six-capital-open':go(h,'capitalquay');break;
  case 'capital-return':go(h,'outermooring','namar');break;
  case 'capital-inner':h.talk({lines:[SAY('Alda','The landing’s clear. The next journey will take us through that arch.')],choices:[{label:'Inner capital · not yet playable',disabled:true,action:()=>{}},{label:'Stay on the allied quay',action:()=>{}}]});break;
  case 'capital-crew':say('Alda','Namar’s barges take the lower berths. Skeld’s pilots have the launches. Your ship and all three foreign landings are still available.');break;
  default:return false;
 }
 return true;
}
