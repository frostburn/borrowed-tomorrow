import type { StoryHost } from '../story-host';
import { arrival } from '../maps';
import { SAY,type Dialogue } from '../dialogue';
import { receiveItem } from '../../rules/inventory';
import type { MapId } from '../../rules/state';
import { restoreParty } from '../../rules/state';
import { buySupply } from '../../rules/supplies';
import * as scenes from './scenes';
const go=(h:StoryHost,map:MapId,name='start')=>{const p=arrival(map,name);h.travel(p.map,p.x,p.y);};
export function resumeChapterSix(h:StoryHost){
 const s=h.state,f=s.flags,m=s.location.map;
 const show=(d:Dialogue,flag:string,after?:()=>void)=>h.talk({...d,done:()=>{h.commit(flag,flag);after?.();}});
 if(m==='outermooring'){
  if(!f.capitalSealed)return show(scenes.sealed(),'capitalSealed',()=>resumeChapterSix(h));
  if(!f.sixRoutesKnown)return show(scenes.briefing(),'sixRoutesKnown',()=>{f.jungleLeadKnown=true;h.commit('jungleLeadKnown','jungleLeadKnown');});
  if(f.desertSealBroken&&!f.desertReported)return show(scenes.home(),'desertReported');
 }
 if(m==='namar'){
  if(f.desertReleaseReady&&!f.desertSealBroken)return show(scenes.publicBreak(),'desertSealBroken');
  if(!f.desertSeen)return show(scenes.city(),'desertSeen');
 }
 if(m==='sunpalace'&&f.palaceEscapeWon&&!f.palaceEscaped)return show(scenes.escaped(),'palaceEscaped',()=>{s.location=arrival('sunpalace','escape');h.refresh();h.save();});
 if(m==='skywalk'&&!f.desertAscentSeen)return show(scenes.roofs(),'desertAscentSeen');
 if(m==='observatory'&&!f.sunSerpentSeen)return show(scenes.serpent(),'sunSerpentSeen');
}
export function interactChapterSix(h:StoryHost,id:string){
 const s=h.state,f=s.flags;
 const say=(who:string,text:string)=>h.talk({lines:[SAY(who,text)]});
 const fight=(text:string,label:string,encounter:string)=>h.talk({lines:[SAY('Petra',text)],choices:[{label,action:()=>h.battle(encounter)},{label:'Prepare first',action:()=>{}}]});
 if(id==='six-supplies'||id==='namar-supply'||id==='palace-supply'||id==='roof-rest'||id==='observatory-rest')return h.talk({
  lines:[SAY(id==='six-supplies'?'Alda':'Celia',id==='six-supplies'?'The launches brought fresh water and dressings. Use the berth before we set another course.':'Clean water and a shaded bench. Sit down and let me check those dressings.')],
  choices:[
   {label:'Rest · restore everyone’s HP and focus',action:()=>{restoreParty(s);h.refresh();h.save();h.toast('Your companions have rested.');}},
   {label:'Buy a bandage · 8 marks',action:()=>{if(!buySupply(s,'bandage'))return h.toast(s.bandages>=999?'The bandage bag is full.':'Not enough marks.');h.refresh();h.save();h.toast('Bandage added.');}},
   {label:'Keep going',action:()=>{}},
  ],
 });
 switch(id){
  case 'six-chart':
   if(!f.sixRoutesKnown)return resumeChapterSix(h);
   return h.talk({lines:[SAY('Alda',f.desertSealBroken?'Namar’s navigators have the western approach. The northern seal still holds the wall.':'Namar’s evening landing is clear. We can leave a full medical watch aboard.')],choices:[
    {label:f.desertSealBroken?'Namar · revisit the evening exchange':'Namar · the western pact seal',action:()=>go(h,'namar')},
    {label:'Northern capital · not yet playable',disabled:true,action:()=>{}},
    {label:'River healers · not yet playable',disabled:true,action:()=>{}},
    {label:'Stay at the outer mooring',action:()=>{}},
   ]});
  case 'six-nell':case 'six-report':
   return h.talk({...scenes.letter(),done:()=>{f.jungleLeadKnown=true;h.commit('jungleLeadKnown','jungleLeadKnown');}});
  case 'six-alda':return say('Alda',f.desertSealBroken?'The launches will carry Namar’s crews. We still need the northern release.':'There’s room for the people outside the gate. The launches are bringing them around to us.');
  case 'six-capital':return say('Petra','The northern and western seals meet inside that wall. We have to release them at their own capitals.');
  case 'namar-amal':return say('Amal',f.desertSealBroken?'The barges are signed over. The post still leaves at the bell.':f.palaceCoup?'The families are under the covered quay. I’m keeping the post boats on the western bank.':'The eastern palace door. Cross the bridge and turn toward the dome.');
  case 'namar-post':
   if(f.desertMailSent)return say('Amal','Your report has gone to Dena. Tomas’s letter is in the same sack.');
   return h.talk({lines:[SAY('Kit','The report goes to the ward. This one is for Nell’s brother. Could you keep it dry?'),SAY('Amal','It’s a postal boat, not a swimming lesson. Take this spare harness; your bag’s pulling you sideways.')],done:()=>{receiveItem(s.inventory,'courier-harness');h.commit('desertMailSent','desertMailSent');}});
  case 'namar-clock':return say('Orrin','Canal water fills the upper bowl. When it tips, that tooth advances the dial. I’m going to need another page.');
  case 'namar-celebrate':return say('Queen Samira','The captains have the evacuation route. The ward crews are reading the ledger with their patients.');
  case 'namar-palace':return go(h,'sunpalace');
  case 'namar-ship':return go(h,'outermooring','namar');
  case 'palace-audience':
   if(f.palaceCoup)return say('Queen Samira',f.palaceEscaped?'The western stair reaches the observatory. Amal has it open.':'We need the western postal stair. Sahir’s men are holding the gallery and service channel.');
   return h.talk({...scenes.court(),done:()=>h.commit('palaceCoup','palaceCoup')});
  case 'palace-route':
   if(!f.palaceCoup)return;
   if(f.palaceEscapeWon)return resumeChapterSix(h);
   return h.talk({lines:[SAY('Petra','His guards hold the gallery. The service channel has hounds and shallow water. Choose the ground before we move the queen.')],choices:[
    {label:'Break the gallery cordon · dry floor',action:()=>{f.palaceRouteChosen=true;f.palaceWaterRoute=false;h.save();h.battle('palace-gallery');}},
    {label:'Take the service channel · shallow water',action:()=>{f.palaceRouteChosen=true;f.palaceWaterRoute=true;h.save();h.battle('palace-channel');}},
    {label:'Rest and prepare first',action:()=>{}},
   ]});
  case 'palace-city':return f.palaceCoup&&!f.palaceEscaped?say('Petra','The southern gate is barred. Take the postal stair west of the fountain.'):go(h,'namar','palace');
  case 'palace-roofs':return f.palaceEscaped?go(h,'skywalk'):h.toast('Clear the palace cordon and meet Amal at the postal stair first.');
  case 'roof-palace':return go(h,'sunpalace','roofs');
  case 'roof-guard':
   if(!f.desertAscentSeen||f.desertAscentWon)return;
   return fight('The tall creature’s light cuts a straight lane. Spread out before the wings can pin us against the rail.','Clear the upper terrace','desert-ascent');
  case 'roof-observatory':return f.desertAscentWon?go(h,'observatory'):h.toast('Clear the glasswings from the upper terrace first.');
  case 'roof-chest':
   if(!f.desertAscentWon)return say('Celia','Leave the case under cover until those wings are clear.');
   if(f.desertFocusTaken)return;
   return h.talk({lines:[SAY('Celia','A sunstone lens. They used it to examine eyes under this bright sky. It will fit my field focus.')],done:()=>{receiveItem(s.inventory,'sunstone-focus');h.commit('desertFocusTaken','desertFocusTaken');}});
  case 'sun-serpent':
   if(!f.sunSerpentSeen||f.sunSerpentWon)return;
   return h.talk({lines:[SAY('Orrin','The head is always within reach of a shot. Breaking the loose coils will strip its armor and stop the glass reflecting on that side.'),SAY('Petra','The attack marks include the reflections. We can move out of them before it breathes.')],choices:[{label:'Face the sun serpent',action:()=>{h.commit('sunSerpentConfronted');h.battle('sun-serpent');}},{label:'Rest and fit our equipment first',action:()=>{}}]});
  case 'desert-release':
   if(!f.sunSerpentWon)return h.toast('Stop the sun serpent before reaching for the bronze release.');
   if(f.desertSealBroken)return say('Queen Samira','The western return is open. The pact can’t draw our seal back.');
   if(f.desertReleaseReady)return go(h,'namar','return');
   return h.talk({...scenes.release(),done:()=>{h.commit('desertReleaseReady','desertReleaseReady');go(h,'namar','return');}});
  case 'observatory-roofs':return go(h,'skywalk','observatory');
  case 'observatory-sahir':return say('Minister Sahir',f.desertSealBroken?'The watch has my token. I’ll go down with them.':'It was supposed to obey the keeper’s token. I used the words exactly as they were written.');
 }
}
