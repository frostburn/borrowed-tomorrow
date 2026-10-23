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
 if(map==='airship'&&f.flagshipWon&&!f.flagshipEvacuated){go(h,'flagship','start');return true;}
 if(map==='flagship'&&f.flagshipEvacuated){go(h,'airship','flagship');return true;}
 if(map==='flagship'&&!f.albanCaptured){
  h.talk({...scenes.surrender(),done:()=>{s.location=arrival('flagship','captured');h.commit('albanCaptured','albanCaptured');}});return true;
 }
 if(map==='airship'&&f.flagshipEvacuated&&!f.chapterFiveComplete){
  h.talk({...scenes.departure(),done:()=>{s.boundary=SIXTH_CHAPTER;h.commit('chapterFiveComplete','fiveDeparture');h.endingMusic();h.boundary();}});return true;
 }
 return false;
}

export function beginFlagship(h:StoryHost){
 const f=h.state.flags;
 if(f.chapterFiveComplete)return h.boundary();
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
 if(id==='flagship-evacuate'){
  if(!f.albanCaptured)return h.toast('Petra is securing the command deck.');
  if(f.flagshipEvacuated)return go(h,'airship','flagship');
  return h.talk({...scenes.evacuation(),done:()=>{h.commit('flagshipEvacuated','flagshipEvacuated');go(h,'airship','flagship');}});
 }
 if(id==='flagship-alban'||id==='ship-alban')return h.talk({lines:[SAY('Petra','He stays in custody. The crew will come with us to give their account.')]});
 if(id==='flagship-crew')return h.talk({lines:[SAY('Celia','The launches can carry everyone. The medics are checking the lower deck.')]});
 if(id==='ship-capital')return f.chapterFiveComplete?h.boundary():beginFlagship(h);
}
