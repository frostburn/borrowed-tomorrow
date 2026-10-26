import {describe,it,expect} from 'vitest';
import {lifePaused,lifeStep,sceneryAngle,swayingScenery} from '../src/content/map-life';

describe('ambient scenery respects collection and authored geometry',()=>{
 it('keeps collected water and vegetation still until the local release',()=>{
  for(const [map,flag]of [['rillbridge','villageFreed'],['cinderbank','coastCollectorWon'],['refuge','sanctuaryWardenWon'],['breakwater','sanctuaryWardenWon'],['sanctuary','sanctuaryWardenWon']]){
   expect(lifePaused(map,{})).toBe(true);expect(lifePaused(map,{[flag]:true})).toBe(false);
  }
  expect(lifePaused('station',{})).toBe(false);
 });
 it('moves only foliage, with a planted pivot and a bounded canopy displacement',()=>{
  for(const url of ['art/vector/scenery/fir.svg','art/vector/chapter-six/jungle-near-tree.svg','art/vector/scenery/palm.svg','art/vector/scenes/station/canopy.svg'])expect(swayingScenery({url})).toBe(true);
  for(const url of ['art/vector/chapter-four/sanctuary-wave.svg','art/vector/scenery/canopy-house.svg','art/vector/scenery/footbridge.svg'])expect(swayingScenery({url})).toBe(false);
  const tree={url:'art/vector/scenery/fir.svg',x:70,y:20,height:190};
  expect(sceneryAngle(tree)).toBe(0);
  const poses=Array.from({length:100},(_,i)=>sceneryAngle(tree,i*120));
  expect(new Set(poses).size).toBeGreaterThan(20);expect(Math.max(...poses.map(a=>Math.abs(a)*tree.height))).toBeLessThanOrEqual(3);
  expect(sceneryAngle({...tree,url:'house.svg'},4000)).toBe(0);
  expect(sceneryAngle(tree,1234)).toBe(sceneryAngle(tree,1290));
  expect(lifeStep(1234)).toBe(1200);
 });
});
