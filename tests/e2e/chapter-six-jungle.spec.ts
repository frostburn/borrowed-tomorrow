import { test,expect,type Page } from '@playwright/test';
import { chapterSixJungleStart,chapterSixRecoveredStart } from '../../src/dev/canonical-saves';
import { desertCheckpoint } from '../support/desert';
import { jungleCheckpoint } from '../support/jungle';
import { arrival } from '../../src/content/maps';
import { inspect,capture,dialogue,battle } from './controls';
import { approach,importSave } from './navigation';
async function skip(page:Page){
 for(let i=0;i<8;i++){if(!(await inspect(page)).cinematic)return;await page.getByRole('button',{name:'Skip scene',exact:true}).click();}
 throw new Error('Scene chain did not end');
}
async function win(page:Page){
 await page.getByRole('button',{name:'Win battle',exact:true}).click();await page.getByRole('button',{name:'Continue the journey',exact:true}).click();await skip(page);
}
for(const [device,viewport,dpr]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const)test(`Iria ${device}: launch, hunters, interrupted treatment and permanent recovery ${device==='phone'?'after':'before'} Namar`,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:dpr,reducedMotion:'reduce'}),page=await context.newPage(),errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 try{
  await page.goto('/');
  if(device==='desktop')await page.getByRole('button',{name:'Begin Iria (canonical)',exact:true}).click();
  else{const s=desertCheckpoint('desertReported');s.location=arrival('riverhaven','start');await importSave(page,s);}
  await expect.poll(async()=>(await inspect(page)).cinematic,{timeout:20000}).toBe('six-river-arrival');await capture(page,`iria-arrival-${device}`);await dialogue(page);
  const initial=(await inspect(page)).state;expect(initial.flags.desertSealBroken).toBe(device==='phone'?true:undefined);
  await approach(page,'river-canopy');await skip(page);await capture(page,`iria-canopy-${device}`);
  await approach(page,'river-patrol');await page.getByRole('button',{name:'Clear the lower crossing',exact:true}).click();await win(page);
  await approach(page,'river-chain');await expect.poll(async()=>(await inspect(page)).cinematic,{timeout:20000}).toBe('six-river-chain');await capture(page,`iria-chain-${device}`);await dialogue(page);
  await approach(page,'canopy-rainhouse');await skip(page);await capture(page,`iria-rainhouse-${device}`);
  await approach(page,'rainhouse-rest');await page.getByRole('button',{name:'Rest · restore everyone’s HP and focus',exact:true}).click();expect((await inspect(page)).state.party[0].hp).toBe(1);
  await approach(page,'rainhouse-guard');await page.getByRole('button',{name:'Clear the treatment terrace',exact:true}).click();await capture(page,`iria-hunters-${device}`);await win(page);
  await approach(page,'river-treatment');await page.getByRole('button',{name:'Bring Nell and begin the treatment',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic,{timeout:20000}).toBe('six-river-treatment');await capture(page,`iria-treatment-${device}`);
  const before=(await inspect(page)).state;expect(before.flags.nellRecovered).toBeUndefined();
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).mode,{timeout:20000}).toBe('world');expect((await inspect(page)).state.flags.nellRecovered).toBeUndefined();
  await approach(page,'river-treatment');await page.getByRole('button',{name:'Bring Nell and begin the treatment',exact:true}).click();await dialogue(page);
  const cured=(await inspect(page)).state;expect(cured.flags.nellRecovered).toBe(true);expect(cured.flags.riverRestSeen).toBe(true);expect(cured.xp).toBe(before.xp+120);expect(cured.party[0].hp).toBeGreaterThan(1);expect(cured.activeParty).toEqual(initial.activeParty);expect(cured.inventory.characters).toEqual(initial.inventory.characters);
  expect(cured.inventory.bag['riverglass-reflector']).toBe(1);await capture(page,`iria-recovered-${device}`);
  await approach(page,'rainhouse-tavi');await skip(page);await approach(page,'river-ship');await skip(page);
  const end=(await inspect(page)).state;expect(end.flags.riverReported).toBe(true);expect(end.flags.desertSealBroken).toBe(initial.flags.desertSealBroken);expect(end.flags.desertReported).toBe(initial.flags.desertReported);expect(end.boundary).toBeNull();
  expect((await inspect(page)).actors.some(a=>a.texture==='nell-ill')).toBe(false);expect((await inspect(page)).people.some(a=>a.texture==='nell-ill')).toBe(false);await capture(page,`iria-mooring-${device}`);
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).mode,{timeout:20000}).toBe('world');expect((await inspect(page)).state.flags.nellRecovered).toBe(true);expect((await inspect(page)).state.inventory).toEqual(end.inventory);expect(errors).toEqual([]);
 }finally{await context.close();}
});
test('Namar with recovered Nell stages her in the court, serpent and public break and returns her to the flight chart',async({page})=>{
 await page.goto('/');await importSave(page,chapterSixRecoveredStart());await approach(page,'six-chart');await page.getByRole('button',{name:'Namar · the western pact seal',exact:true}).click();await dialogue(page);
 await approach(page,'namar-palace');await approach(page,'palace-audience');await expect.poll(async()=>(await inspect(page)).cinematic,{timeout:20000}).toBe('six-court');expect((await inspect(page)).actors.some(a=>a.hero==='nell'&&a.texture!=='nell-ill')).toBe(true);await capture(page,'iria-cured-court');await skip(page);
 await approach(page,'palace-route');await page.getByRole('button',{name:'Break the gallery cordon · dry floor',exact:true}).click();await win(page);await approach(page,'palace-roofs');await skip(page);await approach(page,'roof-guard');await page.getByRole('button',{name:'Clear the upper terrace',exact:true}).click();await win(page);
 await approach(page,'roof-observatory');await expect.poll(async()=>(await inspect(page)).cinematic,{timeout:20000}).toBe('six-serpent');expect((await inspect(page)).actors.some(a=>a.hero==='nell')).toBe(true);await capture(page,'iria-cured-serpent-scene');await skip(page);
 await approach(page,'sun-serpent');await page.locator('.dialogue-actions button').first().click();await page.getByRole('button',{name:'Face the sun serpent',exact:true}).click();await win(page);await approach(page,'desert-release');await skip(page);await approach(page,'namar-ship');await skip(page);
 const s=(await inspect(page)).state;expect(s.flags.desertReported).toBe(true);expect(s.flags.nellRecovered).toBe(true);expect(s.activeParty).toEqual(['nell','kit','celia']);expect((await inspect(page)).actors.some(a=>a.texture==='nell-ill')).toBe(false);await capture(page,'iria-cured-desert-return');
});
test('the jungle climax can be won through ordinary movement and attacks with the existing companions',async({page})=>{
 await page.goto('/');await importSave(page,jungleCheckpoint('rainhouseSeen'));await approach(page,'rainhouse-guard');await page.getByRole('button',{name:'Clear the treatment terrace',exact:true}).click();await battle(page,'iria-played-hunters');expect((await inspect(page)).state.flags.rainhouseWon).toBe(true);expect((await inspect(page)).state.flags.nellRecovered).toBeUndefined();
});
test('missing jungle scenery leaves the preceding title/checkpoint intact and the same canonical arrival loads on retry',async({page})=>{
 await page.goto('/');await page.route('**/art/vector/chapter-six/rainhouse-back.svg',r=>r.abort());await page.getByRole('button',{name:'Begin Iria (canonical)',exact:true}).click();await expect(page.getByRole('status')).toContainText('checkpoint is intact');expect((await inspect(page)).state.chapter).toBe('chapter-one');
 await page.unroute('**/art/vector/chapter-six/rainhouse-back.svg');await page.getByRole('button',{name:'Begin Iria (canonical)',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic,{timeout:20000}).toBe('six-river-arrival');expect((await inspect(page)).state.inventory).toEqual(chapterSixJungleStart().inventory);
});
test('river launch and treatment effects run on scene time, honor reduced motion and clean up on skip',async({browser})=>{
 for(const reduced of [false,true]){
  const context=await browser.newContext({reducedMotion:reduced?'reduce':'no-preference'}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  const frame=()=>page.evaluate(()=>{const c=document.querySelector<HTMLCanvasElement>('.pixel-output')!,d=c.getContext('2d')!.getImageData(0,0,c.width,c.height).data;let hash=2166136261;for(let i=0;i<d.length;i+=4)hash=Math.imul(hash^d[i],16777619);return hash>>>0;});
  try{
   const s=jungleCheckpoint('riverPatrolWon');s.location=arrival('canopy','chain');await page.goto('/');await importSave(page,s);await approach(page,'river-chain');await page.mouse.move(0,0);await page.waitForTimeout(80);const early=await frame();await page.waitForTimeout(400);expect((await frame())===early).toBe(reduced);await skip(page);expect((await inspect(page)).state.flags.riverChainOpen).toBe(true);
   await importSave(page,jungleCheckpoint('rainhouseWon'));await approach(page,'river-treatment');await page.getByRole('button',{name:'Bring Nell and begin the treatment',exact:true}).click();
   for(let i=0;i<12&&!(await page.locator('.dialogue p').textContent())?.includes('split collar');i++)await page.locator('.dialogue-actions button').first().click();
   await expect(page.locator('.dialogue p')).toContainText('split collar');await page.mouse.move(0,0);await page.waitForTimeout(80);const pulse=await frame();await page.waitForTimeout(350);expect((await frame())===pulse).toBe(reduced);await capture(page,`iria-basin-${reduced?'reduced':'moving'}`);await skip(page);expect((await inspect(page)).state.flags.nellRecovered).toBe(true);expect(errors).toEqual([]);
  }finally{await context.close();}
 }
});
