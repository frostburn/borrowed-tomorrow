import {test,expect,type Page} from '@playwright/test';
import {chapterFourStart,chapterSixStart,chapterSevenRefugeStart} from '../../src/dev/canonical-saves';
import {arrival} from '../../src/content/maps';
import {importSave,approach} from './navigation';
import {inspect,capture,dialogue,nativeActor} from './controls';

async function until(page:Page,text:string){
 for(let i=0;i<32;i++){
  if((await page.locator('.dialogue p').textContent())?.includes(text))return;
  await page.locator('.dialogue-actions button').first().click();
 }
 throw new Error(`Dialogue did not reach: ${text}`);
}
function homecoming(){
 const s=chapterSevenRefugeStart();
 for(const f of ['lastRefugeSeen','benefactorSeen','benefactorBodyConfronted','benefactorBodyWon','hollowSunSeen','benefactorSunConfronted','benefactorSunWon','fragmentReturned','benefactorHeartConfronted','benefactorHeartWon','daysReturned'])s.flags[f]=true;
 s.location=arrival('homecoming','start');return s;
}
for(const [device,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]as const)test(`Petra ${device}: refusal, account, return and an interrupted homecoming`,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:1.25,reducedMotion:device==='phone'?'reduce':'no-preference'}),page=await context.newPage(),errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('/');await expect(page).toHaveTitle(/Borrowed Tomorrow/);
  const four=chapterFourStart();await importSave(page,four);await expect.poll(async()=>(await inspect(page)).cinematic).toBe('four-home');
  await until(page,'Behind that shield');await page.mouse.move(0,0);await page.waitForTimeout(1200);
  await nativeActor(page,'civilian-patient',{x:19,y:23},.02);await capture(page,`petra-refusal-${device}`);
  expect((await inspect(page)).actors.some(a=>a.hero==='petra')).toBe(true);expect(four.activeParty).not.toContain('petra');
  await dialogue(page);const arrived=(await inspect(page)).state;expect(arrived.flags.refugeSeen).toBe(true);expect(arrived.activeParty).toEqual(four.activeParty);expect(arrived.inventory).toEqual(four.inventory);

  const six=chapterSixStart();six.flags.capitalSealed=true;six.activeParty=['orrin','celia'];await importSave(page,six);
  await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-briefing');await until(page,'Alban’s dead. They can still ask me.');await page.waitForTimeout(700);await capture(page,`petra-account-${device}`);
  expect((await inspect(page)).state.flags.sixRoutesKnown).toBeUndefined();expect((await inspect(page)).state.flags.nellRecovered).toBeUndefined();
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-briefing');
  await until(page,'packet for the next launch');await dialogue(page);
  const posted=(await inspect(page)).state;expect(posted.flags.sixRoutesKnown).toBe(true);expect(posted.flags.jungleLeadKnown).toBe(true);expect(posted.activeParty).toEqual(six.activeParty);expect(posted.inventory).toEqual(six.inventory);expect(posted.xp).toBe(six.xp);

  const refuge=chapterSevenRefugeStart();refuge.flags.lastRefugeSeen=true;refuge.activeParty=['nell','orrin','celia'];await importSave(page,refuge);await approach(page,'refuge-petra');await until(page,'There were other trains');await capture(page,`petra-refuge-${device}`);await dialogue(page);
  expect((await inspect(page)).state.flags).toEqual(refuge.flags);
  const home=homecoming();home.activeParty=refuge.activeParty;await importSave(page,home);await until(page,'I’ll answer them in person');await page.waitForTimeout(750);await capture(page,`petra-return-${device}`);
  expect((await inspect(page)).state.flags.homecomingSeen).toBeUndefined();
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('seven-home');
  await page.getByRole('button',{name:'Skip scene',exact:true}).click();const end=(await inspect(page)).state;expect(end.flags.homecomingSeen).toBe(true);expect(end.activeParty).toEqual(home.activeParty);expect(end.inventory).toEqual(home.inventory);expect(end.xp).toBe(home.xp);
  await approach(page,'home-train');await expect.poll(async()=>(await inspect(page)).cinematic).toBe('seven-sea');
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await context.close();}
});
