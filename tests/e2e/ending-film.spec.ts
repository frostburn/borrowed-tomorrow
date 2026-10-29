import {test,expect,type Page} from '@playwright/test';
import {inspect,capture} from './controls';
import {ENDING_CREDITS} from '../../src/content/credits';

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
for(const [device,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]as const)test('good-ending workshop plays all shots, pauses and cleans up on '+device,async({browser})=>{
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
  await page.clock.runFor(13000);await capture(page,'ending-shore-arrival-'+device);
  await page.getByRole('button',{name:'Credits',exact:true}).dispatchEvent('click');await page.clock.runFor(1200);
  await expect(page.locator('#canvas')).toHaveAttribute('aria-description',/Lumi Pakkanen/);
  const rolling=await filmHash(page);await capture(page,'ending-credits-first-'+device);
  await page.clock.runFor(12000);expect((await filmHash(page)).hash).not.toBe(rolling.hash);await capture(page,'ending-credits-middle-'+device);
  await page.getByRole('button',{name:'Pause',exact:true}).dispatchEvent('click');await page.clock.runFor(100);
  const heldCredits=await filmHash(page);await page.clock.runFor(1500);expect(await filmHash(page)).toEqual(heldCredits);
  await page.getByRole('button',{name:'Play',exact:true}).dispatchEvent('click');await page.clock.runFor(25000);
  await capture(page,'ending-sunset-title-'+device);
  await page.getByRole('button',{name:'Replay',exact:true}).dispatchEvent('click');await page.clock.runFor(600);
  await expect(page.locator('#canvas')).toHaveAttribute('data-ending-shot','release');
  await page.emulateMedia({reducedMotion:'reduce'});await page.clock.runFor(100);
  await expect(page.locator('#canvas')).toHaveAttribute('data-ending-playing','false');
  const still=await filmHash(page);await page.clock.runFor(1500);expect(await filmHash(page)).toEqual(still);
  await page.getByRole('button',{name:'Credits',exact:true}).dispatchEvent('click');await page.clock.runFor(100);
  await expect(page.locator('.ending-credit-copy')).toContainText('Borrowed Tomorrow');
  const firstCard=await filmHash(page);
  await page.getByRole('button',{name:'Next credit',exact:true}).dispatchEvent('click');await page.clock.runFor(100);
  await expect(page.locator('.ending-credit-copy')).toContainText('A game by · GPT-6.1 Sol');
  expect((await filmHash(page)).hash).not.toBe(firstCard.hash);
  const card=await filmHash(page);await page.clock.runFor(1500);expect(await filmHash(page)).toEqual(card);
  for(let i=2;i<ENDING_CREDITS.length;i++){
   await page.getByRole('button',{name:'Next credit',exact:true}).dispatchEvent('click');await page.clock.runFor(100);
   await expect(page.locator('.ending-credit-copy')).toContainText(ENDING_CREDITS[i].role);
   if(i===2)await expect(page.locator('.ending-credit-copy')).toContainText('Directed by · Lumi Pakkanen');
  }
  await expect(page.locator('.ending-credit-copy')).toContainText('Stephen D. Turner');
  await capture(page,'ending-credits-reduced-'+device);
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

for(const [device,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]as const)test('bad-ending workshop keeps the loss, shared credits and save isolation on '+device,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:1.25}),page=await context.newPage(),errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 try{
  await page.clock.install();await page.goto('/?dev=cinematics');
  await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop',{timeout:30000});
  await page.getByRole('button',{name:'Bad ending',exact:true}).click();
  await expect(page.getByRole('button',{name:'Bad ending',exact:true})).toHaveAttribute('aria-pressed','true');
  await expect(page.getByRole('button',{name:'Bad ending',exact:true})).toHaveClass(/selected/);
  await expect(page.getByRole('button',{name:'Good ending',exact:true})).not.toHaveClass(/selected/);
  await capture(page,'bad-ending-selection-'+device);
  await expect(page.getByRole('region',{name:'Ending cinematic preview'})).toContainText('Nell’s folded coat');
  const stored=await page.evaluate(()=>({...localStorage})),state=(await inspect(page)).state;
  await page.getByRole('button',{name:'Play bad ending',exact:true}).click();
  await expect(page.locator('#canvas')).toHaveAttribute('data-ending-kind','bad');
  await expect(page.locator('#canvas')).toHaveAttribute('data-ending-shot','empty-seat');
  await page.clock.pauseAt(new Date(Date.now()+100));await page.clock.runFor(1200);
  expect((await filmHash(page)).colors).toBeGreaterThan(20);await capture(page,'bad-ending-empty-seat-'+device);
  await page.getByRole('button',{name:'Pause',exact:true}).dispatchEvent('click');await page.clock.runFor(100);
  const paused=await filmHash(page);await page.clock.runFor(1500);expect(await filmHash(page)).toEqual(paused);
  await expect(page.getByRole('button',{name:'Next shot',exact:true})).toBeDisabled();
  await page.getByRole('button',{name:'Play',exact:true}).dispatchEvent('click');await page.mouse.move(1,1);
  await page.clock.runFor(5000);expect((await filmHash(page)).hash).not.toBe(paused.hash);await capture(page,'bad-ending-pullback-'+device);
  await page.clock.runFor(8000);await capture(page,'bad-ending-lantern-reveal-'+device);
  await expect(page.locator('#canvas')).toHaveAttribute('data-ending-shot','empty-seat');
  const train=await filmHash(page);await page.clock.runFor(6000);
  expect((await filmHash(page)).hash).not.toBe(train.hash);await capture(page,'bad-ending-departure-'+device);
  await page.clock.runFor(8000);await capture(page,'bad-ending-rain-'+device);
  await page.getByRole('button',{name:'Credits',exact:true}).dispatchEvent('click');await page.clock.runFor(1200);
  await expect(page.locator('#canvas')).toHaveAttribute('aria-description',/Combat system direction: Lumi Pakkanen/);
  await expect(page.locator('#canvas')).toHaveAttribute('aria-description',/Playtesting: Lumi Pakkanen/);
  await capture(page,'bad-ending-credits-'+device);
  await page.emulateMedia({reducedMotion:'reduce'});await page.clock.runFor(100);
  await expect(page.locator('#canvas')).toHaveAttribute('data-ending-playing','false');
  await expect(page.locator('.ending-hint')).toContainText('Cure Nell for additional story content.');
  await page.getByRole('button',{name:'Previous credit',exact:true}).dispatchEvent('click');await page.clock.runFor(100);
  const current=Number((await page.locator('.ending-controls [role=status]').innerText()).match(/Credits (\d+)/)![1])-1;
  for(let i=current;i>0;i--){await page.getByRole('button',{name:'Previous credit',exact:true}).dispatchEvent('click');await page.clock.runFor(50);}
  for(let i=0;i<ENDING_CREDITS.length;i++){
   await expect(page.locator('.ending-credit-copy')).toContainText(ENDING_CREDITS[i].role);
   if(i<ENDING_CREDITS.length-1){await page.getByRole('button',{name:'Next credit',exact:true}).dispatchEvent('click');await page.clock.runFor(100);}
  }
  const still=await filmHash(page);await page.clock.runFor(1500);expect(await filmHash(page)).toEqual(still);
  await capture(page,'bad-ending-reduced-'+device);
  await page.getByRole('button',{name:'Back to workshop',exact:true}).dispatchEvent('click');await page.clock.runFor(100);
  expect((await inspect(page)).state).toEqual(state);expect(await page.evaluate(()=>({...localStorage}))).toEqual(stored);
  expect(await page.locator('#canvas').getAttribute('data-ending-kind')).toBeNull();
  await expect(page.getByRole('button',{name:'Bad ending',exact:true})).toHaveClass(/selected/);
  await page.getByRole('button',{name:'1. The empty seat',exact:true}).dispatchEvent('click');
  await page.getByRole('button',{name:'Play selected shot',exact:true}).dispatchEvent('click');await page.clock.runFor(100);
  await expect(page.locator('#canvas')).toHaveAttribute('data-ending-shot','empty-seat');
  await page.emulateMedia({reducedMotion:'no-preference'});await page.clock.runFor(100);
  await page.getByRole('button',{name:'Play',exact:true}).dispatchEvent('click');await page.clock.runFor(68000);
  await capture(page,'bad-ending-final-title-'+device);await page.clock.runFor(4500);
  await expect(page.getByRole('region',{name:'Ending cinematic preview'})).toBeVisible();
  expect((await inspect(page)).state).toEqual(state);expect(await page.evaluate(()=>({...localStorage}))).toEqual(stored);
  await page.getByRole('button',{name:'Good ending',exact:true}).dispatchEvent('click');
  await page.getByRole('button',{name:'Play good ending',exact:true}).dispatchEvent('click');await page.clock.runFor(100);
  await expect(page.locator('#canvas')).toHaveAttribute('data-ending-kind','good');
  await expect(page.locator('#canvas')).toHaveAttribute('data-ending-shot','release');
  await page.keyboard.press('Escape');await page.clock.runFor(100);
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await context.close();}
});
