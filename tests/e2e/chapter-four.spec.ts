import { test,expect,type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { CHAPTER_FOUR_AVAILABLE } from '../../src/content/chapters';
import { equipItem } from '../../src/rules/inventory';
import { brokenCheckpoint,palaceCheckpoint } from '../support/progress';
import { approach,importSave,travel,visit } from './navigation';
import { battle,capture,dialogue,inspect,nativeScene } from './controls';
test.skip(!CHAPTER_FOUR_AVAILABLE,'Chapter Four art pack is not installed.');
async function choices(page:Page){
 await expect(page.locator('.dialogue')).toBeVisible();
 while(await page.locator('.dialogue-actions').getByRole('button',{name:/Next/}).count())await page.locator('.dialogue-actions').getByRole('button',{name:/Next/}).click();
}
async function equip(page:Page,hero:string,item:string){
 await page.getByRole('button',{name:'Equipment',exact:true}).click();await page.getByRole('group',{name:'Character',exact:true}).getByRole('button',{name:hero,exact:true}).click();
 await page.locator('.ci-items').getByRole('button',{name:new RegExp(`^${item}`)}).click();await page.getByRole('button',{name:`Equip on ${hero}`,exact:true}).click();await page.getByRole('button',{name:'Close',exact:true}).click();
}
async function untilScene(page:Page,id:string){
 for(let n=0;n<40;n++){if((await inspect(page)).cinematic===id)return;await page.locator('.dialogue-actions button').first().click();}
 throw Error(`Scene ${id} was not reached.`);
}
for(const [device,viewport] of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]] as const){
 test(`Chapter Four replays an interrupted Celia introduction and keeps the local group on ${device}`,async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize(viewport);await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  await importSave(page,brokenCheckpoint('worksEvacuated'));await expect.poll(async()=>(await inspect(page)).cinematic).toBe('four-road');
  expect((await inspect(page)).state.party).toHaveLength(4);expect((await inspect(page)).state.activeParty).toEqual(['petra']);await nativeScene(page,'sanctuary');await capture(page,`celia-introduction-${device}`);
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('four-road');
  await dialogue(page);expect((await inspect(page)).state.party).toHaveLength(5);expect((await inspect(page)).state.activeParty).toEqual(['petra','celia']);
  await page.getByRole('button',{name:'Equipment',exact:true}).click();await expect(page.getByRole('button',{name:'Set active',exact:true})).toHaveCount(0);await expect(page.getByRole('button',{name:'Move to reserve',exact:true})).toHaveCount(0);await page.getByRole('button',{name:'Close',exact:true}).click();
  await approach(page,'sanctuary-patrol');await page.getByRole('button',{name:'Win battle',exact:true}).click();await page.getByRole('button',{name:'Continue the journey',exact:true}).click();await expect.poll(async()=>(await inspect(page)).state.activeParty).toEqual(['celia','petra']);
  await capture(page,`celia-search-${device}`);await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).state.activeParty[0]).toBe('celia');expect(errors).toEqual([]);
 });
}
test('failed sanctuary artwork preserves the current departure until retry',async({page})=>{
 await page.goto('/');const before=palaceCheckpoint('chapterThreeComplete');await importSave(page,before);await page.route('**/art/sanctuary.webp',route=>route.abort());
 await page.getByRole('button',{name:'Begin Chapter Four',exact:true}).click();await expect(page.getByRole('status')).toContainText('checkpoint is intact');
 expect((await inspect(page)).state).toMatchObject({chapter:'chapter-three',boundary:'chapter-four:broken-world',inventory:before.inventory,activeParty:before.activeParty,reunionParty:null});
 await page.unroute('**/art/sanctuary.webp');await page.getByRole('button',{name:'Begin Chapter Four',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('four-morning');
});
for(const [route,device,viewport] of [['dry','desktop',{width:1280,height:800}],['flooded','phone',{width:390,height:844}]] as const){
 test(`@journey Chapter Four ${route} route reunites the cast and earns every available reward on ${device}`,async({page})=>{
  test.setTimeout(600000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize(viewport);await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  const departure=palaceCheckpoint('chapterThreeComplete');departure.activeParty=['nell','petra','kit'];equipItem(departure.inventory,'nell','silver-reflector');equipItem(departure.inventory,'nell','insulated-coat');equipItem(departure.inventory,'petra','saber-hilt');equipItem(departure.inventory,'kit','courier-sight');
  await importSave(page,departure);await page.getByRole('button',{name:'Begin Chapter Four',exact:true}).click();await nativeScene(page,'infirmary');await capture(page,`broken-morning-${device}`);await dialogue(page);
  await approach(page,'refuge-tomas');await page.getByRole('button',{name:'Read Orrin’s signal',exact:true}).click();await dialogue(page);expect((await inspect(page)).state.activeParty).toEqual(['orrin','kit']);await nativeScene(page,'sluice');await capture(page,`orrin-works-${device}`);
  await approach(page,'works-cart');await page.getByRole('button',{name:'Leave the cart sealed',exact:true}).click();expect((await inspect(page)).state.flags.worksStoresWon).toBeUndefined();
  if(route==='dry'){await approach(page,'works-cart');await page.getByRole('button',{name:'Open the survey cart · fight its patrol',exact:true}).click();await battle(page,`survey-cart-battle-${device}`);await equip(page,'Kit','Folding range sight');}
  await approach(page,'works-approach');await choices(page);await page.getByRole('button',{name:route==='dry'?'Take the dry service walk · ranged crows':'Cross the flooded pump floor · slower movement',exact:true}).click();await battle(page,`works-${route}-battle`);await equip(page,'Orrin','Counterweighted return valve');
  await approach(page,'works-evacuate');await untilScene(page,'four-road');await capture(page,`petra-road-${device}`);await dialogue(page);expect((await inspect(page)).state.activeParty).toEqual(['petra','celia']);
  await approach(page,'sanctuary-patrol');await battle(page,`petra-celia-battle-${device}`);await equip(page,'Petra','Braced rescue coat');expect((await inspect(page)).state.activeParty[0]).toBe('celia');await capture(page,`celia-leads-${device}`);
  await approach(page,'sanctuary-seal');await untilScene(page,'four-reunion');await capture(page,`broken-reunion-${device}`);await dialogue(page);expect((await inspect(page)).state.activeParty).toEqual(departure.activeParty);
  await page.getByRole('button',{name:'Equipment',exact:true}).click();await page.getByRole('button',{name:'Kit',exact:true}).click();await page.getByRole('button',{name:'Move to reserve',exact:true}).click();await page.getByRole('button',{name:'Celia',exact:true}).click();await page.getByRole('button',{name:'Set active',exact:true}).click();await capture(page,`reunited-equipment-${device}`);await page.getByRole('button',{name:'Close',exact:true}).click();
  await approach(page,'refuge-rest');await page.getByRole('button',{name:'Rest · restore everyone’s HP and focus',exact:true}).click();
  await travel(page,'refuge-sanctuary','sanctuary');await nativeScene(page,'sanctuary');await capture(page,`warden-threshold-${device}`);await dialogue(page);
  await visit(page,'sanctuary-chest');await equip(page,'Celia','Silver field clasp');await approach(page,'sanctuary-warden');await battle(page,`sanctuary-warden-battle-${device}`);await equip(page,'Nell','Guardian prism');
  await approach(page,'sanctuary-record');await capture(page,`hollow-sun-record-${device}`);await dialogue(page);await travel(page,'sanctuary-refuge','refuge');
  await approach(page,'refuge-tomas');await choices(page);await page.getByRole('button',{name:'Rest and prepare our equipment first',exact:true}).click();expect((await inspect(page)).state.boundary).toBeNull();
  await approach(page,'refuge-tomas');await choices(page);await page.getByRole('button',{name:'Lead the counterattack · leave for the western airfield',exact:true}).click();await expect(page.getByRole('heading',{name:'Chapter Four complete',exact:true})).toBeVisible();await capture(page,`chapter-four-complete-${device}`);
  const saved=(await inspect(page)).state;expect(saved.flags.tomasRescued).toBe(true);expect(saved.activeParty).toEqual(['nell','petra','celia']);expect(saved.inventory.characters.orrin.fitting).toBe('return-valve');expect(saved.inventory.characters.celia.fitting).toBe('field-clasp');expect(saved.inventory.characters.nell.fitting).toBe('sun-prism');expect(saved.inventory.characters.petra.coat).toBe('rescue-coat');
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'Export departure save',exact:true}).click();const exported=JSON.parse(await readFile((await(await download).path())!,'utf8'));expect(exported.version).toBe(10);expect(exported.boundary).toBe('chapter-five:anchors');expect(exported.inventory).toEqual(saved.inventory);
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect(page.getByRole('heading',{name:'Chapter Four complete',exact:true})).toBeVisible();expect((await inspect(page)).state.inventory).toEqual(saved.inventory);expect(errors).toEqual([]);
 });
}
