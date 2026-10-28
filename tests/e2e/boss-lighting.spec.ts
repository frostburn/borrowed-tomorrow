import {test,expect,type Page} from '@playwright/test';
import {inspect,capture} from './controls';
async function floorHash(page:Page){return page.evaluate(()=>{
 const view=window.borrowedTomorrow.inspect().view,info=window.borrowedTomorrowPixels.inspect();
 const source=document.querySelector('.pixel-source')!.getBoundingClientRect(),world=document.querySelector('.world-input')!.getBoundingClientRect();
 const x=info.physicalLeft+(Math.round((world.left-source.left)/info.cssScale)+620-view.scrollX)*info.physicalScale,y=info.physicalTop+(Math.round((world.top-source.top)/info.cssScale)+350-view.scrollY)*info.physicalScale;
 const data=document.querySelector<HTMLCanvasElement>('.pixel-output')!.getContext('2d')!.getImageData(Math.round(x),Math.round(y),18*info.physicalScale,12*info.physicalScale).data;
 let hash=2166136261;for(let i=0;i<data.length;i+=4)for(let c=0;c<3;c++)hash=Math.imul(hash^data[i+c],16777619);return hash>>>0;
});}
for(const [device,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]as const)test(`final boss lighting keeps three distinct readable forms and resets on ${device}`,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:1.25,reducedMotion:'reduce'}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 try{
  const colors=[];
  for(const form of [0,1,2]){
   await page.goto('/?dev=boss');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop',{timeout:30000});
   await page.locator(`[data-final-form="${form}"]`).click();await expect.poll(async()=>(await inspect(page)).mode).toBe('battle');await page.mouse.move(1,1);
   const original=(await inspect(page)).battle!,hash=await floorHash(page);colors.push(hash);await capture(page,`lighting-final-${form}-${device}`);
   await page.getByRole('button',{name:'Restart battle',exact:true}).click();expect((await inspect(page)).battle!.round).toBe(1);expect(await floorHash(page)).toBe(hash);
   expect((await inspect(page)).battle!.units.map(u=>[u.id,u.hp])).toEqual(original.units.map(u=>[u.id,u.hp]));
   await page.keyboard.press('Escape');await expect(page.getByRole('region',{name:'Boss battle preview',exact:true})).toBeVisible();
  }
  expect(new Set(colors).size).toBe(3);await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await context.close();}
});
test('boss floor lighting changes on scene time with a parked cursor and settles for reduced motion',async({page},info)=>{
 await page.goto('/?dev=boss');await page.locator('[data-final-form="0"]').click();await expect.poll(async()=>(await inspect(page)).mode).toBe('battle');await page.mouse.move(1,1);
 const hashes=new Set<number>();for(let i=0;i<18;i++){hashes.add(await floorHash(page));await page.waitForTimeout(200);}expect(hashes.size).toBeGreaterThan(1);
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(500);const still=await floorHash(page);await page.waitForTimeout(1200);expect(await floorHash(page)).toBe(still);await capture(page,'lighting-reduced-motion');
 await page.emulateMedia({reducedMotion:'no-preference'});
 for(let i=0;i<10&&(await inspect(page)).battle!.round<2;i++){
  await expect.poll(async()=>(await inspect(page)).busy).toBe(false);
  const defend=page.getByRole('button',{name:/^F\s+Defend$/});if(await defend.isVisible())await defend.click();else await page.waitForTimeout(250);
 }
 await expect.poll(async()=>(await inspect(page)).battle!.round).toBeGreaterThanOrEqual(2);await capture(page,'lighting-after-judgment');
 const frames=await page.evaluate(()=>new Promise<number[]>(resolve=>{const samples:number[]=[];let last=performance.now(),start=last;const tick=(now:number)=>{samples.push(now-last);last=now;if(now-start<1500)requestAnimationFrame(tick);else resolve(samples);};requestAnimationFrame(tick);}));
 await info.attach('lit-boss-frame-times',{body:JSON.stringify({average:frames.reduce((a,b)=>a+b,0)/frames.length,max:Math.max(...frames)}),contentType:'application/json'});
 expect(frames.reduce((a,b)=>a+b,0)/frames.length).toBeLessThan(100);
});
