import { expect, it } from 'vitest';
import { scoreBar } from '../src/game/score';
import { SIDING_HARMONY, WARD_HARMONY } from '../src/game/score-c';

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

it('Cinderbank and Bellwether have independent melodies with chord-supported downbeats and full cadences',()=>{
  const chordPitchClasses={em:[4,7,11],c:[0,4,7],b:[11,3,6],g:[7,11,2],am:[9,0,4],f:[5,9,0],dm:[2,5,9]};
  const tunes=[];
  for(const mode of ['cinderbank','infirmary'] as const){
    const melody=[];
    for(let bar=0;bar<16;bar++){
      const lead=scoreBar(mode,bar).filter(n=>n.instrument===(mode==='infirmary'?'keys':'reed')&&n.velocity>=.2);
      expect(lead.length).toBeGreaterThan(0);
      const chord=(mode==='infirmary'?WARD_HARMONY:SIDING_HARMONY)[bar];
      expect(chordPitchClasses[chord]).toContain(lead[0].midi%12);
      melody.push(...lead.map(n=>({...n,beat:n.beat+bar*4})));
    }
    for(let i=1;i<melody.length;i++)expect(melody[i-1].beat+melody[i-1].duration).toBeLessThanOrEqual(melody[i].beat);
    expect(Math.max(...melody.map(n=>n.midi))-Math.min(...melody.map(n=>n.midi))).toBeLessThanOrEqual(12);
    expect(melody.at(-1)!.midi%12).toBe(mode==='infirmary'?0:4);
    tunes.push(melody.map(n=>[n.midi,n.beat,n.duration]));
  }
  expect(tunes[0]).not.toEqual(tunes[1]);
  expect(scoreBar('cinderbank',0)).toEqual(scoreBar('cinderbank',16));
  expect(scoreBar('infirmary',-1)).toEqual(scoreBar('infirmary',15));
});
