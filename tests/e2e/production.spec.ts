import { expect, test } from '@playwright/test';
import { readFile, readdir } from 'node:fs/promises';

test('production ignores both workshop routes and omits its controls, progression and item catalog', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  for (const route of ['workshop', 'inventory']) {
    await page.goto(`/?dev=${route}`);
    await expect(page).toHaveTitle('Borrowed Tomorrow');
    await expect(page.getByRole('button', { name: 'Begin Chapter One', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Workshop', exact: true })).toHaveCount(0);
    await expect(page.getByRole('region', { name: 'Character workshop' })).toHaveCount(0);
  }
  const files = await readdir('dist/assets');
  const built = (await Promise.all(files.filter(f => /\.(js|css)$/.test(f)).map(f => readFile(`dist/assets/${f}`, 'utf8')))).join('\n');
  for (const devOnly of ['Receive one copy', 'Heavy work coat', '.inventory-panel', 'Apply base stats', 'Level defaults', 'Invalid character level.', 'character-workshop:v1']) expect(built).not.toContain(devOnly);
  expect(errors).toEqual([]);
});
