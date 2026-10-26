import {test,expect} from '@playwright/test';
import {clickHex,inspect,capture} from './controls';
import {offset} from '../../src/rules/hex';
import {damage,type Unit} from '../../src/rules/combat';

for(const [device,viewport,deviceScaleFactor]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const){
 test.describe(`rich combat ${device}`,()=>{
  test.use({viewport,deviceScaleFactor});
  test('previews and performs a two-character attack with both turns and native poses',async({page})=>{
   const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await page.goto('/?dev=combat');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop');await expect(page.getByRole('heading',{name:'Combat review',exact:true})).toBeVisible();
   await page.getByRole('button',{name:'Practice Prism lance',exact:true}).click();
   await page.getByRole('button',{name:/Prism lance · Team/}).click();await clickHex(page,offset(7,3));
   await expect(page.locator('#confirmation')).toContainText('Nell + Orrin · both turns · 3 focus each');
   await expect(page.getByRole('button',{name:'Confirm attack',exact:true})).toBeInViewport();await capture(page,`prism-preview-${device}`);
   const before=(await inspect(page)).battle!,actor=before.units.find(u=>u.id==='nell')!,partner=before.units.find(u=>u.id==='orrin')!,enemy=before.units.find(u=>u.kind==='guardian')!;
   const predicted=damage(actor as Unit,enemy as Unit,'prism',partner as Unit);
   await page.getByRole('button',{name:'Confirm attack',exact:true}).click();
   await expect.poll(async()=>{const s=await inspect(page);return s.actors.filter(u=>['nell','orrin'].includes(u.hero)&&u.motion==='attack').length;},{intervals:[20,30,50]}).toBe(2);
   const after=(await inspect(page)).battle!;expect(after.units.find(u=>u.id===enemy.id)!.hp).toBe(enemy.hp-predicted);
   expect(after.queue).not.toContain('nell');expect(after.queue).not.toContain('orrin');expect(after.units.find(u=>u.id==='orrin')!.focus).toBe(3);
   await expect.poll(async()=>(await inspect(page)).busy).toBe(false);await capture(page,`prism-result-${device}`);await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
  });
  test('bounces to the displayed second target and manipulates real steam and breakable objects',async({page})=>{
   const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/?dev=combat');
   await page.getByRole('button',{name:'Practice Crossfire',exact:true}).click();
   await page.getByRole('button',{name:/Crossfire · Team/}).click();await clickHex(page,offset(7,3));
   await expect(page.locator('#confirmation')).toContainText('Rail guardian');await expect(page.locator('#confirmation')).toContainText('Ash crow');
   await capture(page,`crossfire-preview-${device}`);const before=(await inspect(page)).battle!;
   await page.getByRole('button',{name:'Confirm attack',exact:true}).click();
   const after=(await inspect(page)).battle!;for(const kind of ['guardian','crow'])expect(after.units.find(u=>u.kind===kind)!.hp).toBeLessThan(before.units.find(u=>u.kind===kind)!.hp);
   expect(after.queue).not.toContain('kit');expect(after.queue).not.toContain('petra');
   await expect.poll(async()=>(await inspect(page)).busy).toBe(false);await page.keyboard.press('Escape');
   await page.getByRole('button',{name:'Practice Prism lance',exact:true}).click();await page.getByRole('button',{name:/Turn valve/}).click();await clickHex(page,offset(3,3));
   await expect(page.locator('#confirmation')).toContainText('steam off');await page.getByRole('button',{name:'Confirm ability',exact:true}).click();
   expect((await inspect(page)).battle!.vents).toHaveLength(0);await expect.poll(async()=>(await inspect(page)).busy).toBe(false);await page.keyboard.press('Escape');
   await page.getByRole('button',{name:'Practice Crossfire',exact:true}).click();await page.getByRole('button',{name:/^1\s+Move$/}).click();await clickHex(page,offset(3,3));await page.getByRole('button',{name:/Confirm move/}).click();await expect.poll(async()=>(await inspect(page)).busy).toBe(false);await page.getByRole('button',{name:/Quick shot$/}).click();await clickHex(page,offset(7,4));
   await expect(page.locator('#confirmation')).toContainText('Pressure drum');await page.getByRole('button',{name:'Confirm attack',exact:true}).click();
   expect((await inspect(page)).battle!.fixtures!.find(f=>f.kind==='drum')!.hp).toBe(0);await expect.poll(async()=>(await inspect(page)).busy).toBe(false);
   await capture(page,`pressure-drum-result-${device}`);expect(errors).toEqual([]);
  });
  test('Daybreak supports the injured party and practice leaves saved builds alone',async({page})=>{
   await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/?dev=combat');
   const stored=await page.evaluate(()=>[localStorage.getItem('borrowed-tomorrow:character-workshop:v1'),localStorage.getItem('borrowed-tomorrow:inventory-workshop:v1')]);
   await page.getByRole('button',{name:'Practice Daybreak',exact:true}).click();const before=(await inspect(page)).battle!;
   await page.getByRole('button',{name:/Daybreak · Team/}).click();await expect(page.locator('#confirmation')).toContainText('Nell + Celia');await page.getByRole('button',{name:'Confirm healing',exact:true}).click();
   const after=(await inspect(page)).battle!;for(const u of after.units.filter(u=>u.side==='party')){expect(u.hp).toBeGreaterThan(before.units.find(v=>v.id===u.id)!.hp);expect(u.guard).toBe(26);}
   expect(after.queue).not.toContain('celia');await capture(page,`daybreak-result-${device}`);
   expect(await page.evaluate(()=>[localStorage.getItem('borrowed-tomorrow:character-workshop:v1'),localStorage.getItem('borrowed-tomorrow:inventory-workshop:v1')])).toEqual(stored);
  });
 });
}
