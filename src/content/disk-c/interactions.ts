import { SAY, type Dialogue } from '../disk-a/story';
import type { StoryHost } from '../disk-a/interactions';
import { remember, restoreParty } from '../../rules/state';
import { DISK_C } from './story';
import { CINDERBANK_ARRIVAL } from './entrances';

export function interactDiskC(host:StoryHost,id:string){
  const s=host.state,f=s.flags;
  const say=(...lines:Dialogue['lines'])=>host.talk({lines});
  const commit=(flag:string,entry?:string)=>host.commit(flag,entry);
  switch(id){
    case 'c-dena':
      if(f.cTransferred){say(SAY('Dena','The empty carriages came back on the stores run. I’m going back to Bellwether before the next dressing round.'));break;}
      host.talk({lines:[SAY('Dena',!f.cWarmed?'The covered kettle is on the supply table, by the folded stretchers. Ivo needs both hands for the men.':!f.cManifestRefused?'Their hands are warm again. Help Ivo at the carriage door; I’ll take my bag in after the first stretcher.':f.cCrewAccepted?'It opened for my bag this time. I’ll stay inside until the last stretcher is off at Bellwether.':'Ivo and I are going with them. If the register wants a receiving copy, Celia keeps it at Bellwether.')],choices:[
        ...(f.cWarmed?[{label:'Help at the carriage door',action:()=>interactDiskC(host,'c-carriage')}]:[]),
        {label:'Rest beside the stove · free',action:()=>{restoreParty(s);host.refresh();host.save();host.toast('Party HP and focus restored.');}},
        {label:'Back to the loading apron',action:()=>host.update()},
      ]});break;
    case 'c-water':
      if(f.cWarmed){say(SAY('Supply table','The kettle is back on its stove. Dena kept the cloth wrapped round its handle.'));break;}
      host.talk({lines:[
        SAY('The loading apron','Nell carries the covered kettle. Ivo sets down the stretcher and wraps his hands round the empty handle.'),
        SAY('Dena','Thank you. Hold the bottle flat while I fill it. He keeps dropping it when his fingers go numb.'),
        SAY('Nell','We brought blankets. Where do you want them?','nell'),
        SAY('Dena','Across the foot of each stretcher. Then help Ivo at the carriage door.'),
      ],done:()=>commit('cWarmed','c-water')});break;
    case 'c-carriage':
      if(f.cTransferred){say(SAY('The ambulance carriage','Empty stretchers are stacked on the return rack. The receiving slip is clipped where the passenger list used to hang.'));break;}
      if(!f.cWarmed){say(SAY('Dena','Hot water first. I can’t ask him to grip the rail with his hands like that.'));break;}
      if(!f.cManifestRefused){host.talk({lines:[
        SAY('The carriage door','Ivo slides the stretcher over the sill. Dena follows with her bag. The door catches its strap and holds her outside.'),
        SAY('The carriage speaker','Fourteen registered patients. Attendants: zero. Unauthorized boarding refused.'),
        SAY('Dena','My bag is beside his head. Let me reach it.'),
        SAY('Nell','Ivo, bring the stretcher back onto the platform. We’re not sending him without you.','nell'),
        SAY('Orrin','There’s a footpath round the shed. Could we bring them that way?','orrin'),
        SAY('Dena','Six miles of ballast, with stretchers. Two of them can’t sit up. We need this train.'),
        SAY('Nell','Where did you enter your names?','nell'),
        SAY('Dena','The service sheet in the dispatch office. The tickets only had room for patients.'),
      ],done:()=>commit('cManifestRefused','c-refused')});break;}
      if(!f.cCrewAccepted){say(SAY('Nell','The brake stays pinned. We need the bed count and the repair signed into the crew register before Dena can board.','nell'));break;}
      host.talk({lines:[
        SAY('The carriage speaker','Fourteen patients. Four working crew. Receiving copy accepted.'),
        SAY('Dena',f.cTrainHeat?'The pipes are warm. Ivo, take the rear carriage. I’ll ride with the men who need to lie flat.':'Fourteen blanket rolls, fourteen bottles. Ivo, take the rear carriage. We’ll change the bottles at Bellwether.'),
        SAY('Nell','Celia has fourteen beds ready. I’ll stay at this door until she takes the list.','nell'),
        SAY('Orrin','Brake tested. No names crossed out. We can release it when you’re ready.','orrin'),
      ],choices:[
        {label:'Dispatch fourteen patients to Bellwether',action:()=>{
          host.talk({lines:[
            SAY('Bellwether · 2 December, 05:20','Celia meets the first stretcher at the ramp. Dena stays in the carriage until Nell calls for the last one.'),
            SAY('Ivo','Fourteen off. Two bags, one kettle. Dena, you can let go of that clamp now.'),
            SAY('Celia',f.cTrainHeat?'Everyone into the receiving hall. The north ward stays shut tonight; I’ve moved the spare beds beside the stove.':'Seven into each ward. The north pipes are warm; your coupling arrived on the stores handcar.'),
            SAY('Nell','Read the names back against Ivo’s list before we leave.','nell'),
          ],done:()=>{f.cTransferred=true;remember(s,'c-transfer');host.travel('infirmary',32,20);}});
        }},
        {label:'Keep the departure held',action:()=>host.update()},
      ]});break;
    case 'c-dispatch':
      if(!f.cManifestRefused){say(SAY('Dispatch office','The receiving copy is pinned beneath the passenger list. Dena is waiting by the carriage with her bag.'));break;}
      if(!f.cRegisterRead){host.talk({lines:[
        SAY('Working-train instructions','AMBULANCE SERVICE. Keep passenger names unchanged. Enter attendant, orderly, porter, and mechanic in the working-crew register.'),
        SAY('Nell','The crew column’s empty. What does the latch check?','nell'),
        SAY('Orrin',f.bWorksheetRead?'Dad used a separate work book at Rillbridge. This has the same shift numbers. It wants the receiving copy and a repair test.':'A second contact under the lever. It checks this crew column as well as the tickets.','orrin'),
        SAY('Working-train instructions','Before release: receiving bed count, approved heating plan, brake and boiler test. Both ends must sign the same copy.'),
        SAY('Nell','Celia can sign for the beds. The stores handcar goes to her receiving yard.','nell'),
      ],done:()=>commit('cRegisterRead','c-register')});break;}
      if(f.cCrewAccepted){say(SAY('Crew register','Dena, attendant. Ivo, orderly. Nell, porter. Orrin, mechanic. Fourteen passenger names remain on the original sheet.'));break;}
      if(!f.cBedsReserved||!f.cBoilerStopped){say(SAY('Nell',!f.cBedsReserved?'We still need Celia’s receiving signature at Bellwether.':'The bed count is signed. Orrin still needs to test the brake and boiler after the bypass repair.','nell'));break;}
      host.talk({lines:[
        SAY('Crew register','Receiving beds: fourteen. Heat plan approved by Dena. Brake and boiler tested by Orrin. Receiving officer: Celia.'),
        SAY('Nell','Dena, attendant. Ivo, orderly. Put us down as porter and mechanic.','nell'),
        SAY('The dispatch lever','The second contact closes. At the carriage, the latch lifts and stays lifted.'),
        SAY('Dena','Ivo’s inside with my bag. I’d better catch him before he puts it on the wrong rack.'),
      ],done:()=>commit('cCrewAccepted','c-crew')});break;
    case 'c-couplings':
      if(!f.cBedsReserved){say(SAY('Orrin','That’s the only sound coupling I can see. Find out what Bellwether needs before we fight over it.','orrin'));break;}
      host.talk({lines:[
        SAY('Orrin','The hounds have chained the spare coupling to that cart. I can free it once they’re clear.','orrin'),
        SAY('Nell','The stacks leave two firing lanes. Don’t stand behind me when you use the lance.','nell'),
      ],done:()=>host.battle('c-coupling')});break;
    case 'c-toolbox':say(SAY('Orrin',f.cTrainHeat?'The coupling is on the carriage heat pipe. The pressure holds.':f.cWardHeat?'Celia has the coupling. Ivo brought back her test slip.':'Clean threads and a sound seal. Bring it to the steam bypass; we need to choose where it goes.','orrin'));break;
    case 'c-valve':
      if(f.cBoilerStopped){say(SAY('Orrin','The brake hose is clear. Bypass shut, relief valve seated. I signed the test copy for the dispatch office.','orrin'));break;}
      if(!f.cCouplingRecovered){say(SAY('Orrin','There’s one sound coupling on the supply cart. Reserve the receiving beds, then we can recover it.','orrin'));break;}
      if(!f.cTrainHeat&&!f.cWardHeat){host.talk({lines:[
        SAY('Orrin','One coupling. Fit it here and the train stays warm, but Bellwether’s north ward stays shut tonight.','orrin'),
        SAY('Dena','Celia can fit all fourteen beside the receiving-hall stove. It’ll be crowded. We can manage.'),
        SAY('Nell','Or send the coupling to her?','nell'),
        SAY('Dena','The north ward opens. We travel with the Larkspur blankets and fresh hot-water bottles. Ivo and I stay in the carriages. Either plan is safe if we both go.'),
        SAY('Orrin','The keeper’s relief gear is stuck. The bypass changes which vent lanes discharge while we stop it. Anyone on an orange hex loses six HP at round end. Keep clear before the last turn.','orrin'),
      ],choices:[
        {label:'Heat the train · one crowded receiving hall',action:()=>commit('cTrainHeat','c-train-heat')},
        {label:'Heat the north ward · travel under blankets',action:()=>commit('cWardHeat','c-ward-heat')},
      ]});break;}
      host.talk({lines:[
        SAY('The bypass',f.cTrainHeat?'Orrin fits the coupling to the carriage pipe. The outer vent lanes begin to hiss.':'Ivo takes the coupling to Bellwether on the stores handcar and returns with Celia’s test slip. The central bypass lane begins to hiss.'),
        SAY('Orrin','The keeper can still lift the relief lever. Stop it, and I can close the vents and test the brake.','orrin'),
      ],done:()=>host.battle('c-boiler')});break;
    case 'c-to-infirmary':
      if(!f.cRegisterRead){say(SAY('Nell','Read the dispatch instructions first. We need to know what to ask the receiving officer.','nell'));break;}
      host.travel('infirmary',16,27);break;
    case 'c-to-siding':host.travel('cinderbank',47,26);break;
    case 'c-to-larkspur':host.travel('station',31,10);break;
    case 'c-celia':
      if(f.cTransferred){say(SAY('Celia',f.cTrainHeat?'Fourteen men in the receiving hall. Dena has the window beds; I’ve put a screen round the stove.':'Seven men in each ward. Dena has enough room to get between the beds now.'));break;}
      if(f.cBedsReserved){host.talk({lines:[SAY('Celia','The beds are reserved. Take the signed copy back to Cinderbank. You can rest by our stove before you go.')],choices:[
        {label:'Rest by the stove · free',action:()=>{restoreParty(s);host.refresh();host.save();host.toast('Party HP and focus restored.');}},
        {label:'Back to the receiving yard',action:()=>host.update()},
      ]});break;}
      host.talk({lines:[
        SAY('Celia','Fourteen? I was told eight. Leave the list on the desk; I’ll find six more beds.'),
        SAY('Nell','They’re coming with two attendants. The register won’t admit the staff until you sign.','nell'),
        SAY('Celia','Then I’ll sign for fourteen. We have room in the hall, but the north ward’s steam coupling split this morning.'),
        SAY('Orrin','The same size as the ambulance pipe. There’s a spare on the supply cart at Cinderbank.','orrin'),
        SAY('Celia','Only one? Heat the train or open my second ward. Dena can decide whether blankets will do for the journey.'),
        SAY('Nell','I’ll count the beds at the ramp before we take the copy.','nell'),
      ],done:()=>commit('cCeliaMet')});break;
    case 'c-beds':
      if(f.cBedsReserved){say(SAY('Receiving hall','Fourteen numbered bed cards lie on the admission desk. Celia’s signature crosses the bottom of the copy.'));break;}
      if(!f.cCeliaMet){say(SAY('Nell','Find Celia by the admissions porch first. She needs the patient count.','nell'));break;}
      host.talk({lines:[
        SAY('The receiving hall','Nell counts eight beds beside the stove and six folding cots brought down the ramp.'),
        SAY('Celia','Fourteen places, whichever heating plan you choose. Tell Dena there’s someone here to take the other end of the stretcher.'),
      ],done:()=>commit('cBedsReserved','c-beds')});break;
    case 'c-ward':
      say(SAY('North ward',f.cWardHeat&&f.cTransferred?'Warm pipes run beneath the windows. Seven occupied beds are screened from the receiving yard.':f.cTrainHeat?'The north ward is closed for the night. All fourteen beds are gathered beside the receiving-hall stove.':'The north ward is cold. Its split steam coupling lies on the admissions desk.'));break;
    case 'c-patients':
      if(f.cReceiptSigned){say(SAY('Ivo','Fourteen on the list, fourteen in their beds. I counted the kettle twice, but Celia crossed that out.'));break;}
      host.talk({lines:[
        SAY('Ivo','Read them to me. I’ll point to the beds. Start with the man who kept dropping his bottle.'),
        SAY('The receiving list','Fourteen names, fourteen replies. Celia signs the receiving copy without changing the passenger sheet.'),
        SAY('Dena','He’s asleep now. Leave his bottle where he can reach it when he wakes.'),
        SAY('Nell','Ansel will want this copy. He’s getting used to unexpected arrivals.','nell'),
      ],done:()=>commit('cReceiptSigned','c-receipt')});break;
    case 'c-workbook':
      if(!f.cRegisterRead){say(SAY('Delivery book','The book is clipped shut beneath the working-train instructions.'));break;}
      if(f.cWorkbookRead){say(SAY('Delivery book','Crew entries: send the carbon copy to Northglass signal works. Revised A.F., signal office.'));break;}
      host.talk({lines:[
        SAY('Delivery book','Working-train orders. Revised A.F., signal office. Send each crew entry’s carbon copy to Northglass signal works.'),
        SAY('Orrin',f.bWorksheetRead?'These shifts follow the Rillbridge sheet. Different passenger dates, same running work count.':'The work count keeps increasing when the passenger dates change. Someone checks these copies.','orrin'),
        SAY('Nell','Only initials. Keep the carbon with our names on it; we may need to ask the signal office.','nell'),
      ],done:()=>commit('cWorkbookRead','c-workbook')});break;
    case 'c-tilda':say(SAY('Tilda',f.bOrchardChannel?'Iona’s flour arrived. Credit means I’ll be baking buns for the station until spring, but we can eat this week.':'Bram brought the first apple crates over. Iona will take fruit against flour. I’m keeping one crate for the children.'),SAY('Nell','Mira and Bram?','nell'),SAY('Tilda','Still together. He’s carrying the crates; she’s telling him where to put his feet.'));break;
    case 'c-ansel':
      if(!f.cReceiptSigned){say(SAY('Stationmaster Ansel','Tilda has her flour. You keep the blankets until Bellwether signs for the patients.','master'));break;}
      if(f.cLarkspurReported){say(SAY('Stationmaster Ansel','Bellwether’s receipt is filed. There’s a collection slip beside the train, addressed to Orrin.','master'));break;}
      host.talk({lines:[
        SAY('Stationmaster Ansel',f.promisedHome?'Fourteen this time, with somewhere to sleep. I’m making a second folder for that promise of yours.':f.askedForTruth?'A crew register and a receiving signature. That tells us more than the ministry’s telegram.':'Fourteen received at Bellwether. Both attendants accounted for. Give me the hospital copy.','master'),
        SAY('Nell',f.cTrainHeat?'The train was warm. They’re sharing the receiving hall until the north ward can be repaired.':'They went under our blankets. The spare coupling opened Bellwether’s second ward.','nell'),
        SAY('Tilda',f.bOrchardChannel?'The flour’s here. I’ve signed the credit book. There’ll be breakfast for everyone before I start paying it off.':'We’ve brought the first apples back. Iona’s taking them against flour. There’ll be breakfast for everyone.'),
        SAY('Mira','Dad’s saving the blue door hinge. He says he’ll want it when we go back.','mira'),
        SAY('Stationmaster Ansel','There’s something for Orrin beside the train. It arrived with the carbon copy of your crew sheet.','master'),
      ],done:()=>commit('cLarkspurReported','c-coda')});break;
    case 'c-return-service':
      if(f.diskCComplete){host.boundary();break;}
      if(!f.cLarkspurReported){host.travel(CINDERBANK_ARRIVAL.map,CINDERBANK_ARRIVAL.x,CINDERBANK_ARRIVAL.y);break;}
      host.talk({lines:[
        SAY('Collection slip','REGISTERED LETTER · Orrin, care of Larkspur repairs. Held at Northglass signal works. Sender: blank. Present working-crew copy for collection.'),
        SAY('Orrin','The bag was sealed three maintenance shifts before we put our names in this book.','orrin'),
        SAY('Nell','I have the signed copy. We can ask who brought it.','nell'),
        SAY('Orrin','Let me fetch my coat this time. I put it down at Bellwether and nearly left without it.','orrin'),
      ],done:()=>{f.diskCComplete=true;s.boundary=DISK_C.next;remember(s,'c-departure');host.refresh();host.save();host.endingMusic();host.boundary();}});break;
  }
}
