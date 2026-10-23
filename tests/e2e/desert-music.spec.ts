import { test,expect } from '@playwright/test';
for(const [device,viewport,dpr]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const)test(`Namar Music review, neutral spelling, lute and transport on ${device}`,async({browser})=>{
 test.setTimeout(45000);
 const context=await browser.newContext({viewport,deviceScaleFactor:dpr}),page=await context.newPage(),errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('/?dev=music');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop');await page.getByRole('button',{name:'Ch 6',exact:true}).click();
  for(const [mode,title,meter,bars]of [['namar','Namar · Letters on the Water','4/4',32],['sunpalace','The Queen’s Half of the Pact','3/4',32],['sun-serpent','Coils around the Sun','6/8',34]]as const){
   await page.locator(`[data-cue="${mode}"]`).click();await expect(page.getByRole('heading',{name:title,exact:true})).toBeVisible();await expect(page.locator('.music-description').first()).toContainText(meter);await expect(page.locator('.music-description').first()).toContainText(`${bars} bars`);
  }
  await page.locator('[data-cue="namar"]').click();await page.getByRole('button',{name:'Lute',exact:true}).click();await page.getByRole('button',{name:'Play',exact:true}).click();await expect(page.getByRole('button',{name:'Stop',exact:true})).toBeVisible();await page.getByRole('button',{name:'Stop',exact:true}).click();
  await page.locator('[data-cue="sunpalace"]').click();await expect(page.getByText('Rubato',{exact:true})).toBeVisible();await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
  if(process.env.BT_QA_SCREENSHOTS)await page.screenshot({path:`${process.env.BT_QA_SCREENSHOTS}/six-music-${device}.png`});
 }finally{await context.close();}
});
for(const mode of ['outermooring','namar','sunpalace','skywalk','observatory','desert-battle','sun-serpent']as const)test(`desert cue ${mode}: full form and loop seam render without clipping or sample snaps`,async({page},testInfo)=>{
 test.setTimeout(120000);await page.goto('/');
 const result=await page.evaluate(async mode=>{
  // @ts-expect-error Vite exposes the actual score for offline review.
  const {ARRANGEMENTS,scoreLength}:typeof import('../../src/game/score')=await import('/src/game/score.ts');
  // @ts-expect-error Use the production synth rather than a test rack.
  const {Synth}:typeof import('../../src/game/synth')=await import('/src/game/synth.ts');
  // @ts-expect-error Live and offline playback share this clock and expression.
  const {scoreTime,performanceBar}:typeof import('../../src/game/score-performance')=await import('/src/game/score-performance.ts');
  const rate=22050,a=ARRANGEMENTS[mode],bars=scoreLength(mode)+2,base=scoreTime(mode,-a.beats),end=scoreTime(mode,(bars-1)*a.beats)-base;
  const c=new OfflineAudioContext(2,Math.ceil((end+2)*rate),rate),gain=c.createGain();gain.gain.value=.52;gain.connect(c.destination);const synth=new Synth(c,gain);
  for(let bar=-1;bar<bars-1;bar++)for(const n of performanceBar(mode,bar).notes)synth.note(n.instrument,n.pitch,.03+scoreTime(mode,bar*a.beats)-base+n.time,n.seconds,n.velocity,n.pan,n.expression);
  const audio=await c.startRendering();let peak=0,sum=0,jump=0,count=0;
  for(let channel=0;channel<2;channel++){const data=audio.getChannelData(channel);for(let i=Math.ceil((.03-base)*rate);i<Math.floor(end*rate);i++){const v=data[i];if(!Number.isFinite(v))throw new Error('Non-finite audio');peak=Math.max(peak,Math.abs(v));sum+=v*v;jump=Math.max(jump,Math.abs(v-data[i-1]));count++;}}
  return {mode,peak,rms:Math.sqrt(sum/count),jump};
 },mode);
 await testInfo.attach(`desert-loop-${mode}`,{body:JSON.stringify(result,null,2),contentType:'application/json'});
 expect(result.peak,JSON.stringify(result)).toBeLessThan(.9);expect(result.rms,JSON.stringify(result)).toBeGreaterThan(.005);expect(result.jump,JSON.stringify(result)).toBeLessThan(.25);
});
