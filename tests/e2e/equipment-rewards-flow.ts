import {test,expect} from '@playwright/test';
import {checkpoint,palaceCheckpoint} from '../support/progress';
import {importSave,approach} from './navigation';
import {battle,capture,dialogue,inspect} from './controls';

export function equipmentRewardFlows(production=false){
 for(const [device,viewport,deviceScaleFactor]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const){
  test.describe(`${production?'production':'development'} equipment rewards ${device}`,()=>{
   test.use({viewport,deviceScaleFactor});
   test('first gear victory names its character and offers immediate manual fitting',async({page})=>{
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');
    await importSave(page,checkpoint('orrinJoined'));await approach(page,'workshop-cache');await page.getByRole('button',{name:'Clear the shed',exact:true}).click();
    if(production)await battle(page,undefined,false,{pauseOnVictory:true});else await page.getByRole('button',{name:'Win battle',exact:true}).click();
    await expect(page.getByRole('list',{name:'Received'})).toContainText('Brass reflector · Nell');await expect(page.getByRole('list',{name:'Received'})).not.toContainText('× 1');await expect(page.locator('.scene-panel')).not.toContainText('added to the bag');
    expect((await inspect(page)).state.inventory.characters.nell.fitting).toBeNull();await expect(page.getByRole('button',{name:'Equip now',exact:true})).toBeInViewport();await capture(page,`first-equipment-victory-${production?'production-':''}${device}`);
    await page.getByRole('button',{name:'Equip now',exact:true}).click();const inventory=page.getByRole('dialog',{name:'Character inventory'});
    await expect(inventory.locator('[data-character="nell"]')).toHaveAttribute('aria-pressed','true');await expect(inventory.locator('[data-item="brass-reflector"]')).toHaveAttribute('aria-pressed','true');await expect(inventory.locator('[data-item="brass-reflector"] small')).toHaveText('Nell');
    await inventory.getByRole('button',{name:'Equip on Nell',exact:true}).click();expect((await inspect(page)).state.inventory.characters.nell.fitting).toBe('brass-reflector');
    await page.getByRole('button',{name:'Close',exact:true}).click();await page.getByRole('button',{name:'Continue the journey',exact:true}).click();await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();
    await expect.poll(async()=>(await inspect(page)).state.flags.equipmentHintSeen).toBe(true);await expect(page.getByRole('button',{name:'Equip now',exact:true})).toHaveCount(0);expect(errors).toEqual([]);await expect(page.locator('vite-error-overlay')).toHaveCount(0);
   });
   test('supplies do not consume the tip and shop fitting is offered once across reloads',async({page})=>{
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');const s=checkpoint('orrinJoined');s.location={map:'station',x:27,y:18};s.coins=200;await importSave(page,s);await approach(page,'iona');
    const shop=page.getByRole('dialog',{name:'Iona’s supplies'});await shop.locator('[data-stock="bandage"] button').click();await expect(shop.getByRole('button',{name:'Equip now',exact:true})).toHaveCount(0);expect((await inspect(page)).state.flags.equipmentHintSeen).toBeUndefined();
    await shop.locator('[data-stock="brass-reflector"] button').click();await expect(shop.locator('.shop-status')).toContainText('Brass reflector · Nell');await expect(shop.locator('[data-stock="brass-reflector"] small')).toHaveText('Nell');await expect(shop.locator('.shop-status')).not.toContainText('bag');await expect(shop.getByRole('button',{name:'Equip now',exact:true})).toBeInViewport();await expect(shop.getByRole('button',{name:'Equip now',exact:true})).toBeFocused();await capture(page,`first-equipment-shop-${production?'production-':''}${device}`);
    await shop.getByRole('button',{name:'Equip now',exact:true}).click();const inventory=page.getByRole('dialog',{name:'Character inventory'});await inventory.getByRole('button',{name:'Equip on Nell',exact:true}).click();await page.getByRole('button',{name:'Close',exact:true}).click();
    await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).state.flags.equipmentHintSeen).toBe(true);await approach(page,'iona');await shop.locator('[data-stock="lance-nozzle"] button').click();await expect(shop.getByRole('button',{name:'Equip now',exact:true})).toHaveCount(0);await expect(shop.locator('.shop-status')).toContainText('Orrin');expect((await inspect(page)).state.inventory.characters.orrin.fitting).toBeNull();expect(errors).toEqual([]);await expect(page.locator('vite-error-overlay')).toHaveCount(0);
   });
   test('an optional find offers fitting after dialogue without repeating the tutorial on restore',async({page})=>{
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await importSave(page,palaceCheckpoint('petraJoined'));await expect(page.getByRole('dialog',{name:'Equipment',exact:true})).toHaveCount(0);await approach(page,'capital-cache');await dialogue(page);
    const tip=page.getByRole('dialog',{name:'Equipment',exact:true});await expect(tip).toContainText('Equip gear to use its bonuses.');await expect(page.locator('#toast')).toContainText('Baffled pressure nozzle · Orrin');await capture(page,`first-equipment-find-${production?'production-':''}${device}`);
    await tip.getByRole('button',{name:'Equip now',exact:true}).click();const inventory=page.getByRole('dialog',{name:'Character inventory'});await expect(inventory.locator('[data-character="orrin"]')).toHaveAttribute('aria-pressed','true');await expect(inventory.locator('[data-item="baffled-nozzle"]')).toHaveAttribute('aria-pressed','true');expect((await inspect(page)).state.inventory.characters.orrin.fitting).not.toBe('baffled-nozzle');await page.getByRole('button',{name:'Close',exact:true}).click();
    await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).state.flags.equipmentHintSeen).toBe(true);await expect(tip).toHaveCount(0);expect(errors).toEqual([]);await expect(page.locator('vite-error-overlay')).toHaveCount(0);
   });
  });
 }
}
