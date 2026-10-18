import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { CHAPTER_TWO_AVAILABLE } from '../../src/content/chapters';
import { coastCheckpoint, checkpoint } from '../support/progress';
import { battle, capture, clickWorld, dialogue, inspect, nativeScene, nativeActor } from './controls';
import { approach, importSave, travel, visit } from './navigation';

test.skip(!CHAPTER_TWO_AVAILABLE, 'Chapter Two artwork is not installed in this source checkpoint.');

for(const [device,viewport] of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]] as const) {
  test(`Iron Coast arrival, interrupted Kit recruitment and native art on ${device}`,async({page})=>{
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    await page.setViewportSize(viewport);await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
    const {activeParty:_,...departure}=checkpoint('chapterOneComplete');
    await importSave(page,{...departure,version:6});
    await page.getByRole('button',{name:'Begin Chapter Two',exact:true}).click();
    await expect.poll(async()=>(await inspect(page)).cinematic).toBe('two-coast');
    await page.getByRole('button',{name:'Sound off',exact:true}).click();await expect(page.getByRole('button',{name:'Sound on',exact:true})).toBeVisible();
    await nativeScene(page,'coast');await capture(page,`coast-arrival-${device}`);
    while(await page.locator('.dialogue h2').textContent()!=='The loading gate')await page.locator('.dialogue-actions button').first().click();
    await expect(page.locator('.dialogue')).toContainText('Alban tears the permit');await capture(page,`kit-delivery-seized-${device}`);await dialogue(page);
    await approach(page,'kit-contact');await expect.poll(async()=>(await inspect(page)).cinematic).toBe('two-kit');
    await nativeActor(page,'kit',{x:28,y:21});await capture(page,`kit-meeting-${device}`);
    await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();
    await expect.poll(async()=>(await inspect(page)).state.chapter).toBe('chapter-two');
    expect((await inspect(page)).state.flags.kitJoined).toBeUndefined();
    await approach(page,'kit-contact');await expect(page.getByRole('button',{name:'Skip scene'})).toBeInViewport();await page.getByRole('button',{name:'Skip scene'}).click();
    expect((await inspect(page)).state.activeParty).toEqual(['nell','orrin','kit']);
    await page.getByRole('button',{name:'Equipment',exact:true}).click();await page.getByRole('button',{name:'Kit',exact:true}).click();
    await expect(page.getByRole('region',{name:'Kit equipment'})).toContainText('Move 4');
    await expect(page.locator('.ci-character img')).toHaveAttribute('src',/portrait-kit.png$/);await capture(page,`kit-inventory-${device}`);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([]);
  });
}

test('@journey Chapter Two: Kit’s delivery, prison rescue and the capital train',async({page})=>{
  test.setTimeout(240000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('/');await page.emulateMedia({reducedMotion:'reduce'});await importSave(page,checkpoint('chapterOneComplete'));
  await page.getByRole('button',{name:'Begin Chapter Two',exact:true}).click();await dialogue(page);await visit(page,'kit-contact');
  await approach(page,'signal-walk');await dialogue(page);await battle(page,'kit-raid-battle');
  expect((await inspect(page)).state.inventory.bag['courier-sight']).toBe(1);
  await page.getByRole('button',{name:'Equipment',exact:true}).click();await page.getByRole('button',{name:'Kit',exact:true}).click();await page.getByRole('button',{name:'Equip on Kit',exact:true}).click();await page.getByRole('button',{name:'Close',exact:true}).click();
  await visit(page,'prison-coach');expect((await inspect(page)).state.flags.prisonersFreed).toBe(true);
  await travel(page,'coast-ward','infirmary');await dialogue(page);expect((await inspect(page)).state.party.map(h=>h.id)).toEqual(['nell','orrin','kit']);
  await page.getByRole('button',{name:'Equipment',exact:true}).click();
  await expect(page.getByRole('group',{name:'Character',exact:true}).getByRole('button',{name:'Celia',exact:true})).toHaveCount(0);
  await capture(page,'chapter-two-three-travelers');await page.getByRole('button',{name:'Close',exact:true}).click();
  expect((await inspect(page)).state.activeParty).toEqual(['nell','orrin','kit']);
  await travel(page,'ward-siding','cinderbank');await dialogue(page);await approach(page,'siding-collector');await battle(page,'cinderbank-collector-battle');
  await visit(page,'siding-release');expect((await inspect(page)).state.flags.evacuationReady).toBe(true);
  await approach(page,'siding-alban');await dialogue(page);await battle(page,'coast-alban-battle');
  await visit(page,'capital-engine');await expect(page.getByRole('heading',{name:'Chapter Two complete',exact:true})).toBeVisible();await capture(page,'chapter-two-complete');
  const final=(await inspect(page)).state;expect(final.boundary).toBe('chapter-three:capital');expect(final.flags.villageFreed).toBe(true);expect(final.inventory.characters.kit.fitting).toBe('courier-sight');
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'Export departure save',exact:true}).click();const exported=JSON.parse(await readFile((await(await download).path())!,'utf8'));
  expect(exported.activeParty).toEqual(final.activeParty);expect(exported.party).toEqual(final.party);
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect(page.getByRole('heading',{name:'Chapter Two complete',exact:true})).toBeVisible();
  expect((await inspect(page)).state.inventory).toEqual(final.inventory);expect(errors).toEqual([]);
});


test('the three traveling companions fit the compact inventory and phone HUD',async({page})=>{
  await page.setViewportSize({width:320,height:740});await page.goto('/');await importSave(page,coastCheckpoint('wardSeen'));
  await expect(page.locator('.world-party')).toHaveAttribute('data-size','3');
  for(const name of ['Nell','Orrin','Kit'])await expect(page.locator('.world-party').getByText(name,{exact:true})).toBeInViewport();
  const boxes=await page.locator('.world-hero').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {left:r.left,right:r.right};}));
  expect(boxes.every((b,i)=>i===0||b.left>=boxes[i-1].right)).toBe(true);await capture(page,'three-fighter-hud-phone');
  await page.getByRole('button',{name:'Equipment',exact:true}).click();
  for(const name of ['Nell','Orrin','Kit'])await expect(page.getByRole('group',{name:'Character',exact:true}).getByRole('button',{name,exact:true})).toBeInViewport();
  await expect(page.getByRole('button',{name:'Celia',exact:true})).toHaveCount(0);await page.getByRole('button',{name:'Kit',exact:true}).click();await expect(page.locator('.ci-character img')).toHaveJSProperty('naturalWidth',128);
  await expect(page.locator('.ci-character img')).toHaveCSS('width','128px');await expect(page.getByRole('button',{name:'Move to reserve',exact:true})).toBeVisible();await capture(page,'three-travelers-inventory-phone');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('failed region artwork keeps the original departure available for retry',async({page})=>{
  await page.goto('/');const original=checkpoint('chapterOneComplete');await importSave(page,original);
  await page.route('**/art/coast.webp',route=>route.abort());
  await page.getByRole('button',{name:'Begin Chapter Two',exact:true}).click();
  await expect(page.getByRole('status')).toContainText('checkpoint is intact');
  expect((await inspect(page)).state).toMatchObject({chapter:'chapter-one',boundary:'chapter-two:iron-coast',inventory:original.inventory});
  await page.unroute('**/art/coast.webp');await page.getByRole('button',{name:'Begin Chapter Two',exact:true}).click();
  await expect.poll(async()=>(await inspect(page)).cinematic).toBe('two-coast');
});

test('loading-gate route, ward supplies and the escape work on a phone',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await importSave(page,coastCheckpoint('kitJoined'));
  await approach(page,'loading-gate');await dialogue(page);await expect(page.locator('.identity .role')).toHaveText('Courier');await battle(page,'loading-gate-phone');expect((await inspect(page)).state.flags.raidDiversion).toBe(false);
  await visit(page,'prison-coach');await travel(page,'coast-ward','infirmary');await dialogue(page);await nativeScene(page,'infirmary');await capture(page,'railway-ward-phone');
  const before=(await inspect(page)).state;await approach(page,'ward-rest');await expect(page.locator('.dialogue')).toBeVisible();await capture(page,'ward-care-menu-phone');
  await page.getByRole('button',{name:'Buy a field bandage · 8 marks',exact:true}).click();expect((await inspect(page)).state.coins).toBe(before.coins-8);expect((await inspect(page)).state.bandages).toBe(before.bandages+1);
  await travel(page,'ward-siding','cinderbank');await dialogue(page);await approach(page,'siding-collector');await expect(page.getByRole('button',{name:'Win battle',exact:true})).toBeVisible();await page.getByRole('button',{name:'Win battle',exact:true}).click();await page.getByRole('button',{name:'Continue the journey',exact:true}).click();
  await visit(page,'siding-release');await approach(page,'siding-alban');await dialogue(page);await page.getByRole('button',{name:'Win battle',exact:true}).click();await page.getByRole('button',{name:'Continue the journey',exact:true}).click();await visit(page,'capital-engine');
  await expect(page.getByRole('heading',{name:'Chapter Two complete',exact:true})).toBeVisible();await capture(page,'chapter-two-complete-phone');expect(errors).toEqual([]);
});

for(const [device,viewport] of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]] as const) {
  test(`the illustrated coach door opens from the saved post-raid position on ${device}`,async({page})=>{
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
    await page.setViewportSize(viewport);await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
    const saved=coastCheckpoint('trainRaidWon');saved.location={map:'coast',x:24,y:15};
    await importSave(page,saved);await expect(page).toHaveTitle('Borrowed Tomorrow');
    await capture(page,`coach-checkpoint-${device}`);
    // Click the painted door above the platform, rather than a content-coordinate helper.
    await clickWorld(page,26,11);
    await expect.poll(async()=>(await inspect(page)).cinematic,{timeout:5000}).toBe('two-prisoners');
    await capture(page,`coach-opens-${device}`);await dialogue(page);
    expect((await inspect(page)).state.flags.prisonersFreed).toBe(true);
    await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();
    await expect.poll(async()=>(await inspect(page)).state.flags.prisonersFreed).toBe(true);
    await travel(page,'coast-ward','infirmary');await dialogue(page);
    expect((await inspect(page)).state.flags.wardSeen).toBe(true);expect(errors).toEqual([]);
  });
}
