import {test,expect} from '@playwright/test';
import {chapterSixCapitalStart} from '../../src/dev/canonical-saves';
import {arrival} from '../../src/content/maps';
import {palaceCheckpoint} from '../support/progress';
import {importSave,approach} from './navigation';
import {inspect,capture} from './controls';

for(const [device,viewport,dpr]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const)test(`guardian victory starts its aftermath automatically on ${device}`,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:dpr,reducedMotion:'reduce'}),page=await context.newPage();
 try{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');
  await importSave(page,palaceCheckpoint('conduitSeen'));await approach(page,'heart-regulator');
  await page.getByRole('button',{name:'Win battle',exact:true}).click();
  await page.getByRole('button',{name:'Continue the journey',exact:true}).click();
  await expect.poll(async()=>(await inspect(page)).cinematic).toBe('three-rupture');
  const won=(await inspect(page)).state;expect(won.flags.conduitGuardWon).toBe(true);expect(won.flags.extractionStopped).toBeUndefined();
  await capture(page,`automatic-boss-aftermath-${device}`);
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();
  await expect.poll(async()=>(await inspect(page)).cinematic).toBe('three-rupture');
  expect((await inspect(page)).state.inventory).toEqual(won.inventory);expect((await inspect(page)).state.xp).toBe(won.xp);
  await page.getByRole('button',{name:'Skip scene',exact:true}).click();
  await expect.poll(async()=>(await inspect(page)).state.location.map).toBe('northglass');
  expect((await inspect(page)).state.flags).toMatchObject({extractionStopped:true,emperorMerged:true});expect(errors).toEqual([]);
 }finally{await context.close();}
});

test('Stillwater Avenue has one procession cue and automatically frees the street after victory',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));await page.emulateMedia({reducedMotion:'reduce'});
 const saved=chapterSixCapitalStart();saved.flags.capitalQuaySeen=true;saved.flags.capitalStreetSeen=true;saved.location=arrival('stillcity','start');
 await page.goto('/');await importSave(page,saved);await capture(page,'stillwater-single-story-marker');
 await approach(page,'city-procession');await page.getByRole('button',{name:'Clear the procession machines',exact:true}).click();
 await page.getByRole('button',{name:'Win battle',exact:true}).click();await page.getByRole('button',{name:'Continue the journey',exact:true}).click();
 await expect.poll(async()=>(await inspect(page)).cinematic,{timeout:30000}).toBe('six-capital-release');
 const won=(await inspect(page)).state;expect(won.flags.capitalStreetFreed).toBeUndefined();
 await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();
 await expect.poll(async()=>(await inspect(page)).cinematic,{timeout:30000}).toBe('six-capital-release');
 expect((await inspect(page)).state.inventory).toEqual(won.inventory);expect((await inspect(page)).state.xp).toBe(won.xp);
 await page.getByRole('button',{name:'Skip scene',exact:true}).click();expect((await inspect(page)).state.flags.capitalStreetFreed).toBe(true);
 await capture(page,'stillwater-street-freed');await approach(page,'city-palace');
 await expect.poll(async()=>(await inspect(page)).state.location.map).toBe('lastpalace');expect(errors).toEqual([]);
});
