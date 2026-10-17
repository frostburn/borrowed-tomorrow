import { expect, test } from '@playwright/test';
import { newGame } from '../../src/rules/state';
import { capture, inspect, battle } from './controls';

for (const [device, viewport] of [['desktop', { width:1280,height:800 }], ['phone', { width:390,height:844 }]] as const) {
  test(`inventory equips individual characters and leaves campaign saves intact on ${device}`, async ({ page }) => {
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    await page.setViewportSize(viewport);await page.goto('/');
    await expect(page.getByRole('button',{name:'Begin Chapter One'})).toBeVisible();
    const saved={slot:'slot-1',savedAt:'2026-10-17T12:00:00.000Z',state:newGame()};
    await page.evaluate(async record=>{
      await new Promise<void>((resolve,reject)=>{const request=indexedDB.open('borrowed-tomorrow',1);request.onsuccess=()=>{const db=request.result,tx=db.transaction('saves','readwrite');tx.objectStore('saves').put(record);tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);};});
    },saved);
    await page.getByRole('button',{name:'Inventory workshop',exact:true}).click();
    await expect(page).toHaveTitle('Borrowed Tomorrow · Inventory workshop');
    await expect(page.getByRole('region',{name:'Character inventory'})).toBeVisible();
    await capture(page,`inventory-${device}`);
    const character=page.getByRole('group',{name:'Character',exact:true});
    const equip=()=>page.getByRole('button',{name:/^Equip on /});
    await equip().click();
    await expect(page.getByRole('region',{name:'Nell equipment'})).toContainText('Brass reflector');
    await page.getByRole('button',{name:'Receive one copy',exact:true}).click();
    await expect(page.getByRole('button',{name:/^Brass reflector/})).toContainText('1 in bag');
    await expect(equip()).toBeDisabled();
    await page.getByRole('button',{name:'Unequip fitting',exact:true}).click();
    await expect(page.getByRole('button',{name:/^Brass reflector/})).toContainText('2 in bag');
    await equip().click();
    await page.getByRole('button',{name:/^Heavy work coat/}).click();await equip().click();
    await character.getByRole('button',{name:'Orrin',exact:true}).click();
    await expect(equip()).toBeDisabled();
    await page.getByRole('button',{name:/^Brass reflector/}).click();await expect(equip()).toBeDisabled();
    await page.getByRole('button',{name:/^Pressure nozzle/}).click();await equip().click();
    await page.getByRole('button',{name:/^Reinforced work coat/}).click();await equip().click();
    await capture(page,`inventory-equipped-${device}`);
    await page.reload();await expect(page.getByRole('region',{name:'Nell equipment'})).toContainText('Heavy work coat');
    await page.getByRole('button',{name:'Test battle',exact:true}).click();
    await expect.poll(async()=>(await inspect(page)).mode).toBe('battle');
    const units=(await inspect(page)).battle!.units;
    expect(units.find(u=>u.id==='nell')).toMatchObject({bonus:3,armor:2,speed:5});
    expect(units.find(u=>u.id==='orrin')).toMatchObject({bonus:5,armor:1,speed:5});
    await expect.poll(async()=>{const b=(await inspect(page)).battle!;return b.units.find(u=>u.id===b.queue[0])?.side;}).toBe('party');
    await page.locator('.actions').getByRole('button',{name:/^F\s+Defend$/}).click();
    await page.getByRole('button',{name:'Inventory',exact:true}).click();
    await page.getByRole('button',{name:'Test battle',exact:true}).click();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('region',{name:'Character inventory'})).toBeVisible();
    const record=await page.evaluate(async()=>new Promise(resolve=>{const r=indexedDB.open('borrowed-tomorrow',1);r.onsuccess=()=>{const db=r.result,tx=db.transaction('saves','readonly'),get=tx.objectStore('saves').getAll();get.onsuccess=()=>{resolve(get.result);db.close();};};}));
    expect(record).toEqual([saved]);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([]);
  });
}

test('@journey inventory practice completes without campaign rewards',async({page})=>{
  await page.goto('/?dev=inventory');await expect(page.getByRole('region',{name:'Character inventory'})).toBeVisible();
  await page.getByRole('button',{name:'Equip on Nell',exact:true}).click();
  await page.getByRole('button',{name:/^Reinforced work coat/}).click();await page.getByRole('button',{name:'Equip on Nell',exact:true}).click();
  await page.getByRole('group',{name:'Character',exact:true}).getByRole('button',{name:'Orrin',exact:true}).click();
  await page.getByRole('button',{name:'Equip on Orrin',exact:true}).click();
  await page.getByRole('button',{name:/^Pressure nozzle/}).click();await page.getByRole('button',{name:'Equip on Orrin',exact:true}).click();
  await page.getByRole('button',{name:'Test battle',exact:true}).click();await battle(page,'inventory-practice',true);
  const state=(await inspect(page)).state;expect(state.xp).toBe(0);expect(state.coins).toBe(0);expect(state.gear).toEqual([]);expect(state.flags.workshopWon).toBeUndefined();
  await expect(page.getByRole('region',{name:'Character inventory'})).toBeVisible();
});
