import { test,expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { CHAPTER_THREE_AVAILABLE } from '../../src/content/chapters';
import { coastCheckpoint,palaceCheckpoint } from '../support/progress';
import { approach,importSave,travel,visit } from './navigation';
import { battle,capture,dialogue,inspect,nativeScene } from './controls';
test.skip(!CHAPTER_THREE_AVAILABLE,'Chapter Three art pack is not installed.');
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
 await travel(page,'capital-works','relayhall');await dialogue(page);await battle(page,'tomas-warden-battle');await equip(page,'Nell','Silver reflector');
 await approach(page,'works-tomas');await capture(page,'tomas-reunion');await dialogue(page);expect((await inspect(page)).state.flags.tomasRescued).toBe(true);
 await approach(page,'works-locker');await page.getByRole('button',{name:'Open the stores · fight the lock patrol',exact:true}).click();await battle(page,'palace-stores-battle');await equip(page,'Kit','Ratchet sight');
 await approach(page,'works-plan');await choices(page);await page.getByRole('button',{name:'Cut the crystal feeds · two earth plates',exact:true}).click();
 await travel(page,'works-depths','conduit');await nativeScene(page,'conduit');await capture(page,'conduit-arrival-desktop');await dialogue(page);
 await approach(page,'heart-regulator');await battle(page,'heart-plates-battle');await equip(page,'Petra','Insulated work coat');
 await visit(page,'heart-release');expect((await inspect(page)).state.flags.emperorMerged).toBe(true);expect((await inspect(page)).state.flags.tomasRescued).toBe(true);
 await visit(page,'capital-tomas');await visit(page,'capital-departure');await expect(page.getByRole('heading',{name:'Chapter Three complete',exact:true})).toBeVisible();await capture(page,'chapter-three-complete-desktop');
 const saved=(await inspect(page)).state;expect(saved.boundary).toBe('chapter-four:broken-world');expect(saved.inventory.characters.nell.fitting).toBe('silver-reflector');expect(saved.inventory.characters.kit.fitting).toBe('ratchet-sight');expect(saved.inventory.characters.petra.coat).toBe('insulated-coat');expect(saved.party.some(h=>h.id==='celia')).toBe(false);
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Export departure save',exact:true}).click();const exported=JSON.parse(await readFile((await(await download).path())!,'utf8'));expect(exported.flags.tomasRescued).toBe(true);expect(exported.inventory).toEqual(saved.inventory);
 await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect(page.getByRole('heading',{name:'Chapter Three complete',exact:true})).toBeVisible();expect((await inspect(page)).state.inventory).toEqual(saved.inventory);expect(errors).toEqual([]);
});
test('the pressure route, optional stores refusal and escape work on a phone',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await importSave(page,palaceCheckpoint('tomasRescued'));
 await approach(page,'works-locker');await page.getByRole('button',{name:'Leave the stores sealed',exact:true}).click();expect((await inspect(page)).state.flags.palaceStoresWon).toBeUndefined();
 await approach(page,'works-plan');await choices(page);await capture(page,'intake-choice-phone');await page.getByRole('button',{name:'Take the pressure walk · crows and vents',exact:true}).click();
 await travel(page,'works-depths','conduit');await capture(page,'conduit-arrival-phone');await dialogue(page);await approach(page,'heart-regulator');await battle(page,'heart-pressure-phone');await equip(page,'Kit','Insulated work coat');
 await approach(page,'heart-release');await capture(page,'emperor-rupture-phone');await dialogue(page);await visit(page,'capital-departure');await expect(page.getByRole('heading',{name:'Chapter Three complete',exact:true})).toBeVisible();await capture(page,'chapter-three-complete-phone');expect((await inspect(page)).state.flags.tomasRescued).toBe(true);expect(errors).toEqual([]);
});
test('failed chamber artwork preserves the current departure for retry',async({page})=>{
 await page.goto('/');const before=coastCheckpoint('chapterTwoComplete');await importSave(page,before);await page.route('**/art/conduit.webp',route=>route.abort());
 await page.getByRole('button',{name:'Begin Chapter Three',exact:true}).click();await expect(page.getByRole('status')).toContainText('checkpoint is intact');expect((await inspect(page)).state).toMatchObject({chapter:'chapter-two',boundary:'chapter-three:capital',inventory:before.inventory});
 await page.unroute('**/art/conduit.webp');await page.getByRole('button',{name:'Begin Chapter Three',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('three-capital');
});
