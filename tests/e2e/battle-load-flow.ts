import {test,expect,type Page} from '@playwright/test';
import {checkpoint,palaceCheckpoint} from '../support/progress';
import {importSave,approach} from './navigation';
import {inspect} from './controls';

async function pursuit(page:Page){
 await importSave(page,checkpoint('raidSeen'));await approach(page,'pursuit');
 await expect.poll(async()=>(await inspect(page)).mode).toBe('battle');
}
async function chooseFile(page:Page,state:unknown){
 const chooser=page.waitForEvent('filechooser');
 await page.getByRole('button',{name:'Import save file',exact:true}).click();
 await(await chooser).setFiles({name:'journey.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(state))});
}
async function world(page:Page,map:string,coins:number){
 await expect.poll(async()=>{const s=await inspect(page);return s.mode==='world'&&s.battle===null&&s.state.location.map===map&&s.state.coins===coins;}).toBe(true);
}
export function battleLoadFlows(production=false){
 test.describe(production?'production battle loading':'development battle loading',()=>{
  test('@ci saved slots and JSON load during battle animations without saving combat',async({page})=>{
   const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
   const target=checkpoint('orrinJoined');target.coins=37;
   await page.goto('/');await importSave(page,target);
   await page.getByRole('button',{name:'Save',exact:true}).first().click();
   const slot=page.locator('[data-slot="slot-1"]');await slot.getByRole('button',{name:'Save',exact:true}).click();
   await expect(slot.getByRole('button',{name:'Load',exact:true})).toBeEnabled();await page.getByRole('button',{name:'Close',exact:true}).click();
   await pursuit(page);const defend=page.getByRole('button',{name:/^F\s+Defend$/});
   await expect(defend).toBeEnabled();await defend.click();
   await page.getByRole('button',{name:'Save',exact:true}).first().click();
   const menu=page.getByRole('dialog');await expect(menu.getByRole('button',{name:'Save',exact:true})).toHaveCount(0);
   await expect(menu.getByRole('button',{name:'Export current save',exact:true})).toHaveCount(0);
   await page.locator('[data-slot="slot-1"]').getByRole('button',{name:'Load',exact:true}).click();
   await page.getByRole('button',{name:'Load save',exact:true}).click();await world(page,'yard',37);
   await page.waitForTimeout(1300);await world(page,'yard',37);expect((await inspect(page)).state.party).toEqual(target.party);
   await pursuit(page);await expect(defend).toBeEnabled();await defend.click();
   const imported=structuredClone(target);imported.coins=83;await importSave(page,imported);await world(page,'yard',83);
   await page.waitForTimeout(1300);await world(page,'yard',83);
   await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await world(page,'yard',83);
   expect(errors).toEqual([]);
  });
  test('@ci failed battle imports remain playable and retry without browser storage',async({page})=>{
   await page.setViewportSize({width:390,height:844});
   await page.addInitScript(()=>Object.defineProperty(indexedDB,'open',{value:()=>{throw new Error('Storage blocked');}}));
   const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('/');await pursuit(page);
   await page.getByRole('button',{name:'Save',exact:true}).first().click();
   await expect(page.getByRole('dialog')).toContainText('Browser storage is unavailable');
   await chooseFile(page,{version:0});await expect(page.locator('#toast')).toContainText('Unsupported save format');
   expect((await inspect(page)).mode).toBe('battle');
   await page.waitForTimeout(650);const before=await inspect(page);
   const target=palaceCheckpoint('capitalSeen');target.coins=71;
   await page.route('**/art/vector/**',route=>route.abort());
   await chooseFile(page,target);await expect(page.locator('#toast')).toContainText('scenery could not load',{timeout:20000});
   const failed=await inspect(page);expect(failed.mode).toBe('battle');expect(failed.battle?.encounter).toBe(before.battle?.encounter);
   expect(failed.battle?.units).toEqual(before.battle?.units);expect(failed.state.coins).toBe(before.state.coins);
   await page.unroute('**/art/vector/**');await page.getByRole('button',{name:'Close',exact:true}).click();
   const defend=page.getByRole('button',{name:/^F\s+Defend$/});await expect(defend).toBeEnabled();await defend.click();
   await page.getByRole('button',{name:'Save',exact:true}).first().click();await chooseFile(page,target);
   await world(page,'northglass',71);await expect(page.getByRole('dialog')).toHaveCount(0);
   await page.waitForTimeout(1300);await world(page,'northglass',71);expect(errors).toEqual([]);
  });
 });
}
