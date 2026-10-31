import {test,expect} from '@playwright/test';
import {chapterFiveFinaleStart} from '../../src/dev/canonical-saves';
import {anchorCheckpoint} from '../support/anchors';
import {arrival} from '../../src/content/maps';
import {importSave} from './navigation';
import {capture,inspect,nativeActor} from './controls';

for(const [device,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]as const){
 test(`Chapter Five native regional lighting follows the party on ${device}`,async({browser})=>{
  const context=await browser.newContext({viewport,deviceScaleFactor:1.25,reducedMotion:'reduce'}),page=await context.newPage();
  try{
   const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');
   for(const map of ['airfield','airship','hammerplain','coolingworks','anchorforge','dawnwatch','watchbarracks','signalwall','observation','windmere','dispensary','mirrorward']as const){
    const s=chapterFiveFinaleStart();s.location=arrival(map,'start');await importSave(page,s);
    await expect.poll(async()=>(await inspect(page)).cinematic).toBeNull();
    await nativeActor(page,(await inspect(page)).actors.find(a=>a.hero==='nell')!.texture,s.location,.08);
    await capture(page,`five-light-${map}-${device}`);
    await page.locator('#canvas').focus();await page.keyboard.press('ArrowRight',{delay:60});
    await expect.poll(async()=>{const v=await inspect(page);return !v.moving&&v.state.location.x===s.location.x+1;}).toBe(true);
    await expect.poll(async()=>(await inspect(page)).actors.find(a=>a.hero==='nell')?.motion).toBe('idle');
    const now=await inspect(page);await nativeActor(page,now.actors.find(a=>a.hero==='nell')!.texture,now.state.location,.08);
    expect(now.state.flags).toEqual(s.flags);expect(now.state.inventory).toEqual(s.inventory);
   }
   await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
  }finally{await context.close();}
 });
 test(`Hammerplain keeps its restored window lighting while walking on ${device}`,async({browser})=>{
  const context=await browser.newContext({viewport,deviceScaleFactor:1.25,reducedMotion:'reduce'}),page=await context.newPage();
  try{
   const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');
   for(const flag of ['hammerplainSeen','hammerplainComplete']as const){
    const s=anchorCheckpoint(flag);s.location={map:'hammerplain',x:13,y:29};await importSave(page,s);
    await expect.poll(async()=>(await inspect(page)).cinematic).toBeNull();
    await nativeActor(page,(await inspect(page)).actors.find(a=>a.hero==='nell')!.texture,s.location,.08);
    for(const key of ['ArrowRight','ArrowLeft']){
     await page.locator('#canvas').focus();await page.keyboard.press(key,{delay:60});await expect.poll(async()=>!(await inspect(page)).moving).toBe(true);
     const now=await inspect(page);await nativeActor(page,now.actors.find(a=>a.hero==='nell')!.texture,now.state.location,.08);
    }
    const now=await inspect(page);expect(now.state.location).toEqual(s.location);expect(now.state.flags).toEqual(s.flags);expect(now.state.inventory).toEqual(s.inventory);
    await capture(page,`hammerplain-west-${flag}-${device}`);
   }
   await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
  }finally{await context.close();}
 });
}
