import {test,expect} from '@playwright/test';
import {capture} from './controls';

test('fretless bass approaches its 31-EDO centre, bell tails soften, and both cancel cleanly',async({page},testInfo)=>{
 await page.goto('/');
 const result=await page.evaluate(async()=>{
  // @ts-expect-error Exercise the actual shared score, clock and instrument rack.
  const {performanceBar}:typeof import('../../src/game/score-performance')=await import('/src/game/score-performance.ts');
  // @ts-expect-error Exercise the actual shared score, clock and instrument rack.
  const {Synth}:typeof import('../../src/game/synth')=await import('/src/game/synth.ts');
  // @ts-expect-error Pitch measurements use the same spelled 31-EDO centres.
  const {pitchFrequency}:typeof import('../../src/game/tuning')=await import('/src/game/tuning.ts');
  const rate=48000,start=.03,bass=performanceBar('mirrorward',4).notes.find(n=>n.instrument==='round-bass')!;
  const rms=(data:Float32Array,from:number,to:number)=>{let sum=0,count=0;for(let i=Math.ceil(from*rate);i<Math.floor(to*rate);i++){sum+=data[i]**2;count++;}return Math.sqrt(sum/count);};
  const render=async(note:typeof bass,expression=note.expression,stop=false)=>{
   const c=new OfflineAudioContext(1,Math.ceil((start+note.seconds+3)*rate),rate),s=new Synth(c,c.destination);
   s.note(note.instrument,note.pitch,start,note.seconds,note.velocity,0,expression);
   if(stop){s.note(note.instrument,note.pitch,1.4,2,note.velocity,0,expression);s.release(.5);s.note('keys','Db5',.8,.25,.12);}
   return (await c.startRendering()).getChannelData(0);
  };
  const bent=await render(bass),plain=await render(bass,{}),hz=pitchFrequency(bass.pitch);
  const pitch=(data:Float32Array,from:number,to:number,centre=hz)=>{
   const crossings:number[]=[];
   for(let i=Math.ceil(from*rate);i<Math.floor(to*rate);i++)if(data[i-1]<0&&data[i]>=0)crossings.push(i-1-data[i-1]/(data[i]-data[i-1]));
   const cents=crossings.slice(1).map((at,i)=>1200*Math.log2(rate/(at-crossings[i])/centre)),mean=cents.reduce((a,b)=>a+b,0)/cents.length;
   return {mean,spread:Math.sqrt(cents.reduce((sum,p)=>sum+(p-mean)**2,0)/cents.length)};
  };
  const bell=performanceBar('conduit',0).notes.find(n=>n.instrument==='bell'&&n.velocity>=.09)!;
  const soft=await render(bell),short=await render(bell,{}),stopped=await render(bass,bass.expression,true);
  const piano=performanceBar('observation',0).notes.find(n=>n.instrument==='keys'&&n.velocity>=.09)!,bentPiano=await render(piano),pianoHz=pitchFrequency(piano.pitch);
  const end=start+bell.seconds;
  const jumps=(data:Float32Array)=>{let max=0;for(let i=Math.ceil((end+1.6)*rate);i<Math.min(data.length,Math.ceil((end+1.9)*rate));i++)max=Math.max(max,Math.abs(data[i]-data[i-1]));return max;};
  return {bass:{pitch:bass.pitch,approach:pitch(bent,start+.1,start+.25),gliding:pitch(bent,start+.6,start+.9),singing:pitch(bent,start+bass.seconds*.45,start+bass.seconds*.65),finish:pitch(bent,start+bass.seconds*.9,start+bass.seconds*.98),plain:pitch(plain,start+.1,start+.25),level:rms(bent,start+bass.seconds*.45,start+bass.seconds*.65),
   silence:rms(stopped,.62,.75),incoming:rms(stopped,.83,.95),cancelled:rms(stopped,1.4,2)},
   bell:{softTail:rms(soft,end+.7,end+1),shortTail:rms(short,end+.7,end+1),after:rms(soft,end+1.85,end+2.1),jump:jumps(soft)},
   piano:{start:pitch(bentPiano,start+.06,start+.14,pianoHz),moving:pitch(bentPiano,start+.25,start+.4,pianoHz),settled:pitch(bentPiano,start+.75,start+1,pianoHz)}};
 });
 await testInfo.attach('bend-centre-and-bell-release',{body:JSON.stringify(result,null,2),contentType:'application/json'});
 expect(result.bass.approach.mean).toBeLessThan(-500);expect(result.bass.gliding.mean).toBeLessThan(-30);
 expect(Math.abs(result.bass.singing.mean)).toBeLessThan(4);expect(result.bass.singing.spread).toBeGreaterThan(8);expect(result.bass.singing.spread).toBeLessThan(20);
 expect(Math.abs(result.bass.finish.mean)).toBeLessThan(2);expect(result.bass.finish.spread).toBeLessThan(1);
 expect(Math.abs(result.bass.plain.mean)).toBeLessThan(2);expect(result.bass.level).toBeGreaterThan(.025);
 expect(result.bass.silence).toBeLessThan(.000001);expect(result.bass.incoming).toBeGreaterThan(.001);expect(result.bass.cancelled).toBeLessThan(.000001);
 expect(result.bell.softTail).toBeGreaterThan(.0001);expect(result.bell.shortTail).toBeLessThan(.000001);expect(result.bell.after).toBeLessThan(.000001);expect(result.bell.jump).toBeLessThan(.001);
 expect(result.piano.start.mean).toBeLessThan(-150);expect(result.piano.moving.mean).toBeLessThan(-40);expect(Math.abs(result.piano.settled.mean)).toBeLessThan(3);
});

test('anticipating bell rolls remain audible before the main call in both chambers',async({page},testInfo)=>{
 await page.goto('/');const levels=await page.evaluate(async()=>{
  // @ts-expect-error Render the authored Bell part through the actual instrument rack.
  const {performanceBar}:typeof import('../../src/game/score-performance')=await import('/src/game/score-performance.ts');
  // @ts-expect-error Render the authored Bell part through the actual instrument rack.
  const {Synth}:typeof import('../../src/game/synth')=await import('/src/game/synth.ts');
  const out=[],rate=22050;
  for(const mode of ['conduit','sanctuary']as const){
   const performed=performanceBar(mode,0),notes=performed.notes,lead=notes.find(n=>n.instrument==='bell'&&n.velocity>=.09)!,roll=notes.filter(n=>n.instrument==='bell'&&n.time<lead.time);
   const rms=async(part:typeof notes,from:number,to:number)=>{
    const c=new OfflineAudioContext(1,rate*8,rate),gain=c.createGain();gain.gain.value=.52;gain.connect(c.destination);const synth=new Synth(c,gain);
    for(const n of part)synth.note(n.instrument,n.pitch,.03+n.time,n.seconds,n.velocity,n.pan,n.expression);
    const data=(await c.startRendering()).getChannelData(0);let sum=0,count=0;
    for(let i=Math.ceil(from*rate);i<Math.floor(to*rate);i++){sum+=data[i]**2;count++;}return Math.sqrt(sum/count);
   };
   out.push({mode,roll:await rms(roll,.08,lead.time),held:await rms(roll,performed.duration*.5,performed.duration*.8),call:await rms([lead],lead.time+.06,lead.time+.3)});
  }return out;
 });
 await testInfo.attach('anticipation-levels',{body:JSON.stringify(levels,null,2),contentType:'application/json'});
 for(const level of levels){expect(level.roll,JSON.stringify(level)).toBeGreaterThan(.003);expect(level.held,JSON.stringify(level)).toBeGreaterThan(.003);expect(level.roll).toBeGreaterThan(level.call*.2);}
});

test('held ward bells and town-wheel bass remain audible late in the quiet bar',async({page},testInfo)=>{
 await page.goto('/');const levels=await page.evaluate(async()=>{
  // @ts-expect-error The real performed clock includes cross-bar holds and rubato.
  const {performanceBar,scoreTime}:typeof import('../../src/game/score-performance')=await import('/src/game/score-performance.ts');
  // @ts-expect-error Render the actual held campaign voices.
  const {Synth}:typeof import('../../src/game/synth')=await import('/src/game/synth.ts');
  const out=[],rate=22050;
  for(const [mode,bar,part]of [['mirrorward',0,'bell'],['signalwall',2,'round-bass']]as const){
   const n=performanceBar(mode,bar).notes.find(n=>n.instrument===part)!,base=scoreTime(mode,bar*4),from=scoreTime(mode,bar*4+6)-base,to=scoreTime(mode,bar*4+7)-base;
   const c=new OfflineAudioContext(1,Math.ceil((to+2)*rate),rate),gain=c.createGain();gain.gain.value=.52;gain.connect(c.destination);const synth=new Synth(c,gain);
   synth.note(n.instrument,n.pitch,.03+n.time,n.seconds,n.velocity,n.pan,n.expression);
   const data=(await c.startRendering()).getChannelData(0);let sum=0,count=0;
   for(let i=Math.ceil((.03+from)*rate);i<Math.floor((.03+to)*rate);i++){sum+=data[i]**2;count++;}
   out.push({mode,part,rms:Math.sqrt(sum/count)});
  }return out;
 });
 await testInfo.attach('quiet-bar-sustains',{body:JSON.stringify(levels,null,2),contentType:'application/json'});
 for(const level of levels)expect(level.rms,JSON.stringify(level)).toBeGreaterThan(.003);
});

for(const [family,modes]of [
 ['home and bells',['yard','inspector','conduit','sanctuary']],
 ['singing locations',['refuge','airfield','mirrorward','signalwall']],
 ['cabin and battles',['anchorforge','observation','petra-battle','flagship']],
]as const)test(`revised ${family} render complete forms and loop seams with finite, unclipped audio`,async({page},testInfo)=>{
 test.setTimeout(120000);await page.goto('/');
 const results=await page.evaluate(async(modes)=>{
  // @ts-expect-error Render real campaign performance, including rubato and expression.
  const {performanceBar,scoreTime}:typeof import('../../src/game/score-performance')=await import('/src/game/score-performance.ts');
  // @ts-expect-error Render real campaign performance, including rubato and expression.
  const {scoreLength,ARRANGEMENTS}:typeof import('../../src/game/score')=await import('/src/game/score.ts');
  // @ts-expect-error Render real campaign performance, including rubato and expression.
  const {Synth}:typeof import('../../src/game/synth')=await import('/src/game/synth.ts');
  const result=[],rate=22050;
  for(const mode of modes){
   const a=ARRANGEMENTS[mode],bars=scoreLength(mode)+2,seconds=scoreTime(mode,bars*a.beats),c=new OfflineAudioContext(2,Math.ceil((seconds+3)*rate),rate),gain=c.createGain();gain.gain.value=.52;gain.connect(c.destination);const synth=new Synth(c,gain);
   for(let bar=0;bar<bars;bar++)for(const n of performanceBar(mode,bar).notes)synth.note(n.instrument,n.pitch,.03+scoreTime(mode,bar*a.beats)+n.time,n.seconds,n.velocity,n.pan,n.expression);
   const buffer=await c.startRendering();let peak=0,sum=0,jump=0,count=0;
   for(let ch=0;ch<2;ch++){
    const data=buffer.getChannelData(ch);
    for(let i=1;i<Math.floor(seconds*rate);i++){const v=data[i];if(!Number.isFinite(v))throw Error(`${mode}: non-finite audio`);peak=Math.max(peak,Math.abs(v));jump=Math.max(jump,Math.abs(v-data[i-1]));sum+=v*v;count++;}
   }
   result.push({mode,peak,rms:Math.sqrt(sum/count),jump});
  }
  return result;
 },modes);
 await testInfo.attach('revised-full-loop-levels',{body:JSON.stringify(results,null,2),contentType:'application/json'});
 for(const r of results){expect(r.peak,JSON.stringify(r)).toBeLessThan(.9);expect(r.rms,JSON.stringify(r)).toBeGreaterThan(.002);expect(r.jump,JSON.stringify(r)).toBeLessThan(.25);}
});

for(const [device,viewport,dpr]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const)test.describe(`expression controls on ${device}`,()=>{
 test.use({viewport,deviceScaleFactor:dpr});
 test('reviews each added performance, compares bass bends and preserves saves',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/?dev=music');const storage=await page.evaluate(()=>JSON.stringify(localStorage));
  await page.evaluate(async()=>{
   // @ts-expect-error Observe live note expression without adding a production API.
   const {Synth}:typeof import('../../src/game/synth')=await import('/src/game/synth.ts');const original=Synth.prototype.note;
   const state=window as unknown as {bendReview:{instrument:string;expression?:import('../../src/game/expression').NoteExpression}[]};state.bendReview=[];
   Synth.prototype.note=function(...args){state.bendReview.push({instrument:args[0],expression:args[6]});return original.apply(this,args);};
  });
  const expression=page.getByRole('button',{name:'Expression',exact:true}),rubato=page.getByRole('button',{name:'Rubato',exact:true});
  for(const [group,cue,breath]of [['3','conduit',false],['4','refuge',true],['4','sanctuary',false],['5','airfield',false],['5','anchorforge',true],['5','signalwall',true],['5','observation',true],['5','flagship',false],['5','mirrorward',false]]as const){
   await page.getByRole('button',{name:`Ch ${group}`,exact:true}).click();await page.locator(`[data-cue="${cue}"]`).click();
   await expect(expression).toHaveAttribute('aria-pressed','true');await expect(rubato).toHaveCount(breath?1:0);
  }
  await page.getByRole('group',{name:'Instrument audition'}).getByRole('button',{name:'Bass',exact:true}).click();
  const bar=page.getByRole('spinbutton',{name:'Bar',exact:true});await bar.fill('5');await bar.press('Tab');await page.getByRole('button',{name:'Play',exact:true}).click();
  const notes=()=>page.evaluate(()=>(window as unknown as {bendReview:{instrument:string;expression?:import('../../src/game/expression').NoteExpression}[]}).bendReview);
  await expect.poll(async()=>(await notes()).some(n=>n.expression?.bend)).toBe(true);
  await page.evaluate(()=>{(window as unknown as {bendReview:unknown[]}).bendReview=[];});await expression.click();
  await expect.poll(async()=>(await notes()).length).toBeGreaterThan(0);expect((await notes()).every(n=>!n.expression?.bend)).toBe(true);
  await expression.click();await page.getByRole('button',{name:'Stop',exact:true}).click();await capture(page,`fretless-bass-review-${device}`);
  await page.locator('[data-cue="airship"]').click();await expect(page.locator('.music-theme')).toHaveCount(0);
  expect(await page.evaluate(()=>JSON.stringify(localStorage))).toBe(storage);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([]);
 });
});
