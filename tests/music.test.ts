import { isBass, semitones } from '../src/game/tuning';
import { expect, it } from 'vitest';
import { scoreBar,type Note } from '../src/game/score';
import { SIDING_HARMONY, WARD_HARMONY } from '../src/game/score-c';
import { NORTHGLASS_CHORDS, NORTHGLASS_HARMONY } from '../src/game/score-d';

it('Chapter Four has distinct complete phrases with a single lead and correctly wrapped loops',()=>{
 const tunes=[];
 for(const mode of ['refuge','breakwater','sanctuary','four-battle','four-warden'] as const){
  const lead=mode==='sanctuary'?'bell':mode==='breakwater'?'keys':'reed',melody:Note[]=[];
  for(let bar=0;bar<32;bar++){
   const notes=scoreBar(mode,bar),line=notes.filter(n=>n.instrument===lead&&n.velocity>=.09);
   for(const n of notes){expect(Number.isFinite(semitones(n.pitch))).toBe(true);expect(semitones(n.pitch)).toBeGreaterThanOrEqual(29);expect(semitones(n.pitch)).toBeLessThanOrEqual(89);expect(n.beat).toBeGreaterThanOrEqual(0);expect(n.beat).toBeLessThan(4);expect(n.duration).toBeGreaterThan(0);expect(n.velocity).toBeLessThan(.3);}
   melody.push(...line.map(n=>({...n,beat:n.beat+bar*4})));
  }
  for(let i=1;i<melody.length;i++)expect(melody[i-1].beat+melody[i-1].duration).toBeLessThanOrEqual(melody[i].beat);
  expect(melody.some((n,i)=>i>0&&melody[i-1].beat+melody[i-1].duration<n.beat)).toBe(true);
  expect(scoreBar(mode,32)).toEqual(scoreBar(mode,0));expect(scoreBar(mode,-1)).toEqual(scoreBar(mode,31));
  expect(melody.filter(n=>n.beat>=64&&n.beat<96).map(n=>[semitones(n.pitch),n.beat-64,n.duration])).not.toEqual(melody.filter(n=>n.beat<32).map(n=>[semitones(n.pitch),n.beat,n.duration]));
  tunes.push(JSON.stringify(melody.map(n=>[n.beat,semitones(n.pitch),n.duration])));
 }
 expect(new Set(tunes).size).toBe(5);
});

it('the sanctuary pedal carries across quiet bars without repeated bass attacks',()=>{
 const opening=scoreBar('sanctuary',0),space=scoreBar('sanctuary',1);
 expect(opening.find(n=>n.instrument==='bass')!.duration).toBeGreaterThan(4);
 expect(space.some(n=>n.instrument==='bass'||n.instrument==='bell')).toBe(false);
 expect(space.some(n=>n.instrument==='keys')).toBe(true);
});

it('Rillbridge’s long downbeats agree with its bass harmony and its lead remains a single voice',()=>{
  const all=[];
  for(let bar=0;bar<16;bar++){
    const notes=scoreBar('rillbridge',bar),root=semitones(notes.find(n=>n.instrument==='bass'&&n.beat===0)!.pitch)%12;
    const third=root===7||root===0?3:4,triad=[root,(root+third)%12,(root+7)%12];
    const melody=notes.filter(n=>n.instrument==='reed');expect(melody.length).toBeGreaterThan(0);
    expect(triad).toContain(semitones(melody[0].pitch)%12);
    all.push(...melody.map(n=>({...n,beat:n.beat+bar*4})));
  }
  expect(Math.max(...all.map(n=>semitones(n.pitch)))-Math.min(...all.map(n=>semitones(n.pitch)))).toBeLessThanOrEqual(12);
  for(let i=1;i<all.length;i++)expect(all[i-1].beat+all[i-1].duration).toBeLessThanOrEqual(all[i].beat);
  expect(semitones(all.at(-1)!.pitch)%12).toBe(7);
});

it('Northglass voices the requested borrowed-chord progression beneath independent complete melodies',()=>{
  expect(NORTHGLASS_HARMONY).toEqual(['f','em','am','dm','g','gm7','c7','f']);
  const melodies=[];
  for(const mode of ['northglass','relayhall'] as const){
    const melody=[];
    for(let bar=0;bar<32;bar++){
      const notes=scoreBar(mode,bar),chord=NORTHGLASS_CHORDS[NORTHGLASS_HARMONY[bar%8]],lead=notes.filter(n=>n.instrument===(mode==='northglass'?'keys':'reed')&&n.velocity>=.16);
      expect(semitones(notes.find(n=>n.instrument==='bass'&&n.beat===0)!.pitch)).toBe(semitones(chord.root));
      expect(chord.notes.map(n=>semitones(n)%12)).toContain(semitones(lead[0].pitch)%12);
      if(bar%8===5||bar%8===6){
        const support=notes.filter(n=>n.instrument===(mode==='northglass'?'keys':'strings')&&n.velocity<.16);
        expect(support.some(n=>semitones(n.pitch)%12===10)).toBe(true);
      }
      for(const n of notes){expect(n.beat).toBeGreaterThanOrEqual(0);expect(n.beat).toBeLessThan(4);expect(n.duration).toBeGreaterThan(0);expect(Number.isFinite(semitones(n.pitch))).toBe(true);}
      melody.push(...lead.map(n=>({...n,beat:n.beat+bar*4})));
    }
    for(let i=1;i<melody.length;i++)expect(melody[i-1].beat+melody[i-1].duration).toBeLessThanOrEqual(melody[i].beat);
    expect(semitones(melody.at(-1)!.pitch)%12).toBe(5);melodies.push(melody.map(n=>[semitones(n.pitch),n.beat,n.duration]));
    expect(scoreBar(mode,32)).toEqual(scoreBar(mode,0));expect(scoreBar(mode,-1)).toEqual(scoreBar(mode,31));
  }
  expect(melodies[0]).not.toEqual(melodies[1]);
  expect(melodies[0].filter(n=>n[1]>=64&&n[1]<96).map(n=>n[0])).not.toEqual(melodies[0].filter(n=>n[1]<32).map(n=>n[0]));
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
      expect(chordPitchClasses[chord]).toContain(semitones(lead[0].pitch)%12);
      melody.push(...lead.map(n=>({...n,beat:n.beat+bar*4})));
    }
    for(let i=1;i<melody.length;i++)expect(melody[i-1].beat+melody[i-1].duration).toBeLessThanOrEqual(melody[i].beat);
    expect(Math.max(...melody.map(n=>semitones(n.pitch)))-Math.min(...melody.map(n=>semitones(n.pitch)))).toBeLessThanOrEqual(12);
    expect(semitones(melody.at(-1)!.pitch)%12).toBe(mode==='infirmary'?0:4);
    tunes.push(melody.map(n=>[semitones(n.pitch),n.beat,n.duration]));
  }
  expect(tunes[0]).not.toEqual(tunes[1]);
  expect(scoreBar('cinderbank',0)).toEqual(scoreBar('cinderbank',16));
  expect(scoreBar('infirmary',-1)).toEqual(scoreBar('infirmary',15));
});

it('the Iron Coast theme loops with rests, independent phrases and supported harmony',()=>{
  expect([0,1,2].map(bar=>scoreBar('coast',bar).find(n=>isBass(n.instrument)&&n.beat===0)!.pitch)).toEqual(['C2','D2','E2']);
  expect(new Set(scoreBar('coast',1).filter(n=>n.instrument==='keys'&&n.beat===0).map(n=>n.pitch))).toEqual(new Set(['A2','B2','D3','F3']));
  expect(new Set(scoreBar('coast',1).filter(n=>isBass(n.instrument)||n.instrument==='keys').map(n=>semitones(n.pitch)%12))).toEqual(new Set([11,2,5,9]));
  const melody=[];
  for(let bar=0;bar<16;bar++){
    const notes=scoreBar('coast',bar),lead=notes.filter(n=>n.instrument==='reed');
    expect(lead.length).toBeGreaterThan(0);
    const support=notes.filter(n=>n.instrument==='keys'||isBass(n.instrument)).map(n=>semitones(n.pitch)%12);
    expect(support).toContain(semitones(lead[0].pitch)%12);
    for(const n of notes){expect(n.velocity).toBeGreaterThan(0);expect(n.velocity).toBeLessThan(.3);expect(n.beat).toBeGreaterThanOrEqual(0);expect(n.beat).toBeLessThan(4);expect(n.duration).toBeGreaterThan(0);}
    melody.push(...lead.map(n=>({...n,beat:n.beat+bar*4})));
  }
  for(let i=1;i<melody.length;i++)expect(melody[i-1].beat+melody[i-1].duration).toBeLessThan(melody[i].beat);
  expect(scoreBar('coast',16)).toEqual(scoreBar('coast',0));expect(scoreBar('coast',-1)).toEqual(scoreBar('coast',15));
  expect(semitones(melody.at(-1)!.pitch)%12).toBe(0);
});
