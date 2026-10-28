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

async function brightness(page:Page,x:number,y:number){return page.evaluate(({x,y})=>{
 const view=window.borrowedTomorrow.inspect().view,info=window.borrowedTomorrowPixels.inspect();
 const source=document.querySelector('.pixel-source')!.getBoundingClientRect(),world=document.querySelector('.world-input')!.getBoundingClientRect();
 const px=info.physicalLeft+(Math.round((world.left-source.left)/info.cssScale)+x-view.scrollX)*info.physicalScale,py=info.physicalTop+(Math.round((world.top-source.top)/info.cssScale)+y-view.scrollY)*info.physicalScale;
 const data=document.querySelector<HTMLCanvasElement>('.pixel-output')!.getContext('2d')!.getImageData(Math.round(px),Math.round(py),2*info.physicalScale,2*info.physicalScale).data;
 let value=0;for(let i=0;i<data.length;i+=4)value+=.2126*data[i]+.7152*data[i+1]+.0722*data[i+2];return value/(data.length/4);
 },{x,y});}

for(const [device,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]as const)test(`boss attacks isolate their fired hexes and restore front light on ${device}`,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:1.25}),page=await context.newPage(),errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 try{
  await page.goto('/?dev=boss');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop',{timeout:30000});
  await page.locator('[data-final-form="0"]').click();await expect.poll(async()=>(await inspect(page)).mode).toBe('battle');await page.mouse.move(1,1);
  // Deterministic scene-clock steps exercise normal Defend/AI actions and the
  // impact redraw. Sampling the final framebuffer also catches overlay order.
  await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+200));await page.clock.runFor(100);
  const target=await brightness(page,370,386),safe=await brightness(page,550,386);
  await capture(page,`lighting-front-${device}`);
  let attacks=0,last='',frames=0,main=false;
  for(let i=0;i<110;i++){
   const s=await inspect(page),actor=s.actors.find(a=>a.hero==='benefactor'),status=(await page.locator('#status').textContent())!;
   if(main&&!s.busy)break;
   if(actor?.motion==='attack'){
    if(status!==last){attacks++;last=status;frames=0;}frames++;
    if(frames===3){
     expect(await brightness(page,550,386)).toBeLessThan(safe*.65);
     if(status.endsWith('Judgment')){
      main=true;expect(await brightness(page,370,386)).toBeGreaterThan(target*.9);
      expect(await brightness(page,370,386)).toBeGreaterThan((await brightness(page,550,386))*1.7);
      await capture(page,`lighting-area-windup-${device}`);
     }else await capture(page,`lighting-direct-windup-${device}`);
    }
   }
   if(!s.busy){const button=page.getByRole('button',{name:/^F\s+Defend$/});if(await button.isVisible())await button.dispatchEvent('click');}
   await page.clock.runFor(100);
  }
  expect(attacks).toBe(2);expect(main).toBe(true);expect((await inspect(page)).busy).toBe(false);
  await page.clock.runFor(100); // Present the final scene update to the shared framebuffer.
  await capture(page,`lighting-front-restored-${device}`);
  expect(await brightness(page,550,386)).toBeGreaterThan(safe*.85);
  await page.getByRole('button',{name:'Restart battle',exact:true}).dispatchEvent('click');await page.clock.runFor(100);
  expect((await inspect(page)).battle!.round).toBe(1);expect(await brightness(page,550,386)).toBeGreaterThan(safe*.85);
  expect(errors).toEqual([]);await expect(page.locator('vite-error-overlay')).toHaveCount(0);
 }finally{await context.close();}
});

for(const [device,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]as const)test(`Lightbearer lantern lighting follows attacks and the closed shutter on ${device}`,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:1.25,reducedMotion:'reduce'}),page=await context.newPage(),errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 try{
  await page.goto('/?dev=boss&boss=lightbearer');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop',{timeout:30000});
  await page.getByRole('button',{name:'Start Chapter Six preset',exact:true}).click();await expect.poll(async()=>(await inspect(page)).mode).toBe('battle');await page.mouse.move(1,1);
  const backdrop=await page.evaluate(async()=>{
   const mapsURL='/src/content/battle-maps.ts',artURL='/src/content/scene-art.ts';
   const [{BATTLE_MAPS},{visibleSceneArt}]=await Promise.all([import(/* @vite-ignore */mapsURL),import(/* @vite-ignore */artURL)]);
   const s=window.borrowedTomorrow.inspect(),x=Math.round((s.view.scrollX+24)/2)*2,y=68;
   const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=768;const ctx=canvas.getContext('2d')!;
   const pieces=visibleSceneArt(BATTLE_MAPS.lightbearer,s.state).sort((a:{depth:number},b:{depth:number})=>a.depth-b.depth);
   for(const p of pieces){const image=new Image();image.src=`/${p.url}`;await image.decode();ctx.drawImage(image,p.x,p.y,p.width,p.height);}
   const rgba=ctx.getImageData(x,y,2,2).data;let luma=0;for(let i=0;i<rgba.length;i+=4)luma+=.2126*rgba[i]+.7152*rgba[i+1]+.0722*rgba[i+2];
   return {x,y,luma:luma/4};
  });
  expect(backdrop.luma).toBeGreaterThan(20);
  expect(await brightness(page,backdrop.x,backdrop.y)).toBeLessThan(backdrop.luma*.85);
  await capture(page,`lightbearer-lantern-${device}`);
  const still=await floorHash(page);await page.waitForTimeout(250);expect(await floorHash(page)).toBe(still);
  await page.emulateMedia({reducedMotion:'no-preference'});await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+200));await page.clock.runFor(100);
  let status='',frames=0,area=false,closed=false;
  for(let i=0;i<300;i++){
   const s=await inspect(page),actor=s.actors.find(a=>a.hero==='lightbearer'),current=(await page.locator('#status').textContent())!;
   expect(s.battle!.result).not.toBe('defeat');
   if(!s.busy&&s.battle!.round===4){
    expect(actor?.texture).toBe('lightbearer-resist');closed=true;await page.clock.runFor(100);await capture(page,`lightbearer-shutter-${device}`);break;
   }
   if(actor?.motion==='attack'){
    if(current!==status){status=current;frames=0;}frames++;
    if(!area&&frames===3&&current.endsWith('Judgment')){
     area=true;expect(await brightness(page,490,386)).toBeGreaterThan((await brightness(page,310,386))*1.5);
     await capture(page,`lightbearer-attack-${device}`);
    }
   }
   if(!s.busy){const defend=page.getByRole('button',{name:/^F\s+Defend$/});if(await defend.isVisible())await defend.dispatchEvent('click');}
   await page.clock.runFor(100);
  }
  expect(area).toBe(true);expect(closed).toBe(true);
  await page.getByRole('button',{name:'Restart battle',exact:true}).dispatchEvent('click');await page.clock.runFor(100);
  expect((await inspect(page)).battle!.round).toBe(1);expect((await inspect(page)).actors.find(a=>a.hero==='lightbearer')?.texture).not.toBe('lightbearer-resist');
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await context.close();}
});
