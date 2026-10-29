import {test,expect} from '@playwright/test';
import {ENDING_CREDITS} from '../../src/content/credits';
import {capture,inspect} from './controls';

for(const [device,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]as const)test('help credits preserve the current game and workshop on '+device,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:1.25}),page=await context.newPage(),errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const open=async()=>{
  await page.locator('#help-button').click();await page.getByRole('button',{name:'Credits',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:'Credits',exact:true});await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('img',{name:/Nell’s red railway hat/})).toBeVisible();
  await expect(dialog.locator('.credit-entry')).toHaveCount(ENDING_CREDITS.length);
  for(let i=0;i<ENDING_CREDITS.length;i++){
   const entry=dialog.locator('.credit-entry').nth(i);await expect(entry.locator('h3')).toHaveText(ENDING_CREDITS[i].role);
   await expect(entry.locator('p')).toHaveText([...ENDING_CREDITS[i].lines]);
  }
  await capture(page,'help-credits-'+device);
  await dialog.locator('.credit-entry').last().scrollIntoViewIfNeeded();
  await expect(dialog.getByText('Stephen D. Turner',{exact:true})).toBeVisible();
  await capture(page,'help-credits-tools-'+device);
 };
 try{
  await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');
  await expect(page.getByRole('button',{name:'Begin Chapter One',exact:true})).toBeVisible();
  const titleStorage=await page.evaluate(()=>({...localStorage}));
  await open();await page.getByRole('button',{name:'Back to help',exact:true}).click();
  await expect(page.getByRole('dialog',{name:'On the line',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Close',exact:true}).click();await expect(page.locator('#help-button')).toBeFocused();
  await expect(page.getByRole('button',{name:'Begin Chapter One',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>({...localStorage}))).toEqual(titleStorage);
  await page.getByRole('button',{name:'Begin Chapter One',exact:true}).click();
  await page.getByRole('button',{name:'Skip scene',exact:true}).click();
  const before=(await inspect(page)).state,stored=await page.evaluate(()=>({...localStorage}));
  await open();await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
  expect((await inspect(page)).state).toEqual({...before,playSeconds:expect.any(Number)});
  expect(await page.evaluate(()=>({...localStorage}))).toEqual(stored);
  await page.goto('/?dev=cinematics');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop');
  const workshop=(await inspect(page)).state;
  await open();await page.getByRole('button',{name:'Back to help',exact:true}).click();
  await expect(page.getByRole('dialog',{name:'Character workshop',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Close',exact:true}).click();
  expect((await inspect(page)).state).toEqual({...workshop,playSeconds:expect.any(Number)});
  await page.getByRole('button',{name:'Test battle',exact:true}).click();
  await expect.poll(async()=>(await inspect(page)).mode).toBe('battle');const battle=(await inspect(page)).battle,battleState=(await inspect(page)).state;
  await open();await page.getByRole('button',{name:'Close',exact:true}).click();
  expect((await inspect(page)).mode).toBe('battle');expect((await inspect(page)).battle).toEqual(battle);expect((await inspect(page)).state).toEqual({...battleState,playSeconds:expect.any(Number)});
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await context.close();}
});
