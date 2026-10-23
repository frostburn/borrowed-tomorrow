import { test,expect } from '@playwright/test';
for(const [device,viewport,dpr]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const)test(`canonical group and Workshop remain reachable on ${device}`,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:dpr}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');
  await expect(page.getByRole('heading',{name:'Canonical saves',exact:true})).toBeVisible({timeout:20000});
  const group=page.getByRole('region',{name:'Canonical saves',exact:true}),workshop=page.getByRole('button',{name:'Workshop',exact:true});
  await expect(group.getByRole('button')).toHaveCount(10);
  const stage=(await page.locator('.stage-wrap').boundingBox())!;
  // Test actual transformed hit-target positions, not just DOM presence.
  for(const button of [workshop,...await group.getByRole('button').all()]){
   const b=(await button.boundingBox())!;expect(b.y).toBeGreaterThanOrEqual(stage.y);expect(b.y+b.height).toBeLessThanOrEqual(stage.y+stage.height+1);expect(b.x).toBeGreaterThanOrEqual(stage.x);expect(b.x+b.width).toBeLessThanOrEqual(stage.x+stage.width+1);
  }
  expect(await page.locator('.title-panel').evaluate(e=>e.scrollTop)).toBe(0);
  if(process.env.BT_QA_SCREENSHOTS)await page.screenshot({path:`${process.env.BT_QA_SCREENSHOTS}/title-presets-${device}.png`});
  await group.getByRole('button',{name:'Begin winter dragon (canonical)',exact:true}).click();
  await expect(page.getByRole('button',{name:'Nell ill · Kit, Orrin and Petra',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Close',exact:true}).click();
  await workshop.click();await expect(page).toHaveURL(/dev=workshop/);await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop',{timeout:20000});await expect(page.getByRole('navigation',{name:'Workshop panels'})).toBeVisible();
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await context.close();}
});
