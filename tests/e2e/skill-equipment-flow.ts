import {test,expect} from '@playwright/test';
import {coastCheckpoint} from '../support/progress';
import {receiveItem} from '../../src/rules/inventory';
import {importSave} from './navigation';
import {capture,inspect} from './controls';

export function skillEquipmentFlows(production=false){
 for(const [device,viewport,deviceScaleFactor]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const){
  test.describe(`${production?'production':'development'} skill and equipment fixes ${device}`,()=>{
   test.use({viewport,deviceScaleFactor});
   test('equipment dims incompatible fittings but keeps inspection and shared coats available',async({page})=>{
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');
    const s=coastCheckpoint('kitJoined');for(const id of ['brass-reflector','lance-nozzle','work-coat']as const)receiveItem(s.inventory,id);
    await importSave(page,s);await page.getByRole('button',{name:'Equipment',exact:true}).click();
    const inventory=page.getByRole('dialog',{name:'Character inventory'}),heroes=inventory.getByRole('group',{name:'Character',exact:true});
    await heroes.getByRole('button',{name:'Orrin',exact:true}).click();
    const brass=inventory.locator('[data-item="brass-reflector"]'),nozzle=inventory.locator('[data-item="lance-nozzle"]'),coat=inventory.locator('[data-item="work-coat"]');
    await expect(brass).toHaveClass(/incompatible/);await expect(brass).toHaveCSS('opacity','0.45');await expect(brass).toHaveAttribute('aria-description','Orrin cannot use this item.');
    await expect(nozzle).not.toHaveClass(/incompatible/);await expect(coat).not.toHaveClass(/incompatible/);
    await brass.click();await expect(inventory.getByRole('region',{name:'Item details'})).toContainText('Orrin cannot use this item.');await expect(inventory.getByRole('button',{name:'Equip on Orrin',exact:true})).toBeDisabled();
    expect((await inspect(page)).state.inventory).toEqual(s.inventory);await capture(page,`equipment-dimmed-${production?'production-':''}${device}`);
    await heroes.getByRole('button',{name:'Nell',exact:true}).click();await expect(brass).not.toHaveClass(/incompatible/);await expect(brass).toHaveCSS('opacity','1');await expect(inventory.getByRole('button',{name:'Equip on Nell',exact:true})).toBeEnabled();
    await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
   });

  });
 }
}
