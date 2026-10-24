import {SEVEN_MAP_IDS,SEVEN_PREREQUISITES,validateSeven} from '../content/chapter-seven/progress';
import { SIX_MAP_IDS,SIX_PREREQUISITES,validateSix } from '../content/chapter-six/progress';
import { heroAvailable } from './availability';
import { completedAnchors } from '../content/chapter-five/progress';
import { decodeInventory } from './inventory';
import { validParty } from './party';
import { SAVE_FORMAT,SAVE_VERSION,CAMPAIGN,NEXT_CHAPTER,THIRD_CHAPTER,FOURTH_CHAPTER,FIFTH_CHAPTER,SIXTH_CHAPTER,SEVENTH_CHAPTER,maxHp,type GameState,type HeroState } from './state';

/** Validate the current save format; older formats are not migrated. */
export function decodeSave(text: string): GameState {
  const raw: unknown = JSON.parse(text);
  if (!raw || typeof raw !== 'object') throw new Error('This is not a Borrowed Tomorrow save.');
  const s = raw as Record<string, unknown>;
  if (s.format !== SAVE_FORMAT || s.version !== SAVE_VERSION || s.campaign !== CAMPAIGN) throw new Error('Unsupported save format or campaign.');
  const number = (x: unknown, max: number): x is number => typeof x === 'number' && Number.isFinite(x) && x >= 0 && x <= max;
  const loc = s.location as GameState['location'] | undefined;
  if (!loc || ![...SEVEN_MAP_IDS,...SIX_MAP_IDS,'station', 'yard', 'rillbridge', 'tunnel', 'coast', 'infirmary', 'cinderbank', 'northglass', 'relayhall', 'conduit', 'refuge', 'breakwater', 'sanctuary','airfield','airship','hammerplain','coolingworks','anchorforge','dawnwatch','watchbarracks','signalwall','observation','windmere','dispensary','mirrorward','flagship'].includes(loc.map) || !Number.isInteger(loc.x) || !Number.isInteger(loc.y) ||
    !number(loc.x, loc.map==='rillbridge' ? 65 : [...SEVEN_MAP_IDS,...SIX_MAP_IDS,'coast','infirmary','cinderbank','northglass','relayhall','conduit','refuge','breakwater','sanctuary','airfield','airship','hammerplain','coolingworks','anchorforge','dawnwatch','watchbarracks','signalwall','observation','windmere','dispensary','mirrorward','flagship'].includes(loc.map) ? 63 : 41) || !number(loc.y, loc.map==='rillbridge' ? 40 : [...SEVEN_MAP_IDS,...SIX_MAP_IDS,'coast','infirmary','cinderbank','northglass','relayhall','conduit','refuge','breakwater','sanctuary','airfield','airship','hammerplain','coolingworks','anchorforge','dawnwatch','watchbarracks','signalwall','observation','windmere','dispensary','mirrorward','flagship'].includes(loc.map) ? 41 : 25)) throw new Error('The save location is invalid.');
  if (!number(s.xp, 1e7) || !number(s.coins, 1e7) || !number(s.bandages, 999) || !number(s.playSeconds, 1e9)) throw new Error('The save contains invalid progress.');
  if (!['chapter-one','chapter-two','chapter-three','chapter-four','chapter-five','chapter-six','chapter-seven'].includes(s.chapter as string) || (s.boundary !== null && s.boundary !== NEXT_CHAPTER && s.boundary !== THIRD_CHAPTER && s.boundary !== FOURTH_CHAPTER && s.boundary !== FIFTH_CHAPTER && s.boundary !== SIXTH_CHAPTER && s.boundary !== SEVENTH_CHAPTER)) throw new Error('This chapter is not available in this build.');
  if (!Array.isArray(s.party) || s.party.length < 1 || s.party.length > (['chapter-four','chapter-five','chapter-six','chapter-seven'].includes(s.chapter as string) ? 5 : s.chapter === 'chapter-three' ? 4 : 3) || s.party[0]?.id !== 'nell') throw new Error('The party is invalid.');
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
  if (!validParty(activeParty, party.filter(h=>heroAvailable({flags},h.id)).map(h => h.id)) || !flags.nellIll&&!activeParty.includes('nell')) throw new Error('The active party is invalid.');
  const prerequisites: Record<string, string> = {
    ...SIX_PREREQUISITES,...SEVEN_PREREQUISITES,
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
    flagshipApproachSeen:'allAnchorsSeen',flagshipConfronted:'flagshipApproachSeen',flagshipWon:'flagshipConfronted',benefactorClaimSeen:'flagshipWon',flagshipDestroyed:'benefactorClaimSeen',albanDestroyed:'flagshipDestroyed',nellIll:'flagshipDestroyed',retaliationSeen:'nellIll',retaliationWon:'retaliationSeen',chapterFiveComplete:'retaliationWon',
    airfieldSeen:'chapterFourComplete',airfieldGuardWon:'airfieldSeen',airshipOwned:'airfieldGuardWon',firstFlightSeen:'airshipOwned',
    hammerplainSeen:'firstFlightSeen',coolingSeen:'hammerplainSeen',forgeRouteSet:'coolingSeen',forgeApproachWon:'forgeRouteSet',
    coolingOpened:'forgeApproachWon',forgeGantrySeen:'coolingOpened',furnaceConfronted:'forgeGantrySeen',furnaceWon:'furnaceConfronted',
    hammerplainFreed:'furnaceWon',hammerplainComplete:'hammerplainFreed',forgeStoresWon:'hammerplainSeen',
    windmereSeen:'firstFlightSeen',dispensarySeen:'windmereSeen',windLiftConfronted:'dispensarySeen',windLiftWon:'windLiftConfronted',waterLiftOpened:'windLiftWon',patientsTransferred:'waterLiftOpened',mirrorWardSeen:'patientsTransferred',windGalleryWon:'mirrorWardSeen',wardEngineConfronted:'windGalleryWon',wardEngineWon:'wardEngineConfronted',windmereFreed:'wardEngineWon',windmereComplete:'windmereFreed',windReflectorTaken:'waterLiftOpened',
    dawnwatchSeen:'firstFlightSeen',shelterOpened:'dawnwatchSeen',watchGunsSeen:'shelterOpened',mortarConfronted:'watchGunsSeen',repeaterConfronted:'watchGunsSeen',mortarWon:'mortarConfronted',repeaterWon:'repeaterConfronted',aurelSeen:'watchGunsSeen',aurelConfronted:'aurelSeen',aurelWon:'aurelConfronted',dawnwatchFreed:'aurelWon',dawnwatchComplete:'dawnwatchFreed',watchCoatTaken:'watchGunsSeen',emperorOfferSeen:'fleetSighted',emperorOfferTold:'emperorOfferSeen',
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
  if (!['chapter-four','chapter-five','chapter-six','chapter-seven'].includes(s.chapter as string) && (flags.celiaJoined || party.some(h => h.id === 'celia'))) throw new Error('Celia has not joined in these chapters.');
  if(s.chapter==='chapter-four'){
    if(!flags.chapterThreeComplete||!['refuge','breakwater','sanctuary'].includes(loc.map)||Boolean(flags.chapterFourComplete)!==(s.boundary===FIFTH_CHAPTER)||(s.boundary!==null&&s.boundary!==FIFTH_CHAPTER))throw new Error('The chapter departure is incomplete.');
    if(flags.worksRouteSet&&typeof flags.worksFlooded!=='boolean')throw new Error('The harbor route is missing.');
    if(Boolean(flags.worksArrival)!==Boolean(flags.celiaJoined))throw new Error('Celia’s introduction is incomplete.');
    if((loc.map==='breakwater'&&!flags.refugeSeen)||(loc.map==='sanctuary'&&!flags.harborOpened))throw new Error('This route has not opened yet.');
  }else if(!['chapter-five','chapter-six','chapter-seven'].includes(s.chapter as string)&&(flags.refugeSeen||flags.worksArrival||flags.chapterFourComplete))throw new Error('The chapter departure is incomplete.');
  if(s.chapter==='chapter-five'||s.chapter==='chapter-six'||s.chapter==='chapter-seven'){
    if(s.chapter==='chapter-five'&&(!flags.chapterFourComplete||Boolean(flags.chapterFiveComplete)!==(s.boundary===SIXTH_CHAPTER)||(s.boundary!==null&&s.boundary!==SIXTH_CHAPTER)||!['airfield','airship','hammerplain','coolingworks','anchorforge','dawnwatch','watchbarracks','signalwall','observation','windmere','dispensary','mirrorward','flagship'].includes(loc.map)))throw new Error('The chapter departure is incomplete.');
    if(!flags.celiaJoined||typeof flags.worksFlooded!=='boolean')throw new Error('The harbor checkpoint is incomplete.');
    if(loc.map!=='airfield'&&!flags.airshipOwned)throw new Error('The survey ship has not been acquired.');
    if(['hammerplain','coolingworks','anchorforge','dawnwatch','watchbarracks','signalwall','observation','windmere','dispensary','mirrorward','flagship'].includes(loc.map)&&!flags.firstFlightSeen)throw new Error('The first flight is incomplete.');
    if(loc.map==='coolingworks'&&!flags.hammerplainSeen||loc.map==='anchorforge'&&!flags.coolingOpened)throw new Error('This route has not opened yet.');
    if((flags.aurelSeen||flags.watchCoatTaken)&&(!flags.mortarWon||!flags.repeaterWon))throw new Error('Both gun positions must be clear.');
    if(flags.fleetSighted&&completedAnchors({flags})<1)throw new Error('No anchor has been freed.');
    if((flags.emperorOfferSeen||loc.map==='observation')&&completedAnchors({flags})<2)throw new Error('The second anchor is incomplete.');
    if(loc.map==='watchbarracks'&&!flags.shelterOpened||loc.map==='signalwall'&&(!flags.mortarWon||!flags.repeaterWon))throw new Error('This route has not opened yet.');
    if((loc.map==='dispensary'&&!flags.windmereSeen)||(loc.map==='mirrorward'&&!flags.patientsTransferred))throw new Error('This route has not opened yet.');
    if(flags.allAnchorsSeen&&completedAnchors({flags})!==3)throw new Error('All three anchors must be disconnected.');
    if((flags.flagshipApproachSeen||loc.map==='flagship')&&(!flags.allAnchorsSeen||!flags.emperorOfferTold))throw new Error('The capital approach is not ready.');
    if(flags.benefactorClaimSeen&&(!flags.flagshipDestroyed||!flags.albanDestroyed||!flags.nellIll))throw new Error('The Benefactor checkpoint is incomplete.');
    if(loc.map==='flagship'&&!flags.flagshipWon)throw new Error('The flagship is still defended.');
    if(flags.forgeRouteSet&&typeof flags.forgeFlooded!=='boolean')throw new Error('The cooling route is missing.');
  }else if(flags.airfieldSeen||flags.airshipOwned||flags.hammerplainSeen||flags.dawnwatchSeen||flags.windmereSeen||flags.allAnchorsSeen||flags.fleetSighted||flags.emperorOfferSeen)throw new Error('The chapter departure is incomplete.');
  validateSix(s.chapter,s.boundary,loc,flags);validateSeven(s.chapter,s.boundary,loc,flags);
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
