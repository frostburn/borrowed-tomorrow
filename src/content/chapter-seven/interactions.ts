import type {StoryHost} from '../story-host';
import type {Dialogue} from '../dialogue';
import {SAY} from '../dialogue';
import {arrival} from '../maps';
import {remember,restoreParty,type MapId} from '../../rules/state';
import {buySupply} from '../../rules/supplies';
import {receiveItem} from '../../rules/inventory';
import * as scenes from './scenes';
const go=(h:StoryHost,map:MapId,name='start')=>{const p=arrival(map,name);h.travel(map,p.x,p.y);};
const show=(h:StoryHost,d:Dialogue,flag:string,after?:()=>void)=>h.talk({...d,done:()=>{h.commit(flag,flag);after?.();}});
export function resumeChapterSeven(h:StoryHost){
 const s=h.state,f=s.flags,m=s.location.map;
 if(f.chapterSevenComplete)return h.boundary();
 if(m==='hollowsill'&&!f.domainEntered)return show(h,scenes.crossing(),'domainEntered');
 if(m==='takenwater'){
  if(!f.domainWaterSeen)return show(h,scenes.water(),'domainWaterSeen');
  if(f.domainCollectorWon&&!f.takenPeopleFreed)return show(h,scenes.waterFree(),'takenPeopleFreed');
 }
 if(m==='firstfield'){
  if(!f.firstHarvestSeen)return show(h,scenes.harvest(),'firstHarvestSeen');
  if(f.domainFurnaceWon&&!f.harvestFreed)return show(h,scenes.harvestFree(),'harvestFreed');
 }
 if(m==='quietward'){
  if(!f.firstHospiceSeen)return show(h,scenes.hospice(),'firstHospiceSeen');
  if(f.domainWardWon&&!f.wardPeopleFreed)return show(h,scenes.hospiceFree(),'wardPeopleFreed');
 }
 if(m==='seasonstreet'){
  if(!f.seasonStreetSeen)return show(h,scenes.seasons(),'seasonStreetSeen');
  if(f.domainDragonWon&&!f.seasonsFreed)return show(h,scenes.seasonsFree(),'seasonsFreed');
 }
 if(m==='lastrefuge'&&!f.lastRefugeSeen)return show(h,scenes.refuge(),'lastRefugeSeen');
 if(m==='sunthrone'){
  if(f.benefactorHeartWon&&!f.daysReturned)return show(h,scenes.released(),'daysReturned',()=>go(h,'homecoming'));
  if(f.daysReturned)return go(h,'homecoming');
  if(f.benefactorSunWon&&!f.fragmentReturned)return show(h,scenes.heart(),'fragmentReturned');
  if(f.benefactorBodyWon&&!f.hollowSunSeen)return show(h,scenes.sun(),'hollowSunSeen');
  if(!f.benefactorSeen)return show(h,scenes.god(),'benefactorSeen');
 }
 if(m==='homecoming'&&!f.homecomingSeen)return show(h,scenes.home(),'homecomingSeen');
 if(m==='seaholiday'&&!f.realSeaSeen)return show(h,scenes.sea(),'realSeaSeen');
}
export function interactChapterSeven(h:StoryHost,id:string){
 const s=h.state,f=s.flags;
 const say=(who:string,text:string)=>h.talk({lines:[SAY(who,text)]});
 const fight=(encounter:string,flag:string,label:string,warning:string)=>h.talk({lines:[SAY('Petra',warning)],choices:[
  {label,action:()=>{h.commit(flag);h.battle(encounter);}}, {label:'Prepare first',action:()=>{}},
 ]});
 if(id==='season-rest'&&!f.domainPatrolWon)return say('Petra','The hunters have the supplies covered. We need to clear the courier stair.');
 if(id.endsWith('-rest'))return h.talk({lines:[SAY('Supplies','Clean water, folded blankets and a field kit are under cover.')],choices:[
  {label:'Rest · restore everyone’s HP and focus',action:()=>{restoreParty(s);h.refresh();h.save();h.toast('Everyone has rested.');}},
  {label:'Buy a field bandage · 8 marks',action:()=>{if(buySupply(s,'bandage')){h.refresh();h.save();h.toast('Bandage added.');}else h.toast('You need 8 marks and room for a bandage.');}},
  {label:'Keep moving',action:()=>{}},
 ]});
 switch(id){
  case 'sill-alda':return say('Alda','The first people are crossing. I’ll keep the line here until you’re back.');
  case 'sill-cross':if(f.domainEntered)go(h,'takenwater');return;
  case 'water-sill':return go(h,'hollowsill');
  case 'water-hounds':if(!f.domainHoundsWon)fight('domain-hounds','domainHoundsConfronted','Clear the platform','Draw the hounds away from the passengers. Leave room to move when the wings come down.');return;
  case 'water-collector':if(f.domainHoundsWon&&!f.domainCollectorWon)fight('domain-collector','domainCollectorConfronted','Break the first collector','The pressure housing is familiar. Keep clear of its marked jets; it has no earth-plate shield.');return;
  case 'water-field':if(f.takenPeopleFreed)go(h,'firstfield');return;
  case 'water-porter':return say('Nell',f.takenPeopleFreed?'He’s gone ahead with the family. The blue ties lead to the crossing.':'Elspeth counted people who never woke in the village. They’ve been waiting here.');
  case 'field-water':return go(h,'takenwater');
  case 'field-furnace':if(!f.domainFurnaceWon)fight('domain-furnace','domainFurnaceConfronted','Stop the harvest keeper','It pours along its marked route and leaves hot tracks. Keep a clear way around it.');return;
  case 'field-farmer':return say('Celia',f.harvestFreed?'He took a handful of seed with him. He wants to find out what grows outside.':'The first harvest was real. The valley that paid for it was real too.');
  case 'field-reflector':
   if(!f.harvestFreed||f.domainReflectorTaken)return;
   return h.talk({lines:[SAY('Nell','The keeper’s lamp is empty. Orrin, could this reflector fit mine?'),SAY('Orrin','Same catches. I’ll put it in the bag.')],done:()=>{receiveItem(s.inventory,'morning-reflector');h.commit('domainReflectorTaken','domainReflectorTaken');}});
  case 'field-ward':if(f.harvestFreed)go(h,'quietward');return;
  case 'ward-field':return go(h,'firstfield');
  case 'ward-engine-seven':if(!f.domainWardWon)fight('domain-ward','domainWardConfronted','Stop the original ward engine','Break the lit projection to interrupt the beam and open the core. The other mirror takes over next round.');return;
  case 'ward-patient':return say('Celia',f.wardPeopleFreed?'She asked for her shoes before she left. The porter found a pair that fit.':'The fever is gone. The sores are from keeping her in bed.');
  case 'ward-seasons':if(f.wardPeopleFreed)go(h,'seasonstreet');return;
  case 'season-ward':return go(h,'quietward');
  case 'season-dragon':if(!f.domainDragonWon)fight('domain-dragon','domainDragonConfronted','Break the last return','Brace when it draws breath. The loose ice slows us down; keep a route to the clear floor.');return;
  case 'season-patrol':if(!f.domainPatrolWon)fight('domain-patrol','domainPatrolConfronted','Clear the courier stair','Those hunters have the side stair covered. The field supplies are beyond them, with a survey sight we can use.');return;
  case 'season-nameplate':return say('Petra','A tow-rope cut clean through. Skeld’s lost fleet didn’t end up here. We can bring back the days taken from survivors, but the dead stay dead.');
  case 'season-refuge':if(f.seasonsFreed)go(h,'lastrefuge');return;
  case 'refuge-seasons':return go(h,'seasonstreet');
  case 'refuge-preparations':return h.talk({lines:[SAY('Petra','The source is ahead. We can return to this shelter between the fights; the road will stay open.')],choices:[
   {label:'Climb to the Benefactor',action:()=>go(h,'sunthrone')},{label:'Prepare our equipment first',action:()=>{}},
  ]});
  case 'refuge-nell':return say('Nell',f.fragmentReturned?'The lantern doesn’t pull toward it anymore. I can carry it without gripping so hard.':'I keep checking the flame. It hasn’t gone out once.');
  case 'refuge-kit':return say('Kit','Alda knows the signal. If the next group has trouble on the step, she’ll send a rope.');
  case 'refuge-orrin':return say('Orrin','I took the return spring out. It can’t put the gate back while anyone’s crossing.');
  case 'refuge-celia':return h.talk({lines:[
   SAY('Celia','I’ve left water at the next landing. Check your dressings before we go.'),
   SAY('Nell','Have you had any water?'),
   SAY('Celia','Not yet. There’s some in the flask.'),
   SAY('Nell','We can wait.'),
   SAY('Celia','Then stay here a little, will you? I’d like some company.'),
   SAY('Nell','Until we’re all ready.'),
  ]});
  case 'refuge-petra':return h.talk({lines:[
   SAY('Petra','They’re making their own groups for the walk. I’ve shown them where to wait if the stair is crowded.'),
   SAY('Petra','I keep thinking someone will recognize me.'),
   SAY('Nell','From the exchange?'),
   SAY('Petra','Or before it. There were other trains.'),
   SAY('Nell','What will you say?'),
   SAY('Petra','I’ll ask if they want to speak to me. If they don’t, I’ll leave them alone.'),
  ]});
  case 'throne-retreat':return go(h,'lastrefuge');
  case 'throne-fight':
   if(f.benefactorHeartWon)return resumeChapterSeven(h);
   if(f.fragmentReturned)return fight('benefactor-heart','benefactorHeartConfronted','Break the exposed heart','The heart’s last pulse marks a different gap each round. Use the open floor, and protect anyone who can’t reach it.');
   if(f.hollowSunSeen)return fight('benefactor-sun','benefactorSunConfronted','Face the hollow sun','Its rays sweep whole lanes. Watch the warning before you cross; the sun has no shoulder armor now.');
   if(f.benefactorSeen)return fight('benefactor-body','benefactorBodyConfronted','Face the Benefactor','Its hands strike the marked side, then close across the middle. Spread out and keep a way past the sweep.');
   return resumeChapterSeven(h);
  case 'home-tomas':return say('Tomas','Window seat. Both tickets are in my pocket. You can check if you like.');
  case 'home-iona':return say('Iona','The flour train came on time. That’ll take some getting used to.');
  case 'home-cap':return say('Nell','Iona brushed the dust out. She’s kept the little tear in the brim.');
  case 'home-train':if(f.homecomingSeen)return go(h,'seaholiday');return;
  case 'sea-tomas':return say('Tomas','It’s colder than it looks. Come on, just up to the ankles.');
  case 'sea-kit':return say('Kit','Iona packed enough for the whole carriage. I’ve got the plates here.');
  case 'sea-petra':return say('Petra','The crust’s good. Who wants the end?');
  case 'sea-celia':return h.talk({lines:[
   SAY('Celia','Leave the timetable in the bag for a while.'),
   SAY('Nell','You haven’t checked it either.'),
   SAY('Celia','I gave it to Tomas. Pass me a plate.'),
  ]});
  case 'sea-orrin':
  case 'sea-friends':return say('Orrin','Petra’s cutting the bread. Celia says we’re allowed to eat before we check the return timetable.');
  case 'sea-ending':if(!f.realSeaSeen)return resumeChapterSeven(h);f.chapterSevenComplete=true;remember(s,'chapterSevenComplete');h.refresh();h.save();h.boundary();return;
 }
}
