import { expect, it } from 'vitest';
import { chapterTwoStart } from '../src/dev/canonical-saves';
import { decodeSave, level } from '../src/rules/state';
import { resumeChapterTwo } from '../src/content/chapter-two/interactions';
import type { StoryHost } from '../src/content/chapter-one/interactions';

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
