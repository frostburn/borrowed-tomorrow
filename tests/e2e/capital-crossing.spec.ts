import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {coastCheckpoint} from '../support/progress';
import {importSave,approach} from './navigation';
import {capture,inspect} from './controls';
import {receiveItem,equipItem} from '../../src/rules/inventory';
import {sceneAssets} from '../../src/content/scene-art';
import {CHAPTER_THREE_MAPS} from '../../src/content/chapter-three/maps';

for(const [device,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]as const)test(`capital crossing preserves the actual departure and replays on ${device}`,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:1.25,reducedMotion:'reduce'}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  const saved=coastCheckpoint('chapterTwoComplete');saved.coins=57;saved.party[0].hp=16;saved.party[1].focus=1;saved.bandages=2;saved.activeParty=['nell','kit'];saved.flags.raidDiversion=true;
  receiveItem(saved.inventory,'brass-reflector');equipItem(saved.inventory,'nell','brass-reflector');
  await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');await importSave(page,saved);
  await expect.poll(async()=>(await inspect(page)).cinematic).toBe('two-three-crossing');await page.getByRole('button',{name:'Pause',exact:true}).click();
  expect((await inspect(page)).state).toEqual(saved);await expect(page.getByRole('heading',{name:'Chapter Two complete',exact:true})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Equipment',exact:true})).toBeDisabled();
  for(const shot of ['coaches','passengers','northglass']){
   await expect(page.locator('#canvas')).toHaveAttribute('data-crossing-shot',shot);await capture(page,`capital-crossing-${shot}-${device}`);
   if(shot!=='northglass')await page.getByRole('button',{name:'Next shot',exact:true}).click();
  }
  const output=page.waitForEvent('download');await page.getByRole('button',{name:'Export departure save',exact:true}).click();expect(JSON.parse(await readFile((await(await output).path())!,'utf8'))).toEqual(saved);
  await page.getByRole('button',{name:'Return to the siding',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBeNull();await expect(page.getByRole('button',{name:'Equipment',exact:true})).toBeEnabled();
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('two-three-crossing');
  await page.getByRole('button',{name:'Skip cinematic',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('three-capital');
  expect((await inspect(page)).state).toMatchObject({chapter:'chapter-three',boundary:null,inventory:saved.inventory,party:saved.party,activeParty:saved.activeParty,coins:saved.coins,xp:saved.xp,bandages:saved.bandages,flags:{raidDiversion:true}});
  expect((await inspect(page)).state.flags.petraJoined).toBeUndefined();await page.getByRole('button',{name:'Skip scene',exact:true}).click();await expect(page.getByRole('button',{name:'Equipment',exact:true})).toBeEnabled();
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await context.close();}
});

test('the capital film moves passively, pauses and automatically reaches the siding',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/');const saved=coastCheckpoint('chapterTwoComplete');await importSave(page,saved);await page.mouse.move(1,1);
 await expect.poll(async()=>(await inspect(page)).cinematic).toBe('two-three-crossing');await page.waitForTimeout(700);
 const first=await page.locator('.pixel-output').screenshot();await page.waitForTimeout(400);expect(await page.locator('.pixel-output').screenshot()).not.toEqual(first);
 await page.getByRole('button',{name:'Pause',exact:true}).click();await page.mouse.move(1,1);await page.waitForTimeout(100);const paused=await page.locator('.pixel-output').screenshot();await page.waitForTimeout(350);expect(await page.locator('.pixel-output').screenshot()).toEqual(paused);
 await page.getByRole('button',{name:'Play',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic,{timeout:30000}).toBe('three-capital');
 expect((await inspect(page)).state).toMatchObject({chapter:'chapter-three',boundary:null,party:saved.party,inventory:saved.inventory,coins:saved.coins});
});

test('a missing capital asset holds the last shot and the unconsumed departure for retry',async({page})=>{
 const asset=sceneAssets(CHAPTER_THREE_MAPS.conduit.tiles!).find(p=>p.key==='scenery-conduit-vessel')!,url='**/'+asset.url;
 await page.route(url,r=>r.abort());await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');const saved=coastCheckpoint('chapterTwoComplete');await importSave(page,saved);
 await page.getByRole('button',{name:'Skip cinematic',exact:true}).click();await expect(page.getByRole('button',{name:'Retry crossing',exact:true})).toBeEnabled();await expect(page.locator('#canvas')).toHaveAttribute('data-crossing-shot','northglass');
 expect((await inspect(page)).state).toEqual(saved);await expect(page.locator('.crossing-controls')).toContainText('return to the siding');await capture(page,'capital-crossing-failed-load');
 await page.unroute(url);await page.getByRole('button',{name:'Retry crossing',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('three-capital');
});

test('the workshop reviews both chapter crossings and keeps campaign/build storage untouched',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/?dev=cinematics&film=capital-crossing');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop');
 const before=(await inspect(page)).state,storage=await page.evaluate(()=>JSON.stringify(localStorage));
 for(const [index,shot]of ['coaches','passengers','northglass'].entries()){
  await expect(page.getByRole('button',{name:'Chapter Two → Three',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.locator(`[data-ending-select="${index}"]`).click();await page.getByRole('button',{name:'Play selected shot',exact:true}).click();await expect(page.locator('#canvas')).toHaveAttribute('data-crossing-shot',shot);
  expect((await inspect(page)).state).toEqual(before);await capture(page,`capital-crossing-workshop-${shot}`);await page.getByRole('button',{name:'Back to workshop',exact:true}).click();
 }
 await page.getByRole('button',{name:'Chapter One → Two',exact:true}).click();await expect(page.getByRole('button',{name:'Chapter One → Two',exact:true})).toHaveAttribute('aria-pressed','true');await expect(page.locator('.ending-shot-list')).toContainText('Beyond the pass');
 await page.getByRole('button',{name:'Bad ending',exact:true}).click();await expect(page.getByRole('button',{name:'Bad ending',exact:true})).toHaveAttribute('aria-pressed','true');
 expect(await page.evaluate(()=>JSON.stringify(localStorage))).toBe(storage);await expect(page.locator('vite-error-overlay')).toHaveCount(0);
});

test('the earned departure starts the film only after Petra’s refusal has finished',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');const saved=coastCheckpoint('recaptureWon');saved.location={map:'cinderbank',x:49,y:26};await importSave(page,saved);
 await approach(page,'capital-engine');await expect.poll(async()=>(await inspect(page)).cinematic).toBe('two-departure');expect((await inspect(page)).state.boundary).toBeNull();
 await page.getByRole('button',{name:'Skip scene',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('two-three-crossing');const departure=(await inspect(page)).state;
 expect(departure.flags.chapterTwoComplete).toBe(true);expect(departure.boundary).toBe('chapter-three:capital');expect(departure.party.map(p=>p.id)).toEqual(['nell','orrin','kit']);expect(departure.journal).toContain('capitalDeparture');
});
