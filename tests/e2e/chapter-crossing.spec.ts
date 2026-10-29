import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {checkpoint} from '../support/progress';
import {importSave,approach} from './navigation';
import {capture,inspect} from './controls';
import {receiveItem,equipItem} from '../../src/rules/inventory';
import {sceneAssets} from '../../src/content/scene-art';
import {CHAPTER_TWO_MAPS} from '../../src/content/chapter-two/maps';

for(const [device,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]as const)test(`crossing preserves the departure, exports and can be replayed on ${device}`,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:1.25,reducedMotion:'reduce'}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  const saved=checkpoint('chapterOneComplete');saved.coins=47;saved.party[0].hp=17;saved.bandages=2;receiveItem(saved.inventory,'brass-reflector');equipItem(saved.inventory,'nell','brass-reflector');
  await page.goto('/');await importSave(page,saved);await expect.poll(async()=>(await inspect(page)).cinematic).toBe('one-two-crossing');
  await page.getByRole('button',{name:'Pause',exact:true}).click();
  expect((await inspect(page)).state).toEqual(saved);await expect(page.getByRole('heading',{name:'Chapter One complete',exact:true})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Equipment',exact:true})).toBeDisabled();
  await page.locator('#canvas').focus();await page.keyboard.press('ArrowRight');expect((await inspect(page)).state.location).toEqual(saved.location);
  for(const shot of ['pass','viaduct','exchange']){
   await expect(page.locator('#canvas')).toHaveAttribute('data-crossing-shot',shot);await capture(page,`crossing-${shot}-${device}`);
   if(shot!=='exchange')await page.getByRole('button',{name:'Next shot',exact:true}).click();
  }
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'Export departure save',exact:true}).click();
  expect(JSON.parse(await readFile((await(await download).path())!,'utf8'))).toEqual(saved);
  await page.getByRole('button',{name:'Return to the pass',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBeNull();
  await expect(page.getByRole('button',{name:'Equipment',exact:true})).toBeEnabled();
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('one-two-crossing');
  const restored=(await inspect(page)).state;expect(restored).toEqual({...saved,playSeconds:restored.playSeconds});
  await page.getByRole('button',{name:'Skip cinematic',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('two-coast');
  expect((await inspect(page)).state).toMatchObject({chapter:'chapter-two',boundary:null,inventory:saved.inventory,party:saved.party,coins:saved.coins,xp:saved.xp,bandages:saved.bandages});
  await page.getByRole('button',{name:'Skip scene',exact:true}).click();await expect(page.getByRole('button',{name:'Equipment',exact:true})).toBeEnabled();expect(errors).toEqual([]);
 }finally{await context.close();}
});

test('the engine moves with the pointer parked and the crossing hands off automatically',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'no-preference'});
 const saved=checkpoint('chapterOneComplete');await page.goto('/');await importSave(page,saved);await page.mouse.move(1,1);
 await expect.poll(async()=>(await inspect(page)).cinematic).toBe('one-two-crossing');
 // Compare the visible native stage during the same shot, after its 300ms fade.
 await page.waitForTimeout(700);const first=await page.locator('.pixel-output').screenshot();await page.waitForTimeout(400);
 expect(await page.locator('.pixel-output').screenshot()).not.toEqual(first);await capture(page,'crossing-pass-playing');
 await expect.poll(async()=>(await inspect(page)).cinematic,{timeout:30000}).toBe('two-coast');
 expect((await inspect(page)).state).toMatchObject({chapter:'chapter-two',boundary:null,inventory:saved.inventory,party:saved.party,coins:saved.coins});
 expect(errors).toEqual([]);
});

test('a failed coast SVG leaves a visible final shot and a retryable departure',async({page})=>{
 const art=sceneAssets(CHAPTER_TWO_MAPS.coast.tiles!).find(p=>p.url.endsWith('/coast-crane.svg'))!,url='**/'+art.url;
 await page.route(url,r=>r.abort());await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');const saved=checkpoint('chapterOneComplete');await importSave(page,saved);
 await page.getByRole('button',{name:'Skip cinematic',exact:true}).click();await expect(page.getByRole('button',{name:'Retry crossing',exact:true})).toBeEnabled();
 expect((await inspect(page)).state).toEqual(saved);await capture(page,'crossing-failed-arrival');
 await page.unroute(url);await page.getByRole('button',{name:'Retry crossing',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('two-coast');
});

test('workshop reviews every crossing shot without changing the campaign or builds',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/?dev=cinematics&film=crossing');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop');
 await expect(page.getByRole('button',{name:'Chapter One → Two',exact:true})).toHaveAttribute('aria-pressed','true');const before=(await inspect(page)).state;
 for(const [index,shot]of ['pass','viaduct','exchange'].entries()){
  await page.locator(`[data-ending-select="${index}"]`).click();await page.getByRole('button',{name:'Play selected shot',exact:true}).click();
  await expect(page.locator('#canvas')).toHaveAttribute('data-crossing-shot',shot);await capture(page,`crossing-workshop-${shot}`);
  expect((await inspect(page)).state).toEqual(before);await page.getByRole('button',{name:'Back to workshop',exact:true}).click();
  await expect(page.getByRole('button',{name:'Chapter One → Two',exact:true})).toHaveAttribute('aria-pressed','true');
 }
 await expect(page.locator('vite-error-overlay')).toHaveCount(0);
});

test('boarding after Alban starts the crossing through the real departure scene',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');const saved=checkpoint('captainDefeated');saved.location={map:'tunnel',x:35,y:14};await importSave(page,saved);
 await approach(page,'departure');await expect.poll(async()=>(await inspect(page)).cinematic).toBe('one-departure');
 await page.getByRole('button',{name:'Skip scene',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('one-two-crossing');
 await expect(page.getByRole('button',{name:'Pause',exact:true})).toBeVisible();const departed=(await inspect(page)).state;
 expect(departed.flags.chapterOneComplete).toBe(true);expect(departed.boundary).toBe('chapter-two:iron-coast');expect(departed.journal).toContain('departure');expect(departed.inventory).toEqual(saved.inventory);
 await page.getByRole('button',{name:'Skip cinematic',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('two-coast');
});
