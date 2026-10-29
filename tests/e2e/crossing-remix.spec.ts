import {chapterSevenDeparture} from '../../src/dev/canonical-saves';
import {mooringDeparture} from '../support/mooring';
import {anchorDeparture} from '../support/anchors';
import {test,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import {checkpoint,coastCheckpoint,palaceCheckpoint} from '../support/progress';
import {importSave} from './navigation';
import {inspect,capture} from './controls';

test('the crossing plays its workshop remix continuously and the Music tab reviews it',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 await page.evaluate(async()=>{
  // @ts-expect-error Observe the real mixer in the dev build.
  const {Audio}:typeof import('../../src/game/audio')=await import('/src/game/audio.ts');const original=Audio.prototype.setMode;
  Audio.prototype.setMode=function(mode){(window as unknown as {crossingMusic:()=>unknown}).crossingMusic=()=>this.position();original.call(this,mode);};
 });
 await page.getByRole('button',{name:'Sound off',exact:true}).click();
 const position=()=>page.evaluate(()=>(window as unknown as {crossingMusic:()=>{mode:string;bar:number;playing:boolean}}).crossingMusic());
 await expect(page.getByRole('button',{name:'Sound on',exact:true})).toBeVisible();await importSave(page,checkpoint('chapterOneComplete'));
 await page.getByRole('button',{name:'Pause',exact:true}).click();await expect.poll(position).toMatchObject({mode:'crossing',playing:true});
 await page.getByRole('button',{name:'Next shot',exact:true}).click();await page.getByRole('button',{name:'Next shot',exact:true}).click();
 await expect.poll(position,{timeout:5000}).toMatchObject({mode:'crossing',bar:1,playing:true});
 await page.getByRole('button',{name:'Skip cinematic',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('two-coast');
 await expect.poll(position,{timeout:5000}).toMatchObject({mode:'coast',playing:true});
 await page.goto('/?dev=music');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop');await page.getByRole('button',{name:'Ch 1',exact:true}).click();
 await page.locator('[data-cue="crossing"]').click();await expect(page.locator('#music-workshop')).toContainText('120 BPM');await capture(page,'crossing-remix-workshop');expect(errors).toEqual([]);
});

for(const mode of ['crossing','capital-crossing','refuge-crossing','airfield-crossing','hollow-crossing'] as const)test(`${mode} athletic arrangement renders with headroom and energy in every bar`,async({page})=>{
 await page.goto('/');const stats=await page.evaluate(async(mode)=>{
  // @ts-expect-error Vite serves the production score/rack source.
  const {scoreBar}:typeof import('../../src/game/score')=await import('/src/game/score.ts');
  // @ts-expect-error Vite serves the production score/rack source.
  const {Synth}:typeof import('../../src/game/synth')=await import('/src/game/synth.ts');
  const rate=22050,c=new OfflineAudioContext(2,18*rate,rate),gain=c.createGain();gain.gain.value=.52*.8;gain.connect(c.destination);const synth=new Synth(c,gain);
  for(let bar=0;bar<8;bar++)for(const n of scoreBar(mode,bar))synth.note(n.instrument,n.pitch,.03+bar*2+n.beat*.5,n.duration*.5,n.velocity,n.pan,n.expression);
  const rendered=await c.startRendering();return Array.from({length:8},(_,bar)=>{
   let peak=0,sum=0,count=0;for(let channel=0;channel<2;channel++){
    const data=rendered.getChannelData(channel);for(let i=Math.ceil((.03+bar*2)*rate);i<Math.floor((.03+(bar+1)*2)*rate);i++){peak=Math.max(peak,Math.abs(data[i]));sum+=data[i]*data[i];count++;}
   }return {peak,rms:Math.sqrt(sum/count)};
  });
 },mode);
 for(const bar of stats){expect(bar.peak).toBeLessThan(.98);expect(bar.rms).toBeGreaterThan(.008);}console.log('Crossing render',stats);
});

test('the exchange approaches gradually while Nell, Orrin and their cab stay fixed',async({page})=>{
 await page.goto('/');const result=await page.evaluate(async()=>{
  // @ts-expect-error Use the actual cinematic painter at two points in the shot.
  const {paintChapterCrossing}:typeof import('../../src/game/crossing-art')=await import('/src/game/crossing-art.ts');
  const frames=[11900,15800].map(time=>{
   const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=576;const c=canvas.getContext('2d')!;paintChapterCrossing(c,time);
   const data=c.getImageData(0,0,1024,576).data;let windows=0;
   for(let y=280;y<330;y++)for(let x=160;x<400;x++){const i=(y*1024+x)*4;if(data[i]===200&&data[i+1]===182&&data[i+2]===140)windows++;}
   const cast:number[]=[];for(let i=0;i<data.length;i+=4)if(data[i]===128&&data[i+1]===85&&data[i+2]===61||data[i]===189&&data[i+1]===148&&data[i+2]===90)cast.push(i);
   return {image:canvas.toDataURL(),windows,cast,cab:[...c.getImageData(70,100,40,40).data]};
  });return {early:frames[0],late:frames[1]};
 });
 expect(result.late.windows).toBeGreaterThan(result.early.windows);expect(result.late.cab).toEqual(result.early.cab);expect(result.late.cast).toEqual(result.early.cast);
 if(process.env.BT_QA_SCREENSHOTS)for(const [name,f]of Object.entries(result))await writeFile(`${process.env.BT_QA_SCREENSHOTS}/exchange-${name}.png`,Buffer.from(f.image.split(',')[1],'base64'));
});

test('the capital crossing plays its athletic Northglass remix continuously and Music reviews it',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 await page.evaluate(async()=>{
  // @ts-expect-error Observe the real mixer in the dev build.
  const {Audio}:typeof import('../../src/game/audio')=await import('/src/game/audio.ts');const original=Audio.prototype.setMode;
  Audio.prototype.setMode=function(mode){(window as unknown as {crossingMusic:()=>unknown}).crossingMusic=()=>this.position();original.call(this,mode);};
 });
 await page.getByRole('button',{name:'Sound off',exact:true}).click();
 const position=()=>page.evaluate(()=>(window as unknown as {crossingMusic:()=>{mode:string;bar:number;playing:boolean}}).crossingMusic());
 await expect(page.getByRole('button',{name:'Sound on',exact:true})).toBeVisible();await importSave(page,coastCheckpoint('chapterTwoComplete'));
 await page.getByRole('button',{name:'Pause',exact:true}).click();await expect.poll(position).toMatchObject({mode:'capital-crossing',playing:true});
 await page.getByRole('button',{name:'Next shot',exact:true}).click();await page.getByRole('button',{name:'Next shot',exact:true}).click();
 await expect.poll(position,{timeout:5000}).toMatchObject({mode:'capital-crossing',bar:1,playing:true});
 await page.getByRole('button',{name:'Skip cinematic',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('three-capital');
 await expect.poll(position,{timeout:5000}).toMatchObject({mode:'northglass',playing:true});
 await page.goto('/?dev=music');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop');await page.getByRole('button',{name:'Ch 2',exact:true}).click();
 await page.locator('[data-cue="capital-crossing"]').click();await expect(page.locator('#music-workshop')).toContainText('120 BPM');await capture(page,'capital-remix-workshop');expect(errors).toEqual([]);
});

test('the refuge crossing plays its athletic homeward remix continuously and Music reviews it',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 await page.evaluate(async()=>{
  // @ts-expect-error Observe the real mixer in the dev build.
  const {Audio}:typeof import('../../src/game/audio')=await import('/src/game/audio.ts');const original=Audio.prototype.setMode;
  Audio.prototype.setMode=function(mode){(window as unknown as {crossingMusic:()=>unknown}).crossingMusic=()=>this.position();original.call(this,mode);};
 });
 await page.getByRole('button',{name:'Sound off',exact:true}).click();
 const position=()=>page.evaluate(()=>(window as unknown as {crossingMusic:()=>{mode:string;bar:number;playing:boolean}}).crossingMusic());
 await expect(page.getByRole('button',{name:'Sound on',exact:true})).toBeVisible();await importSave(page,palaceCheckpoint('chapterThreeComplete'));
 await page.getByRole('button',{name:'Pause',exact:true}).click();await expect.poll(position).toMatchObject({mode:'refuge-crossing',playing:true});
 await page.getByRole('button',{name:'Next shot',exact:true}).click();await page.getByRole('button',{name:'Next shot',exact:true}).click();
 await expect.poll(position,{timeout:5000}).toMatchObject({mode:'refuge-crossing',bar:1,playing:true});
 await page.getByRole('button',{name:'Skip cinematic',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('four-home');
 await expect.poll(position,{timeout:5000}).toMatchObject({mode:'refuge',playing:true});
 await page.goto('/?dev=music');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop');await page.getByRole('button',{name:'Ch 3',exact:true}).click();
 await page.locator('[data-cue="refuge-crossing"]').click();await expect(page.locator('#music-workshop')).toContainText('120 BPM');await capture(page,'refuge-remix-workshop');expect(errors).toEqual([]);
});

test('the airfield crossing plays its western-road remix continuously and Music reviews it',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 await page.evaluate(async()=>{
  // @ts-expect-error Observe the real mixer in the dev build.
  const {Audio}:typeof import('../../src/game/audio')=await import('/src/game/audio.ts');const original=Audio.prototype.setMode;
  Audio.prototype.setMode=function(mode){(window as unknown as {crossingMusic:()=>unknown}).crossingMusic=()=>this.position();original.call(this,mode);};
 });
 await page.getByRole('button',{name:'Sound off',exact:true}).click();
 const position=()=>page.evaluate(()=>(window as unknown as {crossingMusic:()=>{mode:string;bar:number;playing:boolean}}).crossingMusic());
 await expect(page.getByRole('button',{name:'Sound on',exact:true})).toBeVisible();await importSave(page,anchorDeparture());
 await page.getByRole('button',{name:'Pause',exact:true}).click();await expect.poll(position).toMatchObject({mode:'airfield-crossing',playing:true});
 await page.getByRole('button',{name:'Next shot',exact:true}).click();await page.getByRole('button',{name:'Next shot',exact:true}).click();
 await expect.poll(position,{timeout:5000}).toMatchObject({mode:'airfield-crossing',bar:1,playing:true});
 await page.getByRole('button',{name:'Skip cinematic',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('five-airfield');
 await expect.poll(position,{timeout:5000}).toMatchObject({mode:'airfield',playing:true});
 await page.goto('/?dev=music');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop');await page.getByRole('button',{name:'Ch 4',exact:true}).click();
 await page.locator('[data-cue="airfield-crossing"]').click();await expect(page.locator('#music-workshop')).toContainText('120 BPM');await capture(page,'airfield-remix-workshop');expect(errors).toEqual([]);
});

test('the mooring crossing plays its quiet airship phrase continuously and Music reviews it',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 await page.evaluate(async()=>{
  // @ts-expect-error Observe the real mixer in the dev build.
  const {Audio}:typeof import('../../src/game/audio')=await import('/src/game/audio.ts');const original=Audio.prototype.setMode;
  Audio.prototype.setMode=function(mode){(window as unknown as {crossingMusic:()=>unknown}).crossingMusic=()=>this.position();original.call(this,mode);};
 });
 await page.getByRole('button',{name:'Sound off',exact:true}).click();
 const position=()=>page.evaluate(()=>(window as unknown as {crossingMusic:()=>{mode:string;bar:number;playing:boolean}}).crossingMusic());
 await expect(page.getByRole('button',{name:'Sound on',exact:true})).toBeVisible();await importSave(page,mooringDeparture());
 await page.getByRole('button',{name:'Pause',exact:true}).click();await expect.poll(position).toMatchObject({mode:'mooring-crossing',playing:true});
 await page.getByRole('button',{name:'Next shot',exact:true}).click();await page.getByRole('button',{name:'Next shot',exact:true}).click();
 await expect.poll(position,{timeout:5000}).toMatchObject({mode:'mooring-crossing',bar:1,playing:true});
 await page.getByRole('button',{name:'Skip cinematic',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-sealed');
 await expect.poll(position,{timeout:5000}).toMatchObject({mode:'outermooring',playing:true});
 await page.goto('/?dev=music');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop');await page.getByRole('button',{name:'Ch 5',exact:true}).click();
 await page.locator('[data-cue="mooring-crossing"]').click();await expect(page.locator('#music-workshop')).toContainText('120 BPM');await capture(page,'mooring-remix-workshop');expect(errors).toEqual([]);
});

for(const mode of ['mooring-crossing'] as const)test(`${mode} quiet arrangement renders with headroom and audible holds in every bar`,async({page})=>{
 await page.goto('/');const stats=await page.evaluate(async(mode)=>{
  // @ts-expect-error Vite serves the production score/rack source.
  const {scoreBar}:typeof import('../../src/game/score')=await import('/src/game/score.ts');
  // @ts-expect-error Vite serves the production score/rack source.
  const {Synth}:typeof import('../../src/game/synth')=await import('/src/game/synth.ts');
  const rate=22050,c=new OfflineAudioContext(2,18*rate,rate),gain=c.createGain();gain.gain.value=.52*.8;gain.connect(c.destination);const synth=new Synth(c,gain);
  for(let bar=0;bar<8;bar++)for(const n of scoreBar(mode,bar))synth.note(n.instrument,n.pitch,.03+bar*2+n.beat*.5,n.duration*.5,n.velocity,n.pan,n.expression);
  const rendered=await c.startRendering();return Array.from({length:8},(_,bar)=>{
   let peak=0,sum=0,count=0;for(let channel=0;channel<2;channel++){
    const data=rendered.getChannelData(channel);for(let i=Math.ceil((.03+bar*2)*rate);i<Math.floor((.03+(bar+1)*2)*rate);i++){peak=Math.max(peak,Math.abs(data[i]));sum+=data[i]*data[i];count++;}
   }return {peak,rms:Math.sqrt(sum/count)};
  });
 },mode);
 for(const bar of stats){expect(bar.peak).toBeLessThan(.98);expect(bar.rms).toBeGreaterThan(.001);}console.log('Crossing render',stats);
});

test('the hollow crossing plays its domain arrangement continuously and Music reviews it',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 await page.evaluate(async()=>{
  // @ts-expect-error Observe the real mixer in the dev build.
  const {Audio}:typeof import('../../src/game/audio')=await import('/src/game/audio.ts');const original=Audio.prototype.setMode;
  Audio.prototype.setMode=function(mode){(window as unknown as {crossingMusic:()=>unknown}).crossingMusic=()=>this.position();original.call(this,mode);};
 });
 await page.getByRole('button',{name:'Sound off',exact:true}).click();
 const position=()=>page.evaluate(()=>(window as unknown as {crossingMusic:()=>{mode:string;bar:number;playing:boolean}}).crossingMusic());
 await expect(page.getByRole('button',{name:'Sound on',exact:true})).toBeVisible();await importSave(page,chapterSevenDeparture());
 await page.getByRole('button',{name:'Pause',exact:true}).click();await expect.poll(position).toMatchObject({mode:'hollow-crossing',playing:true});
 await page.getByRole('button',{name:'Next shot',exact:true}).click();await page.getByRole('button',{name:'Next shot',exact:true}).click();
 await expect.poll(position,{timeout:5000}).toMatchObject({mode:'hollow-crossing',bar:1,playing:true});
 await page.getByRole('button',{name:'Skip cinematic',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('seven-crossing');
 await expect.poll(position,{timeout:5000}).toMatchObject({mode:'hollowsill',playing:true});
 await page.goto('/?dev=music');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop');await page.getByRole('button',{name:'Ch 6',exact:true}).click();
 await page.locator('[data-cue="hollow-crossing"]').click();await expect(page.locator('#music-workshop')).toContainText('120 BPM');await capture(page,'hollow-remix-workshop');expect(errors).toEqual([]);
});
