import {test,expect} from '@playwright/test';
import {checkpoint} from '../support/progress';
import {chapterSevenStart} from '../../src/dev/canonical-saves';
import {importSave} from './navigation';
import {capture,inspect} from './controls';

for(const [device,viewport,dpr]of [['desktop',{width:1280,height:800},1],['phone',{width:375,height:844},1.25]]as const){
 test(`camera follow preserves stationary face pixels on ${device}`,async({browser})=>{
  const context=await browser.newContext({viewport,deviceScaleFactor:dpr}),page=await context.newPage();
  try{
   const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('/');const state=checkpoint('villageSeen');state.activeParty=['nell'];state.location={map:'rillbridge',x:33,y:18};await importSave(page,state);
   await expect.poll(async()=>(await inspect(page)).mode).toBe('world');
   const sampling=page.evaluate(()=>new Promise<{x:number;y:number;hash:number}[]>(resolve=>{
    const rows:{x:number;y:number;hash:number}[]=[],start=performance.now();
    const tick=()=>{
     const v=window.borrowedTomorrow.inspect().view,p=window.borrowedTomorrowPixels.inspect(),world=document.querySelector('.world-input')!.getBoundingClientRect(),source=document.querySelector('.pixel-source')!.getBoundingClientRect();
     const gx=Math.round((world.left-source.left)/p.cssScale),gy=Math.round((world.top-source.top)/p.cssScale),u=p.rasterUnit;
     // Reproject Elspeth's stationary face through the actual screen sampling grid.
     const x=Math.floor((gx+694-v.scrollX)/u)*u-gx,y=Math.floor((gy+412-v.scrollY)/u)*u-gy;
     const c=document.querySelector<HTMLCanvasElement>('.phaser-host canvas')!,ctx=c.getContext('2d')!,data=ctx.getImageData(x,y,28,28).data;
     let hash=0;for(let yy=0;yy<28;yy+=u)for(let xx=0;xx<28;xx+=u)for(let k=0;k<3;k++)hash=(Math.imul(hash,31)+data[(yy*28+xx)*4+k])|0;
     rows.push({x:v.scrollX,y:v.scrollY,hash});
     if(performance.now()-start>900)resolve(rows);else requestAnimationFrame(tick);
    };requestAnimationFrame(tick);
   }));
   for(const x of [34,35]){await page.keyboard.press('ArrowRight',{delay:25});await expect.poll(async()=>{const s=await inspect(page);return !s.moving&&s.state.location.x===x;}).toBe(true);}
   const rows=await sampling;expect(new Set(rows.map(r=>r.x)).size).toBeGreaterThan(5);
   expect(rows.every(r=>r.x%2===0&&r.y%2===0)).toBe(true);
   expect(new Set(rows.map(r=>r.hash)).size,'stationary face keeps the same sampled features while the camera moves').toBe(1);
   await capture(page,`raster-follow-${device}`);
   // Odd phone widths must not put the last camera step off-grid at the map edge.
   state.location={map:'rillbridge',x:61,y:18};await importSave(page,state);
   await expect.poll(async()=>{const v=(await inspect(page)).view;return v.scrollX%2===0&&v.scrollY%2===0&&v.scrollX+v.width<=1536;}).toBe(true);
   await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
  }finally{await context.close();}
 });
 test(`map workshop scrolls by chunky pixels at either zoom on ${device}`,async({browser})=>{
  const context=await browser.newContext({viewport,deviceScaleFactor:dpr}),page=await context.newPage();
  try{
   await page.goto('/?dev=maps&map=coast');await expect(page.locator('#map-workshop')).toHaveAttribute('data-ready','true');
   for(const zoom of ['1x','2x']){
    await page.getByRole('button',{name:zoom,exact:true}).click();
    const view=page.locator('.map-viewport');await view.evaluate(v=>{v.scrollLeft=101;v.scrollTop=103;});
    await expect.poll(()=>view.evaluate(v=>[v.scrollLeft,v.scrollTop])).toEqual([102,104]);
    await view.evaluate(v=>{v.scrollLeft=v.scrollWidth;v.scrollTop=v.scrollHeight;});
    await expect.poll(()=>view.evaluate(v=>v.scrollLeft%2===0&&v.scrollTop%2===0)).toBe(true);
   }
   await capture(page,`raster-map-${device}`);
  }finally{await context.close();}
 });
}

test('cinematic camera pans remain on the chunky grid',async({page})=>{
 await page.goto('/');await importSave(page,chapterSevenStart());
 await expect.poll(async()=>(await inspect(page)).cinematic).toBe('seven-crossing');
 for(let i=0;i<3;i++)await page.locator('.dialogue-actions button').first().click();
 const rows=await page.evaluate(()=>new Promise<{x:number;y:number}[]>(resolve=>{
  const out:{x:number;y:number}[]=[],start=performance.now();
  const tick=()=>{const v=window.borrowedTomorrow.inspect().view;out.push({x:v.scrollX,y:v.scrollY});if(performance.now()-start>1700)resolve(out);else requestAnimationFrame(tick);};requestAnimationFrame(tick);
 }));
 expect(new Set(rows.map(v=>v.y)).size).toBeGreaterThan(10);
 expect(rows.every(v=>v.x%2===0&&v.y%2===0)).toBe(true);
 await capture(page,'raster-cinematic');
});
