import { CHAPTER_TWO_AVAILABLE,CHAPTER_THREE_AVAILABLE } from '../../src/content/chapters';
import { expect, test } from '@playwright/test';
import { readFile, readdir } from 'node:fs/promises';
import { coastCheckpoint, palaceCheckpoint, checkpoint } from '../support/progress';
import { equipItem, receiveItem } from '../../src/rules/inventory';
import { recruit } from '../../src/rules/state';
import { importSave, approach } from './navigation';
import { capture, inspect, dialogue } from './controls';

test('production ignores both workshop routes and omits its controls and progression', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  for (const route of ['workshop', 'inventory']) {
    await page.goto(`/?dev=${route}`);
    await expect(page).toHaveTitle('Borrowed Tomorrow');
    await expect(page.getByRole('button', { name: 'Begin Chapter One', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Workshop', exact: true })).toHaveCount(0);
    await expect(page.getByRole('region', { name: 'Character workshop' })).toHaveCount(0);
    await expect(page.getByRole('group', { name: 'Development battle tools' })).toHaveCount(0);
  }
  const files = await readdir('dist/assets');
  const built = (await Promise.all(files.filter(f => /\.(js|css)$/.test(f)).map(f => readFile(`dist/assets/${f}`, 'utf8')))).join('\n');
  for (const devOnly of ['Receive one copy', '.inventory-panel', 'Apply base stats', 'Level defaults', 'Invalid character level.', 'character-workshop:v1', 'Knows the coast routes by heart', '.workshop-party']) expect(built).not.toContain(devOnly);
  expect(errors).toEqual([]);
  for (const devOnly of ['Win battle', 'Lose battle', 'Refill party', 'Restart battle', '.dev-battle-tools', 'Development tools:']) expect(built).not.toContain(devOnly);
  expect(files.some(f=>f.includes('testing-tools'))).toBe(false);
});

for(const [device,viewport] of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]] as const){
  test(`production campaign inventory equips and saves individual loadouts on ${device}`,async({page})=>{
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
    await page.setViewportSize(viewport);await page.goto('/');
    const state=checkpoint('orrinJoined');receiveItem(state.inventory,'brass-reflector');receiveItem(state.inventory,'heavy-coat');receiveItem(state.inventory,'work-coat');
    await importSave(page,state);await page.getByRole('button',{name:'Equipment',exact:true}).click();
    const inventory=page.getByRole('dialog',{name:'Character inventory'});
    await inventory.getByRole('button',{name:/^Brass reflector/}).click();await inventory.getByRole('button',{name:'Equip on Nell',exact:true}).click();
    await inventory.getByRole('button',{name:/^Heavy work coat/}).click();await inventory.getByRole('button',{name:'Equip on Nell',exact:true}).click();
    await inventory.getByRole('group',{name:'Character',exact:true}).getByRole('button',{name:'Orrin',exact:true}).click();
    await inventory.getByRole('button',{name:/^Reinforced work coat/}).click();await inventory.getByRole('button',{name:'Equip on Orrin',exact:true}).click();
    await capture(page,`campaign-inventory-production-${device}`);
    const saved=(await inspect(page)).state.inventory;expect(saved.characters.nell).toEqual({fitting:'brass-reflector',coat:'heavy-coat'});expect(saved.characters.orrin).toEqual({fitting:null,coat:'work-coat'});
    await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();
    await expect.poll(async()=>(await inspect(page)).state.inventory).toEqual(saved);
    await expect(page.getByRole('button',{name:'Win battle',exact:true})).toHaveCount(0);expect(errors).toEqual([]);
  });
}


for(const [device,viewport] of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]] as const){
  test(`production Chapter Two recruits only Kit and preserves equipment and formation on ${device}`,async({page})=>{
    test.skip(!CHAPTER_TWO_AVAILABLE,'Chapter Two art pack is not installed.');
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize(viewport);await page.goto('/');await importSave(page,checkpoint('chapterOneComplete'));
    await page.getByRole('button',{name:'Begin Chapter Two',exact:true}).click();await dialogue(page);await approach(page,'kit-contact');await dialogue(page);
    expect((await inspect(page)).state.activeParty).toEqual(['nell','orrin','kit']);
    const ward=coastCheckpoint('wardSeen');await page.getByRole('button',{name:'Save',exact:true}).click();
    const chooser=page.waitForEvent('filechooser');await page.getByRole('button',{name:'Import save file',exact:true}).click();await(await chooser).setFiles({name:'ward.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(ward))});
    await expect(page.getByRole('dialog')).toHaveCount(0);await page.getByRole('button',{name:'Equipment',exact:true}).click();await page.getByRole('button',{name:'Kit',exact:true}).click();await page.getByRole('button',{name:'Equip on Kit',exact:true}).click();
    await expect(page.getByRole('button',{name:'Celia',exact:true})).toHaveCount(0);await page.getByRole('button',{name:'Orrin',exact:true}).click();await page.getByRole('button',{name:'Move to reserve',exact:true}).click();
    await capture(page,`chapter-two-production-${device}`);const saved=(await inspect(page)).state;
    await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).state.activeParty).toEqual(['nell','kit']);expect((await inspect(page)).state.inventory).toEqual(saved.inventory);
    expect((await inspect(page)).state.party).toHaveLength(3);await expect(page.getByRole('button',{name:'Win battle',exact:true})).toHaveCount(0);expect(errors).toEqual([]);
  });
}


test('a source checkpoint without the art pack preserves the Iron Coast departure',async({page})=>{
  test.skip(CHAPTER_TWO_AVAILABLE,'The full art pack is installed in this build.');
  await page.goto('/');await importSave(page,checkpoint('chapterOneComplete'));
  await expect(page.getByRole('heading',{name:'Chapter One complete',exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Begin Chapter Two',exact:true})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Export departure save',exact:true})).toBeVisible();
  expect((await inspect(page)).state.boundary).toBe('chapter-two:iron-coast');
});


test('the earlier v7 ward save keeps its gear and progress with three travelers',async({page})=>{
  test.skip(!CHAPTER_TWO_AVAILABLE,'Chapter Two art pack is not installed.');
  await page.setViewportSize({width:390,height:844});await page.goto('/');
  const old=coastCheckpoint('wardSeen');recruit(old,'celia');old.activeParty=['nell','kit','celia'];
  receiveItem(old.inventory,'medic-clasp');equipItem(old.inventory,'celia','medic-clasp');
  receiveItem(old.inventory,'work-coat');equipItem(old.inventory,'celia','work-coat');
  await importSave(page,{...old,version:7});const migrated=(await inspect(page)).state;
  expect(migrated.version).toBe(9);expect(migrated.party.map(h=>h.id)).toEqual(['nell','orrin','kit']);
  expect(migrated.activeParty).toEqual(['nell','kit','orrin']);expect(migrated.flags.wardSeen).toBe(true);
  expect(migrated.coins).toBe(old.coins);expect(migrated.xp).toBe(old.xp);
  expect(migrated.inventory.bag['medic-clasp']).toBe(1);expect(migrated.inventory.bag['work-coat']).toBe(1);
  await page.getByRole('button',{name:'Equipment',exact:true}).click();
  await expect(page.getByRole('group',{name:'Character',exact:true}).getByRole('button',{name:'Celia',exact:true})).toHaveCount(0);
  await capture(page,'legacy-ward-three-travelers-phone');
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();
  await expect.poll(async()=>(await inspect(page)).state.inventory).toEqual(migrated.inventory);
  expect((await inspect(page)).state.party).toEqual(migrated.party);
});


for(const [device,viewport] of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]] as const){
 test(`production Chapter Three keeps Tomas safe and equipment through the departure on ${device}`,async({page})=>{
  test.skip(!CHAPTER_THREE_AVAILABLE,'Chapter Three art pack is not installed.');
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await page.setViewportSize(viewport);await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  await importSave(page,{...coastCheckpoint('chapterTwoComplete'),version:8});await page.getByRole('button',{name:'Begin Chapter Three',exact:true}).click();await dialogue(page);
  await importSave(page,palaceCheckpoint('worksWardenWon'));await approach(page,'works-tomas');await dialogue(page);expect((await inspect(page)).state.flags.tomasRescued).toBe(true);
  await page.getByRole('button',{name:'Equipment',exact:true}).click();await page.getByRole('button',{name:'Nell',exact:true}).click();await page.locator('.ci-items').getByRole('button',{name:/^Silver reflector/}).click();await page.getByRole('button',{name:'Equip on Nell',exact:true}).click();await capture(page,`silver-reflector-production-${device}`);await page.getByRole('button',{name:'Close',exact:true}).click();
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).state.inventory.characters.nell.fitting).toBe('silver-reflector');
  await importSave(page,palaceCheckpoint('conduitGuardWon'));await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).state.location.map).toBe('conduit');
  await page.getByRole('button',{name:'Equipment',exact:true}).click();await page.getByRole('button',{name:'Kit',exact:true}).click();await page.locator('.ci-items').getByRole('button',{name:/^Insulated work coat/}).click();await page.getByRole('button',{name:'Equip on Kit',exact:true}).click();await page.getByRole('button',{name:'Close',exact:true}).click();
  await approach(page,'heart-release');await dialogue(page);expect((await inspect(page)).state.flags.tomasRescued).toBe(true);
  await expect.poll(()=>page.evaluate(()=>document.querySelector('canvas')!==null)).toBe(true);await approach(page,'capital-departure');await dialogue(page);
  await expect(page.getByRole('heading',{name:'Chapter Three complete',exact:true})).toBeVisible();await capture(page,`chapter-three-production-${device}`);const saved=(await inspect(page)).state;
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect(page.getByRole('heading',{name:'Chapter Three complete',exact:true})).toBeVisible();expect((await inspect(page)).state.inventory).toEqual(saved.inventory);expect((await inspect(page)).state.flags.tomasRescued).toBe(true);expect(errors).toEqual([]);
 });
}

test('a source checkpoint without the chamber art preserves the capital departure',async({page})=>{
 test.skip(CHAPTER_THREE_AVAILABLE,'The complete chamber art pack is installed.');
 await page.goto('/');const saved=coastCheckpoint('chapterTwoComplete');await importSave(page,{...saved,version:8});
 await expect(page.getByRole('heading',{name:'Chapter Two complete',exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'Begin Chapter Three',exact:true})).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Export departure save',exact:true})).toBeVisible();
 expect((await inspect(page)).state.boundary).toBe('chapter-three:capital');expect((await inspect(page)).state.inventory).toEqual(saved.inventory);
});
