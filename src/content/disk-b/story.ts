import { SAY } from '../disk-a/story';
import type { GameState } from '../../rules/state';

export const DISK_B = { id:'disk-b', title:'A Town Expecting Rain', next:'disk-c:ambulance-siding' } as const;
export const ARRIVAL = [
  SAY('Rillbridge · 13 October', 'A baker shakes flour from a festival cloth. Across the square, a man is fixing a blue front door.'),
  SAY('Mira', 'Dad! Leave the hinge. Dad!', 'mira'),
  SAY('Bram', 'You were upstairs a moment ago. Where are your shoes?'),
  SAY('Mira', 'These are my shoes. You have my suitcase.' ,'mira'),
  SAY('Bram', 'It’s packed for tomorrow. Come here. You’re shaking.'),
  SAY('Nell', 'What day is it here?', 'nell'),
  SAY('Bram', 'The thirteenth. Festival tomorrow, then the afternoon train. Has something happened?'),
];
export const B_JOURNAL:Record<string,{title:string;text:string}>={
  'b-receipt':{title:'The signature comes true',text:'At 00:17 Nell signed for thirty-one living arrivals. Her last stroke crossed the date, exactly like the premature copy. The inspector tried to prevent this arrival. The people remain at Larkspur; sending a copy backward does not send them back.'},
  'b-arrival':{title:'The day before',text:'It is 13 October in Rillbridge, the morning before the flood. Mira found her father, Bram. He has packed her suitcase for tomorrow’s train. He does not remember losing her.'},
  'b-family':{title:'Bram’s neighbor',text:'Bram will leave with Mira, but he needs help moving Elspeth from the schoolhouse. She cannot manage the bridge steps. There is a flat maintenance trolley at the sluice.'},
  'b-evidence':{title:'The blocked overflow',text:'Timber has jammed the overflow. A fresh crack runs below the water mark; the upstream gauge is still rising. Take the broken gauge plate to Tilda so she can call the town together.'},
  'b-warning':{title:'The festival tables',text:'Tilda has cancelled the festival and sent the stallholders door to door. Bram is collecting the residents’ names. We still need a route that Elspeth can use.'},
  'b-registry':{title:'A door that will not open',text:'Mira’s ticket opened the carriage door. The same door shut when Bram stepped up. The service will take its registered passenger, but it will not accept a substitute or an extra traveler. We need to cross on foot.'},
  'b-trolley':{title:'A way down the steps',text:'The maintenance trolley is free. Orrin fitted its brakes and brought it to the schoolhouse. Bram can strap Elspeth’s chair to the platform.'},
  'b-rescue':{title:'Everybody at the bridge',text:'It is before dawn on 14 October. Elspeth and the other residents are ready after a night of packing. Mira is staying with her father. The trolley needs the level maintenance crossing; the sluice keeper controls its gate.'},
  'b-maintenance':{title:'Between services',text:'A work sheet records maintenance shifts between repeated passenger arrivals. Orrin’s father signed the instruction to keep the foot crossing unlocked. The work sheet and the railway timetable measure time differently.'},
  'b-orchard':{title:'The orchard channel',text:'We opened the orchard spillway. It drains the control apron and gives us a dry approach to the keeper. The fruit trees will be under water.'},
  'b-millrace':{title:'The old millrace',text:'We sent the overflow down the old millrace to spare the orchard. The control apron is flooded. Shallow water takes two movement points per hex, so the dry approaches matter.'},
  'b-crossing':{title:'The maintenance crossing',text:'The sluice keeper has stopped. Orrin can lower the level crossing and hold the outfall open. The residents are waiting on the town side of the bridge.'},
  'b-evacuation':{title:'Thirty-one across',text:'All thirty-one residents crossed with Bram’s list, including Elspeth on the trolley. The river overtopped the lower quay after the last cart left. The maintenance path brought them into Larkspur’s goods yard. Nobody boarded the return service.'},
  'b-coda':{title:'Beds at Larkspur',text:'Ansel found blankets and Iona opened the waiting room. Mira and Bram are together. The residents are still here after the station clock has passed midnight.'},
  'b-departure':{title:'An ambulance siding',text:'A new dispatch names Cinderbank: an ambulance train is due out before dawn, and the passenger list contains wounded soldiers but no medical staff. Nell and Orrin have kept the dispatch. Mira is staying with Bram.'},
};
export function objectiveB(s:GameState):string{
  if(s.flags.diskBComplete)return 'Rillbridge’s residents are safe at Larkspur. Insert Disk C.';
  if(!s.flags.bFatherFound)return 'Speak to Bram beside the blue house.';
  if(!s.flags.bOverflowCleared)return 'Inspect the blocked overflow at the upstream sluice.';
  if(!s.flags.bFloodEvidence)return 'Read the damaged gauge beside the cleared overflow.';
  if(!s.flags.bTownWarned)return 'Show the gauge plate to Tilda outside the bakery.';
  if(!s.flags.bRegistryRefused)return 'Try the carriage door with Bram and Mira.';
  if(!s.flags.bTrolleyFreed)return 'Recover the maintenance trolley at the sluice.';
  if(!s.flags.bNeighborsReady)return s.flags.bSchoolGateOpen?'Bring the trolley to Elspeth at the schoolhouse.':'Open the schoolhouse gate and bring the trolley to Elspeth.';
  if(!s.flags.bOrchardChannel&&!s.flags.bMillraceChannel)return 'Choose an outfall at the sluice’s control wheel.';
  if(!s.flags.bKeeperStopped)return 'Stop the keeper on the sluice control apron.';
  if(!s.flags.bEvacuated)return 'Return to the bridge and bring the residents across.';
  return 'Speak to Ansel at Larkspur, then inspect the new dispatch by the train.';
}
