import type { AbilityId } from './combat';
import type { CompanionId } from './party';

export const MAX_LEVEL=12;

/** Read-only character rules shared by the campaign and development workshop. */
export const BASE_STATS = {
  nell: { maxHp: 42, attack: 11, armor: 0, speed: 7, movement: 3 },
  orrin: { maxHp: 54, attack: 13, armor: 0, speed: 5, movement: 2 },
  kit: { maxHp: 38, attack: 10, armor: 0, speed: 9, movement: 4 },
  celia: { maxHp: 40, attack: 8, armor: 0, speed: 6, movement: 3 },
  petra: { maxHp: 62, attack: 14, armor: 1, speed: 4, movement: 3 },
} as const;
export const LEARNING: Record<CompanionId, readonly { level: number; ability: AbilityId }[]> = {
  nell: [{ level: 1, ability: 'strike' }, { level: 1, ability: 'burst' }, { level: 1, ability: 'bandage' }, { level: 2, ability: 'mend' }, { level: 3, ability: 'dazzle' }, { level: 5, ability: 'beacon' }],
  orrin: [{ level: 1, ability: 'strike' }, { level: 1, ability: 'steam' }, { level: 1, ability: 'bandage' }, { level: 2, ability: 'rivet' }, { level: 3, ability: 'guard' }, { level: 5, ability: 'repulse' }],
  kit: [{ level: 1, ability: 'strike' }, { level: 1, ability: 'quickshot' }, { level: 1, ability: 'bandage' }, { level: 2, ability: 'bolt' }, { level: 3, ability: 'feint' }, { level: 5, ability: 'volley' }],
  celia: [{ level: 1, ability: 'strike' }, { level: 1, ability: 'celestialbolt' }, { level: 1, ability: 'mend' }, { level: 1, ability: 'bandage' }, { level: 2, ability: 'rally' }, { level: 3, ability: 'beacon' }, { level: 5, ability: 'sanctuary' }],
  petra: [{ level: 1, ability: 'strike' }, { level: 1, ability: 'bash' }, { level: 1, ability: 'bandage' }, { level: 2, ability: 'taunt' }, { level: 3, ability: 'sweep' }, { level: 5, ability: 'crush' }],
};
export const learnedAbilities = (id: CompanionId, level: number) => LEARNING[id].filter(e => e.level <= level).map(e => e.ability);
