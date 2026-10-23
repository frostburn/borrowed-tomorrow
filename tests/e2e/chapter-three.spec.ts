import { test,expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { CHAPTER_THREE_MAPS } from '../../src/content/chapter-three/maps';
import { sceneAssets } from '../../src/content/scene-art';
import { MAPS,arrival,walkable,worldPath } from '../../src/content/maps';
import { coastCheckpoint,palaceCheckpoint } from '../support/progress';
import { approach,importSave,travel,visit } from './navigation';
import { battle,capture,clickWorld,dialogue,inspect,nativeScene } from './controls';

async function equip(page:import('@playwright/test').Page,hero:string,item:string){
 await page.getByRole('button',{name:'Equipment',exact:true}).click();
 await page.getByRole('group',{name:'Character',exact:true}).getByRole('button',{name:hero,exact:true}).click();
 await page.locator('.ci-items').getByRole('button',{name:new RegExp(`^${item}`)}).click();
 await page.getByRole('button',{name:`Equip on ${hero}`,exact:true}).click();
 await page.getByRole('button',{name:'Close',exact:true}).click();
}
async function choices(page:import('@playwright/test').Page){
 await expect(page.locator('.dialogue')).toBeVisible();
 while(await page.locator('.dialogue-actions').getByRole('button',{name:/Next/}).count())await page.locator('.dialogue-actions').getByRole('button',{name:/Next/}).click();
}
async function begin(page:import('@playwright/test').Page){
 await page.goto('/');await importSave(page,coastCheckpoint('chapterTwoComplete'));
 await page.getByRole('button',{name:'Begin Chapter Three',exact:true}).click();
 await expect.poll(async()=>(await inspect(page)).cinematic).toBe('three-capital');
}
test('canonical Chapter Three replays arrival with earned equipment and preserves manual saves',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 const original=coastCheckpoint('kitJoined');original.coins=37;await importSave(page,original);
 await page.getByRole('button',{name:'Save',exact:true}).first().click();await page.locator('[data-slot="slot-1"]').getByRole('button',{name:'Save',exact:true}).click();
 // Wait for the IndexedDB write and refreshed slot controls before unloading.
 await expect(page.locator('[data-slot="slot-1"]').getByRole('button',{name:'Load',exact:true})).toBeEnabled();
 await page.reload();await page.getByRole('button',{name:'Begin Chapter Three (canonical)',exact:true}).click();
 await expect(page.getByRole('dialog')).toContainText('Manual save slots remain available');await page.getByRole('button',{name:'Start canonical save',exact:true}).click();
 await expect.poll(async()=>(await inspect(page)).cinematic).toBe('three-capital');
 const started=(await inspect(page)).state;expect(started.xp).toBe(420);expect(started.activeParty).toEqual(['nell','orrin','kit']);expect(started.flags.petraJoined).toBeUndefined();
 expect(started.inventory.characters.kit.fitting).toBe('courier-sight');expect(started.inventory.characters.orrin.coat).toBe('work-coat');
 await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('three-capital');
 await page.getByRole('button',{name:'Skip scene',exact:true}).click();await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();
 await expect.poll(async()=>(await inspect(page)).state.flags.capitalSeen).toBe(true);
 await page.reload();await page.getByRole('button',{name:'Save files',exact:true}).click();await page.locator('[data-slot="slot-1"]').getByRole('button',{name:'Load',exact:true}).click();
 expect((await inspect(page)).state).toMatchObject({chapter:'chapter-two',coins:37,inventory:original.inventory});expect(errors).toEqual([]);
});
for(const [device,viewport] of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]] as const){
 test(`capital entry and interrupted Petra recruitment preserve gear on ${device}`,async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize(viewport);await page.emulateMedia({reducedMotion:'reduce'});await begin(page);
  await expect(page).toHaveTitle('Borrowed Tomorrow');await nativeScene(page,'northglass');await capture(page,`chapter-three-arrival-${device}`);await dialogue(page);
  await approach(page,'capital-petra');await capture(page,`petra-refusal-${device}`);await dialogue(page);
  await page.getByRole('button',{name:'Win battle',exact:true}).click();await page.getByRole('button',{name:'Continue the journey',exact:true}).click();
  await expect.poll(async()=>(await inspect(page)).cinematic).toBe('three-defection');
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('three-defection');expect((await inspect(page)).state.party).toHaveLength(3);
  await dialogue(page);expect((await inspect(page)).state.party.map(h=>h.id)).toEqual(['nell','orrin','kit','petra']);
  await equip(page,'Petra','Balanced saber hilt');await page.getByRole('button',{name:'Equipment',exact:true}).click();
  await page.getByRole('button',{name:'Orrin',exact:true}).click();await page.getByRole('button',{name:'Move to reserve',exact:true}).click();await page.getByRole('button',{name:'Petra',exact:true}).click();await page.getByRole('button',{name:'Set active',exact:true}).click();
  await capture(page,`petra-equipment-${device}`);await page.getByRole('button',{name:'Close',exact:true}).click();
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).state.inventory.characters.petra.fitting).toBe('saber-hilt');expect((await inspect(page)).state.activeParty).toEqual(['nell','kit','petra']);expect(errors).toEqual([]);
 });
}
test('@journey Chapter Three rescues Tomas, earns usable loot and escapes the rising capital',async({page})=>{
 test.setTimeout(300000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});await begin(page);await dialogue(page);
 await visit(page,'capital-cache');await equip(page,'Orrin','Baffled pressure nozzle');
 await approach(page,'capital-petra');await dialogue(page);await battle(page,'capital-custody-battle');await dialogue(page);await equip(page,'Petra','Balanced saber hilt');
 await page.getByRole('button',{name:'Equipment',exact:true}).click();await page.getByRole('button',{name:'Orrin',exact:true}).click();await page.getByRole('button',{name:'Move to reserve',exact:true}).click();await page.getByRole('button',{name:'Petra',exact:true}).click();await page.getByRole('button',{name:'Set active',exact:true}).click();await page.getByRole('button',{name:'Close',exact:true}).click();
 await travel(page,'capital-works','relayhall');await dialogue(page);await battle(page,'tomas-warden-battle');await dialogue(page);await equip(page,'Nell','Silver reflector');
 await capture(page,'tomas-reunion');await dialogue(page);expect((await inspect(page)).state.flags.tomasRescued).toBe(true);
 await approach(page,'works-locker');await page.getByRole('button',{name:'Open the stores · fight the lock patrol',exact:true}).click();await battle(page,'palace-stores-battle');await equip(page,'Kit','Ratchet sight');
 await approach(page,'works-plan');await choices(page);await page.getByRole('button',{name:'Cut the crystal feeds · two earth plates',exact:true}).click();
 await travel(page,'works-depths','conduit');await nativeScene(page,'conduit');await capture(page,'conduit-arrival-desktop');await dialogue(page);
 await approach(page,'heart-regulator');await battle(page,'heart-plates-battle');await dialogue(page);await equip(page,'Petra','Insulated work coat');
 await dialogue(page);expect((await inspect(page)).state.flags.emperorMerged).toBe(true);expect((await inspect(page)).state.flags.tomasRescued).toBe(true);
 await visit(page,'capital-tomas');await visit(page,'capital-departure');await expect(page.getByRole('heading',{name:'Chapter Three complete',exact:true})).toBeVisible();await capture(page,'chapter-three-complete-desktop');
 const saved=(await inspect(page)).state;expect(saved.boundary).toBe('chapter-four:broken-world');expect(saved.inventory.characters.nell.fitting).toBe('silver-reflector');expect(saved.inventory.characters.kit.fitting).toBe('ratchet-sight');expect(saved.inventory.characters.petra.coat).toBe('insulated-coat');expect(saved.party.some(h=>h.id==='celia')).toBe(false);
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Export departure save',exact:true}).click();const exported=JSON.parse(await readFile((await(await download).path())!,'utf8'));expect(exported.flags.tomasRescued).toBe(true);expect(exported.inventory).toEqual(saved.inventory);
 await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect(page.getByRole('heading',{name:'Chapter Three complete',exact:true})).toBeVisible();expect((await inspect(page)).state.inventory).toEqual(saved.inventory);expect(errors).toEqual([]);
});
test('the pressure route, optional stores refusal and escape work on a phone',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await importSave(page,palaceCheckpoint('tomasRescued'));
 await approach(page,'works-locker');await page.getByRole('button',{name:'Leave the stores sealed',exact:true}).click();expect((await inspect(page)).state.flags.palaceStoresWon).toBeUndefined();
 await approach(page,'works-plan');await choices(page);await capture(page,'intake-choice-phone');await page.getByRole('button',{name:'Take the pressure walk · crows and vents',exact:true}).click();
 await travel(page,'works-depths','conduit');await capture(page,'conduit-arrival-phone');await dialogue(page);await approach(page,'heart-regulator');await battle(page,'heart-pressure-phone');await dialogue(page);await equip(page,'Kit','Insulated work coat');
 await capture(page,'emperor-rupture-phone');await dialogue(page);await visit(page,'capital-departure');await expect(page.getByRole('heading',{name:'Chapter Three complete',exact:true})).toBeVisible();await capture(page,'chapter-three-complete-phone');expect((await inspect(page)).state.flags.tomasRescued).toBe(true);expect(errors).toEqual([]);
});
test('failed chamber SVG preserves the current departure for retry',async({page})=>{
 const chamberArt=sceneAssets(CHAPTER_THREE_MAPS.conduit.tiles!).find(p=>p.key==='scenery-palace-vessel')!;expect(chamberArt).toBeTruthy();
 await page.route(`**/${chamberArt.url}`,route=>route.abort());await page.goto('/');const before=coastCheckpoint('chapterTwoComplete');await importSave(page,before);
 await page.getByRole('button',{name:'Begin Chapter Three',exact:true}).click();await expect(page.getByRole('status')).toContainText('checkpoint is intact');expect((await inspect(page)).state).toMatchObject({chapter:'chapter-two',boundary:'chapter-three:capital',inventory:before.inventory});
 await page.unroute(`**/${chamberArt.url}`);await page.getByRole('button',{name:'Begin Chapter Three',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('three-capital');
});

test('covered Chapter Three saves restore onto connected native floors at fractional DPR',async({browser})=>{
 const context=await browser.newContext({viewport:{width:1170,height:780},deviceScaleFactor:2.5});
 try{
  const page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');
  for(const [map,point,startName] of [['northglass',{x:47,y:12},'start'],['relayhall',{x:32,y:21},'from-siding'],['conduit',{x:32,y:17},'from-gallery']] as const){
   const saved=palaceCheckpoint('conduitGuardWon');saved.location={map,...point};saved.party[0].hp=19;saved.bandages=7;
   await importSave(page,saved);const restored=(await inspect(page)).state;
   expect(walkable(MAPS[map],restored.location.x,restored.location.y,restored)).toBe(true);
   expect(restored).toMatchObject({flags:saved.flags,inventory:saved.inventory,party:saved.party,activeParty:saved.activeParty,coins:saved.coins,bandages:7});
   await nativeScene(page,map);await capture(page,`chapter-three-${map}-fractional-dpr`);
   const path=worldPath(MAPS[map],restored.location,arrival(map,startName),restored);
   const target=path.slice(0,5).reverse().find(p=>MAPS[map].objects.every(o=>Math.hypot(o.x-p.x,o.y-p.y)>=1.8&&(!o.hitArea||p.x<o.hitArea.x||p.x>=o.hitArea.x+o.hitArea.width||p.y<o.hitArea.y||p.y>=o.hitArea.y+o.hitArea.height)))!;expect(target).toBeTruthy();
   await clickWorld(page,target.x,target.y);await expect.poll(async()=>(await inspect(page)).state.location,{timeout:20000}).toEqual({map,...target});
   expect(await page.evaluate(()=>window.borrowedTomorrowPixels.inspect().physicalScale)).toBe(2);
   await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).state.location).toEqual({map,...target});
  }
  expect(errors).toEqual([]);
 }finally{await context.close();}
});
