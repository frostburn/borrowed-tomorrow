import {test,expect,type Page} from '@playwright/test';
import {chapterSixCapitalStart,chapterSevenRefugeStart} from '../../src/dev/canonical-saves';
import {MAPS} from '../../src/content/maps';
import {visibleSceneArt} from '../../src/content/scene-art';
import {importSave,approach} from './navigation';
import {inspect,capture,dialogue,nativeActor} from './controls';

async function until(page:Page,text:string){
 for(let i=0;i<32;i++){
  if((await page.locator('.dialogue p').textContent())?.includes(text))return;
  await page.locator('.dialogue-actions button').first().click();
 }
 throw new Error(`Dialogue did not reach: ${text}`);
}
async function hoist(page:Page,ready:boolean){
 const pieces=visibleSceneArt(MAPS.capitalquay.tiles!,(await inspect(page)).state)!.filter(p=>p.key.includes('capital-hoist'));
 expect(pieces.map(p=>p.key)).toEqual([`scene-six-capital-hoist-${ready?'hand':'damaged'}`]);
}
async function framed(page:Page){
 const frame=await page.evaluate(()=>{
  const s=window.borrowedTomorrow.inspect(),a=s.actors.find(a=>a.hero==='orrin')!,canvas=document.querySelector('#canvas canvas')!.getBoundingClientRect(),dialogue=document.querySelector('.dialogue')!.getBoundingClientRect();
  return {bottom:canvas.top+(a.y-s.view.scrollY+8)*canvas.height/s.view.height,top:dialogue.top};
 });expect(frame.bottom).toBeLessThan(frame.top);
}
for(const [device,viewport,recovered]of [['desktop',{width:1280,height:800},true],['phone',{width:390,height:844},false]]as const)test(`Orrin ${device}: delegates the hoist, trusts the gate watch and rests with Nell ${recovered?'recovered':'initially ill'}`,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:1.25,reducedMotion:device==='phone'?'reduce':'no-preference'}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('/');await expect(page).toHaveTitle(/Borrowed Tomorrow/);
  const s=chapterSixCapitalStart(recovered);s.activeParty=recovered?['nell','kit','petra']:['kit','celia','petra'];const orrin=s.party.find(h=>h.id==='orrin')!;orrin.hp=13;orrin.focus=1;await importSave(page,s);
  await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-capital-quay');await until(page,'I can sleeve that');await page.waitForTimeout(850);await framed(page);await nativeActor(page,'civilian-dockhand-rust',{x:44,y:29},.02);await hoist(page,false);await capture(page,`orrin-hoist-${device}`);
  expect((await inspect(page)).state.flags.capitalQuaySeen).toBeUndefined();expect((await inspect(page)).actors.some(a=>a.hero==='nell')).toBe(recovered);
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-capital-quay');await until(page,'No. That’ll do the job');await page.getByRole('button',{name:'Skip scene',exact:true}).click();
  const handed=(await inspect(page)).state;expect(handed.flags.capitalQuaySeen).toBe(true);expect(handed.activeParty).toEqual(s.activeParty);expect(handed.inventory).toEqual(s.inventory);expect(handed.xp).toBe(s.xp);expect(handed.party.find(h=>h.id==='orrin')).toMatchObject({hp:13,focus:1});await hoist(page,false);

  await approach(page,'capital-inner');await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-capital-street');await page.getByRole('button',{name:'Skip scene',exact:true}).click();await approach(page,'city-procession');await page.getByRole('button',{name:'Clear the procession machines',exact:true}).click();await page.getByRole('button',{name:'Win battle',exact:true}).click();await page.getByRole('button',{name:'Continue the journey',exact:true}).click();
  await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-capital-release');await until(page,'They’ll need it for the next load');await hoist(page,false);await capture(page,`orrin-payoff-${device}`);expect((await inspect(page)).state.flags.capitalStreetFreed).toBeUndefined();const earned=(await inspect(page)).state;
  await page.getByRole('button',{name:'Skip scene',exact:true}).click();const freed=(await inspect(page)).state;expect(freed.flags.capitalStreetFreed).toBe(true);expect(freed.activeParty).toEqual(s.activeParty);expect(freed.inventory).toEqual(earned.inventory);expect(freed.xp).toBe(earned.xp);await hoist(page,true);
  const quay=structuredClone(freed);quay.location={map:'capitalquay',x:43,y:33};await importSave(page,quay);await hoist(page,true);await nativeActor(page,'civilian-dockhand-rust',{x:44,y:29},.02);await capture(page,`orrin-hoist-ready-${device}`);expect((await inspect(page)).state.xp).toBe(freed.xp);

  const refuge=chapterSevenRefugeStart();refuge.flags.lastRefugeSeen=true;refuge.location={map:'lastrefuge',x:21,y:29};refuge.activeParty=['nell','kit','petra'];await importSave(page,refuge);await approach(page,'refuge-orrin');await expect.poll(async()=>(await inspect(page)).cinematic).toBe('seven-orrin');await until(page,'He’s taking the next watch');await page.waitForTimeout(800);await framed(page);await capture(page,`orrin-watch-${device}`);
  if(device==='desktop')await dialogue(page);else await page.getByRole('button',{name:'Skip scene',exact:true}).click();expect((await inspect(page)).state.flags).toEqual(refuge.flags);expect((await inspect(page)).state.activeParty).toEqual(refuge.activeParty);
  const sea=chapterSevenRefugeStart();for(const f of ['lastRefugeSeen','benefactorSeen','benefactorBodyConfronted','benefactorBodyWon','hollowSunSeen','benefactorSunConfronted','benefactorSunWon','fragmentReturned','benefactorHeartConfronted','benefactorHeartWon','daysReturned','homecomingSeen'])sea.flags[f]=true;sea.location={map:'seaholiday',x:28,y:27};sea.activeParty=refuge.activeParty;await importSave(page,sea);await page.getByRole('button',{name:'Skip scene',exact:true}).click();const holiday=(await inspect(page)).state;await approach(page,'sea-orrin');await until(page,'Then I went back to sleep');await capture(page,`orrin-holiday-${device}`);await dialogue(page);const end=(await inspect(page)).state;expect(end.flags).toEqual(holiday.flags);expect(end.inventory).toEqual(sea.inventory);expect(end.xp).toBe(sea.xp);expect(end.activeParty).toEqual(sea.activeParty);
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await context.close();}
});
