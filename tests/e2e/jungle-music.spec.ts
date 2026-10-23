import { test,expect } from '@playwright/test';
for(const [device,viewport,dpr]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const)test(`Iria Music review and the new percussion rack on ${device}`,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:dpr}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('/?dev=music');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop',{timeout:20000});await page.getByRole('button',{name:'Ch 6',exact:true}).click();
  for(const [mode,title]of [['riverhaven','Iria · The Next Launch'],['canopy','Under the Green Signal'],['rainhouse','The Waiting Basin'],['rainhouse-rest','A Seat by the River'],['river-battle','Iria · Open the Waterway'],['rain-warden','Wings on the Landing']]as const){
   await page.locator(`[data-cue="${mode}"]`).click();await expect(page.getByRole('heading',{name:title,exact:true})).toBeVisible();await expect(page.locator('.music-description').first()).toContainText('32 bars');
  }
  await page.locator('[data-cue="riverhaven"]').click();
  for(const part of ['Hand drum','Shaker','Wood','Drums']){await page.getByRole('button',{name:part,exact:true}).click();await page.getByRole('button',{name:'Play',exact:true}).click();await expect(page.locator('#music-position')).toContainText('Playing');await page.getByRole('button',{name:'Stop',exact:true}).click();}
  await page.getByRole('button',{name:'All',exact:true}).click();await page.locator('[data-cue="canopy"]').click();await expect(page.locator('#music-notes')).toContainText('Cd5');await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
  if(process.env.BT_QA_SCREENSHOTS)await page.screenshot({path:`${process.env.BT_QA_SCREENSHOTS}/iria-music-${device}.png`});
 }finally{await context.close();}
});
// Full forms deliberately stay outside the small default CI browser set.
for(const mode of ['riverhaven','canopy','rainhouse','rainhouse-rest','river-battle','rain-warden']as const)test(`jungle cue ${mode}: full loop, percussion stem and clean sample transitions`,async({page},testInfo)=>{
 test.setTimeout(120000);await page.goto('/');
 const result=await page.evaluate(async mode=>{
  // @ts-expect-error Vite exposes the campaign score for offline review.
  const {ARRANGEMENTS,scoreLength}:typeof import('../../src/game/score')=await import('/src/game/score.ts');
  // @ts-expect-error Use the production rack.
  const {Synth}:typeof import('../../src/game/synth')=await import('/src/game/synth.ts');
  // @ts-expect-error Live and offline scheduling share expression and timing.
  const {performanceBar}:typeof import('../../src/game/score-performance')=await import('/src/game/score-performance.ts');
  const rate=22050,a=ARRANGEMENTS[mode],barSeconds=4*60/a.bpm,bars=scoreLength(mode)+2,end=bars*barSeconds;
  const c=new OfflineAudioContext(4,Math.ceil((end+2)*rate),rate),merge=c.createChannelMerger(4),mix=c.createGain(),drums=c.createGain();
  mix.gain.value=.52;drums.gain.value=.52;mix.connect(merge,0,0);drums.connect(merge,0,2);merge.connect(c.destination);
  const synth=new Synth(c,mix),stem=new Synth(c,drums);
  for(let bar=-1;bar<bars-1;bar++)for(const n of performanceBar(mode,bar).notes){
   const when=.03+(bar+1)*barSeconds+n.time;synth.note(n.instrument,n.pitch,when,n.seconds,n.velocity,n.pan,n.expression);
   if(n.instrument==='hand-drum'||n.instrument==='shaker')stem.note(n.instrument,n.pitch,when,n.seconds,n.velocity,n.pan,n.expression);
  }
  const audio=await c.startRendering();let peak=0,sum=0,jump=0,drumSum=0,count=0;
  const all=audio.getChannelData(0),percussion=audio.getChannelData(2);
  for(let i=Math.ceil((.03+barSeconds)*rate);i<Math.floor(end*rate);i++){const v=all[i];if(!Number.isFinite(v)||!Number.isFinite(percussion[i]))throw new Error('Non-finite audio');peak=Math.max(peak,Math.abs(v));sum+=v*v;drumSum+=percussion[i]**2;jump=Math.max(jump,Math.abs(v-all[i-1]));count++;}
  return {mode,peak,rms:Math.sqrt(sum/count),drumRms:Math.sqrt(drumSum/count),drumShare:Math.sqrt(drumSum/sum),jump};
 },mode);
 await testInfo.attach(`jungle-loop-${mode}`,{body:JSON.stringify(result,null,2),contentType:'application/json'});
 expect(result.peak,JSON.stringify(result)).toBeLessThan(.9);expect(result.rms,JSON.stringify(result)).toBeGreaterThan(.005);expect(result.drumRms,JSON.stringify(result)).toBeGreaterThan(.002);expect(result.drumShare,JSON.stringify(result)).toBeGreaterThan(.15);expect(result.jump,JSON.stringify(result)).toBeLessThan(.25);
});
