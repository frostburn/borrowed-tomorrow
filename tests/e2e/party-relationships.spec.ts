import {test,expect,type Page} from '@playwright/test';
import {chapterFiveFinaleStart,chapterSevenRefugeStart} from '../../src/dev/canonical-saves';
import {anchorCheckpoint,windmereCheckpoint} from '../support/anchors';
import {jungleCheckpoint} from '../support/jungle';
import {arrival} from '../../src/content/maps';
import type {GameState,HeroId} from '../../src/rules/state';
import {importSave,approach} from './navigation';
import {inspect,capture,dialogue,nativeActor} from './controls';

const resources=(s:GameState)=>({flags:s.flags,party:s.party,activeParty:s.activeParty,inventory:s.inventory,xp:s.xp,coins:s.coins,bandages:s.bandages,journal:s.journal,boundary:s.boundary});
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
  return ids.map(id=>{
   const a=s.actors.find(a=>a.hero===id)!;
   return {id,bottom:canvas.top+(a.y-s.view.scrollY+8)*canvas.height/s.view.height,top:canvas.top+(a.y-s.view.scrollY-68)*canvas.height/s.view.height,left:canvas.left+(a.x-s.view.scrollX-40)*canvas.width/s.view.width,right:canvas.left+(a.x-s.view.scrollX+40)*canvas.width/s.view.width,dialogue:dialogue.top,canvasTop:canvas.top,canvasLeft:canvas.left,canvasRight:canvas.right};
  });
 },heroes);
 for(const a of frame){expect(a.bottom,a.id).toBeLessThan(a.dialogue);expect(a.top,a.id).toBeGreaterThanOrEqual(a.canvasTop);expect(a.left,a.id).toBeGreaterThanOrEqual(a.canvasLeft);expect(a.right,a.id).toBeLessThanOrEqual(a.canvasRight);}
}

// Flight deck -> existing companion markers -> staged conversations, with reserves
// present and no campaign mutation; then the one-time grief/recovery and real picnic.
for(const [device,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]as const)test(`Party relationships ${device}: shared work, grief, recovery and a group holiday`,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:1.25,reducedMotion:device==='phone'?'reduce':'no-preference'}),page=await context.newPage(),errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('/');await expect(page).toHaveTitle(/Borrowed Tomorrow/);
  for(const late of [false,true])for(const [id,heroes,active,text]of [
   ['orrin',['orrin','kit'],['nell','celia','petra'],'You waved yesterday'],
   ['petra',['kit','petra'],['nell','orrin','celia'],late?'keep telling me what you can see':'Stay there a moment'],
   ['celia',['celia','petra'],['nell','orrin','kit'],'Do you play cards'],
  ]as const){
   const s=late?chapterFiveFinaleStart():anchorCheckpoint('firstFlightSeen');s.activeParty=[...active]as HeroId[];s.party.find(h=>h.id==='orrin')!.hp=13;s.party.find(h=>h.id==='celia')!.focus=1;
   await importSave(page,s);
   const before=resources((await inspect(page)).state);await approach(page,`ship-${id}`);await expect.poll(async()=>(await inspect(page)).cinematic).toBe(`five-deck-${id}`);await until(page,text);await page.waitForTimeout(700);await framed(page,[...heroes]);await capture(page,`party-${id}-${late?'late':'early'}-${device}`);
   if(id==='orrin'){await nativeActor(page,'orrin-right',{x:43,y:30},.02);await nativeActor(page,'kit-left',{x:45,y:30},.02);}
   if(!late&&id==='orrin'){
    await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).state.location.map).toBe('airship');await expect.poll(async()=>(await inspect(page)).cinematic).toBeNull();expect(resources((await inspect(page)).state)).toEqual(before);await approach(page,'ship-orrin');
   }
   if(device==='desktop')await dialogue(page);else await page.getByRole('button',{name:'Skip scene',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBeNull();expect(resources((await inspect(page)).state)).toEqual(before);
  }

  const offer=windmereCheckpoint('windmereComplete','hammerplain');offer.flags.emperorOfferSeen=true;offer.location=arrival('airship','start');offer.activeParty=['nell','kit','petra'];await importSave(page,offer);await expect.poll(async()=>(await inspect(page)).cinematic).toBe('five-emperor-told');await until(page,'He told me it was the wind');await page.waitForTimeout(700);await framed(page,['nell','orrin']);await capture(page,`party-ansel-${device}`);expect((await inspect(page)).state.flags.emperorOfferTold).toBeUndefined();
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('five-emperor-told');await page.getByRole('button',{name:'Skip scene',exact:true}).click();const told=(await inspect(page)).state;expect(told.flags.emperorOfferTold).toBe(true);expect(told.inventory).toEqual(offer.inventory);expect(told.party).toEqual(offer.party);expect(told.activeParty).toEqual(offer.activeParty);expect(told.xp).toBe(offer.xp);

  const river=jungleCheckpoint('riverRestSeen');river.location=arrival('riverhaven','return');river.activeParty=['kit','orrin','celia'];await importSave(page,river);await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-river-thanks');await until(page,'Shall I walk with you');await page.waitForTimeout(700);await framed(page,['nell','petra']);await capture(page,`party-petra-recovery-${device}`);await dialogue(page);const thanks=(await inspect(page)).state;expect(thanks.flags.riverThanksSeen).toBe(true);expect(thanks.activeParty).toEqual(river.activeParty);expect(thanks.party).toEqual(river.party);expect(thanks.inventory).toEqual(river.inventory);expect(thanks.xp).toBe(river.xp);

  const sea=chapterSevenRefugeStart();for(const f of ['lastRefugeSeen','benefactorSeen','benefactorBodyConfronted','benefactorBodyWon','hollowSunSeen','benefactorSunConfronted','benefactorSunWon','fragmentReturned','benefactorHeartConfronted','benefactorHeartWon','daysReturned','homecomingSeen'])sea.flags[f]=true;sea.location={map:'seaholiday',x:25,y:26};sea.activeParty=['nell','kit','petra'];await importSave(page,sea);await page.getByRole('button',{name:'Skip scene',exact:true}).click();const holiday=resources((await inspect(page)).state);await approach(page,'sea-friends');await expect.poll(async()=>(await inspect(page)).cinematic).toBe('seven-picnic');await until(page,'Deal me in');await page.waitForTimeout(950);await framed(page,['nell','orrin','kit','celia','petra']);await capture(page,`party-picnic-${device}`);if(device==='desktop')await dialogue(page);else await page.getByRole('button',{name:'Skip scene',exact:true}).click();expect(resources((await inspect(page)).state)).toEqual(holiday);
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await context.close();}
});
