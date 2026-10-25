import {test,expect} from '@playwright/test';
import {jungleCheckpoint} from '../support/jungle';
import {importSave,approach} from './navigation';
import {inspect,capture} from './controls';
for(const [device,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]as const)for(const reduced of [false,true])test(`Iria carried treatment ${device} ${reduced?'reduced':'moving'}`,async({browser})=>{
 const context=await browser.newContext({viewport,reducedMotion:reduced?'reduce':'no-preference'}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('/');await importSave(page,jungleCheckpoint('rainhouseWon'));await approach(page,'river-treatment');await page.getByRole('button',{name:'Bring Nell and begin the treatment',exact:true}).click();
  await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-river-treatment');
  const next=()=>page.locator('.dialogue-actions button').first().click();
  await next();await next();await next();await expect(page.locator('.dialogue p')).toContainText('This way');
  if(!reduced)await page.waitForTimeout(2300);await capture(page,`iria-carried-${device}-${reduced}`);
  const carried=(await inspect(page)).actors;expect(carried.some(a=>a.texture==='kit-carry')).toBe(true);expect(carried.some(a=>a.texture==='petra-carry')).toBe(true);
  await next();if(!reduced)await page.waitForTimeout(750);await capture(page,`iria-on-cot-${device}-${reduced}`);
  const view=await inspect(page),nell=view.actors.find(a=>a.texture==='nell-ill')!;expect(nell.x).toBe(768);expect(nell.y).toBe(619);expect(view.state.flags.nellRecovered).toBeUndefined();
  await page.getByRole('button',{name:'Skip scene',exact:true}).click();await expect.poll(async()=>(await inspect(page)).state.flags.nellRecovered).toBe(true);
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await context.close();}
});

test('Alda offers the final crossing as a main quest',async({page})=>{
 const {chapterSevenDeparture}=await import('../../src/dev/canonical-saves');const s=chapterSevenDeparture();delete s.flags.chapterSixComplete;s.boundary=null;s.journal=s.journal.filter(f=>f!=='chapterSixComplete');
 await page.goto('/');await importSave(page,s);await approach(page,'capital-departure');await expect(page.getByRole('button',{name:'Prepare the final crossing',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Stay · visit allies and fit equipment',exact:true}).click();expect((await inspect(page)).state.flags.chapterSixComplete).toBeUndefined();await capture(page,'capital-departure-main-quest');
});
