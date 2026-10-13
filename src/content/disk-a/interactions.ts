import { CHAPTER, SAY, type Dialogue } from './story';
import { recruitOrrin, remember, restoreParty, type GameState, type MapId } from '../../rules/state';

export interface StoryHost {
  state: GameState;
  talk(dialogue: Dialogue): void;
  commit(flag: string, entry?: string): void;
  refresh(): void;
  save(): void;
  update(): void;
  travel(map: MapId, x: number, y: number): void;
  battle(id: string): void;
  shop(): void;
  boundary(): void;
  toast(message: string): void;
  endingMusic(): void;
}

export function interactDiskA(host: StoryHost, id: string) {
    const s=host.state;
    switch(id) {
      case 'mira':
        if(s.flags.metMira)host.talk({lines:[SAY('Mira','I’ll wait by the train. Dad said that if we get separated, we should stay somewhere easy to find.','mira')]});
        else host.talk({lines:[
          SAY('Mira','He stepped off to ask about the delay. Then the train moved. He still has my suitcase.','mira'),
          SAY('Nell','What station did you leave from?','nell'),
          SAY('Mira','Rillbridge. We’ve only been travelling twenty minutes. Look, I kept my ticket flat.','mira'),
          SAY('Nell','The date is forty years old. The punch mark is still damp.','nell'),
        ],done:()=>host.commit('metMira','mira')});break;
      case 'orrin':
        if(!s.flags.metMira)host.talk({lines:[SAY('Orrin','That engine’s been scrapped longer than you’ve been alive. Ask the little passenger what she remembers. I’ll look at the wheels.','orrin')]});
        else host.talk({lines:[
          SAY('Orrin','Feel this axle. Still warm. Fresh oil. Somebody has been running this thing.','orrin'),
          SAY('Nell','The girl says she left Rillbridge twenty minutes ago.','nell'),
          SAY('Orrin','Then we start where the line was closed. The old signal yard, west of the square. I used to go there with my father.','orrin'),
          SAY('Nell','Shouldn’t we tell somebody first?','nell'),
          SAY('Orrin','We can tell Mara on the way. She’ll sell you a bandage before she asks why you need it.','orrin'),
          SAY('Nell','Mira, stay close to us. We’ll find where your train came from.','nell'),
          SAY('Mira','Can I hold the lantern when we get to the dark part?','mira'),
          SAY('Nell','The safe side of it. Yes.','nell'),
        ],done:()=>{recruitOrrin(s);remember(s,'orrin');host.refresh();host.save();}});break;
      case 'master':host.talk({lines:[
        SAY('Stationmaster Vale','The ministry wants the engine impounded. An unscheduled train is an administrative problem, apparently.','master'),
        SAY('Nell','And the passengers?','nell'),
        SAY('Stationmaster Vale','That part of the telegram was very short. Bring them home, Nell. If there is a home to bring them to.','master'),
      ],choices:[{label:'I’ll bring them home.',action:()=>{s.flags.promisedHome=true;remember(s,'promise');host.update();host.save();}},{label:'First I need to understand the line.',action:()=>{s.flags.askedForTruth=true;host.update();host.save();}}]});break;
      case 'clerk':host.shop();break;
      case 'notice':host.talk({lines:[SAY('Branch closure notice','RILLBRIDGE BRANCH · PERMANENT CLOSURE. After the flood of 14 October, all passenger services are suspended. Memorial donations may be left with the stationmaster.'),SAY('Nell','Someone has polished the brass. The rest of the board is covered in dust.','nell')],done:()=>host.commit('noticeRead','notice')});break;
      case 'train':host.talk({lines:[SAY('The 18:40','The carriage smells of wet wool and orange peel. A half-finished crossword lies on a seat. One answer has been pencilled in: RETURN.'),SAY('Nell','They were halfway through an ordinary day.','nell')]});break;
      case 'to-yard':
        if(s.location.map==='station'&&!s.flags.orrinJoined)host.talk({lines:[SAY('Nell','Orrin knows the old line. I should ask him to come with me.','nell')]});
        else host.travel('yard',s.location.map==='station'?35:10,s.location.map==='station'?18:10);break;
      case 'to-station':host.travel('station',7,11);break;
      case 'yard-fight':host.talk({lines:[SAY('Orrin','Track hounds. They used to fetch lost tools. These ones have forgotten what hands look like.','orrin'),SAY('Nell','Keep clear of my lantern when I open the shutter. It throws light in every direction.','nell')],done:()=>host.battle('yard')});break;
      case 'relay':
        if(!s.flags.yardCleared)host.talk({lines:[SAY('Orrin','The fuse is missing. Those hounds have been carrying the relay’s pieces around the yard.','orrin')]});
        else if(s.flags.relayRepaired)host.talk({lines:[SAY('Old signal relay','Two short rings. One long. Rillbridge is still answering.')]});
        else host.talk({lines:[SAY('Orrin','A new fuse in a dead relay. Let’s see what happens.','orrin'),SAY('The bell','Two short rings. One long.'),SAY('Orrin','That’s Rillbridge. The tunnel gate just released.','orrin')],done:()=>host.commit('relayRepaired','relay')});break;
      case 'scrap':
        if(s.flags.scrapCleared)host.talk({lines:[SAY('Nell','Just cold iron now. We took what was still useful.','nell')]});
        else host.talk({lines:[SAY('Orrin','Fresh lamp oil. Somebody’s been maintaining this yard. There’s a wage envelope under the iron.','orrin')],choices:[{label:'Search the heap · optional battle',action:()=>host.battle('scrap')},{label:'Leave it for now',action:()=>host.update()}]});break;
      case 'to-tunnel':
        if(!s.flags.relayRepaired)host.talk({lines:[SAY('Sealed tunnel','The gate is held shut by the old signal relay. There is warm air coming through the hinges.')]});
        else host.travel('tunnel',3,13);break;
      case 'tunnel-fight':host.talk({lines:[SAY('Orrin','That furnace has no fuel. Look at the direction of the steam vents. We should split up.','orrin')],done:()=>host.battle('tunnel')});break;
      case 'timetable':
        if(!s.flags.tunnelCleared)host.talk({lines:[SAY('Orrin','The guardian is watching that chamber. We need to stop it before we touch the relay.','orrin')]});
        else host.talk({lines:[SAY('Maintenance timetable','RILLBRIDGE · Return service. Passengers only. No substitutions. Below it: towns lost to flood, fire, and war.'),SAY('Nell','These aren’t destinations. They’re disasters.','nell'),SAY('Orrin','And every arrival is in the same handwriting. Someone has a very long shift.','orrin')],done:()=>host.commit('timetableRead','timetable')});break;
      case 'cache':
        if(s.flags.cacheTaken)host.talk({lines:[SAY('Maintenance locker','Empty bottles, dry cloth, and a carefully folded pair of gloves.')]});
        else host.talk({lines:[SAY('Maintenance locker','Three sealed bandages and a flask of water. Someone expected the maintenance crew to come back.')],done:()=>{s.bandages+=3;restoreParty(s);host.commit('cacheTaken');host.toast('Three bandages found. Party HP and focus restored.');}});break;
      case 'inspector':
        if(!s.flags.timetableRead)host.talk({lines:[SAY('The inspector','The maintenance chamber is behind you. You have not read your instructions.','inspector'),SAY('Orrin','His coat is dry. Nothing else down here is dry.','orrin')]});
        else host.talk({lines:[SAY('The inspector','One outstanding passenger. Return the child to the service. You are unauthorized additions.','inspector'),SAY('Nell','She’s waiting for her father. Who wrote that timetable?','nell'),SAY('The inspector','Passengers only. No substitutions.','inspector'),SAY('Orrin','Spread out, Nell. That staff is a signal projector.','orrin')],done:()=>host.battle('inspector')});break;
      case 'disk-b':
        if(!s.flags.inspectorCleared)host.talk({lines:[SAY('Nell','The inspector is standing between us and the exit. We can’t bring Mira through while he’s there.','nell')]});
        else if(s.flags.diskAComplete)host.boundary();
        else host.talk({lines:[SAY('Beyond the tunnel','The rain has stopped. Across the river, roofs catch the morning sun. Rillbridge is whole.'),SAY('Mira','There! The blue house by the bridge. I told you it wasn’t far.','mira'),SAY('Nell','The festival banner has tomorrow’s date on it.','nell'),SAY('Orrin','The flood hasn’t happened yet.','orrin')],done:()=>{s.flags.diskAComplete=true;s.boundary=CHAPTER.next;remember(s,'boundary');host.refresh();host.save();host.endingMusic();host.boundary();}});break;
    }
  }
