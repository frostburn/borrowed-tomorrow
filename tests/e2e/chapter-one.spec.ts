import { expect, test } from '@playwright/test';
import { newGame } from '../../src/rules/state';
import { checkpoint } from '../support/progress';
import { battle, capture, dialogue, inspect, clickHex, nativeScene, nativeActor } from './controls';
import { approach, importSave, travel, visit } from './navigation';
import { active, type Battle } from '../../src/rules/combat';
import {phoneConsole,rotateWithPlan,touchPan,phoneWorldVisible} from './phone-layout-flow';
import {commandsFit} from './battle-menu-flow';
import {coastCheckpoint} from '../support/progress';
import {newSkillBook} from '../../src/rules/skills';
import {restoreParty} from '../../src/rules/state';

function errorsOn(page: import('@playwright/test').Page) {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); }); return errors;
}

async function begin(page: import('@playwright/test').Page) {
  await page.goto('/'); await expect(page).toHaveTitle('Borrowed Tomorrow');
  await page.getByRole('button', { name: 'Begin Chapter One' }).click(); await dialogue(page);
}

test('@ci opening, interrupted raid and skip keep a coherent checkpoint on a phone', async ({ page }) => {
  const errors = errorsOn(page); await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/'); await page.getByRole('button', { name: 'Begin Chapter One' }).click();
  await expect.poll(async () => (await inspect(page)).cinematic).toBe('one-festival');
  await nativeScene(page, 'station'); await capture(page, 'opening-phone');
  const stage=await page.locator('.stage-wrap').boundingBox(),dialog=await page.locator('.dialogue').boundingBox();
  expect(dialog!.y,'portrait dialogue leaves the world visible').toBeGreaterThanOrEqual(stage!.y+stage!.height);
  expect(await page.locator('.dialogue-portrait').evaluate(e=>e.clientWidth)).toBe(128);
  const copy=await page.locator('.dialogue-copy p').boundingBox(),face=await page.locator('.dialogue-portrait').boundingBox();
  expect(copy!.y,'dialogue text uses the full width below the portrait').toBeGreaterThanOrEqual(face!.y+face!.height);
  expect(copy!.width).toBeGreaterThan(330);
  await page.reload(); await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect.poll(async () => (await inspect(page)).cinematic).toBe('one-festival');
  await page.getByRole('button', { name: 'Skip scene' }).click();
  expect((await inspect(page)).state.flags.festivalSeen).toBe(true);
  await approach(page, 'tomas'); await expect(page.locator('.dialogue')).toBeVisible();
  await expect.poll(async () => (await inspect(page)).cinematic).toBe('one-raid');
  await expect(page.getByRole('button', { name: 'Skip scene' })).toBeInViewport();
  await capture(page, 'raid-phone');
  await page.reload(); await page.getByRole('button', { name: 'Continue', exact: true }).click();
  expect((await inspect(page)).state.flags.raidSeen).toBeUndefined();
  await approach(page, 'tomas'); await expect(page.locator('.dialogue')).toBeVisible();
  await page.getByRole('button', { name: 'Skip scene' }).click();
  const state = (await inspect(page)).state;
  expect(state.flags.raidSeen).toBe(true); expect(state.journal.filter(id => id === 'raid')).toHaveLength(1);
  expect(state.party.map(h => h.id)).toEqual(['nell']);
  await visit(page, 'memorial');
  await page.getByRole('button', { name: 'Journal', exact: true }).first().click();
  await expect(page.getByRole('dialog')).toContainText('They took Tomas'); await page.getByRole('button', { name: 'Close', exact: true }).click();
  await approach(page, 'pursuit'); await expect.poll(async () => (await inspect(page)).mode).toBe('battle');
  await nativeScene(page, 'station', 144); await capture(page, 'escape-phone');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});



test('@ci unsupported save versions cannot resume or import', async ({ page }) => {
  const errors = errorsOn(page); await page.goto('/');
  await page.waitForFunction(()=>!!window.borrowedTomorrow);
  const old = { ...newGame(), version: 9 };
  await page.evaluate(async state => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('borrowed-tomorrow', 1);
      request.onsuccess = () => {
        const db = request.result, tx = db.transaction('saves', 'readwrite');
        tx.objectStore('saves').put({ slot: 'slot-1', savedAt: new Date().toISOString(), state });
        tx.oncomplete = () => { db.close(); resolve(); }; tx.onerror = () => reject(tx.error);
      };
    });
  }, old);
  await page.reload(); await expect(page.getByRole('button', { name: 'Continue', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Save files', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.locator('[data-slot="slot-1"]').getByRole('button', { name: 'Load', exact: true })).toBeDisabled();
  const chooser = page.waitForEvent('filechooser'); await page.getByRole('button', { name: 'Import save file' }).click();
  await (await chooser).setFiles({ name: 'unsupported.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(old)) });
  await expect(page.getByRole('status')).toContainText('Unsupported save format'); expect((await inspect(page)).mode).toBe('title');
  expect(errors).toEqual([]);
});

test('@ci portrait combat zooms out the world, pans and confirms real healing by touch', async ({ browser }) => {
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:1.25}),page=await context.newPage();
  const errors = errorsOn(page); await page.goto('/');
  const state = checkpoint('captainConfronted'); state.location = { map: 'tunnel', x: 30, y: 14 }; state.party[0].hp = 24;
  await importSave(page, state); await approach(page, 'captain');
  await expect.poll(async () => (await inspect(page)).mode).toBe('battle');
  await expect(page.getByRole('button', { name: 'Pan battlefield right' })).toBeInViewport();
  const start = (await inspect(page)).view.scrollX;
  await page.getByRole('button', { name: 'Pan battlefield right' }).click();
  expect((await inspect(page)).view.scrollX).toBe(start + 192);
  await page.getByRole('button', { name: 'Pan battlefield left' }).click();
  await phoneConsole(page);
  // Retain native input evidence in failure logs without changing game state.
  await page.evaluate(()=>{
    const log:string[]=[];(window as unknown as {phoneInputTrace:string[]}).phoneInputTrace=log;
    for(const type of ['pointerdown','pointerup','touchstart','touchend','mousedown','mouseup','click'])document.addEventListener(type,e=>{
      const target=e.target as Element,p=e as PointerEvent,t=e as TouchEvent;
      const description=`${type}:${target.closest('button')?.getAttribute('aria-label')??target.tagName}:primary=${p.isPrimary}:touches=${t.touches?.length}`;
      log.push(description);setTimeout(()=>log.push(`${description}:prevented=${e.defaultPrevented}:connected=${target.isConnected}`),0);
    },{capture:true});
  });
  const openItems=async(stage:string)=>{
    await page.locator('.actions').getByRole('button', { name: /^\d\s+Items$/ }).tap();
    try{await expect(page.getByRole('dialog',{name:'Battle items'})).toBeVisible();}
    catch(error){throw new Error(`${stage}: ${String(error)}\nInput: ${await page.evaluate(()=>JSON.stringify({touches:navigator.maxTouchPoints,busy:window.borrowedTomorrow.inspect().busy,events:(window as unknown as {phoneInputTrace:string[]}).phoneInputTrace}))}`);}
  };
  await openItems('before drag');await page.getByRole('button',{name:'Close',exact:true}).tap();
  await touchPan(page);
  const snapshot = (await inspect(page)).battle!, b = { ...snapshot, obstacles: new Set(snapshot.obstacles), water: new Set(snapshot.water), vents: new Set(snapshot.vents) } as Battle;
  const nell = active(b)!; const before = snapshot.bandages;
  await openItems('after drag');
  await page.getByRole('dialog',{name:'Battle items'}).getByRole('group',{name:'Bandage',exact:true}).getByRole('button',{name:'Select',exact:true}).tap(); await clickHex(page, nell.hex,true);
  await expect(page.getByRole('button', { name: 'Confirm healing', exact: true })).toBeInViewport();
  await rotateWithPlan(page);await expect(page.getByRole('button',{name:'Confirm healing',exact:true})).toBeInViewport();
  await capture(page, 'healing-phone'); await page.getByRole('button', { name: 'Confirm healing', exact: true }).tap();
  await expect.poll(async () => (await inspect(page)).battle!.bandages).toBe(before - 1);
  expect((await inspect(page)).battle!.units.find(u => u.id === 'nell')!.hp).toBe(48); expect(errors).toEqual([]);
  // Inspect the actual late-game command list, with both of Nell's partners.
  const late=coastCheckpoint('raidConfronted');late.xp=8200;late.skills=newSkillBook(15);restoreParty(late);
  await importSave(page,late);await capture(page,'phone-portrait-world');
  await page.getByRole('button',{name:'Equipment',exact:true}).tap();await expect(page.getByRole('dialog',{name:'Character inventory',exact:true})).toBeVisible();await capture(page,'phone-portrait-equipment');await page.getByRole('button',{name:'Close',exact:true}).tap();
  await approach(page,'loading-gate');await expect.poll(async()=>(await inspect(page)).mode).toBe('battle');
  await page.getByRole('button',{name:/^F\s+Defend$/}).tap();await expect.poll(async()=>{const s=await inspect(page);return !s.busy&&s.battle?.queue[0];}).toBe('nell');
  await expect(page.locator('.actions button')).toHaveCount(10);await commandsFit(page);await phoneConsole(page);await phoneWorldVisible(page);await capture(page,'phone-portrait-full-skills');
  await page.getByRole('button',{name:/Prism lance$/}).tap();await expect(page.locator('#confirmation')).not.toBeEmpty();await capture(page,'phone-portrait-skill-info');
  for(const viewport of [{width:375,height:667},{width:430,height:932},{width:844,height:390}]){await page.setViewportSize(viewport);await phoneConsole(page);await commandsFit(page);await capture(page,`phone-${viewport.width}`);}
  expect(errors).toEqual([]);await context.close();
});

for(const [device,viewport] of [['desktop',{width:1280,height:800}],['phone',{width:844,height:390}]] as const){
  test(`captain stays on the stone walkway throughout pass scenes on ${device}`,async({page})=>{
    const errors=errorsOn(page);await page.setViewportSize(viewport);await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
    const arrival=checkpoint('villageFreed');arrival.location={map:'tunnel',x:3,y:14};await importSave(page,arrival);
    await expect.poll(async()=>(await inspect(page)).cinematic).toBe('one-pass');
    await page.locator('.dialogue-actions button').click();
    await expect(page.locator('.dialogue h2')).toHaveText('Captain Alban');
    await expect(page.locator('.dialogue-portrait img')).toHaveAttribute('src',/\/art\/vector\/portrait-alban\.svg$/);
    await nativeActor(page,'alban',{x:33,y:14});await capture(page,`pass-arrival-${device}`);
    await dialogue(page);await approach(page,'captain');
    await expect.poll(async()=>(await inspect(page)).cinematic).toBe('one-captain');
    await nativeActor(page,'alban',{x:33,y:14});
    for(let line=0;line<4;line++)await page.locator('.dialogue-actions button').click();
    await nativeActor(page,'alban',{x:32,y:14});await capture(page,`pass-confrontation-${device}`);
    await dialogue(page);await expect.poll(async()=>(await inspect(page)).mode).toBe('battle');
    expect((await inspect(page)).battle!.units.some(u=>u.name==='Captain Alban'&&u.appearance==='alban')).toBe(true);
    await page.reload();const departure=checkpoint('captainDefeated');departure.location={map:'tunnel',x:35,y:14};await importSave(page,departure);
    await approach(page,'departure');await expect.poll(async()=>(await inspect(page)).cinematic).toBe('one-departure');
    await nativeActor(page,'alban',{x:37,y:14});
    await page.locator('.dialogue-actions button').click();await page.locator('.dialogue-actions button').click();
    await nativeActor(page,'alban',{x:38,y:14});await capture(page,`pass-departure-${device}`);
    await dialogue(page);expect((await inspect(page)).state.flags.chapterOneComplete).toBe(true);expect(errors).toEqual([]);
  });
}

test('@journey Chapter One: festival, raid, escape, rescue and the Iron Coast departure', async ({ page }) => {
  test.setTimeout(240_000); const errors = errorsOn(page); await begin(page);
  await visit(page, 'blessing'); await capture(page, 'festival');
  await visit(page, 'tomas'); expect((await inspect(page)).state.flags.raidSeen).toBe(true);
  await approach(page, 'pursuit'); await battle(page, 'escape-battle');
  expect((await inspect(page)).state.flags.escapeWon).toBe(true);
  await travel(page, 'west-yard', 'yard'); await visit(page, 'orrin');
  expect((await inspect(page)).state.party.map(h => h.id)).toEqual(['nell', 'orrin']);
  await visit(page, 'workshop-cache'); await battle(page, 'workshop-battle');
  expect((await inspect(page)).state.inventory.bag['brass-reflector']).toBe(1);
  await page.getByRole('button',{name:'Equipment',exact:true}).click();
  await page.getByRole('button',{name:'Equip on Nell',exact:true}).click();
  await page.getByRole('button',{name:'Close',exact:true}).click();
  await travel(page, 'branch', 'rillbridge'); await dialogue(page); await capture(page, 'frozen-village');
  await visit(page, 'collector'); await battle(page, 'collector-battle');
  await visit(page, 'release'); expect((await inspect(page)).state.flags.villageFreed).toBe(true);
  await visit(page, 'tilda'); await capture(page, 'village-awake');
  await travel(page, 'east-pass', 'tunnel'); await dialogue(page);
  await visit(page, 'sun-mural'); await visit(page, 'shelter');
  await visit(page, 'captain'); await battle(page, 'captain-battle');
  expect((await inspect(page)).state.flags.captainDefeated).toBe(true);
  await visit(page, 'departure'); await expect.poll(async()=>(await inspect(page)).cinematic).toBe('one-two-crossing');
  await capture(page, 'chapter-one-complete');
  const final = (await inspect(page)).state;
  expect(final.boundary).toBe('chapter-two:iron-coast'); expect(final.flags.chapterOneComplete).toBe(true); expect(final.journal).toContain('departure');
  await page.getByRole('button', { name: 'Return to the pass' }).click();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.locator('[data-slot="slot-1"]').getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Place saved');
  await page.reload(); await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect.poll(async()=>(await inspect(page)).cinematic).toBe('one-two-crossing');
  const restored = (await inspect(page)).state; expect(restored.inventory).toEqual(final.inventory); expect(restored.journal).toEqual(final.journal);
  expect(restored.flags.villageFreed).toBe(true); expect(errors).toEqual([]);
});
