import {test,expect} from '@playwright/test';
import {chapterSixStart,chapterSixCapitalStart} from '../../src/dev/canonical-saves';
import {desertCheckpoint} from '../support/desert';
import {arrival} from '../../src/content/maps';
import {importSave,approach} from './navigation';
import {inspect,capture} from './controls';

const frame=(page:import('@playwright/test').Page)=>page.evaluate(()=>{
 const c=document.querySelector<HTMLCanvasElement>('.pixel-output')!,d=c.getContext('2d')!.getImageData(0,0,c.width,c.height).data;
 let hash=2166136261;for(let i=0;i<d.length;i+=4)hash=Math.imul(hash^d[i],16777619);return hash>>>0;
});
for(const [device,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]as const){
 test(`Chapter Six ${device}: gallery lattice, supported lamps and a short taunt label`,async({browser})=>{
  const context=await browser.newContext({viewport,reducedMotion:'reduce'}),page=await context.newPage();
  try{
   const s=desertCheckpoint('palaceCoup');s.activeParty=['petra'];s.location=arrival('sunpalace','escape');
   await page.goto('/');await importSave(page,s);await capture(page,`six-palace-lattice-${device}`);
   await approach(page,'palace-route');await page.getByRole('button',{name:'Break the gallery cordon · dry floor',exact:true}).click();
   await expect.poll(async()=>(await inspect(page)).mode).toBe('battle');
   await page.getByRole('button',{name:/^\d\s+Taunt$/}).click();
   await page.getByRole('button',{name:'Confirm ability',exact:true}).click();
   await expect.poll(async()=>(await inspect(page)).battle?.log.some(l=>l.includes('Shield captain targets Petra'))).toBe(true);
   await capture(page,`six-gallery-taunt-${device}`);await expect(page.locator('vite-error-overlay')).toHaveCount(0);
  }finally{await context.close();}
 });
 test(`Chapter Six ${device}: a connected cot and a working water clock`,async({browser})=>{
  const context=await browser.newContext({viewport,deviceScaleFactor:1.25}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  try{
   const berth=chapterSixStart();berth.flags.capitalSealed=true;berth.flags.sixRoutesKnown=true;berth.flags.jungleLeadKnown=true;berth.location={map:'outermooring',x:22,y:29};
   await page.goto('/');await importSave(page,berth);await capture(page,`six-cot-${device}`);
   const city=desertCheckpoint('desertSeen');city.location=arrival('namar','palace');await importSave(page,city);await page.mouse.move(0,0);
   const frames=new Set<number>();for(let i=0;i<9;i++){frames.add(await frame(page));await page.waitForTimeout(800);}expect(frames.size).toBeGreaterThan(3);await capture(page,`six-clock-${device}`);
   await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(200);const still=await frame(page);await page.waitForTimeout(900);expect(await frame(page)).toBe(still);
   await expect(page).toHaveTitle('Borrowed Tomorrow');await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
  }finally{await context.close();}
 });
 for(const reduced of [false,true])test(`Chapter Six ${device}: capital wall lift ${reduced?'reduced':'moving'} commits on completion`,async({browser})=>{
  const context=await browser.newContext({viewport,reducedMotion:reduced?'reduce':'no-preference'}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  try{
   const s=chapterSixCapitalStart();delete s.flags.capitalOpened;s.journal=s.journal.filter(f=>f!=='capitalOpened');s.location=arrival('outermooring','start');
   await page.goto('/');await importSave(page,s);await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-capital-open');
   await page.locator('.dialogue-actions button').first().click();await expect(page.locator('.dialogue p')).toContainText('bent latch lifts');await page.mouse.move(0,0);
   await page.waitForTimeout(100);const before=await frame(page);await page.waitForTimeout(850);expect((await frame(page))===before).toBe(reduced);await capture(page,`six-capital-lift-${device}-${reduced}`);
   expect((await inspect(page)).state.flags.capitalOpened).toBeUndefined();await page.getByRole('button',{name:'Skip scene',exact:true}).click();expect((await inspect(page)).state.flags.capitalOpened).toBe(true);
   await approach(page,'six-capital-open');await expect.poll(async()=>(await inspect(page)).state.location.map).toBe('capitalquay');expect(errors).toEqual([]);
  }finally{await context.close();}
 });
}

test('rest shelters and one-time report rewards have distinct markers and labels',async({page})=>{
 await page.goto('/');await importSave(page,desertCheckpoint('desertSeen'));
 await approach(page,'namar-supply');await expect(page.locator('.world-objective h3')).toContainText('Rest & supplies');await page.getByRole('button',{name:'Keep going',exact:true}).click();
 await approach(page,'namar-post');await expect(page.locator('.world-objective h3')).toContainText('Optional reward');
 while(await page.locator('.dialogue').isVisible())await page.locator('.dialogue-actions button').first().click();
 await approach(page,'namar-post-sent');await expect(page.locator('.world-objective h3')).toContainText('Conversation');await capture(page,'rest-and-reward-markers');
});
