import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {chapterSevenDeparture,chapterSixFinaleStart} from '../../src/dev/canonical-saves';
import {importSave,approach} from './navigation';
import {capture,inspect} from './controls';
import {receiveItem,equipItem} from '../../src/rules/inventory';
import {arrival} from '../../src/content/maps';

for(const [device,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]as const)test(`hollow crossing preserves the recovered departure and replays on ${device}`,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:1.25,reducedMotion:'reduce'}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  const saved=chapterSevenDeparture();saved.coins=93;saved.party[0].hp=31;saved.party[0].focus=2;saved.bandages=1;saved.activeParty=['petra','kit','celia'];
  receiveItem(saved.inventory,'brass-reflector');equipItem(saved.inventory,'nell','brass-reflector');
  await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');await importSave(page,saved);
  await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-seven-crossing');await page.getByRole('button',{name:'Pause',exact:true}).click();
  expect((await inspect(page)).state).toEqual(saved);await expect(page.getByRole('heading',{name:'Chapter Six complete',exact:true})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Equipment',exact:true})).toBeDisabled();
  for(const shot of ['ascent','threshold','hangingsea']){
   await expect(page.locator('#canvas')).toHaveAttribute('data-crossing-shot',shot);await capture(page,`hollow-crossing-${shot}-${device}`);
   if(shot!=='hangingsea')await page.getByRole('button',{name:'Next shot',exact:true}).click();
  }
  const output=page.waitForEvent('download');await page.getByRole('button',{name:'Export departure save',exact:true}).click();expect(JSON.parse(await readFile((await(await output).path())!,'utf8'))).toEqual(saved);
  await page.getByRole('button',{name:'Return to the allied landing',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBeNull();await expect(page.getByRole('button',{name:'Equipment',exact:true})).toBeEnabled();
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-seven-crossing');
  await page.getByRole('button',{name:'Skip cinematic',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('seven-crossing');
  const arrived=(await inspect(page)).state;expect(arrived).toMatchObject({chapter:'chapter-seven',boundary:null,inventory:saved.inventory,party:saved.party,activeParty:saved.activeParty,coins:saved.coins,xp:saved.xp,bandages:saved.bandages,flags:saved.flags});
  expect(arrived.flags.domainEntered).toBeUndefined();expect(arrived.flags.nellLost).toBeUndefined();
  await page.getByRole('button',{name:'Skip scene',exact:true}).click();expect((await inspect(page)).state.flags.domainEntered).toBe(true);
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await context.close();}
});

test('the hollow crossing moves with the pointer parked, pauses and reaches the original warning',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/');const saved=chapterSevenDeparture();await importSave(page,saved);await page.mouse.move(1,1);
 await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-seven-crossing');await page.waitForTimeout(700);
 const first=await page.locator('.pixel-output').screenshot();await page.waitForTimeout(400);expect(await page.locator('.pixel-output').screenshot()).not.toEqual(first);
 await page.getByRole('button',{name:'Pause',exact:true}).click();await page.waitForTimeout(100);const paused=await page.locator('.pixel-output').screenshot();await page.waitForTimeout(350);expect(await page.locator('.pixel-output').screenshot()).toEqual(paused);
 await page.getByRole('button',{name:'Play',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic,{timeout:30000}).toBe('seven-crossing');
 expect((await inspect(page)).state).toMatchObject({chapter:'chapter-seven',boundary:null,party:saved.party,inventory:saved.inventory,activeParty:saved.activeParty,coins:saved.coins});expect((await inspect(page)).state.flags.domainEntered).toBeUndefined();
});

test('a missing final-domain asset holds the last shot and recovered departure for retry',async({page})=>{
 const url='**/art/vector/chapter-seven/takenwater-back.svg';await page.route(url,r=>r.abort());await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');const saved=chapterSevenDeparture();await importSave(page,saved);
 await page.getByRole('button',{name:'Skip cinematic',exact:true}).click();await expect(page.getByRole('button',{name:'Retry crossing',exact:true})).toBeEnabled();await expect(page.locator('#canvas')).toHaveAttribute('data-crossing-shot','hangingsea');
 expect((await inspect(page)).state).toEqual(saved);await expect(page.locator('.crossing-controls')).toContainText('return to the allied landing');await capture(page,'hollow-crossing-failed-load');
 await page.unroute(url);await page.getByRole('button',{name:'Retry crossing',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('seven-crossing');
});

test('the workshop reviews all hollow crossing shots without campaign or build writes',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/?dev=cinematics&film=hollow-crossing');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop');
 const before=(await inspect(page)).state,storage=await page.evaluate(()=>JSON.stringify(localStorage));
 for(const [index,shot]of ['ascent','threshold','hangingsea'].entries()){
  await expect(page.getByRole('button',{name:'Chapter Six → Seven',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.locator(`[data-ending-select="${index}"]`).click();await page.getByRole('button',{name:'Play selected shot',exact:true}).click();await expect(page.locator('#canvas')).toHaveAttribute('data-crossing-shot',shot);
  expect((await inspect(page)).state).toEqual(before);await capture(page,`hollow-crossing-workshop-${shot}`);await page.getByRole('button',{name:'Back to workshop',exact:true}).click();
 }
 await page.getByRole('button',{name:'Chapter Five → Six',exact:true}).click();await expect(page.getByRole('button',{name:'Chapter Five → Six',exact:true})).toHaveAttribute('aria-pressed','true');await expect(page.locator('.ending-shot-list')).toContainText('Keeping watch');
 expect(await page.evaluate(()=>JSON.stringify(localStorage))).toBe(storage);await expect(page.locator('vite-error-overlay')).toHaveCount(0);
});

test('Alda earns the hollow crossing only after choosing departure and the original warning stays uncommitted',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');const saved=chapterSevenDeparture();delete saved.flags.chapterSixComplete;saved.boundary=null;saved.journal=saved.journal.filter(entry=>entry!=='sixDeparture'&&entry!=='chapterSixComplete');
 await importSave(page,saved);await approach(page,'capital-departure');await page.getByRole('button',{name:'Stay · visit allies and fit equipment',exact:true}).click();expect((await inspect(page)).state).toMatchObject({boundary:null,flags:saved.flags});expect((await inspect(page)).state.flags.chapterSixComplete).toBeUndefined();
 await approach(page,'capital-departure');await page.getByRole('button',{name:'Prepare the final crossing',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-seven-crossing');
 const departure=(await inspect(page)).state;expect(departure.boundary).toBe('chapter-seven:hollow-sun');expect(departure.flags.chapterSixComplete).toBe(true);expect(departure.flags.domainEntered).toBeUndefined();expect(departure.flags.nellRecovered).toBe(true);expect(departure.inventory).toEqual(saved.inventory);expect(departure.activeParty).toEqual(saved.activeParty);
 await page.getByRole('button',{name:'Skip cinematic',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('seven-crossing');expect((await inspect(page)).state.flags.domainEntered).toBeUndefined();
});

test('canonical Chapter Seven starts at its original confrontation and an uncured ending never gets the crossing',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.getByRole('button',{name:'Begin Chapter Seven (canonical)',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('seven-crossing');
 await page.getByRole('button',{name:'Skip scene',exact:true}).click();
 const s=chapterSixFinaleStart(false);for(const f of ['capitalWarningSeen','capitalAssaultCommitted','capitalRiskAccepted','emperorSeen','emperorConfronted','emperorWon','emperorFallen','lightbearerSeen','lightbearerConfronted','lightbearerWon','nellLost','emptySeatSeen','lightbearerEnding'])s.flags[f]=true;
 s.party[0].hp=0;s.location=arrival('laststation','start');await importSave(page,s);await expect(page.getByRole('heading',{name:'An unfinished tomorrow',exact:true})).toBeVisible();expect((await inspect(page)).cinematic).toBeNull();expect((await inspect(page)).state.boundary).toBeNull();await expect(page.getByRole('button',{name:'Skip cinematic',exact:true})).toHaveCount(0);
});
