import {test,expect} from '@playwright/test';
import {checkpoint,palaceCheckpoint} from '../support/progress';
import {importSave,approach} from './navigation';
import {inspect,capture} from './controls';

test('all-pass rooms render finite stereo tails at both device rates, with a true dry reference',async({page})=>{
 await page.goto('/');
 const results=await page.evaluate(async()=>{
  // @ts-expect-error Vite serves the shared production effect.
  const {RoomReverb}:typeof import('../../src/game/room-reverb')=await import('/src/game/room-reverb.ts');
  // @ts-expect-error Authored production profiles, not test substitutes.
  const {ROOMS}:typeof import('../../src/content/rooms')=await import('/src/content/rooms.ts');
  const rows=[];
  for(const rate of [44100,48000])for(const id of Object.keys(ROOMS)as (keyof typeof ROOMS)[]){
   const c=new OfflineAudioContext(2,rate*7,rate),input=c.createGain(),reverb=new RoomReverb(c,input,c.destination);reverb.setRoom(id);
   const impulse=c.createBuffer(1,1,rate);impulse.getChannelData(0)[0]=.3;const source=c.createBufferSource();source.buffer=impulse;source.connect(input);source.start(.5);
   const rendered=await c.startRendering();let peak=0,tail=0,late=0,right=0,end=0,finite=true;
   for(let ch=0;ch<2;ch++){const data=rendered.getChannelData(ch);for(let i=0;i<data.length;i++){
    const a=data[i];finite&&=Number.isFinite(a);peak=Math.max(peak,Math.abs(a));if(i>rate*.51){tail+=a*a;if(ch)right+=a*a;}if(i>rate*1.5)late+=a*a;if(i>rate*6.8)end+=a*a;
   }}
   reverb.close();rows.push({rate,id,peak,tail,late,right,end,finite});
  }
  return rows;
 });
 for(const r of results){expect(r.finite,JSON.stringify(r)).toBe(true);expect(r.peak,r.id).toBeLessThan(.4);
  if(r.id==='dry'){expect(r.tail).toBe(0);expect(r.peak).toBeCloseTo(.3,6);}
  else{expect(r.tail,r.id).toBeGreaterThan(1e-8);expect(r.right,r.id).toBeGreaterThan(1e-8);expect(r.end,r.id).toBeLessThan(r.tail*.001);}
 }
 for(const rate of [44100,48000])expect(results.find(r=>r.rate===rate&&r.id==='domain')!.late).toBeGreaterThan(results.find(r=>r.rate===rate&&r.id==='cabin')!.late*100);
});

test('rapid room changes keep a bounded graph and settle on the latest room without unstable transients',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(async()=>{
  // @ts-expect-error Real all-pass implementation under an offline audio clock.
  const {RoomReverb}:typeof import('../../src/game/room-reverb')=await import('/src/game/room-reverb.ts');
  const rate=48000,c=new OfflineAudioContext(2,rate*8,rate),input=c.createGain(),out=c.createGain();out.connect(c.destination);
  let alive=0,maximum=0;const create=c.createDelay.bind(c);
  c.createDelay=(max?:number)=>{const n=create(max);alive++;maximum=Math.max(maximum,alive);const disconnect=n.disconnect.bind(n);n.disconnect=()=>{alive--;disconnect();};return n;};
  const reverb=new RoomReverb(c,input,out);reverb.setRoom('domain');
  const tone=c.createOscillator(),gain=c.createGain();tone.frequency.value=137;gain.gain.value=.15;tone.connect(gain);gain.connect(input);tone.start(.02);tone.stop(3);
  const stopped=c.suspend(.75),settled=c.suspend(2),rendered=c.startRendering();await stopped;
  for(let i=0;i<100;i++)reverb.setRoom(i%2?'hall':'cabin');reverb.setRoom('open');
  await c.resume();await settled;await new Promise<void>(resolve=>setTimeout(resolve,0));const finalRoom=reverb.activeRoom;
  await c.resume();const audio=await rendered;let peak=0,jump=0,tail=0;
  for(let ch=0;ch<2;ch++){const d=audio.getChannelData(ch);for(let i=1;i<d.length;i++){peak=Math.max(peak,Math.abs(d[i]));if(i>rate*.7&&i<rate*2)jump=Math.max(jump,Math.abs(d[i]-d[i-1]));if(i>rate*7)tail+=d[i]*d[i];}}
  reverb.close();return{maximum,alive,peak,jump,tail,finalRoom};
 });
 expect(result.finalRoom).toBe('open');expect(result.maximum).toBeLessThanOrEqual(24);expect(result.alive).toBe(0);expect(result.peak).toBeLessThan(.3);expect(result.jump).toBeLessThan(.02);expect(result.tail).toBeLessThan(1e-7);
});

test('campaign rooms follow the location through reused music and battles',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Sound off',exact:true}).click();
 const outside=checkpoint('raidSeen');await importSave(page,outside);expect((await inspect(page)).audioRoom).toBe('open');
 const inside=palaceCheckpoint('conduitSeen');await importSave(page,inside);expect((await inspect(page)).audioRoom).toBe('works');
 await approach(page,'heart-regulator');await expect.poll(async()=>(await inspect(page)).mode).toBe('battle');expect((await inspect(page)).audioRoom).toBe('works');
 await page.getByRole('button',{name:'Win battle',exact:true}).click();await page.getByRole('button',{name:'Continue the journey',exact:true}).click();expect((await inspect(page)).audioRoom).toBe('works');
});

for(const [device,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]as const)test(`room review ${device}: canonical rooms, overrides without restarting, audition and reset`,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:1.25}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('/?dev=music');const select=page.locator('.music-rooms summary');const room=async(name:string)=>{await select.click();await page.getByRole('group',{name:'Room',exact:true}).getByRole('button',{name,exact:true}).click();};await expect(select).toContainText('Canonical · Open air');
  await page.getByRole('button',{name:'Ch 3',exact:true}).click();await page.locator('[data-cue="conduit"]').click();await expect(select).toContainText('Canonical · Engine hall');
  await page.getByRole('button',{name:'Play',exact:true}).click();await expect(page.locator('#music-position')).toContainText('Playing');
  await page.getByRole('spinbutton',{name:'Bar',exact:true}).fill('5');await page.getByRole('spinbutton',{name:'Bar',exact:true}).press('Tab');await room('Cavern');await expect(select).toHaveText('Room: Cavern');await expect(page.getByRole('spinbutton',{name:'Bar',exact:true})).toHaveValue('5');await expect(page.locator('#music-position')).toContainText('Playing');await capture(page,`room-review-${device}`);
  await room('Dry');await page.getByRole('button',{name:'Stop',exact:true}).click();await page.getByRole('button',{name:'Compare C#4 / Db4',exact:true}).click();await page.getByRole('button',{name:'Stop',exact:true}).click();
  await page.locator('[data-cue="relayhall"]').click();await expect(select).toContainText('Canonical · Engine hall');
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await context.close();}
});
