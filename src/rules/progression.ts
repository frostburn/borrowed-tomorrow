import type { AbilityId } from './combat';
import type { CompanionId } from './party';
import {SKILLS,skillsAtLevel,skillAbilities,type SkillRanks} from './skills';

export const MAX_LEVEL=15;

/** Read-only character rules shared by the campaign and development workshop. */
export const BASE_STATS = {
  nell: { maxHp: 42, attack: 11, armor: 0, speed: 7, movement: 3 },
  orrin: { maxHp: 54, attack: 13, armor: 0, speed: 5, movement: 2 },
  kit: { maxHp: 38, attack: 10, armor: 0, speed: 9, movement: 4 },
  celia: { maxHp: 40, attack: 8, armor: 0, speed: 6, movement: 3 },
  petra: { maxHp: 62, attack: 14, armor: 1, speed: 4, movement: 3 },
} as const;
export const LEARNING:Record<CompanionId,readonly {level:number;ability:AbilityId}[]>=Object.fromEntries(Object.entries(SKILLS).map(([hero,skills])=>[hero,skills.map(s=>({level:s.levels[0],ability:s.id}))]))as Record<CompanionId,{level:number;ability:AbilityId}[]>;
export const learnedAbilities=(id:CompanionId,level:number,ranks:SkillRanks=skillsAtLevel(id,level))=>skillAbilities(id,ranks);
