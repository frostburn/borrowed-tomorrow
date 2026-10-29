import {expect,it} from 'vitest';
import {ARRANGEMENTS,scoreBar,scoreLength} from '../src/game/score';
import {CROSSING_DURATION} from '../src/content/crossing';

it('fits an eight-bar athletic workshop remix to the full cinematic',()=>{
 expect(scoreLength('crossing')).toBe(8);expect(ARRANGEMENTS.crossing.bpm).toBe(120);
 expect(scoreLength('crossing')*ARRANGEMENTS.crossing.beats*60000/ARRANGEMENTS.crossing.bpm).toBe(CROSSING_DURATION);
 const lead=(mode:'crossing'|'yard',bar:number)=>scoreBar(mode,bar).filter(n=>n.pan===-.15||n.pan===-.18).map(n=>n.pitch);
 expect(lead('crossing',0)).toEqual(lead('yard',0));expect(lead('crossing',4)).toEqual(lead('yard',4));
 for(let bar=0;bar<8;bar++){
  const notes=scoreBar('crossing',bar);expect(notes.some(n=>n.instrument==='bass')).toBe(true);expect(notes.filter(n=>n.instrument==='hat')).toHaveLength(8);
  for(const n of notes){expect(n.beat).toBeGreaterThanOrEqual(0);expect(n.beat).toBeLessThan(4);expect(n.duration).toBeGreaterThan(0);}
 }
 expect(scoreBar('crossing',8)).toEqual(scoreBar('crossing',0));
});

it('fits the capital remix to its film and preserves the Northglass melody identity',()=>{
 expect(scoreLength('capital-crossing')).toBe(8);
 expect(8*ARRANGEMENTS['capital-crossing'].beats*60000/ARRANGEMENTS['capital-crossing'].bpm).toBe(CROSSING_DURATION);
 for(let bar=0;bar<8;bar++){
  const notes=scoreBar('capital-crossing',bar),source=scoreBar('northglass',bar).filter(n=>n.pan===-.12);
  expect(notes.filter(n=>n.pan===-.12).map(n=>n.pitch)).toEqual(source.map(n=>n.pitch));
  expect(notes.filter(n=>n.instrument==='hat')).toHaveLength(8);
  expect(notes.some(n=>n.instrument==='bass')).toBe(true);
  for(const n of notes){expect(n.beat).toBeGreaterThanOrEqual(0);expect(n.beat).toBeLessThan(4);expect(n.duration).toBeGreaterThan(0);}
 }
 expect(scoreBar('capital-crossing',8)).toEqual(scoreBar('capital-crossing',0));
});
