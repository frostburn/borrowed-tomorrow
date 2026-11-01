import {expect,it} from 'vitest';
import {finalLeadHold,finalPhraseNotes} from '../src/game/score-final-runs';
import {ARRANGEMENTS,scoreBar} from '../src/game/score';
import {pitchSteps,isPercussion} from '../src/game/tuning';
const modes=['benefactor','hollow-sun','unborrowed']as const;

it('trades the mantle organ call with a harmonized band answer in the radiant scale',()=>{
 const melody=(mode:'benefactor'|'sunthrone',start:number)=>Array.from({length:2},(_,i)=>scoreBar(mode,start+i)).flat().filter(n=>n.instrument==='organ'&&Math.abs(n.pan)===.12).map(n=>n.pitch);
 let steady=0,varied=0;const rhythms=new Set<string>();
 for(let phrase=0;phrase<8;phrase++){
  expect(melody('benefactor',2+phrase*4)).toEqual(melody('sunthrone',phrase*4));
  const start=phrase*4+2,notes=Array.from({length:2},(_,i)=>finalPhraseNotes('benefactor',start+i,1,1).map(n=>({...n,at:i*4+n.beat}))).flat();
  expect(new Set(notes.map(n=>n.instrument))).toEqual(new Set(['brass','strings','organ']));
  expect(notes.every(n=>!n.expression?.bend)).toBe(true);
  const lines=[-.22,.24,.05].map(pan=>notes.filter(n=>n.pan===pan).sort((a,b)=>a.at-b.at));
  for(const line of lines){
   expect(line.length).toBeGreaterThanOrEqual(4);
   for(let i=1;i<line.length;i++)expect(line[i-1].at+line[i-1].duration).toBeLessThanOrEqual(line[i].at);
   expect(line.at(-1)!.at+line.at(-1)!.duration).toBeLessThan(8);
  }
  const theme=Array.from({length:2},(_,i)=>scoreBar('benefactor',start+i+2).filter(n=>n.instrument==='organ'&&Math.abs(n.pan)===.12)).flat();
  expect(theme).toEqual([]);
  for(let i=0;i<2;i++)expect(finalPhraseNotes('benefactor',phrase*4+i,1,1)).toEqual([]);
  for(const line of lines){
   expect(line.map(n=>[n.at,n.duration])).toEqual(lines[0].map(n=>[n.at,n.duration]));
   for(const at of [0,2,4,6])expect(line.some(n=>n.at===at)).toBe(true);
   for(const [i,n]of line.entries()){
    expect(n.at*2).toBe(Math.round(n.at*2));
    if(i)expect(n.at-line[i-1].at).toBeGreaterThanOrEqual(.5);
    expect(n.duration).toBeCloseTo(((line[i+1]?.at??8)-n.at)*.7,12);
   }
   for(const n of line)expect([0,5,10,14,18,22,25,28]).toContain((pitchSteps(n.pitch)%31+31)%31);
  }
  let simultaneous=0;
  for(let at=0;at<8;at+=.125)simultaneous=Math.max(simultaneous,lines.filter(line=>line.some(n=>n.at<=at&&n.at+n.duration>at)).length);
  expect(simultaneous).toBe(3);
  rhythms.add(lines[0].map(n=>n.at).join(','));
  if(lines[0].length===4)steady++;else varied++;
  expect(finalLeadHold('benefactor',start,1,4)).toBe(0);
  expect(finalLeadHold('benefactor',start-1,3,2)).toBe(1);
 }
 expect(steady).toBe(4);expect(varied).toBe(4);expect(rhythms.size).toBeGreaterThanOrEqual(4);
});

it('focuses sun and heart runs on adjacent 31-tone steps, broken by alternating tritone pairs',()=>{
 for(const mode of ['hollow-sun','unborrowed']as const){
  let close=0,paired=0;
  for(let bar=0;bar<32;bar++){
   const run=finalPhraseNotes(mode,bar,1,1);if(!run.length)continue;
   const pitches=run.map(n=>pitchSteps(n.pitch)),steps=pitches.slice(1).map((p,i)=>p-pitches[i]);
   if(steps.every(s=>Math.abs(s)===1)){close++;continue;}
   paired++;expect(run).toHaveLength(12);
   const anchors:number[]=[];
   for(let i=0;i<pitches.length;i+=2){
    expect(Math.abs(pitches[i+1]-pitches[i])).toBe(i<6?15:16);
    anchors.push(Math.min(pitches[i],pitches[i+1]));
   }
   // Lower anchors move in five-step whole tones; pair order flips halfway.
   expect(anchors.slice(1).map((p,i)=>p-anchors[i])).toEqual([5,5,5,5,5]);
   expect(Math.sign(steps[0])).toBe(1);expect(Math.sign(steps[6])).toBe(-1);
  }
  expect(close,mode).toBe(mode==='hollow-sun'?4:6);expect(paired,mode).toBe(2);
 }
});

it('hands ornaments back to a single primary melody, including held arrivals and the loop',()=>{
 for(const mode of modes){
  const beats=ARRANGEMENTS[mode].beats,line=[];
  expect(finalPhraseNotes(mode,0,1,1)).toEqual([]);
  for(let bar=0;bar<64;bar++){
   const notes=scoreBar(mode,bar+2);
   line.push(...notes.filter(n=>Math.abs(n.pan)===.12&&!isPercussion(n.instrument)).map(n=>({...n,at:bar*beats+n.beat})));
   const answer=finalPhraseNotes(mode,bar%32,1,1);
   for(const n of answer){if(mode!=='benefactor')expect(n.beat+n.duration,mode).toBeLessThanOrEqual(beats);expect(n.duration).toBeGreaterThan(0);}
   if(answer.length&&mode!=='benefactor'){
    const arrival=scoreBar(mode,bar+3).find(n=>n.beat===0&&Math.abs(n.pan)===.12&&!isPercussion(n.instrument))!;
    expect(arrival,mode).toBeDefined();
    expect(Math.abs(pitchSteps(answer.at(-1)!.pitch)-pitchSteps(arrival.pitch)),mode).toBeLessThanOrEqual(8);
   }
  }
  line.sort((a,b)=>a.at-b.at);
  for(let i=1;i<line.length;i++)expect(line[i-1].at+line[i-1].duration,mode).toBeLessThanOrEqual(line[i].at+1e-9);
  expect(scoreBar(mode,34)).toEqual(scoreBar(mode,2));
 }
});

it('restores the full close-step heart sweep before its C5 and keeps non-final cues outside the overlay',()=>{
 const run=finalPhraseNotes('unborrowed',15,1,1),arrival=scoreBar('unborrowed',18).find(n=>n.beat===0&&n.instrument==='strings')!;
 expect(run).toHaveLength(31);expect(arrival.pitch).toBe('C5');
 const pitches=[...run,arrival].map(n=>pitchSteps(n.pitch));
 expect(pitches.slice(1).every((p,i)=>p-pitches[i]===1)).toBe(true);
 for(const bar of [16,17,18])expect(finalPhraseNotes('unborrowed',bar,1,1)).toEqual([]);
 for(const mode of Object.keys(ARRANGEMENTS).filter(m=>!modes.includes(m as typeof modes[number])))for(let bar=0;bar<32;bar++){
  expect(finalPhraseNotes(mode,bar,1,1)).toEqual([]);expect(finalLeadHold(mode,bar,1,3)).toBe(3);
 }
});
