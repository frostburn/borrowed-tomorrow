import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { checkpoint } from '../support/progress';
import { approach, importSave, travel, visit } from './navigation';
import { capture, inspect } from './controls';

for(const [device,viewport] of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]] as const){
  test(`campaign purchases, loadouts, saves and battle bonuses work on ${device}`,async({page})=>{
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    await page.setViewportSize(viewport);await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');
    const state=checkpoint('orrinJoined');state.location={map:'station',x:27,y:18};state.coins=200;
    await importSave(page,state);await approach(page,'iona');
    const shop=page.getByRole('dialog',{name:'Iona’s supplies'});await expect(shop).toBeVisible();
    for(const name of ['Brass reflector','Pressure nozzle','Heavy work coat','Reinforced work coat','Reinforced work coat']){
      await shop.getByRole('group',{name,exact:true}).getByRole('button',{name:/^Buy/}).click();
    }
    const bought=(await inspect(page)).state;
    expect(bought.coins).toBe(85);expect(bought.inventory.bag).toMatchObject({'brass-reflector':1,'lance-nozzle':1,'heavy-coat':1,'work-coat':2});
    expect(bought.inventory.characters.nell).toEqual({fitting:null,coat:null});expect(bought.inventory.characters.orrin).toEqual({fitting:null,coat:null});
    await expect(shop.getByRole('group',{name:'Brass reflector',exact:true}).getByRole('button')).toBeDisabled();
    await page.getByRole('button',{name:'Close',exact:true}).click();await page.getByRole('button',{name:'Equipment',exact:true}).click();
    const inventory=page.getByRole('dialog',{name:'Character inventory'}),characters=inventory.getByRole('group',{name:'Character',exact:true});
    await capture(page,`campaign-inventory-entry-${device}`);
    await expect(characters.getByRole('button')).toHaveCount(2);await expect(inventory).not.toContainText('Petra');
    const choose=async(name:string)=>{await inventory.getByRole('button',{name:new RegExp(`^${name}`)}).click();};
    await choose('Brass reflector');await expect(inventory.getByRole('region',{name:'Stat comparison'})).toContainText('Attack: 11 → 14');
    await inventory.getByRole('button',{name:'Equip on Nell',exact:true}).click();
    await choose('Heavy work coat');await expect(inventory.getByRole('region',{name:'Stat comparison'})).toContainText('Speed: 7 → 5');
    await inventory.getByRole('button',{name:'Equip on Nell',exact:true}).click();
    await characters.getByRole('button',{name:'Orrin',exact:true}).click();await expect(inventory.getByRole('button',{name:'Equip on Orrin',exact:true})).toBeDisabled();
    await choose('Reinforced work coat');await inventory.getByRole('button',{name:'Equip on Orrin',exact:true}).click();
    await choose('Pressure nozzle');await inventory.getByRole('button',{name:'Equip on Orrin',exact:true}).click();
    await characters.getByRole('button',{name:'Nell',exact:true}).click();await expect(inventory.getByRole('button',{name:'Equip on Nell',exact:true})).toBeDisabled();
    await choose('Reinforced work coat');await inventory.getByRole('button',{name:'Equip on Nell',exact:true}).click();
    await choose('Heavy work coat');await inventory.getByRole('button',{name:'Equip on Nell',exact:true}).click();
    await capture(page,`campaign-inventory-${device}`);
    const image=inventory.getByRole('img',{name:'Nell',exact:true});
    expect(await image.evaluate(i=>{const r=i.getBoundingClientRect(),s=window.borrowedTomorrowPixels.inspect().cssScale;return {w:r.width/s,h:r.height/s,nw:(i as HTMLImageElement).naturalWidth,nh:(i as HTMLImageElement).naturalHeight};})).toEqual({w:128,h:128,nw:128,nh:128});
    const saved=(await inspect(page)).state.inventory;
    expect(saved.characters.nell).toEqual({fitting:'brass-reflector',coat:'heavy-coat'});expect(saved.characters.orrin).toEqual({fitting:'lance-nozzle',coat:'work-coat'});
    expect(saved.bag['work-coat']).toBe(1);expect(saved.bag['heavy-coat']).toBe(0);
    await page.getByRole('button',{name:'Close',exact:true}).click();await page.getByRole('button',{name:'Save',exact:true}).click();
    const download=page.waitForEvent('download');await page.getByRole('button',{name:'Export current save',exact:true}).click();
    const exported=JSON.parse(await readFile((await(await download).path())!,'utf8'));expect(exported.version).toBe(9);expect(exported.inventory).toEqual(saved);expect(exported).not.toHaveProperty('gear');
    await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();
    await expect.poll(async()=>(await inspect(page)).state.inventory).toEqual(saved);
    await page.keyboard.press('i');await expect(page.getByRole('dialog',{name:'Character inventory'})).toBeVisible();
    await page.getByRole('button',{name:'Close',exact:true}).click();
    await travel(page,'west-yard','yard');await visit(page,'workshop-cache');
    await expect.poll(async()=>(await inspect(page)).mode).toBe('battle');
    const units=(await inspect(page)).battle!.units;
    expect(units.find(u=>u.id==='nell')).toMatchObject({bonus:3,armor:2,speed:5});expect(units.find(u=>u.id==='orrin')).toMatchObject({bonus:5,armor:1,speed:5});
    await expect(page.getByRole('button',{name:'Equipment',exact:true})).toBeDisabled();
    await page.getByRole('button',{name:'Win battle',exact:true}).click();await expect(page.getByRole('heading',{name:'The line is clear',exact:true})).toBeVisible();
    expect((await inspect(page)).state.inventory.bag['brass-reflector']).toBe(1);
    await page.getByRole('button',{name:'Equipment',exact:true}).click();await expect(page.getByRole('dialog',{name:'Character inventory'})).toBeVisible();
    await page.getByRole('button',{name:'Close',exact:true}).click();await page.getByRole('button',{name:'Continue the journey',exact:true}).click();
    expect(errors).toEqual([]);
  });
}

test('Continue migrates a version-five departure and preserves its equipped bonuses on repeated reloads',async({page})=>{
  await page.goto('/');const state=checkpoint('chapterOneComplete');state.bandages=13;state.playSeconds=900;
  const {inventory:_,...fields}=state,legacy={...fields,version:5,gear:['brass-lantern','work-coats']};
  await page.evaluate(async state=>{await new Promise<void>((resolve,reject)=>{
    const request=indexedDB.open('borrowed-tomorrow',1);request.onsuccess=()=>{const db=request.result,tx=db.transaction('saves','readwrite');tx.objectStore('saves').put({slot:'autosave',savedAt:new Date().toISOString(),state});tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);};
  });},legacy);
  for(let i=0;i<2;i++){
    await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();
    await expect(page.getByRole('heading',{name:'Chapter One complete',exact:true})).toBeVisible();
    const migrated=(await inspect(page)).state;expect(migrated).toMatchObject({...fields,version:9,playSeconds:expect.any(Number)});
    expect(migrated.inventory.characters.nell).toEqual({fitting:'brass-reflector',coat:'work-coat'});
    expect(migrated.inventory.characters.orrin).toEqual({fitting:null,coat:'work-coat'});expect(migrated.inventory.bag['work-coat']).toBe(0);
  }
  const before=(await inspect(page)).state.inventory;
  await importSave(page,legacy);expect((await inspect(page)).state.inventory).toEqual(before);
});

test('campaign portraits retain native geometry on a compact phone',async({page})=>{
  await page.setViewportSize({width:320,height:844});await page.goto('/');await importSave(page,checkpoint('orrinJoined'));
  await page.getByRole('button',{name:'Equipment',exact:true}).click();
  const inventory=page.getByRole('dialog',{name:'Character inventory'});
  for(const name of ['Nell','Orrin']){
    await inventory.getByRole('group',{name:'Character',exact:true}).getByRole('button',{name,exact:true}).click();
    const image=inventory.getByRole('img',{name,exact:true});
    expect(await image.evaluate(i=>{const r=i.getBoundingClientRect(),s=window.borrowedTomorrowPixels.inspect().cssScale;return {w:r.width/s,h:r.height/s};})).toEqual({w:128,h:128});
    expect(await inventory.evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
  }
  await capture(page,'campaign-inventory-compact-phone');
});
