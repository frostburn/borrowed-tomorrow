import { test,expect } from '@playwright/test';
const cues=[['bellharbor','Skeld · Answering Bells'],['frostwatch','The Covered Road'],['glacier','The Fleet beneath the Ice'],['wintershrine','A Bell for the Outer Marker'],['north-battle','Skeld · Open the Mountain'],['winter-dragon','Wings over the Winter Bell']]as const;
for(const [device,viewport,dpr]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const)test(`northern music workshop on ${device}`,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:dpr}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('/?dev=music');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop',{timeout:20000});await page.getByRole('button',{name:'Ch 6',exact:true}).click();
  for(const [mode,title]of cues){await page.locator(`[data-cue="${mode}"]`).click();await expect(page.getByRole('heading',{name:title,exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Expression',exact:true})).toBeVisible();}
  await expect(page.locator('.music-description').first()).toContainText('5/4');await expect(page.locator('.music-description').first()).toContainText('2-bar intro');
  await page.getByRole('button',{name:'Play',exact:true}).click();await expect(page.locator('#music-position')).toContainText('Playing');await page.getByRole('button',{name:'Stop',exact:true}).click();
  await page.getByRole('button',{name:'Tritaver',exact:true}).click();await expect(page.locator('#music-notes')).toContainText('tritaver');
  await page.locator('[data-cue="bellharbor"]').click();await page.getByRole('button',{name:'Sine',exact:true}).click();await expect(page.locator('#music-notes')).toContainText('sine');await expect(page.getByRole('button',{name:'Rubato',exact:true})).toBeVisible();await page.getByRole('button',{name:'All',exact:true}).click();await expect(page.locator('#music-notes')).toContainText('D#');await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);if(process.env.BT_QA_SCREENSHOTS)await page.screenshot({path:`${process.env.BT_QA_SCREENSHOTS}/skeld-music-${device}.png`});
 }finally{await context.close();}
});
for(const [mode]of cues)test(`north cue ${mode}: complete form and loop have audible finite audio without sample snaps`,async({page},testInfo)=>{
 test.setTimeout(120000);await page.route('**/offline-score-review',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>Offline score review</title>'}));await page.goto('/offline-score-review');
 const result=await page.evaluate(async mode=>{
  // @ts-expect-error The Vite source is the same score used by live playback.
  const {ARRANGEMENTS,scoreLength}:typeof import('../../src/game/score')=await import('/src/game/score.ts');
  // @ts-expect-error Render the actual procedural rack.
  const {Synth}:typeof import('../../src/game/synth')=await import('/src/game/synth.ts');
  // @ts-expect-error Preserve ensemble rubato and held-note expression.
  const {performanceBar,scoreTime}:typeof import('../../src/game/score-performance')=await import('/src/game/score-performance.ts');
  const rate=22050,a=ARRANGEMENTS[mode],bars=scoreLength(mode)+2;let peak=0,sum=0,jump=0,count=0;
  for(let start=0;start<bars;start+=4){
   const take=Math.min(4,bars-start),first=Math.max(0,start-4),reference=scoreTime(mode,first*a.beats),begin=scoreTime(mode,start*a.beats)-reference,end=scoreTime(mode,(start+take)*a.beats)-reference;
   const c=new OfflineAudioContext(2,Math.ceil((end+a.beats*60/a.bpm+3)*rate),rate),gain=c.createGain();gain.gain.value=.52;gain.connect(c.destination);const synth=new Synth(c,gain);
   for(let bar=first;bar<start+take+1;bar++)for(const n of performanceBar(mode,bar).notes)synth.note(n.instrument,n.pitch,.03+scoreTime(mode,bar*a.beats)-reference+n.time,n.seconds,n.velocity,n.pan,n.expression);
   const audio=await c.startRendering();for(let channel=0;channel<2;channel++){const d=audio.getChannelData(channel);for(let i=Math.ceil((.03+begin)*rate);i<Math.floor((.03+end)*rate);i++){const v=d[i];if(!Number.isFinite(v))throw new Error('Non-finite audio');peak=Math.max(peak,Math.abs(v));sum+=v*v;jump=Math.max(jump,Math.abs(v-d[i-1]));count++;}}
  }
  return {mode,peak,rms:Math.sqrt(sum/count),jump,bars};
 },mode);
 await testInfo.attach(`north-loop-${mode}`,{body:JSON.stringify(result,null,2),contentType:'application/json'});expect(result.peak,JSON.stringify(result)).toBeLessThan(.9);expect(result.rms,JSON.stringify(result)).toBeGreaterThan(.0035);expect(result.jump,JSON.stringify(result)).toBeLessThan(.25);
});

test('sine and tritaver preserve written pitch, sparse partials and clean cancellation in the actual rack',async({page},testInfo)=>{
 await page.route('**/offline-voice-review',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>Offline voice review</title>'}));await page.goto('/offline-voice-review');
 const spectra=await page.evaluate(async()=>{
  // @ts-expect-error Vite serves the live procedural rack.
  const {Synth}:typeof import('../../src/game/synth')=await import('/src/game/synth.ts');
  // @ts-expect-error Check a half-accidental pitch as well as A=440.
  const {pitchFrequency}:typeof import('../../src/game/tuning')=await import('/src/game/tuning.ts');
  // Keep the 27th partial clear of Nyquist while inspecting the sparse spectrum.
  const out=[];const rate=48000;
  for(const instrument of ['sine','tritaver']as const)for(const pitch of ['A3','Et4']as const){
   const c=new OfflineAudioContext(1,rate*3,rate),synth=new Synth(c,c.destination);synth.note(instrument,pitch,.03,5,.2);synth.release(1.5);
   const data=(await c.startRendering()).getChannelData(0),hz=pitchFrequency(pitch),start=Math.round(.2*rate),length=rate;
   const amplitude=(f:number)=>{let re=0,im=0;for(let n=0;n<length;n++){const w=.5-.5*Math.cos(2*Math.PI*n/(length-1)),a=2*Math.PI*f*n/rate;re+=data[start+n]*w*Math.cos(a);im+=data[start+n]*w*Math.sin(a);}return Math.hypot(re,im)/length;};
   const fundamental=amplitude(hz);out.push({instrument,pitch,fundamental,partials:Array.from({length:27},(_,i)=>amplitude(hz*(i+1))/fundamental),offPitch:Math.max(amplitude(hz/2),amplitude(hz/3),amplitude(hz*2**(1/31)))/fundamental,tail:Math.max(...data.slice(2*rate).map(Math.abs)),finite:data.every(Number.isFinite)});
  }
  return out;
 });
 await testInfo.attach('northern-voice-spectra',{body:JSON.stringify(spectra,null,2),contentType:'application/json'});
 for(const s of spectra){expect(s.finite).toBe(true);expect(s.fundamental).toBeGreaterThan(.01);expect(s.offPitch).toBeLessThan(.01);expect(s.tail).toBeLessThan(.00001);
  for(let harmonic=2;harmonic<=27;harmonic++){if(s.instrument==='tritaver'&&[3,9,27].includes(harmonic))expect(s.partials[harmonic-1]).toBeGreaterThan(.01);else expect(s.partials[harmonic-1]).toBeLessThan(.001);}
 }
});
