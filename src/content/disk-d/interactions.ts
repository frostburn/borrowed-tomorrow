import { fatherLetter, reply, nightPlan } from '../scenes';
import { SAY, type Dialogue } from '../disk-a/story';
import type { StoryHost } from '../disk-a/interactions';
import { remember, restoreParty } from '../../rules/state';
import { DISK_D } from './story';
import { NORTHGLASS_ARRIVAL, RELAY_HALL_ARRIVAL } from './entrances';

export function interactDiskD(host:StoryHost,id:string){
  const s=host.state,f=s.flags;
  const say=(...lines:Dialogue['lines'])=>host.talk({lines});
  switch(id){
    case 'd-petra':
      if(!f.dLetterRead){host.talk({...fatherLetter(s),done:()=>host.commit('dLetterRead','d-letter')});break;}
      if(f.dRecordRead&&!f.diskDComplete){host.talk({lines:[
        SAY('Petra','Six workers back, return feed disconnected. I’ve checked the red lamp from both ends.'),
        SAY('Petra',f.dHoldRed?'I’m closing for tonight. Paid shift; I won’t dock them for a fault in my board. The parcels can wait until morning.':'Esme takes the first hand-bell watch; I take the second. Only the local siding. Nobody goes near the viaduct.'),
        SAY('Orrin','The parcel number matches. I’m keeping it with the letter.'),
        SAY('Nell',f.dReplySent?'We’ll ask at Brinewick. The parcel cage first; we keep off the passenger ferry.':'We’ll start at Brinewick’s parcel cage. Have you got the counterfoil?'),
        SAY('Orrin','Inside the letter. I’m keeping everything he got through.'),
        SAY('Petra','Brinewick freight ferry. Present that number at the parcel cage; it won’t put anyone on a passenger list. I’ll keep a copy of the fault test here.'),
      ],done:()=>{f.diskDComplete=true;if(f.dHoldRed)f.dWorkersHome=true;s.boundary=DISK_D.next;remember(s,'d-departure');host.refresh();host.save();host.endingMusic();host.boundary();}});break;}
      host.talk({lines:[SAY('Petra',f.diskDComplete?(f.dHoldRed?'The crew’s gone home on paid time. Tonight’s parcels are locked up for the morning.':'Esme has the hand bell. I’ll relieve her after supper. The main line stays red.'):!f.dLineHeld?'The letter’s yours. Hang the independent red lamp before you approach the tram.':!f.dCrewReturned?'The road is protected. Bring Esme and all five colleagues off the tram.':!f.dCircuitRead?'All six are in. Esme has the burnt wire at the relay hall’s insulation bench.':!f.dHoldRed&&!f.dHandBell?'Choose the night plan at the route table. I need to know which services to hold.':!f.dRelayStopped?'The night plan is ready. Earth both returns and stop the keeper; I’ll watch the road.':'The feed is isolated. Read the parcel counterfoil in the shift recorder, then bring it back for my signature.')],choices:[
        {label:'Rest in the dispatch office · free',action:()=>{restoreParty(s);host.refresh();host.save();host.toast('Party HP and focus restored.');}},
        {label:'Back to the works yard',action:()=>host.update()},
      ]});break;
    case 'd-lamp':
      if(f.dLineHeld){say(SAY('The red lamp','The clip holds the workers’ road shut. Its red glass faces the tram; it does not depend on the green repeater.'));break;}
      host.talk({lines:[SAY('Nell','A full oil cup and a sound clip. Orrin, check that the far end sees red.'),SAY('Orrin','Red at both ends. I’ve pinned the clip. No wheels through here until we release it.')],done:()=>host.commit('dLineHeld','d-red')});break;
    case 'd-esme':say(SAY('Esme','There are six of us. The track hounds won’t let us off at the points. Keep the road red; I can get everyone down once they’re clear.'));break;
    case 'd-tram':
      if(f.dCrewReturned){say(SAY('The inspection tram','Six empty places on the deck. Esme left the tool box inside the protected yard.'));break;}
      if(!f.dLetterRead){say(SAY('Nell','Petra’s holding the dispatch shutter. We should show her the collection slip before we start on the tram.'));break;}
      if(!f.dLineHeld){say(SAY('Esme','Put the independent red lamp up first. I can’t bring anyone onto a road that still has a green at the far end.'));break;}
      host.talk({lines:[SAY('Esme','The tram blocks the middle. There’s a clear lane on each side; the hounds can come round either end.'),SAY('Nell','Stay on the deck until I call you. All six of you.')],done:()=>host.battle('d-tram')});break;
    case 'd-esme-hall':
      host.talk({lines:[SAY('Esme',f.dRelayStopped?'The contact’s open. I checked it with my own meter, not the repeater.':f.dCircuitRead?'One of you on each blue earth plate, at the same time. Once the latch drops you can move off and fight.':'That’s the wire I brought in. Meet me at the insulation bench; I want to compare it with the letter.')],choices:[
        {label:'Rest at the workbench · free',action:()=>{restoreParty(s);host.refresh();host.save();host.toast('Party HP and focus restored.');}},
        {label:'Back to the relay hall',action:()=>host.update()},
      ]});break;
    case 'd-circuit':
      if(!f.dCrewReturned){say(SAY('Orrin','The meter’s here. The six people who use it are still on that tram. Bring them in first.'));break;}
      if(f.dCircuitRead){say(SAY('Esme','Both blue earth plates at once. The shield stays down after the latch trips. Then open the keeper’s return contact.'));break;}
      host.talk({lines:[
        SAY('Esme','Look at the burn. Current came back from the green repeater. Your letter describes this exact bridge wire.'),
        SAY('Orrin','He was trying to keep these two returns apart. Someone put them together again.'),
        SAY('Esme','The keeper shields its latch while either return is live. Stand one person on each blue earth plate, together. That trips both sides.'),
        SAY('Nell','Do we have to stay there while it fights?'),
        SAY('Esme','No. Once the latch drops, it stays down. Move off the plates and stop it. I’ll keep the yard clear.'),
        SAY('Orrin','We’ll choose the night plan at the route table first. No surprise green when the feed comes off.'),
      ],done:()=>host.commit('dCircuitRead','d-circuit')});break;
    case 'd-plan':
      if(!f.dCircuitRead){say(SAY('Esme','Check the burnt wire at the insulation bench first. We need to know what we’re isolating.'));break;}
      if(f.dHoldRed||f.dHandBell){say(SAY('Petra',f.dHoldRed?'All signals red. I’ll close for the night and pay the crew for the full shift. Tonight’s parcels will wait.':'Main line red, local siding by hand bell. Esme and I will take turns. The parcels can move; we’ll be here late.'));break;}
      host.talk({...nightPlan(),choices:[
        {label:'Keep all signals red · close tonight',action:()=>host.commit('dHoldRed','d-red-plan')},
        {label:'Work by hand bell · keep local deliveries',action:()=>host.commit('dHandBell','d-bell-plan')},
      ]});break;
    case 'd-relay':
      if(!f.dCircuitRead||(!f.dHoldRed&&!f.dHandBell)){say(SAY('Orrin','Check the return wire, then choose the night plan at the route table. I won’t pull a feed without knowing what the signals will do.'));break;}
      host.talk({lines:[
        SAY('Relay keeper','Return contacts live. Latch protected.'),
        SAY('Orrin','I’ve run the earth leads onto the apron. One on each blue plate. The shield holds until we earth both together.'),
        SAY('Nell','Then we can leave the plates. Keep the lance clear of me when the latch drops.'),
      ],done:()=>host.battle('d-relay')});break;
    case 'd-recorder':
      if(!f.dRelayStopped){say(SAY('Orrin','The recorder shares the live return. We can read it once the keeper’s contact is open.'));break;}
      if(f.dRecordRead){say(SAY('Parcel counterfoil','BRINEWICK · parcel cage 6 · brass drawer key, one tooth filed. Collect against this number. No passenger authority.'));break;}
      host.talk({...reply(),done:()=>{f.dReplySent=true;remember(s,'d-reply');host.commit('dRecordRead','d-record');}});break;
    case 'd-plaque':
      host.talk({lines:[SAY('Calibration order','Return-contact separation test. Engineer: Ada Fenwick. Retain both earth connections during service.'),SAY('Orrin',f.cWorkbookRead?'A.F., signal office. There’s her full name. This order is for the same contacts.':'Ada Fenwick, signal engineer. Write that down beside the contact test; she specified the two earths.')],done:()=>host.commit('dEngineerRead','d-engineer')});break;
    case 'd-to-hall':host.travel(RELAY_HALL_ARRIVAL.map,RELAY_HALL_ARRIVAL.x,RELAY_HALL_ARRIVAL.y);break;
    case 'd-to-yard':host.travel('northglass',48,15);break;
    case 'd-to-larkspur':host.travel('station',31,10);break;
    case 'd-return-service':
      if(f.diskDComplete)host.boundary();else host.travel(NORTHGLASS_ARRIVAL.map,NORTHGLASS_ARRIVAL.x,NORTHGLASS_ARRIVAL.y);break;
    case 'd-ansel':say(SAY('Stationmaster Ansel',f.diskDComplete?'Petra’s fault test arrived. All six off the tram. Keep the letter and parcel number together; the Brinewick collection is yours to make.':'Petra has your letter at Northglass. Mira’s beside Bram, and Bellwether’s fourteen patients still have their attendants.'));break;
  }
}
