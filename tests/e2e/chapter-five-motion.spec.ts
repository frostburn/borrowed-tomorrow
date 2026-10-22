import { expect,test,type Page } from '@playwright/test';
import { anchorCheckpoint } from '../support/anchors';
import { approach,importSave } from './navigation';
import { capture,inspect } from './controls';
async function line(page:Page,text:string){
 for(let n=0;n<15;n++){if((await page.locator('.dialogue p').textContent())?.includes(text))return;await page.locator('.dialogue-actions button').first().click();}
 throw Error(`Missing takeoff line: ${text}`);
}
async function hashes(page:Page,ms:number){
 return page.evaluate(ms=>new Promise<number[]>(resolve=>{
  const values=new Set<number>(),start=performance.now();let sampled=0;
  const tick=()=>{const now=performance.now();if(now-sampled>80){sampled=now;const c=document.querySelector<HTMLCanvasElement>('.pixel-output')!,r=c.getBoundingClientRect(),w=document.querySelector('.world-input')!.getBoundingClientRect(),scale=c.width/r.width,x=Math.round((w.left-r.left)*scale),y=Math.round((w.top-r.top+w.height*.12)*scale),width=Math.min(c.width-x,Math.floor(w.width*scale)),height=Math.floor(w.height*.4*scale),p=c.getContext('2d')!.getImageData(x,y,width,height).data;let hash=2166136261;for(let i=0;i<p.length;i+=16)hash=Math.imul(hash^p[i],16777619);values.add(hash>>>0);}if(now-start>=ms)resolve([...values]);else requestAnimationFrame(tick);};tick();
 }),ms);
}
for(const [device,viewport,dpr]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const){
 test(`the survey takeoff lifts the boarded cast together on scene time on ${device}`,async({browser})=>{
  const context=await browser.newContext({viewport,deviceScaleFactor:dpr,reducedMotion:'no-preference'}),page=await context.newPage();
  try{
   const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await importSave(page,anchorCheckpoint('airfieldGuardWon'));await approach(page,'airfield-board');
   await line(page,'Hold a rail.');await page.mouse.move(0,0);const before=(await inspect(page)).actors;
   expect((await hashes(page,1000)).length).toBeGreaterThan(3);const after=(await inspect(page)).actors;
   for(const id of ['nell','orrin','kit','petra','celia']){const a=before.find(a=>a.hero===id)!,z=after.find(a=>a.hero===id)!;expect(z.y).toBeLessThan(a.y-12);}
   await capture(page,`survey-takeoff-${device}`);expect((await inspect(page)).state.flags.airshipOwned).toBeUndefined();
   await page.getByRole('button',{name:'Skip scene',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('five-first-flight');await page.getByRole('button',{name:'Skip scene',exact:true}).click();
   await page.waitForTimeout(2000);expect((await inspect(page)).state.flags.airshipOwned).toBe(true);expect((await inspect(page)).state.flags.firstFlightSeen).toBe(true);expect((await inspect(page)).cinematic).toBeNull();expect(errors).toEqual([]);
  }finally{await context.close();}
 });
}
test('reduced-motion takeoff settles and skipped effects cannot move the flight-deck actors later',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await importSave(page,anchorCheckpoint('airfieldGuardWon'));await approach(page,'airfield-board');await line(page,'Hold a rail.');await page.mouse.move(0,0);await page.waitForTimeout(500);expect((await hashes(page,500)).length).toBe(1);
 await page.getByRole('button',{name:'Skip scene',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('five-first-flight');const before=(await inspect(page)).actors;await page.waitForTimeout(1900);expect((await inspect(page)).actors).toEqual(before);
});
