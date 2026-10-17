import { SAY, type Dialogue } from '../disk-a/story';
import type { StoryHost } from '../disk-a/interactions';
import { remember, restoreParty } from '../../rules/state';
import { DISK_B } from './story';

export function interactDiskB(host:StoryHost,id:string){
  const s=host.state,f=s.flags;
  const say=(...lines:Dialogue['lines'])=>host.talk({lines});
  const commit=(flag:string,entry?:string)=>host.commit(flag,entry);
  switch(id){
    case 'b-calendar':say(SAY('Festival notice','RILLBRIDGE HARVEST FAIR · 14 OCTOBER. Stallholders: set out your tables on the afternoon of the 13th.'),SAY('Nell',f.bNeighborsReady?'It’s the fourteenth now. Tilda took down the festival stalls during the night.':'Today is the thirteenth here. We have the day before the flood.','nell'));break;
    case 'b-bram':
      if(f.bFatherFound){say(SAY('Bram',f.bNeighborsReady?'Elspeth is strapped in. Mira is counting the carts with me. Come for us when the crossing is ready.':'I’m staying with Mira. Bring the maintenance trolley to the schoolhouse; I’ll meet you there.'));break;}
      host.talk({lines:[
        SAY('Bram','Mira says I left her on a train. I haven’t been to the platform today.'),
        SAY('Nell','We found her at Larkspur. There’s a flood memorial there with your town’s name on it.','nell'),
        SAY('Bram','I can’t make that fit. But I know what she looks like when she’s frightened.'),
        SAY('Mira','Please don’t go to ask anyone about delays.','mira'),
        SAY('Bram','You and I stay together. Elspeth next door can’t walk the bridge steps. Help me bring her, and we’ll go.'),
        SAY('Orrin','A flat trolley with a brake would do it. I saw one on the sluice rails. I’ll check the water while I’m up there.','orrin'),
      ],done:()=>commit('bFatherFound','b-family')});break;
    case 'b-baker':
      if(f.bFloodEvidence&&!f.bTownWarned){host.talk({lines:[
        SAY('Tilda','That gauge plate was bolted above the high-water line. Why is the back wet?'),
        SAY('Orrin','The overflow is blocked. The plate came away in my hand. There’s a crack behind it.','orrin'),
        SAY('Tilda','I paid for flour, fiddlers, and thirty borrowed tables. All right. The tables can carry people’s things.'),
        SAY('Nell','Ask Bram to make a list. We need to know who’s still in the houses.','nell'),
        SAY('Tilda','I’ll start with the lower street. Try the carriage; it would take Elspeth’s chair without a lift.'),
      ],done:()=>commit('bTownWarned','b-warning')});break;}
      host.talk({lines:[SAY('Tilda',f.bTownWarned?'Bread for the crossing is wrapped. Sit down if you need a minute.':'Mind the flour. I’ve enough dough for a festival and one oven that heats properly.')],choices:[
        {label:'Rest in the bakery · free',action:()=>{restoreParty(s);host.refresh();host.save();host.toast('Party HP and focus restored.');}},
        {label:'Buy a bandage · 8 marks',action:()=>{if(s.coins<8||s.bandages>=999){host.toast('You need 8 marks and room for another bandage.');return;}s.coins-=8;s.bandages++;host.update();host.save();host.toast('One bandage wrapped and packed.');}},
        {label:'Back to the square',action:()=>host.update()},
      ]});break;
    case 'b-to-sluice':
      if(!f.bFatherFound)say(SAY('Mira','Dad’s by the blue house. Please, can we go there first?','mira'));
      else host.travel('sluice',33,35);break;
    case 'b-to-town':host.travel('rillbridge',32,13);break;
    case 'b-to-tunnel':host.travel('tunnel',38,13);break;
    case 'b-overflow':host.talk({lines:[
      SAY('Orrin','The overflow mouth is packed with timber. Those machines keep putting back every piece the water pulls loose.','orrin'),
      SAY('Nell','We need the gauge behind them. Keep to the dry stones where you can.','nell'),
    ],done:()=>host.battle('b-overflow')});break;
    case 'b-gauge':
      if(f.bFloodEvidence){say(SAY('Orrin','The upstream mark is higher again. Tilda needs to see that plate.','orrin'));break;}
      host.talk({lines:[
        SAY('Orrin','The bolts are sheared. And this crack runs under the whole wall.','orrin'),
        SAY('Nell','Can we lower the water?','nell'),
        SAY('Orrin','Enough to get people across. We can’t repair the wall with what’s here. Take the plate to the bakery; they’ll recognize it.','orrin'),
      ],done:()=>commit('bFloodEvidence','b-evidence')});break;
    case 'b-carriage':
      if(!f.bTownWarned){say(SAY('Bram','Tilda has the lower street listening to her. Show her what you found before we move anyone.'));break;}
      if(f.bRegistryRefused){say(SAY('Mira','I’m not getting in without Dad.','mira'),SAY('Nell','You won’t have to. We’ll use the foot crossing.','nell'));break;}
      host.talk({lines:[
        SAY('The carriage','Mira holds up her ticket. The latch lifts. Bram puts one foot on the step; the door shuts against his boot.'),
        SAY('Bram','My ticket is in the suitcase. Same train, same compartment.'),
        SAY('The carriage speaker','Registered passenger: Mira. Additional passenger refused. No substitutions.'),
        SAY('Nell','Then leave the door shut. Bram, keep her with you. We came through the maintenance path on foot.','nell'),
        SAY('Orrin','There’s a level crossing below the sluice. I can get Elspeth’s trolley across if we stop the keeper closing it.','orrin'),
      ],done:()=>commit('bRegistryRefused','b-registry')});break;
    case 'b-trolley':
      if(f.bTrolleyFreed){say(SAY('Orrin','The trolley is at the schoolhouse. I greased the axle and checked both brake shoes.','orrin'));break;}
      if(!f.bRegistryRefused){say(SAY('Orrin','Before we haul this back, try the carriage door with Bram. It may save Elspeth the steps.','orrin'));break;}
      host.talk({lines:[
        SAY('Orrin','The brake still grips. The hounds have chained the trolley to their charging rail.','orrin'),
        SAY('Nell','Cut the chain after we draw them away. Keep a lane between us for your steam lance.','nell'),
      ],done:()=>host.battle('b-trolley')});break;
    case 'b-school-gate':
      if(f.bSchoolGateOpen){say(SAY('Schoolhouse gate','The gate is fastened back against the fence, clear of the trolley’s wheels.'));break;}
      host.talk({lines:[SAY('Nell','The latch lifts. I’ll fasten the gate back so the trolley can pass.','nell')],done:()=>commit('bSchoolGateOpen')});break;
    case 'b-schoolhouse':
      if(!f.bSchoolGateOpen){host.toast('Open the schoolhouse gate first.');break;}
      if(f.bEvacuated){say(SAY('The schoolhouse','The windows are shuttered. Elspeth took the class register and left the door on its latch.'));break;}
      if(f.bNeighborsReady){say(SAY('Elspeth','Bram has the list. I’ve counted them too. He missed the baby the first time.'));break;}
      if(!f.bTrolleyFreed){say(SAY('Elspeth','I can get from the bed to my chair. The bridge steps are the problem. Bram says you found a trolley.'));break;}
      host.talk({lines:[
        SAY('Bram','Chair lashed to the trolley. Blankets under her feet. Have I missed anything?'),
        SAY('Elspeth','The class register, on the shelf. And stop calling me “her” when I’m sitting here.'),
        SAY('Mira','I put it under your blanket. The blue book.','mira'),
        SAY('Elspeth','That’s the one. You may pull, Bram.'),
        SAY('Rillbridge · before dawn, 14 October','The last carts reach the bridge after a night of packing. Tilda checks the empty houses and joins Bram at the trolley.'),
        SAY('Nell','Wait at the town end of the bridge. We’ll open the crossing and come back for you.','nell'),
      ],done:()=>commit('bNeighborsReady','b-rescue')});break;
    case 'b-worksheet':
      if(f.bWorksheetRead){say(SAY('Work sheet','Foot crossing: keep unlocked between services. Passenger clocks are not to be used for maintenance shifts.'));break;}
      host.talk({lines:[
        SAY('Work sheet','Sump cleared after service 412. Sump cleared after service 413. Both passenger arrivals are dated 14 October. The maintenance shifts are a week apart.'),
        SAY('Orrin',f.scrapCleared?'The same hand as the wage envelope. My father wrote this.':'That hooked letter at the end. My father signed his tools that way.','orrin'),
        SAY('Nell','What’s the line under his name?','nell'),
        SAY('Orrin','“Keep the foot crossing unlocked.” He’s underlined it twice.','orrin'),
      ],done:()=>commit('bWorksheetRead','b-maintenance')});break;
    case 'b-wheel':
      if(f.bOrchardChannel||f.bMillraceChannel){say(SAY('Orrin',f.bOrchardChannel?'The orchard channel is open. The control apron is dry.':'The millrace is taking the overflow. The orchard bank is dry, but the control apron is flooded.','orrin'));break;}
      if(!f.bNeighborsReady){say(SAY('Nell','Get Elspeth onto the trolley first. We need everyone ready before we release the water.','nell'));break;}
      host.talk({lines:[
        SAY('Orrin','Two outlets. The orchard channel drains this apron. We get a dry approach to the keeper, but the fruit trees go under.','orrin'),
        SAY('Nell','And the old millrace?','nell'),
        SAY('Orrin','The orchard stays dry, but the water backs up here. We’ll have to wade to reach the keeper.','orrin'),
        SAY('Nell','Can Bram still get the trolley across?','nell'),
        SAY('Orrin','Yes. Either outlet keeps the foot crossing above water.','orrin'),
      ],choices:[
        {label:'Open the orchard channel · flood the trees',action:()=>commit('bOrchardChannel','b-orchard')},
        {label:'Open the millrace · wade to the keeper',action:()=>commit('bMillraceChannel','b-millrace')},
      ]});break;
    case 'b-keeper':
      if(!f.bOrchardChannel&&!f.bMillraceChannel){say(SAY('Orrin','The keeper can close the crossing from here. Set the outfall wheel first; we need to control where the water goes.','orrin'));break;}
      host.talk({lines:[
        SAY('Sluice keeper','Crossing closed for scheduled inundation.'),
        SAY('Nell','There are people on the other side. Open it.','nell'),
        SAY('Sluice keeper','Crossing closed for scheduled inundation.'),
        SAY('Orrin','The control rods go through its furnace housing. Stop it there and I can lower the crossing by hand.','orrin'),
      ],done:()=>host.battle('b-keeper')});break;
    case 'b-crossing':
      if(f.bEvacuated){say(SAY('The bridge',f.bOrchardChannel?'The lower quay is flooded. Farther upstream, the orchard stands in brown water. The foot crossing remains above it.':'The lower quay is flooded. Water churns down the old millrace; the orchard bank is still dry. The foot crossing remains open.'));break;}
      if(!f.bKeeperStopped||!f.bNeighborsReady){say(SAY('Bram','We’ll wait on this side. Come back when the keeper is stopped and the level crossing is open.'));break;}
      host.talk({lines:[
        SAY('Bram','Thirty-one names. Elspeth, would you count them off while I pull?'),
        SAY('Elspeth','I have been counting children through doors for forty years. Keep your eyes on the wheels.'),
        SAY('The crossing','Orrin holds the gate while Nell guides the last cart. The river comes over the lower quay behind them. Ahead, Larkspur’s goods-yard bell begins to ring.'),
        SAY('Mira','Dad? Still here?','mira'),
        SAY('Bram','Still here. I’m the one pulling your suitcase.'),
      ],done:()=>{f.bEvacuated=true;remember(s,'b-evacuation');host.travel('station',21,19);}});break;
    case 'b-ansel':
      if(f.bLarkspurReceived){say(SAY('Stationmaster Ansel','The waiting room is full. Nobody has vanished. I’ve sent a clerk to buy more blankets.','master'));break;}
      host.talk({lines:[
        SAY('Stationmaster Ansel',f.promisedHome?'You promised to bring them home. I’d have put the kettle on sooner if you’d mentioned there were thirty-one.':f.askedForTruth?'You wanted to understand the line. I see you brought witnesses.':'I counted thirty-one people coming out of the goods yard. Iona is opening the waiting room.','master'),
        SAY('Nell','Mira’s father is with her. Elspeth needs a bed she can reach without steps.','nell'),
        SAY('Stationmaster Ansel','My office has one. Give me the list.' ,'master'),
        SAY('Tilda',f.bOrchardChannel?'We lost the orchard. When people have slept, I’ll ask about flour on credit.':'The orchard bank held. When people have slept, I want to go back and see what we can bring over.'),
        SAY('Later · Larkspur','The station clock passes midnight. Bram is still asleep beside Mira. Nell checks the names once more and puts the list in Ansel’s drawer.'),
      ],done:()=>commit('bLarkspurReceived','b-coda')});break;
    case 'b-elspeth-larkspur':say(SAY('Elspeth','The register is dry. Ansel found me a bed without steps. Please leave room for the chair when you stack those blankets.'));break;
    case 'b-family-larkspur':say(SAY('Mira','Dad put the suitcase under his chair. I can see both his shoes.','mira'),SAY('Bram','She won’t let me fetch a cup of tea. I can wait.'));break;
    case 'b-dispatch':
      if(!f.bLarkspurReceived){say(SAY('Nell','Ansel needs the residents’ list first.','nell'));break;}
      if(f.diskBComplete){host.boundary();break;}
      host.talk({lines:[
        SAY('The dispatch','CINDERBANK SIDING · Ambulance train, departure before dawn. Two carriages of wounded soldiers. Medical staff: none listed.'),
        SAY('Orrin','This came through the same relay. It has the next service number.','orrin'),
        SAY('Nell','Leave Mira with Bram. I’ll get our coats.','nell'),
      ],done:()=>{f.diskBComplete=true;s.boundary=DISK_B.next;remember(s,'b-departure');host.refresh();host.save();host.endingMusic();host.boundary();}});break;
  }
}
