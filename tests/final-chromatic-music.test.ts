import {expect,it} from 'vitest';
import {finalLeadHold,finalPhraseNotes} from '../src/game/score-final-runs';
import {ARRANGEMENTS,scoreBar} from '../src/game/score';
import {performanceBar} from '../src/game/score-performance';
import {pitchSteps,isPercussion} from '../src/game/tuning';
const modes=['benefactor','hollow-sun','unborrowed']as const;

it('gives each mantle descent a long sine lead and a quieter delayed near-unison echo',()=>{
 let count=0;
 for(let bar=0;bar<32;bar++){
  const figure=finalPhraseNotes('benefactor',bar,1,1);if(!figure.length)continue;count++;
  expect(figure).toHaveLength(2);const [lead,echo]=figure;
  expect(lead.instrument).toBe('sine');expect(echo.instrument).toBe('sine');
  expect(lead.duration).toBeGreaterThanOrEqual(5);expect(echo.duration).toBe(lead.duration);
  expect(echo.beat-lead.beat).toBe(.375);expect(echo.velocity/lead.velocity).toBeCloseTo(.28,12);
  expect(pitchSteps(lead.pitch)-pitchSteps(echo.pitch)).toBe(1);
  const bend=lead.expression!.bend!;expect(bend).toHaveLength(2);
  expect(bend[0][0]).toBe(0);expect(bend[1]).toEqual([1,0]);expect(bend[0][1]).toBeGreaterThan(900);
  expect(echo.expression!.bend).toEqual(bend);
  // At the same time, the lagging echo is only about 26–40 cents above it.
  const separation=bend[0][1]/lead.duration*.375-1200/31;
  expect(separation).toBeGreaterThan(20);expect(separation).toBeLessThan(45);
  const arrivalBar=bar+2+(lead.beat+lead.duration)/4;
  const arrival=scoreBar('benefactor',arrivalBar).find(n=>n.beat===0&&Math.abs(n.pan)===.12)!;
  expect(lead.pitch).toBe(arrival.pitch);
  const performed=performanceBar('benefactor',bar+2).notes.find(n=>n.instrument==='sine'&&n.pan===-.12)!;
  expect(performed.expression?.bend).toEqual(bend);expect(performed.seconds).toBeCloseTo(lead.duration*60/132,12);
 }
 expect(count).toBe(6);
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
