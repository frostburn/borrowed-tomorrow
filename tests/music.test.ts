import { expect, it } from 'vitest';
import { scoreBar } from '../src/game/score';

it('Rillbridge’s long downbeats agree with its bass harmony and its lead remains a single voice',()=>{
  const all=[];
  for(let bar=0;bar<16;bar++){
    const notes=scoreBar('rillbridge',bar),root=notes.find(n=>n.instrument==='bass'&&n.beat===0)!.midi%12;
    const third=root===7||root===0?3:4,triad=[root,(root+third)%12,(root+7)%12];
    const melody=notes.filter(n=>n.instrument==='reed');expect(melody.length).toBeGreaterThan(0);
    expect(triad).toContain(melody[0].midi%12);
    all.push(...melody.map(n=>({...n,beat:n.beat+bar*4})));
  }
  expect(Math.max(...all.map(n=>n.midi))-Math.min(...all.map(n=>n.midi))).toBeLessThanOrEqual(12);
  for(let i=1;i<all.length;i++)expect(all[i-1].beat+all[i-1].duration).toBeLessThanOrEqual(all[i].beat);
  expect(all.at(-1)!.midi%12).toBe(7);
});
