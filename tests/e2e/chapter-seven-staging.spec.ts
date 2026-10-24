import {test,expect,type Page} from '@playwright/test';
import {chapterSevenStart,chapterSevenRefugeStart} from '../../src/dev/canonical-saves';
import {arrival,MAPS,visibleObjects} from '../../src/content/maps';
import {visibleSceneArt} from '../../src/content/scene-art';
import {SEVEN_PREREQUISITES} from '../../src/content/chapter-seven/progress';
import type {MapId} from '../../src/rules/state';
import {inspect,capture,dialogue,nativeActor} from './controls';
import {importSave,approach} from './navigation';

function before(flag:string,map:MapId){
 const state=chapterSevenRefugeStart(),flags=Object.keys(SEVEN_PREREQUISITES);
 for(const f of flags.slice(flags.indexOf(flag)))delete state.flags[f];
 state.location=arrival(map,'start');return state;
}
function homecoming(){
 const state=chapterSevenRefugeStart();
 for(const flag of ['lastRefugeSeen','benefactorSeen','benefactorBodyConfronted','benefactorBodyWon','hollowSunSeen','benefactorSunConfronted','benefactorSunWon','fragmentReturned','benefactorHeartConfronted','benefactorHeartWon','daysReturned'])state.flags[flag]=true;
 state.location=arrival('homecoming','start');return state;
}
async function drain(page:Page){if((await inspect(page)).cinematic)await page.getByRole('button',{name:'Skip scene',exact:true}).click();}
const next=(page:Page)=>page.locator('.dialogue-actions button').first().click();
/** Visible framebuffer pixels at the figure's chest, with the cursor parked. */
const chest=(page:Page)=>page.evaluate(()=>{
 const {view}=window.borrowedTomorrow.inspect(),info=window.borrowedTomorrowPixels.inspect(),source=document.querySelector('.pixel-source')!.getBoundingClientRect(),world=document.querySelector('.world-input')!.getBoundingClientRect(),canvas=document.querySelector<HTMLCanvasElement>('.pixel-output')!;
 const x=Math.round(info.physicalLeft+(Math.round((world.left-source.left)/info.cssScale)+700-view.scrollX)*info.physicalScale),y=Math.round(info.physicalTop+(Math.round((world.top-source.top)/info.cssScale)+400-view.scrollY)*info.physicalScale);
 const data=canvas.getContext('2d')!.getImageData(x,y,Math.round(100*info.physicalScale),Math.round(80*info.physicalScale)).data;let hash=0;for(const v of data)hash=(Math.imul(hash,31)+v)|0;return hash;
});

for(const [device,viewport,dpr]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const)test(`Chapter Seven staging on ${device}: withdrawal, patient, defeated patrol and real epilogue`,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:dpr,reducedMotion:device==='phone'?'reduce':'no-preference'}),page=await context.newPage(),errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 try{
  await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');await importSave(page,chapterSevenStart());await expect.poll(async()=>(await inspect(page)).cinematic).toBe('seven-crossing');
  for(let i=0;i<3;i++)await next(page);
  if(device==='desktop'){await page.waitForTimeout(200);const start=(await inspect(page)).view.scrollY;await page.mouse.move(0,0);await page.waitForTimeout(900);const middle=(await inspect(page)).view.scrollY;expect(middle).toBeLessThan(start-40);await page.waitForTimeout(1400);expect((await inspect(page)).view.scrollY).toBeLessThan(middle-30);}
  await capture(page,`crossing-reveal-${device}`);await next(page);await expect(page.locator('.dialogue h2')).toHaveText('The Benefactor');await expect(page.locator('.dialogue')).toContainText('Return to your ship.');await page.waitForTimeout(1000);await page.mouse.move(0,0);await capture(page,`crossing-warning-${device}`);
  if(device==='desktop'){
   for(let i=0;i<3;i++)await next(page);await page.waitForTimeout(600);await next(page);await page.mouse.move(0,0);await page.waitForTimeout(150);const first=await chest(page);await page.waitForTimeout(800);expect(await chest(page)).not.toBe(first);await page.waitForTimeout(900);await capture(page,'crossing-withdrawal');await dialogue(page);
  }else await drain(page);
  expect((await inspect(page)).state.flags.domainEntered).toBe(true);expect(visibleSceneArt(MAPS.hollowsill.tiles!,(await inspect(page)).state)!.some(p=>p.key.endsWith('distant-god'))).toBe(false);await capture(page,`crossing-cleared-${device}`);
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).state.flags.domainEntered).toBe(true);expect((await inspect(page)).cinematic).toBeNull();await approach(page,'sill-cross');await expect.poll(async()=>(await inspect(page)).state.location.map).toBe('takenwater');await drain(page);

  await importSave(page,before('firstHospiceSeen','quietward'));await expect.poll(async()=>(await inspect(page)).cinematic).toBe('seven-hospice');await next(page);await page.waitForTimeout(600);
  await nativeActor(page,'civilian-patient-green',{x:20,y:30});await capture(page,`hospice-patient-${device}`);await drain(page);

  await importSave(page,before('domainDragonConfronted','seasonstreet'));await approach(page,'season-rest');await expect(page.locator('.dialogue')).toHaveCount(0);await expect(page.getByRole('button',{name:'Rest · restore everyone’s HP and focus',exact:true})).toHaveCount(0);await approach(page,'season-patrol');await page.getByRole('button',{name:'Prepare first',exact:true}).click();await capture(page,`courier-stair-before-${device}`);
  await approach(page,'season-patrol');await page.getByRole('button',{name:'Clear the courier stair',exact:true}).click();await page.getByRole('button',{name:'Win battle',exact:true}).click();await page.getByRole('button',{name:'Continue the journey',exact:true}).click();
  expect((await inspect(page)).state.flags.domainPatrolWon).toBe(true);expect(visibleObjects(MAPS.seasonstreet,(await inspect(page)).state).some(o=>o.id==='season-patrol')).toBe(false);await capture(page,`courier-stair-cleared-${device}`);
  await approach(page,'season-rest');await expect(page.getByRole('button',{name:'Rest · restore everyone’s HP and focus',exact:true})).toBeVisible();await page.getByRole('button',{name:'Rest · restore everyone’s HP and focus',exact:true}).click();
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).state.flags.domainPatrolWon).toBe(true);

  await importSave(page,homecoming());await expect.poll(async()=>(await inspect(page)).cinematic).toBe('seven-home');
  for(let i=0;i<4;i++)await next(page);await expect(page.locator('.dialogue h2')).toHaveText('Iona');await page.waitForTimeout(600);await capture(page,`homecoming-iona-${device}`);
  expect((await inspect(page)).actors.some(a=>a.hero==='master'||a.texture==='master')).toBe(false);await expect(page.locator('img[src$="/portrait-master.svg"]')).toHaveCount(0);
  for(let i=0;i<5;i++)await next(page);await expect(page.locator('.dialogue')).toContainText('Ansel’s cap');await expect(page.locator('img[src$="/portrait-master.svg"]')).toHaveCount(0);await drain(page);
  await approach(page,'home-cap');await expect(page.locator('.dialogue')).toContainText('little tear');await dialogue(page);await approach(page,'home-train');await expect.poll(async()=>(await inspect(page)).cinematic).toBe('seven-sea');
  expect((await inspect(page)).actors.some(a=>a.hero==='master'||a.texture==='master')).toBe(false);await expect(page.locator('img[src$="/portrait-master.svg"]')).toHaveCount(0);await capture(page,`real-epilogue-${device}`);await drain(page);
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await context.close();}
});
