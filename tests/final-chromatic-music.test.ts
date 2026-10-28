import {expect,it} from 'vitest';
import {CHROMATIC_SHARPS,CHROMATIC_FLATS,ADJACENT_31,finalChromaticNotes} from '../src/game/score-final-runs';
import {ARRANGEMENTS,scoreBar} from '../src/game/score';
import {octave,pitchSteps,isPercussion} from '../src/game/tuning';
it('the two meantone chromatics are 7L 5s and the tight chromatic covers all 31 adjacent steps',()=>{
 for(const scale of [CHROMATIC_SHARPS,CHROMATIC_FLATS,ADJACENT_31]){
  const pitches=[...scale,octave(scale[0],1)].map(pitchSteps),gaps=pitches.slice(1).map((p,i)=>p-pitches[i]);
  expect(pitches.at(-1)!-pitches[0]).toBe(31);
  if(scale===ADJACENT_31)expect(gaps).toEqual(Array(31).fill(1));
  else{expect(gaps.filter(n=>n===3)).toHaveLength(7);expect(gaps.filter(n=>n===2)).toHaveLength(5);}
 }
});
it('final runs are bounded single voices which hand back to the existing melody, including across the loop',()=>{
 for(const mode of ['benefactor','hollow-sun','unborrowed']as const){
  const beats=ARRANGEMENTS[mode].beats,line=[];
  expect(finalChromaticNotes(mode,0,1,1)).toEqual([]);
  for(let bar=0;bar<64;bar++){
   const notes=scoreBar(mode,bar+2);
   line.push(...notes.filter(n=>Math.abs(n.pan)===.12&&!isPercussion(n.instrument)).map(n=>({...n,at:bar*beats+n.beat})));
   const run=finalChromaticNotes(mode,bar%32,1,1);
   for(const n of run){expect(n.beat+n.duration).toBeLessThan(beats);expect(n.duration).toBeGreaterThan(0);}
   if(run.length){
    const arrival=scoreBar(mode,bar+3).find(n=>n.beat===0&&Math.abs(n.pan)===.12&&!isPercussion(n.instrument))!;
    expect(arrival,mode).toBeDefined();
    const pitches=[...run,arrival].map(n=>pitchSteps(n.pitch)),steps=pitches.slice(1).map((p,j)=>p-pitches[j]);
    expect(steps.every(s=>Math.sign(s)===Math.sign(steps[0])),mode).toBe(true);
    expect(steps.every(s=>Math.abs(s)===1)||steps.every(s=>[2,3].includes(Math.abs(s))),mode).toBe(true);
   }
  }
  line.sort((a,b)=>a.at-b.at);
  for(let i=1;i<line.length;i++)expect(line[i-1].at+line[i-1].duration,mode).toBeLessThanOrEqual(line[i].at+1e-9);
  expect(scoreBar(mode,34)).toEqual(scoreBar(mode,2));
 }
});
it('the heart traverses the full adjacent-step octave then lands on its original C5',()=>{
 const run=finalChromaticNotes('unborrowed',15,1,1),arrival=scoreBar('unborrowed',18).find(n=>n.beat===0&&n.instrument==='strings')!;
 expect(run).toHaveLength(31);expect(arrival.pitch).toBe('C5');
 const pitches=[...run,arrival].map(n=>pitchSteps(n.pitch));
 expect(pitches.slice(1).every((p,i)=>p-pitches[i]===1)).toBe(true);
});
