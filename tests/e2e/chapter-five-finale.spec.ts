import { test,expect,type Page } from '@playwright/test';
import { chapterFiveFinaleStart } from '../../src/dev/canonical-saves';
import { SIXTH_CHAPTER } from '../../src/rules/state';
import { decodeSave } from '../../src/rules/save';
import { arrival } from '../../src/content/maps';
import { inspect,capture,dialogue,battle } from './controls';
import { approach,importSave } from './navigation';

async function start(page:Page){
 await approach(page,'ship-chart');await page.getByRole('button',{name:'Capital approach · Alban’s flagship',exact:true}).click();
 await page.getByRole('button',{name:'Enter the capital crossing',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('five-flagship-approach');
}
for(const [device,viewport,dpr]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const){
 test(`Chapter Five Act IV canonical start, divine retaliation and saved capital departure on ${device}`,async({browser})=>{
  test.setTimeout(240000);
  const context=await browser.newContext({viewport,deviceScaleFactor:dpr,reducedMotion:'reduce'}),page=await context.newPage(),errors:string[]=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  try{
   await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');await page.getByRole('button',{name:'Begin Chapter Five · Act IV (canonical)',exact:true}).click();
   await expect.poll(async()=>(await inspect(page)).state.flags.allAnchorsSeen).toBe(true);const original=(await inspect(page)).state;expect(original.xp).toBe(2740);expect(original.flags.emperorOfferTold).toBe(true);expect((await inspect(page)).cinematic).toBeNull();await capture(page,`act-four-ready-${device}`);
   await start(page);await dialogue(page);await expect.poll(async()=>(await inspect(page)).mode).toBe('battle');const before=(await inspect(page)).battle!;
   expect(before.encounter).toBe('alban-flagship');expect(before.bandages).toBe(original.bandages);expect(before.units.filter(u=>u.side==='party').map(u=>u.id)).toEqual(original.activeParty);await capture(page,`act-four-battle-${device}`);
   if(device==='desktop')await battle(page);else{
    await page.getByRole('button',{name:'Win battle',exact:true}).click();await page.getByRole('button',{name:'Continue the journey',exact:true}).click();
   }
   await expect.poll(async()=>(await inspect(page)).cinematic).toBe('five-benefactor-claim');await capture(page,`act-four-claim-${device}`);
   // Reload the actual victory checkpoint before the Benefactor intervenes.
   await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('five-benefactor-claim');
   expect((await inspect(page)).state.flags.albanDestroyed).toBeUndefined();const won=(await inspect(page)).state;expect(won.inventory.bag['fleet-sight']).toBe(1);expect(won.xp).toBe(original.xp+360);
   if(device==='desktop')await dialogue(page);else await page.getByRole('button',{name:'Skip scene',exact:true}).click();
   if(device==='phone'){await expect.poll(async()=>(await inspect(page)).cinematic).toBe('five-retaliation');await capture(page,`act-four-berth-${device}`);await page.getByRole('button',{name:'Skip scene',exact:true}).click();}
   expect((await inspect(page)).state.flags.albanDestroyed).toBe(true);const sick=(await inspect(page)).state;expect(sick.activeParty).toEqual(['kit','orrin','petra']);expect(sick.party[0]).toMatchObject({id:'nell',hp:1,focus:0});expect(sick.boundary).toBeNull();
   await page.getByRole('button',{name:'Equipment',exact:true}).click();await page.getByRole('button',{name:'Nell',exact:true}).click();await expect(page.getByText('Too ill to fight · resting aboard',{exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Set active',exact:true})).toBeDisabled();await capture(page,`act-four-nell-unavailable-${device}`);
   // A new leader is painted immediately, and the last active fighter cannot be removed.
   await page.getByRole('button',{name:'Kit',exact:true}).click();await page.getByRole('button',{name:'Move to reserve',exact:true}).click();expect((await inspect(page)).actors.some(a=>a.hero==='orrin')).toBe(true);await page.getByRole('button',{name:'Set active',exact:true}).click();await page.getByRole('button',{name:'Close',exact:true}).click();
   await approach(page,'ship-supply');await page.getByRole('button',{name:'Rest · restore everyone’s HP and focus',exact:true}).click();expect((await inspect(page)).state.party[0]).toMatchObject({hp:1,focus:0});
   await approach(page,'ship-herald');await page.getByRole('button',{name:'Defend the survey ship',exact:true}).click();const hunters=(await inspect(page)).battle!;expect(hunters.encounter).toBe('benefactor-retaliation');expect(hunters.units.filter(u=>u.side==='party').some(u=>u.id==='nell')).toBe(false);await capture(page,`act-four-hunters-${device}`);
   if(device==='desktop')await battle(page);else{await page.getByRole('button',{name:'Win battle',exact:true}).click();await page.getByRole('button',{name:'Continue the journey',exact:true}).click();}
   await expect.poll(async()=>(await inspect(page)).cinematic).toBe('five-capital-departure');await capture(page,`act-four-open-crossing-${device}`);await page.getByRole('button',{name:'Skip scene',exact:true}).click();
   await expect(page.getByRole('heading',{name:'Chapter Five complete',exact:true})).toBeVisible();const ended=(await inspect(page)).state;expect(ended.boundary).toBe(SIXTH_CHAPTER);expect(decodeSave(JSON.stringify(ended))).toEqual(ended);expect(ended.inventory).toEqual(won.inventory);expect(ended.activeParty).toEqual(['orrin','petra','kit']);expect(ended.flags.tomasRescued).toBe(true);expect(ended.party[0]).toMatchObject({hp:1,focus:0});expect(ended.xp).toBe(original.xp+530);await capture(page,`act-four-complete-${device}`);
   await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect(page.getByRole('heading',{name:'Chapter Five complete',exact:true})).toBeVisible();expect((await inspect(page)).state.journal.filter(j=>j==='benefactorClaimSeen')).toHaveLength(1);expect((await inspect(page)).state.inventory.bag['fleet-sight']).toBe(1);expect((await inspect(page)).state.activeParty).toEqual(ended.activeParty);
   await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
  }finally{await context.close();}
 });
}
test('a failed flagship asset keeps the previous save for retry; a deferred offer gates the approach',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Begin Chapter One',exact:true}).click();await page.getByRole('button',{name:'Skip scene',exact:true}).click();const original=(await inspect(page)).state;
 await page.route('**/art/vector/bosses/flagship-hull.svg',r=>r.abort());
 const save=chapterFiveFinaleStart();await page.getByRole('button',{name:'Save',exact:true}).click();const chooser=page.waitForEvent('filechooser');await page.getByRole('button',{name:'Import save file',exact:true}).click();await (await chooser).setFiles({name:'act-four.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(save))});
 await expect(page.getByRole('status')).toContainText('checkpoint is intact');expect((await inspect(page)).state.flags).toEqual(original.flags);expect((await inspect(page)).state.inventory).toEqual(original.inventory);
 await page.unroute('**/art/vector/bosses/flagship-hull.svg');await page.getByRole('button',{name:'Close',exact:true}).click();delete save.flags.emperorOfferSeen;delete save.flags.emperorOfferTold;save.location=arrival('airship','start');await importSave(page,save);
 await approach(page,'ship-chart');await expect(page.getByRole('button',{name:'Capital approach · Alban’s flagship',exact:true})).toBeDisabled();await page.getByRole('button',{name:'Stay aboard',exact:true}).click();await approach(page,'ship-cabin');await page.getByRole('button',{name:'Skip scene',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('five-emperor-told');await page.getByRole('button',{name:'Skip scene',exact:true}).click();await approach(page,'ship-chart');await expect(page.getByRole('button',{name:'Capital approach · Alban’s flagship',exact:true})).toBeEnabled();
});

test('the approach animates with the cursor parked, skips cleanly and reveals the capital at departure',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/');await importSave(page,chapterFiveFinaleStart());await start(page);
 for(let i=0;i<4;i++){if((await page.locator('.dialogue p').textContent())?.includes('Two launches'))break;await page.locator('.dialogue-actions button').first().click();}
 await expect(page.locator('.dialogue p')).toContainText('Two launches');await page.mouse.move(0,0);
 const sample=()=>page.evaluate(()=>{const c=document.querySelector<HTMLCanvasElement>('.pixel-output')!,pixels=c.getContext('2d')!.getImageData(0,0,c.width,c.height).data;let h=2166136261;for(let i=0;i<pixels.length;i+=4)h=Math.imul(h^pixels[i],16777619);return h>>>0;});
 await page.waitForTimeout(200);const early=await sample();await page.waitForTimeout(700);expect(await sample()).not.toBe(early);await capture(page,'act-four-approach');
 await page.getByRole('button',{name:'Skip scene',exact:true}).click();await expect.poll(async()=>(await inspect(page)).mode).toBe('battle');await page.getByRole('button',{name:'Win battle',exact:true}).click();await page.getByRole('button',{name:'Continue the journey',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('five-benefactor-claim');
 for(let i=0;i<17;i++){
  const prose=await page.locator('.dialogue p').textContent();
  if(prose?.includes('Alban and the men below him vanish'))break;
  await page.locator('.dialogue-actions button').first().click();
 }
 await expect(page.locator('.dialogue p')).toContainText('Alban and the men below him vanish');await page.mouse.move(0,0);await page.waitForTimeout(100);const strike=await sample();await page.waitForTimeout(600);expect(await sample()).not.toBe(strike);await capture(page,'act-four-destruction');await page.waitForTimeout(1100);await capture(page,'act-four-destroyed-hull');
 await page.getByRole('button',{name:'Skip scene',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('five-retaliation');await page.getByRole('button',{name:'Skip scene',exact:true}).click();
 await approach(page,'ship-herald');await page.getByRole('button',{name:'Defend the survey ship',exact:true}).click();await page.getByRole('button',{name:'Win battle',exact:true}).click();await page.getByRole('button',{name:'Continue the journey',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('five-capital-departure');await capture(page,'act-four-capital-course');await page.getByRole('button',{name:'Skip scene',exact:true}).click();await expect(page.getByRole('heading',{name:'Chapter Five complete',exact:true})).toBeVisible();expect(errors).toEqual([]);
});
