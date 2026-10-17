import type { HeroId } from './state';
import type { AbilityId } from './combat';

export const STAT_LIMITS = { maxHp: [1, 999], attack: [1, 199], armor: [0, 99], speed: [1, 30], movement: [1, 10], focus: [0, 6] } as const;
export type CharacterStat = keyof typeof STAT_LIMITS;
export interface CharacterBuild extends Record<CharacterStat, number> { level: number }
export interface CharacterProfile extends CharacterBuild { abilities: AbilityId[] }
export interface CharacterSettings { version: 1; characters: Record<HeroId, CharacterBuild> }
export const LEARNING: Record<HeroId, readonly { level: number; ability: AbilityId }[]> = {
  nell: [{ level: 1, ability: 'strike' }, { level: 1, ability: 'burst' }, { level: 1, ability: 'bandage' }, { level: 2, ability: 'mend' }, { level: 3, ability: 'dazzle' }, { level: 5, ability: 'beacon' }],
  orrin: [{ level: 1, ability: 'strike' }, { level: 1, ability: 'steam' }, { level: 1, ability: 'bandage' }, { level: 2, ability: 'rivet' }, { level: 3, ability: 'guard' }, { level: 5, ability: 'repulse' }],
};
export function defaultBuild(hero: HeroId, level = 1): CharacterBuild {
  if (!Number.isInteger(level) || level < 1 || level > 10) throw new Error('Level must be 1–10.');
  return { level, maxHp: (hero === 'nell' ? 42 : 54) + (level - 1) * 6, attack: (hero === 'nell' ? 11 : 13) + (level - 1) * 2, armor: 0, speed: hero === 'nell' ? 7 : 5, movement: hero === 'nell' ? 3 : 2, focus: 6 };
}
export function newCharacterSettings(): CharacterSettings {
  return { version: 1, characters: { nell: defaultBuild('nell'), orrin: defaultBuild('orrin') } };
}
export function validStat(stat: CharacterStat, value: number) { const [min, max] = STAT_LIMITS[stat]; return Number.isInteger(value) && value >= min && value <= max; }
export function characterProfiles(settings: CharacterSettings): Record<HeroId, CharacterProfile> {
  const profile = (hero: HeroId) => ({ ...settings.characters[hero], abilities: LEARNING[hero].filter(entry => entry.level <= settings.characters[hero].level).map(entry => entry.ability) });
  return { nell: profile('nell'), orrin: profile('orrin') };
}
export function decodeCharacterSettings(text: string): CharacterSettings {
  const raw = JSON.parse(text), settings = newCharacterSettings();
  if (!raw || raw.version !== 1 || !raw.characters) throw new Error('Invalid character settings.');
  for (const hero of ['nell', 'orrin'] as const) {
    const build = raw.characters[hero];
    if (!build || !Number.isInteger(build.level) || build.level < 1 || build.level > 10) throw new Error('Invalid character level.');
    for (const stat of Object.keys(STAT_LIMITS) as CharacterStat[]) {
      if (!validStat(stat, build[stat])) throw new Error(`Invalid ${stat}.`);
      settings.characters[hero][stat] = build[stat];
    }
    settings.characters[hero].level = build.level;
  }
  return settings;
}
