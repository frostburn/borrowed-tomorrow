import {test,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import {chapterSixFinaleStart} from '../../src/dev/canonical-saves';
import {createBattle,awardVictory} from '../../src/rules/combat';
import {decodeSave} from '../../src/rules/save';
import {arrival} from '../../src/content/maps';
import {checkpoint} from '../support/progress';
import {importSave} from './navigation';
import {inspect,capture} from './controls';

for(const [device,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]as const)test(`Rillbridge approach and shared sun artwork on ${device}`,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:1.25,reducedMotion:'reduce'}),page=await context.newPage();
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 try{
  await page.goto('/');const s=checkpoint('villageSeen');s.location={map:'rillbridge',x:58,y:19};await importSave(page,s);
  await expect.poll(async()=>(await inspect(page)).state.location.map).toBe('rillbridge');await capture(page,`rillbridge-clean-approach-${device}`);
  await page.goto('/?dev=maps&map=tunnel');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop',{timeout:30000});
  for(const [name,map,chapter,flags]of [
   ['tunnel','tunnel',1,[]],['relayhall','relayhall',3,[]],['conduit','conduit',3,[]],['signalwall','signalwall',5,[]],['flagship','flagship',5,[]],['crown','crown',6,[]],['hollowsill','hollowsill',7,[]],['sunthrone','sunthrone',7,[]],['sun-form','sunthrone',7,['hollowSunSeen']],['heart-form','sunthrone',7,['hollowSunSeen','fragmentReturned']],
  ]as const){
   await page.locator(`[data-map-chapter="${chapter}"]`).click();await page.locator(`[data-map="${map}"]`).click();
   if(flags.length){
    const details=page.locator('details').filter({has:page.locator('.map-flags')});if(await details.getAttribute('open')===null)await details.locator('summary').click();
    for(const flag of flags)await page.locator(`[data-map-flag="${flag}"]`).click();
   }
   await expect(page.locator('#map-workshop')).toHaveAttribute('data-ready','true');await expect(page.locator('#map-load')).toHaveText('Map art loaded.');
   if(process.env.BT_QA_SCREENSHOTS){const url=await page.locator('#map-preview').evaluate(el=>(el as HTMLCanvasElement).toDataURL());await writeFile(`${process.env.BT_QA_SCREENSHOTS}/sun-${name}-${device}.png`,Buffer.from(url.split(',')[1],'base64'));}
  }
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await context.close();}
});

for(const [device,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]as const)test(`capital reveal uses the hollow sun on ${device}`,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:1.25,reducedMotion:'reduce'}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  const landing=chapterSixFinaleStart(true);landing.flags.capitalWarningSeen=true;landing.flags.capitalAssaultCommitted=true;landing.flags.capitalRiskAccepted=false;landing.flags.emperorSeen=true;landing.flags.emperorConfronted=true;
  const battle=createBattle('imperial-vessel',landing);battle.result='victory';awardVictory(battle,landing);landing.flags.emperorFallen=true;landing.flags.capitalReleased=true;landing.location=arrival('capitalquay','start');
  decodeSave(JSON.stringify(landing));await page.goto('/');await importSave(page,landing);await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-capital-landing');
  await capture(page,`capital-hollow-sun-reveal-${device}`);expect((await inspect(page)).state.inventory).toEqual(landing.inventory);
  expect(errors).toEqual([]);
 }finally{await context.close();}
});
