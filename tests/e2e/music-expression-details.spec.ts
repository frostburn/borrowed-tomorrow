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
  const pitch=(data:Float32Array,from:number,to:number)=>{
   const crossings:number[]=[];
   for(let i=Math.ceil(from*rate);i<Math.floor(to*rate);i++)if(data[i-1]<0&&data[i]>=0)crossings.push(i-1-data[i-1]/(data[i]-data[i-1]));
   return 1200*Math.log2(rate*(crossings.length-1)/(crossings.at(-1)!-crossings[0])/hz);
  };
  const bell=performanceBar('conduit',0).notes.find(n=>n.instrument==='bell'&&n.velocity>=.09)!;
  const soft=await render(bell),short=await render(bell,{}),stopped=await render(bass,bass.expression,true);
  const end=start+bell.seconds;
  const jumps=(data:Float32Array)=>{let max=0;for(let i=Math.ceil((end+1.6)*rate);i<Math.min(data.length,Math.ceil((end+1.9)*rate));i++)max=Math.max(max,Math.abs(data[i]-data[i-1]));return max;};
  return {bass:{pitch:bass.pitch,approach:pitch(bent,start+.07,start+.15),settled:pitch(bent,start+.6,start+1),plain:pitch(plain,start+.07,start+.15),
   silence:rms(stopped,.62,.75),incoming:rms(stopped,.83,.95),cancelled:rms(stopped,1.4,2)},
   bell:{softTail:rms(soft,end+.7,end+1),shortTail:rms(short,end+.7,end+1),after:rms(soft,end+1.85,end+2.1),jump:jumps(soft)}};
 });
 await testInfo.attach('bend-centre-and-bell-release',{body:JSON.stringify(result,null,2),contentType:'application/json'});
 expect(result.bass.approach).toBeLessThan(-100);expect(Math.abs(result.bass.settled)).toBeLessThan(2);expect(Math.abs(result.bass.plain)).toBeLessThan(2);
 expect(result.bass.silence).toBeLessThan(.000001);expect(result.bass.incoming).toBeGreaterThan(.001);expect(result.bass.cancelled).toBeLessThan(.000001);
 expect(result.bell.softTail).toBeGreaterThan(.0001);expect(result.bell.shortTail).toBeLessThan(.000001);expect(result.bell.after).toBeLessThan(.000001);expect(result.bell.jump).toBeLessThan(.001);
});

test('the twelve revised cues render complete forms and loop seams with finite, unclipped audio',async({page},testInfo)=>{
 test.setTimeout(120000);await page.goto('/');
 const results=await page.evaluate(async()=>{
  // @ts-expect-error Render real campaign performance, including rubato and expression.
  const {performanceBar,scoreTime}:typeof import('../../src/game/score-performance')=await import('/src/game/score-performance.ts');
  // @ts-expect-error Render real campaign performance, including rubato and expression.
  const {scoreLength,ARRANGEMENTS}:typeof import('../../src/game/score')=await import('/src/game/score.ts');
  // @ts-expect-error Render real campaign performance, including rubato and expression.
  const {Synth}:typeof import('../../src/game/synth')=await import('/src/game/synth.ts');
  const result=[],rate=22050;
  for(const mode of ['yard','inspector','petra-battle','conduit','refuge','sanctuary','mirrorward','airfield','anchorforge','signalwall','observation','flagship']as const){
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
 });
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
