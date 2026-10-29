import type { GameState } from '../../rules/state';
export const JOURNAL:Record<string,{title:string;text:string}>={
  capital:{title:'The medical siding',text:'Our clearance brought the patients to the conduit works outside the capital. Petra has followed Alban here. Speak to her in the square; the engine works entrance is on the right.'},
  defection:{title:'Petra’s refusal',text:'Petra refused to hand the passengers back and fought the custody machines with us. She is staying. Tomas is inside the engine works. A balanced saber hilt is in the shared bag for Petra; choose active fighters and equip it in Equipment.'},
  warden:{title:'The shears have stopped',text:'The engine warden is down. A silver reflector for Nell is in the bag. Tomas’s restraints are no longer guarded.'},
  reunion:{title:'Tomas is free',text:'Tomas is alive and staying with the medical train. He held the intake valve open from his workbench, making our way in possible. The collectors deliver people’s days to the vessel below the conduit works. Choose a way to shut the feeds down at the central control table.'},
  intake:{title:'Below the conduit works',text:'Tomas has bypassed the execution circuit. We can cut the crystal feeds or vent the pressure line. Both reach the extraction console; our chosen route is saved. The western stairs lead down.'},
  heart:{title:'The emperor’s engine',text:'The emperor refuses to stop collection. The restrained vessel below the conduit works feeds his engines. Stop its regulator, then close the feeds ourselves.'},
  heartGuard:{title:'Close the feeds',text:'The heart regulator is down. We found an insulated coat that any companion can equip. The extraction console is no longer guarded.'},
  rupture:{title:'The Emperor escapes',text:'We stopped extraction at the works. The Emperor used the conduit’s last charge to teleport to his marble palace and ordered the coastal relay closed. Tomas has reached our coal engine. Get to the south platform and leave together.'},
  brokenDeparture:{title:'Tomas came with us',text:'Tomas escaped alive with the passengers. The Emperor teleported from the grounded works to the floating marble capital and ordered a coastal arrest. Clocks and signals along the line have begun to fail. Nell, Orrin, Kit and Petra left together. Our rescue stands. Next: Chapter Four — A Light on the Water.'},
};
export function objective(s:GameState):string{
  const f=s.flags;
  if(f.chapterThreeComplete)return 'Chapter Three complete. Next: A Light on the Water.';
  if(f.emperorMerged)return 'Reach Tomas and board the medical engine at the south platform.';
  if(!f.petraJoined)return f.capitalGateWon?'Petra has lowered her sword.':'Meet Petra in the square beside the medical siding.';
  if(!f.worksWardenWon)return 'Enter the engine works and stop Tomas’s execution.';
  if(!f.tomasRescued)return 'Tomas’s restraints are no longer guarded.';
  if(!f.intakePlanned)return 'Choose an intake approach at the central control table.';
  if(!f.conduitSeen)return 'Take the western stairs below the conduit works.';
  if(!f.conduitGuardWon)return s.flags.pressureRoute?'Clear the pressure walk; avoid the orange vents.':'Occupy both blue plates to break the regulator’s seal, then defeat it.';
  return 'The extraction console is no longer guarded.';
}
