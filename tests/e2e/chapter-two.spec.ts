import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { tilePages } from '../../src/content/tilemaps';
import { CHAPTER_TWO_MAPS } from '../../src/content/chapter-two/maps';
import { MAPS, walkable } from '../../src/content/maps';
import { coastCheckpoint, checkpoint } from '../support/progress';
import { battle, capture, clickWorld, dialogue, inspect, nativeScene, nativeActor } from './controls';
import { approach, importSave, travel, visit } from './navigation';


for(const [device,viewport] of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]] as const) {
  test(`Petra and Alban are fully visible at the crossing before and during the confrontation on ${device}`,async({page})=>{
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
    await page.setViewportSize(viewport);await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
    const saved=coastCheckpoint('evacuationReady');saved.location={map:'cinderbank',x:45,y:26};await importSave(page,saved);
    // Allow the exploration ! marker; the unmarked cutscene must match in full.
    await capture(page,`alban-crossing-${device}`);await nativeActor(page,'alban',{x:49,y:21},.1);await nativeActor(page,'petra',{x:47,y:23},.1);
    await approach(page,'siding-alban');await expect.poll(async()=>(await inspect(page)).cinematic).toBe('two-recapture');
    await nativeActor(page,'alban',{x:49,y:23});await nativeActor(page,'petra',{x:47,y:23});await capture(page,`alban-confrontation-${device}`);
    await page.locator('.dialogue-actions button').first().click();
    await expect(page.locator('.dialogue h2')).toHaveText('Captain Alban');
    await expect.poll(async()=>(await inspect(page)).actors.find(a=>a.hero==='alban')?.y).toBe((21.5)*24+7);
    await nativeActor(page,'alban',{x:49,y:21});await nativeActor(page,'petra',{x:47,y:23});await capture(page,`alban-behind-petra-${device}`);
    await dialogue(page);await expect.poll(async()=>(await inspect(page)).mode).toBe('battle');
    expect((await inspect(page)).battle!.units.some(u=>u.name==='Captain Alban')).toBe(false);
    expect((await inspect(page)).actors.find(a=>a.hero==='petra')?.texture).toBe('petra-left');await capture(page,`petra-boss-${device}`);
    expect(errors).toEqual([]);
  });

  test(`boarding objective, safe blockages and development restart work on ${device}`,async({page})=>{
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
    await page.setViewportSize(viewport);await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
    const saved=coastCheckpoint('settlementSeen');saved.location={map:'cinderbank',x:39,y:21};await importSave(page,saved);
    await approach(page,'siding-collector');await dialogue(page);
    await expect(page.getByLabel('Boarding objective')).toContainText('Families aboard: 0/3');
    await expect(page.getByLabel('Boarding objective')).toContainText('gold loading walk');
    await nativeScene(page,'cinderbank');await capture(page,`loading-walk-${device}`);
    for(let actions=0;actions<3;actions++){
      const button=page.locator('.actions').getByRole('button',{name:/^F\s+Defend$/});await expect(button).toBeEnabled();await button.click();
    }
    await expect.poll(async()=>(await inspect(page)).battle!.round).toBe(2);
    expect((await inspect(page)).battle!.result).toBeNull();
    await expect(page.locator('.battle-log')).toContainText('wait safely');await capture(page,`loading-walk-blocked-${device}`);
    await page.getByRole('button',{name:'Restart battle',exact:true}).click();
    expect((await inspect(page)).battle!.round).toBe(1);expect((await inspect(page)).battle!.evacuation?.boarded).toBe(0);
    await page.getByRole('button',{name:'Win battle',exact:true}).click();
    expect((await inspect(page)).battle!.evacuation?.boarded).toBe(3);
    await page.getByRole('button',{name:'Continue the journey',exact:true}).click();
    await visit(page,'siding-release');expect((await inspect(page)).state.flags.evacuationReady).toBe(true);
    expect((await inspect(page)).state.inventory.bag['work-coat']).toBe(1);expect(errors).toEqual([]);
  });

  test(`Iron Coast arrival, interrupted Kit recruitment and native art on ${device}`,async({page})=>{
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    await page.setViewportSize(viewport);await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
    await page.getByRole('button',{name:'Begin Chapter Two (canonical)',exact:true}).click();
    await expect.poll(async()=>(await inspect(page)).cinematic).toBe('two-coast');
    expect((await inspect(page)).state.activeParty).toEqual(['nell','orrin']);
    expect((await inspect(page)).state.xp).toBe(175);
    await page.getByRole('button',{name:'Sound off',exact:true}).click();await expect(page.getByRole('button',{name:'Sound on',exact:true})).toBeVisible();
    await nativeScene(page,'coast');await capture(page,`coast-arrival-${device}`);
    while(!(await page.locator('.dialogue').textContent())!.includes('Alban tears the permit'))await page.locator('.dialogue-actions button').first().click();
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

test('canonical Chapter Two replaces only the autosave and preserves manual saves',async({page})=>{
  await page.goto('/');const original=checkpoint('chapterOneComplete');original.coins=37;
  await importSave(page,original);await page.getByRole('button',{name:'Save',exact:true}).first().click();
  await page.locator('[data-slot="slot-1"]').getByRole('button',{name:'Save',exact:true}).click();
  await expect(page.locator('[data-slot="slot-1"]').getByRole('button',{name:'Load',exact:true})).toBeEnabled();
  await page.reload();await page.getByRole('button',{name:'Begin Chapter Two (canonical)',exact:true}).click();
  await expect(page.getByRole('dialog')).toContainText('Manual save slots remain available');
  await page.getByRole('button',{name:'Start canonical save',exact:true}).click();await dialogue(page);
  expect((await inspect(page)).state.chapter).toBe('chapter-two');expect((await inspect(page)).state.coins).not.toBe(37);
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();
  await expect.poll(async()=>(await inspect(page)).state.flags.coastSeen).toBe(true);
  await page.reload();await page.getByRole('button',{name:'Save files',exact:true}).click();
  await page.locator('[data-slot="slot-1"]').getByRole('button',{name:'Load',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Chapter One complete',exact:true})).toBeVisible();
  expect((await inspect(page)).state.coins).toBe(37);expect((await inspect(page)).state.inventory).toEqual(original.inventory);
});

test('Chapter Two covered saves restore to native tiled floors at fractional DPR',async({browser})=>{
  const context=await browser.newContext({viewport:{width:1170,height:780},deviceScaleFactor:2.5});
  const page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');
  for(const [map,point] of [['coast',{x:24,y:13}],['infirmary',{x:15,y:22}],['cinderbank',{x:45,y:16}]] as const){
    const saved=coastCheckpoint('evacuationReady');saved.location={map,...point};saved.bandages=7;saved.party[0].hp=19;
    await importSave(page,saved);const restored=(await inspect(page)).state;
    expect(walkable(MAPS[map],restored.location.x,restored.location.y,restored)).toBe(true);
    expect(restored).toMatchObject({flags:saved.flags,inventory:saved.inventory,party:saved.party,activeParty:saved.activeParty,coins:saved.coins,bandages:7});
    await nativeScene(page,map);await capture(page,`chapter-two-${map}-fractional-dpr`);
    expect(await page.evaluate(()=>window.borrowedTomorrowPixels.inspect().physicalScale)).toBe(2);
  }
  expect(errors).toEqual([]);await context.close();
});

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
  await travel(page,'ward-siding','cinderbank');await dialogue(page);await approach(page,'siding-collector');await dialogue(page);await battle(page,'cinderbank-collector-battle');
  await visit(page,'siding-release');expect((await inspect(page)).state.flags.evacuationReady).toBe(true);
  await approach(page,'siding-alban');await dialogue(page);await battle(page,'coast-petra-battle');
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
  const crane=tilePages(CHAPTER_TWO_MAPS.coast.tiles!).find(p=>p.firstgid>=2544)!;
  const url='**/'+crane.url;await page.route(url,route=>route.abort());
  await page.goto('/');const original=checkpoint('chapterOneComplete');await importSave(page,original);
  await page.getByRole('button',{name:'Begin Chapter Two',exact:true}).click();
  await expect(page.getByRole('status')).toContainText('checkpoint is intact');
  expect((await inspect(page)).state).toMatchObject({chapter:'chapter-one',boundary:'chapter-two:iron-coast',inventory:original.inventory});
  await page.unroute(url);await page.getByRole('button',{name:'Begin Chapter Two',exact:true}).click();
  await expect.poll(async()=>(await inspect(page)).cinematic).toBe('two-coast');
});

test('loading-gate route, ward supplies and the escape work on a phone',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await importSave(page,coastCheckpoint('kitJoined'));
  await approach(page,'loading-gate');await dialogue(page);await expect(page.locator('.identity .role')).toHaveText('Courier');await battle(page,'loading-gate-phone');expect((await inspect(page)).state.flags.raidDiversion).toBe(false);
  await visit(page,'prison-coach');await travel(page,'coast-ward','infirmary');await dialogue(page);await nativeScene(page,'infirmary');await capture(page,'railway-ward-phone');
  const before=(await inspect(page)).state;await approach(page,'ward-rest');await expect(page.locator('.dialogue')).toBeVisible();await capture(page,'ward-care-menu-phone');
  await page.getByRole('button',{name:'Buy a field bandage · 8 marks',exact:true}).click();expect((await inspect(page)).state.coins).toBe(before.coins-8);expect((await inspect(page)).state.bandages).toBe(before.bandages+1);
  await travel(page,'ward-siding','cinderbank');await dialogue(page);await approach(page,'siding-collector');await dialogue(page);await expect(page.getByRole('button',{name:'Win battle',exact:true})).toBeVisible();await page.getByRole('button',{name:'Win battle',exact:true}).click();await page.getByRole('button',{name:'Continue the journey',exact:true}).click();
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
