import {test,expect,type Page} from '@playwright/test';
import {palaceCheckpoint} from '../support/progress';
import {importSave} from './navigation';
import {capture,inspect} from './controls';

async function begin(page:Page){
 await page.goto('/');const saved=palaceCheckpoint('conduitGuardWon');saved.location={map:'conduit',x:50,y:20};await importSave(page,saved);
 await expect.poll(async()=>(await inspect(page)).cinematic).toBe('three-rupture');return saved;
}
async function line(page:Page,text:string){
 for(let i=0;i<14;i++){
  if((await page.locator('.dialogue p').textContent())?.includes(text))return;
  await page.locator('.dialogue-actions button').click();
 }
 throw new Error(`Missing cutscene line: ${text}`);
}
async function movingPixels(page:Page,ms=700){
 return page.evaluate(ms=>new Promise<number[]>(resolve=>{
  const hashes=new Set<number>(),start=performance.now();let sampled=-100;
  const tick=()=>{
   const now=performance.now();if(now-sampled>90){sampled=now;const c=document.querySelector<HTMLCanvasElement>('.pixel-output')!,p=c.getContext('2d')!.getImageData(0,0,c.width,c.height).data;let hash=2166136261;for(let i=0;i<p.length;i+=16)hash=Math.imul(hash^p[i],16777619);hashes.add(hash>>>0);}
   if(now-start>=ms)resolve([...hashes]);else requestAnimationFrame(tick);
  };tick();
 }),ms);
}
for(const [device,viewport,dpr] of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]] as const){
 test(`Emperor enters the vessel and the party flees with live animation on ${device}`,async({browser})=>{
  const context=await browser.newContext({viewport,deviceScaleFactor:dpr,reducedMotion:'no-preference'}),page=await context.newPage();
  try{
   const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));const saved=await begin(page);
   await line(page,'steps onto the vessel');
   const poses=await page.evaluate(()=>new Promise<string[]>(resolve=>{
    const seen=new Set<string>(),start=performance.now();const tick=()=>{const e=window.borrowedTomorrow.inspect().actors.find(a=>a.hero==='emperor');if(e)seen.add(e.texture);if(performance.now()-start>2100)resolve([...seen]);else requestAnimationFrame(tick);};tick();
   }));
   expect(poses).toContain('emperor-left-step-0');expect(poses).toContain('emperor-left-step-1');
   expect((await inspect(page)).actors.find(a=>a.hero==='emperor')!.x).toBe(876);await capture(page,`emperor-approach-${device}`);
   await line(page,'Pale light runs up');await page.mouse.move(0,0);
   expect((await inspect(page)).actors.some(a=>a.hero==='emperor'&&a.texture==='emperor-reach')).toBe(true);
   await page.waitForTimeout(800);await capture(page,`emperor-entry-${device}`);
   await expect.poll(async()=>(await inspect(page)).actors.some(a=>a.hero==='emperor')).toBe(false);
   await line(page,'restraints pull taut');await page.mouse.move(0,0);await page.waitForTimeout(1700);
   // Camera shake and its initial tween have ended: parked-cursor pixels must
   // still advance as the dust rises and the vessel's restraints vibrate.
   expect((await movingPixels(page)).length).toBeGreaterThan(2);await capture(page,`emperor-rupture-${device}`);
   expect((await inspect(page)).state.flags.emperorMerged).toBeUndefined();
   await line(page,'The stairs!');await page.waitForTimeout(1900);await capture(page,`emperor-retreat-${device}`);
   expect((await inspect(page)).actors.find(a=>a.hero==='nell')).toMatchObject({x:612,y:787});
   await line(page,'leaving together');await page.waitForTimeout(1300);await capture(page,`emperor-stairs-${device}`);
   expect((await inspect(page)).actors.find(a=>a.hero==='nell')).toMatchObject({x:612,y:859});
   await page.locator('.dialogue-actions button').click();await expect.poll(async()=>(await inspect(page)).state.location.map).toBe('northglass');
   const after=(await inspect(page)).state;expect(after.flags).toMatchObject({tomasRescued:true,extractionStopped:true,emperorMerged:true});expect(after.inventory).toEqual(saved.inventory);expect(after.activeParty).toEqual(saved.activeParty);
   await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).state.flags.emperorMerged).toBe(true);expect(errors).toEqual([]);
  }finally{await context.close();}
 });
}
test('skip during absorption cleans effects, while reduced motion settles every shot',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'no-preference'});await begin(page);await line(page,'Pale light runs up');
 await page.getByRole('button',{name:'Skip scene',exact:true}).click();await expect.poll(async()=>(await inspect(page)).state.location.map).toBe('northglass');
 await page.waitForTimeout(2700);expect((await inspect(page)).cinematic).toBeNull();expect((await inspect(page)).state.flags.tomasRescued).toBe(true);
 await page.emulateMedia({reducedMotion:'reduce'});await begin(page);await line(page,'Pale light runs up');expect((await inspect(page)).actors.some(a=>a.hero==='emperor')).toBe(false);
 await line(page,'restraints pull taut');await page.mouse.move(0,0);expect((await movingPixels(page)).length).toBe(1);
 await page.getByRole('button',{name:'Skip scene',exact:true}).click();expect((await inspect(page)).state.flags.emperorMerged).toBe(true);expect(errors).toEqual([]);
});
test('missing Emperor poses preserve a chapter departure and retry normally',async({page})=>{
 const {coastCheckpoint}=await import('../support/progress');const saved=coastCheckpoint('chapterTwoComplete');
 await page.route('**/art/vector/emperor-reach.svg',r=>r.abort());await page.goto('/');await importSave(page,saved);
 await page.getByRole('button',{name:'Begin Chapter Three',exact:true}).click();await expect(page.getByRole('status')).toContainText('checkpoint is intact');expect((await inspect(page)).state.boundary).toBe('chapter-three:capital');
 await page.unroute('**/art/vector/emperor-reach.svg');await page.getByRole('button',{name:'Begin Chapter Three',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('three-capital');
});
test('reload during absorption replays the checkpoint; fast advance and skip during retreat settle safely',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'no-preference'});
 const saved=await begin(page);await line(page,'Pale light runs up');await page.waitForTimeout(500);await page.reload();
 await page.getByRole('button',{name:'Continue',exact:true}).click();
 await expect.poll(async()=>(await inspect(page)).state.location.map).toBe('conduit');
 expect((await inspect(page)).state.flags.emperorMerged).toBeUndefined();expect((await inspect(page)).state.flags.tomasRescued).toBe(true);
 await line(page,'The stairs!');
 await page.getByRole('button',{name:'Skip scene',exact:true}).click();await expect.poll(async()=>(await inspect(page)).state.location.map).toBe('northglass');
 await page.waitForTimeout(2700);const after=await inspect(page);
 expect(after.cinematic).toBeNull();expect(after.state.flags).toMatchObject({extractionStopped:true,emperorMerged:true,tomasRescued:true});expect(after.state.inventory).toEqual(saved.inventory);expect(errors).toEqual([]);
});
