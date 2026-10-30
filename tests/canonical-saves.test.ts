import { expect, it } from 'vitest';
import { chapterTwoStart,chapterThreeStart,chapterFourStart } from '../src/dev/canonical-saves';
import * as canonical from '../src/dev/canonical-saves';
import {newSkillBook} from '../src/rules/skills';
import { level } from '../src/rules/state';
import { decodeSave } from '../src/rules/save';
import { resumeChapterTwo } from '../src/content/chapter-two/interactions';
import { resumeChapterThree } from '../src/content/chapter-three/interactions';
import { ownedCopies } from '../src/rules/inventory';
import type { StoryHost } from '../src/content/story-host';

it('starts Chapter Two from a fresh, valid Chapter One completion and replays Kit’s introduction',()=>{
  const state=chapterTwoStart();
  expect(decodeSave(JSON.stringify(state))).toEqual(state);expect(level(state)).toBe(3);
  expect(state.activeParty).toEqual(['nell','orrin']);expect(state.flags.kitJoined).toBeUndefined();expect(state.flags.coastSeen).toBeUndefined();
  expect(state.inventory.characters.nell.fitting).toBe('brass-reflector');expect(state.boundary).toBeNull();
  expect(state.location).toEqual({map:'coast',x:24,y:26});
  let scene:string|undefined;resumeChapterTwo({state,talk:d=>{scene=d.scene?.id;}} as StoryHost);expect(scene).toBe('two-coast');
  state.flags.coastSeen=true;state.inventory.bag['work-coat']=9;
  expect(chapterTwoStart().flags.coastSeen).toBeUndefined();expect(chapterTwoStart().inventory.bag['work-coat']).toBeUndefined();
});

it('starts Chapter Three with the rescued passengers, earned equipment and unrecruited Petra',()=>{
  const state=chapterThreeStart();
  expect(decodeSave(JSON.stringify(state))).toEqual(state);expect(level(state)).toBe(5);expect(state.xp).toBe(420);
  expect(state.activeParty).toEqual(['nell','orrin','kit']);expect(state.party.map(h=>h.id)).toEqual(state.activeParty);
  expect(state.flags.recaptureWon).toBe(true);expect(state.flags.raidDiversion).toBe(false);
  expect(state.flags.petraJoined).toBeUndefined();expect(state.flags.capitalSeen).toBeUndefined();expect(state.boundary).toBeNull();
  expect(state.location).toEqual({map:'northglass',x:32,y:31});
  expect(state.inventory.characters.kit.fitting).toBe('courier-sight');expect(state.inventory.characters.orrin.coat).toBe('work-coat');
  expect(ownedCopies(state.inventory,'courier-sight')).toBe(1);expect(ownedCopies(state.inventory,'work-coat')).toBe(1);
  expect(state.journal).toContain('capitalDeparture');
  let scene:string|undefined;resumeChapterThree({state,talk:d=>{scene=d.scene?.id;}} as StoryHost);expect(scene).toBe('three-capital');
  state.flags.capitalSeen=true;state.inventory.bag['ratchet-sight']=4;
  expect(chapterThreeStart().flags.capitalSeen).toBeUndefined();expect(chapterThreeStart().inventory.bag['ratchet-sight']).toBeUndefined();
});

it('starts the rewritten Chapter Four with a safe Tomas, four recruits and no forced separation',()=>{
 const s=chapterFourStart();expect(decodeSave(JSON.stringify(s))).toEqual(s);
 expect(s.xp).toBe(740);expect(s.party.map(h=>h.id)).toEqual(['nell','orrin','kit','petra']);expect(s.activeParty).toEqual(['nell','orrin','kit']);
 expect(s.flags.tomasRescued).toBe(true);expect(s.flags.celiaJoined).toBeUndefined();expect(s.flags.refugeSeen).toBeUndefined();expect(s.location).toEqual({map:'refuge',x:31,y:28});
 expect(s.inventory.characters.petra.fitting).toBe('saber-hilt');expect(s.inventory.characters.nell.fitting).toBe('silver-reflector');
});

it('every canonical save uses the automatic schedule for the entire roster, including future recruits',()=>{
 for(const make of Object.values(canonical))for(const recovered of [false,true]){
  const s=make(recovered);expect(s.skills).toEqual(newSkillBook(level(s)));expect(decodeSave(JSON.stringify(s))).toEqual(s);
 }
});
