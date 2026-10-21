import type { GameState } from '../../rules/state';
export const JOURNAL:Record<string,{title:string;text:string}>={
  capital:{title:'The medical siding',text:'Our clearance brought the patients into the capital. Petra has followed Alban here. Speak to her in the square; the engine works entrance is on the right.'},
  defection:{title:'Petra’s refusal',text:'Petra refused to hand the passengers back and fought the custody machines with us. She is staying. Tomas is inside the engine works. A balanced saber hilt is in the shared bag for Petra; choose active fighters and equip it in Equipment.'},
  warden:{title:'The shears have stopped',text:'The engine warden is down. A silver reflector for Nell is in the bag. Free Tomas from his restraints at the back of the gallery.'},
  reunion:{title:'Tomas is free',text:'Tomas is alive and staying with the medical train. He held the intake valve open from his workbench, making our way in possible. The collectors deliver people’s days to the vessel below the palace. Choose a way to shut the feeds down at the central control table.'},
  intake:{title:'Below the palace',text:'Tomas has bypassed the execution circuit. We can cut the crystal feeds or vent the pressure line. Both reach the extraction console; our chosen route is saved. The western stairs lead down.'},
  heart:{title:'The emperor’s engine',text:'The emperor refuses to stop collection. The restrained vessel below the palace feeds his engines. Stop its regulator, then close the feeds ourselves.'},
  heartGuard:{title:'Close the feeds',text:'The heart regulator is down. We found an insulated coat that any companion can equip. Close the extraction feeds at the console on the right.'},
  rupture:{title:'The capital rises',text:'We stopped the extraction. The emperor entered the vessel rather than let his engines fail. The capital is tearing free of the ground. Tomas has reached our coal engine. Get to the south platform and leave together.'},
  brokenDeparture:{title:'Tomas came with us',text:'Tomas escaped alive with the passengers. The capital is suspended above the valley; clocks and signals outside it have begun to fail. Nell, Orrin, Kit and Petra left together. Our rescue stands. Next: Chapter Four — A Light on the Water.'},
};
export function objective(s:GameState):string{
  const f=s.flags;
  if(f.chapterThreeComplete)return 'Chapter Three complete. Next: A Light on the Water.';
  if(f.emperorMerged)return 'Reach Tomas and board the medical engine at the south platform.';
  if(!f.petraJoined)return f.capitalGateWon?'Speak to Petra after the arrest attempt.':'Meet Petra in the square beside the medical siding.';
  if(!f.worksWardenWon)return 'Enter the engine works and stop Tomas’s execution.';
  if(!f.tomasRescued)return 'Free Tomas from his restraints at the back of the gallery.';
  if(!f.intakePlanned)return 'Choose an intake approach at the central control table.';
  if(!f.conduitSeen)return 'Take the western stairs beneath the palace.';
  if(!f.conduitGuardWon)return s.flags.pressureRoute?'Clear the pressure walk; avoid the orange vents.':'Occupy both blue plates to break the regulator’s seal, then defeat it.';
  return 'Close the extraction feeds at the console on the right.';
}
