import { expect,test,type Page } from '@playwright/test';
import { anchorCheckpoint,anchorDeparture } from '../support/anchors';
import { importSave,approach,travel } from './navigation';
import { battle,capture,dialogue,inspect,nativeScene,clickWorld } from './controls';
async function fastBattle(page:Page){
 await expect.poll(async()=>(await inspect(page)).mode).toBe('battle');await page.getByRole('button',{name:'Win battle',exact:true}).click();
 await expect(page.getByRole('heading',{name:'The line is clear',exact:true})).toBeVisible();await page.getByRole('button',{name:'Continue the journey',exact:true}).click();
}
async function equip(page:Page,hero:string,item:string){
 await page.getByRole('button',{name:'Equipment',exact:true}).click();await page.getByRole('group',{name:'Character',exact:true}).getByRole('button',{name:hero,exact:true}).click();
 await page.locator('.ci-items').getByRole('button',{name:new RegExp(`^${item}`)}).click();await page.getByRole('button',{name:`Equip on ${hero}`,exact:true}).click();await page.getByRole('button',{name:'Close',exact:true}).click();
}
for(const [route,device,viewport]of [['lift','desktop',{width:1280,height:800}],['race','phone',{width:390,height:844}]]as const){
 test(`@journey Chapter Five Act I ${route} route frees Hammerplain on ${device}`,async({page})=>{
  test.setTimeout(600000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize(viewport);await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  const departure=anchorDeparture();departure.activeParty=['nell','petra','celia'];await importSave(page,departure);await page.getByRole('button',{name:'Begin Chapter Five',exact:true}).click();await dialogue(page);if(device==='desktop')await nativeScene(page,'airfield');await capture(page,`airfield-${device}`);
  await approach(page,'airfield-seizure');await page.getByRole('button',{name:'Clear the gangway',exact:true}).click();await fastBattle(page);
  await approach(page,'airfield-board');await page.getByRole('button',{name:'Skip scene',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('five-first-flight');await dialogue(page);if(device==='desktop')await nativeScene(page,'airship');await capture(page,`survey-deck-${device}`);
  await approach(page,'ship-chart');await expect(page.getByRole('button',{name:'Dawnwatch · Act II coming next',exact:true})).toBeDisabled();await page.getByRole('button',{name:'Hammerplain · casting works',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('five-hammer');await dialogue(page);if(device==='desktop')await nativeScene(page,'hammerplain');await capture(page,`hammerplain-${device}`);
  await approach(page,'hammer-coat');await page.getByRole('button',{name:'Leave the store sealed',exact:true}).click();
  if(route==='lift'){await approach(page,'hammer-coat');await page.getByRole('button',{name:'Open the safety store · fight its guards',exact:true}).click();await fastBattle(page);await equip(page,'Petra','Foundry safety coat');}
  await travel(page,'hammer-cooling','coolingworks');await dialogue(page);if(device==='desktop')await nativeScene(page,'coolingworks');await capture(page,`cooling-race-${device}`);
  await approach(page,'cooling-route');await page.getByRole('button',{name:route==='lift'?'Take the freight lift · ranged crows':'Take the race walk · shallow water',exact:true}).click();await fastBattle(page);
  await approach(page,'cooling-wheel');await dialogue(page);await capture(page,`manual-cooling-${device}`);await travel(page,'cooling-forge','anchorforge');await dialogue(page);if(device==='desktop')await nativeScene(page,'anchorforge');await capture(page,`anchor-gantry-${device}`);
  // Rest before the actual boss playthrough, using the ship's ordinary supply point.
  if(route==='lift'){
   await travel(page,'forge-cooling','coolingworks');await travel(page,'cooling-return','hammerplain');await travel(page,'hammer-ship','airship');await approach(page,'ship-supply');await page.getByRole('button',{name:'Rest · restore everyone’s HP and focus',exact:true}).click();
   await approach(page,'ship-chart');await page.getByRole('button',{name:'Hammerplain · casting works',exact:true}).click();await expect.poll(async()=>(await inspect(page)).state.location.map).toBe('hammerplain');await travel(page,'hammer-cooling','coolingworks');await travel(page,'cooling-forge','anchorforge');
  }
  await approach(page,'forge-carrier');await page.getByRole('button',{name:'Hold off the furnace carrier',exact:true}).click();await capture(page,`furnace-boss-${device}`);
  if(route==='lift')await battle(page,`furnace-carrier-playthrough-${device}`);else await fastBattle(page);
  expect((await inspect(page)).state.inventory.characters.orrin.fitting).toBe('return-valve');await equip(page,'Orrin','Balanced expansion valve');
  await approach(page,'forge-anchor');await dialogue(page);expect((await inspect(page)).state.flags.hammerplainFreed).toBe(true);await capture(page,`anchor-disconnected-${device}`);
  await travel(page,'forge-cooling','coolingworks');await travel(page,'cooling-return','hammerplain');await expect.poll(async()=>(await inspect(page)).cinematic).toBe('five-workers');await dialogue(page);await capture(page,`workers-engine-${device}`);
  await travel(page,'hammer-ship','airship');await expect.poll(async()=>(await inspect(page)).cinematic).toBe('five-fleet');await dialogue(page);await capture(page,`hammerplain-complete-${device}`);
  const saved=(await inspect(page)).state;expect(saved.flags).toMatchObject({hammerplainComplete:true,hammerplainFreed:true,fleetSighted:true,tomasRescued:true,forgeFlooded:route==='race'});expect(saved.flags.chapterFiveComplete).toBeUndefined();expect(saved.boundary).toBeNull();expect(saved.activeParty).toEqual(departure.activeParty);expect(saved.inventory.characters.orrin.fitting).toBe('forge-valve');
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).state.inventory).toEqual(saved.inventory);expect((await inspect(page)).state.flags.hammerplainComplete).toBe(true);expect(errors).toEqual([]);
 });
}
test('Chapter Five canonical start, interrupted arrival and failed destination retry preserve the departure',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.getByRole('button',{name:'Begin Chapter Five (canonical)',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('five-airfield');await capture(page,'canonical-five-opening');
 expect((await inspect(page)).state.xp).toBe(1225);expect((await inspect(page)).state.flags.airfieldSeen).toBeUndefined();await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('five-airfield');await page.getByRole('button',{name:'Skip scene',exact:true}).click();
 const before=anchorDeparture();await page.goto('/');await importSave(page,before);await page.route('**/art/vector/chapter-five/forge-anchor.svg',r=>r.abort());await page.getByRole('button',{name:'Begin Chapter Five',exact:true}).click();await expect(page.getByRole('status')).toContainText('checkpoint is intact');expect((await inspect(page)).state).toMatchObject({chapter:'chapter-four',boundary:'chapter-five:anchors',inventory:before.inventory,party:before.party});
 await page.unroute('**/art/vector/chapter-five/forge-anchor.svg');await page.getByRole('button',{name:'Begin Chapter Five',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('five-airfield');
});
test('the painted cooling wheel and anchor breaker are clickable, with interrupted releases remaining uncommitted',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');const water=anchorCheckpoint('forgeApproachWon');water.location={map:'coolingworks',x:45,y:25};await importSave(page,water);await clickWorld(page,46,20);await expect.poll(async()=>(await inspect(page)).cinematic).toBe('five-water');await page.getByRole('button',{name:'Skip scene',exact:true}).click();expect((await inspect(page)).state.flags.coolingOpened).toBe(true);
 const breaker=anchorCheckpoint('furnaceWon');breaker.location={map:'anchorforge',x:32,y:23};await importSave(page,breaker);await clickWorld(page,32,17);await expect.poll(async()=>(await inspect(page)).cinematic).toBe('five-release');expect((await inspect(page)).state.flags.hammerplainFreed).toBeUndefined();await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).state.location.map).toBe('anchorforge');expect((await inspect(page)).state.flags.hammerplainFreed).toBeUndefined();await approach(page,'forge-anchor');await page.getByRole('button',{name:'Skip scene',exact:true}).click();expect((await inspect(page)).state.flags.hammerplainFreed).toBe(true);expect(errors).toEqual([]);
});
