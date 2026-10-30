import {test,expect,type Page} from '@playwright/test';
import {checkpoint} from '../support/progress';
import {importSave,approach} from './navigation';
import {capture,inspect} from './controls';
import {nellLanternLens} from '../../src/content/actor-motion';

async function lanternPixels(page:Page){
 const s=await inspect(page),actor=s.actors.find(a=>a.hero==='nell')!;
 const lens=nellLanternLens(actor.texture,actor.motion==='walk'?Number(actor.frame):undefined);
 return page.evaluate(({actor,lens})=>{
  const view=window.borrowedTomorrow.inspect().view,info=window.borrowedTomorrowPixels.inspect();
  const source=document.querySelector('.pixel-source')!.getBoundingClientRect(),world=document.querySelector('.world-input')!.getBoundingClientRect();
  const x=Math.round((actor.x+lens.x-40)/2)*2,y=Math.round((actor.y+lens.y-68)/2)*2;
  const px=info.physicalLeft+(Math.round((world.left-source.left)/info.cssScale)+x-view.scrollX)*info.physicalScale,py=info.physicalTop+(Math.round((world.top-source.top)/info.cssScale)+y-view.scrollY)*info.physicalScale;
  const canvas=document.querySelector<HTMLCanvasElement>('.pixel-output')!,data=canvas.getContext('2d')!.getImageData(Math.round(px),Math.round(py-2*info.physicalScale),2*info.physicalScale,4*info.physicalScale).data;
  let hash=2166136261;for(const value of data)hash=Math.imul(hash^value,16777619);return hash>>>0;
 },{actor,lens});
}
async function advanceTo(page:Page,text:string){
 for(let i=0;i<20;i++){
  if((await page.locator('.dialogue-copy p').textContent())!.includes(text))return;
  await page.locator('.dialogue-actions button').first().click();
 }
 throw Error(`Missing dialogue: ${text}`);
}
export function openIssueFlows(production=false){
 for(const [device,viewport,deviceScaleFactor]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const){
  test.describe(`${production?'production':'development'} sound and lantern ${device}`,()=>{
   test.use({viewport,deviceScaleFactor});
   test('remembered sound clearly waits for input and the sound button cancels it',async({page})=>{
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{localStorage.setItem('borrowed-tomorrow:sound','on');});await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');
    const ready=page.getByRole('button',{name:'Sound on next input',exact:true});await expect(ready).toHaveAttribute('aria-pressed','true');await expect(ready).toHaveAttribute('aria-description',/next click or key press/);await expect(ready).toBeInViewport();await expect(page.getByRole('button',{name:'Start adventure with sound',exact:true})).toHaveCount(0);await capture(page,`sound-waiting-${production?'production-':''}${device}`);
    await ready.click();await expect(page.getByRole('button',{name:'Sound off',exact:true})).toHaveAttribute('aria-pressed','false');expect(await page.evaluate(()=>localStorage.getItem('borrowed-tomorrow:sound'))).toBe('off');
    await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
   });
   test('starting sound has its own label and cancelling a slow start keeps it off',async({page})=>{
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>localStorage.setItem('borrowed-tomorrow:sound','on'));
    let release!:()=>void,held=false;const gate=new Promise<void>(resolve=>{release=resolve;});
    await page.route(/\/(?:src\/game\/music-runtime\.ts(?:\?.*)?|assets\/music-runtime-[^/]+\.js)$/,async route=>{held=true;await gate;await route.continue();});
    await page.goto('/');await page.getByRole('button',{name:'Begin Chapter One',exact:true}).click();await expect.poll(()=>held).toBe(true);
    await expect(page.getByRole('button',{name:'Starting sound',exact:true})).toBeInViewport();await page.getByRole('button',{name:'Starting sound',exact:true}).click();release();
    await expect(page.getByRole('button',{name:'Sound off',exact:true})).toBeVisible();await page.waitForTimeout(350);await expect(page.getByRole('button',{name:'Sound off',exact:true})).toHaveAttribute('aria-pressed','false');expect(await page.evaluate(()=>localStorage.getItem('borrowed-tomorrow:sound'))).toBe('off');
    await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
   });
   test('the shard glints in the lantern with the cursor parked and stops on the next line or skip',async({page})=>{
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await page.goto('/');await importSave(page,checkpoint('festivalSeen'));await approach(page,'tomas');await advanceTo(page,'A pale fleck catches');await page.mouse.move(1,1);
    const hashes=new Set<number>();for(let i=0;i<14;i++){hashes.add(await lanternPixels(page));await page.waitForTimeout(120);}expect(hashes.size).toBeGreaterThan(1);await capture(page,`lantern-raid-${production?'production-':''}${device}`);
    await page.locator('.dialogue-actions button').first().click();await page.getByRole('button',{name:'Skip scene',exact:true}).click();expect((await inspect(page)).state.flags.raidSeen).toBe(true);
    // Rillbridge also checks the effect following a moving actor before settling.
    await importSave(page,checkpoint('orrinJoined'));await approach(page,'branch');await advanceTo(page,'making my teeth ache');await page.waitForTimeout(600);await page.locator('.dialogue-actions button').first().click();await page.mouse.move(1,1);
    const pulse=new Set<number>();for(let i=0;i<12;i++){pulse.add(await lanternPixels(page));await page.waitForTimeout(120);}expect(pulse.size).toBeGreaterThan(1);
    await page.locator('.dialogue-actions button').first().click();await page.waitForTimeout(150);const settled=new Set<number>();for(let i=0;i<8;i++){settled.add(await lanternPixels(page));await page.waitForTimeout(320);}expect(settled.size).toBe(1);await capture(page,`lantern-settled-${production?'production-':''}${device}`);
    await page.getByRole('button',{name:'Skip scene',exact:true}).click();await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
   });
   test('reduced motion keeps the shard light steady and interrupted scenes replay without saving the effect',async({page})=>{
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await importSave(page,checkpoint('festivalSeen'));await approach(page,'tomas');await advanceTo(page,'A pale fleck catches');await page.mouse.move(1,1);
    const before=await lanternPixels(page);await page.waitForTimeout(500);expect(await lanternPixels(page)).toBe(before);await capture(page,`lantern-reduced-${production?'production-':''}${device}`);expect((await inspect(page)).state.flags.raidSeen).toBeUndefined();
    await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await approach(page,'tomas');await advanceTo(page,'A pale fleck catches');await expect(page.locator('.dialogue-copy p')).toContainText('A pale fleck catches');await page.getByRole('button',{name:'Skip scene',exact:true}).click();expect((await inspect(page)).state.flags.raidSeen).toBe(true);await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
   });
  });
 }
}
