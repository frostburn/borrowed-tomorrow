import { expect,it } from 'vitest';
import { CHAPTERS,nextChapter,mapsForRestore } from '../src/content/chapters';
import { MAPS } from '../src/content/maps';
import { decodeSave } from '../src/rules/save';
import { SIXTH_CHAPTER,newGame } from '../src/rules/state';
import { checkpoint,coastCheckpoint,palaceCheckpoint } from './support/progress';
import { anchorDeparture } from './support/anchors';

it('registers each shipped exploration map exactly once in its owning chapter',()=>{
 const maps=Object.values(CHAPTERS).flatMap(chapter=>chapter.maps);
 expect([...maps].sort()).toEqual(Object.keys(MAPS).sort());
 expect(new Set(maps).size).toBe(maps.length);
});
it('wires each completed departure to its own destination without changing resources',()=>{
 const endings=[checkpoint('chapterOneComplete'),coastCheckpoint('chapterTwoComplete'),palaceCheckpoint('chapterThreeComplete'),anchorDeparture()];
 for(const state of endings){
  const before=structuredClone(state),destination=nextChapter(state)!;
  expect(destination).toBeDefined();expect(state).toEqual(before);
  expect(destination.entry!.begin(state)).toBe(true);
  expect(destination.maps).toContain(state.location.map);expect(state.boundary).toBeNull();
  for(const field of ['party','activeParty','inventory','flags','coins','xp','bandages','playSeconds']as const)expect(state[field]).toEqual(before[field]);
  expect(decodeSave(JSON.stringify(state))).toEqual(state);
 }
 expect(nextChapter(newGame())).toBeUndefined();
 expect(nextChapter({chapter:'chapter-five',boundary:SIXTH_CHAPTER})?.title).toBe('Chapter Six');
 expect(nextChapter({chapter:'chapter-six',boundary:null})).toBeUndefined();
 expect(nextChapter({chapter:'chapter-one',boundary:SIXTH_CHAPTER})).toBeUndefined();
});
it('restores early maps locally and later chapters with their complete scene groups',()=>{
 const early=coastCheckpoint('wardSeen');expect(mapsForRestore(early)).toEqual([early.location.map]);
 const capital=palaceCheckpoint('tomasRescued');
 expect(mapsForRestore(capital)).toContain('conduit');expect(mapsForRestore(capital)).toContain(capital.location.map);
 const coast=anchorDeparture();coast.chapter='chapter-five';coast.location={map:'airfield',x:24,y:30};
 expect(mapsForRestore(coast)).toContain('flagship');expect(mapsForRestore(coast)).toContain('mirrorward');
});
