import {test,expect,type Page} from '@playwright/test';
import {sampleRegulator} from './conduit-controls';
import {inspect,capture,clickHex} from './controls';
import {importSave} from './navigation';
import {checkpoint} from '../support/progress';
import {occupiedHexes} from '../../src/rules/footprint';
import {damage,type Battle} from '../../src/rules/combat';
import {offset,toPixel} from '../../src/rules/hex';

const route='/?dev=boss&boss=conduit';
async function clickBody(page:Page){
 const view=(await inspect(page)).view,box=(await page.locator('#canvas canvas').boundingBox())!;
 await page.mouse.click(box.x+(463-view.scrollX)*box.width/view.width,box.y+150*box.height/view.height);
}
async function ready(page:Page){await expect.poll(async()=>(await inspect(page)).busy).toBe(false);}
async function moveTo(page:Page,col:number,row:number){
 await page.getByRole('button',{name:/^1\s+Move \/ Strike$/}).click();await clickHex(page,offset(col,row));await page.getByRole('button',{name:/^Confirm move/}).click();await ready(page);
}
for(const [device,viewport,dpr]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const){
 test(`conduit boss previews both routes, targets three contacts and preserves the campaign on ${device}`,async({browser})=>{
  const context=await browser.newContext({viewport,deviceScaleFactor:dpr,reducedMotion:'reduce'}),page=await context.newPage();
  try{
   const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await page.goto('/');await importSave(page,checkpoint('orrinJoined'));const original=(await inspect(page)).state;
   await page.goto(route);await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop',{timeout:30000});await expect(page.getByRole('heading',{name:'Heart regulator',exact:true})).toBeVisible();
   await expect(page.getByRole('region',{name:'Boss battle preview'})).toBeVisible();await capture(page,`conduit-picker-${device}`);
   await page.getByRole('button',{name:'Start Chapter Three preset',exact:true}).click();
   await expect.poll(async()=>(await inspect(page)).battle?.encounter).toBe('dev-conduit-feeds');
   const start=await inspect(page),boss=start.battle!.units.find(u=>u.id==='conduit-regulator')!,body=occupiedHexes(boss);
   expect(body).toHaveLength(3);expect(start.battle!.units.filter(u=>u.side==='party')).toHaveLength(3);
   expect(start.actors.filter(a=>['nell','orrin','kit'].includes(a.hero)).every(a=>a.texture.endsWith('-back'))).toBe(true);
   expect(start.battle!.units.filter(u=>u.side==='party').every(u=>toPixel(u.hex).y>Math.max(...body.map(h=>toPixel(h).y)))).toBe(true);
   await capture(page,`conduit-sealed-${device}`);
   // Kit acts first. Hold the right plate, then Nell completes the circuit.
   await moveTo(page,7,5);await page.getByRole('button',{name:/^F\s+Defend$/}).click();await ready(page);
   await moveTo(page,3,5);expect((await inspect(page)).battle!.grounding!.open).toBe(true);
   const open=(await inspect(page)).battle!,regulator=open.units.find(u=>u.id==='conduit-regulator')!,nell=open.units.find(u=>u.id==='nell')!;
   expect(regulator.sealed).toBe(false);await page.getByRole('button',{name:/Lantern burst$/}).click();await clickBody(page);
   await expect(page.locator('#confirmation')).toContainText('Heart regulator');await capture(page,`conduit-aim-${device}`);
   await page.getByRole('button',{name:'Confirm attack',exact:true}).click();await ready(page);
   expect((await inspect(page)).battle!.units.find(u=>u.id==='conduit-regulator')!.hp).toBe(regulator.hp-damage(nell,regulator,'burst'));
   await page.getByRole('button',{name:'Restart battle',exact:true}).click();expect((await inspect(page)).battle!.grounding!.open).toBe(false);
   await page.getByRole('button',{name:'Win battle',exact:true}).click();await expect(page.getByRole('heading',{name:'Practice complete',exact:true})).toBeVisible();await page.getByRole('button',{name:'Back to workshop',exact:true}).click();
   await page.getByRole('button',{name:'Pressure walk',exact:true}).click();await expect(page).toHaveURL(/route=pressure/);await page.getByRole('button',{name:'Start Chapter Three preset',exact:true}).click();
   expect((await inspect(page)).battle!.vents).toHaveLength(4);expect((await inspect(page)).battle!.units.filter(u=>u.kind==='crow')).toHaveLength(2);await capture(page,`conduit-pressure-${device}`);
   for(let i=0;i<3;i++){await ready(page);await page.getByRole('button',{name:/^F\s+Defend$/}).click();}
   await expect.poll(async()=>(await inspect(page)).battle!.round).toBe(2);await ready(page);
   const cycled=(await inspect(page)).battle! as unknown as Battle;expect(cycled.units.find(u=>u.id==='conduit-regulator')!.intent!.name).toBe('Scouring jets');expect(cycled.log.some(t=>t.includes('Pressure lock hits'))).toBe(true);
   await capture(page,`conduit-jets-${device}`);await page.keyboard.press('Escape');
   await page.getByRole('button',{name:'The Benefactor',exact:true}).click();await expect(page.getByRole('button',{name:'Start finale preset',exact:true})).toBeVisible();
   await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
   await page.goto('/');await page.getByRole('button',{name:'Continue',exact:true}).click();const returned=(await inspect(page)).state;expect({...returned,playSeconds:original.playSeconds}).toEqual(original);
  }finally{await context.close();}
 });
}
test('one workshop companion can preview pressure walk but cannot start an unsolvable sealed intake',async({page})=>{
 await page.goto(route);await page.getByRole('button',{name:'Character',exact:true}).click();await page.getByRole('button',{name:'Orrin',exact:true}).click();await page.getByRole('button',{name:'Remove Orrin from party',exact:true}).click();
 await page.getByRole('button',{name:'Bosses',exact:true}).click();await expect(page.getByRole('button',{name:'Use workshop party',exact:true})).toBeDisabled();
 await page.getByRole('button',{name:'Pressure walk',exact:true}).click();await page.getByRole('button',{name:'Use workshop party',exact:true}).click();expect((await inspect(page)).battle!.units.filter(u=>u.side==='party').map(u=>u.id)).toEqual(['nell']);
});
test('the regulator cycles pressure with a parked pointer, discharges, and cancels attacks on restart',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'no-preference'});
 await page.goto(`${route}&route=pressure`);await page.getByRole('button',{name:'Start Chapter Three preset',exact:true}).click();await page.mouse.move(0,0);
 const samples=(ms:number)=>sampleRegulator(page,ms);
 const idle=await samples(1800);expect(new Set(idle.map(s=>s.frame)).size).toBe(8);expect(idle.every(s=>s.motion==='mechanical')).toBe(true);expect(new Set(idle.map(s=>s.pixels)).size).toBeGreaterThan(3);
 expect(new Set(idle.map(s=>s.casing)).size,'the cowl and casing remain rigid through the idle cycle').toBe(1);expect(new Set(idle.map(s=>s.chassis)).size,'the lower chassis has no moving mechanism').toBe(1);expect(new Set(idle.map(s=>s.drive)).size,'the side compressor visibly operates').toBeGreaterThan(3);
 for(let i=0;i<2;i++){await ready(page);await page.getByRole('button',{name:/^F\s+Defend$/}).click();}
 await ready(page);await page.getByRole('button',{name:/^F\s+Defend$/}).click();
 const attack=await samples(1800);expect(attack.some(s=>Number(s.frame)>=8&&s.motion==='attack')).toBe(true);await expect.poll(async()=>(await inspect(page)).battle!.round).toBe(2);
 await ready(page);await capture(page,'conduit-pressure-cycle');await page.getByRole('button',{name:'Restart battle',exact:true}).click();
 for(let i=0;i<3;i++){await ready(page);await page.getByRole('button',{name:/^F\s+Defend$/}).click();}
 await expect.poll(async()=>(await inspect(page)).actors.find(a=>a.hero==='conduit-regulator')?.motion).toBe('attack');await capture(page,'conduit-discharge-windup');
 await page.getByRole('button',{name:'Restart battle',exact:true}).click();await page.mouse.move(0,0);expect((await samples(1200)).every(s=>Number(s.frame)<8)).toBe(true);expect((await inspect(page)).battle!.round).toBe(1);
 await page.emulateMedia({reducedMotion:'reduce'});await expect.poll(async()=>(await inspect(page)).actors.find(a=>a.hero==='conduit-regulator')?.motion).toBe('idle');await page.waitForTimeout(100);expect(new Set((await samples(900)).map(s=>s.pixels)).size).toBe(1);expect(errors).toEqual([]);
});
