export const COMPANION_IDS = ['nell', 'orrin', 'kit', 'celia', 'petra'] as const;
export type CompanionId = typeof COMPANION_IDS[number];
export const MAX_PARTY_SIZE = 3;
export function validParty<T extends string>(party: unknown, roster: readonly T[]): party is T[] {
  return Array.isArray(party) && party.length >= 1 && party.length <= MAX_PARTY_SIZE &&
    new Set(party).size === party.length && party.every(id => roster.includes(id));
}
