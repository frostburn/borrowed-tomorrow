import {test,expect} from '@playwright/test';
import {chapterSevenStart,chapterSevenRefugeStart} from '../../src/dev/canonical-saves';
import {SEVEN_PREREQUISITES} from '../../src/content/chapter-seven/progress';
import {MAPS,arrival} from '../../src/content/maps';
import {visibleSceneArt} from '../../src/content/scene-art';
import {importSave,approach} from './navigation';
import {inspect,capture,nativeActor} from './controls';
for(const [device,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]as const)test(`Chapter Seven prop occlusion and original engine on ${device}`,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:1.25,reducedMotion:'reduce'}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  const crossing=chapterSevenStart();crossing.flags.domainEntered=true;crossing.location={map:'hollowsill',x:24,y:32};await page.goto('/');await importSave(page,crossing);
  await capture(page,`alda-before-check-${device}`);await nativeActor(page,'alda',{x:20,y:29},.02);await capture(page,`alda-clear-${device}`);await approach(page,'sill-alda');await expect(page.locator('.dialogue')).toBeVisible();
  const refuge=chapterSevenRefugeStart();refuge.flags.lastRefugeSeen=true;refuge.location={map:'lastrefuge',x:19,y:29};await importSave(page,refuge);
  await capture(page,`refuge-porter-${device}`);await nativeActor(page,'civilian-dockhand-rust',{x:16,y:28},.08);
  const ward=chapterSevenRefugeStart(),flags=Object.keys(SEVEN_PREREQUISITES);for(const f of flags.slice(flags.indexOf('domainWardConfronted')))delete ward.flags[f];ward.location=arrival('quietward','start');await importSave(page,ward);
  const before=(await inspect(page)).state;expect(visibleSceneArt(MAPS.quietward.tiles!,before)!.some(p=>p.key.endsWith('original-engine'))).toBe(true);
  await approach(page,'ward-engine-seven');await page.getByRole('button',{name:'Prepare first',exact:true}).click();await capture(page,`original-engine-${device}`);
  await approach(page,'ward-engine-seven');await page.getByRole('button',{name:'Stop the original ward engine',exact:true}).click();await page.getByRole('button',{name:'Win battle',exact:true}).click();await page.getByRole('button',{name:'Continue the journey',exact:true}).click();
  await expect.poll(async()=>(await inspect(page)).cinematic).toBe('seven-hospice-free');await page.getByRole('button',{name:'Skip scene',exact:true}).click();
  const after=(await inspect(page)).state;expect(after.flags.wardPeopleFreed).toBe(true);expect(visibleSceneArt(MAPS.quietward.tiles!,after)!.some(p=>p.key.endsWith('original-engine'))).toBe(false);await capture(page,`original-engine-cleared-${device}`);
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await context.close();}
});
