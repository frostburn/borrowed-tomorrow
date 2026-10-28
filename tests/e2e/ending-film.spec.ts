import {test,expect,type Page} from '@playwright/test';
import {inspect,capture} from './controls';

async function filmHash(page:Page){
 return page.evaluate(()=>{
  const info=window.borrowedTomorrowPixels.inspect(),source=document.querySelector('.pixel-source')!.getBoundingClientRect(),world=document.querySelector('.world-input')!.getBoundingClientRect();
  const x=info.physicalLeft+Math.round((world.left-source.left)/info.cssScale)*info.physicalScale,y=info.physicalTop+Math.round((world.top-source.top)/info.cssScale)*info.physicalScale;
  const w=document.querySelector<HTMLCanvasElement>('.world-input')!.width,h=document.querySelector<HTMLCanvasElement>('.world-input')!.height;
  const pixels=document.querySelector<HTMLCanvasElement>('.pixel-output')!.getContext('2d')!.getImageData(x,y,w*info.physicalScale,h*info.physicalScale).data;
  let hash=2166136261,colors=new Set<string>();
  for(let i=0;i<pixels.length;i+=16){hash=Math.imul(hash^pixels[i],16777619);colors.add(pixels[i]+':'+pixels[i+1]+':'+pixels[i+2]);}
  return {hash:hash>>>0,colors:colors.size};
 });
}
// Temporary @ci tag runs this focused new renderer on GitHub while the local
// execution environment is unavailable. Remove the tag after validation.
for(const [device,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]as const)test((device==='desktop'?'@ci ':'')+'good-ending workshop plays all shots, pauses and cleans up on '+device,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:1.25}),page=await context.newPage(),errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 try{
  await page.clock.install();await page.goto('/?dev=cinematics');
  await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop',{timeout:30000});
  await expect(page.getByRole('region',{name:'Ending cinematic preview'})).toBeVisible();
  const stored=await page.evaluate(()=>({...localStorage})),state=(await inspect(page)).state;
  await page.getByRole('button',{name:'Play good ending',exact:true}).click();
  await expect(page.locator('#canvas')).toHaveAttribute('data-ending-shot','release');
  await page.clock.pauseAt(new Date(Date.now()+100));await page.clock.runFor(1000);
  const first=await filmHash(page);expect(first.colors).toBeGreaterThan(20);
  await page.getByRole('button',{name:'Pause',exact:true}).dispatchEvent('click');
  await page.clock.runFor(100);const paused=await filmHash(page);await page.clock.runFor(1200);expect(await filmHash(page)).toEqual(paused);
  const other=device==='desktop'?{width:390,height:844}:{width:1280,height:800};
  await page.setViewportSize(other);await page.clock.runFor(200);
  expect((await inspect(page)).view.width).toBe(other.width===390?368:1008);
  expect((await filmHash(page)).colors).toBeGreaterThan(20);
  await page.setViewportSize(viewport);await page.clock.runFor(200);
  await page.getByRole('button',{name:'Play',exact:true}).dispatchEvent('click');await page.clock.runFor(1000);
  expect((await filmHash(page)).hash).not.toBe(paused.hash);
  for(const shot of ['station','window','shore']){
   await page.getByRole('button',{name:'Next shot',exact:true}).dispatchEvent('click');await page.clock.runFor(1200);
   await expect(page.locator('#canvas')).toHaveAttribute('data-ending-shot',shot);
   expect((await filmHash(page)).colors).toBeGreaterThan(20);await capture(page,'ending-'+shot+'-'+device);
  }
  await page.getByRole('button',{name:'Replay',exact:true}).dispatchEvent('click');await page.clock.runFor(600);
  await expect(page.locator('#canvas')).toHaveAttribute('data-ending-shot','release');
  await page.emulateMedia({reducedMotion:'reduce'});await page.clock.runFor(100);
  await expect(page.locator('#canvas')).toHaveAttribute('data-ending-playing','false');
  const still=await filmHash(page);await page.clock.runFor(1500);expect(await filmHash(page)).toEqual(still);
  await page.getByRole('button',{name:'Back to workshop',exact:true}).dispatchEvent('click');await page.clock.runFor(100);
  await expect(page.getByRole('region',{name:'Ending cinematic preview'})).toBeVisible();
  expect((await inspect(page)).state).toEqual(state);expect(await page.evaluate(()=>({...localStorage}))).toEqual(stored);
  expect(await page.locator('#canvas').getAttribute('data-ending-shot')).toBeNull();
  await page.getByRole('button',{name:'3. Window seats',exact:true}).dispatchEvent('click');
  await page.getByRole('button',{name:'Play selected shot',exact:true}).dispatchEvent('click');await page.clock.runFor(100);
  await expect(page.locator('#canvas')).toHaveAttribute('data-ending-shot','window');
  await page.keyboard.press('Escape');await page.clock.runFor(100);
  await expect(page.getByRole('region',{name:'Ending cinematic preview'})).toBeVisible();
  await page.getByRole('button',{name:'Test battle',exact:true}).dispatchEvent('click');await page.clock.runFor(100);
  expect((await inspect(page)).mode).toBe('battle');await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await context.close();}
});
