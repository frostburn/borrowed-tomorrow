import { expect, it } from 'vitest';
import { fifthsCircle, octave, pitchFrequency, pitchSteps, semitones, transpose, type Pitch } from '../src/game/tuning';
import { scoreBar, ARRANGEMENTS } from '../src/game/score';

it('uses the diatonic 31-EDO scale, two-step accidentals and A4 = 440 Hz',()=>{
 expect(['C4','D4','E4','F4','G4','A4','B4'].map(p=>pitchSteps(p as Pitch)-pitchSteps('C4'))).toEqual([0,5,10,13,18,23,28]);
 expect(pitchSteps('C#4')-pitchSteps('C4')).toBe(2);
 expect(pitchSteps('Db4')-pitchSteps('C#4')).toBe(1);
 expect(pitchSteps('Bb4')-pitchSteps('A#4')).toBe(1);
 expect(pitchFrequency('A4')).toBe(440);expect(pitchFrequency('A5')).toBe(880);
 expect(pitchFrequency('C#4')).not.toBe(pitchFrequency('Db4'));
 expect(octave('Bb3',-1)).toBe('Bb2');
});
it('preserves fifths and spelled thirds through sharp and flat keys',()=>{
 for(const pitch of fifthsCircle()){
  expect(pitchSteps(transpose(pitch,'P5'))-pitchSteps(pitch)).toBe(18);
  expect(pitchSteps(transpose(pitch,'M3'))-pitchSteps(pitch)).toBe(10);
  expect(pitchSteps(transpose(pitch,'m3'))-pitchSteps(pitch)).toBe(8);
 }
 expect(transpose('Bb3','P5')).toBe('F4');expect(transpose('F#3','P5')).toBe('C#4');
 expect(transpose('Db3','M3')).toBe('F3');expect(transpose('G#3','M3')).toBe('B#3');
});
it('closes the circle after 31 fifths, with no twelve-fifth enharmonic shortcut',()=>{
 const circle=fifthsCircle(),classes=circle.map(p=>((pitchSteps(p)%31)+31)%31);
 expect(new Set(classes).size).toBe(31);
 for(let i=0;i<31;i++)expect((classes[(i+1)%31]-classes[i]+31)%31).toBe(18);
 expect((classes[0]+31*18)%31).toBe(classes[0]);expect((classes[0]+12*18)%31).not.toBe(classes[0]);
 expect(semitones('B#4')).toBe(semitones('C5'));expect(pitchSteps('B#4')).toBe(pitchSteps('C5')-1);
});
it('spells raised leading tones and borrowed minor chords according to their harmony',()=>{
 const pitches=(mode:Parameters<typeof scoreBar>[0],bar:number)=>scoreBar(mode,bar).map(n=>n.pitch);
 expect(pitches('rillbridge',3)).toContain('F#4');expect(pitches('rillbridge',0)).toContain('Bb4');
 expect(pitches('cinderbank',3)).toContain('D#5');expect(pitches('coast',4)).toContain('Eb5');
 expect(pitches('coast',5)).toContain('Bb4');expect(pitches('switching',5)).toContain('Bb4');
 expect(pitches('refuge',20)).toContain('Ab5');expect(pitches('four-battle',7)).toContain('G#4');
 expect(pitches('sanctuary',18)).toContain('Db2');expect(pitches('breakwater',7)).toContain('D#5');
 for(const mode of Object.keys(ARRANGEMENTS) as Parameters<typeof scoreBar>[0][])for(let bar=0;bar<32;bar++)for(const n of scoreBar(mode,bar)){
  expect(Number.isInteger(pitchSteps(n.pitch))).toBe(true);expect(pitchFrequency(n.pitch)).toBeGreaterThan(0);
 }
});
