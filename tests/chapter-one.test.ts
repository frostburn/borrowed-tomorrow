import { describe, expect, it } from 'vitest';
import { decodeSave, newGame, NEXT_CHAPTER } from '../src/rules/state';
import { MAPS, walkable, worldPath } from '../src/content/maps';
import { interactChapterOne, resumeChapter, type StoryHost } from '../src/content/chapter-one/interactions';
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
    battle: id => { battle = id; }, shop() {}, boundary() {}, toast() {}, endingMusic() {},
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

it('all map interactions have a connected, walkable approach', () => {
  const starts = { dawnwatch:{x:9,y:32},watchbarracks:{x:12,y:31},signalwall:{x:14,y:32},observation:{x:32,y:29}, airfield:{x:24,y:30},airship:{x:32,y:26},hammerplain:{x:8,y:30},coolingworks:{x:10,y:30},anchorforge:{x:13,y:30},refuge:{x:31,y:22},breakwater:{x:31,y:27},sanctuary:{x:32,y:32},northglass:{x:32,y:31},relayhall:{x:31,y:32},conduit:{x:25,y:30},coast: { x: 24, y: 26 }, infirmary: { x: 31, y: 24 }, cinderbank: { x: 27, y: 22 }, station: { x: 21, y: 16 }, yard: { x: 35, y: 18 }, rillbridge: { x: 12, y: 18 }, tunnel: { x: 3, y: 13 } };
  for (const map of Object.values(MAPS)) for (const object of map.objects) {
    const approaches = [{ x: object.x, y: object.y }, { x: object.x - 1, y: object.y }, { x: object.x + 1, y: object.y }, { x: object.x, y: object.y - 1 }, { x: object.x, y: object.y + 1 }];
    expect(approaches.some(p => walkable(map, p.x, p.y) && (p.x === starts[map.id].x && p.y === starts[map.id].y || worldPath(map, starts[map.id], p).length > 0)), `${map.id}: ${object.id}`).toBe(true);
  }
});

it('cutscene actors stay on the visible walking surfaces, including each staged move', () => {
  const scripts = { station: [scenes.opening(), scenes.raid()], yard: [scenes.recruit()], rillbridge: [scenes.stillness(), scenes.collector(), scenes.releaseVillage()], tunnel: [scenes.passArrival(), scenes.confrontation(), scenes.departure()] };
  for (const [map, entries] of Object.entries(scripts)) for (const entry of entries) {
    const points = [...entry.scene!.actors.map(a => a.at), ...entry.lines.flatMap(l => Object.values(l.shot?.actors ?? {}).flatMap(d => [d?.at, d?.to].filter(p => !!p)))];
    for (const p of points) expect(walkable(MAPS[map as keyof typeof MAPS], p!.x, p!.y), `${entry.scene!.id}: ${p!.x},${p!.y}`).toBe(true);
  }
});
