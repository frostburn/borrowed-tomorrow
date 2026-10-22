import { expect,it } from 'vitest';
import { ARRANGEMENTS,scoreBar,scoreLength,type MusicMode } from '../src/game/score';
import { hasRubato,performanceBar,scoreBeat,scoreTime } from '../src/game/score-performance';

it('rubato gives time back across each loop and the beat display inverts its clock through seeks',()=>{
 for(const mode of ['airship','windmere']as const){
  const beats=ARRANGEMENTS[mode].beats,length=32*beats,nominal=length*60/ARRANGEMENTS[mode].bpm;
  expect(hasRubato(mode)).toBe(true);expect(scoreTime(mode,length)).toBeCloseTo(nominal,10);
  const lengths=Array.from({length},(_,beat)=>scoreTime(mode,beat+1)-scoreTime(mode,beat));
  expect(Math.max(...lengths)/Math.min(...lengths)).toBeGreaterThan(1.15);
  for(const beat of [-length-1.5,-1,0,.5,beats,32.75,length-.5,length,length*3+.125]){
   expect(scoreTime(mode,beat+length)-scoreTime(mode,beat)).toBeCloseTo(nominal,9);
   expect(scoreBeat(mode,scoreTime(mode,beat))).toBeCloseTo(beat,9);
   expect(scoreBeat(mode,scoreTime(mode,beat,false),false)).toBeCloseTo(beat,9);
  }
 }
});

it('every other cue keeps its authored pulse, including the flagship intro and loop',()=>{
 for(const mode of Object.keys(ARRANGEMENTS)as MusicMode[]){
  if(hasRubato(mode))continue;
  const a=ARRANGEMENTS[mode],unit=60/a.bpm;
  for(const bar of [-1,0,1,scoreLength(mode),127]){
   const performed=performanceBar(mode,bar),raw=scoreBar(mode,bar);
   expect(performed.duration).toBeCloseTo(a.beats*unit,10);
   for(const [i,n]of performed.notes.entries()){
    expect(n.pitch).toBe(raw[i].pitch);expect(n.time).toBeCloseTo(n.beat*unit,10);expect(n.seconds).toBeCloseTo(n.duration*unit,10);
   }
  }
 }
});

it('a single performed clock keeps melody, support and cross-bar holds together without overlap',()=>{
 for(const mode of ['airship','windmere']as const){
  const a=ARRANGEMENTS[mode],line:{time:number;seconds:number}[]=[];
  for(let bar=0;bar<64;bar++){
   const start=scoreTime(mode,bar*a.beats),performed=performanceBar(mode,bar);
   for(const n of performed.notes){
    expect(n.time).toBeGreaterThanOrEqual(-1e-10);expect(n.time).toBeLessThan(performed.duration);
    expect(n.seconds).toBeGreaterThan(0);
    expect(start+n.time+n.seconds).toBeCloseTo(scoreTime(mode,bar*a.beats+n.beat+n.duration),9);
    if(n.expression)line.push({time:start+n.time,seconds:n.seconds});
   }
  }
  for(let i=1;i<line.length;i++)expect(line[i-1].time+line[i-1].seconds).toBeLessThanOrEqual(line[i].time+1e-9);
 }
 const hold=performanceBar('windmere',0).notes.find(n=>n.expression)!;
 expect(hold.seconds).toBeGreaterThan(performanceBar('windmere',0).duration);
 expect(hold.seconds).not.toBeCloseTo(hold.duration*60/ARRANGEMENTS.windmere.bpm,2);
});

it('sung notes have bounded, delayed vibrato and varied breath dynamics, with a neutral comparison',()=>{
 for(const mode of ['airship','windmere']as const){
  const peaks=new Set<number>(),depths:number[]=[];
  for(let bar=0;bar<32;bar++)for(const n of scoreBar(mode,bar)){
   if(!n.expression)continue;
   const curves=[n.expression.dynamics!,...(n.expression.vibrato?[n.expression.vibrato.depth]:[])];
   for(const curve of curves){
    expect(curve[0][0]).toBe(0);expect(curve.at(-1)![0]).toBe(1);
    for(let i=0;i<curve.length;i++){expect(curve[i][1]).toBeGreaterThanOrEqual(0);if(i)expect(curve[i][0]).toBeGreaterThan(curve[i-1][0]);}
   }
   const gain=n.expression.dynamics!.map(p=>p[1]),peak=Math.max(...gain);peaks.add(peak);
   expect(peak).toBeLessThan(1.5);expect(gain[0]).toBeLessThan(peak);expect(gain.at(-1)!).toBeLessThan(peak*.5);
   if(n.duration<=.75)expect(n.expression.vibrato).toBeUndefined();
   if(n.expression.vibrato){
    expect(n.expression.vibrato.depth.slice(0,2).every(p=>p[1]===0)).toBe(true);
    const depth=Math.max(...n.expression.vibrato.depth.map(p=>p[1]));expect(depth).toBeLessThan(1200/31);depths.push(depth);
   }
  }
  expect(peaks.size).toBeGreaterThan(12);expect(Math.max(...depths)).toBeGreaterThan(Math.min(...depths)*1.5);
  const expressive=performanceBar(mode,0),plain=performanceBar(mode,0,{expression:false,rubato:false});
  expect(plain.notes.map(n=>n.pitch)).toEqual(expressive.notes.map(n=>n.pitch));
  expect(plain.notes.every(n=>!n.expression?.dynamics&&!n.expression?.vibrato)).toBe(true);
 }
});
