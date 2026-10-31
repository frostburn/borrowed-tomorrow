import {expect,test} from '@playwright/test';
import {northCheckpoint} from '../support/north';
import {approach,importSave} from './navigation';
import {capture,dialogue,inspect} from './controls';

for(const [device,viewport,dpr]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const)
test(`Skeld after the dragon shades only presented frames on ${device}`,async({browser})=>{
 test.setTimeout(120000);
 const context=await browser.newContext({viewport,deviceScaleFactor:dpr,reducedMotion:'no-preference'}),page=await context.newPage(),errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('/');await importSave(page,northCheckpoint('winterDragonConfronted'));
  await approach(page,'north-dragon');await page.getByRole('button',{name:'Face the winter dragon',exact:true}).click();
  await page.getByRole('button',{name:'Win battle',exact:true}).click();await page.getByRole('button',{name:'Continue the journey',exact:true}).click();
  await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-north-release');await dialogue(page);
  expect((await inspect(page)).state.flags.northSealBroken).toBe(true);
  await page.evaluate(async()=>{
   const adventureModule='/src/game/adventure.ts',displayModule='/src/game/pixel-display.ts';
   const {Adventure}=await import(/* @vite-ignore */adventureModule),{PixelDisplay}=await import(/* @vite-ignore */displayModule);
   const probe={updates:0,renders:0,frames:0};(window as any).renderProbe=probe;
   const animating=Object.getOwnPropertyDescriptor(Adventure.prototype,'animating')!,paint=PixelDisplay.prototype.paint;let listening=false;
   Object.defineProperty(Adventure.prototype,'animating',{...animating,get(){
    if(!listening){listening=true;this.events.on('postupdate',()=>probe.updates++);this.events.on('render',()=>probe.renders++);}
    return animating.get!.call(this);
   }});
   PixelDisplay.prototype.paint=function(...args:Parameters<typeof paint>){const last=this.lastPaint;paint.apply(this,args);if(this.lastPaint!==last)probe.frames++;};
  });
  await page.locator('#canvas').focus();await page.mouse.move(0,0);await page.waitForTimeout(250);
  const snapshot=()=>page.evaluate(()=>(window as any).renderProbe as {updates:number;renders:number;frames:number});
  const before=await snapshot();await page.keyboard.down('ArrowDown');await page.waitForTimeout(1800);await page.keyboard.up('ArrowDown');
  await page.keyboard.down('ArrowUp');await page.waitForTimeout(1800);await page.keyboard.up('ArrowUp');
  const after=await snapshot(),renders=after.renders-before.renders,frames=after.frames-before.frames;
  expect(frames).toBeGreaterThan(80);expect(Math.abs(renders-frames)).toBeLessThanOrEqual(1);
  expect(after.updates-before.updates).toBeGreaterThan(renders*1.5);
  await expect.poll(async()=>(await inspect(page)).moving).toBe(false);
  await capture(page,`skeld-released-${device}`);
  // A steady reduced-motion world needs neither shading nor presentation;
  // opening a menu must still render immediately on the same simulation loop.
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(400);
  const idle=await snapshot();await page.waitForTimeout(500);const settled=await snapshot();
  expect(settled.updates-idle.updates).toBeGreaterThan(15);expect(settled.renders-idle.renders).toBe(0);expect(settled.frames-idle.frames).toBe(0);
  await page.getByRole('button',{name:'Equipment',exact:true}).click();await expect(page.getByRole('dialog',{name:'Character inventory'})).toBeVisible();
  await expect.poll(async()=>(await snapshot()).frames).toBeGreaterThan(settled.frames);
  await page.getByRole('button',{name:'Close',exact:true}).click();await expect(page.getByRole('dialog')).toHaveCount(0);
  expect((await inspect(page)).state.flags.northSealBroken).toBe(true);expect(errors).toEqual([]);
 }finally{await context.close();}
});
