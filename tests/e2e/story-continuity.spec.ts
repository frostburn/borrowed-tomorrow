import {test,expect,type Page} from '@playwright/test';
import {checkpoint,palaceCheckpoint} from '../support/progress';
import {chapterSixFinaleStart,chapterSevenStart,chapterSevenRefugeStart} from '../../src/dev/canonical-saves';
import {arrival} from '../../src/content/maps';
import {importSave,approach} from './navigation';
import {inspect,capture,dialogue} from './controls';

async function until(page:Page,text:string){
 for(let i=0;i<32;i++){
  if((await page.locator('.dialogue p').textContent())?.includes(text))return;
  await page.locator('.dialogue-actions button').first().click();
 }
 throw new Error(`Dialogue did not reach: ${text}`);
}
async function framed(page:Page,heroes:string[]){
 const frame=await page.evaluate(ids=>{
  const s=window.borrowedTomorrow.inspect(),canvas=document.querySelector('#canvas canvas')!.getBoundingClientRect(),dialogue=document.querySelector('.dialogue')!.getBoundingClientRect();
  return ids.map(id=>{const a=s.actors.find(a=>a.hero===id)!;return {id,bottom:canvas.top+(a.y-s.view.scrollY+8)*canvas.height/s.view.height,top:canvas.top+(a.y-s.view.scrollY-68)*canvas.height/s.view.height,dialogue:dialogue.top,canvas:canvas.top};});
 },heroes);
 for(const a of frame){expect(a.bottom,a.id).toBeLessThan(a.dialogue);expect(a.top,a.id).toBeGreaterThanOrEqual(a.canvas);}
}
for(const [device,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]as const)test(`Story continuity ${device}: missing villagers, raid witnesses, unvisited Iria and the final release`,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:1.25,reducedMotion:device==='phone'?'reduce':'no-preference'}),page=await context.newPage(),errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 try{
  await page.goto('/');await expect(page).toHaveTitle(/Borrowed Tomorrow/);
  const village=checkpoint('collectorDefeated');village.location={map:'rillbridge',x:55,y:19};await importSave(page,village);await approach(page,'release');await expect.poll(async()=>(await inspect(page)).cinematic).toBe('one-release');
  await until(page,'taking three days');await capture(page,`continuity-charge-${device}`);await until(page,'Has anyone seen him');await capture(page,`continuity-missing-${device}`);expect((await inspect(page)).state.flags.villageFreed).toBeUndefined();await page.getByRole('button',{name:'Skip scene',exact:true}).click();const freed=(await inspect(page)).state;expect(freed.flags.villageFreed).toBe(true);expect(freed.xp).toBe(village.xp);expect(freed.inventory).toEqual(village.inventory);

  const rescue=palaceCheckpoint('worksWardenWon');rescue.activeParty=['nell','orrin','kit'];await importSave(page,rescue);await expect.poll(async()=>(await inspect(page)).cinematic).toBe('three-reunion');await until(page,'Did Ansel make it');await expect(page.locator('.dialogue h2')).toHaveText('Tomas');await page.locator('.dialogue-actions button').first().click();await expect(page.locator('.dialogue p')).toContainText('No. I stayed with him');await page.waitForTimeout(700);await framed(page,['nell','tomas']);await capture(page,`continuity-ansel-${device}`);expect((await inspect(page)).state.flags.tomasRescued).toBeUndefined();
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('three-reunion');await page.getByRole('button',{name:'Skip scene',exact:true}).click();const reunited=(await inspect(page)).state;expect(reunited.flags.tomasRescued).toBe(true);expect(reunited.xp).toBe(rescue.xp);expect(reunited.inventory).toEqual(rescue.inventory);expect(reunited.activeParty).toEqual(rescue.activeParty);

  const untreated=chapterSixFinaleStart(false);expect(untreated.flags.riverSeen).toBeFalsy();await importSave(page,untreated);await approach(page,'palace-preparations');await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-capital-warning');await until(page,'Moving it hasn’t changed her pulse');await capture(page,`continuity-no-ines-${device}`);expect((await inspect(page)).actors.some(a=>a.hero==='nell')).toBe(false);await page.getByRole('button',{name:'Skip scene',exact:true}).click();await expect(page.getByRole('button',{name:'Return to Iria · seek treatment for Nell',exact:true})).toBeVisible();expect((await inspect(page)).state.flags.capitalAssaultCommitted).toBeUndefined();expect((await inspect(page)).state.flags.nellRecovered).toBeFalsy();

  for(const rescued of [false,true]){
   const s=rescued?chapterSevenRefugeStart():chapterSevenStart();s.flags.domainEntered=true;s.location={map:'hollowsill',x:21,y:30};await importSave(page,s);await approach(page,'sill-alda');await expect(page.locator('.dialogue p')).toContainText(rescued?'bringing people across':'mooring drum');await capture(page,`continuity-alda-${rescued?'after':'before'}-${device}`);await dialogue(page);expect((await inspect(page)).state.flags).toEqual(s.flags);expect((await inspect(page)).state.inventory).toEqual(s.inventory);
  }

  const end=chapterSevenRefugeStart();for(const f of ['lastRefugeSeen','benefactorSeen','benefactorBodyConfronted','benefactorBodyWon','hollowSunSeen','benefactorSunConfronted','benefactorSunWon','fragmentReturned','benefactorHeartConfronted','benefactorHeartWon'])end.flags[f]=true;end.location=arrival('sunthrone','start');end.activeParty=['nell','kit','petra'];end.party.find(h=>h.id==='celia')!.hp=13;await importSave(page,end);await expect.poll(async()=>(await inspect(page)).cinematic).toBe('seven-release');await until(page,'Nell, your pulse is steady');await page.waitForTimeout(700);await framed(page,['nell','celia']);await capture(page,`continuity-final-pulse-${device}`);expect((await inspect(page)).state.flags.daysReturned).toBeUndefined();await page.getByRole('button',{name:'Skip scene',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('seven-home');const home=(await inspect(page)).state;expect(home.flags.daysReturned).toBe(true);expect(home.party).toEqual(end.party);expect(home.activeParty).toEqual(end.activeParty);expect(home.inventory).toEqual(end.inventory);expect(home.xp).toBe(end.xp);
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await context.close();}
});
