import { test,expect,type Page } from '@playwright/test';
import { chapterSixStart } from '../../src/dev/canonical-saves';
import { SIXTH_CHAPTER } from '../../src/rules/state';
import { arrival } from '../../src/content/maps';
import { inspect,capture,dialogue,battle } from './controls';
import { approach,importSave } from './navigation';
import { desertCheckpoint } from '../support/desert';
async function skip(page:Page){
 for(let i=0;i<8;i++){
  if(!(await inspect(page)).cinematic)return;
  await page.getByRole('button',{name:'Skip scene',exact:true}).click();
 }
 throw new Error('Scene chain did not end');
}
async function win(page:Page,finishScenes=true){
 await page.getByRole('button',{name:'Win battle',exact:true}).click();await page.getByRole('button',{name:'Continue the journey',exact:true}).click();if(finishScenes)await skip(page);
}
for(const [device,viewport,dpr]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const){
 test(`Namar ${device}: sealed capital, palace escape, serpent, public seal and saved return`,async({browser})=>{
  const context=await browser.newContext({viewport,deviceScaleFactor:dpr,reducedMotion:'reduce'}),page=await context.newPage(),errors:string[]=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  try{
   await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');await page.getByRole('button',{name:'Begin Chapter Six (canonical)',exact:true}).click();
   await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-sealed');expect((await inspect(page)).state.flags.capitalSealed).toBeUndefined();await capture(page,`six-mooring-${device}`);
   // Interrupted opening returns to its preceding checkpoint, then Skip commits it.
   await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-sealed');
   if(device==='desktop')await dialogue(page);else await skip(page);
   const initial=(await inspect(page)).state;expect(initial.flags.sixRoutesKnown).toBe(true);expect(initial.flags.jungleLeadKnown).toBe(true);expect(initial.party[0].hp).toBe(1);
   await approach(page,'six-chart');await expect(page.getByRole('button',{name:'Skeld · the northern pact seal',exact:true})).toBeEnabled();await page.getByRole('button',{name:'Namar · the western pact seal',exact:true}).click();await skip(page);await capture(page,`six-namar-${device}`);
   await approach(page,'namar-post');await dialogue(page);await approach(page,'namar-palace');await approach(page,'palace-audience');await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-court');await capture(page,`six-court-${device}`);await skip(page);
   await approach(page,'palace-route');await page.getByRole('button',{name:device==='desktop'?'Break the gallery cordon · dry floor':'Take the service channel · shallow water',exact:true}).click();await win(page);expect((await inspect(page)).state.flags.palaceEscaped).toBe(true);
   await approach(page,'palace-roofs');await skip(page);await capture(page,`six-roofs-${device}`);await approach(page,'roof-guard');await page.getByRole('button',{name:'Clear the upper terrace',exact:true}).click();await win(page);
   await approach(page,'roof-chest');await dialogue(page);await approach(page,'roof-rest');await page.getByRole('button',{name:'Rest · restore everyone’s HP and focus',exact:true}).click();expect((await inspect(page)).state.party[0].hp).toBe(1);
   await approach(page,'roof-observatory');await skip(page);await approach(page,'sun-serpent');await page.locator('.dialogue-actions button').first().click();await page.getByRole('button',{name:'Face the sun serpent',exact:true}).click();await capture(page,`six-serpent-${device}`);
   const boss=(await inspect(page)).battle!;expect(boss.units.filter(u=>u.side==='party').map(u=>u.id)).toEqual(initial.activeParty);expect(boss.units.find(u=>u.id==='sun-serpent')!.footprint).toHaveLength(3);await win(page,false);
   await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-release');await skip(page);
   await expect.poll(async()=>(await inspect(page)).state.flags.desertSealBroken).toBe(true);await capture(page,`six-western-seal-${device}`);
   await approach(page,'namar-ship');await skip(page);const end=(await inspect(page)).state;expect(end.flags.desertReported).toBe(true);expect(end.boundary).toBeNull();expect(end.chapter).toBe('chapter-six');expect(end.party[0]).toMatchObject({id:'nell',hp:1,focus:0});expect(end.activeParty).toEqual(initial.activeParty);expect(end.inventory.bag['solar-guard']).toBe(1);expect(end.inventory.bag['sunstone-focus']).toBe(1);expect(end.inventory.characters).toEqual(initial.inventory.characters);
   await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).state.flags.desertReported).toBe(true);expect((await inspect(page)).state.inventory).toEqual(end.inventory);await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);await capture(page,`six-return-${device}`);
  }finally{await context.close();}
 });
}
test('missing serpent art preserves the Chapter Five departure, then loads the same Chapter Six entry on retry',async({page})=>{
 const s=chapterSixStart();s.chapter='chapter-five';s.boundary=SIXTH_CHAPTER;s.location=arrival('airship','start');await page.goto('/');await importSave(page,s);
 await page.route('**/art/vector/chapter-six/serpent-head.svg',r=>r.abort());await page.getByRole('button',{name:'Skip cinematic',exact:true}).click();await expect(page.getByRole('button',{name:'Retry crossing',exact:true})).toBeEnabled();expect((await inspect(page)).state).toMatchObject({chapter:'chapter-five',boundary:SIXTH_CHAPTER,inventory:s.inventory});
 await page.unroute('**/art/vector/chapter-six/serpent-head.svg');await page.getByRole('button',{name:'Retry crossing',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-sealed');expect((await inspect(page)).state.activeParty).toEqual(s.activeParty);
});
test('sun serpent workshop uses the real fight and passive time, settles under reduced motion and restarts cleanly',async({page})=>{
 await page.goto('/?dev=boss&boss=serpent');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop');await page.getByRole('button',{name:'Start Chapter Six preset',exact:true}).click();await expect.poll(async()=>(await inspect(page)).battle?.encounter).toBe('dev-sun-serpent');
 await page.mouse.move(0,0);const texture=async()=>(await inspect(page)).actors.find(a=>a.hero==='sun-serpent')?.texture;
 const frames=new Set<string|undefined>();for(let i=0;i<8;i++){frames.add(await texture());await page.waitForTimeout(450);}expect(frames.size).toBeGreaterThan(1);await capture(page,'six-serpent-preview');
 await page.emulateMedia({reducedMotion:'reduce'});await expect.poll(texture).toBe('serpent-head');const rested=await texture();await page.waitForTimeout(150);expect(await texture()).toBe(rested);
 await page.getByRole('button',{name:'Restart battle',exact:true}).click();expect((await inspect(page)).battle?.round).toBe(1);await battle(page,undefined,true);await expect(page.getByRole('heading',{name:'The sun serpent',exact:true})).toBeVisible();
});
test('pact effects animate on passive time, settle under reduced motion and clean up when skipped',async({browser})=>{
 for(const reduced of [false,true]){
  const context=await browser.newContext({viewport:{width:1280,height:800},reducedMotion:reduced?'reduce':'no-preference'}),page=await context.newPage(),errors:string[]=[];
  page.on('pageerror',e=>errors.push(e.message));
  const frame=()=>page.evaluate(()=>{const c=document.querySelector<HTMLCanvasElement>('.pixel-output')!,data=c.getContext('2d')!.getImageData(0,0,c.width,c.height).data;let hash=2166136261;for(let i=0;i<data.length;i+=4)hash=Math.imul(hash^data[i],16777619);return hash>>>0;});
  try{
   await page.goto('/');await importSave(page,chapterSixStart());await page.locator('.dialogue-actions button').first().click();await page.locator('.dialogue-actions button').first().click();await expect(page.locator('.dialogue p')).toContainText('A pale wall descends');await page.mouse.move(0,0);
   await page.waitForTimeout(100);const early=await frame();await page.waitForTimeout(450);expect((await frame())===early).toBe(reduced);await capture(page,`six-barrier-${reduced?'reduced':'moving'}`);expect((await inspect(page)).state.flags.capitalSealed).toBeUndefined();await skip(page);expect((await inspect(page)).state.flags.capitalSealed).toBe(true);
   await importSave(page,desertCheckpoint('desertReleaseReady'));await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-public');
   for(let i=0;i<10&&!(await page.locator('.dialogue p').textContent())?.includes('Samira lays the band');i++)await page.locator('.dialogue-actions button').first().click();
   await expect(page.locator('.dialogue p')).toContainText('Samira lays the band');await page.mouse.move(0,0);await page.waitForTimeout(100);const ring=await frame();await page.waitForTimeout(350);expect((await frame())===ring).toBe(reduced);await capture(page,`six-band-${reduced?'reduced':'moving'}`);await skip(page);expect((await inspect(page)).state.flags.desertSealBroken).toBe(true);expect(errors).toEqual([]);
  }finally{await context.close();}
 }
});
