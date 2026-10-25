import type { StoryHost } from '../../story-host';
import { arrival } from '../../maps';
import { SAY,type Dialogue } from '../../dialogue';
import { remember,restoreParty,SEVENTH_CHAPTER,type MapId } from '../../../rules/state';
import { receiveItem } from '../../../rules/inventory';
import { buySupply } from '../../../rules/supplies';
import * as scenes from './scenes';
const go=(h:StoryHost,map:MapId,name='start')=>{const p=arrival(map,name);h.travel(p.map,p.x,p.y);};
const show=(h:StoryHost,d:Dialogue,flag:string,after?:()=>void)=>{h.talk({...d,done:()=>{h.commit(flag,flag);after?.();}});return true;};
export function resumeCapital(h:StoryHost):boolean{
 const s=h.state,f=s.flags,m=s.location.map;
 if(m==='stillcity'&&!f.capitalStreetSeen)return show(h,scenes.street(s),'capitalStreetSeen');
 if(m==='lastpalace'){
  if(!f.capitalPalaceSeen)return show(h,scenes.palace(s),'capitalPalaceSeen');
  if(f.capitalCommandWon&&!f.capitalHallOpened)return show(h,scenes.hallOpened(s),'capitalHallOpened',()=>h.refresh());
  if(f.capitalHallOpened&&f.nellRecovered&&!f.capitalMorningLeft){
   if(f.capitalMorningQuestion)return show(h,scenes.awake(s),'capitalMorningLeft');
   if(!f.capitalAudienceSeen)return show(h,scenes.audience(s),'capitalAudienceSeen',()=>go(h,'lastmorning'));
   go(h,'lastmorning');return true;
  }
 }
 if(m==='lastmorning'&&!f.capitalMorningSeen)return show(h,scenes.morning(s),'capitalMorningSeen');
 if(m==='lastshore'){
  if(!f.capitalMorningQuestion)return show(h,scenes.shore(s),'capitalMorningQuestion',()=>go(h,'lastpalace','memory'));
  go(h,'lastpalace','memory');return true;
 }
 if(m==='crown'){
  if(!f.emperorSeen)return show(h,scenes.vessel(s),'emperorSeen');
  if(f.emperorWon&&!f.emperorFallen)return show(h,scenes.fallen(s),'emperorFallen',()=>resumeCapital(h));
  if(f.emperorFallen){
   if(f.capitalRiskAccepted){
    if(!f.lightbearerSeen)return show(h,scenes.manifestation(s),'lightbearerSeen',()=>h.refresh());
    if(f.lightbearerWon&&!f.nellLost)return h.talk({...scenes.lost(s),done:()=>{f.nellLost=true;s.party.find(u=>u.id==='nell')!.hp=0;remember(s,'nellLost');h.commit('nellLost');go(h,'laststation');}}),true;
    if(f.nellLost){go(h,'laststation');return true;}
   }else if(!f.capitalReleased){h.commit('capitalReleased','capitalReleased');go(h,'capitalquay');return true;}
  }
 }
 if(m==='capitalquay'&&f.capitalReleased&&!f.capitalLandingSeen)return show(h,scenes.landing(s),'capitalLandingSeen');
 if(m==='laststation'){
  if(!f.emptySeatSeen)return show(h,scenes.emptySeat(s),'emptySeatSeen');
  if(f.lightbearerEnding){h.boundary();return true;}
 }
 return false;
}
export function interactCapital(h:StoryHost,id:string):boolean{
 if(!['capitalquay','stillcity','lastpalace','lastmorning','lastshore','crown','laststation'].includes(h.state.location.map))return false;
 const s=h.state,f=s.flags,say=(who:string,text:string)=>h.talk({lines:[SAY(who,text)]});
 const battle=(encounter:string,flag:string,label:string)=>h.talk({lines:[SAY('Petra',encounter==='lightbearer'?'When she closes the shutter, the mantle opens. Keep clear while the light is moving.':encounter==='imperial-vessel'?'Break both supports. The next coronation can rebuild a vacant mounting; watch the crown before it turns.':'Keep the stair behind us clear for the people coming down.')],choices:[{label,action:()=>{h.commit(flag);h.battle(encounter);}},{label:'Rest and prepare first',action:()=>{}}]});
 if(id==='capital-inner'||id==='capital-after'){if(f.capitalReleased)say('Alda','The upper streets are clear. The chart and all the foreign landings are still available.');else go(h,'stillcity');return true;}
 if((id==='capital-crew'||id==='capital-departure')&&f.capitalLandingSeen){
  h.talk({lines:[SAY('Alda','The route through the hollow sun is marked. We can sail when you’re ready, or keep the ship here while you finish your visits.')],choices:[{label:'Prepare the final crossing',action:()=>{f.chapterSixComplete=true;s.boundary=SEVENTH_CHAPTER;remember(s,'sixDeparture');h.save();h.boundary();}},{label:'Stay · visit allies and fit equipment',action:()=>{}}]});return true;
 }
 if(id==='palace-rest'||id==='crown-rest'){
  h.talk({lines:[SAY('Celia','There’s clean water and room to sit. Let me check everyone before we move.')],choices:[{label:'Rest · restore everyone’s HP and focus',action:()=>{restoreParty(s);h.refresh();h.save();h.toast('Your companions have rested.');}},{label:'Buy a bandage · 8 marks',action:()=>{if(!buySupply(s,'bandage'))return h.toast(s.bandages>=999?'The bandage bag is full.':'Not enough marks.');h.save();h.refresh();h.toast('Bandage added.');}},{label:'Keep going',action:()=>{}}]});return true;
 }
 switch(id){
  case 'city-quay':go(h,'capitalquay');break;
  case 'city-palace':if(f.capitalStreetFreed)go(h,'lastpalace');break;
  case 'city-baker':say('The baker',f.capitalStreetFreed?'They’ve wrapped my hands. I’m taking the flour down to the boats; someone can still use it.':'Mind the tray. These are for the procession.');break;
  case 'city-cloth':say(f.nellRecovered?'Nell':'Kit',f.capitalStreetFreed?'The cloth’s still on the step. She left it to help someone down to the quay.':'It falls in exactly the same place. She hasn’t noticed us.');break;
  case 'city-procession':if(!f.capitalProcessionWon)battle('capital-procession','capitalProcessionConfronted','Clear the procession machines');break;
  case 'city-release':
   if(!f.capitalProcessionWon)say('Orrin','We can reach the catch once those machines are clear.');
   else if(!f.capitalStreetFreed)show(h,scenes.released(s),'capitalStreetFreed',()=>h.refresh());break;
  case 'palace-city':go(h,'stillcity','palace');break;
  case 'palace-command':if(!f.capitalCommandWon)h.talk({...scenes.command(s),done:()=>battle('palace-command','capitalCommandConfronted','Break the palace cordon')});break;
  case 'palace-household':say('Celia','The servant asks whether the table needs another place. The woman answers a question about the weather.');break;
  case 'palace-hunters':if(!f.capitalHuntersWon)battle('capital-hunters','capitalHuntersConfronted','Clear the eastern cloister');break;
  case 'palace-locker':if(!f.capitalFocusTaken)h.talk({lines:[SAY('Celia','They left the treatment lenses here when the private rooms took the water. This one will fit my focus.')],done:()=>{receiveItem(s.inventory,'palace-focus');h.commit('capitalFocusTaken','capitalFocusTaken');}});break;
  case 'morning-ansel':say('Ansel','Lantern trimmed? Take your brother before he eats the whole picnic on the platform.');break;
  case 'morning-tomas':
  case 'morning-leave':if(f.capitalMorningSeen)go(h,'lastshore');break;
  case 'morning-cup':say('Nell','He always kept the chipped side for himself. I should have brought him another cup.');break;
  case 'shore-wake':resumeCapital(h);break;
  case 'palace-preparations':{
   if(!f.capitalHallOpened)break;
   if(f.capitalReleased){say('Orrin','The crown supports are down. Alda has the crossing chart at the allied landing.');break;}
   if(f.capitalAssaultCommitted){go(h,'crown');break;}
   if(f.nellRecovered&&!f.capitalMorningLeft){resumeCapital(h);break;}
   const choose=()=>h.talk({lines:[SAY('Petra',f.nellRecovered?'We’ve checked the way out. Once we climb, the vessel will close this stair behind us.':'The river launch can take us back to Iria. If we go up now, Nell will still be bound when the vessel breaks.')],choices:[
    ...(!f.nellRecovered?[{label:'Return to Iria · seek treatment for Nell',action:()=>go(h,'riverhaven')}]:[]),
    {label:f.nellRecovered?'Climb the crown stair':'Proceed with Nell still bound',action:()=>{void(async()=>{
     if(!await h.checkpoint('capital-return'))return;
     f.capitalRiskAccepted=!f.nellRecovered;h.commit('capitalAssaultCommitted','capitalAssaultCommitted');go(h,'crown');
    })();}},
    {label:'Stay · rest and reconsider',action:()=>{}},
   ]});
   if(!f.capitalWarningSeen)show(h,scenes.warning(s),'capitalWarningSeen',choose);else choose();break;
  }
  case 'capital-emperor':if(!f.emperorWon)battle('imperial-vessel','emperorConfronted','Face the Emperor');break;
  case 'capital-lightbearer':if(f.lightbearerSeen&&!f.lightbearerWon)battle('lightbearer','lightbearerConfronted','Face the Lightbearer');break;
  case 'crown-landing':if(f.capitalReleased)go(h,'capitalquay');break;
  case 'last-tomas':say('Tomas','I’ll stay until the train leaves. You can sit here if you want.');break;
  case 'last-kit':say('Kit','I wrote the harbor signals down for her. They’re in the coat pocket.');break;
  case 'last-ending':f.lightbearerEnding=true;remember(s,'lightbearerEnding');h.save();h.boundary();break;
  default:return false;
 }
 return true;
}
