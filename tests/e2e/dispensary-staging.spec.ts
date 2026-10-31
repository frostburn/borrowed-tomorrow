import {test,expect,type Page} from '@playwright/test';
import {windmereCheckpoint} from '../support/anchors';
import {arrival} from '../../src/content/maps';
import {dispensary} from '../../src/content/chapter-five/windmere-scenes';
import {inspect,capture,dialogue,nativeActor} from './controls';
import {importSave,approach} from './navigation';

const cast=dispensary().scene!.actors;
async function composition(page:Page){
 await expect(page.locator('.cinematic')).toHaveAttribute('data-dialogue-position','top');
 const layout=await page.evaluate(()=>{
  const {view,actors}=window.borrowedTomorrow.inspect(),world=document.querySelector('.world-input')!.getBoundingClientRect(),scale=world.height/view.height;
  const bounds=(selector:string)=>{const r=document.querySelector(selector)!.getBoundingClientRect();return {top:(r.top-world.top)/scale,bottom:(r.bottom-world.top)/scale,left:(r.left-world.left)/scale,right:(r.right-world.left)/scale};};
  return {view,actors,panel:bounds('.dialogue'),next:bounds('.dialogue-actions button'),bar:bounds('.cinema-bar')};
 });
 expect(layout.panel.top).toBeGreaterThanOrEqual(layout.bar.bottom);
 expect(layout.panel.bottom).toBeLessThanOrEqual(layout.view.height/2+1);
 expect(layout.next.bottom).toBeLessThanOrEqual(layout.panel.bottom);
 for(const actor of cast){
  const x=(actor.at.x+.5)*24,y=(actor.at.y+.5)*24+7;
  expect(layout.actors.find(a=>a.x===x&&a.y===y),actor.id).toBeTruthy();
  expect(y-68-layout.view.scrollY,`${actor.id} below the dialogue`).toBeGreaterThan(layout.panel.bottom);
  expect(y+12-layout.view.scrollY,`${actor.id} inside the frame`).toBeLessThan(layout.view.height);
  expect(x-40-layout.view.scrollX,actor.id).toBeGreaterThanOrEqual(0);
  expect(x+40-layout.view.scrollX,actor.id).toBeLessThanOrEqual(layout.view.width);
 }
 await page.mouse.move(0,0);
 await nativeActor(page,'sera',cast.find(a=>a.id==='sera')!.at);
 return layout.next;
}

for(const [device,viewport,reducedMotion]of [
 ['desktop',{width:1280,height:800},'no-preference'],
 ['phone',{width:390,height:844},'reduce'],
 ['narrow phone',{width:320,height:740},'no-preference'],
]as const)test(`Lower Dispensary keeps the cast clear below upper dialogue on ${device}`,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:1.25,reducedMotion}),page=await context.newPage(),errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 try{
  await page.goto('/');const save=windmereCheckpoint('windmereSeen');save.location=arrival('dispensary','start');await importSave(page,save);
  await expect.poll(async()=>(await inspect(page)).cinematic).toBe('five-wind-dispensary');
  const before=(await inspect(page)).state,button=await composition(page);
  expect(before.flags.dispensarySeen).toBeFalsy();await capture(page,`dispensary-intro-${device.replace(' ','-')}`);
  await page.locator('.dialogue-actions button').click();await expect(page.locator('.dialogue h2')).toHaveText('Orrin');
  expect(await composition(page)).toEqual(button);expect((await inspect(page)).state.flags.dispensarySeen).toBeFalsy();
  if(device==='desktop'){
   // An interrupted scene replays without consuming its checkpoint. Resize
   // exercises Cutscene.reframe while the top dialogue is still active.
   await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();
   await expect.poll(async()=>(await inspect(page)).cinematic).toBe('five-wind-dispensary');await composition(page);
   await page.setViewportSize({width:390,height:844});await expect.poll(async()=>(await inspect(page)).view.width).toBe(368);await composition(page);
   await capture(page,'dispensary-intro-resized');
  }
  if(device==='narrow phone')await dialogue(page);else await page.getByRole('button',{name:'Skip scene',exact:true}).click();
  await expect(page.locator('.scene-layer')).not.toHaveAttribute('data-dialogue-position','top');
  const after=(await inspect(page)).state;expect(after.flags.dispensarySeen).toBe(true);
  for(const key of ['party','activeParty','inventory','bandages','coins','xp','skills']as const)expect(after[key],key).toEqual(before[key]);
  await approach(page,'wind-lift-sera');await expect(page.locator('.dialogue h2')).toHaveText('Sera');
  await expect(page.locator('.scene-layer')).toHaveAttribute('data-dialogue-position','bottom');
  expect(await page.locator('.dialogue').evaluate(el=>{const panel=el.getBoundingClientRect(),world=document.querySelector('.world-input')!.getBoundingClientRect(),scale=world.height/window.borrowedTomorrow.inspect().view.height;return (world.bottom-panel.bottom)/scale;})).toBeCloseTo(8);
  await dialogue(page);await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();
  await expect.poll(async()=>(await inspect(page)).state.flags.dispensarySeen).toBe(true);expect((await inspect(page)).cinematic).toBeNull();
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await context.close();}
});
