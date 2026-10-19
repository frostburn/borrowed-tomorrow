import { expect, test } from '@playwright/test';
import { newGame } from '../../src/rules/state';
import { checkpoint } from '../support/progress';
import { battle, capture, dialogue, inspect, clickHex, nativeScene, nativeActor } from './controls';
import { approach, importSave, travel, visit } from './navigation';
import { active, type Battle } from '../../src/rules/combat';

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
  await page.reload(); await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Save files' }).click();
  await expect(page.locator('[data-slot="slot-1"]').getByRole('button', { name: 'Load', exact: true })).toBeDisabled();
  const chooser = page.waitForEvent('filechooser'); await page.getByRole('button', { name: 'Import save file' }).click();
  await (await chooser).setFiles({ name: 'unsupported.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(old)) });
  await expect(page.getByRole('status')).toContainText('Unsupported save format'); expect((await inspect(page)).mode).toBe('title');
  expect(errors).toEqual([]);
});

test('@ci phone combat pans and confirms real healing without shrinking the actors', async ({ page }) => {
  const errors = errorsOn(page); await page.setViewportSize({ width: 390, height: 844 }); await page.goto('/');
  const state = checkpoint('captainConfronted'); state.location = { map: 'tunnel', x: 30, y: 14 }; state.party[0].hp = 24;
  await importSave(page, state); await approach(page, 'captain');
  await expect.poll(async () => (await inspect(page)).mode).toBe('battle');
  await expect(page.getByRole('button', { name: 'Pan battlefield right' })).toBeInViewport();
  const start = (await inspect(page)).view.scrollX;
  await page.getByRole('button', { name: 'Pan battlefield right' }).click();
  expect((await inspect(page)).view.scrollX).toBe(start + 192);
  await page.getByRole('button', { name: 'Pan battlefield left' }).click();
  const snapshot = (await inspect(page)).battle!, b = { ...snapshot, obstacles: new Set(snapshot.obstacles), water: new Set(snapshot.water), vents: new Set(snapshot.vents) } as Battle;
  const nell = active(b)!; const before = snapshot.bandages;
  await page.locator('.actions').getByRole('button', { name: /^5\s+Bandage$/ }).click(); await clickHex(page, nell.hex);
  await expect(page.getByRole('button', { name: 'Confirm healing', exact: true })).toBeInViewport();
  await capture(page, 'healing-phone'); await page.getByRole('button', { name: 'Confirm healing', exact: true }).click();
  await expect.poll(async () => (await inspect(page)).battle!.bandages).toBe(before - 1);
  expect((await inspect(page)).battle!.units.find(u => u.id === 'nell')!.hp).toBe(48); expect(errors).toEqual([]);
});

for(const [device,viewport] of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]] as const){
  test(`captain stays on the stone walkway throughout pass scenes on ${device}`,async({page})=>{
    const errors=errorsOn(page);await page.setViewportSize(viewport);await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
    const arrival=checkpoint('villageFreed');arrival.location={map:'tunnel',x:3,y:14};await importSave(page,arrival);
    await expect.poll(async()=>(await inspect(page)).cinematic).toBe('one-pass');
    await page.locator('.dialogue-actions button').click();
    await expect(page.locator('.dialogue h2')).toHaveText('Captain Alban');
    await expect(page.locator('.dialogue-portrait img')).toHaveAttribute('src',/\/art\/portrait-alban\.png$/);
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
  await visit(page, 'departure'); await expect(page.getByRole('heading', { name: 'Chapter One complete' })).toBeVisible();
  await capture(page, 'chapter-one-complete');
  const final = (await inspect(page)).state;
  expect(final.boundary).toBe('chapter-two:iron-coast'); expect(final.flags.chapterOneComplete).toBe(true); expect(final.journal).toContain('departure');
  await page.getByRole('button', { name: 'Return to the pass' }).click();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.locator('[data-slot="slot-1"]').getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Place saved');
  await page.reload(); await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Chapter One complete' })).toBeVisible();
  const restored = (await inspect(page)).state; expect(restored.inventory).toEqual(final.inventory); expect(restored.journal).toEqual(final.journal);
  expect(restored.flags.villageFreed).toBe(true); expect(errors).toEqual([]);
});
