import type { GameState } from '../../rules/state';
import { portraitAsset, speakerPortrait } from '../characters';

export const CHAPTER = { id: 'disk-a', title: 'The Wrong Platform', next: 'disk-b:rillbridge-arrival' } as const;
export const JOURNAL: Record<string, { title: string; text: string }> = {
  arrival: { title: 'An unscheduled arrival', text: 'The 18:40 rolled into Larkspur without a signal. Its destination board reads Rillbridge. Nobody here has sold a ticket to Rillbridge in forty years.' },
  mira: { title: 'Twenty minutes', text: 'Mira boarded with her father. He stepped off to ask about a delay and the train left without him. Her ticket is dated 14 October, forty years ago. She says the journey took twenty minutes.' },
  notice: { title: 'The closed branch', text: 'The flood at Rillbridge destroyed the town and the branch line. The official notice lists no survivors. Someone has recently polished the brass on the memorial.' },
  orrin: { title: 'A warm axle', text: 'Orrin knows the old line. The arriving train has fresh oil and a warm axle, although its serial number belongs to a locomotive scrapped decades ago. He has joined Nell to inspect the signal yard.' },
  fuse: { title: 'What the hounds were carrying', text: 'The track hounds had been collecting the missing pieces of the old signal relay. The fuse recovered from the yard has a date stamped into it: tomorrow.' },
  relay: { title: 'The line remembers', text: 'The repaired relay answered a signal from inside the sealed tunnel. The bell used the old Rillbridge call: two short rings, one long.' },
  scrap: { title: 'Someone keeps the lamps trimmed', text: 'Fresh wick, warm oil, and a maintenance wage envelope were hidden in the scrap. The handwriting is Orrin’s father’s. He died before Orrin learned to read.' },
  guardian: { title: 'A furnace still burning', text: 'A rail guardian was protecting the tunnel’s maintenance chamber. Its fire has burned without fuel for forty years. It was guarding a timetable, not the passage.' },
  timetable: { title: 'The return service', text: 'The timetable lists towns lost to flood, fire, and war. Every arrival is written in the same hand. Below Rillbridge: “Return service — passengers only. No substitutions.”' },
  inspector: { title: 'No substitutions', text: 'The inspector tried to take Mira back to the train. He called her an outstanding passenger and Nell an unauthorized addition. He did not answer when Orrin asked who writes the timetable.' },
  promise: { title: 'A promise at the station', text: 'Nell promised the stationmaster she would bring the passengers home, whatever “home” turned out to mean. That promise may matter when the next train arrives.' },
  boundary: { title: 'Across the water', text: 'Beyond the tunnel, Rillbridge stands whole in the morning light. Tomorrow’s date is painted on a festival banner. Mira has found the way home. The flood has not happened yet.' },
};
export interface Line { who: string; text: string; portrait?: string }
export interface Choice { label: string; action: () => void }
export interface Dialogue { lines: Line[]; choices?: Choice[]; done?: () => void }
export const SAY = (who: string, text: string, portrait?: string): Line => ({ who, text, portrait:portrait?portraitAsset(portrait):speakerPortrait(who) });
export function objective(s: GameState): string {
  if (s.flags.diskAComplete) return 'Rillbridge is waiting. Insert Disk B.';
  if (!s.flags.metMira) return 'Talk to the child beside the unscheduled train.';
  if (!s.flags.orrinJoined) return 'Find Orrin, the mechanic, in the station square.';
  if (!s.flags.yardCleared) return 'Follow the western path to the old signal yard.';
  if (!s.flags.relayRepaired) return 'Fit the recovered fuse into the old signal relay.';
  if (!s.flags.tunnelCleared) return 'Enter the tunnel and investigate the warm furnace.';
  if (!s.flags.timetableRead) return 'Read the timetable in the maintenance chamber.';
  if (!s.flags.inspectorCleared) return 'Reach the far end of the tunnel.';
  return 'Step into the morning light beyond the tunnel.';
}
