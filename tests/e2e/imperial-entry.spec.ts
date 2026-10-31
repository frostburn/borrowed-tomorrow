import {expect,test,type Page} from '@playwright/test';
import {imperialEntryCheckpoint} from '../support/imperial-entry';
import {importSave,approach} from './navigation';
import {inspect,dialogue,capture} from './controls';

const next=(page:Page)=>page.locator('.dialogue-actions button').click();
const present=(page:Page)=>page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
async function stageHash(page:Page){return page.evaluate(()=>{
 const output=document.querySelector<HTMLCanvasElement>('.pixel-output')!,source=document.querySelector('.pixel-source')!.getBoundingClientRect(),world=document.querySelector('.world-input')!.getBoundingClientRect();
 const info=window.borrowedTomorrowPixels.inspect(),view=window.borrowedTomorrow.inspect().view;
 const x=Math.round(info.physicalLeft+(world.left-source.left)/info.cssScale*info.physicalScale),y=Math.round(info.physicalTop+((world.top-source.top)/info.cssScale+48)*info.physicalScale);
 const pixels=output.getContext('2d')!.getImageData(x,y,view.width*info.physicalScale,152*info.physicalScale).data;
 let hash=2166136261;for(let i=0;i<pixels.length;i+=4)for(let c=0;c<3;c++)hash=Math.imul(hash^pixels[i+c],16777619);return hash>>>0;
});}

for(const [device,viewport,dpr]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const)
for(const reduced of [false,true])test(`Emperor enters the crown on ${device} with ${reduced?'reduced':'normal'} motion`,async({browser})=>{
 test.setTimeout(120000);const context=await browser.newContext({viewport,deviceScaleFactor:dpr,reducedMotion:reduced?'reduce':'no-preference'}),page=await context.newPage(),errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 try{
  await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');
  await page.evaluate(async()=>{const module='/src/game/audio.ts',{Audio}=await import(/* @vite-ignore */module),set=Audio.prototype.setMode;(window as any).entryCues=[];Audio.prototype.setMode=function(mode:any){(window as any).entryCues.push(mode);return set.call(this,mode);};});
  const s=imperialEntryCheckpoint(device==='desktop');if(device==='desktop')s.activeParty=['kit','orrin','petra'];
  await importSave(page,s);await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-imperial-vessel');await page.mouse.move(0,0);
  await expect(page.locator('#scene-layer')).toHaveAttribute('data-dialogue-position','bottom');
  expect((await inspect(page)).state.location.map).toBe('crown');expect((await inspect(page)).view.zoom).toBe(1);
  expect((await inspect(page)).actors.some(a=>a.hero==='nell')).toBe(device==='desktop');
  const emperor=()=>inspect(page).then(s=>s.actors.find(a=>a.hero==='emperor'));
  expect((await emperor())?.texture).toMatch(/^emperor-left/);
  if(reduced){expect((await emperor())?.x).toBe(780);await present(page);const still=await stageHash(page);await page.waitForTimeout(450);expect(await stageHash(page)).toBe(still);}
  else{const x=(await emperor())!.x;await page.waitForTimeout(400);expect((await emperor())!.x).toBeLessThan(x);await capture(page,`emperor-walk-${device}`);await expect.poll(async()=>(await emperor())?.x).toBe(780);}
  await capture(page,`emperor-open-${device}-${reduced?'reduced':'moving'}`);expect((await inspect(page)).state.flags.emperorSeen).toBeUndefined();
  await next(page);await expect(page.locator('.dialogue p')).toHaveText('Plates close around his body.');await present(page);
  if(!reduced){const first=await stageHash(page);await page.waitForTimeout(450);expect(await stageHash(page)).not.toBe(first);await capture(page,`emperor-closing-${device}`);}
  await expect.poll(async()=>!!(await emperor())).toBe(false);
  const entranceY=(await inspect(page)).view.scrollY;
  await next(page);await expect(page.locator('.dialogue p')).toContainText('unfolds into a vast vessel');await present(page);
  if(!reduced){await page.waitForTimeout(500);const first=await stageHash(page);await capture(page,`emperor-unfolding-${device}`);await page.waitForTimeout(500);expect(await stageHash(page)).not.toBe(first);await page.waitForTimeout(1700);}
  else{const still=await stageHash(page);await page.waitForTimeout(450);expect(await stageHash(page)).toBe(still);}
  await capture(page,`emperor-awake-${device}-${reduced?'reduced':'moving'}`);
  const vesselView=(await inspect(page)).view;expect(vesselView.zoom).toBe(1);expect(vesselView.scrollY).toBeLessThan(entranceY-60);
  await next(page);await expect(page.locator('.dialogue h2')).toHaveText('The Emperor');
  await next(page);await expect(page.locator('.dialogue h2')).toHaveText('Celia');
  if(!reduced){await page.waitForTimeout(400);const midway=(await inspect(page)).view.scrollY;expect(midway).toBeGreaterThan(vesselView.scrollY);expect(midway).toBeLessThan(500);await capture(page,`emperor-party-pan-${device}`);await page.waitForTimeout(1100);}
  const partyView=(await inspect(page)).view;expect(partyView.zoom).toBe(1);expect(partyView.scrollY).toBeGreaterThan(vesselView.scrollY+250);
  const world=(await page.locator('.world-input').boundingBox())!,box=(await page.locator('.dialogue').boundingBox())!,dialogueTop=(box.y-world.y)*partyView.height/world.height;
  for(const actor of (await inspect(page)).actors){expect(actor.y-68-partyView.scrollY).toBeGreaterThan(36);expect(actor.y-40-partyView.scrollY).toBeLessThan(dialogueTop);}
  await capture(page,`emperor-party-${device}-${reduced?'reduced':'moving'}`);
  if(device==='phone'){await page.setViewportSize({width:375,height:812});await page.waitForTimeout(100);expect((await inspect(page)).view.zoom).toBe(1);expect((await inspect(page)).view.scrollY).toBeGreaterThan(500);}
  expect(await page.evaluate(()=>(window as any).entryCues)).not.toContain('emperor');
  await dialogue(page);const after=await inspect(page);expect(after.state.flags.emperorSeen).toBe(true);expect(after.view.zoom).toBe(1);expect(after.actors.some(a=>a.hero==='emperor')).toBe(false);
  for(const key of ['party','activeParty','inventory','coins','bandages','location']as const)expect(after.state[key]).toEqual(s[key]);
  await approach(page,'capital-emperor');await page.getByRole('button',{name:'Face the Emperor',exact:true}).click();await expect.poll(async()=>(await inspect(page)).mode).toBe('battle');
  expect((await inspect(page)).view.zoom).toBe(1);expect((await inspect(page)).battle!.encounter).toBe('imperial-vessel');expect(await page.evaluate(()=>(window as any).entryCues)).toContain('emperor');
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await context.close();}
});

test('interruption replays the entry, and fast advance or skipping the assembly or party pan restores the world camera',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/');const s=imperialEntryCheckpoint();await importSave(page,s);
 await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-imperial-vessel');await next(page);await page.waitForTimeout(150);expect((await inspect(page)).state.flags.emperorSeen).toBeUndefined();
 await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-imperial-vessel');await expect(page.locator('.dialogue p')).toContainText('steps into');
 await next(page);await next(page);await next(page);await expect(page.locator('.dialogue h2')).toHaveText('The Emperor');await dialogue(page);expect((await inspect(page)).view.zoom).toBe(1);
 for(const advances of [0,1,2,4]){
  await importSave(page,s);for(let i=0;i<advances;i++)await next(page);await page.getByRole('button',{name:'Skip scene',exact:true}).click();
  const result=await inspect(page);expect(result.cinematic).toBeNull();expect(result.view.zoom).toBe(1);expect(result.state.flags.emperorSeen).toBe(true);expect(result.actors.some(a=>a.hero==='emperor')).toBe(false);expect(result.state.party).toEqual(s.party);
  await present(page);const stopped=(await inspect(page)).view;await page.waitForTimeout(400);expect((await inspect(page)).view).toEqual(stopped);
 }
});

test('a missing entry piece preserves the preceding save and retry can play the whole entrance',async({page})=>{
 await page.goto('/');await page.waitForFunction(()=>!!window.borrowedTomorrow);const before=(await inspect(page)).state,s=imperialEntryCheckpoint();await page.route('**/art/vector/chapter-six/imperial-entry-face.svg',r=>r.abort());
 await page.getByRole('button',{name:/^Save files$|^Save$/}).first().click();
 const upload=async()=>{const chooser=page.waitForEvent('filechooser');await page.getByRole('button',{name:'Import save file'}).click();await(await chooser).setFiles({name:'crown.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(s))});};
 await upload();await expect(page.getByRole('status')).toContainText('checkpoint is intact');expect((await inspect(page)).state).toEqual(before);
 await page.unroute('**/art/vector/chapter-six/imperial-entry-face.svg');await upload();await expect(page.getByRole('dialog')).toHaveCount(0);await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-imperial-vessel');
 await page.getByRole('button',{name:'Skip scene',exact:true}).click();expect((await inspect(page)).state.flags.emperorSeen).toBe(true);expect((await inspect(page)).view.zoom).toBe(1);
});
