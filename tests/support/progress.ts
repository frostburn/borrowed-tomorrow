import { newGame, recruitOrrin, NEXT_CHAPTER, type GameState } from '../../src/rules/state';

const ordered = ['festivalSeen', 'raidSeen', 'escapeWon', 'orrinJoined', 'villageSeen', 'collectorConfronted', 'collectorDefeated', 'villageFreed', 'passSeen', 'captainConfronted', 'captainDefeated', 'chapterOneComplete'] as const;
export function checkpoint(last: typeof ordered[number]): GameState {
  const s = newGame();
  for (const flag of ordered.slice(0, ordered.indexOf(last) + 1)) s.flags[flag] = true;
  if (s.flags.orrinJoined) recruitOrrin(s);
  if (s.flags.escapeWon) { s.xp = 40; s.coins = 36; }
  if (s.flags.collectorDefeated) { s.xp = 85; s.coins = 62; }
  if (s.flags.captainDefeated) { s.xp = 150; s.coins = 102; }
  if (s.flags.chapterOneComplete) s.boundary = NEXT_CHAPTER;
  s.location = s.flags.passSeen ? { map: 'tunnel', x: 5, y: 14 }
    : s.flags.villageSeen ? { map: 'rillbridge', x: 15, y: 18 }
    : s.flags.escapeWon ? { map: 'yard', x: 35, y: 18 } : { map: 'station', x: 23, y: 15 };
  return s;
}
