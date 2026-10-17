import type { GameState } from '../../rules/state';
import { portraitAsset, speakerPortrait } from '../characters';
import type { Cinematic, Shot } from '../cinematics';

export const CHAPTER = { id: 'disk-a', title: 'The Wrong Platform', next: 'disk-b:rillbridge-arrival' } as const;
export const JOURNAL: Record<string, { title: string; text: string }> = {
  arrival: { title: 'An unscheduled arrival', text: 'The 18:40 rolled into Larkspur without a signal. Its destination board reads Rillbridge. Nobody here has sold a ticket to Rillbridge in forty years.' },
  'a-receipt': { title: 'My signature, tomorrow', text: 'Mira found a receiving copy on the train: thirty-one people, none substituted. It bears my signature and tomorrow’s date. The inspector demanded it and warned us away from the western return relay. I kept it. Find Orrin in the square; he was inspecting the engine.' },
  mira: { title: 'Twenty minutes', text: 'Mira boarded with her father. He stepped off to ask about a delay and the train left without him. Her ticket is dated 14 October, forty years ago. She says the journey took twenty minutes.' },
  notice: { title: 'The closed branch', text: 'The flood at Rillbridge destroyed the town and the branch line. The official notice lists no survivors. Someone has recently polished the brass on the memorial.' },
  orrin: { title: 'A warm axle', text: 'Orrin knows the old line. The arriving train has fresh oil and a warm axle, although its serial number belongs to a locomotive scrapped decades ago. He has joined Nell to inspect the signal yard.' },
  fuse: { title: 'What the hounds were carrying', text: 'The track hounds had been collecting the missing pieces of the old signal relay. The fuse recovered from the yard has a date stamped into it: tomorrow.' },
  relay: { title: 'The line remembers', text: 'The repaired relay printed a warning: thirty-one at risk, keep the foot crossing open. The inspector cut in and ordered it sealed. The old Rillbridge call released the tunnel gate. We can still reach the town.' },
  scrap: { title: 'Someone keeps the lamps trimmed', text: 'Fresh wick, warm oil, and a maintenance wage envelope were hidden in the scrap. The handwriting is Orrin’s father’s. He died before Orrin learned to read.' },
  guardian: { title: 'A furnace still burning', text: 'A rail guardian was protecting the tunnel’s maintenance chamber. Its fire has burned without fuel for forty years. It was guarding a timetable, not the passage.' },
  timetable: { title: 'The return service', text: 'The timetable lists towns lost to flood, fire, and war. Every arrival is written in the same hand. Below Rillbridge: “Return service — passengers only. No substitutions.”' },
  inspector: { title: 'No substitutions', text: 'The inspector tried to take Mira back to the train. He demanded the child and the receiving copy, then insisted the service must depart as recorded. He ordered the crossing sealed with thirty-one people beyond it. We stopped him; his punch can still be heard.' },
  promise: { title: 'A promise at the station', text: 'Nell promised the stationmaster she would bring the passengers home, whatever “home” turned out to mean. That promise may matter when the next train arrives.' },
  boundary: { title: 'Across the water', text: 'Beyond the tunnel, Rillbridge stands whole in the morning light. Mira can see her father by the blue house. The flood has not happened here yet. Thirty-one people can still leave; the inspector tried to keep us from reaching them.' },
};
export interface Line { who: string; text: string; portrait?: string; shot?:Shot }
export interface Choice { label: string; action: () => void }
export interface Dialogue { lines: Line[]; choices?: Choice[]; done?: () => void; scene?:Cinematic }
export const SAY = (who: string, text: string, portrait?: string): Line => ({ who, text, portrait:portrait?portraitAsset(portrait):speakerPortrait(who) });
export function objective(s: GameState): string {
  if (s.flags.diskAComplete) return 'Rillbridge is waiting. Insert Disk B.';
  if (!s.flags.metMira) return 'Talk to the child beside the unscheduled train.';
  if (!s.flags.orrinJoined) return 'Find Orrin in the square. He saw who cut the return wire.';
  if (!s.flags.yardCleared) return 'Follow the western path. Recover the fuse from the inspector’s track hounds.';
  if (!s.flags.relayRepaired) return 'Answer the return wire: fit the fuse into the old yard relay.';
  if (!s.flags.tunnelCleared) return 'Reach the thirty-one: enter the tunnel beyond the repaired relay.';
  if (!s.flags.timetableRead) return 'Read the timetable in the maintenance chamber.';
  if (!s.flags.inspectorCleared) return 'Confront the inspector at the tunnel’s far end. Keep Mira behind you.';
  return 'Step into the morning light beyond the tunnel.';
}
