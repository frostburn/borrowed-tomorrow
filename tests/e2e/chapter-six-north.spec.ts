import { test,expect,type Page } from '@playwright/test';
import { chapterSixNorthStart,chapterSixDragonStart } from '../../src/dev/canonical-saves';
import { desertCheckpoint } from '../support/desert';
import { northCheckpoint } from '../support/north';
import { arrival } from '../../src/content/maps';
import { inspect,capture,dialogue,battle } from './controls';
import { approach,importSave } from './navigation';
async function skip(page:Page){for(let i=0;i<10;i++){if(!(await inspect(page)).cinematic)return;await page.getByRole('button',{name:'Skip scene',exact:true}).click();}throw new Error('Scene chain did not end');}
async function win(page:Page){await page.getByRole('button',{name:'Win battle',exact:true}).click();await page.getByRole('button',{name:'Continue the journey',exact:true}).click();await skip(page);}
async function ready(page:Page){await expect.poll(async()=>(await inspect(page)).busy).toBe(false);}
/** Only the visible left wing: excludes UI, warning labels and party actors. */
async function dragonPixels(page:Page){return page.evaluate(()=>{
 const output=document.querySelector<HTMLCanvasElement>('.pixel-output')!,source=document.querySelector('.pixel-source')!.getBoundingClientRect(),world=document.querySelector('.world-input')!.getBoundingClientRect();
 const info=window.borrowedTomorrowPixels.inspect(),view=window.borrowedTomorrow.inspect().view;
 const x=Math.round(info.physicalLeft+(Math.round((world.left-source.left)/info.cssScale)+245-view.scrollX)*info.physicalScale);
 const y=Math.round(info.physicalTop+(Math.round((world.top-source.top)/info.cssScale)+65-view.scrollY)*info.physicalScale);
 const pixels=output.getContext('2d')!.getImageData(x,y,230*info.physicalScale,135*info.physicalScale).data;
 let hash=2166136261;for(let i=0;i<pixels.length;i+=4)for(let c=0;c<3;c++)hash=Math.imul(hash^pixels[i+c],16777619);return hash>>>0;
});}

for(const [device,viewport,dpr]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const)test(`@journey Skeld ${device}: full expedition with Nell ${device==='phone'?'well, after Namar':'ill, before Namar'}`,async({browser})=>{
 test.setTimeout(300000);const context=await browser.newContext({viewport,deviceScaleFactor:dpr,reducedMotion:'reduce'}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 try{
  await page.goto('/');
  if(device==='desktop'){
   await page.getByRole('button',{name:'Begin Skeld (canonical)',exact:true}).click();await page.getByRole('button',{name:'Nell ill · Kit, Orrin and Petra',exact:true}).click();
  }else{
   const s=chapterSixNorthStart(true);s.flags={...desertCheckpoint('desertReported').flags,...s.flags};s.location=arrival('bellharbor','start');await importSave(page,s);
  }
  await expect.poll(async()=>(await inspect(page)).cinematic,{timeout:20000}).toBe('six-north-arrival');const initial=(await inspect(page)).state;
  expect((await inspect(page)).actors.some(a=>a.hero==='nell')).toBe(device==='phone');await capture(page,`skeld-arrival-${device}`);await dialogue(page);
  await approach(page,'harbor-watch');await dialogue(page);await capture(page,`skeld-watch-${device}`);
  await approach(page,'north-watch');await page.getByRole('button',{name:'Clear the winter patrol',exact:true}).click();await win(page);
  await approach(page,'north-windlass');await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-north-gate');await capture(page,`skeld-gate-${device}`);await dialogue(page);
  await approach(page,'watch-glacier');await approach(page,'north-log');await capture(page,`skeld-wrecks-${device}`);await dialogue(page);
  await approach(page,'glacier-cache');await page.getByRole('button',{name:'Open the relief stores',exact:true}).click();await win(page);
  await approach(page,'north-hunters');await page.getByRole('button',{name:'Clear the upper ice shelf',exact:true}).click();await win(page);
  await approach(page,'glacier-shrine');await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-north-shrine');expect((await inspect(page)).actors.some(a=>a.hero==='nell')).toBe(device==='phone');await capture(page,`skeld-sanctuary-${device}`);await dialogue(page);
  await approach(page,'shrine-rest');await page.getByRole('button',{name:'Rest · restore everyone’s HP and focus',exact:true}).click();if(device==='desktop')expect((await inspect(page)).state.party[0].hp).toBe(1);
  await approach(page,'north-dragon');await page.getByRole('button',{name:'Face the winter dragon',exact:true}).click();await capture(page,`skeld-dragon-${device}`);await win(page);
  await approach(page,'north-release');await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-north-release');expect((await inspect(page)).state.flags.northSealBroken).toBeUndefined();await capture(page,`skeld-release-${device}`);
  // Interrupt the physical release, then perform the same action after reload.
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).mode,{timeout:20000}).toBe('world');expect((await inspect(page)).state.flags.northSealBroken).toBeUndefined();await approach(page,'north-release');await dialogue(page);
  await approach(page,'shrine-home');await dialogue(page);await capture(page,`skeld-records-${device}`);await approach(page,'harbor-ship');await skip(page);
  const end=(await inspect(page)).state;expect(end.flags.northSealBroken).toBe(true);expect(end.flags.northReturned).toBe(true);expect(end.flags.northReported).toBe(true);expect(end.flags.nellRecovered).toBe(initial.flags.nellRecovered);expect(end.activeParty).toEqual(initial.activeParty);expect(end.inventory.characters).toEqual(initial.inventory.characters);expect(end.boundary).toBeNull();expect(end.inventory.bag['pact-guard']).toBe(1);expect(end.inventory.bag['winter-sight']).toBe(1);await capture(page,`skeld-home-${device}`);
  if(device==='phone'){
   expect(end.flags.capitalOpened).toBe(true);await approach(page,'six-capital-open');await dialogue(page);await capture(page,'skeld-allied-quay-phone');expect((await inspect(page)).state.flags.capitalQuaySeen).toBe(true);await approach(page,'capital-return');await skip(page);
  }else expect(end.flags.capitalOpened).toBeUndefined();
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).mode,{timeout:20000}).toBe('world');expect((await inspect(page)).state.flags.northReported).toBe(true);await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await context.close();}
});
test('@journey the winter dragon can be defeated through ordinary movement and attacks at the real first-region approach',async({page})=>{
 test.setTimeout(240000);await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await importSave(page,chapterSixDragonStart());await skip(page);await approach(page,'north-dragon');await page.getByRole('button',{name:'Face the winter dragon',exact:true}).click();await battle(page,'skeld-played-dragon');const s=(await inspect(page)).state;expect(s.flags.winterDragonWon).toBe(true);expect(s.flags.northSealBroken).toBeUndefined();expect(s.flags.nellRecovered).toBeUndefined();
});
test('@journey a saved glacier expedition can visit Iria, recover Nell, and resume without repeating its progress or rewards',async({page})=>{
 test.setTimeout(240000);
 const s=northCheckpoint('northLogRead');s.location=arrival('outermooring','namar');await page.goto('/');await importSave(page,s);await approach(page,'six-chart');await page.getByRole('button',{name:'Iria · Sera’s river healers',exact:true}).click();await skip(page);
 await approach(page,'river-canopy');await skip(page);await approach(page,'river-patrol');await page.getByRole('button',{name:'Clear the lower crossing',exact:true}).click();await win(page);await approach(page,'river-chain');await skip(page);await approach(page,'canopy-rainhouse');await skip(page);await approach(page,'rainhouse-guard');await page.getByRole('button',{name:'Clear the treatment terrace',exact:true}).click();await win(page);await approach(page,'river-treatment');await page.getByRole('button',{name:'Bring Nell and begin the treatment',exact:true}).click();await skip(page);await approach(page,'rainhouse-tavi');await skip(page);await approach(page,'river-ship');await skip(page);
 await approach(page,'six-chart');await page.getByRole('button',{name:'Skeld · the northern pact seal',exact:true}).click();await approach(page,'harbor-watch');await approach(page,'watch-glacier');expect((await inspect(page)).state.flags.northLogRead).toBe(true);expect((await inspect(page)).state.inventory.bag['stormlining-coat']).toBe(1);
 await approach(page,'north-hunters');await page.getByRole('button',{name:'Clear the upper ice shelf',exact:true}).click();await win(page);await approach(page,'glacier-shrine');expect((await inspect(page)).actors.some(a=>a.hero==='nell')).toBe(true);await capture(page,'skeld-mid-route-cure');await skip(page);expect((await inspect(page)).state.activeParty).toEqual(s.activeParty);
});
for(const reduced of [false,true])test(`dragon workshop ${reduced?'reduced':'moving'}: passive time, exact areas and save isolation`,async({browser})=>{
 test.setTimeout(180000);
  const context=await browser.newContext({reducedMotion:reduced?'reduce':'no-preference'}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.goto('/');await importSave(page,chapterSixNorthStart());await skip(page);const original=(await inspect(page)).state;
   await page.goto('/?dev=boss&boss=dragon');await expect(page.getByRole('heading',{name:'The winter dragon',exact:true})).toBeVisible({timeout:20000});await page.getByRole('button',{name:'Start Chapter Six preset',exact:true}).click();await ready(page);await page.mouse.move(0,0);await page.waitForTimeout(150);
   if(reduced){const at=await dragonPixels(page);await page.waitForTimeout(1300);expect(await dragonPixels(page)).toBe(at);}
   else{const seen=new Set<number>();for(let i=0;i<18;i++){seen.add(await dragonPixels(page));await page.waitForTimeout(250);}expect(seen.size).toBeGreaterThan(1);}
   await capture(page,`skeld-preview-${reduced?'reduced':'moving'}`);
   const before=(await inspect(page)).battle!,boss=before.units.find(u=>u.id==='winter-dragon')!;
   await page.getByRole('button',{name:/^3\s+Quick shot$/}).click();
   const view=(await inspect(page)).view,box=(await page.locator('#canvas canvas').boundingBox())!;
   await page.mouse.click(box.x+(493-view.scrollX)*box.width/view.width,box.y+(185-view.scrollY)*box.height/view.height);
   await expect(page.locator('#confirmation')).toContainText('Winter dragon');await page.getByRole('button',{name:'Confirm attack',exact:true}).click();await ready(page);expect((await inspect(page)).battle!.units.find(u=>u.id==='winter-dragon')!.hp).toBeLessThan(boss.hp);
   await page.getByRole('button',{name:'Restart battle',exact:true}).click();await ready(page);
   for(let i=0;i<3;i++){await ready(page);await page.getByRole('button',{name:/^F\s+Defend$/}).click();}
   await expect.poll(async()=>(await inspect(page)).battle?.round).toBe(2);await ready(page);expect((await inspect(page)).battle!.log.some(l=>l.includes('Drawn breath'))).toBe(true);expect((await inspect(page)).battle!.units.find(u=>u.id==='winter-dragon')!.intent!.name).toContain('west');
   for(let i=0;i<3;i++){await ready(page);await page.getByRole('button',{name:/^F\s+Defend$/}).click();}
   await expect.poll(async()=>(await inspect(page)).battle?.round).toBe(3);await ready(page);expect((await inspect(page)).battle!.winterIce).toHaveLength(4);await capture(page,`skeld-broken-ice-${reduced?'reduced':'moving'}`);
   await page.getByRole('button',{name:'Restart battle',exact:true}).click();expect((await inspect(page)).battle!.winterIce).toEqual([]);await page.getByRole('button',{name:'Win battle',exact:true}).click();await page.getByRole('button',{name:'Back to workshop',exact:true}).click();await page.goto('/');await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).mode,{timeout:20000}).toBe('world');const returned=(await inspect(page)).state;expect({...returned,playSeconds:original.playSeconds}).toEqual(original);expect(errors).toEqual([]);
  }finally{await context.close();}
});
test('a failed dragon asset preserves the preceding checkpoint and the canonical expedition can retry',async({page})=>{
 await page.goto('/');await page.route('**/art/vector/chapter-six/winter-dragon.svg',r=>r.abort());await page.getByRole('button',{name:'Begin winter dragon (canonical)',exact:true}).click();await page.getByRole('button',{name:'Nell ill · Kit, Orrin and Petra',exact:true}).click();await expect(page.getByRole('status')).toContainText('checkpoint is intact');expect((await inspect(page)).state.chapter).toBe('chapter-one');
 await page.unroute('**/art/vector/chapter-six/winter-dragon.svg');await page.getByRole('button',{name:'Nell recovered · Nell, Kit and Celia',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic,{timeout:20000}).toBe('six-north-shrine');expect((await inspect(page)).state.flags.nellRecovered).toBe(true);
});
