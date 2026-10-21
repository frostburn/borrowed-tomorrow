import { test,expect,type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { equipItem } from '../../src/rules/inventory';
import { brokenCheckpoint,palaceCheckpoint } from '../support/progress';
import { approach,importSave,travel,visit } from './navigation';
import { battle,capture,dialogue,inspect,nativeScene } from './controls';
async function choices(page:Page){
 await expect(page.locator('.dialogue')).toBeVisible();
 while(await page.locator('.dialogue-actions').getByRole('button',{name:/Next/}).count())await page.locator('.dialogue-actions').getByRole('button',{name:/Next/}).click();
}
async function equip(page:Page,hero:string,item:string){
 await page.getByRole('button',{name:'Equipment',exact:true}).click();await page.getByRole('group',{name:'Character',exact:true}).getByRole('button',{name:hero,exact:true}).click();
 await page.locator('.ci-items').getByRole('button',{name:new RegExp(`^${item}`)}).click();await page.getByRole('button',{name:`Equip on ${hero}`,exact:true}).click();await page.getByRole('button',{name:'Close',exact:true}).click();
}
for(const [device,viewport] of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]] as const){
 test(`Chapter Four replays Celia’s introduction and keeps formation editable on ${device}`,async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize(viewport);await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  const state=brokenCheckpoint('refugeSeen');state.location={map:'breakwater',x:25,y:29};state.activeParty=['nell','petra','kit'];await importSave(page,state);
  await expect.poll(async()=>(await inspect(page)).cinematic).toBe('four-harbor');expect((await inspect(page)).state.party).toHaveLength(4);await capture(page,`celia-introduction-${device}`);
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('four-harbor');
  await dialogue(page);expect((await inspect(page)).state.party).toHaveLength(5);expect((await inspect(page)).state.activeParty).toEqual(state.activeParty);
  await page.getByRole('button',{name:'Equipment',exact:true}).click();await page.getByRole('group',{name:'Character',exact:true}).getByRole('button',{name:'Kit',exact:true}).click();await page.getByRole('button',{name:'Move to reserve',exact:true}).click();await page.getByRole('group',{name:'Character',exact:true}).getByRole('button',{name:'Celia',exact:true}).click();await page.getByRole('button',{name:'Set active',exact:true}).click();await page.getByRole('button',{name:'Close',exact:true}).click();
  expect((await inspect(page)).state.activeParty).toEqual(['nell','petra','celia']);await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).state.activeParty).toEqual(['nell','petra','celia']);expect(errors).toEqual([]);
 });
}
test('failed sanctuary vectors preserve the exact Chapter Three departure until retry',async({page})=>{
 await page.goto('/');const before=palaceCheckpoint('chapterThreeComplete');await importSave(page,before);await page.route('**/art/vector/chapter-four/sanctuary-ring.svg',route=>route.abort());
 await page.getByRole('button',{name:'Begin Chapter Four',exact:true}).click();await expect(page.getByRole('status')).toContainText('checkpoint is intact');
 expect((await inspect(page)).state).toMatchObject({chapter:'chapter-three',boundary:'chapter-four:broken-world',inventory:before.inventory,party:before.party,activeParty:before.activeParty});
 await page.unroute('**/art/vector/chapter-four/sanctuary-ring.svg');await page.getByRole('button',{name:'Begin Chapter Four',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('four-home');
});
for(const [route,device,viewport] of [['dry','desktop',{width:1280,height:800}],['wet','phone',{width:390,height:844}]] as const){
 test(`@journey rewritten Chapter Four ${route} route frees the harbor and coast on ${device}`,async({page})=>{
  test.setTimeout(600000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize(viewport);await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  const departure=palaceCheckpoint('chapterThreeComplete');departure.activeParty=['nell','petra','kit'];equipItem(departure.inventory,'nell','silver-reflector');equipItem(departure.inventory,'nell','insulated-coat');equipItem(departure.inventory,'petra','saber-hilt');equipItem(departure.inventory,'kit','courier-sight');
  await importSave(page,departure);await page.getByRole('button',{name:'Begin Chapter Four',exact:true}).click();await dialogue(page);await nativeScene(page,'refuge');await capture(page,`refuge-${device}`);
  await travel(page,'refuge-works','breakwater');await dialogue(page);await nativeScene(page,'breakwater');await capture(page,`breakwater-${device}`);expect((await inspect(page)).state.activeParty).toEqual(departure.activeParty);
  await approach(page,'works-cart');await page.getByRole('button',{name:'Leave the cart sealed',exact:true}).click();expect((await inspect(page)).state.flags.worksStoresWon).toBeUndefined();
  if(route==='dry'){await approach(page,'works-cart');await page.getByRole('button',{name:'Open the survey cart · fight its patrol',exact:true}).click();await battle(page,'survey-cart');await equip(page,'Kit','Folding range sight');}
  await approach(page,'works-approach');await choices(page);await page.getByRole('button',{name:route==='dry'?'Take the dry chain walk · ranged crows':'Cross the pump floor · shallow water',exact:true}).click();await battle(page,`sea-gate-${route}`);await equip(page,'Orrin','Counterweighted return valve');
  await approach(page,'works-wheel');await dialogue(page);await capture(page,`harbor-open-${device}`);await travel(page,'works-sanctuary','sanctuary');await dialogue(page);await nativeScene(page,'sanctuary');await capture(page,`signal-sanctuary-${device}`);
  await visit(page,'sanctuary-chest');await equip(page,'Celia','Silver field clasp');await approach(page,'sanctuary-bench');await page.getByRole('button',{name:'Rest · restore everyone’s HP and focus',exact:true}).click();
  await approach(page,'sanctuary-patrol');await battle(page,`return-bridge-${device}`);await equip(page,'Petra','Braced rescue coat');await approach(page,'sanctuary-cable');await dialogue(page);await capture(page,`return-line-cut-${device}`);
  await approach(page,'sanctuary-bench');await page.getByRole('button',{name:'Rest · restore everyone’s HP and focus',exact:true}).click();await approach(page,'sanctuary-warden');await battle(page,`sanctuary-warden-${device}`);await equip(page,'Nell','Guardian prism');
  await approach(page,'sanctuary-record');await capture(page,`covered-chart-${device}`);await dialogue(page);await travel(page,'sanctuary-refuge','refuge');await capture(page,`refuge-supplied-${device}`);
  await approach(page,'refuge-tomas');await choices(page);await capture(page,`sea-wall-choice-${device}`);await page.getByRole('button',{name:'Prepare our equipment first',exact:true}).click();expect((await inspect(page)).state.boundary).toBeNull();
  await approach(page,'refuge-tomas');await choices(page);await page.getByRole('button',{name:'Leave for the western airfield',exact:true}).click();await expect(page.getByRole('heading',{name:'Chapter Four complete',exact:true})).toBeVisible();await capture(page,`chapter-four-complete-${device}`);
  const saved=(await inspect(page)).state;expect(saved.flags.tomasRescued).toBe(true);expect(saved.party).toHaveLength(5);expect(saved.activeParty).toEqual(departure.activeParty);expect(saved.inventory.characters.orrin.fitting).toBe('return-valve');expect(saved.inventory.characters.celia.fitting).toBe('field-clasp');
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'Export departure save',exact:true}).click();const exported=JSON.parse(await readFile((await(await download).path())!,'utf8'));expect(exported.version).toBe(10);expect(exported.boundary).toBe('chapter-five:anchors');expect(exported.inventory).toEqual(saved.inventory);
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect(page.getByRole('heading',{name:'Chapter Four complete',exact:true})).toBeVisible();expect((await inspect(page)).state.inventory).toEqual(saved.inventory);expect(errors).toEqual([]);
 });
}
