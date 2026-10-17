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
      if(!f.dLetterRead){host.talk({lines:[
        SAY('Petra','Working crew: Nell, porter; Orrin, mechanic. The signatures match. Here’s your bag. The seal hasn’t been broken.'),
        SAY('Orrin',f.bWorksheetRead?'The same hand as the Rillbridge sheet. This one’s addressed to me.':f.scrapCleared?'The same hand as the wage envelope. There’s a letter inside.':'There’s my name. He’s put “care of Larkspur repairs” under it.'),
        SAY('The letter','Orrin—They told me the viaduct had fallen while I was still under it. I heard the timbers go. At shift change I was back in the lamp room, with the burn still on my sleeve.'),
        SAY('The letter','I asked for a train home. It would take my ticket, but not my tools. I stayed to hold the return contact open. I don’t know how long that counts for at home.'),
        SAY('Orrin','They brought his coat back from the viaduct. I couldn’t read yet. He never came home after that.'),
        SAY('The letter','Don’t bridge the two returns at Northglass. The green repeater feeds the workers’ road backwards. Earth both sides before you open the contact.'),
        SAY('The letter','I left your mother’s brass key in the Brinewick parcel cage. I should have put it in your hand. The number is on the works counterfoil. Dad.'),
        SAY('Orrin','Her sewing-drawer key. One tooth filed down. She thought she’d lost it.'),
        SAY('Nell','Keep the letter in your coat. We can check the return wire with Esme once the crew is off that tram.'),
        SAY('Petra','Hang the red lamp from the rack on the workers’ road first. Its clip shuts the road without using that repeater. Then you can approach the tram.'),
      ],done:()=>host.commit('dLetterRead','d-letter')});break;}
      if(f.dRecordRead&&!f.diskDComplete){host.talk({lines:[
        SAY('Petra','Six workers back, return feed disconnected. I’ve checked the red lamp from both ends.'),
        SAY('Petra',f.dHoldRed?'I’m closing for tonight. Paid shift; I won’t dock them for a fault in my board. The parcels can wait until morning.':'Esme takes the first hand-bell watch; I take the second. Only the local siding. Nobody goes near the viaduct.'),
        SAY('Orrin','The parcel number matches. I can read this much. I’m not sure about the rest yet.'),
        SAY('Nell','We’ll start with the thing he left for you. Have you got the counterfoil?'),
        SAY('Orrin','Inside the letter. I’m keeping both.'),
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
      host.talk({lines:[
        SAY('Petra','With the feed off, I can close the works for tonight. The crew keeps its pay; tonight’s parcels wait until morning.'),
        SAY('Esme','Or we can work the local siding by hand bell. I’ll take one watch if you take the other. That gets the parcels away.'),
        SAY('Petra','It keeps both of us here late. The main line stays red either way. No one tests the viaduct tonight.'),
      ],choices:[
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
      host.talk({lines:[
        SAY('Shift recorder','Green bag sealed: 783. Ambulance crew copy received: 786. Earlier parcel, Brinewick cage 6: brass drawer key, one tooth filed. Collected from maintenance lamp room.'),
        SAY('Orrin','Three shifts before our names went in. The parcel’s earlier still. These are the works’ entries, not his handwriting.'),
        SAY('Nell','So the letter and the parcel both passed through here. We have the number now.'),
        SAY('Orrin','I want to open it myself. Let’s get Petra’s signature before we leave.'),
      ],done:()=>host.commit('dRecordRead','d-record')});break;
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
