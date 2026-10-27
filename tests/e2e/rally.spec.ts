import {test,expect} from '@playwright/test';
import {inspect,clickHex,capture} from './controls';
import {offset} from '../../src/rules/hex';
import {rallyBonus} from '../../src/rules/rally';

// Opt-in rendered checks; no complete journeys are added to the @ci gate.
for(const [device,viewport,dpr]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const){
 test.describe(`Rallying cry on ${device}`,()=>{
  test.use({viewport,deviceScaleFactor:dpr,reducedMotion:'reduce'});
  for(const rank of [1,2,3])test(`rank ${rank} shows its field, follows movement and regenerates on real turns`,async({page})=>{
   const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await page.goto('/?dev=combat');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop');
   await page.getByRole('button',{name:`Practice Rallying cry ${['I','II','III'][rank-1]}`,exact:true}).click();
   await page.getByRole('button',{name:/Rallying cry/}).click();await expect(page.locator('#confirmation')).toContainText('No immediate focus');
   await capture(page,`rally-${rank}-preview-${device}`);
   await page.getByRole('button',{name:'Confirm ability',exact:true}).click();
   await expect.poll(async()=>{const s=await inspect(page);return !s.busy&&s.battle?.queue[0];},{timeout:15000}).toBe('kit');
   const b=(await inspect(page)).battle!,celia=b.units.find(u=>u.id==='celia')!,kit=b.units.find(u=>u.id==='kit')!;
   expect(celia.focus).toBe(3);expect(kit.focus).toBe(3);expect(celia.rally).toEqual({rank,expiresRound:4});
   await expect(page.locator('.initiative')).toContainText('Cry 3 rounds');await expect(page.locator('.identity .role')).toContainText('Focus regen +1');
   await capture(page,`rally-${rank}-active-${device}`);
   await page.getByRole('button',{name:/^1\s+Move$/}).click();await clickHex(page,offset(4,2));await page.getByRole('button',{name:/Confirm move/}).click();
   await expect.poll(async()=>(await inspect(page)).busy).toBe(false);
   const moved=(await inspect(page)).battle!,movingKit=moved.units.find(u=>u.id==='kit')!;
   expect(rallyBonus(moved,movingKit)).toBe(rank===3?1:0);expect(movingKit.focus).toBe(3);
   if(rank===3)await expect(page.locator('.identity .role')).toContainText('Focus regen +1');else await expect(page.locator('.identity .role')).not.toContainText('Focus regen +1');
   for(let i=0;i<12;i++){
    await expect.poll(async()=>(await inspect(page)).busy).toBe(false);
    const s=await inspect(page);if(s.battle!.round===2&&s.battle!.queue[0]==='celia')break;
    await page.getByRole('button',{name:/^F\s+Defend$/}).first().click();
   }
   const next=(await inspect(page)).battle!,source=next.units.find(u=>u.id==='celia')!;
   expect(next.round).toBe(2);expect(next.queue[0]).toBe('celia');expect(source.focus).toBe(rank===1?4:5);
   await expect(page.locator('.initiative')).toContainText('Cry 2 rounds');await capture(page,`rally-${rank}-next-${device}`);
   await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
  });
 });
}
