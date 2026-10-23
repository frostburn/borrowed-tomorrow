import { test,expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
test('Maps exposes all Act I scenes, story states and the native carrier arena through Chapter 5',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/?dev=maps');const host=page.locator('#map-workshop');await expect(host).toHaveAttribute('data-ready','true');
 await page.getByRole('button',{name:'Chapter 5',exact:true}).click();
 for(const map of ['airfield','airship','hammerplain','coolingworks','anchorforge']){
  await page.getByRole('group',{name:'Maps in chapter',exact:true}).getByRole('button',{name:map,exact:true}).click();await expect(host).toHaveAttribute('data-ready','true');await expect(host.locator('.map-meta')).toContainText('SVG scene');
  if(process.env.BT_QA_SCREENSHOTS){const data=await page.locator('#map-preview').evaluate(el=>(el as HTMLCanvasElement).toDataURL('image/png').split(',')[1]);await writeFile(`${process.env.BT_QA_SCREENSHOTS}/${map}-whole.png`,Buffer.from(data,'base64'));}
 }
 await page.getByRole('button',{name:'hammerplain',exact:true}).click();await expect(host).toHaveAttribute('data-ready','true');await host.locator('summary').filter({hasText:'Story flags'}).click();await page.getByRole('button',{name:'hammerplainFreed',exact:true}).click();await expect(page.getByRole('button',{name:'hammerplainFreed',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Battle',exact:true}).click();for(const name of ['battle-airfield-guard','battle-hammer-lift','battle-hammer-race','battle-hammer-stores','battle-hammer-carrier'])await expect(page.getByRole('button',{name,exact:true})).toBeVisible();await page.getByRole('button',{name:'battle-hammer-carrier',exact:true}).click();await expect(host).toHaveAttribute('data-ready','true');expect(errors).toEqual([]);
});
