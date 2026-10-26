import { expect, test } from '@playwright/test';
import { equipItem, receiveItem } from '../../src/rules/inventory';
import { checkpoint, coastCheckpoint } from '../support/progress';
import { approach, importSave, travel } from './navigation';
import { battle, capture, clickHex, inspect } from './controls';

/** Run the actual early-game counters and item menu in dev and the packed app. */
export function economyFlows(production = false) {
  for (const [device, viewport, deviceScaleFactor] of [['desktop', { width: 1280, height: 800 }, 1], ['phone', { width: 390, height: 844 }, 1.25]] as const) {
    test.describe(`${production ? 'production' : 'development'} economy on ${device}`, () => {
      test.use({ viewport, deviceScaleFactor });
      test('Larkspur buys, confirms spare sales and preserves worn equipment and saves', async ({ page }) => {
        const errors: string[] = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
        await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto('/'); await expect(page).toHaveTitle('Borrowed Tomorrow');
        const s = checkpoint('orrinJoined'); s.location = { map: 'station', x: 27, y: 18 }; s.coins = 80;
        receiveItem(s.inventory, 'work-coat'); equipItem(s.inventory, 'nell', 'work-coat');
        await importSave(page, s); await approach(page, 'iona');
        const shop = page.getByRole('dialog', { name: 'Iona’s supplies' }); await expect(shop).toBeVisible(); await expect(shop).not.toContainText('Celia');
        await shop.getByRole('button', { name: 'Sell spare gear', exact: true }).click(); await expect(shop).toContainText('No spare gear to sell.');
        await shop.getByRole('button', { name: 'Buy supplies', exact: true }).click();
        await shop.getByRole('group', { name: 'Reinforced work coat', exact: true }).getByRole('button', { name: /^Buy/ }).click();
        await shop.getByRole('group', { name: 'Focus tonic', exact: true }).getByRole('button', { name: /^Buy/ }).click();
        expect((await inspect(page)).state.coins).toBe(51); await expect(shop.getByRole('group', { name: 'Focus tonic', exact: true }).getByRole('button')).toBeFocused(); await capture(page, `economy-station-${production ? 'production-' : ''}${device}`);
        await shop.getByRole('button', { name: 'Sell spare gear', exact: true }).click();
        await shop.getByRole('group', { name: 'Reinforced work coat', exact: true }).getByRole('button', { name: 'Sell · 7 marks', exact: true }).click();
        await expect(shop.getByRole('button', { name: 'Confirm sale', exact: true })).toBeInViewport();
        await expect(shop.getByRole('button', { name: 'Confirm sale', exact: true })).toBeFocused();
        await capture(page, `economy-sale-${production ? 'production-' : ''}${device}`);
        expect((await inspect(page)).state.coins).toBe(51);
        await shop.getByRole('button', { name: 'Cancel sale', exact: true }).click(); expect((await inspect(page)).state.inventory.bag['work-coat']).toBe(1);
        await expect(shop.getByRole('group', { name: 'Reinforced work coat', exact: true }).getByRole('button')).toBeFocused();
        await shop.getByRole('group', { name: 'Reinforced work coat', exact: true }).getByRole('button', { name: /^Sell/ }).click();
        await page.keyboard.press('Enter');
        await expect(shop.getByRole('button', { name: 'Sell spare gear', exact: true })).toBeFocused();
        const saved = (await inspect(page)).state; expect(saved.coins).toBe(58); expect(saved.inventory.characters.nell.coat).toBe('work-coat'); expect(saved.inventory.bag).toMatchObject({ 'work-coat': 0, 'focus-tonic': 1 });
        await page.reload(); await page.getByRole('button', { name: 'Continue', exact: true }).click();
        await expect.poll(async () => (await inspect(page)).state.inventory).toEqual(saved.inventory); expect((await inspect(page)).state.coins).toBe(58);
        await expect(page.locator('vite-error-overlay')).toHaveCount(0); expect(errors).toEqual([]);
      });
      test('coastal purchases equip manually and medical items spend only on confirmed combat actions', async ({ page }) => {
        const errors: string[] = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
        await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto('/');
        const s = coastCheckpoint('raidConfronted'); s.party.find(h => h.id === 'nell')!.hp = 5; s.party.find(h => h.id === 'kit')!.focus = 0;
        await importSave(page, s); await approach(page, 'coast-engine'); await page.getByRole('button', { name: 'Browse supplies and trade gear', exact: true }).click();
        const shop = page.getByRole('dialog', { name: 'Coastal supplies' }); await expect(shop).toBeVisible();
        for (const name of ['Field bandage', 'Field bandage', 'Focus tonic', 'Coastal reflector']) await shop.getByRole('group', { name, exact: true }).getByRole('button', { name: /^Buy/ }).click();
        expect((await inspect(page)).state.coins).toBe(6); await expect(shop.getByRole('group', { name: 'Lined travel coat', exact: true }).getByRole('button')).toBeDisabled();
        await capture(page, `economy-coast-${production ? 'production-' : ''}${device}`);
        await shop.getByRole('button', { name: 'Equipment', exact: true }).click();
        const inventory = page.getByRole('dialog', { name: 'Character inventory' }); await expect(inventory).toContainText('Field bandage × 2');
        await inventory.locator('.ci-items').getByRole('button', { name: /^Coastal reflector/ }).click(); await inventory.getByRole('button', { name: 'Equip on Nell', exact: true }).click();
        await page.getByRole('button', { name: 'Close', exact: true }).click(); await approach(page, 'loading-gate');
        await expect.poll(async () => (await inspect(page)).mode).toBe('battle');
        let b = (await inspect(page)).battle!; expect(b.queue[0]).toBe('kit'); const kit = b.units.find(u => u.id === 'kit')!;
        await page.locator('.actions').getByRole('button', { name: /^\d\s+Items$/ }).click();
        const items = page.getByRole('dialog', { name: 'Battle items' }); await expect(items).toContainText('Field bandage × 2'); await capture(page, `economy-items-${production ? 'production-' : ''}${device}`);
        await page.keyboard.press('Escape'); expect((await inspect(page)).battle!.supplies).toEqual(b.supplies);
        await page.locator('.actions').getByRole('button', { name: /^\d\s+Items$/ }).click(); await items.getByRole('group', { name: 'Focus tonic', exact: true }).getByRole('button', { name: 'Select', exact: true }).click();
        await clickHex(page, kit.hex); await expect(page.locator('#confirmation')).toContainText('+3 focus');
        expect((await inspect(page)).battle!.supplies['focus-tonic']).toBe(1);
        await page.getByRole('button', { name: 'Confirm ability', exact: true }).click();
        b = (await inspect(page)).battle!; expect(b.supplies['focus-tonic']).toBe(0); expect(b.units.find(u => u.id === 'kit')!.focus).toBe(kit.focus + 3);
        expect((await inspect(page)).state.inventory.bag['focus-tonic']).toBe(1);
        await expect.poll(async () => { const x = await inspect(page); return !x.busy && x.battle!.queue[0]; }).toBe('nell');
        const nell = (await inspect(page)).battle!.units.find(u => u.id === 'nell')!;
        await page.locator('.actions').getByRole('button', { name: /^\d\s+Items$/ }).click(); await items.getByRole('group', { name: 'Field bandage', exact: true }).getByRole('button', { name: 'Select', exact: true }).click();
        await clickHex(page, nell.hex); await expect(page.locator('#confirmation')).toContainText('+48 HP'); await capture(page, `economy-healing-${production ? 'production-' : ''}${device}`);
        await page.getByRole('button', { name: 'Confirm healing', exact: true }).click();
        b = (await inspect(page)).battle!; expect(b.supplies['field-bandage']).toBe(1); expect(b.units.find(u => u.id === 'nell')!.hp).toBe(53);
        await battle(page);
        const saved = (await inspect(page)).state; expect(saved.coins).toBe(38); expect(saved.inventory.characters.nell.fitting).toBe('coastal-reflector'); expect(saved.inventory.bag).toMatchObject({ 'field-bandage': 1, 'focus-tonic': 0 });
        await page.reload(); await page.getByRole('button', { name: 'Continue', exact: true }).click(); await expect.poll(async () => (await inspect(page)).state.inventory).toEqual(saved.inventory);
        await expect(page.locator('vite-error-overlay')).toHaveCount(0); expect(errors).toEqual([]);
      });
      test('ward stock and spare sales remain reachable at the final crossing', async ({ page }) => {
        const errors: string[] = []; page.on('pageerror', e => errors.push(e.message)); await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto('/');
        const s = coastCheckpoint('evacuationReady'); await importSave(page, s); await approach(page, 'siding-coaches');
        await page.getByRole('button', { name: 'Browse supplies and trade gear', exact: true }).click(); const shop = page.getByRole('dialog', { name: 'Ward supplies' });
        await shop.getByRole('group', { name: 'Steady crossbow stock', exact: true }).getByRole('button', { name: /^Buy/ }).click();
        await shop.getByRole('button', { name: 'Sell spare gear', exact: true }).click(); await shop.getByRole('group', { name: 'Courier sight', exact: true }).getByRole('button', { name: /^Sell/ }).click();
        await shop.getByRole('button', { name: 'Confirm sale', exact: true }).click(); expect((await inspect(page)).state.coins).toBe(s.coins - 44 + 14);
        await page.getByRole('button', { name: 'Close', exact: true }).click(); await travel(page, 'siding-ward', 'infirmary'); await approach(page, 'ward-rest');
        await page.getByRole('button', { name: 'Browse supplies and trade gear', exact: true }).click(); await expect(shop).toBeVisible();
        await shop.getByRole('group', { name: 'Field bandage', exact: true }).getByRole('button', { name: /^Buy/ }).click(); await capture(page, `economy-ward-${production ? 'production-' : ''}${device}`);
        await expect(shop).not.toContainText('Celia'); await expect(page.locator('vite-error-overlay')).toHaveCount(0); expect(errors).toEqual([]);
      });
    });
  }
}
