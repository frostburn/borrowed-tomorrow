import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {palaceCheckpoint} from '../support/progress';
import {importSave,approach} from './navigation';
import {capture,inspect} from './controls';
import {receiveItem,equipItem} from '../../src/rules/inventory';
import {sceneAssets} from '../../src/content/scene-art';
import {CHAPTER_FOUR_MAPS} from '../../src/content/chapter-four/maps';

for(const [device,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]as const)test(`refuge crossing preserves the actual departure and replays on ${device}`,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:1.25,reducedMotion:'reduce'}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  const saved=palaceCheckpoint('chapterThreeComplete');saved.coins=57;saved.party[0].hp=16;saved.party[1].focus=1;saved.bandages=2;saved.activeParty=['nell','kit'];saved.flags.pressureRoute=true;
  receiveItem(saved.inventory,'brass-reflector');equipItem(saved.inventory,'nell','brass-reflector');
  await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');await importSave(page,saved);
  await expect.poll(async()=>(await inspect(page)).cinematic).toBe('three-four-crossing');await page.getByRole('button',{name:'Pause',exact:true}).click();
  expect((await inspect(page)).state).toEqual(saved);await expect(page.getByRole('heading',{name:'Chapter Three complete',exact:true})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Equipment',exact:true})).toBeDisabled();
  for(const shot of ['bridge','together','refuge']){
   await expect(page.locator('#canvas')).toHaveAttribute('data-crossing-shot',shot);await capture(page,`refuge-crossing-${shot}-${device}`);
   if(shot!=='refuge')await page.getByRole('button',{name:'Next shot',exact:true}).click();
  }
  const output=page.waitForEvent('download');await page.getByRole('button',{name:'Export departure save',exact:true}).click();expect(JSON.parse(await readFile((await(await output).path())!,'utf8'))).toEqual(saved);
  await page.getByRole('button',{name:'Return to the platform',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBeNull();await expect(page.getByRole('button',{name:'Equipment',exact:true})).toBeEnabled();
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('three-four-crossing');
  await page.getByRole('button',{name:'Skip cinematic',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('four-home');
  expect((await inspect(page)).state).toMatchObject({chapter:'chapter-four',boundary:null,inventory:saved.inventory,party:saved.party,activeParty:saved.activeParty,coins:saved.coins,xp:saved.xp,bandages:saved.bandages,flags:{pressureRoute:true}});
  expect((await inspect(page)).state.flags.celiaJoined).toBeUndefined();expect((await inspect(page)).state.flags.tomasRescued).toBe(true);await page.getByRole('button',{name:'Skip scene',exact:true}).click();await expect(page.getByRole('button',{name:'Equipment',exact:true})).toBeEnabled();
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await context.close();}
});

test('the refuge film moves passively, pauses and automatically reaches the refuge',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/');const saved=palaceCheckpoint('chapterThreeComplete');await importSave(page,saved);await page.mouse.move(1,1);
 await expect.poll(async()=>(await inspect(page)).cinematic).toBe('three-four-crossing');await page.waitForTimeout(700);
 const first=await page.locator('.pixel-output').screenshot();await page.waitForTimeout(400);expect(await page.locator('.pixel-output').screenshot()).not.toEqual(first);
 await page.getByRole('button',{name:'Pause',exact:true}).click();await page.mouse.move(1,1);await page.waitForTimeout(100);const paused=await page.locator('.pixel-output').screenshot();await page.waitForTimeout(350);expect(await page.locator('.pixel-output').screenshot()).toEqual(paused);
 await page.getByRole('button',{name:'Play',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic,{timeout:30000}).toBe('four-home');
 expect((await inspect(page)).state).toMatchObject({chapter:'chapter-four',boundary:null,party:saved.party,inventory:saved.inventory,coins:saved.coins});
});

test('a missing refuge asset holds the last shot and the unconsumed departure for retry',async({page})=>{
 const asset=sceneAssets(CHAPTER_FOUR_MAPS.sanctuary.tiles!).find(p=>p.url.endsWith('/sanctuary-ring.svg'))!,url='**/'+asset.url;
 await page.route(url,r=>r.abort());await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');const saved=palaceCheckpoint('chapterThreeComplete');await importSave(page,saved);
 await page.getByRole('button',{name:'Skip cinematic',exact:true}).click();await expect(page.getByRole('button',{name:'Retry crossing',exact:true})).toBeEnabled();await expect(page.locator('#canvas')).toHaveAttribute('data-crossing-shot','refuge');
 expect((await inspect(page)).state).toEqual(saved);await expect(page.locator('.crossing-controls')).toContainText('return to the platform');await capture(page,'refuge-crossing-failed-load');
 await page.unroute(url);await page.getByRole('button',{name:'Retry crossing',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('four-home');
});

test('the workshop reviews the refuge crossing and keeps campaign/build storage untouched',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/?dev=cinematics&film=refuge-crossing');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop');
 const before=(await inspect(page)).state,storage=await page.evaluate(()=>JSON.stringify(localStorage));
 for(const [index,shot]of ['bridge','together','refuge'].entries()){
  await expect(page.getByRole('button',{name:'Chapter Three → Four',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.locator(`[data-ending-select="${index}"]`).click();await page.getByRole('button',{name:'Play selected shot',exact:true}).click();await expect(page.locator('#canvas')).toHaveAttribute('data-crossing-shot',shot);
  expect((await inspect(page)).state).toEqual(before);await capture(page,`refuge-crossing-workshop-${shot}`);await page.getByRole('button',{name:'Back to workshop',exact:true}).click();
 }
 await page.getByRole('button',{name:'Chapter One → Two',exact:true}).click();await expect(page.getByRole('button',{name:'Chapter One → Two',exact:true})).toHaveAttribute('aria-pressed','true');await expect(page.locator('.ending-shot-list')).toContainText('Beyond the pass');
 await page.getByRole('button',{name:'Bad ending',exact:true}).click();await expect(page.getByRole('button',{name:'Bad ending',exact:true})).toHaveAttribute('aria-pressed','true');
 expect(await page.evaluate(()=>JSON.stringify(localStorage))).toBe(storage);await expect(page.locator('vite-error-overlay')).toHaveCount(0);
});

test('the earned departure starts the film after the rescued passengers board',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');const saved=palaceCheckpoint('emperorMerged');saved.location={map:'northglass',x:32,y:33};await importSave(page,saved);
 await approach(page,'capital-departure');await expect.poll(async()=>(await inspect(page)).cinematic).toBe('three-departure');expect((await inspect(page)).state.boundary).toBeNull();
 await page.getByRole('button',{name:'Skip scene',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('three-four-crossing');const departure=(await inspect(page)).state;
 expect(departure.flags.chapterThreeComplete).toBe(true);expect(departure.boundary).toBe('chapter-four:broken-world');expect(departure.party.map(p=>p.id)).toEqual(['nell','orrin','kit','petra']);expect(departure.journal).toContain('brokenDeparture');
});

test('the calm refuge water and fishing boat remain still while the train advances',async({page})=>{
 await page.goto('/');const same=await page.evaluate(async()=>{
  // @ts-expect-error Inspect the real vector painter at two unpaused film times.
  const {paintChapterCrossing}:typeof import('../../src/game/crossing-art')=await import('/src/game/crossing-art.ts');
  const frames=[12000,15000].map(time=>{
   const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=576;const c=canvas.getContext('2d')!;paintChapterCrossing(c,time,false,'refuge');
   return {water:c.getImageData(648,238,244,180).data,train:c.getImageData(400,430,300,100).data};
  });
  return {water:frames[0].water.every((v,i)=>v===frames[1].water[i]),train:frames[0].train.every((v,i)=>v===frames[1].train[i])};
 });expect(same.water).toBe(true);expect(same.train).toBe(false);
});
