import { isBass, isPercussion, semitones } from '../src/game/tuning';
import { expect, it } from 'vitest';
import { ARRANGEMENTS, scoreBar,type Note } from '../src/game/score';
import { ENCOUNTERS } from '../src/content/encounters';
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

it('Cinderbank and the railway ward have independent melodies with chord-supported downbeats and full cadences',()=>{
  const chordPitchClasses={em:[4,7,11],c:[0,4,7],b:[11,3,6],g:[7,11,2],am:[9,0,4],f:[5,9,0],dm:[2,5,9]};
  const tunes=[];
  for(const mode of ['cinderbank','infirmary'] as const){
    const melody=[];
    for(let bar=0;bar<16;bar++){
      const lead=scoreBar(mode,bar).filter(n=>n.instrument===(mode==='infirmary'?'keys':'reed')&&n.velocity>=.2);
      expect(lead.length).toBeGreaterThan(0);
      const chord=(mode==='infirmary'?WARD_HARMONY:SIDING_HARMONY)[bar];
      expect(chordPitchClasses[chord]).toContain(semitones(lead[0].pitch)%12);
      melody.push(...lead.map(n=>({...n,beat:n.beat+bar*ARRANGEMENTS[mode].beats})));
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
  const melody:Note[]=[];
  for(let bar=0;bar<16;bar++){
    const notes=scoreBar('coast',bar),lead=notes.filter(n=>n.instrument==='reed');
    expect(lead.length).toBeGreaterThan(0);
    const support=notes.filter(n=>n.instrument==='keys'||isBass(n.instrument)).map(n=>semitones(n.pitch)%12);
    expect(support).toContain(semitones(lead[0].pitch)%12);
    for(const n of notes){expect(n.velocity).toBeGreaterThan(0);expect(n.velocity).toBeLessThan(.3);expect(n.beat).toBeGreaterThanOrEqual(0);expect(n.beat).toBeLessThan(4);expect(n.duration).toBeGreaterThan(0);}
    melody.push(...lead.map(n=>({...n,beat:n.beat+bar*4})));
  }
  for(let i=1;i<melody.length;i++)expect(melody[i-1].beat+melody[i-1].duration).toBeLessThanOrEqual(melody[i].beat);
  expect(melody.some((n,i)=>i>0&&melody[i-1].beat+melody[i-1].duration<n.beat)).toBe(true);
  expect(scoreBar('coast',16)).toEqual(scoreBar('coast',0));expect(scoreBar('coast',-1)).toEqual(scoreBar('coast',15));
  expect(semitones(melody.at(-1)!.pitch)%12).toBe(0);
});

it('the ward is written in three clear quarter-note beats, including its accompaniment and cadence',()=>{
  expect(ARRANGEMENTS.infirmary.beats).toBe(3);
  for(let bar=0;bar<16;bar++){
    const notes=scoreBar('infirmary',bar);
    for(const n of notes){expect(n.beat).toBeGreaterThanOrEqual(0);expect(n.beat).toBeLessThan(3);expect(n.beat%1).toBe(0);expect(n.beat+n.duration).toBeLessThanOrEqual(3);}
    expect(notes.filter(n=>isBass(n.instrument)).map(n=>n.beat)).toEqual([0]);
    expect(notes.some(n=>n.instrument==='keys'&&n.beat===1&&n.velocity<.1)).toBe(true);
    expect(notes.some(n=>['kick','snare','hat'].includes(n.instrument))).toBe(false);
  }
});

it('Iron Coast keeps bass and piano on a shared pulse, with recurring calls and contrasting answers',()=>{
  for(let bar=0;bar<16;bar++){
    const notes=scoreBar('coast',bar),pulse=bar%4===3?[0]:[0,2];
    for(const instrument of ['round-bass','keys'])expect([...new Set(notes.filter(n=>n.instrument===instrument).map(n=>n.beat))]).toEqual(pulse);
    for(const n of notes)expect(n.beat*2).toBe(Math.round(n.beat*2));
    if(bar%4===3)expect(notes.filter(n=>n.instrument==='reed')).toHaveLength(1);
  }
  const rhythm=(bar:number)=>scoreBar('coast',bar).filter(n=>n.instrument==='reed').map(n=>[n.beat,n.duration]);
  expect(rhythm(4)).toEqual(rhythm(12));
  expect(rhythm(0)).not.toEqual(rhythm(1));expect(rhythm(8)).not.toEqual(rhythm(0));
});

it('Iron Coast restores its original two opening bars, including the quiet accompaniment',()=>{
  const leads=[
    [[0,'E5',1.25],[1.5,'G5',.25],[2,'F5',.25],[2.5,'E5',.25],[3,'D5',.75]],
    [[0,'D5',1.5],[2,'F5',.5],[3,'B4',.75]],
  ];
  for(const bar of [0,1]){
    const notes=scoreBar('coast',bar);
    expect(notes.filter(n=>n.instrument==='reed').map(n=>[n.beat,n.pitch,n.duration])).toEqual(leads[bar]);
    expect(notes.filter(n=>n.instrument==='round-bass').map(n=>[n.beat,n.pitch,n.duration,n.velocity])).toEqual([[0,bar===0?'C2':'D2',1.8,.14],[2,bar===0?'C2':'D2',1.7,.1]]);
    const keys=notes.filter(n=>n.instrument==='keys');
    for(const beat of [0,2])expect(keys.filter(n=>n.beat===beat).map(n=>[n.pitch,n.duration,n.velocity,n.pan])).toEqual((bar===0?['C3','E3','G3']:['A2','B2','D3','F3']).map(pitch=>[pitch,beat===0?1.7:1.5,beat===0?.038:.028,.25]));
    expect(notes.filter(n=>n.instrument==='hat').map(n=>[n.beat,n.duration,n.velocity])).toEqual([[1,.08,.018],[3,.08,.015]]);
  }
});

it('the train raid develops its coastal call in one consistent Lydian mode, with a broader middle and a returning answer',()=>{
  const lead=(bar:number)=>scoreBar('coast-battle',bar).filter(n=>n.instrument==='reed');
  const rhythm=(bar:number)=>lead(bar).map(n=>[n.beat,n.duration]);
  for(const bar of [2,4,6,12,14])expect(rhythm(bar)).toEqual(rhythm(0));
  for(const bar of [5,13])expect(rhythm(bar)).toEqual(rhythm(1));
  expect(lead(0).map(n=>n.pitch)).toEqual(['E5','G5','F#5','E5','D5']);
  // F# belongs to the first answer as well as the broad middle.
  expect(lead(1).at(-1)!.pitch).toBe('B4');
  expect(scoreBar('coast-battle',1).filter(n=>n.instrument==='keys'&&n.beat===0).map(n=>n.pitch)).toEqual(['A2','D3','F#3']);
  expect(lead(4).map(n=>n.pitch)).toEqual(['D5','F#5','E5','D5','C5']);
  expect([...lead(8),...lead(9)].slice(0,3).map(n=>n.pitch)).toEqual(['F5','A5','F#5']);
  expect(lead(15).at(-1)!.pitch).toBe('D5');
  expect(lead(15).some(n=>n.pitch==='C5'&&n.duration>=2)).toBe(false);
  expect(scoreBar('coast-battle',15).filter(n=>n.instrument==='keys'&&n.beat===0).map(n=>n.pitch)).toEqual(['B2','D3','G3']);
  for(let bar=0;bar<16;bar++){
    const notes=scoreBar('coast-battle',bar),middle=bar>=8&&bar<12;
    for(const n of notes.filter(n=>!isPercussion(n.instrument)))if(!(bar===8&&n.instrument==='reed'&&n.pitch==='F5'))expect(n.pitch.replace(/-?\d+$/,'')).toMatch(/^(C|D|E|F#|G|A|B)$/);
    expect(notes.filter(n=>n.instrument==='kick').map(n=>n.beat)).toEqual([0,2]);
    expect(notes.filter(n=>n.instrument==='snare'&&n.velocity>=.05).map(n=>n.beat)).toEqual(middle?[2]:[1,3]);
    expect(notes.some(n=>n.instrument==='strings')).toBe(middle);
    if(bar===8||bar===10)expect(lead(bar).every(n=>n.duration>=1.5)).toBe(true);
    expect(notes.filter(n=>n.instrument==='round-bass').map(n=>n.beat)).toEqual(middle?[0,2]:[0,1,2,3]);
  }
});

it('Petra’s melody lands on the pulse, with a brief triplet pickup over the straight battle backbeat',()=>{
  expect(ARRANGEMENTS['petra-battle'].beats).toBe(4);
  const melody:Note[]=[];
  for(let bar=0;bar<16;bar++){
    const notes=scoreBar('petra-battle',bar);
    for(const n of notes){
      if(['kick','snare','hat'].includes(n.instrument))expect(n.beat*4).toBe(Math.round(n.beat*4));
      expect(n.beat+n.duration).toBeLessThanOrEqual(4+1e-9);
      if(n.instrument==='strings'&&n.velocity>=.2)melody.push(n);
    }
    expect(notes.filter(n=>n.instrument==='kick').map(n=>n.beat)).toEqual([0,2]);
    expect(notes.filter(n=>n.instrument==='snare'&&n.velocity>=.07).map(n=>n.beat)).toEqual([1,3]);
    expect(notes.filter(n=>n.instrument==='hat').map(n=>n.beat)).toEqual([0,.5,1,1.5,2,2.5,3,3.5]);
  }
  expect(melody.filter(n=>Number.isInteger(n.beat)).length/melody.length).toBeGreaterThan(.9);
  for(let bar=0;bar<16;bar++)expect(scoreBar('petra-battle',bar).some(n=>n.instrument==='strings'&&n.velocity>=.2&&n.beat===0)).toBe(true);
  expect(melody.some(n=>Math.abs(n.beat%1-2/3)<1e-9)).toBe(true);
});

it('Chapter Two battle variations develop regional motifs with their own phrasing and rhythm sections',()=>{
  for(const [source,variation,lead] of [['coast','coast-battle','reed'],['cinderbank','shunting','reed']] as const){
    const line:Note[]=[];
    for(let bar=0;bar<16;bar++){
      const notes=scoreBar(variation,bar),original=scoreBar(source,bar);
      if(source==='cinderbank')expect(notes.find(n=>isBass(n.instrument)&&n.beat===0)!.pitch).toBe(original.find(n=>isBass(n.instrument)&&n.beat===0)!.pitch);
      expect(notes.some(n=>n.instrument==='kick')).toBe(true);
      for(const n of notes){expect(n.beat).toBeGreaterThanOrEqual(0);expect(n.beat).toBeLessThan(4);expect(n.duration).toBeGreaterThan(0);expect(n.velocity).toBeLessThan(.3);}
      line.push(...notes.filter(n=>n.instrument===lead&&n.velocity>=.2).map(n=>({...n,beat:bar*4+n.beat})));
    }
    expect(scoreBar(variation,0).filter(n=>n.instrument===lead&&n.velocity>=.2).slice(0,2).map(n=>n.pitch)).toEqual(scoreBar(source,0).filter(n=>n.instrument==='reed').slice(0,2).map(n=>n.pitch));
    for(let i=1;i<line.length;i++)expect(line[i-1].beat+line[i-1].duration).toBeLessThanOrEqual(line[i].beat);
    expect(scoreBar(variation,16)).toEqual(scoreBar(variation,0));expect(scoreBar(variation,-1)).toEqual(scoreBar(variation,15));
    expect(scoreBar(variation,0)).not.toEqual(scoreBar(source,0));
  }
});

it('each chapter declares its battle music instead of falling through to the home score',()=>{
  expect(['coast-signals','coast-loading','coast-collector','coast-recapture'].map(id=>ENCOUNTERS[id].music)).toEqual(['coast-battle','coast-battle','shunting','petra-battle']);
  expect(ENCOUNTERS.captain.music).toBe('inspector');expect(ENCOUNTERS['capital-arrest'].music).toBe('switching');expect(ENCOUNTERS['sanctuary-warden'].music).toBe('four-warden');
  for(const encounter of Object.values(ENCOUNTERS))expect(ARRANGEMENTS[encounter.music]).toBeDefined();
});

it('Dawnwatch supports complete 31-EDO phrases, clear endings and a related regional battle family',()=>{
 for(const mode of ['dawnwatch','watchbarracks','signalwall','dawn-battle','dawn-commander']as const){
  const line:Note[]=[];
  for(let bar=0;bar<32;bar++)for(const note of scoreBar(mode,bar)){
   expect(Number.isFinite(semitones(note.pitch))).toBe(true);expect(note.beat).toBeGreaterThanOrEqual(0);expect(note.beat+note.duration).toBeLessThanOrEqual(mode==='signalwall'&&isBass(note.instrument)?8:4);expect(note.velocity).toBeLessThan(.3);
   if(['strings','brass','bell'].includes(note.instrument)&&note.velocity>=.1)line.push({...note,beat:note.beat+bar*4});
  }
  for(let n=1;n<line.length;n++)expect(line[n-1].beat+line[n-1].duration).toBeLessThanOrEqual(line[n].beat);
  expect(line.some((n,i)=>i>0&&line[i-1].beat+line[i-1].duration<n.beat)).toBe(true);expect(semitones(line.at(-1)!.pitch)%12).toBe(5);expect(scoreBar(mode,32)).toEqual(scoreBar(mode,0));expect(scoreBar(mode,-1)).toEqual(scoreBar(mode,31));
 }
 const dominant=scoreBar('dawnwatch',6);expect(dominant.some(n=>n.pitch==='E4')).toBe(true);expect(dominant.some(n=>n.pitch==='Db5')).toBe(true);
 expect(scoreBar('dawn-battle',0)).not.toEqual(scoreBar('five-battle',0));expect(scoreBar('dawn-commander',0)).not.toEqual(scoreBar('petra-battle',0));
});


it('Petra carries her own refusal motif from the crossing to Dawnwatch, beyond the siding theme',()=>{
 const melody=(mode:'petra-battle'|'dawnwatch')=>scoreBar(mode,0).filter(n=>n.instrument==='strings'&&n.velocity>=.1);
 expect(melody('petra-battle').map(n=>n.pitch)).toEqual(melody('dawnwatch').map(n=>n.pitch));
 expect(melody('petra-battle').map(n=>n.beat)).not.toEqual(melody('dawnwatch').map(n=>n.beat));
 expect(melody('petra-battle').map(n=>n.pitch)).not.toEqual(scoreBar('cinderbank',0).filter(n=>n.instrument==='reed').map(n=>n.pitch));
 for(let bar=0;bar<16;bar++)expect(scoreBar('petra-battle',bar).find(n=>isBass(n.instrument))!.pitch).toBe(scoreBar('dawnwatch',bar).find(n=>isBass(n.instrument))!.pitch);
 expect(scoreBar('petra-battle',16)).toEqual(scoreBar('petra-battle',0));expect(scoreBar('petra-battle',-1)).toEqual(scoreBar('petra-battle',15));
});
