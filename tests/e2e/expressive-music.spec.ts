import { test,expect } from '@playwright/test';
import { capture } from './controls';

test('sung reeds bloom in level and vibrato around their exact 31-EDO pitch, and cancel future swells',async({page},testInfo)=>{
 await page.goto('/');const measured=await page.evaluate(async()=>{
  // @ts-expect-error Vite serves the actual performance and instrument rack.
  const {performanceBar}:typeof import('../../src/game/score-performance')=await import('/src/game/score-performance.ts');
  // @ts-expect-error Vite serves the actual performance and instrument rack.
  const {Synth}:typeof import('../../src/game/synth')=await import('/src/game/synth.ts');
  // @ts-expect-error Pitch centres come from the same spelled tuning as the score.
  const {pitchFrequency}:typeof import('../../src/game/tuning')=await import('/src/game/tuning.ts');
  const n=performanceBar('windmere',0).notes.find(n=>n.expression)!,rate=22050,start=.03,duration=n.seconds;
  const c=new OfflineAudioContext(1,Math.ceil((duration+1)*rate),rate),synth=new Synth(c,c.destination);
  synth.note(n.instrument,n.pitch,start,duration,n.velocity,n.pan,n.expression);
  const data=(await c.startRendering()).getChannelData(0),hz=pitchFrequency(n.pitch);
  const rms=(data:Float32Array,from:number,to:number)=>{let sum=0,count=0;for(let i=Math.ceil(from*rate);i<Math.floor(to*rate);i++){sum+=data[i]*data[i];count++;}return Math.sqrt(sum/count);};
  const pitch=(from:number,to:number)=>{
   const crossings:number[]=[];
   for(let i=Math.ceil(from*rate);i<Math.floor(to*rate);i++)if(data[i-1]<0&&data[i]>=0)crossings.push(i-1-data[i-1]/(data[i]-data[i-1]));
   const cents=crossings.slice(1).map((at,i)=>1200*Math.log2(rate/(at-crossings[i])/hz)),mean=cents.reduce((a,b)=>a+b,0)/cents.length;
   return {mean,spread:Math.sqrt(cents.reduce((a,b)=>a+(b-mean)**2,0)/cents.length)};
  };
  const early=pitch(start+duration*.06,start+duration*.14),bloom=pitch(start+duration*.5,start+duration*.78),late=pitch(start+duration*.9,start+duration*.98);
  const levels={early:rms(data,start+duration*.03,start+duration*.09),bloom:rms(data,start+duration*.5,start+duration*.65),late:rms(data,start+duration*.92,start+duration*.98)};
  const stopped=new OfflineAudioContext(1,Math.ceil((duration+2)*rate),rate),release=new Synth(stopped,stopped.destination);
  release.note(n.instrument,n.pitch,start,duration,n.velocity,0,n.expression);
  release.note(n.instrument,n.pitch,2.4,2,n.velocity,0,n.expression); // old bar's queued attack
  release.release(.9);release.note('keys','Db5',1.4,.5,.2);
  const clean=(await stopped.startRendering()).getChannelData(0);
  return {pitch:n.pitch,early,bloom,late,levels,silence:rms(clean,1.1,1.3),incoming:rms(clean,1.45,1.6),after:rms(clean,2.3,duration+.8)};
 });
 await testInfo.attach('performed-pitch-and-gain',{body:JSON.stringify(measured,null,2),contentType:'application/json'});
 expect(measured.early.spread).toBeLessThan(1.5);expect(Math.abs(measured.early.mean)).toBeLessThan(1);
 expect(measured.bloom.spread).toBeGreaterThan(8);expect(measured.bloom.spread).toBeLessThan(30);expect(Math.abs(measured.bloom.mean)).toBeLessThan(3);
 expect(measured.late.spread).toBeLessThan(measured.bloom.spread*.85);
 expect(measured.levels.bloom).toBeGreaterThan(measured.levels.early*1.3);expect(measured.levels.late).toBeLessThan(measured.levels.bloom*.6);
 expect(measured.silence).toBeLessThan(.00001);expect(measured.incoming).toBeGreaterThan(.005);expect(measured.after).toBeLessThan(.00001);
});

for(const [device,viewport,dpr]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const)test.describe(`expressive review on ${device}`,()=>{
 test.use({viewport,deviceScaleFactor:dpr});
 test('compares swells and rubato through the real player, seeks over the loop and leaves saves alone',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('/?dev=music');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop');
  const stored=await page.evaluate(()=>JSON.stringify(localStorage));
  const expected=await page.evaluate(async()=>{
   // @ts-expect-error Observe the real rack without a production debug API.
   const {Synth}:typeof import('../../src/game/synth')=await import('/src/game/synth.ts');
   // @ts-expect-error Observe the real rack without a production debug API.
   const {Audio}:typeof import('../../src/game/audio')=await import('/src/game/audio.ts');
   // @ts-expect-error Use the same performed clock as the campaign.
   const {performanceBar}:typeof import('../../src/game/score-performance')=await import('/src/game/score-performance.ts');
   const state=window as unknown as {expressionNotes:{instrument:string;pitch:string;when:number;seconds:number;expression?:import('../../src/game/expression').NoteExpression}[];expressionPosition:()=>{mode:string;bar:number;beat:number;playing:boolean}};
   state.expressionNotes=[];
   const note=Synth.prototype.note;Synth.prototype.note=function(...args){const [instrument,pitch,when,seconds,,,expression]=args;state.expressionNotes.push({instrument,pitch,when,seconds,expression});return note.apply(this,args);};
   const play=Audio.prototype.play;Audio.prototype.play=async function(...args){state.expressionPosition=()=>this.position();return play.apply(this,args);};
   return {nell:performanceBar('airship',1).notes.filter(n=>n.expression),celia:performanceBar('windmere',0).notes.find(n=>n.expression)!};
  });
  const notes=()=>page.evaluate(()=>(window as unknown as {expressionNotes:{instrument:string;pitch:string;when:number;seconds:number;expression?:import('../../src/game/expression').NoteExpression}[]}).expressionNotes);
  const clear=()=>page.evaluate(()=>{(window as unknown as {expressionNotes:unknown[]}).expressionNotes=[];});
  await page.getByRole('button',{name:'Themes',exact:true}).click();await page.locator('[data-cue="airship"]').click();
  const swell=page.getByRole('button',{name:'Swell/vibrato',exact:true}),rubato=page.getByRole('button',{name:'Rubato',exact:true}),bar=page.getByRole('spinbutton',{name:'Bar',exact:true});
  await expect(swell).toHaveAttribute('aria-pressed','true');await expect(rubato).toHaveAttribute('aria-pressed','true');
  await bar.fill('2');await bar.press('Tab');await page.getByRole('button',{name:'Play',exact:true}).click();
  await expect.poll(async()=>(await notes()).filter(n=>n.instrument==='reed').length).toBeGreaterThanOrEqual(2);
  const sung=(await notes()).filter(n=>n.instrument==='reed');
  expect(sung[1].when-sung[0].when).toBeCloseTo(expected.nell[1].time-expected.nell[0].time,8);
  expect(sung[1].seconds).toBeCloseTo(expected.nell[1].seconds,8);expect(sung[1].expression?.vibrato).toEqual(expected.nell[1].expression!.vibrato);
  await clear();await swell.click();await expect(swell).toHaveAttribute('aria-pressed','false');
  await expect.poll(async()=>(await notes()).filter(n=>n.instrument==='reed').length).toBeGreaterThanOrEqual(2);
  expect((await notes()).filter(n=>n.instrument==='reed').every(n=>!n.expression?.dynamics&&!n.expression?.vibrato)).toBe(true);
  await clear();await rubato.click();await expect(rubato).toHaveAttribute('aria-pressed','false');
  await expect.poll(async()=>(await notes()).filter(n=>n.instrument==='reed').length).toBeGreaterThanOrEqual(2);
  const straight=(await notes()).filter(n=>n.instrument==='reed');expect(straight[1].when-straight[0].when).toBeCloseTo(1.5*60/86,8);
  await page.locator('[data-cue="windmere"]').click();await swell.click();await rubato.click();await clear();await page.getByRole('button',{name:'Restart cue',exact:true}).click();
  await expect.poll(async()=>(await notes()).some(n=>n.pitch==='Ab5')).toBe(true);
  const held=(await notes()).find(n=>n.pitch==='Ab5')!;expect(held.seconds).toBeCloseTo(expected.celia.seconds,8);expect(held.expression).toEqual(expected.celia.expression);
  await bar.fill('32');await bar.press('Tab');await expect(page.locator('#music-position')).toContainText('Playing / bar 32');
  await expect(page.locator('#music-position')).toContainText('Playing / bar 1 /',{timeout:6000});await expect(page.locator('#music-notes-title')).toHaveText('Bar 1 / 32');
  const position=await page.evaluate(()=>(window as unknown as {expressionPosition:()=>{mode:string;bar:number;beat:number;playing:boolean}}).expressionPosition());
  expect(position).toMatchObject({mode:'windmere',bar:32,playing:true});expect(position.beat).toBeGreaterThanOrEqual(0);expect(position.beat).toBeLessThan(3);
  await page.getByRole('button',{name:'Stop',exact:true}).click();await expect(page.locator('#music-position')).toContainText('Stopped');await capture(page,`expressive-themes-${device}`);
  await page.getByRole('navigation',{name:'Workshop panels'}).getByRole('button',{name:'Character',exact:true}).click();await expect(page.getByRole('button',{name:'Sound off',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>JSON.stringify(localStorage))).toBe(stored);expect(await page.locator('vite-error-overlay').count()).toBe(0);expect(errors).toEqual([]);
 });
});
