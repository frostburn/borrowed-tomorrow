import { test,expect } from '@playwright/test';
const cues=[["hollowsill", "Under the Hanging Sea"], ["takenwater", "The Bell’s Second Note"], ["firstfield", "The First Good Year"], ["quietward", "You May Leave"], ["seasonstreet", "Snow on the Postal Stair"], ["lastrefuge", "The Unwritten Hour"], ["sunthrone", "The Empty Channels"], ["homecoming", "One Train without Us"], ["seaholiday", "Until Evening"], ["domain-battle", "The Road We Know"], ["harvest-battle", "The Uncut Row"], ["hospice-battle", "Discharge the Patient"], ["seasons-battle", "The Winter Kept Here"], ["benefactor", "The God Who Lent Tomorrow"], ["hollow-sun", "The Broken Meridian"], ["unborrowed", "Tomorrow"]]as const;
for(const [device,viewport,dpr]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const)test(`Chapter Seven music controls on ${device}`,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:dpr}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 try{
  await page.goto('/?dev=music');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop',{timeout:30000});await page.getByRole('button',{name:'Ch 7',exact:true}).click();
  for(const [mode,title]of cues){await page.locator(`[data-cue="${mode}"]`).click();await expect(page.getByRole('heading',{name:title,exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Expression',exact:true})).toBeVisible();}
  await page.locator('[data-cue="benefactor"]').click();await expect(page.locator('.music-description').first()).toContainText('4/4');await expect(page.locator('.music-description').first()).toContainText('2-bar intro');
  await page.getByRole('button',{name:'Play',exact:true}).click();await expect(page.locator('#music-position')).toContainText('Playing');await page.getByRole('button',{name:'Stop',exact:true}).click();
  await page.locator('[data-cue="lastrefuge"]').click();await expect(page.getByRole('button',{name:'Rubato',exact:true})).toBeVisible();if(process.env.BT_QA_SCREENSHOTS)await page.screenshot({path:`${process.env.BT_QA_SCREENSHOTS}/seven-music-${device}.png`});await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await context.close();}
});
for(const [mode]of cues)test(`Chapter Seven cue ${mode}: complete form and loop have audible finite audio without sample snaps`,async({page},testInfo)=>{
 test.setTimeout(120000);await page.route('**/offline-seven-review',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>Offline final-chapter review</title>'}));await page.goto('/offline-seven-review');
 const result=await page.evaluate(async mode=>{
  // @ts-expect-error Vite serves the exact live score.
  const {ARRANGEMENTS,scoreLength}:typeof import('../../src/game/score')=await import('/src/game/score.ts');
  // @ts-expect-error Use the real procedural rack.
  const {Synth}:typeof import('../../src/game/synth')=await import('/src/game/synth.ts');
  // @ts-expect-error Preserve authored expression, rubato and cross-bar holds.
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
 await testInfo.attach(`seven-loop-${mode}`,{body:JSON.stringify(result,null,2),contentType:'application/json'});expect(result.peak,JSON.stringify(result)).toBeLessThan(.9);expect(result.rms,JSON.stringify(result)).toBeGreaterThan(.0035);expect(result.jump,JSON.stringify(result)).toBeLessThan(.25);
});
