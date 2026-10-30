import { CHARACTERS } from '../content/characters';
import type { AbilityId } from './combat';
import { MAX_LEVEL } from './progression';
import {skillsAtLevel,skillAbilities,decodeSkillRanks,type SkillRanks} from './skills';
export { LEARNING } from './progression';
import { COMPANION_IDS, MAX_PARTY_SIZE, validParty, type CompanionId } from './party';
export { COMPANION_IDS, type CompanionId } from './party';

export const COMPANIONS = {
  nell: { role: 'Porter', tool: 'Oil lantern', chapter: 1, description: 'A railway apprentice pursuing the soldiers who took her brother.', maxHp: 42, attack: 11, armor: 0, speed: 7, movement: 3 },
  orrin: { role: 'Mechanic', tool: 'Steam lance', chapter: 1, description: 'Builds engines, tests explanations, and stands by his friends.', maxHp: 54, attack: 13, armor: 0, speed: 5, movement: 2 },
  kit: { role: 'Courier', tool: 'Repeating crossbow', chapter: 2, description: 'Knows the coast routes by heart. Stumbles over his words when Nell thanks him.', maxHp: 38, attack: 10, armor: 0, speed: 9, movement: 4 },
  celia: { role: 'Physician', tool: 'Field medicine', chapter: 2, description: 'Trained in the Benefactor’s hospitals. Treats the people the empire leaves behind.', maxHp: 40, attack: 8, armor: 0, speed: 6, movement: 3 },
  petra: { role: 'Vanguard', tool: 'Saber and shield', chapter: 3, description: 'An imperial knight learning what her oath is worth when an order is wrong.', maxHp: 62, attack: 14, armor: 1, speed: 4, movement: 3 },
} as const;
export const STAT_LIMITS = { maxHp: [1, 999], attack: [1, 199], armor: [0, 99], speed: [1, 30], movement: [1, 10], focus: [0, 6] } as const;
export type CharacterStat = keyof typeof STAT_LIMITS;
export interface CharacterBuild extends Record<CharacterStat, number> { level: number;skills:SkillRanks }
export interface CharacterProfile extends CharacterBuild { name: string; role: string; abilities: AbilityId[] }
export interface CharacterSettings { version: 3; characters: Record<CompanionId, CharacterBuild>; party: CompanionId[] }
export function defaultBuild(hero: CompanionId, level = 1): CharacterBuild {
  if (!Number.isInteger(level) || level < 1 || level > MAX_LEVEL) throw new Error(`Level must be 1–${MAX_LEVEL}.`);
  const c = COMPANIONS[hero];
  return { level, skills:skillsAtLevel(hero,level), maxHp: c.maxHp + (level - 1) * 6, attack: c.attack + (level - 1) * 2, armor: c.armor, speed: c.speed, movement: c.movement, focus: 6 };
}
export function newCharacterSettings(): CharacterSettings {
  return { version: 3, characters: Object.fromEntries(COMPANION_IDS.map(id => [id, defaultBuild(id)])) as Record<CompanionId, CharacterBuild>, party: ['nell', 'orrin'] };
}
export function setPartyMember(settings: CharacterSettings, hero: CompanionId, included: boolean): boolean {
  if (!COMPANION_IDS.includes(hero) || settings.party.includes(hero) === included) return false;
  if (included && settings.party.length >= MAX_PARTY_SIZE || !included && settings.party.length <= 1) return false;
  settings.party = included ? [...settings.party, hero] : settings.party.filter(id => id !== hero);
  return true;
}
export function validStat(stat: CharacterStat, value: number) { const [min, max] = STAT_LIMITS[stat]; return Number.isInteger(value) && value >= min && value <= max; }
export function characterProfiles(settings: CharacterSettings): Record<CompanionId, CharacterProfile> {
  return Object.fromEntries(COMPANION_IDS.map(hero => [hero, { ...settings.characters[hero], name: CHARACTERS[hero].name, role: COMPANIONS[hero].role,
    abilities: skillAbilities(hero,settings.characters[hero].skills) }])) as Record<CompanionId, CharacterProfile>;
}
export function decodeCharacterSettings(text: string): CharacterSettings {
  const raw = JSON.parse(text), settings = newCharacterSettings();
  if (!raw || raw.version !== 3 || !raw.characters) throw new Error('Invalid character settings.');
  if (typeof raw.characters !== 'object' || Array.isArray(raw.characters) || Object.keys(raw.characters).length !== COMPANION_IDS.length) throw new Error('Invalid character roster.');
  for (const hero of COMPANION_IDS) {
    const build = raw.characters[hero];
    if (!build || !Number.isInteger(build.level) || build.level < 1 || build.level > MAX_LEVEL) throw new Error('Invalid character level.');
    for (const stat of Object.keys(STAT_LIMITS) as CharacterStat[]) {
      if (!validStat(stat, build[stat])) throw new Error(`Invalid ${stat}.`);
      settings.characters[hero][stat] = build[stat];
    }
    settings.characters[hero].level = build.level;
    settings.characters[hero].skills=decodeSkillRanks(build.skills,hero,build.level);
  }
  if (!validParty(raw.party, COMPANION_IDS)) throw new Error('Choose one to three distinct companions.');
  settings.party = [...raw.party];
  return settings;
}
