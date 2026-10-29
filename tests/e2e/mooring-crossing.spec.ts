import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {mooringDeparture} from '../support/mooring';
import {importSave} from './navigation';
import {capture,inspect} from './controls';
import {receiveItem,equipItem} from '../../src/rules/inventory';

for(const [device,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]as const)test(`mooring crossing preserves the actual departure and replays on ${device}`,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:1.25,reducedMotion:'reduce'}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  const saved=mooringDeparture();saved.coins=57;saved.party[1].hp=31;saved.party[1].focus=1;saved.bandages=2;saved.activeParty=['celia','kit'];saved.flags.forgeFlooded=true;
  receiveItem(saved.inventory,'brass-reflector');equipItem(saved.inventory,'nell','brass-reflector');
  await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');await importSave(page,saved);
  await expect.poll(async()=>(await inspect(page)).cinematic).toBe('five-six-crossing');await page.getByRole('button',{name:'Pause',exact:true}).click();
  expect((await inspect(page)).state).toEqual(saved);await expect(page.getByRole('heading',{name:'Chapter Five complete',exact:true})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Equipment',exact:true})).toBeDisabled();
  for(const shot of ['clouds','berth','capital']){
   await expect(page.locator('#canvas')).toHaveAttribute('data-crossing-shot',shot);await capture(page,`mooring-crossing-${shot}-${device}`);
   if(shot!=='capital')await page.getByRole('button',{name:'Next shot',exact:true}).click();
  }
  const output=page.waitForEvent('download');await page.getByRole('button',{name:'Export departure save',exact:true}).click();expect(JSON.parse(await readFile((await(await output).path())!,'utf8'))).toEqual(saved);
  await page.getByRole('button',{name:'Return to the flight deck',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBeNull();await expect(page.getByRole('button',{name:'Equipment',exact:true})).toBeEnabled();
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('five-six-crossing');
  await page.getByRole('button',{name:'Skip cinematic',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-sealed');
  expect((await inspect(page)).state).toMatchObject({chapter:'chapter-six',boundary:null,inventory:saved.inventory,party:saved.party,activeParty:saved.activeParty,coins:saved.coins,xp:saved.xp,bandages:saved.bandages,flags:{forgeFlooded:true}});
  expect((await inspect(page)).state.flags.celiaJoined).toBe(true);expect((await inspect(page)).state.flags.nellIll).toBe(true);expect((await inspect(page)).state.flags.nellRecovered).toBeUndefined();expect((await inspect(page)).state.flags.capitalSealed).toBeUndefined();expect((await inspect(page)).state.party[0]).toMatchObject({id:'nell',hp:1,focus:0});expect((await inspect(page)).state.flags.tomasRescued).toBe(true);
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await context.close();}
});

test('the mooring film moves passively, pauses and automatically reaches the outer mooring',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/');const saved=mooringDeparture();await importSave(page,saved);await page.mouse.move(1,1);
 await expect.poll(async()=>(await inspect(page)).cinematic).toBe('five-six-crossing');await page.waitForTimeout(700);
 const first=await page.locator('.pixel-output').screenshot();await page.waitForTimeout(400);expect(await page.locator('.pixel-output').screenshot()).not.toEqual(first);
 await page.getByRole('button',{name:'Pause',exact:true}).click();await page.mouse.move(1,1);await page.waitForTimeout(100);const paused=await page.locator('.pixel-output').screenshot();await page.waitForTimeout(350);expect(await page.locator('.pixel-output').screenshot()).toEqual(paused);
 await page.getByRole('button',{name:'Play',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic,{timeout:30000}).toBe('six-sealed');
 expect((await inspect(page)).state).toMatchObject({chapter:'chapter-six',boundary:null,party:saved.party,inventory:saved.inventory,coins:saved.coins});
});

test('a missing Chapter Six asset holds the last shot and the unconsumed departure for retry',async({page})=>{
 const url='**/art/vector/chapter-six/serpent-head.svg';
 await page.route(url,r=>r.abort());await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');const saved=mooringDeparture();await importSave(page,saved);
 await page.getByRole('button',{name:'Skip cinematic',exact:true}).click();await expect(page.getByRole('button',{name:'Retry crossing',exact:true})).toBeEnabled();await expect(page.locator('#canvas')).toHaveAttribute('data-crossing-shot','capital');
 expect((await inspect(page)).state).toEqual(saved);await expect(page.locator('.crossing-controls')).toContainText('return to the flight deck');await capture(page,'mooring-crossing-failed-load');
 await page.unroute(url);await page.getByRole('button',{name:'Retry crossing',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-sealed');
});

test('the workshop reviews the mooring crossing and keeps campaign/build storage untouched',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/?dev=cinematics&film=mooring-crossing');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop');
 const before=(await inspect(page)).state,storage=await page.evaluate(()=>JSON.stringify(localStorage));
 for(const [index,shot]of ['clouds','berth','capital'].entries()){
  await expect(page.getByRole('button',{name:'Chapter Five → Six',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.locator(`[data-ending-select="${index}"]`).click();await page.getByRole('button',{name:'Play selected shot',exact:true}).click();await expect(page.locator('#canvas')).toHaveAttribute('data-crossing-shot',shot);
  expect((await inspect(page)).state).toEqual(before);await capture(page,`mooring-crossing-workshop-${shot}`);await page.getByRole('button',{name:'Back to workshop',exact:true}).click();
 }
 await page.getByRole('button',{name:'Chapter One → Two',exact:true}).click();await expect(page.getByRole('button',{name:'Chapter One → Two',exact:true})).toHaveAttribute('aria-pressed','true');await expect(page.locator('.ending-shot-list')).toContainText('Beyond the pass');
 await page.getByRole('button',{name:'Bad ending',exact:true}).click();await expect(page.getByRole('button',{name:'Bad ending',exact:true})).toHaveAttribute('aria-pressed','true');
 expect(await page.evaluate(()=>JSON.stringify(localStorage))).toBe(storage);await expect(page.locator('vite-error-overlay')).toHaveCount(0);
});

test('finishing the berth conversation earns the film without sealing the capital or curing Nell',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');const saved=mooringDeparture();
 delete saved.flags.chapterFiveComplete;saved.boundary=null;saved.journal=saved.journal.filter(entry=>entry!=='fiveDeparture');
 await importSave(page,saved);await expect.poll(async()=>(await inspect(page)).cinematic).toBe('five-capital-departure');
 expect((await inspect(page)).state.boundary).toBeNull();await page.getByRole('button',{name:'Skip scene',exact:true}).click();
 await expect.poll(async()=>(await inspect(page)).cinematic).toBe('five-six-crossing');const departure=(await inspect(page)).state;
 expect(departure.boundary).toBe('chapter-six:capital-approach');expect(departure.flags.chapterFiveComplete).toBe(true);
 expect(departure.flags).toMatchObject({nellIll:true,albanDestroyed:true,flagshipDestroyed:true,retaliationWon:true});
 expect(departure.flags.capitalSealed).toBeUndefined();expect(departure.party[0]).toMatchObject({id:'nell',hp:1,focus:0});
 expect(departure.inventory).toEqual(saved.inventory);expect(departure.activeParty).toEqual(saved.activeParty);
 await page.getByRole('button',{name:'Skip cinematic',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-sealed');
 expect((await inspect(page)).state.flags.capitalSealed).toBeUndefined();expect((await inspect(page)).state.flags.nellRecovered).toBeUndefined();
});

test('canonical Chapter Six still starts at the pact and only that scene seals the capital',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 await page.getByRole('button',{name:'Begin Chapter Six (canonical)',exact:true}).click();
 await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-sealed');const before=(await inspect(page)).state;
 expect(before.flags.capitalSealed).toBeUndefined();expect(before.flags.nellIll).toBe(true);
 await page.getByRole('button',{name:'Skip scene',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-briefing');
 expect((await inspect(page)).state.flags.capitalSealed).toBe(true);await page.getByRole('button',{name:'Skip scene',exact:true}).click();
 await page.getByRole('button',{name:'Equipment',exact:true}).click();await page.getByRole('button',{name:'Nell',exact:true}).click();
 await expect(page.getByText('Too ill to fight · resting aboard',{exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Set active',exact:true})).toBeDisabled();
 const after=(await inspect(page)).state;expect(after.activeParty).toEqual(before.activeParty);expect(after.inventory).toEqual(before.inventory);expect(after.party[0]).toEqual(before.party[0]);
});
