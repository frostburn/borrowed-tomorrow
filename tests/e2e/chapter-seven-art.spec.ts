import {test,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import {chapterSevenRefugeStart} from '../../src/dev/canonical-saves';
import {arrival} from '../../src/content/maps';
import {importSave} from './navigation';
import {capture,inspect,nativeActor} from './controls';

test('Chapter Seven Maps reviews every native world and battlefield',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto('/?dev=maps&map=hollowsill');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop');
 const host=page.locator('#map-workshop');await expect(host).toHaveAttribute('data-ready','true');
 const snapshot=async(id:string)=>{if(process.env.BT_QA_SCREENSHOTS){const url=await page.locator('#map-preview').evaluate(el=>(el as HTMLCanvasElement).toDataURL());await writeFile(`${process.env.BT_QA_SCREENSHOTS}/${id}-map.png`,Buffer.from(url.split(',')[1],'base64'));}};
 for(const kind of ['World','Battle']){
  await page.locator(`[data-map-kind="${kind}"]`).click();
  const ids=await page.locator('[data-map]').evaluateAll(els=>els.map(e=>e.getAttribute('data-map')!));
  for(const id of ids){await page.locator(`[data-map="${id}"]`).click();await expect(host).toHaveAttribute('data-ready','true');await expect(host.locator('.map-meta')).toContainText('SVG scene');await snapshot(id);}
 }
 await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
});
for(const [device,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]as const)test(`Chapter Seven native actor lighting and movement on ${device}`,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:1.25,reducedMotion:'reduce'}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');
  for(const map of ['hollowsill','takenwater','firstfield','quietward','seasonstreet','lastrefuge','sunthrone']as const){
   const s=chapterSevenRefugeStart();s.flags.lastRefugeSeen=true;s.flags.benefactorSeen=true;s.location=arrival(map,'start');await importSave(page,s);await expect.poll(async()=>(await inspect(page)).cinematic).toBeNull();
   await nativeActor(page,(await inspect(page)).actors.find(a=>a.hero==='nell')!.texture,s.location,.08);await capture(page,`seven-light-${map}-${device}`);
   await page.locator('#canvas').focus();await page.keyboard.press('ArrowRight',{delay:60});await expect.poll(async()=>{const v=await inspect(page);return !v.moving&&v.state.location.x===s.location.x+1;}).toBe(true);
   await expect.poll(async()=>(await inspect(page)).actors.find(a=>a.hero==='nell')?.motion).toBe('idle');
   const now=await inspect(page);await nativeActor(page,now.actors.find(a=>a.hero==='nell')!.texture,now.state.location,.08);expect(now.state.flags).toEqual(s.flags);expect(now.state.inventory).toEqual(s.inventory);
  }
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await context.close();}
});
