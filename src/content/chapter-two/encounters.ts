import type { Encounter } from '../../rules/combat';
export const ENCOUNTERS: Record<string, Encounter> = {
  'coast-signals': {
    id: 'coast-signals', name: 'Prison train · signal walk', flag: 'trainRaidWon', xp: 70, coins: 32, journal: 'trainRaid', item: 'courier-sight', backdrop: { map: 'coast', y: -300 },
    enemies: [{ kind: 'crow', name: 'Signal crow', col: 6, row: 1, hp: 30 }, { kind: 'crow', name: 'Signal crow', col: 8, row: 5, hp: 30 }, { kind: 'hound', name: 'Coach hound', col: 6, row: 3, hp: 38 }],
    rocks: [[4, 2], [5, 4], [8, 3]], victory: 'The signal walk is clear. A courier sight goes into the bag. Open the barred coach.',
  },
  'coast-loading': {
    id: 'coast-loading', name: 'Prison train · loading gate', flag: 'trainRaidWon', xp: 70, coins: 32, journal: 'trainRaid', item: 'courier-sight', backdrop: { map: 'coast', y: -300 },
    enemies: [{ kind: 'guardian', name: 'Coach guardian', col: 7, row: 3, hp: 95 }, { kind: 'hound', name: 'Coach hound', col: 6, row: 1, hp: 32 }, { kind: 'hound', name: 'Coach hound', col: 6, row: 5, hp: 32 }],
    rocks: [[4, 1], [4, 5], [8, 2]], victory: 'The loading gate is clear. A courier sight goes into the bag. Open the barred coach.',
  },
  'coast-collector': {
    id: 'coast-collector', name: 'Cinderbank · protect the loading walk', flag: 'coastCollectorWon', xp: 85, coins: 42, journal: 'coastCollector', item: 'work-coat', backdrop: { map: 'cinderbank', y: -300 },
    enemies: [{ kind: 'guardian', name: 'Collector guard', col: 7, row: 4, hp: 96 }, { kind: 'crow', name: 'Signal crow', col: 8, row: 1, hp: 30 }, { kind: 'crow', name: 'Signal crow', col: 8, row: 5, hp: 30 }],
    rocks: [[4, 2], [5, 4], [9, 3]], evacuation:{route:[[2,6],[3,6],[4,6],[5,6],[6,6],[7,6],[8,6]],groups:3},
    victory: 'The families are aboard. A reinforced work coat goes into the bag. Check with Dena beside the coal shed.',
  },
  'coast-recapture': {
    id: 'coast-recapture', name: 'Petra · the last crossing', flag: 'recaptureWon', xp: 90, coins: 50, journal: 'recapture', backdrop: { map: 'cinderbank', y: -300 },
    enemies: [{ kind: 'knight', name: 'Petra', appearance: 'petra', col: 7, row: 3 }, { kind: 'crow', name: 'Command crow', col: 8, row: 1, hp: 30 }, { kind: 'crow', name: 'Command crow', col: 8, row: 5, hp: 30 }],
    rocks: [[4, 2], [4, 4], [7, 2]], victory: 'Petra is disarmed. The crossing is yours. Reach the engine before Alban can close the line.',
  },
};
