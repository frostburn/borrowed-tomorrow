import { sickenNell } from '../../rules/availability';
import type { StoryHost } from '../chapter-one/interactions';
import { arrival } from '../maps';
import { SAY } from '../dialogue';
import { SIXTH_CHAPTER } from '../../rules/state';
import { completedAnchors } from './progress';
import * as scenes from './finale-scenes';

export const flagshipReady=(h:Pick<StoryHost,'state'>)=>completedAnchors(h.state)===3&&h.state.flags.allAnchorsSeen&&h.state.flags.emperorOfferTold;
const go=(h:StoryHost,map:'airship'|'flagship',name:string)=>{const p=arrival(map,name);h.travel(p.map,p.x,p.y);};

/** Every scene writes its checkpoint only on completion (including Skip). */
export function resumeFinale(h:StoryHost):boolean{
 const {state:s}=h,f=s.flags,map=s.location.map;
 if(map==='airship'&&f.flagshipWon&&!f.benefactorClaimSeen){go(h,'flagship','start');return true;}
 if(map==='flagship'){
  if(f.benefactorClaimSeen){go(h,'airship','flagship');return true;}
  h.talk({...scenes.claim(),done:()=>{
   f.benefactorClaimSeen=true;f.flagshipDestroyed=true;f.albanDestroyed=true;sickenNell(s);
   h.commit('benefactorClaimSeen','benefactorClaimSeen');go(h,'airship','flagship');
  }});return true;
 }
 if(map==='airship'&&f.nellIll&&!f.retaliationSeen){
  h.talk({...scenes.hunters(),done:()=>h.commit('retaliationSeen','retaliationSeen')});return true;
 }
 if(map==='airship'&&f.retaliationWon&&!f.chapterFiveComplete){
  h.talk({...scenes.departure(),done:()=>{s.boundary=SIXTH_CHAPTER;h.commit('chapterFiveComplete','fiveDeparture');h.boundary();}});return true;
 }
 return false;
}

export function beginRetaliation(h:StoryHost){
 if(!h.state.flags.retaliationSeen||h.state.flags.retaliationWon)return;
 return h.talk({lines:[SAY('Petra','The tall one sends light down a straight line. Keep apart, and stop the wings reaching the hatch.')],choices:[
  {label:'Defend the survey ship',action:()=>h.battle('benefactor-retaliation')},
  {label:'Check our equipment first',action:()=>{}},
 ]});
}

export function beginFlagship(h:StoryHost){
 const f=h.state.flags;
 if(f.chapterFiveComplete)return h.boundary();
 if(f.nellIll&&!f.retaliationWon)return beginRetaliation(h);
 if(f.flagshipWon)return go(h,'flagship','start');
 if(!flagshipReady(h))return h.toast(f.emperorOfferTold?'Disconnect all three regional anchors first.':'Visit the observation cabin and tell the others before setting the capital course.');
 const fight=()=>{h.commit('flagshipConfronted');h.battle('alban-flagship');};
 return h.talk({lines:[SAY('Alda',f.flagshipApproachSeen?'We can make the same approach. The launches are standing by.':'The three crews are ready. Rest and fit your equipment before we enter Alban’s cordon.')],choices:[
  {label:f.flagshipApproachSeen?'Face Alban’s flagship':'Enter the capital crossing',action:()=>{
   if(f.flagshipApproachSeen)return fight();
   h.talk({...scenes.approach(),done:()=>{h.commit('flagshipApproachSeen','flagshipApproachSeen');fight();}});
  }},
  {label:'Stay aboard and prepare',action:()=>{}},
 ]});
}

export function interactFinale(h:StoryHost,id:string){
 const f=h.state.flags;
 if(id==='ship-herald')return beginRetaliation(h);
 if(id==='flagship-evacuate')return go(h,'airship','flagship');
 if(id==='ship-nell')return h.talk({lines:[SAY('Celia','She’s awake. Ordinary rest won’t stop that pulse. I’ve written everything down for Sera.')]});
 if(id==='ship-capital')return f.chapterFiveComplete?h.boundary():beginFlagship(h);
}
