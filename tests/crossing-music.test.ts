import {octave} from '../src/game/tuning';
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

it('fits the refuge remix to the film while retaining the original refuge call',()=>{
 expect(scoreLength('refuge-crossing')).toBe(8);
 expect(8*ARRANGEMENTS['refuge-crossing'].beats*60000/ARRANGEMENTS['refuge-crossing'].bpm).toBe(CROSSING_DURATION);
 for(let bar=0;bar<8;bar++){
  const notes=scoreBar('refuge-crossing',bar),source=scoreBar('refuge',bar).filter(n=>n.pan===-.12);
  expect(notes.filter(n=>n.pan===-.12).map(n=>n.pitch)).toEqual(source.map(n=>n.pitch));
  expect(notes.filter(n=>n.instrument==='hat')).toHaveLength(8);
  expect(notes.some(n=>n.instrument==='bass')).toBe(true);
 }
 expect(scoreBar('refuge-crossing',8)).toEqual(scoreBar('refuge-crossing',0));
});

it('fits the westward walk and keeps The Western Mooring melody intact',()=>{
 expect(scoreLength('airfield-crossing')).toBe(8);
 expect(8*ARRANGEMENTS['airfield-crossing'].beats*60000/ARRANGEMENTS['airfield-crossing'].bpm).toBe(CROSSING_DURATION);
 for(let bar=0;bar<8;bar++){
  const notes=scoreBar('airfield-crossing',bar),source=scoreBar('airfield',bar).filter(n=>n.pan===-.16);
  expect(notes.filter(n=>n.pan===-.16).map(n=>n.pitch)).toEqual(source.map(n=>n.pitch));
  expect(notes.some(n=>n.instrument==='bass')).toBe(true);
  for(const n of notes){expect(n.beat).toBeGreaterThanOrEqual(0);expect(n.beat).toBeLessThan(4);expect(n.duration).toBeGreaterThan(0);}
 }
 expect(scoreBar('airfield-crossing',8)).toEqual(scoreBar('airfield-crossing',0));
});

it('fits the quiet capital approach and halves the airship phrase without changing its spelling',()=>{
 expect(scoreLength('mooring-crossing')).toBe(8);
 expect(8*ARRANGEMENTS['mooring-crossing'].beats*60000/ARRANGEMENTS['mooring-crossing'].bpm).toBe(CROSSING_DURATION);
 const source=Array.from({length:4},(_,bar)=>scoreBar('airship',bar).filter(n=>n.pan===-.16).map(n=>[bar*8+n.beat*2,octave(n.pitch,-1),n.duration*2])).flat();
 const notes=Array.from({length:8},(_,bar)=>scoreBar('mooring-crossing',bar));
 const melody=notes.flatMap((bar,i)=>bar.filter(n=>n.pan===-.16).map(n=>[i*4+n.beat,n.pitch,n.duration]));
 expect(melody).toEqual(source);expect(notes.flat().some(n=>n.beat+n.duration>4)).toBe(true);
 expect(notes.flat().some(n=>['kick','snare','hat','timpani','cymbal'].includes(n.instrument))).toBe(false);
 expect(scoreBar('mooring-crossing',8)).toEqual(scoreBar('mooring-crossing',0));
});

it('fits the hollow crossing to the film with the actual domain call and held 31-EDO harmony',()=>{
 expect(scoreLength('hollow-crossing')).toBe(8);
 expect(8*ARRANGEMENTS['hollow-crossing'].beats*60000/ARRANGEMENTS['hollow-crossing'].bpm).toBe(CROSSING_DURATION);
 for(let bar=0;bar<8;bar++){
  const notes=scoreBar('hollow-crossing',bar),source=scoreBar('hollowsill',bar).filter(n=>n.instrument==='organ'&&Math.abs(n.pan)===.12);
  expect(notes.filter(n=>n.pan===-.12).map(n=>[n.beat,n.pitch])).toEqual(source.map(n=>[n.beat,n.pitch]));
 }
 expect(Array.from({length:8},(_,bar)=>scoreBar('hollow-crossing',bar)).flat().some(n=>n.beat+n.duration>4)).toBe(true);
 const lead=Array.from({length:8},(_,bar)=>scoreBar('hollow-crossing',bar).filter(n=>n.pan===-.12).map(n=>({...n,beat:bar*4+n.beat}))).flat();
 for(let i=0;i<lead.length-1;i++){
  const overlap=lead[i].beat+lead[i].duration-lead[i+1].beat;
  expect(overlap).toBeGreaterThan(0);expect(overlap).toBeLessThan(.5);
 }
 expect(scoreBar('hollow-crossing',8)).toEqual(scoreBar('hollow-crossing',0));
});
