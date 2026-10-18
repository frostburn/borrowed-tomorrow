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
    id: 'coast-collector', name: 'Cinderbank · the collector guard', flag: 'coastCollectorWon', xp: 85, coins: 42, journal: 'coastCollector', item: 'medic-clasp', backdrop: { map: 'cinderbank', y: -300 },
    enemies: [{ kind: 'guardian', name: 'Collector guard', col: 7, row: 3, hp: 112 }, { kind: 'crow', name: 'Signal crow', col: 8, row: 1, hp: 34 }, { kind: 'crow', name: 'Signal crow', col: 8, row: 5, hp: 34 }],
    rocks: [[4, 2], [5, 4], [7, 6]], vents: [[6, 2], [6, 3], [6, 4]], victory: 'The guard is down. A medic clasp goes into the bag. Open the collector casing beside the coal shed.',
  },
  'coast-recapture': {
    id: 'coast-recapture', name: 'Alban · the last crossing', flag: 'recaptureWon', xp: 90, coins: 50, journal: 'recapture', backdrop: { map: 'cinderbank', y: -300 },
    enemies: [{ kind: 'inspector', name: 'Captain Alban', appearance: 'alban', col: 8, row: 3, hp: 138, bonus: 3 }, { kind: 'hound', name: 'Recapture hound', col: 6, row: 1, hp: 40 }, { kind: 'crow', name: 'Signal crow', col: 7, row: 5, hp: 35 }],
    rocks: [[4, 2], [4, 4], [7, 2]], victory: 'Alban withdraws. The train and everyone aboard can leave. Board the engine beyond the crossing.',
  },
};
