import { heroAvailable } from './availability';
import { newInventory, type Inventory } from './inventory';
import { BASE_STATS } from './progression';

export const SAVE_FORMAT = 'borrowed-tomorrow';
export const SAVE_VERSION = 10;
export const CAMPAIGN = 'imperial-debt';
export const NEXT_CHAPTER = 'chapter-two:iron-coast';
export const THIRD_CHAPTER = 'chapter-three:capital';
export const FOURTH_CHAPTER = 'chapter-four:broken-world';
export const FIFTH_CHAPTER = 'chapter-five:anchors';
export const SIXTH_CHAPTER = 'chapter-six:capital-approach';
export const SEVENTH_CHAPTER='chapter-seven:hollow-sun';
export type HeroId = 'nell' | 'orrin' | 'kit' | 'celia' | 'petra';
export type MapId = 'hollowsill'|'takenwater'|'firstfield'|'quietward'|'seasonstreet'|'lastrefuge'|'sunthrone'|'homecoming'|'seaholiday'|'stillcity'|'lastpalace'|'lastmorning'|'lastshore'|'crown'|'laststation'|'bellharbor' | 'frostwatch' | 'glacier' | 'wintershrine' | 'capitalquay' | 'riverhaven' | 'canopy' | 'rainhouse' | 'outermooring' | 'namar' | 'sunpalace' | 'skywalk' | 'observatory' | 'station' | 'yard' | 'rillbridge' | 'tunnel' | 'coast' | 'infirmary' | 'cinderbank' | 'northglass' | 'relayhall' | 'conduit' | 'refuge' | 'breakwater' | 'sanctuary' | 'airfield' | 'airship' | 'hammerplain' | 'coolingworks' | 'anchorforge' | 'dawnwatch' | 'watchbarracks' | 'signalwall' | 'observation' | 'windmere' | 'dispensary' | 'mirrorward' | 'flagship';
export interface HeroState { id: HeroId; hp: number; focus: number }
export interface GameState {
  format: typeof SAVE_FORMAT;
  version: typeof SAVE_VERSION;
  campaign: typeof CAMPAIGN;
  chapter: 'chapter-one' | 'chapter-two' | 'chapter-three' | 'chapter-four' | 'chapter-five' | 'chapter-six' | 'chapter-seven';
  location: { map: MapId; x: number; y: number };
  party: HeroState[];
  activeParty: HeroId[];
  flags: Record<string, boolean>;
  coins: number;
  bandages: number;
  xp: number;
  inventory: Inventory;
  journal: string[];
  boundary: typeof NEXT_CHAPTER | typeof THIRD_CHAPTER | typeof FOURTH_CHAPTER | typeof FIFTH_CHAPTER | typeof SIXTH_CHAPTER | typeof SEVENTH_CHAPTER | null;
  playSeconds: number;
}
export function newGame(): GameState {
  return {
    format: SAVE_FORMAT, version: SAVE_VERSION, campaign: CAMPAIGN, chapter: 'chapter-one',
    location: { map: 'station', x: 21, y: 16 }, party: [{ id: 'nell', hp: 42, focus: 6 }], activeParty: ['nell'],
    flags: {}, coins: 18, bandages: 5, xp: 0, inventory: newInventory(), journal: ['home'], boundary: null, playSeconds: 0,
  };
}
export const level = (s: Pick<GameState, 'xp'>) => s.xp >= 8200 ? 15 : s.xp >= 6600 ? 14 : s.xp >= 5200 ? 13 : s.xp >= 4000 ? 12 : s.xp >= 3500 ? 11 : s.xp >= 1490 ? 10 : s.xp >= 1180 ? 9 : s.xp >= 920 ? 8 : s.xp >= 700 ? 7 : s.xp >= 520 ? 6 : s.xp >= 370 ? 5 : s.xp >= 250 ? 4 : s.xp >= 130 ? 3 : s.xp >= 50 ? 2 : 1;
export const maxHp = (id: HeroId, s: Pick<GameState, 'xp'>) => BASE_STATS[id].maxHp + (level(s) - 1) * 6;
export function restoreParty(s: GameState) { for (const hero of s.party) { if(!heroAvailable(s,hero.id))continue;hero.hp = maxHp(hero.id, s); hero.focus = 6; } }
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
  if (!heroAvailable(s,id) || id==='nell'&&!s.flags.nellIll || !included&&s.activeParty.length<=1 || !s.party.some(h => h.id === id) || s.activeParty.includes(id) === included) return false;
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
export function beginChapterSix(s:GameState):boolean {
  if(s.chapter!=='chapter-five'||s.boundary!==SIXTH_CHAPTER||!s.flags.chapterFiveComplete)return false;
  s.chapter='chapter-six';s.boundary=null;s.location={map:'outermooring',x:32,y:29};return true;
}
export const partyLeader=(s:GameState):HeroId=>s.activeParty.includes('nell')?'nell':s.activeParty[0];
export function remember(s: GameState, entry: string) { if (!s.journal.includes(entry)) s.journal.push(entry); }

/** The fragment survives only the recovered capital outcome. Load the domain first. */
export function beginChapterSeven(s:GameState):boolean {
 if(s.chapter!=='chapter-six'||s.boundary!==SEVENTH_CHAPTER||!s.flags.chapterSixComplete||!s.flags.nellRecovered||s.flags.nellLost)return false;
 s.chapter='chapter-seven';s.boundary=null;s.location={map:'hollowsill',x:32,y:34};return true;
}
