import { expect,it } from 'vitest';
import { ARRANGEMENTS,scoreBar,scoreLength,type Note,type MusicMode } from '../src/game/score';
import { pitchFrequency,pitchSteps,isBass,isPercussion } from '../src/game/tuning';
import {hasExpression,hasRubato,performanceBar} from '../src/game/score-performance';

it('The Open Gate sustains its melody and common-tone support through bar lines, with breaths at phrase endings',()=>{
 const bars=Array.from({length:32},(_,bar)=>scoreBar('dawnwatch',bar)),notes=bars.flatMap((ns,bar)=>ns.map(n=>({...n,beat:bar*4+n.beat})));
 const lead=notes.filter(n=>n.instrument==='strings'&&n.velocity>=.1);
 const gaps=lead.slice(1).map((n,i)=>n.beat-lead[i].beat-lead[i].duration);
 expect(Math.max(...gaps)).toBeLessThanOrEqual(.75);expect(Math.min(...gaps)).toBeGreaterThanOrEqual(0);
 expect(gaps.filter(g=>g<=.25).length/gaps.length).toBeGreaterThan(.8);
 expect(lead.filter(n=>n.beat%4+n.duration>4).length).toBeGreaterThanOrEqual(6);
 expect(lead.at(-1)!.beat+lead.at(-1)!.duration).toBe(127.5);
 const openingPad=bars[0].find(n=>n.instrument==='strings'&&n.velocity<.09&&n.pitch==='Ab3')!;
 expect(openingPad.duration).toBeGreaterThan(12);
 for(const bar of [1,2,3])expect(bars[bar].some(n=>n.instrument==='strings'&&n.velocity<.09&&n.pitch==='Ab3')).toBe(false);
 const bass=notes.filter(n=>isBass(n.instrument));
 for(let bar=0;bar<32;bar++)expect(bass.some(n=>n.beat<=bar*4&&n.beat+n.duration>=bar*4+3.5)).toBe(true);
 expect(ARRANGEMENTS.dawnwatch).toMatchObject({beats:4,bpm:92});expect(hasExpression('dawnwatch')).toBe(true);expect(hasRubato('dawnwatch')).toBe(false);
 expect(lead.every(n=>!!n.expression?.dynamics)).toBe(true);
 const hold=performanceBar('dawnwatch',7).notes.find(n=>n.velocity>=.1)!;
 expect(hold.seconds).toBeGreaterThan(performanceBar('dawnwatch',7).duration);
 for(let bar=16;bar<24;bar++)expect(bars[bar].some(n=>isPercussion(n.instrument))).toBe(false);
});
it('Chapter Five has bounded, varied 32-bar scores with one foreground line, rests and safe loop seams',()=>{
 for(const mode of ['airship','airfield','observation','hammerplain','coolingworks','anchorforge','five-battle','five-furnace','dawnwatch','watchbarracks','signalwall','dawn-battle','dawn-commander','windmere','dispensary','mirrorward','wind-battle','wind-engine']as MusicMode[]){
  const a=ARRANGEMENTS[mode],line:Note[]=[];expect(scoreLength(mode)).toBe(32);
  for(let i=0;i<32;i++)for(const n of scoreBar(mode,i)){
   expect(Number.isFinite(pitchFrequency(n.pitch))).toBe(true);expect(n.beat).toBeGreaterThanOrEqual(0);expect(n.beat).toBeLessThan(a.beats);expect(n.duration).toBeGreaterThan(0);expect(n.velocity).toBeLessThan(.3);
   expect(i*a.beats+n.beat+n.duration).toBeLessThanOrEqual(32*a.beats);
   if(!isBass(n.instrument)&&!isPercussion(n.instrument)&&n.instrument!=='timpani'&&n.velocity>=.09)line.push({...n,beat:n.beat+i*a.beats});
  }
  for(let i=1;i<line.length;i++)expect(line[i-1].beat+line[i-1].duration).toBeLessThanOrEqual(line[i].beat);
  expect(line.length).toBeGreaterThan(20);
  expect(line.at(-1)!.beat+line.at(-1)!.duration).toBeLessThanOrEqual(32*a.beats+line[0].beat);
  expect(line.some((n,i)=>i&&line[i-1].beat+line[i-1].duration<n.beat)).toBe(true);
  expect(scoreBar(mode,32)).toEqual(scoreBar(mode,0));expect(scoreBar(mode,-1)).toEqual(scoreBar(mode,31));expect(scoreBar(mode,16)).not.toEqual(scoreBar(mode,0));
 }
 expect(scoreBar('five-furnace',0).some(n=>n.instrument==='brass')).toBe(true);expect(scoreBar('five-furnace',0).some(n=>n.instrument==='timpani')).toBe(true);
 expect(scoreBar('airship',0).some(n=>['kick','snare','hat'].includes(n.instrument))).toBe(false);
});


it('the four character themes have different interval/rhythm identities and their locations develop them',()=>{
 const signature=(mode:MusicMode)=>{
  const notes=Array.from({length:8},(_,bar)=>scoreBar(mode,bar).filter(n=>!isBass(n.instrument)&&!isPercussion(n.instrument)&&n.instrument!=='timpani'&&n.velocity>=.09).map(n=>({...n,beat:n.beat+bar*ARRANGEMENTS[mode].beats}))).flat();
  return JSON.stringify(notes.map(n=>[pitchSteps(n.pitch)-pitchSteps(notes[0].pitch),n.beat-notes[0].beat,n.duration]));
 };
 const families:MusicMode[][]=[['airship','airfield','observation'],['hammerplain','coolingworks','anchorforge','five-battle','five-furnace'],['dawnwatch','watchbarracks','signalwall','dawn-battle','dawn-commander'],['windmere','dispensary','mirrorward','wind-battle','wind-engine']];
 const signatures=families.flat().map(signature);
 // Normalizing pitch and onset catches a copied tune even under transposition.
 expect(new Set(signatures).size).toBe(signatures.length);
 for(const group of families){
  const main=signature(group[0]);for(const mode of group.slice(1))expect(signature(mode)).not.toBe(main);
 }
 // Celia's melody carries through a bar line while her bass holds the harmony.
 const sung=scoreBar('windmere',0).find(n=>n.instrument==='reed')!;
 expect(sung.duration).toBeGreaterThan(ARRANGEMENTS.windmere.beats);
 expect(scoreBar('windmere',1).some(n=>n.instrument==='reed'||isBass(n.instrument))).toBe(false);
});

it('the furnace carrier drives straight square-bass eighths with a harder, piano-free ensemble',()=>{
 expect(ARRANGEMENTS['five-furnace'].bpm).toBe(136);expect(isBass('square-bass')).toBe(true);
 for(let bar=0;bar<32;bar++){
  const notes=scoreBar('five-furnace',bar);
  expect(notes.filter(n=>n.instrument==='square-bass').map(n=>n.beat)).toEqual([0,.5,1,1.5,2,2.5,3,3.5]);
  expect(notes.some(n=>n.instrument==='keys'||n.instrument==='bell'||n.instrument==='bass')).toBe(false);
  expect(notes.filter(n=>n.instrument==='kick').map(n=>n.beat)).toEqual([0,2]);
  expect(notes.filter(n=>n.instrument==='snare'&&n.velocity>.07).map(n=>n.beat)).toEqual([1,3]);
 }
});
