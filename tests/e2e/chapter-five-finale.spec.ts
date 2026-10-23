import { test,expect,type Page } from '@playwright/test';
import { chapterFiveFinaleStart } from '../../src/dev/canonical-saves';
import { decodeSave,SIXTH_CHAPTER } from '../../src/rules/state';
import { arrival } from '../../src/content/maps';
import { inspect,capture,dialogue,battle } from './controls';
import { approach,importSave } from './navigation';

async function start(page:Page){
 await approach(page,'ship-chart');await page.getByRole('button',{name:'Capital approach · Alban’s flagship',exact:true}).click();
 await page.getByRole('button',{name:'Enter the capital crossing',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('five-flagship-approach');
}
for(const [device,viewport,dpr]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const){
 test(`Chapter Five Act IV canonical start, surrender and saved capital departure on ${device}`,async({browser})=>{
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
   await expect.poll(async()=>(await inspect(page)).cinematic).toBe('five-alban-surrender');await capture(page,`act-four-surrender-${device}`);
   // Reload the actual victory checkpoint before Alban has been captured.
   await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('five-alban-surrender');
   expect((await inspect(page)).state.flags.albanCaptured).toBeUndefined();const won=(await inspect(page)).state;expect(won.inventory.bag['fleet-sight']).toBe(1);expect(won.xp).toBe(original.xp+360);
   if(device==='desktop')await dialogue(page);else await page.getByRole('button',{name:'Skip scene',exact:true}).click();
   expect((await inspect(page)).state.flags.albanCaptured).toBe(true);await capture(page,`act-four-command-deck-${device}`);
   await approach(page,'flagship-evacuate');await expect.poll(async()=>(await inspect(page)).cinematic).toBe('five-flagship-evacuation');await page.getByRole('button',{name:'Skip scene',exact:true}).click();
   await expect.poll(async()=>(await inspect(page)).cinematic).toBe('five-capital-departure');await capture(page,`act-four-open-crossing-${device}`);await page.getByRole('button',{name:'Skip scene',exact:true}).click();
   await expect(page.getByRole('heading',{name:'Chapter Five complete',exact:true})).toBeVisible();const ended=(await inspect(page)).state;expect(ended.boundary).toBe(SIXTH_CHAPTER);expect(decodeSave(JSON.stringify(ended))).toEqual(ended);expect(ended.inventory).toEqual(won.inventory);expect(ended.activeParty).toEqual(original.activeParty);expect(ended.flags.tomasRescued).toBe(true);await capture(page,`act-four-complete-${device}`);
   await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect(page.getByRole('heading',{name:'Chapter Five complete',exact:true})).toBeVisible();expect((await inspect(page)).state.journal.filter(j=>j==='albanCaptured')).toHaveLength(1);expect((await inspect(page)).state.inventory.bag['fleet-sight']).toBe(1);
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
