import type { Encounter } from '../../rules/combat';

export const ENCOUNTERS: Record<string, Encounter> = {
  pursuit: {
    id: 'pursuit', name: 'Escape from Larkspur', flag: 'escapeWon', xp: 40, coins: 18, journal: 'escape',
    backdrop: { map: 'station', y: -144 },
    enemies: [{ kind: 'hound', name: 'Pursuit hound', col: 5, row: 2, hp: 18, bonus: -6 }, { kind: 'hound', name: 'Pursuit hound', col: 6, row: 3, hp: 18, bonus: -6 }],
    rocks: [[4, 4], [7, 1]], victory: 'The western road is open. Find Orrin in his workshop.',
  },
  workshop: {
    id: 'workshop', name: 'The spare engine shed', flag: 'workshopWon', xp: 25, coins: 24, journal: 'workshop', gear: 'brass-lantern',
    enemies: [{ kind: 'hound', col: 6, row: 3 }, { kind: 'crow', col: 8, row: 1 }, { kind: 'crow', col: 8, row: 5 }],
    rocks: [[5, 2], [5, 4], [8, 3]], victory: 'Orrin fits the brass reflector. Nell gains 3 attack power.',
  },
  collector: {
    id: 'collector', name: 'The imperial collector', flag: 'collectorDefeated', xp: 45, coins: 26, journal: 'collector',
    enemies: [{ kind: 'guardian', name: 'Collector guard', col: 7, row: 3, hp: 52 }, { kind: 'crow', name: 'Signal crow', col: 8, row: 1 }, { kind: 'hound', col: 6, row: 5, hp: 22 }],
    rocks: [[4, 2], [5, 4], [8, 5]], victory: 'The guard is down. Break open the collector to wake Rillbridge.',
  },
  captain: {
    id: 'captain', name: 'Captain Severin · the eastern pass', flag: 'captainDefeated', xp: 65, coins: 40, journal: 'captain',
    enemies: [{ kind: 'inspector', name: 'Captain Severin', appearance: 'severin', col: 8, row: 3, hp: 86 }, { kind: 'hound', col: 7, row: 1, hp: 24 }, { kind: 'hound', col: 7, row: 5, hp: 24 }],
    rocks: [[4, 2], [4, 4], [8, 6]], vents: [[5, 1], [5, 2], [5, 4], [5, 5]],
    victory: 'Severin retreats. The crossing is yours. Board Orrin’s engine at the eastern exit.',
  },
};
