import {test,expect,type Page} from '@playwright/test';
import {chapterSevenDeparture,chapterSevenRefugeStart} from '../../src/dev/canonical-saves';
import {inspect,capture,dialogue,battle} from './controls';
import {importSave,approach} from './navigation';
import {arrival} from '../../src/content/maps';
async function drain(page:Page){for(let i=0;i<12;i++){await expect.poll(async()=>(await inspect(page)).busy,{timeout:30000}).toBe(false);if(!(await inspect(page)).cinematic)return;await page.getByRole('button',{name:'Skip scene',exact:true}).click();}throw new Error('Chapter Seven scene chain did not finish');}
async function at(page:Page,map:string){await expect.poll(async()=>(await inspect(page)).state.location.map,{timeout:30000}).toBe(map);await drain(page);}
async function win(page:Page){await page.getByRole('button',{name:'Win battle',exact:true}).click();await page.getByRole('button',{name:'Continue the journey',exact:true}).click();await drain(page);}
async function fight(page:Page,id:string,label:string){await approach(page,id);await page.getByRole('button',{name:label,exact:true}).click();await expect.poll(async()=>(await inspect(page)).mode).toBe('battle');}
for(const [device,viewport,dpr]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const)test(`@journey Chapter Seven ${device}: stolen days, guardian sequence, three forms and the real sea`,async({browser})=>{
 test.setTimeout(540000);const context=await browser.newContext({viewport,deviceScaleFactor:dpr,reducedMotion:'reduce'}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');const departure=chapterSevenDeparture();if(device==='desktop')departure.activeParty=['orrin','petra','kit'];await importSave(page,departure);
  await page.getByRole('button',{name:'Begin Chapter Seven',exact:true}).click();await at(page,'hollowsill');expect((await inspect(page)).state.activeParty).toEqual(departure.activeParty);await capture(page,`seven-crossing-${device}`);
  await approach(page,'sill-cross');await at(page,'takenwater');await capture(page,`seven-taken-water-${device}`);
  await fight(page,'water-hounds','Clear the platform');await win(page);await fight(page,'water-collector','Break the first collector');await capture(page,`seven-collector-${device}`);await win(page);
  await approach(page,'water-field');await at(page,'firstfield');await capture(page,`seven-first-harvest-${device}`);await fight(page,'field-furnace','Stop the harvest keeper');await win(page);
  await approach(page,'field-reflector');await dialogue(page);expect((await inspect(page)).state.inventory.bag['morning-reflector']).toBe(1);
  await approach(page,'field-ward');await at(page,'quietward');await capture(page,`seven-hospice-${device}`);await fight(page,'ward-engine-seven','Stop the original ward engine');await win(page);
  await approach(page,'ward-seasons');await at(page,'seasonstreet');await capture(page,`seven-seasons-${device}`);await fight(page,'season-patrol','Clear the courier stair');await win(page);await fight(page,'season-dragon','Break the last return');await capture(page,`seven-dragon-${device}`);await win(page);
  await approach(page,'season-refuge');await at(page,'lastrefuge');await capture(page,`seven-refuge-${device}`);await approach(page,'refuge-seven-rest');await page.getByRole('button',{name:'Rest · restore everyone’s HP and focus',exact:true}).click();
  await page.getByRole('button',{name:'Equipment',exact:true}).click();await page.getByRole('group',{name:'Character',exact:true}).getByRole('button',{name:'Nell',exact:true}).click();await page.locator('.ci-items').getByRole('button',{name:/^Morning-glass reflector/}).click();await page.getByRole('button',{name:'Equip on Nell',exact:true}).click();await page.getByRole('button',{name:'Close',exact:true}).click();
  await approach(page,'refuge-preparations');await page.getByRole('button',{name:'Climb to the Benefactor',exact:true}).click();await at(page,'sunthrone');
  for(const [label,name]of [['Face the Benefactor','body'],['Face the hollow sun','sun'],['Break the exposed heart','heart']]){await fight(page,'throne-fight',label);await capture(page,`seven-benefactor-${name}-${device}`);await win(page);}
  await at(page,'homecoming');await capture(page,`seven-homecoming-${device}`);await approach(page,'home-train');await at(page,'seaholiday');expect((await inspect(page)).state.flags.realSeaSeen).toBe(true);await capture(page,`seven-real-sea-${device}`);
  await approach(page,'sea-ending');await expect(page.getByRole('heading',{name:'Borrowed Tomorrow · complete',exact:true})).toBeVisible();const end=(await inspect(page)).state;expect(end.flags.chapterSevenComplete).toBe(true);expect(end.boundary).toBeNull();expect(end.activeParty).toEqual(departure.activeParty);expect(end.flags.nellLost).toBeUndefined();
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect(page.getByRole('heading',{name:'Borrowed Tomorrow · complete',exact:true})).toBeVisible({timeout:30000});expect((await inspect(page)).state.inventory).toEqual(end.inventory);await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await context.close();}
});
for(const [form,label]of [[0,'Campaign · the Benefactor'],[1,'Campaign · hollow sun'],[2,'Campaign · exposed heart']]as const)test(`final form ${form+1} preview has live motion, normal attacks and reduced-motion support`,async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/?dev=boss');await page.getByRole('button',{name:label,exact:true}).click();await expect.poll(async()=>(await inspect(page)).mode).toBe('battle');
 const b=(await inspect(page)).battle!;expect(b.benefactor?.form).toBe(form);await page.mouse.move(0,0);await capture(page,`seven-preview-${form}`);
 await expect.poll(async()=>(await inspect(page)).actors.find(a=>a.hero==='benefactor')?.motion).toBe('breathe');
 await page.emulateMedia({reducedMotion:'reduce'});await expect.poll(async()=>(await inspect(page)).actors.find(a=>a.hero==='benefactor')?.motion).toBe('idle');
 await page.getByRole('button',{name:'Win battle',exact:true}).click();await page.getByRole('button',{name:'Back to workshop',exact:true}).click();expect(errors).toEqual([]);
});
for(const [id,flag]of [['benefactor-body','benefactorBodyWon'],['benefactor-sun','benefactorSunWon'],['benefactor-heart','benefactorHeartWon']]as const)test(`@journey ${id} falls to ordinary campaign movement and attacks`,async({page})=>{
 test.setTimeout(420000);const s=chapterSevenRefugeStart();s.flags.lastRefugeSeen=true;s.flags.benefactorSeen=true;s.location=arrival('sunthrone','start');
 if(id!=='benefactor-body')for(const f of ['benefactorBodyConfronted','benefactorBodyWon','hollowSunSeen'])s.flags[f]=true;
 if(id==='benefactor-heart')for(const f of ['benefactorSunConfronted','benefactorSunWon','fragmentReturned'])s.flags[f]=true;
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await importSave(page,s);await fight(page,'throne-fight',id==='benefactor-body'?'Face the Benefactor':id==='benefactor-sun'?'Face the hollow sun':'Break the exposed heart');await battle(page,`seven-played-${id}`);await drain(page);expect((await inspect(page)).state.flags[flag]).toBe(true);
});
test('a missing domain scene preserves the capital departure and retries cleanly',async({page})=>{
 const s=chapterSevenDeparture();await page.goto('/');await importSave(page,s);await page.route('**/art/vector/chapter-seven/takenwater-back.svg',r=>r.abort());await page.getByRole('button',{name:'Begin Chapter Seven',exact:true}).click();await expect(page.getByRole('status')).toContainText('checkpoint is intact');expect((await inspect(page)).state.chapter).toBe('chapter-six');expect((await inspect(page)).state.inventory).toEqual(s.inventory);
 await page.unroute('**/art/vector/chapter-seven/takenwater-back.svg');await page.getByRole('button',{name:'Begin Chapter Seven',exact:true}).click();await at(page,'hollowsill');expect((await inspect(page)).state.chapter).toBe('chapter-seven');
});
