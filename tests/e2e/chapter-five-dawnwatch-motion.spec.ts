import { test,expect,type Page } from '@playwright/test';
import { dawnwatchCheckpoint } from '../support/anchors';
import { importSave,approach } from './navigation';
import { inspect,capture } from './controls';
async function gate(page:Page){
 await importSave(page,dawnwatchCheckpoint('dawnwatchSeen'));await approach(page,'dawn-gate');
 for(let n=0;n<8;n++){if((await page.locator('.dialogue p').textContent())?.includes('The bar scrapes clear.'))return;await page.locator('.dialogue-actions button').first().click();}
 throw Error('Shelter gate shot missing');
}
async function hashes(page:Page,ms:number){
 return page.evaluate(ms=>new Promise<number[]>(resolve=>{
  const hashes=new Set<number>(),start=performance.now();let last=0;
  const tick=()=>{const now=performance.now();if(now-last>80){last=now;const c=document.querySelector<HTMLCanvasElement>('.pixel-output')!,r=c.getBoundingClientRect(),w=document.querySelector('.world-input')!.getBoundingClientRect(),scale=c.width/r.width,x=Math.round((w.left-r.left)*scale),y=Math.round((w.top-r.top)*scale),p=c.getContext('2d')!.getImageData(x,y,Math.floor(w.width*scale),Math.floor(w.height*.8*scale)).data;let hash=2166136261;for(let i=0;i<p.length;i+=16)hash=Math.imul(hash^p[i],16777619);hashes.add(hash>>>0);}if(now-start>=ms)resolve([...hashes]);else requestAnimationFrame(tick);};tick();
 }),ms);
}
for(const [device,viewport,dpr]of [['desktop',{width:1280,height:800},1.25],['phone',{width:390,height:844},1.5]]as const){
 test(`shelter residents enter on passive scene time; skip and reload settle on ${device}`,async({browser})=>{
  const context=await browser.newContext({viewport,deviceScaleFactor:dpr,reducedMotion:'no-preference'}),page=await context.newPage();page.setDefaultTimeout(15000);
  try{const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await gate(page);await page.mouse.move(0,0);expect((await hashes(page,1100)).length).toBeGreaterThan(2);expect((await inspect(page)).state.flags.shelterOpened).toBeUndefined();await capture(page,`shelter-opening-${device}`);await page.getByRole('button',{name:'Skip scene',exact:true}).click();const before=(await inspect(page)).people;expect(before.some(p=>p.id==='lower-family')).toBe(false);expect(before.some(p=>p.id==='shelter-family')).toBe(true);await page.waitForTimeout(1700);expect((await inspect(page)).people).toEqual(before);await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).state.flags.shelterOpened).toBe(true);expect((await inspect(page)).people.map(p=>p.id)).toEqual(before.map(p=>p.id));expect(errors).toEqual([]);}finally{await context.close();}
 });
}
test('reduced-motion shelter settles without moving pixels or delayed residents',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await gate(page);await page.mouse.move(0,0);await page.waitForTimeout(500);expect((await hashes(page,600)).length).toBe(1);await page.getByRole('button',{name:'Skip scene',exact:true}).click();const before=(await inspect(page)).people;await page.waitForTimeout(1600);expect((await inspect(page)).people).toEqual(before);
});
