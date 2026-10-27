import { test, expect } from '@playwright/test';
import { capture, inspect } from './controls';

for(const [device,viewport,dpr]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const){
 test(`flagship music reviews 10/8, new instruments and an intro that stays out of the loop on ${device}`,async({browser})=>{
  const context=await browser.newContext({viewport,deviceScaleFactor:dpr}),page=await context.newPage();
  try{
   const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await page.goto('/?dev=music');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop');const stored=await page.evaluate(()=>JSON.stringify(localStorage));
   await page.getByRole('button',{name:'Ch 5',exact:true}).click();await page.locator('[data-cue="flagship"]').click();
   await expect(page.getByRole('region',{name:'Music review'})).toContainText('140 BPM / 10/8 / 34 bars / 2-bar intro, then 32-bar loop / 2+2+3+3');
   await expect(page.locator('#music-notes thead')).toContainText('Eighth');
   const parts=page.getByRole('group',{name:'Instrument audition'}),bar=page.getByRole('spinbutton',{name:'Bar',exact:true});
   for(const instrument of ['Brass','Timpani']){await parts.getByRole('button',{name:instrument,exact:true}).click();await expect(page.locator('#music-notes tbody')).toContainText(instrument.toLowerCase());}
   await parts.getByRole('button',{name:'All',exact:true}).click();await capture(page,`flagship-music-${device}`);
   await bar.fill('34');await bar.press('Tab');await page.getByRole('button',{name:'Play',exact:true}).click();
   await expect(page.locator('#music-position')).toContainText('Playing / bar 34');
   await expect(page.locator('#music-position')).toContainText('Playing / bar 3',{timeout:6000});await expect(page.locator('#music-notes-title')).toContainText('/ Loop');
   await page.getByRole('button',{name:'Restart cue',exact:true}).click();await expect(page.locator('#music-position')).toContainText('Playing / bar 1');await expect(page.locator('#music-notes-title')).toContainText('/ Intro');
   await expect(page.locator('#music-position')).toContainText('Playing / bar 3',{timeout:7000});await expect(page.locator('#music-notes-title')).toContainText('/ Loop');
   await page.getByRole('button',{name:'Sound on',exact:true}).click();await expect(page.locator('#music-position')).toContainText('Stopped');
   expect(await page.evaluate(()=>JSON.stringify(localStorage))).toBe(stored);expect(await page.locator('vite-error-overlay').count()).toBe(0);expect(errors).toEqual([]);
  }finally{await context.close();}
 });
}

test('battle entry and restart start the dedicated fanfare immediately',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/?dev=boss&boss=flagship');
 await page.evaluate(async()=>{
  // @ts-expect-error Observe the actual mixer without a production mutation API.
  const {Audio}:typeof import('../../src/game/audio')=await import('/src/game/audio.ts');const original=Audio.prototype.setMode;
  Audio.prototype.setMode=function(mode){(window as unknown as {bossMusic:()=>unknown}).bossMusic=()=>this.position();original.call(this,mode);};
 });
 await page.getByRole('button',{name:'Start Chapter Five preset',exact:true}).click();await page.getByRole('button',{name:'Sound off',exact:true}).click();
 const position=()=>page.evaluate(()=>(window as unknown as {bossMusic:()=>{mode:string;bar:number;playing:boolean}}).bossMusic());
 await expect.poll(position).toMatchObject({mode:'flagship',bar:0,playing:true});await expect.poll(position,{timeout:5000}).toMatchObject({bar:1});
 await page.getByRole('button',{name:'Restart battle',exact:true}).click();await expect.poll(position).toMatchObject({mode:'flagship',bar:0,playing:true});expect((await inspect(page)).battle!.round).toBe(1);
 await page.getByRole('button',{name:'Sound on',exact:true}).click();expect((await position()).playing).toBe(false);expect(errors).toEqual([]);
});

test('the full fanfare and loop render through the new rack without clipping or silent sections',async({page})=>{
 test.setTimeout(120000);await page.goto('/');
 const sections=await page.evaluate(async()=>{
  // @ts-expect-error Vite serves the shared score and live rack.
  const {scoreBar,ARRANGEMENTS}:typeof import('../../src/game/score')=await import('/src/game/score.ts');
  // @ts-expect-error Vite serves the shared score and live rack.
  const {Synth}:typeof import('../../src/game/synth')=await import('/src/game/synth.ts');
  const beat=60/ARRANGEMENTS.flagship.bpm,rate=22050,out=[];
  // Include two bars after the seam. Bound graphs to eight bars, retaining tails.
  for(let start=0;start<36;start+=8){
   const count=Math.min(8,36-start),leadIn=Math.min(2,start),seconds=(leadIn+count)*5*beat;
   const c=new OfflineAudioContext(2,Math.ceil((seconds+2)*rate),rate),gain=c.createGain();gain.gain.value=.52;gain.connect(c.destination);const synth=new Synth(c,gain);
   for(let b=start-leadIn;b<start+count;b++)for(const n of scoreBar('flagship',b))synth.note(n.instrument,n.pitch,.03+(b-start+leadIn)*5*beat+n.beat*beat,n.duration*beat,n.velocity,n.pan,n.expression);
   const rendered=await c.startRendering();let peak=0,sum=0,samples=0;
   for(let channel=0;channel<2;channel++){const data=rendered.getChannelData(channel);for(let i=Math.ceil((.03+leadIn*5*beat)*rate);i<Math.floor(seconds*rate);i++){const v=data[i];if(!Number.isFinite(v))throw Error('Non-finite audio');peak=Math.max(peak,Math.abs(v));sum+=v*v;samples++;}}
   out.push({start,peak,rms:Math.sqrt(sum/samples)});
  }
  return out;
 });
 for(const section of sections){expect(section.peak,JSON.stringify(section)).toBeLessThan(.9);expect(section.rms,JSON.stringify(section)).toBeGreaterThan(.008);}
});
