import {expect,test} from '@playwright/test';
import {chapterSixFinaleStart} from '../../src/dev/canonical-saves';
import {arrival} from '../../src/content/maps';
import {importSave} from './navigation';
import {capture,dialogue,inspect} from './controls';

for(const [device,viewport,dpr]of [['desktop',{width:1280,height:800},1],['phone',{width:844,height:390},1.25]]as const)test(`the Hollow Sun opens above the capital, then restores the quay camera on ${device}`,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:dpr,reducedMotion:device==='phone'?'reduce':'no-preference'}),page=await context.newPage(),errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 try{
  await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');const s=chapterSixFinaleStart(true);
  Object.assign(s.flags,{capitalAssaultCommitted:true,capitalWarningSeen:true,emperorSeen:true,emperorWon:true,emperorFallen:true,capitalReleased:true});s.location=arrival('capitalquay','start');
  for(const finish of ['complete','skip']){
   await importSave(page,s);await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-capital-landing');
   await expect(page.locator('.dialogue p')).toContainText('dark strip of sky');const sky=(await inspect(page)).view;expect(sky.zoom).toBe(1);expect(sky.scrollY).toBeLessThan(0);
   if(device==='desktop')await page.waitForTimeout(1500);await capture(page,`capital-horizon-${device}-${finish}`);
   expect((await inspect(page)).state.flags.capitalLandingSeen).toBeUndefined();
   if(finish==='skip')await page.getByRole('button',{name:'Skip scene',exact:true}).click();
   else{
    await page.locator('.dialogue-actions button').click();await expect(page.locator('.dialogue h2')).toHaveText('Alda');expect((await inspect(page)).view.scrollY).toBeGreaterThan(0);
    if(device==='phone'){await page.setViewportSize({width:812,height:375});await page.waitForTimeout(100);expect((await inspect(page)).view.scrollY).toBeGreaterThan(0);}
    await capture(page,`capital-horizon-quay-${device}`);await dialogue(page);
   }
   const after=await inspect(page);expect(after.cinematic).toBeNull();expect(after.state.flags.capitalLandingSeen).toBe(true);expect(after.view.zoom).toBe(1);expect(after.view.scrollY).toBeGreaterThanOrEqual(0);
   for(const k of ['party','activeParty','inventory','coins','bandages','location']as const)expect(after.state[k]).toEqual(s[k]);
  }
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).mode).toBe('world');expect((await inspect(page)).cinematic).toBeNull();expect((await inspect(page)).view.scrollY).toBeGreaterThanOrEqual(0);
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await context.close();}
});
