import { properties } from '../src/content/tilemaps';
import { describe, expect, it } from 'vitest';
import { newGame, NEXT_CHAPTER } from '../src/rules/state';
import { decodeSave } from '../src/rules/save';
import { arrival, MAPS, walkable, worldPath } from '../src/content/maps';
import { interactChapterOne, resumeChapter } from '../src/content/chapter-one/interactions';
import type { StoryHost } from '../src/content/story-host';
import { objective } from '../src/content/chapter-one/story';
import type { Dialogue } from '../src/content/dialogue';
import * as scenes from '../src/content/scenes';
import { receiveItem, equipItem } from '../src/rules/inventory';
import { checkpoint } from './support/progress';

function visit(state = newGame()) {
  let dialogue: Dialogue | undefined, battle: string | undefined, traveled = false;
  const host: StoryHost = {
    state, talk: d => { dialogue = d; }, commit: (flag, entry) => { state.flags[flag] = true; if (entry) state.journal.push(entry); },
    refresh() {}, save() {}, travel: (map, x, y) => { state.location = { map, x, y }; traveled = true; },
    battle: id => { battle = id; }, shop() {}, boundary() {}, toast() {}, async checkpoint(){return true;},endingMusic(){},
  };
  return { host, state, read: () => dialogue!, battle: () => battle, traveled: () => traveled };
}

describe('campaign saves', () => {
  it('round-trips a departure and rejects old stories without inventing progress', () => {
    const s = checkpoint('chapterOneComplete'); s.flags.workshopWon = true; receiveItem(s.inventory,'brass-reflector'); equipItem(s.inventory,'nell','brass-reflector'); s.bandages = 11;
    expect(decodeSave(JSON.stringify(s))).toEqual(s);
    expect(s.boundary).toBe(NEXT_CHAPTER);
    for (const version of [1, 2, 3, 4, 5, 6, 7, 8, 9, 11]) expect(() => decodeSave(JSON.stringify({ ...s, version }))).toThrow('Unsupported save format');
  });
  it('rejects malformed parties, unopened routes and impossible departures', () => {
    const s = newGame();
    for (const bad of [
      { ...s, coins: -1 }, { ...s, campaign: 'old-railway' }, { ...s, location: { map: 'tunnel', x: 3, y: 13 } },
      { ...s, boundary: NEXT_CHAPTER }, { ...s, flags: { captainDefeated: true } },
      { ...s, party: [{ id: 'nell', hp: 1e9, focus: 6 }] }, { ...s, flags: { orrinJoined: true } },
      { ...s, flags: { constructor: true } }, { ...s, inventory: { ...s.inventory, bag: { 'unavailable-sword': 1 } } },
    ]) expect(() => decodeSave(JSON.stringify(bad))).toThrow();
  });
});

describe('chapter progression', () => {
  it('does not commit an interrupted scene, but completion and skipping share one callback', () => {
    const { host, read, state } = visit(); resumeChapter(host);
    expect(state.flags.festivalSeen).toBeUndefined();
    read().done!(); expect(state.flags.festivalSeen).toBe(true);
    interactChapterOne(host, 'tomas'); expect(state.flags.raidSeen).toBeUndefined();
    read().done!(); expect(state.flags.raidSeen).toBe(true);
    expect(decodeSave(JSON.stringify(state)).journal).toContain('raid');
  });
  it('protects the pursuit and collector gates, then pays off the village rescue', () => {
    const locked = visit(checkpoint('raidSeen')); interactChapterOne(locked.host, 'west-yard'); expect(locked.traveled()).toBe(false);
    const v = visit(checkpoint('collectorDefeated')); interactChapterOne(v.host, 'east-pass'); expect(v.traveled()).toBe(false);
    interactChapterOne(v.host, 'release'); v.read().done!();
    interactChapterOne(v.host, 'tilda'); expect(v.read().lines[0].text).toContain('taken down the imperial lamps');
    interactChapterOne(v.host, 'east-pass'); expect(v.state.location.map).toBe('tunnel');
    expect(decodeSave(JSON.stringify(v.state)).flags.villageFreed).toBe(true);
  });
  it('a completed boss introduction resumes at the battle and shelter supplies cannot be farmed', () => {
    const v = visit(checkpoint('passSeen')); interactChapterOne(v.host, 'captain');
    expect(v.battle()).toBeUndefined(); v.read().done!(); expect(v.battle()).toBe('captain');
    const restored = visit(decodeSave(JSON.stringify(v.state))); interactChapterOne(restored.host, 'captain'); expect(restored.battle()).toBe('captain');
    const before = v.state.bandages;
    for (let i = 0; i < 2; i++) { interactChapterOne(v.host, 'shelter'); v.read().choices![0].action(); }
    expect(v.state.bandages).toBe(before + 2);
  });
  it('offers a real destination after the captain and saves the final handoff', () => {
    const v = visit(checkpoint('captainDefeated')); expect(objective(v.state)).toContain('Board Orrin');
    interactChapterOne(v.host, 'departure'); expect(v.state.boundary).toBeNull(); v.read().done!();
    const restored = decodeSave(JSON.stringify(v.state));
    expect(restored.boundary).toBe(NEXT_CHAPTER); expect(restored.journal).toContain('departure');
  });
});

// Keep the same campaign-wide coverage without one timeout growing with every chapter.
for (const map of Object.values(MAPS)) it(`${map.id}: every interaction has a connected, walkable approach`, () => {
  for (const object of map.objects) {
    const start=arrival(map.id,String(properties(map.tiles!).safeArrival));
    // A gated exit is reachable in the state that actually opens its passage.
    const state={flags:object.accessFlag?{[object.accessFlag]:true}:{}};
    const approaches = [{ x: object.x, y: object.y }, { x: object.x - 1, y: object.y }, { x: object.x + 1, y: object.y }, { x: object.x, y: object.y - 1 }, { x: object.x, y: object.y + 1 }];
    expect(approaches.some(p => walkable(map, p.x, p.y,state) && (p.x === start.x && p.y === start.y || worldPath(map, start, p,state).length > 0)), `${map.id}: ${object.id}`).toBe(true);
  }
});

it('cutscene actors stay on the visible walking surfaces, including each staged move', () => {
  const scripts = { station: [scenes.opening(), scenes.raid()], yard: [scenes.recruit()], rillbridge: [scenes.stillness(), scenes.collector(), scenes.releaseVillage()], tunnel: [scenes.passArrival(), scenes.confrontation(), scenes.departure()] };
  for (const [map, entries] of Object.entries(scripts)) for (const entry of entries) {
    const points = [...entry.scene!.actors.map(a => a.at), ...entry.lines.flatMap(l => Object.values(l.shot?.actors ?? {}).flatMap(d => [d?.at, d?.to].filter(p => !!p)))];
    for (const p of points) expect(walkable(MAPS[map as keyof typeof MAPS], p!.x, p!.y), `${entry.scene!.id}: ${p!.x},${p!.y}`).toBe(true);
  }
});
