export const SAVE_FORMAT = 'borrowed-tomorrow';
export const SAVE_VERSION = 3;
export type HeroId = 'nell' | 'orrin';
export type MapId = 'station' | 'yard' | 'tunnel' | 'rillbridge' | 'sluice' | 'cinderbank' | 'infirmary';
export interface HeroState { id: HeroId; hp: number; focus: number }
export interface GameState {
  format: typeof SAVE_FORMAT;
  version: typeof SAVE_VERSION;
  chapter: string;
  location: { map: MapId; x: number; y: number };
  party: HeroState[];
  flags: Record<string, boolean>;
  coins: number;
  bandages: number;
  xp: number;
  gear: string[];
  journal: string[];
  boundary: string | null;
  playSeconds: number;
}
export function newGame(): GameState {
  return { format: SAVE_FORMAT, version: SAVE_VERSION, chapter: 'disk-a',
    location: { map: 'station', x: 21, y: 19 },
    party: [{ id: 'nell', hp: 42, focus: 6 }], flags: {}, coins: 18, bandages: 5, xp: 0,
    gear: [], journal: ['arrival'], boundary: null, playSeconds: 0 };
}
export const level = (s: Pick<GameState, 'xp'>) => s.xp >= 370 ? 5 : s.xp >= 250 ? 4 : s.xp >= 130 ? 3 : s.xp >= 50 ? 2 : 1;
export const maxHp = (id: HeroId, s: Pick<GameState, 'xp'>) => (id === 'nell' ? 42 : 54) + (level(s) - 1) * 6;
export function restoreParty(s: GameState) { for (const hero of s.party) { hero.hp = maxHp(hero.id, s); hero.focus = 6; } }
export function recruitOrrin(s: GameState) {
  if (!s.party.some(h => h.id === 'orrin')) s.party.push({ id: 'orrin', hp: maxHp('orrin', s), focus: 6 });
  s.flags.orrinJoined = true;
}
export function remember(s: GameState, entry: string) { if (!s.journal.includes(entry)) s.journal.push(entry); }

/** Older chapters migrate without rewriting their content IDs, resources, or choices. */
export function decodeSave(text: string): GameState {
  const raw: unknown = JSON.parse(text);
  if (!raw || typeof raw !== 'object') throw new Error('This is not a Borrowed Tomorrow save.');
  const s = raw as Record<string, unknown>;
  if (s.format !== SAVE_FORMAT || ![1,2,SAVE_VERSION].includes(s.version as number)) throw new Error('Unsupported save format or version.');
  const validNumber = (x: unknown, max: number) => typeof x === 'number' && Number.isFinite(x) && x >= 0 && x <= max;
  const loc = s.location as GameState['location'] | undefined;
  const cMap=loc?.map==='cinderbank'||loc?.map==='infirmary',bMap=loc?.map==='rillbridge'||loc?.map==='sluice';
  if (!loc || !['station', 'yard', 'tunnel', 'rillbridge', 'sluice','cinderbank','infirmary'].includes(loc.map) || !Number.isInteger(loc.x) || !Number.isInteger(loc.y) ||
    !validNumber(loc.x,cMap?63:bMap?65:41) || !validNumber(loc.y,cMap?41:bMap?40:25)) throw new Error('The save location is invalid.');
  if (!validNumber(s.xp, 1e7) || !validNumber(s.coins, 1e7) || !validNumber(s.bandages, 999) || !validNumber(s.playSeconds, 1e9)) throw new Error('The save contains invalid progress.');
  if (!['disk-a','disk-b','disk-c'].includes(s.chapter as string) || (s.boundary !== null && !['disk-b:rillbridge-arrival','disk-c:ambulance-siding','disk-d:signal-works'].includes(s.boundary as string))) throw new Error('This chapter is not available in this build.');
  if (!Array.isArray(s.party) || s.party.length < 1 || s.party.length > 2 || s.party[0]?.id !== 'nell') throw new Error('The party is invalid.');
  const party: HeroState[] = [];
  for (const h of s.party) {
    if (!h || !['nell', 'orrin'].includes(h.id) || party.some(p => p.id === h.id) || !validNumber(h.hp, maxHp(h.id, { xp: s.xp as number })) || !validNumber(h.focus, 6)) throw new Error('The party is invalid.');
    party.push({ id: h.id, hp: h.hp, focus: h.focus });
  }
  if (!s.flags || typeof s.flags !== 'object' || Array.isArray(s.flags) || Object.values(s.flags).some(v => typeof v !== 'boolean')) throw new Error('Invalid story flags.');
  const flags: Record<string, boolean> = Object.create(null);
  for (const [id, value] of Object.entries(s.flags)) {
    if (!/^[a-zA-Z][a-zA-Z0-9_-]{0,80}$/.test(id) || ['constructor', 'prototype'].includes(id)) throw new Error('Invalid story flag.');
    flags[id] = value as boolean;
  }
  if (Boolean(flags.orrinJoined) !== party.some(h => h.id === 'orrin')) throw new Error('The party does not match the story progress.');
  if (s.chapter==='disk-a'&&(bMap||cMap||(s.boundary!==null&&s.boundary!=='disk-b:rillbridge-arrival'))) throw new Error('The chapter does not match this location.');
  if (s.chapter==='disk-b'&&(!flags.diskAComplete||!flags.diskBStarted||!flags.orrinJoined||cMap||(s.boundary!==null&&s.boundary!=='disk-c:ambulance-siding'))) throw new Error('The Disk B arrival is incomplete.');
  if (s.boundary==='disk-c:ambulance-siding'&&(!flags.diskBComplete||!flags.bEvacuated||!flags.bLarkspurReceived)) throw new Error('The Disk C departure is incomplete.');
  if (s.chapter==='disk-c'&&(!flags.diskBComplete||!flags.diskCStarted||!flags.orrinJoined||(s.boundary!==null&&s.boundary!=='disk-d:signal-works'))) throw new Error('The Disk C arrival is incomplete.');
  if (s.boundary==='disk-d:signal-works'&&(s.chapter!=='disk-c'||!flags.diskCComplete||!flags.cTransferred||!flags.cLarkspurReported)) throw new Error('The Disk D departure is incomplete.');
  if (flags.bOrchardChannel&&flags.bMillraceChannel) throw new Error('The outfall choices conflict.');
  if (flags.cTrainHeat&&flags.cWardHeat) throw new Error('The heating choices conflict.');
  const strings = (a: unknown, limit: number): a is string[] => Array.isArray(a) && a.length <= limit && a.every(v => typeof v === 'string' && /^[a-zA-Z0-9:_-]{1,80}$/.test(v));
  if (!strings(s.journal, 300) || !strings(s.gear, 30)) throw new Error('Invalid journal or equipment.');
  return { format: SAVE_FORMAT, version: SAVE_VERSION, chapter: s.chapter as string, location: { ...loc }, party,
    flags, coins: s.coins as number, bandages: s.bandages as number, xp: s.xp as number,
    gear: [...new Set(s.gear)], journal: [...new Set(s.journal)], boundary: s.boundary as string | null, playSeconds: s.playSeconds as number };
}

/** Called only after the pending arrival is validated; the caller loads assets before committing it. */
export function enterDiskB(state:GameState):GameState{
  if(state.chapter!=='disk-a'||state.boundary!=='disk-b:rillbridge-arrival'||!state.flags.diskAComplete||!state.flags.orrinJoined)throw new Error('Reach the saved Rillbridge arrival before starting Disk B.');
  const next=decodeSave(JSON.stringify(state));
  next.chapter='disk-b';next.boundary=null;next.flags.diskBStarted=true;
  next.location={map:'rillbridge',x:12,y:18};remember(next,'b-arrival');return next;
}

/** Leave the original departure intact until the caller has loaded both new maps. */
export function enterDiskC(state:GameState):GameState{
  if(state.chapter!=='disk-b'||state.boundary!=='disk-c:ambulance-siding'||!state.flags.diskBComplete||!state.flags.bEvacuated||!state.flags.bLarkspurReceived||!state.flags.orrinJoined)throw new Error('Reach the saved Cinderbank departure before starting Disk C.');
  const next=decodeSave(JSON.stringify(state));
  next.chapter='disk-c';next.boundary=null;next.flags.diskCStarted=true;
  next.location={map:'cinderbank',x:28,y:16};remember(next,'c-arrival');
  remember(next,next.flags.bOrchardChannel?'c-flour-credit':'c-harvest');
  return next;
}
