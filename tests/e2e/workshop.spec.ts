import { expect, test, type Page } from '@playwright/test';
import { capture, clickHex, inspect } from './controls';
import { blast, HEX_SIZE, offset, toPixel } from '../../src/rules/hex';
import { MAX_LEVEL } from '../../src/rules/progression';

const characterStorage = 'borrowed-tomorrow:character-workshop:v3';
async function setLevel(page: Page, hero: string, level: number) {
  const input = page.getByRole('spinbutton', { name: `${hero} level`, exact: true });
  await input.fill(String(level)); await input.press('Tab');
  await expect(page.getByRole('spinbutton', { name: `${hero} level`, exact: true })).toHaveValue(String(level));
}
async function selectHero(page: Page, hero: string) {
  await page.getByRole('group', { name: 'Character', exact: true }).getByRole('button', { name: hero, exact: true }).click();
}
async function selectTab(page: Page, tab: string) {
  await page.getByRole('navigation', { name: 'Workshop panels' }).getByRole('button', { name: tab, exact: true }).click();
}

for (const [device, viewport] of [['desktop', { width: 1280, height: 800 }], ['phone', { width: 390, height: 844 }]] as const) {
  test(`character builds persist and unlocked support abilities work on ${device}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.setViewportSize(viewport); await page.goto('/?dev=workshop');
    await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop');
    await expect(page.getByRole('region', { name: 'Character workshop', exact: true })).toBeVisible();
    await expect(page.locator('[data-ability="mend"]')).toContainText('Skill 0 / 3');
    await capture(page, `workshop-${device}`);
    await setLevel(page, 'Nell', 5);
    await expect(page.locator('[data-ability="mend"]')).toContainText('Skill 2 / 3');
    for (const [stat, value] of [['Max HP', 120], ['Attack', 30], ['Armor', 3], ['Speed', 12], ['Movement', 5], ['Starting focus', 2]] as const) {
      await page.getByRole('spinbutton', { name: `Nell ${stat}`, exact: true }).fill(String(value));
    }
    await page.getByRole('button', { name: 'Increase Nell Attack', exact: true }).click();
    await expect(page.getByRole('spinbutton', { name: 'Nell Attack', exact: true })).toHaveValue('31');
    await page.getByRole('button', { name: 'Decrease Nell Attack', exact: true }).click();
    await page.getByRole('button', { name: 'Apply base stats', exact: true }).click();
    if(device === 'phone') { await page.getByRole('button', { name: 'Apply base stats', exact: true }).scrollIntoViewIfNeeded(); await capture(page, 'workshop-stats-phone'); }
    await selectTab(page, 'Equipment'); await page.getByRole('button', { name: 'Equip on Nell', exact: true }).click();
    await selectHero(page, 'Orrin'); await selectTab(page, 'Character'); await setLevel(page, 'Orrin', 3);
    await page.getByRole('spinbutton', { name: 'Orrin Speed', exact: true }).fill('15');
    await page.getByRole('button', { name: 'Apply base stats', exact: true }).click();
    await expect(page.locator('[data-ability="guard"]')).toContainText('Skill 1 / 3');
    await expect(page.locator('[data-ability="repulse"]')).toContainText('Skill 0 / 3');
    await page.reload();
    await expect(page.getByRole('spinbutton', { name: 'Nell level', exact: true })).toHaveValue('5');
    await expect(page.getByRole('spinbutton', { name: 'Nell Attack', exact: true })).toHaveValue('30');
    await expect(page.getByRole('region', { name: 'Nell equipment' })).toContainText('Brass reflector');
    await capture(page, `workshop-build-${device}`);
    await page.getByRole('button', { name: 'Test battle', exact: true }).click();
    await expect.poll(async () => (await inspect(page)).battle?.queue[0]).toBe('orrin');
    const units = (await inspect(page)).battle!.units;
    expect(units.find(u => u.id === 'nell')).toMatchObject({ hp: 120, bonus: 22, armor: 3, speed: 12, movement: 5, focus: 2, level: 5 });
    expect(units.find(u => u.id === 'orrin')).toMatchObject({ hp: 66, bonus: 6, speed: 15, level: 3 });
    expect(units.find(u => u.id === 'nell')!.skills!.mend).toBe(2);
    await page.keyboard.press('6'); await clickHex(page, units.find(u => u.id === 'nell')!.hex);
    await expect(page.locator('.prediction')).toContainText('13 guard');
    await expect(page.getByRole('button', { name: 'Confirm ability', exact: true })).toBeInViewport();
    await capture(page, `workshop-guard-${device}`);
    await page.getByRole('button', { name: 'Confirm ability', exact: true }).click();
    await expect.poll(async () => (await inspect(page)).battle!.units.find(u => u.id === 'nell')!.guard).toBe(13);
    await page.getByRole('button', { name: 'Workshop', exact: true }).click();
    await setLevel(page, 'Nell', 1);
    await expect(page.locator('[data-ability="mend"]')).toContainText('Skill 0 / 3');
    await expect(page.getByRole('spinbutton', { name: 'Nell Attack', exact: true })).toHaveValue('11');
    await expect(page.getByRole('region', { name: 'Nell equipment' })).toContainText('Brass reflector');
    await page.getByRole('button', { name: 'Test battle', exact: true }).click();
    await expect.poll(async () => (await inspect(page)).mode).toBe('battle');
    expect((await inspect(page)).battle!.units.find(u => u.id === 'nell')!.skills!.mend).toBe(0);
    await page.keyboard.press('Escape');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); expect(errors).toEqual([]);
  });
}

for (const [device, viewport] of [['desktop', { width: 1280, height: 800 }], ['phone', { width: 390, height: 844 }]] as const) {
  test(`level-five knockback, Dazzle and area healing play through on ${device}`, async ({ page }) => {
    const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if(m.type() === 'error') errors.push(m.text()); });
    await page.setViewportSize(viewport); await page.goto('/?dev=workshop');
    for (const hero of ['Nell', 'Orrin']) {
      await selectHero(page, hero); await setLevel(page, hero, 5);
      for (const [stat, value] of [['Max HP', 999], ['Attack', 1], ['Movement', 10], ['Speed', hero === 'Orrin' ? 30 : 29]] as const) {
        await page.getByRole('spinbutton', { name: `${hero} ${stat}`, exact: true }).fill(String(value));
      }
      await page.getByRole('button', { name: 'Apply base stats', exact: true }).click();
    }
    await page.locator('[data-ability="repulse"]').scrollIntoViewIfNeeded(); await capture(page, `workshop-abilities-${device}`);
    await page.getByRole('button', { name: 'Test battle', exact: true }).click();
    await page.locator('.actions').getByRole('button', { name: /^1\s+Move$/ }).click(); await clickHex(page, offset(5, 3));
    await page.getByRole('button', { name: /^Confirm move/ }).click();
    await expect(page.locator('.actions').getByRole('button', { name: /^7\s+Pressure wave$/ })).toBeEnabled();
    const beforeWave=(await inspect(page)).battle!;
    await page.locator('.actions').getByRole('button', { name: /^7\s+Pressure wave$/ }).click();
    await expect(page.getByRole('button', { name: 'Confirm attack', exact: true })).toBeInViewport();
    expect((await inspect(page)).battle).toEqual(beforeWave);
    const view=(await inspect(page)).view;
    for(const hex of [...blast(offset(5,3)),offset(7,3)]){
      const p=toPixel(hex);
      expect(p.x-HEX_SIZE).toBeGreaterThanOrEqual(view.scrollX);
      expect(p.x+HEX_SIZE).toBeLessThanOrEqual(view.scrollX+view.width);
    }
    await page.locator('.actions').getByRole('button', { name: /^2\s+Strike$/ }).click();
    await expect(page.getByRole('button', { name: 'Confirm attack', exact: true })).toHaveCount(0);
    await page.keyboard.press('7');
    await expect(page.getByRole('button', { name: 'Confirm attack', exact: true })).toBeInViewport();
    await expect(page.locator('.prediction')).toContainText('pushed one hex');
    await capture(page, `workshop-push-${device}`); await page.getByRole('button', { name: 'Confirm attack', exact: true }).click();
    await expect.poll(async () => (await inspect(page)).battle!.units.find(u => u.kind === 'hound')!.hex).toEqual(offset(7, 3));
    await expect(page.locator('.actions').getByRole('button', { name: /^1\s+Move$/ })).toBeEnabled();
    await page.locator('.actions').getByRole('button', { name: /^1\s+Move$/ }).click(); await clickHex(page, offset(6, 2));
    await page.getByRole('button', { name: /^Confirm move/ }).click();
    await expect(page.locator('.actions').getByRole('button', { name: /^6\s+Dazzle$/ })).toBeEnabled();
    await page.keyboard.press('6'); await clickHex(page, offset(7, 3));
    await expect(page.locator('.prediction')).toContainText('next 3 attacks −40%');
    await page.getByRole('button', { name: 'Confirm ability', exact: true }).click();
    await expect.poll(async () => (await inspect(page)).battle!.queue[0]).toBe('orrin');
    expect((await inspect(page)).battle!.units.find(u => u.kind === 'hound')!.dazzledAttacks).toBe(2);
    await expect(page.locator('.actions').getByRole('button', { name: /^F\s+Defend$/ })).toBeEnabled();
    await page.locator('.actions').getByRole('button', { name: /^F\s+Defend$/ }).click();
    await expect(page.locator('.actions').getByRole('button', { name: /^5\s+Mend$/ })).toBeEnabled();
    const before = (await inspect(page)).battle!.units.find(u => u.id === 'nell')!.hp;
    expect(before).toBeLessThan(999);
    await page.keyboard.press('5'); await clickHex(page, (await inspect(page)).battle!.units.find(u => u.id === 'nell')!.hex);
    await expect(page.getByRole('button', { name: 'Confirm healing', exact: true })).toBeInViewport();
    await capture(page, `workshop-beacon-${device}`); await page.getByRole('button', { name: 'Confirm healing', exact: true }).click();
    await expect.poll(async () => (await inspect(page)).battle!.units.find(u => u.id === 'nell')!.hp).toBe(Math.min(999, before + 30));
    await page.getByRole('button', { name: 'Workshop', exact: true }).click();
    expect(errors).toEqual([]);
  });
}

test('@ci invalid stat edits are atomic and damaged character storage keeps equipment intact', async ({ page }) => {
  await page.goto('/?dev=inventory');
  await expect(page.getByRole('region', { name: 'Shared bag' })).toBeVisible();
  await page.getByRole('button', { name: 'Equip on Nell', exact: true }).click();
  await selectTab(page, 'Character'); await setLevel(page, 'Nell', 3);
  await page.getByRole('spinbutton', { name: 'Nell Attack', exact: true }).fill('25');
  await page.getByRole('spinbutton', { name: 'Nell Movement', exact: true }).fill('0');
  await page.getByRole('button', { name: 'Apply base stats', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Movement must be a whole number' })).toBeVisible();
  const stored = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), characterStorage);
  expect(stored.characters.nell.attack).toBe(15); expect(stored.characters.nell.movement).toBe(3);
  await page.getByRole('spinbutton', { name: 'Nell Movement', exact: true }).fill('4');
  await page.getByRole('button', { name: 'Apply base stats', exact: true }).click();
  await page.getByRole('button', { name: 'Level defaults', exact: true }).click();
  await expect(page.getByRole('spinbutton', { name: 'Nell Attack', exact: true })).toHaveValue('15');
  await page.getByRole('spinbutton', { name: 'Nell level', exact: true }).fill(String(MAX_LEVEL+1)); await page.keyboard.press('Tab');
  await expect(page.getByRole('spinbutton', { name: 'Nell level', exact: true })).toHaveValue('3');
  await page.evaluate(key => localStorage.setItem(key, '{"version":1,"characters":null}'), characterStorage);
  await page.goto('/?dev=workshop');
  await expect(page.getByRole('spinbutton', { name: 'Nell level', exact: true })).toHaveValue('1');
  await expect(page.getByRole('region', { name: 'Nell equipment' })).toContainText('Brass reflector');
  await expect(page.getByRole('status').filter({ hasText: 'Stored character settings were unavailable' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset workshop', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Nell equipment' })).not.toContainText('Brass reflector');
  await selectHero(page, 'Orrin'); await expect(page.getByRole('spinbutton', { name: 'Orrin level', exact: true })).toHaveValue('1');
});
