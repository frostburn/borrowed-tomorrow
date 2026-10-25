import type { GameState } from '../../rules/state';

export const CHAPTER = { id: 'chapter-one', title: 'Leaving Home', nextTitle: 'Prison Trains' } as const;
export const JOURNAL: Record<string, { title: string; text: string }> = {
  home: { title: 'The trip we keep postponing', text: 'Tomas promised we would see the sea together. Find him beside the festival lanterns in Larkspur square.' },
  blessing: { title: 'The Benefactor', text: 'The empire credits the Benefactor with its crystal engines, harvests and healing lamps. His sun emblem is on the festival lamps. Ansel says the station had oil lamps when he was a boy.' },
  raid: { title: 'They took Tomas', text: 'Captain Alban arrested Tomas for stealing a palace crystal. Ansel tried to stop him and died protecting us. My lantern began to hum when the crystal broke. Tomas is on the prison train. Break through the pursuit hounds, then find Orrin in the western workshop.' },
  escape: { title: 'Out of the square', text: 'The hounds cannot follow us now. Orrin took his engine to the western workshop. The army controls the main line; he may know another way east.' },
  orrin: { title: 'Our own engine', text: 'Orrin is coming with me. His engine burns coal instead of imperial crystal and can take the Rillbridge branch to the mountain pass. He brought a steam lance; keep clear of its line. The branch entrance is at the northwest end of the workshop.' },
  workshop: { title: 'A brass reflector', text: 'We recovered a brass reflector from the shed. It fits my lantern. The hounds in the shed were carrying imperial sun seals.' },
  village: { title: 'Rillbridge has stopped', text: 'The villagers are motionless, but the imperial collector at the eastern carriage is still working. The lantern hums louder here. Reach the collector and stop it.' },
  collector: { title: 'A repayment', text: 'Alban called the collection a repayment over the signal horn. We defeated its guard. The collector is ready to break open.' },
  freed: { title: 'They can move again', text: 'We broke the collector and woke Rillbridge. Alban recorded three days taken from each household. Tilda’s hands hurt; Elspeth can no longer lift her register, and some people are still missing. The villagers are searching while we follow Tomas’s coach through the eastern pass. Stopping the machine did not return what it had already taken.' },
  pass: { title: 'Alban at the pass', text: 'Alban has blocked the mountain crossing. His armored coach has already taken Tomas east. Defeat the captain to get our engine through. The old shelter in the lower recess offers rest and bandages.' },
  captain: { title: 'The road is ours', text: 'Alban retreated after we defeated him. Tomas was transferred to the prison-train exchange at the Iron Coast. Orrin has brought our engine to the far end of the pass. We can follow.' },
  departure: { title: 'Leaving home', text: 'We are taking our own engine east to the Iron Coast. Tomas is alive, Rillbridge is awake, and Alban no longer holds the crossing. Ansel’s lantern is coming with me. Next: Chapter Two — Prison Trains.' },
};

export function objective(s: GameState): string {
  const f = s.flags;
  if (f.chapterOneComplete) return 'Chapter One complete. Next: Prison Trains.';
  if (!f.raidSeen) return 'Find Tomas beside the festival lanterns.';
  if (!f.escapeWon) return 'Break through the pursuit hounds in the square.';
  if (!f.orrinJoined) return s.location.map === 'station' ? 'Go west to Orrin’s workshop.' : 'Find Orrin by his engine.';
  if (!f.villageSeen) return 'Take the northwest branch to Rillbridge.';
  if (!f.collectorDefeated) return 'Stop the collector at Rillbridge’s eastern carriage.';
  if (!f.villageFreed) return 'Break open the collector and free the village.';
  if (!f.passSeen) return 'Take the northern road to the eastern pass.';
  if (!f.captainDefeated) return 'Defeat Captain Alban at the far end of the pass.';
  return 'Board Orrin’s engine beyond the crossing.';
}
