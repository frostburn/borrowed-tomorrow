import {test,expect} from '@playwright/test';
import {CAMPAIGN_BOSSES} from '../../src/dev/boss-catalog';
import {inspect,capture} from './controls';
import {importSave} from './navigation';
import {checkpoint} from '../support/progress';
for(const [device,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]as const)test(`all missing campaign bosses preview and restart without touching saves on ${device}`,async({browser})=>{
 test.setTimeout(240000);
 const context=await browser.newContext({viewport,deviceScaleFactor:1.25,reducedMotion:'reduce'}),page=await context.newPage(),errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 try{
  await page.goto('/');await importSave(page,checkpoint('orrinJoined'));const original=(await inspect(page)).state;
  await page.goto('/?dev=boss');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop',{timeout:30000});
  await expect(page.getByRole('group',{name:'Chapter 7 bosses',exact:true})).toBeVisible();await capture(page,`boss-catalog-${device}`);
  for(const entry of CAMPAIGN_BOSSES){
   await page.locator(`[data-boss="${entry.id}"]`).click();await expect(page).toHaveURL(new RegExp(`boss=${entry.id}(?:&|$)`));
   const portrait=page.locator('.boss-preview>img');await expect(portrait).toHaveAttribute('alt',entry.label);
   await expect.poll(()=>portrait.evaluate((image:HTMLImageElement)=>image.complete&&image.naturalWidth>0)).toBe(true);
   await page.getByRole('button',{name:/^Start Chapter .* preset$/}).click();await expect.poll(async()=>(await inspect(page)).mode,{timeout:30000}).toBe('battle');
   const first=(await inspect(page)).battle!;expect(first.encounter).toBe(entry.encounter);expect(first.units.filter(u=>u.side==='party').map(u=>u.id)).toEqual(entry.party);
   if(['furnace','ward','domain-collector','domain-ward','alban','petra'].includes(entry.id))await capture(page,`boss-catalog-${entry.id}-${device}`);
   await page.getByRole('button',{name:'Restart battle',exact:true}).click();expect((await inspect(page)).battle!.units.map(u=>[u.id,u.hp,u.hex])).toEqual(first.units.map(u=>[u.id,u.hp,u.hex]));
   await page.getByRole('button',{name:'Win battle',exact:true}).click();await expect(page.getByRole('heading',{name:'Practice complete',exact:true})).toBeVisible();
   await page.getByRole('button',{name:'Back to workshop',exact:true}).click();await expect(page.getByRole('region',{name:'Boss battle preview',exact:true})).toBeVisible();
  }
  await page.locator('[data-boss="furnace"]').click();await page.getByRole('button',{name:'Use workshop party',exact:true}).click();
  await expect.poll(async()=>(await inspect(page)).mode).toBe('battle');expect((await inspect(page)).battle!.units.filter(u=>u.side==='party').map(u=>u.id)).toEqual(['nell','orrin']);
  await page.keyboard.press('Escape');await page.reload();await expect(page.locator('[data-boss="furnace"]')).toHaveAttribute('aria-pressed','true',{timeout:30000});
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
  await page.goto('/');await page.getByRole('button',{name:'Continue',exact:true}).click();const returned=(await inspect(page)).state;expect({...returned,playSeconds:original.playSeconds}).toEqual(original);
 }finally{await context.close();}
});
test('a missing boss image leaves the catalogue usable and can be retried',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 const asset='**/art/vector/chapter-five/furnace-carrier-battle.svg';await page.route(asset,route=>route.abort());
 await page.goto('/?dev=boss&boss=furnace');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop',{timeout:30000});
 await page.getByRole('button',{name:'Start Chapter Five preset',exact:true}).click();
 await expect(page.getByText('The boss arena could not load. Try starting the preview again.',{exact:true})).toBeVisible({timeout:30000});
 expect((await inspect(page)).mode).not.toBe('battle');await expect(page.getByRole('button',{name:'Start Chapter Five preset',exact:true})).toBeEnabled();
 await page.unroute(asset);await page.getByRole('button',{name:'Start Chapter Five preset',exact:true}).click();
 await expect.poll(async()=>(await inspect(page)).battle?.encounter).toBe('hammer-carrier');expect(errors).toEqual([]);
});
test('leaving and returning during a delayed arena load cancels entry into the fight',async({page})=>{
 let release!:()=>void;const gate=new Promise<void>(resolve=>release=resolve),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/art/vector/chapter-five/furnace-carrier-battle.svg',async route=>{await gate;await route.continue();});
 try{
  await page.goto('/?dev=boss&boss=furnace');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop',{timeout:30000});
  await page.getByRole('button',{name:'Start Chapter Five preset',exact:true}).click();await expect(page.locator('#status')).toHaveText('Loading boss arena…');
  await page.locator('[data-boss="benefactor"]').click();for(const button of await page.locator('[data-final-form]').all())await expect(button).toBeDisabled();
  await page.locator('[data-boss="furnace"]').click();await page.locator('[data-tab="character"]').click();await page.locator('[data-tab="bosses"]').click();
  release();await expect(page.getByRole('button',{name:'Start Chapter Five preset',exact:true})).toBeEnabled({timeout:30000});
  expect((await inspect(page)).mode).not.toBe('battle');
  await page.getByRole('button',{name:'Start Chapter Five preset',exact:true}).click();await expect.poll(async()=>(await inspect(page)).battle?.encounter).toBe('hammer-carrier');expect(errors).toEqual([]);
 }finally{release();}
});
