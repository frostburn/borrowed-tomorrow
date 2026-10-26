import {test,expect,type Page} from '@playwright/test';
import {capture,inspect} from './controls';
import {approach,importSave} from './navigation';
import {checkpoint} from '../support/progress';
const bitmap=(page:Page,selector:string)=>page.locator(selector).evaluate(c=>{let hash=0;for(const ch of(c as HTMLCanvasElement).toDataURL())hash=(Math.imul(hash,31)+ch.charCodeAt(0))|0;return hash;});

test.setTimeout(45000);
for(const [device,viewport,dpr]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const)test(`first screen trees and Tomas expressions on ${device}`,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:dpr}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 try{
  await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');await expect(page.getByRole('button',{name:'Begin Chapter One',exact:true})).toBeVisible();
  await expect.poll(async()=>(await inspect(page)).ambient?.foliage).toBe(4);
  if(device==='phone'){
   // The title's centered phone crop contains no trees. Walk-up restoration
   // reviews the actual left-edge canopy without moving the map's trees.
   await page.getByRole('button',{name:'Begin Chapter One',exact:true}).click();await page.getByRole('button',{name:'Skip scene',exact:true}).click();const state=checkpoint('festivalSeen');state.location={map:'station',x:8,y:11};await importSave(page,state);
  }
  const title=await bitmap(page,'.phaser-host canvas'),output=await bitmap(page,'.pixel-output');await expect.poll(()=>bitmap(page,'.phaser-host canvas'),{timeout:8000}).not.toBe(title);await expect.poll(()=>bitmap(page,'.pixel-output'),{timeout:8000}).not.toBe(output);
  await capture(page,`first-screen-breeze-${device}`);
  await page.emulateMedia({reducedMotion:'reduce'});await expect.poll(async()=>(await inspect(page)).ambient?.frame).toBe(-1);
  const still=await bitmap(page,'.phaser-host canvas');await page.waitForTimeout(300);expect(await bitmap(page,'.phaser-host canvas')).toBe(still);
  if(device==='desktop'){await page.getByRole('button',{name:'Begin Chapter One',exact:true}).click();await page.getByRole('button',{name:'Skip scene',exact:true}).click();}await approach(page,'tomas');
  const image=page.locator('.dialogue-portrait img'),next=()=>page.locator('.dialogue-actions button').first().click();
  await expect(image).toHaveAttribute('src',/portrait-tomas-happy\.svg$/);await expect.poll(()=>image.evaluate(i=>(i as HTMLImageElement).naturalWidth)).toBe(128);await capture(page,`tomas-happy-${device}`);
  await next();await next();await expect(image).toHaveAttribute('src',/portrait-tomas-worried\.svg$/);await capture(page,`tomas-worried-${device}`);
  for(let i=0;i<4;i++)await next();await expect(image).toHaveAttribute('src',/portrait-tomas-angry\.svg$/);await capture(page,`tomas-protective-${device}`);
  await page.getByRole('button',{name:'Skip scene',exact:true}).click();expect((await inspect(page)).state.flags.raidSeen).toBe(true);await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await context.close();}
});

test('Tomas expressions are available in the NPC workshop',async({page})=>{
 await page.goto('/?dev=sprites');await page.getByRole('button',{name:/^NPCs \(/}).click();await page.getByRole('button',{name:'Inspect Tomas',exact:true}).click();
 const panel=page.getByRole('region',{name:'Portrait expressions',exact:true});await panel.getByRole('button',{name:'Sad',exact:true}).click();await expect(panel.locator('img')).toHaveAttribute('src',/portrait-tomas-sad\.svg$/);await expect.poll(()=>panel.locator('img').evaluate(i=>(i as HTMLImageElement).naturalWidth)).toBe(128);await capture(page,'tomas-workshop');
});
