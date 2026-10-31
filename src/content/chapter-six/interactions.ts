import {trainingChoice} from '../improvements';
import { resumeCapital,interactCapital } from './capital/interactions';
import { resumeNorth,interactNorth } from './north/interactions';
import { resumeJungle,interactJungle } from './jungle/interactions';
import type { StoryHost } from '../story-host';
import { arrival } from '../maps';
import { SAY,type Dialogue } from '../dialogue';
import { receiveItem } from '../../rules/inventory';
import type { MapId } from '../../rules/state';
import { remember,restoreParty } from '../../rules/state';
import * as scenes from './scenes';
const go=(h:StoryHost,map:MapId,name='start')=>{const p=arrival(map,name);h.travel(p.map,p.x,p.y);};
export function resumeChapterSix(h:StoryHost){
 if(resumeCapital(h))return;
 if(resumeJungle(h,()=>resumeChapterSix(h)))return;
 const s=h.state,f=s.flags,m=s.location.map;
 const show=(d:Dialogue,flag:string,after?:()=>void)=>h.talk({...d,done:()=>{h.commit(flag,flag);after?.();}});
 if(m==='outermooring'){
  if(!f.capitalSealed)return show(scenes.sealed(s),'capitalSealed',()=>resumeChapterSix(h));
  if(!f.sixRoutesKnown)return h.talk({...scenes.briefing(s),done:()=>{
   f.sixRoutesKnown=true;f.jungleLeadKnown=true;remember(s,'sixRoutesKnown');remember(s,'jungleLeadKnown');h.commit('sixRoutesKnown');
  }});
  if(f.desertSealBroken&&!f.desertReported)return show(scenes.home(s),'desertReported',()=>resumeChapterSix(h));
 }
 if(resumeNorth(h,()=>resumeChapterSix(h)))return;
 if(m==='namar'){
  if(f.desertReleaseReady&&!f.desertSealBroken)return show(scenes.publicBreak(s),'desertSealBroken');
  if(!f.desertSeen)return show(scenes.city(s),'desertSeen');
 }
 if(m==='sunpalace'&&f.palaceEscapeWon&&!f.palaceEscaped)return show(scenes.escaped(s),'palaceEscaped',()=>{s.location=arrival('sunpalace','escape');h.refresh();h.save();});
 if(m==='skywalk'&&!f.desertAscentSeen)return show(scenes.roofs(s),'desertAscentSeen');
 if(m==='observatory'&&!f.sunSerpentSeen)return show(scenes.serpent(s),'sunSerpentSeen');
}
export function interactChapterSix(h:StoryHost,id:string){
 if(interactCapital(h,id)||interactNorth(h,id)||interactJungle(h,id))return;
 const s=h.state,f=s.flags;
 const say=(who:string,text:string)=>h.talk({lines:[SAY(who,text)]});
 const fight=(text:string,label:string,encounter:string)=>h.talk({lines:[SAY('Petra',text)],choices:[{label,action:()=>h.battle(encounter)},{label:'Prepare first',action:()=>{}}]});
 if(id==='six-supplies'||id==='namar-supply'||id==='palace-supply'||id==='roof-rest'||id==='observatory-rest')return h.talk({
  lines:[SAY(id==='six-supplies'?'Alda':'Celia',id==='six-supplies'?'The launches brought fresh water and dressings. Use the berth before we set another course.':'Clean water and a shaded bench. Sit down and let me check those dressings.')],
  choices:[
   {label:'Rest · restore everyone’s HP and focus',action:()=>{restoreParty(s);h.refresh();h.save();h.toast('Your companions have rested.');}},
   {label:'Browse medical supplies and trade gear',action:()=>h.shop('field')},
   ...(id==='six-supplies'?[trainingChoice(h)]:[]),
   {label:'Keep going',action:()=>{}},
  ],
 });
 switch(id){
  case 'six-chart':
   if(!f.sixRoutesKnown)return resumeChapterSix(h);
   return h.talk({lines:[SAY('Alda',f.capitalOpened?'The allied landing is open. We can still return to any of these harbors.':f.northSealBroken&&f.desertSealBroken?'Both returns are released. We can bring the bridge level.':f.desertSealBroken?'Namar’s return is dark. Skeld still holds the northern seal.':f.northSealBroken?'Skeld’s return is dark. Namar still holds the western seal.':'Namar and Skeld have clear landings. Iria’s launch is available too.')],choices:[
    {label:f.desertSealBroken?'Namar · revisit the evening exchange':'Namar · the western pact seal',action:()=>go(h,'namar')},
    {label:f.northSealBroken?'Skeld · revisit the bell harbor':'Skeld · the northern pact seal',action:()=>go(h,'bellharbor')},
    {label:f.nellRecovered?'Iria · revisit the river healers':'Iria · Sera’s river healers',action:()=>go(h,'riverhaven')},
    {label:'Stay at the outer mooring',action:()=>{}},
    ...(f.capitalOpened?[{label:'Capital · allied landing',action:()=>go(h,'capitalquay')}]:[]),
   ]});
  case 'six-report':
   return say('Celia',f.northReported&&!f.desertReported?'Skeld’s medics left their watch notes here. I’ll send Sera the copy with our next report.':f.nellRecovered?'Ines’s treatment record is going to Sera. The launches have the ward’s supply lists.':'Sera’s notes are packed for the river healers. The launches are bringing the ward’s regular supplies.');
  case 'six-nell':case 'six-nell-ready':
   if(f.northReported&&!f.desertReported)return say('Nell',f.nellRecovered?'I’ll put Egil’s bell signals beside the route for Tomas. He’ll want to try them at the station.':'Two short bells for an open berth. Kit wrote the others down; I’ll learn them before Egil takes the next launch.');
   if(f.desertReported)return say('Nell',f.nellRecovered?f.desertMailSent?'I kept a copy of the clock drawing. We can take it to Larkspur when this is over.':'I’ll leave the letter at Amal’s sorting table before our next flight.':f.desertMailSent?'Orrin left the water-clock diagram by my cup. Send Tomas a copy when he answers.':'My letter’s with Kit. Remind him to leave it at Amal’s sorting table.');
   return h.talk({...scenes.letter(s)});
  case 'six-alda':return say('Alda',f.capitalOpened?'Both fleets are alongside. The landing bridge is open.':f.northSealBroken?f.desertSealBroken?'The returns are dark. Bring the ship alongside.':'Skeld’s pilots are aboard. We still need Namar’s release.':f.desertSealBroken?'The launches will carry Namar’s crews. We still need the northern release.':'There’s room for the people outside the gate. The launches are bringing them around to us.');
  case 'six-capital':return say('Petra',f.capitalOpened?'The bridge is level. We can cross to the allied landing.':f.northSealBroken&&f.desertSealBroken?'Both returns are out. Bring the ship alongside.':f.northSealBroken?'The northern return is dark. Namar still holds the western seal.':f.desertSealBroken?'The western return is dark. The northern seal still holds the landing bridge.':'The northern and western seals meet inside that wall. We have to release them at their own capitals.');
  case 'namar-amal':return say('Amal',f.desertSealBroken?'The barges are signed over. The post still leaves at the bell.':f.palaceCoup?'The families are under the covered quay. I’m keeping the post boats on the western bank.':'The eastern palace door. Cross the bridge and turn toward the dome.');
  case 'namar-post-sent':
  case 'namar-post':
   if(f.desertMailSent)return say('Amal','Your report has gone to Dena. Tomas’s letter is in the same sack.');
   return h.talk({lines:[SAY(f.nellRecovered?'Nell':'Kit',f.nellRecovered?'The report goes to Dena. This letter’s for my brother. I’ve put our route on the last page.':'The report goes to Dena. This one’s for Tomas. Our next landing’s on the last page.'),SAY('Amal','Report in the blue tray. Letter in the railway sack. Take this spare harness; your bag’s pulling you sideways.')],done:()=>{receiveItem(s.inventory,'courier-harness');h.commit('desertMailSent','desertMailSent');}});
  case 'namar-clock':return say('Orrin','Canal water fills the upper bowl. When it tips, that tooth advances the dial. I’m going to need another page.');
  case 'namar-celebrate':return say('Queen Samira','The captains have the evacuation route. The ward crews are reading the ledger with their patients.');
  case 'namar-palace':return go(h,'sunpalace');
  case 'namar-ship':return go(h,'outermooring','namar');
  case 'palace-audience':
   if(f.palaceCoup)return say('Queen Samira',f.palaceEscaped?'The western stair reaches the observatory. Amal has it open.':'We need the western postal stair. Sahir’s men are holding the gallery and service channel.');
   return h.talk({...scenes.court(s),done:()=>h.commit('palaceCoup','palaceCoup')});
  case 'palace-route':
   if(!f.palaceCoup)return;
   if(f.palaceEscapeWon)return resumeChapterSix(h);
   return h.talk({lines:[SAY('Petra','His guards hold the dry gallery. A guardian, a hound and a crow watch the shallow channel. Choose the ground before we move the queen.')],choices:[
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
   return h.talk({lines:[SAY('Orrin','The head’s exposed. Break a loose coil and we can get through its armor. That side won’t throw the breath back at us.'),SAY('Petra','Give each other room. When it turns its head, move clear of its breath.')],choices:[{label:'Face the sun serpent',action:()=>{h.commit('sunSerpentConfronted');h.battle('sun-serpent');}},{label:'Rest and fit our equipment first',action:()=>{}}]});
  case 'desert-release':
   if(!f.sunSerpentWon)return h.toast('Stop the sun serpent before reaching for the bronze release.');
   if(f.desertSealBroken)return say('Queen Samira','The western return is open. The pact can’t draw our seal back.');
   if(f.desertReleaseReady)return go(h,'namar','return');
   return h.talk({...scenes.release(s),done:()=>{h.commit('desertReleaseReady','desertReleaseReady');go(h,'namar','return');}});
  case 'observatory-roofs':return go(h,'skywalk','observatory');
  case 'observatory-sahir':return say('Minister Sahir',f.desertSealBroken?'The watch has my token. I’ll go down with them.':'It was supposed to obey the keeper’s token. I used the words exactly as they were written.');
 }
}
