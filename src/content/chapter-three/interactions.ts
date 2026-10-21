import { buySupply } from '../../rules/supplies';
import { receiveItem } from '../../rules/inventory';
import { FOURTH_CHAPTER,recruit,remember,restoreParty,type MapId } from '../../rules/state';
import { SAY } from '../dialogue';
import { arrival } from '../maps';
import type { StoryHost } from '../chapter-one/interactions';
import * as scenes from './scenes';
export function resumeChapterThree(h:StoryHost){
  const s=h.state,f=s.flags;
  if(!f.capitalSeen)h.talk({...scenes.arrival(),done:()=>h.commit('capitalSeen','capital')});
  else if(f.capitalGateWon&&!f.petraJoined)h.talk({...scenes.defection(),done:()=>{recruit(s,'petra');receiveItem(s.inventory,'saber-hilt');remember(s,'defection');h.refresh();h.save();h.toast('Petra joined · balanced saber hilt added to the bag. Equipment selects active fighters.');}});
  else if(s.location.map==='relayhall'&&!f.worksSeen)h.talk({...scenes.gallery(),done:()=>{h.commit('worksSeen');h.battle('works-warden');}});
  else if(s.location.map==='conduit'&&!f.conduitSeen)h.talk({...scenes.heart(),done:()=>h.commit('conduitSeen','heart')});
}
export function interactChapterThree(h:StoryHost,id:string){
  const s=h.state,f=s.flags;
  const travel=(map:MapId,name:string)=>{const p=arrival(map,name);h.travel(map,p.x,p.y);};
  const say=(who:string,text:string)=>h.talk({lines:[SAY(who,text)]});
  const rest=()=>h.talk({lines:[SAY(s.location.map==='relayhall'?'Maintenance bench':'The medical train',s.location.map==='relayhall'?'Tomas left a flask and the ward’s field supplies on the bench.':'The ward staff have hot water and field supplies. Orrin’s engine is under steam.')],choices:[
    {label:'Rest · restore everyone’s HP and focus',action:()=>{restoreParty(s);h.refresh();h.save();h.toast('Everyone restored.');}},
    {label:'Buy a field bandage · 8 marks',action:()=>{if(buySupply(s,'bandage')){h.refresh();h.save();h.toast('Bandage added.');}else h.toast('You need 8 marks and room for a bandage.');}},
    {label:'Keep moving',action:()=>{}},
  ]});
  switch(id){
    case 'capital-petra':
      if(f.capitalGateWon){resumeChapterThree(h);return;}
      if(f.capitalConfronted)return h.battle('capital-arrest');
      h.talk({...scenes.refusal(),done:()=>{h.commit('capitalConfronted');h.battle('capital-arrest');}});return;
    case 'capital-engine':rest();return;
    case 'capital-cache':
      if(f.capitalCache)return say('Orrin','Empty. The baffled nozzle is in our equipment bag.');
      h.talk({lines:[SAY('Orrin','A baffled pressure nozzle. Quicker valve return than mine. That’ll fit my lance.')],done:()=>{receiveItem(s.inventory,'baffled-nozzle');h.commit('capitalCache');h.toast('Baffled pressure nozzle added to the bag · fits Orrin.');}});return;
    case 'capital-works':
      if(!f.petraJoined)return h.toast('The custody machines still hold the square.');
      travel('relayhall','from-siding');return;
    case 'works-warden':h.battle('works-warden');return;
    case 'works-tomas':
      if(f.tomasRescued)return say('Tomas','My bypass will hold. Close the feeds below. I’ll wait with the patients at Orrin’s engine.');
      h.talk({...scenes.rescue(),done:()=>{restoreParty(s);s.location=arrival('relayhall','after-rescue');h.commit('tomasRescued','reunion');}});return;
    case 'works-locker':
      if(f.palaceStoresWon)return say('Kit','That sight mechanism’s in the bag. The rest is packing straw.');
      h.talk({lines:[SAY('Kit','There’s a ratchet sight in there that fits my crossbow. The lock is wired to a sentinel and a hound.')],choices:[
        {label:'Open the stores · fight the lock patrol',action:()=>h.battle('palace-stores')},
        {label:'Leave the stores sealed',action:()=>{}},
      ]});return;
    case 'works-rest':rest();return;
    case 'works-plan':
      if(f.intakePlanned)return say('Orrin',f.pressureRoute?'Pressure route it is. Keep clear of the orange outlets. The stairs are on the west side.':'We’ll cut the crystal feeds. Occupy both blue earth plates together to release the regulator’s shield. The stairs are on the west side.');
      h.talk({lines:[SAY('Orrin','Tomas has opened two ways to the intake console. Cut the crystal feeds and we’ll face a shielded regulator: stand on both blue plates to release it.'),SAY('Petra','Or take the pressure walk. No shield, but two crows and live steam outlets. Either way, the console closes the feeds.')],choices:[
        {label:'Cut the crystal feeds · two earth plates',action:()=>{f.pressureRoute=false;h.commit('intakePlanned','intake');}},
        {label:'Take the pressure walk · crows and vents',action:()=>{f.pressureRoute=true;h.commit('intakePlanned','intake');}},
        {label:'Prepare our equipment first',action:()=>{}},
      ]});return;
    case 'works-depths':if(!f.intakePlanned)return h.toast('Choose an intake approach at the control table.');travel('conduit','from-gallery');return;
    case 'works-siding':travel('northglass','from-works');return;
    case 'heart-gallery':travel('relayhall','from-depths');return;
    case 'heart-regulator':h.battle(f.pressureRoute?'heart-pressure':'heart-feeds');return;
    case 'heart-release':
      if(!f.conduitGuardWon)return;
      h.talk({...scenes.rupture(),done:()=>{f.extractionStopped=true;f.emperorMerged=true;restoreParty(s);s.location=arrival('northglass','after-rupture');h.commit('emperorMerged','rupture');}});return;
    case 'capital-tomas':say('Tomas',f.emperorMerged?'The patients are aboard. I saved you a place in the cab. Come on.':'I’m safe here with the patients. My bypass is still holding. Close the feeds, then we’ll leave together.');return;
    case 'capital-departure':
      if(!f.emperorMerged)return;
      if(f.chapterThreeComplete)return h.boundary();
      h.talk({...scenes.departure(),done:()=>{s.location=arrival('northglass','departure');f.chapterThreeComplete=true;s.boundary=FOURTH_CHAPTER;remember(s,'brokenDeparture');h.refresh();h.save();h.endingMusic();h.boundary();}});return;
  }
}
