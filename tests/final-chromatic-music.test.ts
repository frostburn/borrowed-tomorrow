import {expect,it} from 'vitest';
import {finalLeadHold,finalPhraseNotes} from '../src/game/score-final-runs';
import {ARRANGEMENTS,scoreBar} from '../src/game/score';
import {pitchSteps,isPercussion} from '../src/game/tuning';
const modes=['benefactor','hollow-sun','unborrowed']as const;

it('replaces exhaustive chromatic ladders with short, spaced and rhythmically varied answers',()=>{
 for(const mode of modes){
  const figures=Array.from({length:32},(_,bar)=>finalPhraseNotes(mode,bar,1,1)).filter(n=>n.length);
  expect(figures.length,mode).toBeGreaterThanOrEqual(4);
  const rhythms=new Set<string>();
  for(const notes of figures){
   expect(notes.length,mode).toBeGreaterThanOrEqual(2);expect(notes.length,mode).toBeLessThanOrEqual(4);
   rhythms.add(notes.map(n=>n.beat).join(','));
   for(const [i,n]of notes.entries()){
    expect(n.duration,mode).toBeGreaterThanOrEqual(.25);
    expect(n.expression?.release,mode).toBeGreaterThan(0);
    if(i)expect(n.beat-notes[i-1].beat,mode).toBeGreaterThanOrEqual(.5);
   }
   expect(notes.some((n,i)=>notes[i+1]&&n.beat+n.duration<notes[i+1].beat),mode).toBe(true);
  }
  expect(rhythms.size,mode).toBeGreaterThanOrEqual(3);
 }
});

it('hands every answer back to the melody without overlapping written lead holds, including across the loop',()=>{
 for(const mode of modes){
  const beats=ARRANGEMENTS[mode].beats,line=[];
  expect(finalPhraseNotes(mode,0,1,1)).toEqual([]);
  for(let bar=0;bar<64;bar++){
   const notes=scoreBar(mode,bar+2);
   line.push(...notes.filter(n=>Math.abs(n.pan)===.12&&!isPercussion(n.instrument)).map(n=>({...n,at:bar*beats+n.beat})));
   const answer=finalPhraseNotes(mode,bar%32,1,1);
   for(const n of answer){expect(n.beat+n.duration,mode).toBeLessThan(beats);expect(n.beat,mode).toBeGreaterThanOrEqual(0);}
   if(answer.length){
    const arrival=scoreBar(mode,bar+3).find(n=>n.beat===0&&Math.abs(n.pan)===.12&&!isPercussion(n.instrument));
    expect(arrival,mode).toBeDefined();
    // Each answer ends near its next real entrance, rather than roaming an octave.
    expect(Math.abs(pitchSteps(answer.at(-1)!.pitch)-pitchSteps(arrival!.pitch)),mode).toBeLessThanOrEqual(8);
   }
  }
  line.sort((a,b)=>a.at-b.at);
  for(let i=1;i<line.length;i++)expect(line[i-1].at+line[i-1].duration,mode).toBeLessThanOrEqual(line[i].at+1e-9);
  expect(scoreBar(mode,34)).toEqual(scoreBar(mode,2));
 }
});

it('leaves space before the heart middle and keeps other themes outside the final-phrase overlay',()=>{
 expect(finalPhraseNotes('unborrowed',15,1,1)).toHaveLength(2);
 for(const bar of [16,17,18])expect(finalPhraseNotes('unborrowed',bar,1,1)).toEqual([]);
 expect(scoreBar('unborrowed',18).find(n=>n.beat===0&&n.instrument==='strings')?.pitch).toBe('C5');
 for(const mode of Object.keys(ARRANGEMENTS).filter(m=>!modes.includes(m as typeof modes[number])))for(let bar=0;bar<32;bar++){
  expect(finalPhraseNotes(mode,bar,1,1)).toEqual([]);
  expect(finalLeadHold(mode,bar,1,3)).toBe(3);
 }
});
