import { CHAPTER_TWO_AVAILABLE,CHAPTER_THREE_AVAILABLE,CHAPTER_FOUR_AVAILABLE } from '../../src/content/chapters';
import { expect, test } from '@playwright/test';
import { readFile, readdir } from 'node:fs/promises';
import { coastCheckpoint, palaceCheckpoint, brokenCheckpoint, checkpoint } from '../support/progress';
import { equipItem, receiveItem } from '../../src/rules/inventory';
import { importSave, approach } from './navigation';
import { capture, inspect, dialogue, clickWorld } from './controls';
import { travel } from './navigation';

test('@ci production ignores all workshop routes and omits its controls and progression', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  for (const route of ['workshop', 'inventory', 'music', 'sprites', 'animation', 'maps', 'boss']) {
    await page.goto(`/?dev=${route}`);
    await expect(page).toHaveTitle('Borrowed Tomorrow');
    await expect(page.getByRole('button', { name: 'Begin Chapter One', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Workshop', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button',{name:'Begin Chapter Two (canonical)',exact:true})).toHaveCount(0);
    await expect(page.getByRole('button',{name:'Begin Chapter Three (canonical)',exact:true})).toHaveCount(0);
    await expect(page.getByRole('region', { name: 'Character workshop' })).toHaveCount(0);
    await expect(page.getByRole('group', { name: 'Development battle tools' })).toHaveCount(0);
  }
  const files = await readdir('dist/assets');
  const built = (await Promise.all(files.filter(f => /\.(js|css)$/.test(f)).map(f => readFile(`dist/assets/${f}`, 'utf8')))).join('\n');
  for (const devOnly of ['Receive one copy', '.inventory-panel', 'Apply base stats', 'Level defaults', 'Invalid character level.', 'character-workshop:v1', 'Knows the coast routes by heart', '.workshop-party', 'Circle of fifths', 'Instrument audition', 'Compare C#4 / Db4', '.music-layout']) expect(built).not.toContain(devOnly);
  for(const devOnly of ['dev-benefactor','Epic boss battle preview','benefactor-page-'])expect(built).not.toContain(devOnly);
  expect(files.some(f=>f.startsWith('benefactor'))).toBe(false);
  expect(errors).toEqual([]);
  for (const devOnly of ['Win battle', 'Lose battle', 'Refill party', 'Restart battle', '.dev-battle-tools', 'Development tools:']) expect(built).not.toContain(devOnly);
  expect(files.some(f=>f.includes('testing-tools')||f.includes('canonical-saves'))).toBe(false);
  expect(built).not.toContain('Begin Chapter Two (canonical)');
  expect(built).not.toContain('Begin Chapter Three (canonical)');
  for(const devOnly of ['Sprite review', 'Ground guides', '.sprite-inspector', 'Preview background'])expect(built).not.toContain(devOnly);
  for(const devOnly of ['Layered reference', 'Reference walker', 'Steam lance (Orrin)', 'Arms and weapon', 'Export pose data', '.animation-review'])expect(built).not.toContain(devOnly);
  for(const devOnly of ['Map review / Layers', 'Copy reference', 'Download view PNG', '.map-review'])expect(built).not.toContain(devOnly);
});

for(const [device,viewport] of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]] as const){
  test(`${device==='desktop'?'@ci ':''}production campaign inventory equips and saves individual loadouts on ${device}`,async({page})=>{
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


for(const [device,viewport] of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]] as const){
 test(`production Chapter Three keeps Tomas safe and equipment through the departure on ${device}`,async({page})=>{
  test.skip(!CHAPTER_THREE_AVAILABLE,'Chapter Three art pack is not installed.');
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await page.setViewportSize(viewport);await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  await importSave(page,coastCheckpoint('chapterTwoComplete'));await page.getByRole('button',{name:'Begin Chapter Three',exact:true}).click();await dialogue(page);
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



for(const [device,viewport] of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]] as const){
 test(`production extraction console from the saved east side on ${device}`,async({page})=>{
  test.skip(!CHAPTER_THREE_AVAILABLE,'Chapter Three art pack is not installed.');
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.setViewportSize(viewport);await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');
  const saved=palaceCheckpoint('conduitGuardWon');saved.location={map:'conduit',x:52,y:22};
  await importSave(page,saved);
  // The marker must be visible in front of the painted gauge panel, not on unrelated floor.
  await expect.poll(()=>page.evaluate(()=>{
   const view=window.borrowedTomorrow.inspect().view,pixels=window.borrowedTomorrowPixels.inspect();
   const source=document.querySelector('.pixel-source')!.getBoundingClientRect(),world=document.querySelector('.world-input')!.getBoundingClientRect();
   const x=pixels.physicalLeft+(Math.round((world.left-source.left)/pixels.cssScale)+47.5*24-view.scrollX-12)*pixels.physicalScale;
   const y=pixels.physicalTop+(Math.round((world.top-source.top)/pixels.cssScale)+20.5*24-9-view.scrollY-18)*pixels.physicalScale;
   const data=document.querySelector<HTMLCanvasElement>('.pixel-output')!.getContext('2d')!.getImageData(x,y,24*pixels.physicalScale,36*pixels.physicalScale).data;
   let gold=0;for(let i=0;i<data.length;i+=4)if(data[i]===244&&data[i+1]===199&&data[i+2]===122)gold++;
   return gold;
  })).toBeGreaterThanOrEqual(90);
  await capture(page,`extraction-console-marker-${device}`);
  // Click the actual panel above the floor, rather than its internal interaction coordinate.
  await clickWorld(page,47,17);await dialogue(page);expect((await inspect(page)).state.flags.extractionStopped).toBe(true);
  await importSave(page,saved);
  // Walk onto the floor at the panel's east side, then use E or the mobile button.
  await clickWorld(page,50,20);
  await expect.poll(async()=>{const s=await inspect(page);return !s.moving&&s.state.location.x===50&&s.state.location.y===20;}).toBe(true);
  await expect(page.locator('.world-objective h3')).toHaveText('Close the extraction feeds');
  await capture(page,`extraction-console-interact-${device}`);
  const interact=page.locator('.interact-action').getByRole('button',{name:/Interact$/});await expect(interact).toBeVisible();
  if(device==='desktop')await page.keyboard.press('e');else await interact.click();await dialogue(page);
  let state=(await inspect(page)).state;expect(state.flags.extractionStopped).toBe(true);expect(state.flags.tomasRescued).toBe(true);expect(state.inventory).toEqual(saved.inventory);expect(state.coins).toBe(saved.coins);expect(state.xp).toBe(saved.xp);
  await approach(page,'capital-departure');await dialogue(page);await expect(page.getByRole('heading',{name:'Chapter Three complete',exact:true})).toBeVisible();
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();
  await expect.poll(async()=>(await inspect(page)).state.boundary).toBe('chapter-four:broken-world');state=(await inspect(page)).state;
  expect(state.inventory).toEqual(saved.inventory);expect(errors).toEqual([]);
 });
}

for(const [device,viewport] of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]] as const){
 test(`production Chapter Four preserves viewpoints, reunion and the anchor departure on ${device}`,async({page})=>{
  test.skip(!CHAPTER_FOUR_AVAILABLE,'Chapter Four art pack is not installed.');
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.setViewportSize(viewport);await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');
  const old=palaceCheckpoint('chapterThreeComplete');old.activeParty=['nell','petra','kit'];old.party[1].hp=17;old.party[1].focus=2;equipItem(old.inventory,'nell','silver-reflector');
  await importSave(page,old);await page.getByRole('button',{name:'Begin Chapter Four',exact:true}).click();await dialogue(page);
  expect((await inspect(page)).state).toMatchObject({inventory:old.inventory,party:old.party,activeParty:['nell'],reunionParty:old.activeParty});await capture(page,`chapter-four-production-arrival-${device}`);
  await approach(page,'refuge-tomas');await page.getByRole('button',{name:'Read Orrin’s signal',exact:true}).click();await dialogue(page);expect((await inspect(page)).state.activeParty).toEqual(['orrin','kit']);
  await page.getByRole('button',{name:'Equipment',exact:true}).click();await expect(page.getByRole('group',{name:'Character',exact:true}).getByRole('button',{name:'Orrin',exact:true})).toHaveAttribute('aria-pressed','true');await expect(page.getByRole('button',{name:'Set active',exact:true})).toHaveCount(0);await page.getByRole('button',{name:'Close',exact:true}).click();
  const search=brokenCheckpoint('roadGuardWon');search.reunionParty=old.activeParty;await importSave(page,search);await expect.poll(async()=>(await inspect(page)).state.activeParty).toEqual(['celia','petra']);
  await page.getByRole('button',{name:'Equipment',exact:true}).click();await page.locator('.ci-items').getByRole('button',{name:/^Braced rescue coat/}).click();await page.getByRole('button',{name:'Equip on Celia',exact:true}).click();await capture(page,`celia-local-equipment-production-${device}`);await page.getByRole('button',{name:'Close',exact:true}).click();
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).state.activeParty[0]).toBe('celia');expect((await inspect(page)).state.inventory.characters.celia.coat).toBe('rescue-coat');
  await approach(page,'sanctuary-seal');await dialogue(page);expect((await inspect(page)).state.activeParty).toEqual(old.activeParty);expect((await inspect(page)).state.reunionParty).toBeNull();expect((await inspect(page)).state.party).toHaveLength(5);
  const deep=brokenCheckpoint('sanctuaryWardenWon');deep.activeParty=old.activeParty;equipItem(deep.inventory,'celia','rescue-coat');equipItem(deep.inventory,'nell','sun-prism');await importSave(page,deep);
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).state.location.map).toBe('sanctuary');
  await approach(page,'sanctuary-record');await dialogue(page);await travel(page,'sanctuary-refuge','refuge');await approach(page,'refuge-tomas');await dialogue(page);
  await expect(page.getByRole('heading',{name:'Chapter Four complete',exact:true})).toBeVisible();await capture(page,`chapter-four-production-complete-${device}`);const saved=(await inspect(page)).state;
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).state.boundary).toBe('chapter-five:anchors');expect((await inspect(page)).state.inventory).toEqual(saved.inventory);expect((await inspect(page)).state.flags.tomasRescued).toBe(true);
  await expect(page.getByRole('button',{name:'Win battle',exact:true})).toHaveCount(0);await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 });
}

test('a source checkpoint without sanctuary art keeps the Broken World departure exportable',async({page})=>{
 test.skip(CHAPTER_FOUR_AVAILABLE,'The complete sanctuary art pack is installed.');
 await page.goto('/');await importSave(page,palaceCheckpoint('chapterThreeComplete'));
 await expect(page.getByRole('heading',{name:'Chapter Three complete',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Begin Chapter Four',exact:true})).toHaveCount(0);await expect(page.getByRole('button',{name:'Export departure save',exact:true})).toBeVisible();expect((await inspect(page)).state.boundary).toBe('chapter-four:broken-world');
});
