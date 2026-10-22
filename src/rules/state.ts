import { decodeInventory, newInventory, type Inventory } from './inventory';
import { BASE_STATS } from './progression';
import { validParty } from './party';

export const SAVE_FORMAT = 'borrowed-tomorrow';
export const SAVE_VERSION = 10;
export const CAMPAIGN = 'imperial-debt';
export const NEXT_CHAPTER = 'chapter-two:iron-coast';
export const THIRD_CHAPTER = 'chapter-three:capital';
export const FOURTH_CHAPTER = 'chapter-four:broken-world';
export const FIFTH_CHAPTER = 'chapter-five:anchors';
export type HeroId = 'nell' | 'orrin' | 'kit' | 'celia' | 'petra';
export type MapId = 'station' | 'yard' | 'rillbridge' | 'tunnel' | 'coast' | 'infirmary' | 'cinderbank' | 'northglass' | 'relayhall' | 'conduit' | 'refuge' | 'breakwater' | 'sanctuary' | 'airfield' | 'airship' | 'hammerplain' | 'coolingworks' | 'anchorforge';
export interface HeroState { id: HeroId; hp: number; focus: number }
export interface GameState {
  format: typeof SAVE_FORMAT;
  version: typeof SAVE_VERSION;
  campaign: typeof CAMPAIGN;
  chapter: 'chapter-one' | 'chapter-two' | 'chapter-three' | 'chapter-four' | 'chapter-five';
  location: { map: MapId; x: number; y: number };
  party: HeroState[];
  activeParty: HeroId[];
  flags: Record<string, boolean>;
  coins: number;
  bandages: number;
  xp: number;
  inventory: Inventory;
  journal: string[];
  boundary: typeof NEXT_CHAPTER | typeof THIRD_CHAPTER | typeof FOURTH_CHAPTER | typeof FIFTH_CHAPTER | null;
  playSeconds: number;
}
export function newGame(): GameState {
  return {
    format: SAVE_FORMAT, version: SAVE_VERSION, campaign: CAMPAIGN, chapter: 'chapter-one',
    location: { map: 'station', x: 21, y: 16 }, party: [{ id: 'nell', hp: 42, focus: 6 }], activeParty: ['nell'],
    flags: {}, coins: 18, bandages: 5, xp: 0, inventory: newInventory(), journal: ['home'], boundary: null, playSeconds: 0,
  };
}
export const level = (s: Pick<GameState, 'xp'>) => s.xp >= 1490 ? 10 : s.xp >= 1180 ? 9 : s.xp >= 920 ? 8 : s.xp >= 700 ? 7 : s.xp >= 520 ? 6 : s.xp >= 370 ? 5 : s.xp >= 250 ? 4 : s.xp >= 130 ? 3 : s.xp >= 50 ? 2 : 1;
export const maxHp = (id: HeroId, s: Pick<GameState, 'xp'>) => BASE_STATS[id].maxHp + (level(s) - 1) * 6;
export function restoreParty(s: GameState) { for (const hero of s.party) { hero.hp = maxHp(hero.id, s); hero.focus = 6; } }
export function recruitOrrin(s: GameState) {
  if (!s.party.some(h => h.id === 'orrin')) s.party.push({ id: 'orrin', hp: maxHp('orrin', s), focus: 6 });
  if (!s.activeParty.includes('orrin') && s.activeParty.length < 3) s.activeParty.push('orrin');
  s.flags.orrinJoined = true;
}
export function recruit(s: GameState, id: 'kit' | 'celia' | 'petra') {
  if (!s.party.some(h => h.id === id)) {
    s.party.push({ id, hp: maxHp(id, s), focus: 6 });
    if (s.activeParty.length < 3) s.activeParty.push(id);
  }
  s.flags[`${id}Joined`] = true;
}
export function setActive(s: GameState, id: HeroId, included: boolean): boolean {
  if (id === 'nell' || !s.party.some(h => h.id === id) || s.activeParty.includes(id) === included) return false;
  if (included && s.activeParty.length >= 3) return false;
  s.activeParty = included ? [...s.activeParty, id] : s.activeParty.filter(h => h !== id);
  return true;
}
/** Call only after the next region has loaded successfully. Preserve every earned resource. */
export function beginChapterTwo(s: GameState): boolean {
  if (s.chapter !== 'chapter-one' || s.boundary !== NEXT_CHAPTER || !s.flags.chapterOneComplete) return false;
  s.chapter = 'chapter-two'; s.boundary = null; s.location = { map: 'coast', x: 24, y: 26 };
  return true;
}
export function beginChapterThree(s: GameState): boolean {
  if (s.chapter !== 'chapter-two' || s.boundary !== THIRD_CHAPTER || !s.flags.chapterTwoComplete) return false;
  s.chapter='chapter-three';s.boundary=null;s.location={map:'northglass',x:32,y:31};
  return true;
}
export function beginChapterFour(s:GameState):boolean {
  if(s.chapter!=='chapter-three'||s.boundary!==FOURTH_CHAPTER||!s.flags.chapterThreeComplete)return false;
  s.chapter='chapter-four';s.boundary=null;s.location={map:'refuge',x:31,y:28};return true;
}
export function beginChapterFive(s:GameState):boolean {
  if(s.chapter!=='chapter-four'||s.boundary!==FIFTH_CHAPTER||!s.flags.chapterFourComplete)return false;
  s.chapter='chapter-five';s.boundary=null;s.location={map:'airfield',x:24,y:30};return true;
}
export const partyLeader=(_s:GameState):HeroId=>'nell';
export function remember(s: GameState, entry: string) { if (!s.journal.includes(entry)) s.journal.push(entry); }

/** Validate the current save format; older formats are not migrated. */
export function decodeSave(text: string): GameState {
  const raw: unknown = JSON.parse(text);
  if (!raw || typeof raw !== 'object') throw new Error('This is not a Borrowed Tomorrow save.');
  const s = raw as Record<string, unknown>;
  if (s.format !== SAVE_FORMAT || s.version !== SAVE_VERSION || s.campaign !== CAMPAIGN) throw new Error('Unsupported save format or campaign.');
  const number = (x: unknown, max: number): x is number => typeof x === 'number' && Number.isFinite(x) && x >= 0 && x <= max;
  const loc = s.location as GameState['location'] | undefined;
  if (!loc || !['station', 'yard', 'rillbridge', 'tunnel', 'coast', 'infirmary', 'cinderbank', 'northglass', 'relayhall', 'conduit', 'refuge', 'breakwater', 'sanctuary','airfield','airship','hammerplain','coolingworks','anchorforge'].includes(loc.map) || !Number.isInteger(loc.x) || !Number.isInteger(loc.y) ||
    !number(loc.x, loc.map==='rillbridge' ? 65 : ['coast','infirmary','cinderbank','northglass','relayhall','conduit','refuge','breakwater','sanctuary','airfield','airship','hammerplain','coolingworks','anchorforge'].includes(loc.map) ? 63 : 41) || !number(loc.y, loc.map==='rillbridge' ? 40 : ['coast','infirmary','cinderbank','northglass','relayhall','conduit','refuge','breakwater','sanctuary','airfield','airship','hammerplain','coolingworks','anchorforge'].includes(loc.map) ? 41 : 25)) throw new Error('The save location is invalid.');
  if (!number(s.xp, 1e7) || !number(s.coins, 1e7) || !number(s.bandages, 999) || !number(s.playSeconds, 1e9)) throw new Error('The save contains invalid progress.');
  if (!['chapter-one','chapter-two','chapter-three','chapter-four','chapter-five'].includes(s.chapter as string) || (s.boundary !== null && s.boundary !== NEXT_CHAPTER && s.boundary !== THIRD_CHAPTER && s.boundary !== FOURTH_CHAPTER && s.boundary !== FIFTH_CHAPTER)) throw new Error('This chapter is not available in this build.');
  if (!Array.isArray(s.party) || s.party.length < 1 || s.party.length > (['chapter-four','chapter-five'].includes(s.chapter as string) ? 5 : s.chapter === 'chapter-three' ? 4 : 3) || s.party[0]?.id !== 'nell') throw new Error('The party is invalid.');
  const party: HeroState[] = [];
  for (const h of s.party) {
    if (!h || !['nell', 'orrin', 'kit', 'celia', 'petra'].includes(h.id) || party.some(p => p.id === h.id) || !number(h.hp, maxHp(h.id, { xp: s.xp })) || !number(h.focus, 6)) throw new Error('The party is invalid.');
    party.push({ id: h.id, hp: h.hp, focus: h.focus });
  }
  if (!s.flags || typeof s.flags !== 'object' || Array.isArray(s.flags) || Object.values(s.flags).some(v => typeof v !== 'boolean')) throw new Error('Invalid story flags.');
  const flags: Record<string, boolean> = Object.create(null);
  for (const [id, value] of Object.entries(s.flags)) {
    if (!/^[a-zA-Z][a-zA-Z0-9_-]{0,80}$/.test(id) || ['constructor', 'prototype', '__proto__'].includes(id)) throw new Error('Invalid story flag.');
    flags[id] = value as boolean;
  }
  for (const id of ['orrin','kit','celia','petra'] as const) if (Boolean(flags[`${id}Joined`]) !== party.some(h => h.id === id)) throw new Error('The party does not match the story progress.');
  const activeParty = s.activeParty;
  if (!validParty(activeParty, party.map(h => h.id)) || !activeParty.includes('nell')) throw new Error('The active party is invalid.');
  const prerequisites: Record<string, string> = {
    raidSeen: 'festivalSeen', escapeWon: 'raidSeen', orrinJoined: 'escapeWon', workshopWon: 'orrinJoined',
    villageSeen: 'orrinJoined', collectorConfronted: 'villageSeen', collectorDefeated: 'collectorConfronted',
    villageFreed: 'collectorDefeated', passSeen: 'villageFreed', captainConfronted: 'passSeen',
    captainDefeated: 'captainConfronted', chapterOneComplete: 'captainDefeated',
    coastSeen: 'chapterOneComplete', kitJoined: 'coastSeen', raidPlanned: 'kitJoined', raidConfronted: 'raidPlanned',
    trainRaidWon: 'raidConfronted', prisonersFreed: 'trainRaidWon', celiaJoined: 'worksArrival', wardSeen: 'prisonersFreed',
    settlementSeen: 'wardSeen', coastCollectorWon: 'settlementSeen', evacuationReady: 'coastCollectorWon',
    recaptureConfronted: 'evacuationReady', recaptureWon: 'recaptureConfronted', chapterTwoComplete: 'recaptureWon',
    capitalSeen:'chapterTwoComplete',capitalConfronted:'capitalSeen',capitalGateWon:'capitalConfronted',petraJoined:'capitalGateWon',
    worksSeen:'petraJoined',worksWardenWon:'worksSeen',tomasRescued:'worksWardenWon',palaceStoresWon:'worksSeen',
    intakePlanned:'tomasRescued',conduitSeen:'intakePlanned',conduitGuardWon:'conduitSeen',extractionStopped:'conduitGuardWon',
    emperorMerged:'extractionStopped',chapterThreeComplete:'emperorMerged',
    refugeSeen:'chapterThreeComplete',worksArrival:'refugeSeen',worksRouteSet:'worksArrival',
    worksGateWon:'worksRouteSet',worksStoresWon:'worksArrival',harborOpened:'worksGateWon',
    sanctuaryEntered:'harborOpened',roadGuardWon:'sanctuaryEntered',signalCut:'roadGuardWon',
    sanctuaryWardenWon:'signalCut',sanctuaryCache:'sanctuaryEntered',anchorsKnown:'sanctuaryWardenWon',seaWalkSeen:'anchorsKnown',chapterFourComplete:'seaWalkSeen',
    airfieldSeen:'chapterFourComplete',airfieldGuardWon:'airfieldSeen',airshipOwned:'airfieldGuardWon',firstFlightSeen:'airshipOwned',
    hammerplainSeen:'firstFlightSeen',coolingSeen:'hammerplainSeen',forgeRouteSet:'coolingSeen',forgeApproachWon:'forgeRouteSet',
    coolingOpened:'forgeApproachWon',forgeGantrySeen:'coolingOpened',furnaceConfronted:'forgeGantrySeen',furnaceWon:'furnaceConfronted',
    hammerplainFreed:'furnaceWon',hammerplainComplete:'hammerplainFreed',fleetSighted:'hammerplainComplete',forgeStoresWon:'hammerplainSeen',
  };
  for (const [flag, required] of Object.entries(prerequisites)) if (flags[flag] && !flags[required]) throw new Error('The story checkpoint is incomplete.');
  if ((loc.map === 'yard' && !flags.escapeWon) || (loc.map === 'rillbridge' && !flags.orrinJoined) || (loc.map === 'tunnel' && !flags.villageFreed)) throw new Error('This route has not opened yet.');
  if (s.chapter === 'chapter-one') {
    if ((s.boundary!==null&&s.boundary!==NEXT_CHAPTER) || !['station','yard','rillbridge','tunnel'].includes(loc.map)) throw new Error('The chapter departure is incomplete.');
    if (Boolean(flags.chapterOneComplete) !== (s.boundary === NEXT_CHAPTER) || party.some(h => h.id === 'kit' || h.id === 'celia' || h.id === 'petra') || ['coast','infirmary','cinderbank'].includes(loc.map) || flags.coastSeen || flags.chapterTwoComplete || flags.capitalSeen) throw new Error('The chapter departure is incomplete.');
  } else if (s.chapter === 'chapter-two') {
    if ((s.boundary!==null&&s.boundary!==THIRD_CHAPTER) || party.some(h=>h.id==='petra') || flags.capitalSeen) throw new Error('The chapter departure is incomplete.');
    if (!flags.chapterOneComplete || !['coast','infirmary','cinderbank'].includes(loc.map) || Boolean(flags.chapterTwoComplete) !== (s.boundary === THIRD_CHAPTER)) throw new Error('The chapter departure is incomplete.');
    if ((loc.map === 'infirmary' && !flags.prisonersFreed) || (loc.map === 'cinderbank' && !flags.wardSeen)) throw new Error('This route has not opened yet.');
  }
  if (s.chapter === 'chapter-three') {
    if (!flags.chapterTwoComplete || !['northglass','relayhall','conduit'].includes(loc.map) || Boolean(flags.chapterThreeComplete)!==(s.boundary===FOURTH_CHAPTER) || (s.boundary!==null&&s.boundary!==FOURTH_CHAPTER)) throw new Error('The chapter departure is incomplete.');
    if ((loc.map==='relayhall'&&!flags.petraJoined)||(loc.map==='conduit'&&!flags.intakePlanned)) throw new Error('This route has not opened yet.');
    if (flags.intakePlanned && typeof flags.pressureRoute!=='boolean') throw new Error('The intake route is missing.');
  }
  if (!['chapter-four','chapter-five'].includes(s.chapter as string) && (flags.celiaJoined || party.some(h => h.id === 'celia'))) throw new Error('Celia has not joined in these chapters.');
  if(s.chapter==='chapter-four'){
    if(!flags.chapterThreeComplete||!['refuge','breakwater','sanctuary'].includes(loc.map)||Boolean(flags.chapterFourComplete)!==(s.boundary===FIFTH_CHAPTER)||(s.boundary!==null&&s.boundary!==FIFTH_CHAPTER))throw new Error('The chapter departure is incomplete.');
    if(flags.worksRouteSet&&typeof flags.worksFlooded!=='boolean')throw new Error('The harbor route is missing.');
    if(Boolean(flags.worksArrival)!==Boolean(flags.celiaJoined))throw new Error('Celia’s introduction is incomplete.');
    if((loc.map==='breakwater'&&!flags.refugeSeen)||(loc.map==='sanctuary'&&!flags.harborOpened))throw new Error('This route has not opened yet.');
  }else if(s.chapter!=='chapter-five'&&(flags.refugeSeen||flags.worksArrival||flags.chapterFourComplete))throw new Error('The chapter departure is incomplete.');
  if(s.chapter==='chapter-five'){
    if(!flags.chapterFourComplete||s.boundary!==null||!['airfield','airship','hammerplain','coolingworks','anchorforge'].includes(loc.map))throw new Error('The chapter departure is incomplete.');
    if(!flags.celiaJoined||typeof flags.worksFlooded!=='boolean')throw new Error('The harbor checkpoint is incomplete.');
    if(loc.map!=='airfield'&&!flags.airshipOwned)throw new Error('The survey ship has not been acquired.');
    if(['hammerplain','coolingworks','anchorforge'].includes(loc.map)&&!flags.firstFlightSeen)throw new Error('The first flight is incomplete.');
    if(loc.map==='coolingworks'&&!flags.hammerplainSeen||loc.map==='anchorforge'&&!flags.coolingOpened)throw new Error('This route has not opened yet.');
    if(flags.forgeRouteSet&&typeof flags.forgeFlooded!=='boolean')throw new Error('The cooling route is missing.');
  }else if(flags.airfieldSeen||flags.airshipOwned||flags.hammerplainSeen)throw new Error('The chapter departure is incomplete.');
  if (flags.raidPlanned && typeof flags.raidDiversion !== 'boolean') throw new Error('The raid route is missing.');
  const strings = (a: unknown, limit: number): a is string[] => Array.isArray(a) && a.length <= limit && a.every(v => typeof v === 'string' && /^[a-zA-Z0-9:_-]{1,80}$/.test(v));
  if (!strings(s.journal, 300)) throw new Error('Invalid journal.');
  const inventory = decodeInventory(JSON.stringify(s.inventory));
  return {
    format: SAVE_FORMAT, version: SAVE_VERSION, campaign: CAMPAIGN, chapter: s.chapter as GameState['chapter'], location: { ...loc }, party, activeParty: [...activeParty],
    flags, coins: s.coins, bandages: s.bandages, xp: s.xp, inventory, journal: [...new Set(s.journal)],
    boundary: s.boundary as GameState['boundary'], playSeconds: s.playSeconds,
  };
}
