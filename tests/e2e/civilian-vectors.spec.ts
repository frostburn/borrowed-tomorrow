import {test,expect} from '@playwright/test';
import {CIVILIANS} from '../../src/content/civilians';
import {artPath} from '../../src/content/art-assets';
import {capture} from './controls';
for(const [device,viewport,dpr] of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]] as const){
 test.describe(`vector civilians on ${device}`,()=>{
  test.use({viewport,deviceScaleFactor:dpr});
  test('reviews all nine native SVG roles and clothing variants without changing saves',async({page})=>{
   const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/?dev=sprites');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop');
   const stored=await page.evaluate(()=>JSON.stringify(localStorage));await page.getByRole('button',{name:'NPCs (21)',exact:true}).click();
   for(const [id,role] of Object.entries(CIVILIANS)){
    await page.getByRole('button',{name:`Inspect ${role.name}`,exact:true}).click();await expect(page.locator('.sprite-file')).toContainText(artPath(id));
    await expect(page.locator('.sprite-reference')).toContainText('Actor: 80 x 80');await expect(page.getByRole('region',{name:'Pixel Art Fixer review',exact:true})).toHaveCount(0);
    const dimensions=await page.evaluate(async url=>{const i=new Image();i.src=url;await i.decode();return [i.naturalWidth,i.naturalHeight];},'/'+artPath(id));expect(dimensions).toEqual([80,80]);
   }
   await capture(page,`vector-civilians-${device}`);expect(await page.evaluate(()=>JSON.stringify(localStorage))).toBe(stored);expect(errors).toEqual([]);await expect(page.locator('vite-error-overlay')).toHaveCount(0);
  });
 });
}
