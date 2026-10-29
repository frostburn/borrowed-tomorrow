import { test,expect,type Page } from '@playwright/test';
import { chapterSixCapitalStart,chapterSixFinaleStart } from '../../src/dev/canonical-saves';
import { inspect,capture,dialogue,battle } from './controls';
import { approach,importSave } from './navigation';
import { arrival } from '../../src/content/maps';
async function drain(page:Page){for(let i=0;i<16;i++){await expect.poll(async()=>(await inspect(page)).busy,{timeout:30000}).toBe(false);if(!(await inspect(page)).cinematic)return;await page.getByRole('button',{name:'Skip scene',exact:true}).click();}throw new Error('Capital scene chain did not finish');}
async function win(page:Page){await page.getByRole('button',{name:'Win battle',exact:true}).click();await page.getByRole('button',{name:'Continue the journey',exact:true}).click();await drain(page);}
async function waitMap(page:Page,map:string){await expect.poll(async()=>(await inspect(page)).state.location.map,{timeout:30000}).toBe(map);await drain(page);}
async function nellEquipment(page:Page,lost:boolean){
 await page.getByRole('button',{name:'Equipment',exact:true}).click();const inventory=page.getByRole('dialog',{name:'Character inventory'});
 await inventory.getByRole('group',{name:'Character',exact:true}).getByRole('button',{name:'Nell',exact:true}).click();
 await expect(inventory.getByText(lost?'Deceased':'Too ill to fight · resting aboard',{exact:true})).toBeVisible();
 await expect(inventory).not.toContainText(lost?'resting aboard':'Deceased');await expect(inventory.getByRole('button',{name:'Set active',exact:true})).toBeDisabled();
 if(lost){await expect(inventory).toContainText('HP 0 /');await capture(page,'capital-nell-deceased-equipment');}await page.getByRole('button',{name:'Close',exact:true}).click();
}
for(const [device,viewport,dpr,recovered]of [['desktop',{width:1280,height:800},1,true],['phone',{width:390,height:844},1.25,false]]as const)test(`@journey capital ${device}: ${recovered?'recovered Nell reaches the hopeful departure':'uncured Nell becomes the Lightbearer and the return checkpoint works'}`,async({browser})=>{
 test.setTimeout(420000);const context=await browser.newContext({viewport,deviceScaleFactor:dpr,reducedMotion:'reduce'}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 try{
  const initial=chapterSixCapitalStart(recovered);if(recovered)initial.activeParty=['kit','orrin','petra'];await page.goto('/');await importSave(page,initial);await drain(page);await capture(page,`capital-quay-${device}`);
  await approach(page,'capital-inner');await waitMap(page,'stillcity');await capture(page,`capital-street-${device}`);
  await approach(page,'city-procession');await page.getByRole('button',{name:'Clear the procession machines',exact:true}).click();await win(page);
  await drain(page);expect((await inspect(page)).state.flags.capitalStreetFreed).toBe(true);
  await approach(page,'city-palace');await waitMap(page,'lastpalace');await capture(page,`capital-palace-${device}`);
  await approach(page,'palace-command');await drain(page);await page.getByRole('button',{name:'Break the palace cordon',exact:true}).click();await win(page);
  await approach(page,'palace-locker');await dialogue(page);expect((await inspect(page)).state.inventory.bag['palace-focus']).toBe(1);
  await approach(page,'palace-preparations');await drain(page);
  if(recovered){
   await waitMap(page,'lastmorning');expect((await inspect(page)).actors.map(a=>a.hero)).toEqual(['nell']);expect((await inspect(page)).state.activeParty).toEqual(initial.activeParty);await capture(page,'capital-morning-desktop');
   await approach(page,'morning-ansel');await dialogue(page);await approach(page,'morning-leave');await expect.poll(async()=>(await inspect(page)).state.location.map).toBe('lastshore');await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-memory-sea');await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await capture(page,'capital-memory-coast');await drain(page);await waitMap(page,'lastpalace');expect((await inspect(page)).state.flags.capitalMorningLeft).toBe(true);await approach(page,'palace-preparations');await drain(page);
  }else{await expect(page.getByRole('button',{name:'Return to Iria · seek treatment for Nell',exact:true})).toBeVisible();await capture(page,'capital-ill-warning-phone');}
  await page.getByRole('button',{name:recovered?'Climb the crown stair':'Proceed with Nell still bound',exact:true}).click();await waitMap(page,'crown');
  expect((await inspect(page)).state.flags.capitalRiskAccepted).toBe(!recovered);await approach(page,'capital-emperor');await page.getByRole('button',{name:'Face the Emperor',exact:true}).click();await expect.poll(async()=>(await inspect(page)).mode).toBe('battle');await capture(page,`capital-emperor-${device}`);await win(page);
  if(recovered){
   await waitMap(page,'capitalquay');expect((await inspect(page)).state.flags.capitalLandingSeen).toBe(true);await capture(page,'capital-landed-desktop');await approach(page,'capital-departure');await page.getByRole('button',{name:'Prepare the final crossing',exact:true}).click();await expect(page.getByRole('heading',{name:'Chapter Six complete',exact:true})).toBeVisible();expect((await inspect(page)).state.boundary).toBe('chapter-seven:hollow-sun');expect((await inspect(page)).state.flags.lightbearerSeen).toBeUndefined();
   await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect(page.getByRole('heading',{name:'Chapter Six complete',exact:true})).toBeVisible({timeout:30000});
  }else{
   const after=(await inspect(page)).state;expect(after.flags.lightbearerSeen).toBe(true);expect(after.flags.capitalAudienceSeen).toBeUndefined();await capture(page,'capital-lightbearer-rise-phone');
   await approach(page,'crown-rest');await page.getByRole('button',{name:'Rest · restore everyone’s HP and focus',exact:true}).click();expect((await inspect(page)).state.flags.nellRecovered).toBeUndefined();
   await approach(page,'capital-lightbearer');await page.getByRole('button',{name:'Face the Lightbearer',exact:true}).click();await expect.poll(async()=>(await inspect(page)).mode).toBe('battle');await capture(page,'capital-lightbearer-phone');await win(page);await waitMap(page,'laststation');expect((await inspect(page)).actors.some(a=>a.hero==='kit')).toBe(false);expect((await inspect(page)).state.activeParty).toEqual(initial.activeParty);await capture(page,'capital-empty-seat-phone');
   await nellEquipment(page,true);await approach(page,'last-tomas');await dialogue(page);await approach(page,'last-kit');await dialogue(page);await approach(page,'last-ending');await expect(page.locator('#canvas')).toHaveAttribute('data-ending-kind','bad');await page.getByRole('button',{name:'Skip cinematic',exact:true}).click();await expect(page.getByRole('heading',{name:'An unfinished tomorrow',exact:true})).toBeVisible();const end=(await inspect(page)).state;expect(end.flags.nellLost).toBe(true);expect(end.flags.chapterSixComplete).toBeUndefined();expect(end.boundary).toBeNull();
   await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect(page.getByRole('heading',{name:'An unfinished tomorrow',exact:true})).toBeVisible({timeout:30000});await page.getByRole('button',{name:'Return before the final assault',exact:true}).click();await waitMap(page,'lastpalace');const returned=(await inspect(page)).state;expect(returned.flags.nellLost).toBeUndefined();expect(returned.flags.capitalAssaultCommitted).toBeUndefined();expect(returned.flags.capitalHallOpened).toBe(true);expect(returned.inventory.characters).toEqual(initial.inventory.characters);expect(returned.activeParty).toEqual(initial.activeParty);
   await nellEquipment(page,false);
  }
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await context.close();}
});
for(const boss of ['emperor','lightbearer']as const)test(`capital ${boss} preview shares real rules and a parked cursor still shows visible passive motion`,async({page})=>{
 await page.goto(`/?dev=boss&boss=${boss}`);await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop',{timeout:30000});await page.getByRole('button',{name:'Start Chapter Six preset',exact:true}).click();await expect.poll(async()=>(await inspect(page)).mode).toBe('battle');await capture(page,`capital-${boss}-preview`);await page.mouse.move(1,1);
 const hash=()=>page.evaluate(()=>{
  const output=document.querySelector<HTMLCanvasElement>('.pixel-output')!,source=document.querySelector('.pixel-source')!.getBoundingClientRect(),world=document.querySelector('.world-input')!.getBoundingClientRect(),info=window.borrowedTomorrowPixels.inspect(),view=window.borrowedTomorrow.inspect().view;
  const x=Math.round(info.physicalLeft+(Math.round((world.left-source.left)/info.cssScale)+365-view.scrollX)*info.physicalScale),y=Math.round(info.physicalTop+(Math.round((world.top-source.top)/info.cssScale)+75-view.scrollY)*info.physicalScale);
  const pixels=output.getContext('2d')!.getImageData(x,y,210*info.physicalScale,125*info.physicalScale).data;let h=2166136261;for(let i=0;i<pixels.length;i+=4)for(let c=0;c<3;c++)h=Math.imul(h^pixels[i+c],16777619);return h>>>0;
 });
 const seen=new Set<number>();for(let i=0;i<18;i++){seen.add(await hash());await page.waitForTimeout(250);}expect(seen.size).toBeGreaterThan(1);
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(500);const still=await hash();await page.waitForTimeout(1300);expect(await hash()).toBe(still);
 await page.getByRole('button',{name:'Restart battle',exact:true}).click();expect((await inspect(page)).battle!.round).toBe(1);await page.keyboard.press('Escape');await expect(page.getByRole('region',{name:'Boss battle preview',exact:true})).toBeVisible();
});
for(const recovered of [false,true])test(`capital canonical title entry with Nell ${recovered?'recovered':'ill'} loads the actual allied landing`,async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Begin capital (canonical)',exact:true}).click();await page.getByRole('button',{name:recovered?'Nell recovered · Nell, Kit and Celia':'Nell ill · Kit, Orrin and Petra',exact:true}).click();await waitMap(page,'capitalquay');expect((await inspect(page)).state.flags.desertSealBroken).toBe(true);expect((await inspect(page)).state.flags.northSealBroken).toBe(true);expect((await inspect(page)).state.flags.nellRecovered??false).toBe(recovered);
});
for(const boss of ['emperor','lightbearer']as const)test(`@journey ${boss} can be defeated through ordinary campaign movement and attacks`,async({page})=>{
 test.setTimeout(420000);const s=chapterSixFinaleStart(boss==='emperor');await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await importSave(page,s);await approach(page,'palace-preparations');await drain(page);await page.getByRole('button',{name:boss==='emperor'?'Climb the crown stair':'Proceed with Nell still bound',exact:true}).click();await waitMap(page,'crown');await approach(page,'capital-emperor');await page.getByRole('button',{name:'Face the Emperor',exact:true}).click();
 if(boss==='emperor')await battle(page,'capital-played-emperor');else{await win(page);await approach(page,'crown-rest');await page.getByRole('button',{name:'Rest · restore everyone’s HP and focus',exact:true}).click();await approach(page,'capital-lightbearer');await page.getByRole('button',{name:'Face the Lightbearer',exact:true}).click();await battle(page,'capital-played-lightbearer');}
 await drain(page);expect((await inspect(page)).state.flags[boss==='emperor'?'emperorWon':'lightbearerWon']).toBe(true);
});

// A restore may catch the checkpoint between the loss scene and its map transition.
test('a restored Nell-loss checkpoint reaches Larkspur instead of stranding the party on the crown',async({page})=>{
 const s=chapterSixFinaleStart(false);for(const f of ['capitalWarningSeen','capitalAssaultCommitted','capitalRiskAccepted','emperorSeen','emperorConfronted','emperorWon','emperorFallen','lightbearerSeen','lightbearerConfronted','lightbearerWon','nellLost'])s.flags[f]=true;s.party.find(h=>h.id==='nell')!.hp=0;s.location=arrival('crown','start');
 await page.goto('/');await importSave(page,s);await waitMap(page,'laststation');expect((await inspect(page)).state.flags.emptySeatSeen).toBe(true);await nellEquipment(page,true);
});

// Start at an authored valid loss checkpoint, then use the real final interaction.
test('bad-ending completion saves before playback, skips, replays and reloads at its panel',async({page})=>{
 const s=chapterSixFinaleStart(false);for(const f of ['capitalWarningSeen','capitalAssaultCommitted','capitalRiskAccepted','emperorSeen','emperorConfronted','emperorWon','emperorFallen','lightbearerSeen','lightbearerConfronted','lightbearerWon','nellLost','emptySeatSeen'])s.flags[f]=true;
 s.party.find(h=>h.id==='nell')!.hp=0;s.location=arrival('laststation','start');
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await importSave(page,s);
 await approach(page,'last-ending');
 await expect(page.locator('#canvas')).toHaveAttribute('data-ending-kind','bad');
 const completed=(await inspect(page)).state;expect(completed.flags.lightbearerEnding).toBe(true);expect(completed.flags.nellLost).toBe(true);expect(completed.flags.chapterSevenComplete).toBeUndefined();expect(completed.boundary).toBeNull();
 await capture(page,'bad-ending-campaign');
 await page.getByRole('button',{name:'Skip cinematic',exact:true}).click();
 await expect(page.getByRole('heading',{name:'An unfinished tomorrow',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Replay ending cinematic',exact:true}).click();
 await expect(page.locator('#canvas')).toHaveAttribute('data-ending-shot','empty-seat');
 expect((await inspect(page)).state).toEqual({...completed,playSeconds:expect.any(Number)});
 // Reload during replay: completion must already be durable; no forced film.
 await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();
 await expect(page.getByRole('heading',{name:'An unfinished tomorrow',exact:true})).toBeVisible({timeout:30000});
 expect(await page.locator('#canvas').getAttribute('data-ending-kind')).toBeNull();
 await expect(page.getByRole('button',{name:'Return before the final assault',exact:true})).toBeVisible();
 await nellEquipment(page,true);
});
