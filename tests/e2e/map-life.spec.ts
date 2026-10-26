import {test,expect,type Page} from '@playwright/test';
import {checkpoint} from '../support/progress';
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
