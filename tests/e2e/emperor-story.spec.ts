import {test,expect,type Page} from '@playwright/test';
import {palaceCheckpoint} from '../support/progress';
import {dawnwatchCheckpoint} from '../support/anchors';
import {chapterSixCapitalStart,chapterSixFinaleStart} from '../../src/dev/canonical-saves';
import {createBattle,awardVictory} from '../../src/rules/combat';
import {arrival} from '../../src/content/maps';
import {importSave} from './navigation';
import {inspect,capture,nativeActor} from './controls';

async function until(page:Page,text:string){
 for(let i=0;i<32;i++){
  if((await page.locator('.dialogue p').textContent())?.includes(text))return;
  await page.locator('.dialogue-actions button').first().click();
 }
 throw new Error(`Dialogue did not reach: ${text}`);
}
for(const [device,viewport,recovered]of [['desktop',{width:1280,height:800},true],['phone',{width:390,height:844},false]]as const)test(`Emperor ${device}: breakfast memory, bounded offer and the ${recovered?'recovered':'ill'} palace route`,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:1.25,reducedMotion:device==='phone'?'reduce':'no-preference'}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('/');await expect(page).toHaveTitle(/Borrowed Tomorrow/);
  const three=palaceCheckpoint('conduitGuardWon');three.location={map:'conduit',x:50,y:20};await importSave(page,three);await until(page,'She liked to hear the bread cart');await page.waitForTimeout(800);await capture(page,`emperor-memory-${device}`);
  expect((await inspect(page)).state.flags.emperorMerged).toBeUndefined();
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('three-rupture');await page.getByRole('button',{name:'Skip scene',exact:true}).click();
  await expect.poll(async()=>(await inspect(page)).state.flags.emperorMerged).toBe(true);expect((await inspect(page)).state.flags.tomasRescued).toBe(true);expect((await inspect(page)).state.inventory).toEqual(three.inventory);

  const five=dawnwatchCheckpoint('dawnwatchComplete',true);five.flags.fleetSighted=true;five.location=arrival('observation','start');await importSave(page,five);await expect.poll(async()=>(await inspect(page)).cinematic).toBe('five-emperor-offer');await until(page,'Open the window');await capture(page,`emperor-offer-${device}`);
  expect((await inspect(page)).state.flags.emperorOfferSeen).toBeUndefined();await page.getByRole('button',{name:'Skip scene',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('five-emperor-told');await page.getByRole('button',{name:'Skip scene',exact:true}).click();expect((await inspect(page)).state.activeParty).toEqual(five.activeParty);expect((await inspect(page)).state.inventory).toEqual(five.inventory);

  const palace=chapterSixCapitalStart(recovered);for(const f of ['capitalQuaySeen','capitalStreetSeen','capitalProcessionConfronted'])palace.flags[f]=true;const b=createBattle('capital-procession',palace);b.result='victory';awardVictory(b,palace);palace.flags.capitalStreetFreed=true;palace.location=arrival('lastpalace','start');palace.activeParty=['kit','orrin','petra'];await importSave(page,palace);
  await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-palace-arrival');await until(page,'I can hear the bread cart');await page.waitForTimeout(850);await nativeActor(page,'civilian-traveler',{x:38,y:21},.02);await capture(page,`emperor-household-${device}`);expect((await inspect(page)).actors.some(a=>a.hero==='nell')).toBe(recovered);
  await until(page,'guard at her funeral');await page.getByRole('button',{name:'Skip scene',exact:true}).click();const arrived=(await inspect(page)).state;expect(arrived.flags.capitalPalaceSeen).toBe(true);expect(arrived.flags.capitalHallOpened).toBeUndefined();expect(arrived.activeParty).toEqual(palace.activeParty);expect(arrived.inventory).toEqual(palace.inventory);expect(arrived.xp).toBe(palace.xp);

  const crown=chapterSixFinaleStart(recovered);crown.flags.capitalWarningSeen=true;crown.flags.capitalAssaultCommitted=true;crown.flags.capitalRiskAccepted=!recovered;crown.location=arrival('crown','start');await importSave(page,crown);await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-imperial-vessel');await until(page,'finished her breakfast');await capture(page,`emperor-breakfast-${device}`);
  expect((await inspect(page)).state.flags.emperorSeen).toBeUndefined();await page.getByRole('button',{name:'Skip scene',exact:true}).click();const ready=(await inspect(page)).state;expect(ready.flags.emperorSeen).toBe(true);expect(ready.flags.emperorWon).toBeUndefined();expect(ready.activeParty).toEqual(crown.activeParty);expect(ready.inventory).toEqual(crown.inventory);expect(ready.xp).toBe(crown.xp);
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await context.close();}
});
