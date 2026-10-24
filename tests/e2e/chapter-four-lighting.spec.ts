import {test,expect} from '@playwright/test';
import {brokenCheckpoint} from '../support/progress';
import {importSave} from './navigation';
import {capture,inspect,nativeActor} from './controls';

for(const [device,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]as const){
 test(`Chapter Four native coastal light follows actors on ${device}`,async({browser})=>{
  const context=await browser.newContext({viewport,deviceScaleFactor:1.25,reducedMotion:'reduce'}),page=await context.newPage();
  try{
   const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');
   for(const [map,x,y]of [['refuge',27,28],['breakwater',37,28],['sanctuary',28,31]]as const){
    const saved=brokenCheckpoint('anchorsKnown');saved.location={map,x,y};await importSave(page,saved);
    await nativeActor(page,(await inspect(page)).actors.find(a=>a.hero==='nell')!.texture,{x,y},.08);
    await capture(page,`four-lit-${map}-${device}`);
    await page.locator('#canvas').focus();await page.keyboard.press('ArrowRight',{delay:60});
    await expect.poll(async()=>{const s=await inspect(page);return !s.moving&&s.state.location.x===x+1;}).toBe(true);
    await expect.poll(async()=>(await inspect(page)).actors.find(a=>a.hero==='nell')?.motion).toBe('idle');
    await nativeActor(page,(await inspect(page)).actors.find(a=>a.hero==='nell')!.texture,{x:x+1,y},.08);
    expect((await inspect(page)).state.flags).toEqual(saved.flags);
   }
   await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
  }finally{await context.close();}
 });
}
