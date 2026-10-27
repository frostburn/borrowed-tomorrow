import {test,expect,type Page} from '@playwright/test';
import {checkpoint,coastCheckpoint} from '../support/progress';
import {importSave} from './navigation';
import {inspect,capture,clickWorld} from './controls';
test.setTimeout(60000);
const signature=async(page:Page)=>JSON.stringify((await inspect(page)).people.map(p=>[p.id,p.x,p.y,p.texture,p.frame]));
const bitmap=(page:Page,selector='.phaser-host canvas')=>page.locator(selector).evaluate((c:HTMLCanvasElement)=>c.toDataURL());

for(const [name,viewport,dpr]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const)test(`people move with a parked cursor, freeze for collection and settle for reduced motion on ${name}`,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:dpr,reducedMotion:'reduce'}),page=await context.newPage(),errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 try{
  await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');await importSave(page,checkpoint('festivalSeen'));
  const before=(await inspect(page)).state,still=await signature(page),native=await bitmap(page),output=await bitmap(page,'.pixel-output');
  expect((await inspect(page)).people).toHaveLength(2);
  await page.emulateMedia({reducedMotion:'no-preference'});
  await expect.poll(()=>signature(page),{timeout:8000}).not.toBe(still);
  await expect.poll(()=>bitmap(page),{timeout:8000}).not.toBe(native);await expect.poll(()=>bitmap(page,'.pixel-output'),{timeout:8000}).not.toBe(output);
  const moving=(await inspect(page)).people;
  for(const p of moving){expect(p.depth).toBe(p.y);expect([p.sourceWidth,p.sourceHeight]).toEqual([80,80]);expect(p.filter).toBe(1);}
  expect((await inspect(page)).state).toEqual({...before,playSeconds:expect.any(Number)});await capture(page,`people-live-${name}`);
  await page.getByRole('button',{name:'Equipment',exact:true}).click();const paused=await signature(page);await page.waitForTimeout(500);expect(await signature(page)).toBe(paused);
  await page.keyboard.press('Escape');
  await page.emulateMedia({reducedMotion:'reduce'});await expect.poll(async()=>(await inspect(page)).people.every(p=>p.motion==='idle'&&!p.texture.endsWith('-ambient'))).toBe(true);
  const settled=await bitmap(page);await page.waitForTimeout(500);expect(await bitmap(page)).toBe(settled);
  await importSave(page,checkpoint('collectorConfronted'));await page.emulateMedia({reducedMotion:'no-preference'});
  const frozen=await signature(page);await page.waitForTimeout(1800);expect(await signature(page)).toBe(frozen);
  expect((await inspect(page)).people).toHaveLength(2);await capture(page,`people-frozen-${name}`);
  await importSave(page,checkpoint('villageFreed'));const released=await signature(page);await expect.poll(()=>signature(page),{timeout:8000}).not.toBe(released);await capture(page,`people-released-${name}`);
  await page.emulateMedia({reducedMotion:'reduce'});const coast=coastCheckpoint('coastSeen');coast.location={map:'coast',x:28,y:27};await importSave(page,coast);
  await clickWorld(page,32,27);await expect.poll(async()=>{const s=await inspect(page);return !s.moving&&s.state.location.x===32&&s.state.location.y===27;}).toBe(true);
  await expect(page.locator('.dialogue')).toHaveCount(0);expect((await inspect(page)).state.flags).toEqual(coast.flags);
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await context.close();}
});

test('Maps animates released residents and stops when motion is disabled or the panel closes',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/?dev=maps&map=rillbridge&mapMotion=1');
 const host=page.locator('#map-workshop');await expect(host).toHaveAttribute('data-ready','true');
 const frozen=await bitmap(page,'#map-preview');await page.waitForTimeout(1500);expect(await bitmap(page,'#map-preview')).toBe(frozen);
 await host.locator('summary').filter({hasText:'Story flags'}).click();await host.getByRole('button',{name:'villageFreed',exact:true}).click();
 const freed=await bitmap(page,'#map-preview');await expect.poll(()=>bitmap(page,'#map-preview'),{timeout:8000}).not.toBe(freed);
 await host.getByRole('button',{name:'Scenery motion',exact:true}).click();const still=await bitmap(page,'#map-preview');await page.waitForTimeout(500);expect(await bitmap(page,'#map-preview')).toBe(still);
 await host.getByRole('button',{name:'Scenery motion',exact:true}).click();const element=(await host.elementHandle())!;
 await page.getByRole('navigation',{name:'Workshop panels'}).getByRole('button',{name:'Sprites',exact:true}).click();const paint=await element.evaluate(h=>h.dataset.paint);await page.waitForTimeout(500);expect(await element.evaluate(h=>h.dataset.paint)).toBe(paint);
 expect(errors).toEqual([]);
});
