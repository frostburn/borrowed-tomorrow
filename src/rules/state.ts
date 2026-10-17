export const SAVE_FORMAT = 'borrowed-tomorrow';
export const SAVE_VERSION = 5;
export const CAMPAIGN = 'imperial-debt';
export const NEXT_CHAPTER = 'chapter-two:iron-coast';
export type HeroId = 'nell' | 'orrin';
export type MapId = 'station' | 'yard' | 'rillbridge' | 'tunnel';
export interface HeroState { id: HeroId; hp: number; focus: number }
export interface GameState {
  format: typeof SAVE_FORMAT;
  version: typeof SAVE_VERSION;
  campaign: typeof CAMPAIGN;
  chapter: 'chapter-one';
  location: { map: MapId; x: number; y: number };
  party: HeroState[];
  flags: Record<string, boolean>;
  coins: number;
  bandages: number;
  xp: number;
  gear: string[];
  journal: string[];
  boundary: typeof NEXT_CHAPTER | null;
  playSeconds: number;
}
export function newGame(): GameState {
  return {
    format: SAVE_FORMAT, version: SAVE_VERSION, campaign: CAMPAIGN, chapter: 'chapter-one',
    location: { map: 'station', x: 21, y: 16 }, party: [{ id: 'nell', hp: 42, focus: 6 }],
    flags: {}, coins: 18, bandages: 5, xp: 0, gear: [], journal: ['home'], boundary: null, playSeconds: 0,
  };
}
export const level = (s: Pick<GameState, 'xp'>) => s.xp >= 370 ? 5 : s.xp >= 250 ? 4 : s.xp >= 130 ? 3 : s.xp >= 50 ? 2 : 1;
export const maxHp = (id: HeroId, s: Pick<GameState, 'xp'>) => (id === 'nell' ? 42 : 54) + (level(s) - 1) * 6;
export function restoreParty(s: GameState) { for (const hero of s.party) { hero.hp = maxHp(hero.id, s); hero.focus = 6; } }
export function recruitOrrin(s: GameState) {
  if (!s.party.some(h => h.id === 'orrin')) s.party.push({ id: 'orrin', hp: maxHp('orrin', s), focus: 6 });
  s.flags.orrinJoined = true;
}
export function remember(s: GameState, entry: string) { if (!s.journal.includes(entry)) s.journal.push(entry); }

/** The reboot is separate from versions 1–4; never reinterpret their story flags. */
export function decodeSave(text: string): GameState {
  const raw: unknown = JSON.parse(text);
  if (!raw || typeof raw !== 'object') throw new Error('This is not a Borrowed Tomorrow save.');
  const s = raw as Record<string, unknown>;
  if (s.format === SAVE_FORMAT && [1, 2, 3, 4].includes(s.version as number)) {
    throw new Error('This save belongs to the previous story. Keep it as a backup, then begin Chapter One: Leaving Home.');
  }
  if (s.format !== SAVE_FORMAT || s.version !== SAVE_VERSION || s.campaign !== CAMPAIGN) throw new Error('Unsupported save format or campaign.');
  const number = (x: unknown, max: number): x is number => typeof x === 'number' && Number.isFinite(x) && x >= 0 && x <= max;
  const loc = s.location as GameState['location'] | undefined;
  if (!loc || !['station', 'yard', 'rillbridge', 'tunnel'].includes(loc.map) || !Number.isInteger(loc.x) || !Number.isInteger(loc.y) ||
    !number(loc.x, loc.map === 'rillbridge' ? 65 : 41) || !number(loc.y, loc.map === 'rillbridge' ? 40 : 25)) throw new Error('The save location is invalid.');
  if (!number(s.xp, 1e7) || !number(s.coins, 1e7) || !number(s.bandages, 999) || !number(s.playSeconds, 1e9)) throw new Error('The save contains invalid progress.');
  if (s.chapter !== 'chapter-one' || (s.boundary !== null && s.boundary !== NEXT_CHAPTER)) throw new Error('This chapter is not available in this build.');
  if (!Array.isArray(s.party) || s.party.length < 1 || s.party.length > 2 || s.party[0]?.id !== 'nell') throw new Error('The party is invalid.');
  const party: HeroState[] = [];
  for (const h of s.party) {
    if (!h || !['nell', 'orrin'].includes(h.id) || party.some(p => p.id === h.id) || !number(h.hp, maxHp(h.id, { xp: s.xp })) || !number(h.focus, 6)) throw new Error('The party is invalid.');
    party.push({ id: h.id, hp: h.hp, focus: h.focus });
  }
  if (!s.flags || typeof s.flags !== 'object' || Array.isArray(s.flags) || Object.values(s.flags).some(v => typeof v !== 'boolean')) throw new Error('Invalid story flags.');
  const flags: Record<string, boolean> = Object.create(null);
  for (const [id, value] of Object.entries(s.flags)) {
    if (!/^[a-zA-Z][a-zA-Z0-9_-]{0,80}$/.test(id) || ['constructor', 'prototype', '__proto__'].includes(id)) throw new Error('Invalid story flag.');
    flags[id] = value as boolean;
  }
  if (Boolean(flags.orrinJoined) !== party.some(h => h.id === 'orrin')) throw new Error('The party does not match the story progress.');
  const prerequisites: Record<string, string> = {
    raidSeen: 'festivalSeen', escapeWon: 'raidSeen', orrinJoined: 'escapeWon', workshopWon: 'orrinJoined',
    villageSeen: 'orrinJoined', collectorConfronted: 'villageSeen', collectorDefeated: 'collectorConfronted',
    villageFreed: 'collectorDefeated', passSeen: 'villageFreed', captainConfronted: 'passSeen',
    captainDefeated: 'captainConfronted', chapterOneComplete: 'captainDefeated',
  };
  for (const [flag, required] of Object.entries(prerequisites)) if (flags[flag] && !flags[required]) throw new Error('The story checkpoint is incomplete.');
  if ((loc.map === 'yard' && !flags.escapeWon) || (loc.map === 'rillbridge' && !flags.orrinJoined) || (loc.map === 'tunnel' && !flags.villageFreed)) throw new Error('This route has not opened yet.');
  if (Boolean(flags.chapterOneComplete) !== (s.boundary === NEXT_CHAPTER)) throw new Error('The chapter departure is incomplete.');
  const strings = (a: unknown, limit: number): a is string[] => Array.isArray(a) && a.length <= limit && a.every(v => typeof v === 'string' && /^[a-zA-Z0-9:_-]{1,80}$/.test(v));
  if (!strings(s.journal, 300) || !strings(s.gear, 30) || s.gear.some(id => !['brass-lantern', 'work-coats'].includes(id))) throw new Error('Invalid journal or equipment.');
  return {
    format: SAVE_FORMAT, version: SAVE_VERSION, campaign: CAMPAIGN, chapter: 'chapter-one', location: { ...loc }, party,
    flags, coins: s.coins, bandages: s.bandages, xp: s.xp, gear: [...new Set(s.gear)], journal: [...new Set(s.journal)],
    boundary: s.boundary as GameState['boundary'], playSeconds: s.playSeconds,
  };
}
