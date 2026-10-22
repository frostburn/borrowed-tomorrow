import { CHAPTER_TWO_AVAILABLE,CHAPTER_THREE_AVAILABLE } from '../../src/content/chapters';
import { expect, test } from '@playwright/test';
import { readFile, readdir } from 'node:fs/promises';
import { coastCheckpoint, palaceCheckpoint, brokenCheckpoint, checkpoint } from '../support/progress';
import { equipItem, receiveItem } from '../../src/rules/inventory';
import { importSave, approach } from './navigation';
import { capture, inspect, dialogue, clickWorld, battle } from './controls';
import { travel } from './navigation';
import {sampleRegulator} from './conduit-controls';

test('@ci production ignores all workshop routes and omits its controls and progression', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  for (const route of ['workshop', 'inventory', 'music', 'sprites', 'animation', 'maps', 'boss']) {
    await page.goto(`/?dev=${route}`);
    await expect(page).toHaveTitle('Borrowed Tomorrow');
    await expect(page.getByRole('button', { name: 'Begin Chapter One', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Workshop', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button',{name:'Begin Chapter Two (canonical)',exact:true})).toHaveCount(0);
    await expect(page.getByRole('button',{name:'Begin Chapter Three (canonical)',exact:true})).toHaveCount(0);
    await expect(page.getByRole('button',{name:'Begin Chapter Four (canonical)',exact:true})).toHaveCount(0);
    await expect(page.getByRole('button',{name:'Begin Chapter Five (canonical)',exact:true})).toHaveCount(0);
    await expect(page.getByRole('region', { name: 'Character workshop' })).toHaveCount(0);
    await expect(page.getByRole('group', { name: 'Development battle tools' })).toHaveCount(0);
  }
  const files = await readdir('dist/assets');
  const built = (await Promise.all(files.filter(f => /\.(js|css)$/.test(f)).map(f => readFile(`dist/assets/${f}`, 'utf8')))).join('\n');
  for (const devOnly of ['Receive one copy', '.inventory-panel', 'Apply base stats', 'Level defaults', 'Invalid character level.', 'character-workshop:v1', 'Knows the coast routes by heart', '.workshop-party', 'Circle of fifths', 'Instrument audition', 'Compare C#4 / Db4', '.music-layout']) expect(built).not.toContain(devOnly);
  for(const devOnly of ['dev-benefactor','Epic boss battle preview','benefactor-motion','dev-conduit-feeds','dev-conduit-pressure','dev-flagship','devFlagship','flagship-port','Start Chapter Five preset'])expect(built).not.toContain(devOnly);
  expect(files.some(f=>f.startsWith('benefactor')||f.startsWith('flagship'))).toBe(false);
  expect(errors).toEqual([]);
  for (const devOnly of ['Win battle', 'Lose battle', 'Refill party', 'Restart battle', '.dev-battle-tools', 'Development tools:']) expect(built).not.toContain(devOnly);
  expect(files.some(f=>f.includes('testing-tools')||f.includes('canonical-saves'))).toBe(false);
  expect(built).not.toContain('Begin Chapter Two (canonical)');
  expect(built).not.toContain('Begin Chapter Three (canonical)');
  expect(built).not.toContain('Begin Chapter Four (canonical)');
  expect(built).not.toContain('Begin Chapter Five (canonical)');
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
  // The marker stays visible at the gauge panel's registered approach.
  await expect.poll(()=>page.evaluate(()=>{
   const view=window.borrowedTomorrow.inspect().view,pixels=window.borrowedTomorrowPixels.inspect();
   const source=document.querySelector('.pixel-source')!.getBoundingClientRect(),world=document.querySelector('.world-input')!.getBoundingClientRect();
   const x=pixels.physicalLeft+(Math.round((world.left-source.left)/pixels.cssScale)+47.5*24-view.scrollX-12)*pixels.physicalScale;
   const y=pixels.physicalTop+(Math.round((world.top-source.top)/pixels.cssScale)+20.5*24-9-view.scrollY-18)*pixels.physicalScale;
   const data=document.querySelector<HTMLCanvasElement>('.pixel-output')!.getContext('2d')!.getImageData(x,y,24*pixels.physicalScale,36*pixels.physicalScale).data;
   let gold=0;for(let i=0;i<data.length;i+=4)if(data[i]===244&&data[i+1]===199&&data[i+2]===122)gold++;
   // This registered diamond occupies 80 logical output pixels after the
   // shared 2px raster. Normalize physical scaling and require the exact count.
   return {gold:gold/(pixels.physicalScale**2),raster:pixels.rasterUnit};
  })).toEqual({gold:80,raster:2});
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
 test(`production Chapter Four preserves the roster and completes the new anchor departure on ${device}`,async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await page.setViewportSize(viewport);await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  const old=palaceCheckpoint('chapterThreeComplete');old.activeParty=['nell','petra','kit'];old.party[1].hp=17;old.party[1].focus=2;equipItem(old.inventory,'nell','silver-reflector');
  await importSave(page,old);await page.getByRole('button',{name:'Begin Chapter Four',exact:true}).click();await dialogue(page);
  expect((await inspect(page)).state).toMatchObject({inventory:old.inventory,party:old.party,activeParty:old.activeParty});await capture(page,`chapter-four-production-arrival-${device}`);
  await travel(page,'refuge-works','breakwater');await dialogue(page);expect((await inspect(page)).state.activeParty).toEqual(old.activeParty);expect((await inspect(page)).state.party).toHaveLength(5);
  const deep=brokenCheckpoint('signalCut');deep.activeParty=['nell','petra','celia'];deep.bandages=15;equipItem(deep.inventory,'celia','rescue-coat');equipItem(deep.inventory,'nell','silver-reflector');equipItem(deep.inventory,'petra','saber-hilt');await importSave(page,deep);
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).state.location.map).toBe('sanctuary');
  await approach(page,'sanctuary-bench');await page.getByRole('button',{name:'Rest · restore everyone’s HP and focus',exact:true}).click();await approach(page,'sanctuary-warden');await battle(page,`production-sanctuary-warden-${device}`);expect((await inspect(page)).state.inventory.bag['sun-prism']).toBe(1);
  await approach(page,'sanctuary-record');await dialogue(page);await travel(page,'sanctuary-refuge','refuge');await approach(page,'refuge-tomas');await dialogue(page);
  await expect(page.getByRole('heading',{name:'Chapter Four complete',exact:true})).toBeVisible();await capture(page,`chapter-four-production-complete-${device}`);const saved=(await inspect(page)).state;
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).state.boundary).toBe('chapter-five:anchors');expect((await inspect(page)).state.inventory).toEqual(saved.inventory);expect((await inspect(page)).state.flags.tomasRescued).toBe(true);
  await expect(page.getByRole('button',{name:'Win battle',exact:true})).toHaveCount(0);await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 });
}

for(const [route,viewport,dpr] of [['feeds',{width:1280,height:800},1],['pressure',{width:390,height:844},1.25]] as const){
 test(`production three-hex conduit guardian resolves ${route} and preserves the escape handoff`,async({browser})=>{
  const {battle,clickHex}=await import('./controls');const {occupiedHexes}=await import('../../src/rules/footprint');const {offset}=await import('../../src/rules/hex');
  const context=await browser.newContext({viewport,deviceScaleFactor:dpr,reducedMotion:'reduce'}),page=await context.newPage();
  try{
   const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   const before=palaceCheckpoint('conduitSeen');before.flags.pressureRoute=route==='pressure';equipItem(before.inventory,'nell','silver-reflector');equipItem(before.inventory,'orrin','work-coat');equipItem(before.inventory,'kit','courier-sight');
   await page.goto('/');await importSave(page,before);await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).state.location.map).toBe('conduit');await approach(page,'heart-regulator');
   const initial=await inspect(page),boss=initial.battle!.units.find(u=>u.id==='conduit-regulator')!;expect(occupiedHexes(boss)).toHaveLength(3);expect(boss.anchored).toBe(true);expect(boss.intent!.name).toBe('Pressure lock');
   expect(initial.battle!.units.filter(u=>u.side==='party').map(u=>u.id)).toEqual(before.activeParty);expect(initial.actors.filter(a=>before.activeParty.some(id=>id===a.hero)).every(a=>a.texture.endsWith('-back'))).toBe(true);
   await expect(page.getByRole('group',{name:'Development battle tools'})).toHaveCount(0);
   if(route==='feeds'){await page.emulateMedia({reducedMotion:'no-preference'});await page.mouse.move(0,0);const frames=await sampleRegulator(page,1800);expect(frames.every(s=>s.motion==='mechanical')).toBe(true);expect(new Set(frames.map(s=>s.pixels)).size).toBeGreaterThan(3);expect(new Set(frames.map(s=>s.chassis)).size).toBe(1);expect(new Set(frames.map(s=>s.drive)).size).toBeGreaterThan(3);await page.emulateMedia({reducedMotion:'reduce'});}
   else expect(await page.locator('.battle-pan').evaluate(el=>getComputedStyle(el).top)).toBe('50px');
   await capture(page,`campaign-regulator-${route}`);
   await page.getByRole('button',{name:/^3\s+Quick shot$/}).click();
   const view=initial.view,box=(await page.locator('#canvas canvas').boundingBox())!;await page.mouse.click(box.x+(463-view.scrollX)*box.width/view.width,box.y+150*box.height/view.height);await expect(page.locator('#confirmation')).toContainText('Heart regulator');
   await page.getByRole('button',{name:/^1\s+Move$/}).click();await clickHex(page,offset(route==='feeds'?7:6,5));
   await battle(page);const won=(await inspect(page)).state;
   expect(won.flags).toMatchObject({conduitGuardWon:true,tomasRescued:true});expect(won.xp).toBe(before.xp+135);expect(won.coins).toBe(before.coins+80);expect(won.inventory.bag['insulated-coat']).toBe(1);expect(won.inventory.characters).toEqual(before.inventory.characters);expect(won.activeParty).toEqual(before.activeParty);
   await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).state.flags.conduitGuardWon).toBe(true);expect((await inspect(page)).state.inventory).toEqual(won.inventory);
   await approach(page,'heart-release');await dialogue(page);expect((await inspect(page)).state.flags).toMatchObject({emperorMerged:true,extractionStopped:true,tomasRescued:true});expect((await inspect(page)).state.inventory).toEqual(won.inventory);await capture(page,`campaign-regulator-escape-${route}`);expect(errors).toEqual([]);
  }finally{await context.close();}
 });
}

test('production sealed intake rejects a solo formation before combat',async({page})=>{
 const saved=palaceCheckpoint('conduitSeen');saved.activeParty=['nell'];await page.goto('/');await importSave(page,saved);await approach(page,'heart-regulator');
 await expect(page.getByRole('status')).toContainText('two active companions');expect((await inspect(page)).mode).toBe('world');
 await page.getByRole('button',{name:'Equipment',exact:true}).click();await page.getByRole('button',{name:'Kit',exact:true}).click();await page.getByRole('button',{name:'Set active',exact:true}).click();await page.getByRole('button',{name:'Close',exact:true}).click();await approach(page,'heart-regulator');expect((await inspect(page)).battle?.encounter).toBe('heart-feeds');
});

test('production guardian defeat retries a fresh machine without granting progress',async({page})=>{
 const {active}=await import('../../src/rules/combat');
 const saved=palaceCheckpoint('conduitSeen');saved.activeParty=['nell','kit'];for(const hero of saved.party)hero.hp=1;
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await importSave(page,saved);await approach(page,'heart-regulator');
 for(let i=0;i<16;i++){
  await expect.poll(async()=>{const s=await inspect(page);return !!s.battle!.result||!s.busy&&active(s.battle! as unknown as import('../../src/rules/combat').Battle)?.side==='party';}).toBe(true);
  if((await inspect(page)).battle!.result)break;
  await page.getByRole('button',{name:/^F\s+Defend$/}).click();
 }
 await expect(page.getByRole('heading',{name:'The line can wait',exact:true})).toBeVisible();await page.getByRole('button',{name:'Retry battle',exact:true}).click();
 const retried=await inspect(page),boss=retried.battle!.units.find(u=>u.id==='conduit-regulator')!;expect(retried.battle!.round).toBe(1);expect(boss.hp).toBe(210);expect(boss.sealed).toBe(true);expect(retried.state.flags.conduitGuardWon).toBeUndefined();expect(retried.state.xp).toBe(saved.xp);expect(retried.state.inventory).toEqual(saved.inventory);
});

test('production missing regulator SVG keeps the capital departure intact for retry',async({page})=>{
 await page.route('**/art/vector/bosses/conduit-regulator-motion.svg',r=>r.abort());await page.goto('/');const before=coastCheckpoint('chapterTwoComplete');await importSave(page,before);await page.getByRole('button',{name:'Begin Chapter Three',exact:true}).click();
 await expect(page.getByRole('status')).toContainText('checkpoint is intact');expect((await inspect(page)).state).toMatchObject({chapter:'chapter-two',boundary:'chapter-three:capital',inventory:before.inventory});
 await page.unroute('**/art/vector/bosses/conduit-regulator-motion.svg');await page.getByRole('button',{name:'Begin Chapter Three',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('three-capital');
});

test('production Chapter Five continues the coast departure and supports deep Act I saves without dev tools',async({page})=>{
 const {anchorDeparture,anchorCheckpoint}=await import('../support/anchors');const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');const before=anchorDeparture();before.activeParty=['nell','petra','celia'];before.party[0].hp=61;before.party[1].focus=2;await importSave(page,before);
 await page.getByRole('button',{name:'Begin Chapter Five',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('five-airfield');await page.getByRole('button',{name:'Skip scene',exact:true}).click();
 expect((await inspect(page)).state).toMatchObject({chapter:'chapter-five',boundary:null,party:before.party,activeParty:before.activeParty,inventory:before.inventory});
 const saved=anchorCheckpoint('furnaceWon');saved.location={map:'anchorforge',x:32,y:23};await importSave(page,saved);await approach(page,'forge-anchor');await page.getByRole('button',{name:'Skip scene',exact:true}).click();expect((await inspect(page)).state.flags.hammerplainFreed).toBe(true);
 await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).state.flags.hammerplainFreed).toBe(true);expect((await inspect(page)).state.inventory).toEqual(saved.inventory);await expect(page.getByRole('button',{name:'Win battle',exact:true})).toHaveCount(0);await expect(page.getByRole('button',{name:'Begin Chapter Five (canonical)',exact:true})).toHaveCount(0);expect(errors).toEqual([]);
});
