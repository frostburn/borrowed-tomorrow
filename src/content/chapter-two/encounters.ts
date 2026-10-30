import type { Encounter } from '../../rules/combat';
export const ENCOUNTERS: Record<string, Encounter> = {
  'coast-signals': {
    id: 'coast-signals', music:'coast-battle', name: 'Prison train · signal walk', flag: 'trainRaidWon', xp: 70, coins: 32, journal: 'trainRaid', item: 'courier-sight', backdrop: { map: 'coast', y: -300 },
    enemies: [{ kind:'crow',variant:'crow-copper', col: 6, row: 1 }, { kind:'crow',variant:'crow-copper', col: 8, row: 5 }, { kind:'hound',variant:'hound-steel', col: 6, row: 3 }],
    rocks: [[4, 2], [5, 4], [8, 3]], victory: 'The signal walk is clear. Open the barred coach.',
  },
  'coast-loading': {
    id: 'coast-loading', fixtures:[{id:'loading-valve',name:'Loading-walk valve',kind:'valve',col:3,row:3,vents:[[5,2],[5,3],[5,4]]}], music:'coast-battle', name: 'Prison train · loading gate', flag: 'trainRaidWon', xp: 70, coins: 32, journal: 'trainRaid', item: 'courier-sight', backdrop: { map: 'coast', y: -300 },
    enemies: [{ kind:'guardian',variant:'guardian-iron', col: 7, row: 3 }, { kind:'hound',variant:'hound-steel', col: 6, row: 1 }, { kind:'hound',variant:'hound-steel', col: 6, row: 5 }],
    rocks: [[4, 1], [4, 5], [8, 2]], victory: 'The loading gate is clear. Open the barred coach.',
  },
  'coast-collector': {
    id: 'coast-collector', music:'shunting', name: 'Cinderbank · protect the loading walk', flag: 'coastCollectorWon', xp: 85, coins: 42, journal: 'coastCollector', item: 'work-coat', backdrop: { map: 'cinderbank', y: -300 },
    enemies: [{ kind:'guardian',variant:'guardian-iron', col: 7, row: 4 }, { kind:'crow',variant:'crow-copper', col: 8, row: 1 }, { kind:'crow',variant:'crow-copper', col: 8, row: 5 }],
    rocks: [[4, 2], [5, 4], [9, 3]], evacuation:{route:[[2,6],[3,6],[4,6],[5,6],[6,6],[7,6],[8,6]],groups:3},
    victory: 'The families are aboard. Check with Dena beside the coal shed.',
  },
  'coast-recapture': {
    id: 'coast-recapture', music:'petra-battle', name: 'Petra · the last crossing', flag: 'recaptureWon', xp: 90, coins: 50, journal: 'recapture', backdrop: { map: 'cinderbank', y: -300 },
    enemies: [{ kind: 'knight', name: 'Petra', appearance: 'petra', col: 7, row: 3 }, { kind:'crow',variant:'crow-copper', col: 8, row: 1 }, { kind:'crow',variant:'crow-copper', col: 8, row: 5 }],
    rocks: [[4, 2], [4, 4], [7, 2]], victory: 'Petra is disarmed. The crossing is yours. Reach the engine before Alban can close the line.',
  },
};
