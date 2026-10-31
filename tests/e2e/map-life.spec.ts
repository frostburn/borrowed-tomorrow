import {test,expect,type Page} from '@playwright/test';
import {checkpoint,coastCheckpoint} from '../support/progress';
import {importSave} from './navigation';
import {inspect,capture} from './controls';
test.setTimeout(30000);
const bitmap=(page:Page,selector='.phaser-host canvas')=>page.locator(selector).evaluate(c=>{let hash=0;for(const n of (c as HTMLCanvasElement).toDataURL())hash=(Math.imul(hash,31)+n.charCodeAt(0))|0;return hash;});

for(const [device,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]as const)test(`scenery moves with a parked cursor and settles for reduced motion on ${device}`,async({page})=>{
 await page.setViewportSize(viewport);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await importSave(page,checkpoint('villageFreed'));await expect.poll(async()=>(await inspect(page)).ambient?.water).toBe(true);
 const before=(await inspect(page)).state,native=await bitmap(page),visible=await bitmap(page,'.pixel-output');
 await expect.poll(()=>bitmap(page),{timeout:6000}).not.toBe(native);await expect.poll(()=>bitmap(page,'.pixel-output'),{timeout:6000}).not.toBe(visible);
 expect((await inspect(page)).state).toEqual({...before,playSeconds:expect.any(Number)});await capture(page,`ambient-station-${device}`);
 await page.emulateMedia({reducedMotion:'reduce'});await expect.poll(async()=>(await inspect(page)).ambient?.frame).toBe(-1);
 const still=await bitmap(page);await page.waitForTimeout(400);expect(await bitmap(page)).toBe(still);expect(errors).toEqual([]);
});

test('Rillbridge stays arrested until released, including on restored saves',async({page})=>{
 await page.goto('/');await importSave(page,checkpoint('collectorConfronted'));
 await expect.poll(async()=>(await inspect(page)).ambient?.enabled).toBe(false);
 const frozen=await bitmap(page);await page.waitForTimeout(400);expect(await bitmap(page)).toBe(frozen);
 await importSave(page,checkpoint('villageFreed'));await expect.poll(async()=>(await inspect(page)).ambient?.water).toBe(true);
 const freed=await bitmap(page);await expect.poll(()=>bitmap(page),{timeout:6000}).not.toBe(freed);await capture(page,'ambient-rillbridge-released');
});

test('Maps workshop previews story-aware motion and stops after leaving the panel',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/?dev=maps&map=rillbridge&mapMotion=1');
 const host=page.locator('#map-workshop');await expect(host).toHaveAttribute('data-ready','true');
 const frozen=await bitmap(page,'#map-preview');await page.waitForTimeout(400);expect(await bitmap(page,'#map-preview')).toBe(frozen);
 await host.locator('summary').filter({hasText:'Story flags'}).click();await host.getByRole('button',{name:'villageFreed',exact:true}).click();
 const freed=await bitmap(page,'#map-preview');await expect.poll(()=>bitmap(page,'#map-preview'),{timeout:6000}).not.toBe(freed);
 await host.getByRole('button',{name:'Scenery motion',exact:true}).click();const still=await bitmap(page,'#map-preview');await page.waitForTimeout(400);expect(await bitmap(page,'#map-preview')).toBe(still);
 await host.getByRole('button',{name:'Scenery motion',exact:true}).click();
 const element=(await host.elementHandle())!;await page.getByRole('navigation',{name:'Workshop panels'}).getByRole('button',{name:'Sprites',exact:true}).click();const paint=await element.evaluate(h=>h.dataset.paint);await page.waitForTimeout(400);expect(await element.evaluate(h=>h.dataset.paint)).toBe(paint);expect(errors).toEqual([]);
});

test('harbor boats remain live outside the floor cache and pause with Equipment',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 const save=coastCheckpoint('coastSeen');save.location={map:'coast',x:28,y:14};await importSave(page,save);
 await expect.poll(async()=>(await inspect(page)).ambient?.boats).toBe(4);
 const before=(await inspect(page)).state,start=await bitmap(page);
 await expect.poll(()=>bitmap(page),{timeout:6000}).not.toBe(start);
 await page.getByRole('button',{name:'Equipment',exact:true}).click();const paused=(await inspect(page)).ambient!.frame;
 await page.waitForTimeout(400);expect((await inspect(page)).ambient!.frame).toBe(paused);
 await page.emulateMedia({reducedMotion:'reduce'});await expect.poll(async()=>(await inspect(page)).ambient?.frame).toBe(-1);
 await page.keyboard.press('Escape');const still=await bitmap(page);await page.waitForTimeout(400);expect(await bitmap(page)).toBe(still);
 expect((await inspect(page)).state).toEqual({...before,playSeconds:expect.any(Number)});expect(errors).toEqual([]);
});

for(const [map,flags]of [['tunnel',''],['breakwater','sanctuaryWardenWon,harborOpened'],['airship','fleetSighted,emperorOfferTold,allAnchorsSeen'],['bellharbor',''],['hollowsill','takenPeopleFreed']]as const)test(`Maps shares the ambient painters and reduced motion in ${map}`,async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`/?dev=maps&map=${map}&mapMotion=1&mapOverlays=&mapFlags=${flags}`);
 const host=page.locator('#map-workshop');await expect(host).toHaveAttribute('data-ready','true');
 const start=await bitmap(page,'#map-preview');await expect.poll(()=>bitmap(page,'#map-preview'),{timeout:6000}).not.toBe(start);
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(200);
 const still=await bitmap(page,'#map-preview');await page.waitForTimeout(400);expect(await bitmap(page,'#map-preview')).toBe(still);
 expect(errors).toEqual([]);
});
