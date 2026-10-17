import { expect, test } from '@playwright/test';
import { readFile, readdir } from 'node:fs/promises';

test('production ignores the inventory development route and omits its UI and item catalog',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/?dev=inventory');
  await expect(page).toHaveTitle('Borrowed Tomorrow');
  await expect(page.getByRole('button',{name:'Begin Chapter One',exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Inventory workshop',exact:true})).toHaveCount(0);
  await expect(page.getByRole('region',{name:'Character inventory'})).toHaveCount(0);
  const files=await readdir('dist/assets');
  const built=(await Promise.all(files.filter(f=>/\.(js|css)$/.test(f)).map(f=>readFile(`dist/assets/${f}`,'utf8')))).join('\n');
  expect(built).not.toContain('Receive one copy');expect(built).not.toContain('Heavy work coat');expect(built).not.toContain('.inventory-panel');
  expect(errors).toEqual([]);
});
