import {test,expect,type Page} from '@playwright/test';
import {windmereCheckpoint} from '../support/anchors';
import {jungleCheckpoint} from '../support/jungle';
import {chapterSevenRefugeStart} from '../../src/dev/canonical-saves';
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
for(const [device,viewport,previous]of [['desktop',{width:1280,height:800},'none'],['phone',{width:390,height:844},'both']]as const)test(`Celia ${device}: Windmere ${previous==='none'?'first':'third'}, trusted treatment and accepting company`,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:1.25,reducedMotion:device==='phone'?'reduce':'no-preference'}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('/');await expect(page).toHaveTitle(/Borrowed Tomorrow/);
  const wind=windmereCheckpoint('windmereFreed',previous);wind.location=arrival('windmere','night');wind.activeParty=['nell','orrin','kit'];await importSave(page,wind);
  await expect.poll(async()=>(await inspect(page)).cinematic).toBe('five-wind-night');await until(page,'students I sent here');await page.waitForTimeout(1000);await framed(page,['celia','sera']);await capture(page,`celia-windmere-${device}`);
  expect((await inspect(page)).state.flags.windmereComplete).toBeUndefined();
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('five-wind-night');await until(page,'reads the missing words');await dialogue(page);
  const morning=(await inspect(page)).state;expect(morning.flags.windmereComplete).toBe(true);expect(morning.activeParty).toEqual(wind.activeParty);expect(morning.inventory).toEqual(wind.inventory);expect(morning.xp).toBe(wind.xp);

  const river=jungleCheckpoint('rainhouseWon');river.activeParty=['kit','orrin','petra'];const celia=river.party.find(h=>h.id==='celia')!;celia.hp=17;celia.focus=1;await importSave(page,river);
  async function beginTreatment(){await approach(page,'river-treatment');await page.getByRole('button',{name:'Bring Nell and begin the treatment',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-river-treatment');}
  await beginTreatment();await until(page,'I’ll watch your wrist');await page.waitForTimeout(800);await framed(page,['celia','ines']);await capture(page,`celia-trust-${device}`);
  const interrupted=(await inspect(page)).state;expect(interrupted.flags.nellRecovered).toBeUndefined();expect(interrupted.flags.riverCareArrived).toBeUndefined();expect(interrupted.xp).toBe(river.xp);
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await beginTreatment();
  if(device==='desktop')await dialogue(page);else await page.getByRole('button',{name:'Skip scene',exact:true}).click();
  await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-river-rest');const healed=(await inspect(page)).state;expect(healed.flags.nellRecovered).toBe(true);expect(healed.flags.riverCareArrived).toBe(true);expect(healed.xp).toBe(river.xp+120);expect(healed.inventory.bag['riverglass-reflector']).toBe((river.inventory.bag['riverglass-reflector']??0)+1);expect(healed.activeParty).toEqual(river.activeParty);expect(healed.party.find(h=>h.id==='celia')).toMatchObject({hp:17,focus:1});
  await page.getByRole('button',{name:'Skip scene',exact:true}).click();await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();const restored=(await inspect(page)).state;expect(restored.xp).toBe(healed.xp);expect(restored.inventory).toEqual(healed.inventory);expect(restored.flags.riverRestSeen).toBe(true);

  const refuge=chapterSevenRefugeStart();refuge.flags.lastRefugeSeen=true;refuge.activeParty=['nell','kit','petra'];await importSave(page,refuge);await approach(page,'refuge-celia');await until(page,'I’d like some company');await capture(page,`celia-company-${device}`);await dialogue(page);expect((await inspect(page)).state.flags).toEqual(refuge.flags);
  const sea=chapterSevenRefugeStart();for(const f of ['lastRefugeSeen','benefactorSeen','benefactorBodyConfronted','benefactorBodyWon','hollowSunSeen','benefactorSunConfronted','benefactorSunWon','fragmentReturned','benefactorHeartConfronted','benefactorHeartWon','daysReturned','homecomingSeen'])sea.flags[f]=true;sea.location=arrival('seaholiday','start');sea.activeParty=refuge.activeParty;await importSave(page,sea);await page.getByRole('button',{name:'Skip scene',exact:true}).click();
  const holiday=(await inspect(page)).state;await approach(page,'sea-celia');await until(page,'I gave it to Tomas');await capture(page,`celia-holiday-${device}`);await dialogue(page);const end=(await inspect(page)).state;expect(end.flags).toEqual(holiday.flags);expect(end.activeParty).toEqual(sea.activeParty);expect(end.inventory).toEqual(sea.inventory);expect(end.xp).toBe(sea.xp);
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await context.close();}
});
