import { expect,it } from 'vitest';
import { ARRANGEMENTS,scoreBar,scoreLength,type MusicMode } from '../src/game/score';
import { hasExpression,hasRubato,performanceBar,scoreBeat,scoreTime } from '../src/game/score-performance';
import { pitchSteps } from '../src/game/tuning';

const rubatoModes=['airship','windmere','refuge','anchorforge','signalwall','observation']as const;

it('rubato gives time back across each loop and the beat display inverts its clock through seeks',()=>{
 for(const mode of rubatoModes){
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
 for(const mode of rubatoModes){
  const a=ARRANGEMENTS[mode],line:{time:number;seconds:number}[]=[];
  for(let bar=0;bar<64;bar++){
   const start=scoreTime(mode,bar*a.beats),performed=performanceBar(mode,bar);
   for(const n of performed.notes){
    expect(n.time).toBeGreaterThanOrEqual(-1e-10);expect(n.time).toBeLessThan(performed.duration);
    expect(n.seconds).toBeGreaterThan(0);
    expect(start+n.time+n.seconds).toBeCloseTo(scoreTime(mode,bar*a.beats+n.beat+n.duration),9);
    if(n.expression&&n.velocity>=.09&&!['bass','round-bass','kick','snare','hat'].includes(n.instrument))line.push({time:start+n.time,seconds:n.seconds});
   }
  }
  for(let i=1;i<line.length;i++)expect(line[i-1].time+line[i-1].seconds).toBeLessThanOrEqual(line[i].time+1e-9);
 }
 const hold=performanceBar('windmere',0).notes.find(n=>n.expression)!;
 expect(hold.seconds).toBeGreaterThan(performanceBar('windmere',0).duration);
 expect(hold.seconds).not.toBeCloseTo(hold.duration*60/ARRANGEMENTS.windmere.bpm,2);
});

it('only authored expressive cues expose a comparison, and disabling it removes all controls',()=>{
 for(const mode of Object.keys(ARRANGEMENTS)as MusicMode[]){
  const notes=Array.from({length:scoreLength(mode)},(_,bar)=>scoreBar(mode,bar)).flat();
  expect(hasExpression(mode),mode).toBe(notes.some(n=>n.expression!==undefined));
  if(!hasExpression(mode))continue;
  for(let bar=0;bar<scoreLength(mode);bar++){
   const original=performanceBar(mode,bar),plain=performanceBar(mode,bar,{expression:false});
   expect(plain.notes.map(n=>[n.pitch,n.time,n.seconds])).toEqual(original.notes.map(n=>[n.pitch,n.time,n.seconds]));
   expect(plain.notes.every(n=>!n.expression||Object.keys(n.expression).length===0)).toBe(true);
   for(const n of original.notes){
    const e=n.expression;if(!e)continue;
    for(const curve of [e.dynamics,e.bend,e.vibrato?.depth])if(curve){
     expect(curve[0][0]).toBe(0);expect(curve.at(-1)![0]).toBe(1);
     for(let i=0;i<curve.length;i++){expect(Number.isFinite(curve[i][1])).toBe(true);if(i)expect(curve[i][0]).toBeGreaterThan(curve[i-1][0]);}
    }
    if(e.bend){expect(e.bend.at(-1)![1]).toBe(0);expect(Math.max(...e.bend.map(p=>Math.abs(p[1])))).toBeLessThanOrEqual((mode==='mirrorward'||mode==='signalwall'?18:8)*1200/31);}
   }
  }
 }
});

it('broad fretless shifts arrive before vibrato, then finish straight; cabin parts take turns bending',()=>{
 for(const mode of ['mirrorward','signalwall']as const)for(let bar=0;bar<32;bar++)for(const n of scoreBar(mode,bar).filter(n=>n.instrument==='round-bass')){
  const {bend,vibrato}=n.expression!,arrival=bend!.find(([at,cents])=>at>0&&cents===0)![0];
  expect(Math.abs(bend![0][1])).toBeGreaterThanOrEqual(5*1200/31);
  expect(arrival*n.duration).toBeGreaterThanOrEqual(1.2);
  expect(vibrato!.depth.filter(([at])=>at<=arrival).every(([,depth])=>depth===0)).toBe(true);
  expect(Math.max(...vibrato!.depth.map(p=>p[1]))).toBeGreaterThan(15);
  expect(vibrato!.depth.slice(-2).every(([,depth])=>depth===0)).toBe(true);
  expect(n.velocity).toBeGreaterThanOrEqual(.14);
 }
 const motions:{bass:boolean;from:number;to:number}[]=[];
 for(let bar=0;bar<64;bar++)for(const n of performanceBar('observation',bar).notes){
  const curve=n.expression?.bend;if(!curve)continue;
  const start=scoreTime('observation',bar*4)+n.time;
  for(let i=1;i<curve.length;i++)if(curve[i][1]!==curve[i-1][1])motions.push({bass:n.instrument==='round-bass',from:start+curve[i-1][0]*n.seconds,to:start+curve[i][0]*n.seconds});
  if(n.instrument==='keys'){
   expect(Math.abs(curve[0][1])).toBeGreaterThanOrEqual(3*1200/31);
   const arrival=curve.find(([at,cents])=>at>0&&cents===0)![0];expect(arrival*n.duration).toBeGreaterThanOrEqual(.5);expect(arrival*n.duration).toBeLessThanOrEqual(.6+1e-9);
  }
 }
 for(const lead of motions.filter(n=>!n.bass))expect(motions.filter(n=>n.bass).every(b=>b.to<=lead.from||b.from>=lead.to)).toBe(true);
});

it('bell anticipations stay held together, with fewer rolls in the sanctuary',()=>{
 const counts={conduit:0,sanctuary:0};
 for(const mode of ['conduit','sanctuary']as const)for(let bar=0;bar<scoreLength(mode);bar++){
  const notes=scoreBar(mode,bar);
  const rolls=notes.filter(n=>n.instrument==='bell'&&n.velocity<.09);
  if(rolls.length){
   counts[mode]++;expect(rolls).toHaveLength(4);
   for(const n of rolls){expect(n.beat+n.duration).toBe(3.5);expect(n.expression!.release).toBeGreaterThan(1.5);}
   expect(rolls[0].duration).toBeGreaterThanOrEqual(1.5);
   if(mode==='sanctuary')expect(bar%4).toBe(0);
  }
  for(const bell of notes.filter(n=>n.instrument==='bell'&&n.velocity>=.09)){
   expect(bell.expression!.release).toBeGreaterThan(1.5);
   if(bell.beat<.5)continue;
   const roll=notes.filter(n=>n.instrument==='bell'&&n.beat>=bell.beat-.5&&n.beat<bell.beat&&n.velocity<.09);
   if(!roll.length){expect(mode).toBe('sanctuary');continue;}
   expect(roll).toHaveLength(4);expect(roll.map(n=>n.beat)).toEqual([-.5,-.375,-.25,-.125].map(b=>bell.beat+b));
   expect(Math.min(...roll.map(n=>n.velocity))).toBeGreaterThanOrEqual(.045);
   expect(Math.max(...roll.map(n=>n.velocity))).toBeLessThan(bell.velocity*.6);
   for(let n=1;n<roll.length;n++)expect(pitchSteps(roll[n].pitch)).toBeGreaterThan(pitchSteps(roll[n-1].pitch));
  }
 }
 expect(counts).toEqual({conduit:8,sanctuary:8});
});

it('the ward carries bells and the wheel carries bass across every empty melodic bar',()=>{
 for(const mode of ['mirrorward','signalwall']as const){
  const bars=Array.from({length:32},(_,bar)=>scoreBar(mode,bar));let quiet=0;
  for(let bar=0;bar<32;bar++){
   if(bars[bar].some(n=>n.instrument==='bell'&&n.velocity>=.09))continue;
   quiet++;
   const held=bars[(bar+31)%32].filter(n=>n.instrument===(mode==='mirrorward'?'bell':'round-bass'));
   expect(held.some(n=>n.beat+n.duration>=7.5),`${mode} bar ${bar+1}`).toBe(true);
   expect(bars[bar].some(n=>n.instrument==='round-bass'||n.instrument==='bell')).toBe(false);
  }
  expect(quiet).toBeGreaterThan(4);
 }
});

it('cabin phrase arrivals use the requested narrower or straight approaches',()=>{
 for(const bar of [3,11,17,19,23,27]){
  const note=scoreBar('observation',bar-1).find(n=>n.instrument==='keys'&&n.velocity>=.09)!;
  expect(note.expression!.bend![0][1]).toBe(-3*1200/31);
 }
 for(const bar of [15,21])expect(scoreBar('observation',bar-1).filter(n=>n.instrument==='keys').every(n=>!n.expression?.bend)).toBe(true);
});

it('the requested cues phrase their dynamics and retain fretless pitch centres',()=>{
 for(const mode of ['refuge','airfield','anchorforge','signalwall','observation','flagship']as const){
  const notes=Array.from({length:scoreLength(mode)},(_,bar)=>scoreBar(mode,bar)).flat();
  expect(notes.every(n=>n.expression?.dynamics),mode).toBe(true);
  expect(new Set(notes.map(n=>n.expression!.dynamics![0][1])).size,mode).toBeGreaterThan(12);
  if(mode==='refuge'||mode==='airfield'){
   expect(notes.some(n=>n.instrument==='reed'&&n.duration>=1.5&&n.expression?.vibrato),mode).toBe(true);
   expect(notes.filter(n=>n.duration<=.75).every(n=>!n.expression?.vibrato)).toBe(true);
  }
 }
 for(const mode of ['mirrorward','anchorforge','signalwall','observation']as const){
  const bass=Array.from({length:32},(_,bar)=>scoreBar(mode,bar)).flat().filter(n=>n.instrument==='bass'||n.instrument==='round-bass');
  expect(bass.every(n=>n.expression?.bend),mode).toBe(true);
  expect(bass.some(n=>Math.abs(n.expression!.bend![0][1])>=1200/31),mode).toBe(true);
  expect(bass.every(n=>n.expression!.bend!.some(([at,cents])=>at>0&&at<.5&&cents===0)),mode).toBe(true);
 }
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
