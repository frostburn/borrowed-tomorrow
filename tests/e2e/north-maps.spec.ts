import { test,expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
test('Maps reviews all northern SVG worlds and tactical floors',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto('/?dev=maps&map=bellharbor');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop',{timeout:20000});
 const host=page.locator('#map-workshop');await expect(host).toHaveAttribute('data-ready','true',{timeout:20000});
 const capture=async(id:string)=>{if(process.env.BT_QA_SCREENSHOTS){const url=await page.locator('#map-preview').evaluate(el=>(el as HTMLCanvasElement).toDataURL());await writeFile(`${process.env.BT_QA_SCREENSHOTS}/${id}-whole-map.png`,Buffer.from(url.split(',')[1],'base64'));}};
 await page.locator('[data-map-chapter="6"]').click();
 for(const id of ['bellharbor','frostwatch','glacier','wintershrine','capitalquay']){await page.locator(`[data-map="${id}"]`).click();await expect(host).toHaveAttribute('data-ready','true',{timeout:20000});await expect(host.locator('.map-meta')).toContainText('SVG scene');await capture(id);}
 await page.locator('[data-map-kind="Battle"]').click();
 for(const id of ['battle-north-watch','battle-north-hunters','battle-north-cache','battle-winter-dragon']){await page.locator(`[data-map="${id}"]`).click();await expect(host).toHaveAttribute('data-ready','true',{timeout:20000});await capture(id);}
 expect(errors).toEqual([]);
});
