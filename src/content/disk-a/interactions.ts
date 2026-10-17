import { relay, timetable, inspector, across } from '../scenes';
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
        if(s.flags.metMira)host.talk({lines:[SAY('Mira',s.flags.aReceiptSeen?'Orrin’s by the square. The man with the punch went towards the western yard. Please don’t let him take the paper.':'I’ll wait by the train. Dad said that if we get separated, we should stay somewhere easy to find.','mira')]});
        else host.talk({lines:[
          SAY('Mira','He stepped off to ask about the delay. Then the train moved. He still has my suitcase.','mira'),
          SAY('Nell','What station did you leave from?','nell'),
          SAY('Mira','Rillbridge. We’ve only been travelling twenty minutes. Look, I kept my ticket flat.','mira'),
          SAY('Nell','The date is forty years old. The punch mark is still damp.','nell'),
        ],done:()=>host.commit('metMira','mira')});break;
      case 'orrin':
        if(!s.flags.metMira)host.talk({lines:[SAY('Orrin','That engine’s been scrapped longer than you’ve been alive. Ask the little passenger what she remembers. I’ll look at the wheels.','orrin')]});
        else host.talk({lines:[
          SAY('Orrin','Warm axle. Fresh oil. That engine’s been scrapped for decades.'),
          SAY('Nell',s.flags.aReceiptSeen?'Mira brought a receipt with my signature. Tomorrow’s date. The inspector wanted it back.':'Mira’s ticket is forty years old. She says she’s only been travelling twenty minutes.'),
          SAY('Orrin','He cut the return wire in the western signal yard. I watched him do it. Let’s find what he doesn’t want answering.'),
          SAY('Nell','Mira, keep on the inside of my lantern. We’ll find where your train came from.'),
          SAY('Mira','Dad will wait by the blue door. I know he will.'),
        ],done:()=>{recruitOrrin(s);remember(s,'orrin');host.refresh();host.save();}});break;
      case 'master':
        if(Boolean(s.flags.promisedHome)!==Boolean(s.flags.askedForTruth)){
          host.talk({lines:[SAY('Stationmaster Ansel',s.flags.promisedHome?'I’ll keep the ministry’s telegram on my desk. Bring the passengers back before I have to answer it.':'Find out what is happening on that line. Until then, I’ll keep the train here.','master')]});break;
        }
        host.talk({lines:[
        SAY('Stationmaster Ansel','The ministry wants the engine impounded. An unscheduled train is an administrative problem, apparently.','master'),
        SAY('Nell','And the passengers?','nell'),
        SAY('Stationmaster Ansel','That part of the telegram was very short. Bring them home, Nell. If there is a home to bring them to.','master'),
      ],choices:[{label:'I’ll bring them home.',action:()=>{s.flags.promisedHome=true;delete s.flags.askedForTruth;remember(s,'promise');host.update();host.save();}},{label:'First I need to understand the line.',action:()=>{s.flags.askedForTruth=true;delete s.flags.promisedHome;s.journal=s.journal.filter(id=>id!=='promise');host.update();host.save();}}]});break;
      case 'clerk':host.shop();break;
      case 'notice':host.talk({lines:[SAY('Branch closure notice','RILLBRIDGE BRANCH · PERMANENT CLOSURE. After the flood of 14 October, all passenger services are suspended. Memorial donations may be left with the stationmaster.'),SAY('Nell','Someone has polished the brass. The rest of the board is covered in dust.','nell')],done:()=>host.commit('noticeRead','notice')});break;
      case 'train':host.talk({lines:[SAY('The 18:40','The carriage smells of wet wool and orange peel. A half-finished crossword lies on a seat. One answer has been pencilled in: RETURN.'),SAY('Nell','They were halfway through an ordinary day.','nell')]});break;
      case 'to-yard':
        if(s.location.map==='station'&&!s.flags.orrinJoined)host.talk({lines:[SAY('Nell','Orrin knows the old line. I should ask him to come with me.','nell')]});
        else host.travel('yard',s.location.map==='station'?35:10,s.location.map==='station'?18:10);break;
      case 'to-station':host.travel('station',7,11);break;
      case 'yard-fight':host.talk({lines:[SAY('Orrin','Those hounds have the relay fuse. See the round punch on their collars? Same as his. He sent them to keep the wire dead.','orrin'),SAY('Nell','Keep clear of my lantern when I open the shutter. It throws light in every direction.','nell')],done:()=>host.battle('yard')});break;
      case 'relay':
        if(!s.flags.yardCleared)host.talk({lines:[SAY('Orrin','The fuse is missing. Those hounds have been carrying the relay’s pieces around the yard.','orrin')]});
        else if(s.flags.relayRepaired)host.talk({lines:[SAY('Old signal relay','Two short rings. One long. Rillbridge is still answering.')]});
        else host.talk({...relay(),done:()=>host.commit('relayRepaired','relay')});break;
      case 'scrap':
        if(s.flags.scrapCleared)host.talk({lines:[SAY('Nell','Just cold iron now. We took what was still useful.','nell')]});
        else host.talk({lines:[SAY('Orrin','Fresh lamp oil. Somebody’s been maintaining this yard. There’s a wage envelope under the iron.','orrin')],choices:[{label:'Search the heap · optional battle',action:()=>host.battle('scrap')},{label:'Leave it for now',action:()=>host.update()}]});break;
      case 'to-tunnel':
        if(!s.flags.relayRepaired)host.talk({lines:[SAY('Sealed tunnel','The gate is held shut by the old signal relay. There is warm air coming through the hinges.')]});
        else host.travel('tunnel',3,13);break;
      case 'tunnel-fight':host.talk({lines:[SAY('Orrin','That furnace has no fuel. Look at the direction of the steam vents. We should split up.','orrin')],done:()=>host.battle('tunnel')});break;
      case 'timetable':
        if(!s.flags.tunnelCleared)host.talk({lines:[SAY('Orrin','The guardian is watching that chamber. We need to stop it before we touch the relay.','orrin')]});
        else host.talk({...timetable(s),done:()=>host.commit('timetableRead','timetable')});break;
      case 'cache':
        if(s.flags.cacheTaken)host.talk({lines:[SAY('Maintenance locker','Empty bottles, dry cloth, and a carefully folded pair of gloves.')]});
        else host.talk({lines:[SAY('Maintenance locker','Three sealed bandages and a flask of water. Someone expected the maintenance crew to come back.')],done:()=>{s.bandages+=3;restoreParty(s);host.commit('cacheTaken');host.toast('Three bandages found. Party HP and focus restored.');}});break;
      case 'inspector':
        if(!s.flags.timetableRead)host.talk({lines:[SAY('The inspector','The maintenance chamber is behind you. You have not read your instructions.','inspector'),SAY('Orrin','His coat is dry. Nothing else down here is dry.','orrin')]});
        else host.talk({...inspector(s),done:()=>host.battle('inspector')});break;
      case 'disk-b':
        if(!s.flags.inspectorCleared)host.talk({lines:[SAY('Nell','The inspector is standing between us and the exit. We can’t bring Mira through while he’s there.','nell')]});
        else if(s.flags.diskBStarted)host.travel('rillbridge',12,18);
        else if(s.flags.diskAComplete)host.boundary();
        else host.talk({...across(),done:()=>{s.flags.diskAComplete=true;s.boundary=CHAPTER.next;remember(s,'boundary');host.refresh();host.save();host.endingMusic();host.boundary();}});break;
    }
  }
