import {expect,type Page} from '@playwright/test';
import {capture,inspect} from './controls';

export async function phoneConsole(page:Page){
 await expect(page.locator('.pixel-source')).toHaveClass(/phone-layout/);
 await expect(page.locator('.orientation-gate')).toHaveCount(0);
 await expect(page.locator('vite-error-overlay')).toHaveCount(0);
 const geometry=()=>page.evaluate(()=>{
  const stage=document.querySelector('.stage-wrap')!.getBoundingClientRect(),controls=document.querySelector('.controls')!.getBoundingClientRect(),world=document.querySelector<HTMLCanvasElement>('.world-input')!,bounds=world.getBoundingClientRect(),view=window.borrowedTomorrow.inspect().view;
  const pixels=window.borrowedTomorrowPixels.inspect();
  const portrait=innerHeight>innerWidth;
  return {scale:pixels.cssScale,frameFits:pixels.width<=innerWidth&&pixels.height<=innerHeight,placed:portrait?controls.top>=stage.bottom:controls.left>=stage.right,worldScale:pixels.worldScale,filtered:pixels.worldFiltered,portrait,surface:[world.width,world.height],view:[view.width,view.height],sizeCorrect:bounds.width===view.width*pixels.worldScale&&bounds.height===view.height*pixels.worldScale,origin:[bounds.x,bounds.y],stageOrigin:[stage.x,stage.y],clipped:[...document.querySelectorAll('.topbar button,.controls .actions button,#confirmation button')].filter(b=>{
   const r=b.getBoundingClientRect();return r.width>0&&(r.x<0||r.y<0||r.right>innerWidth+1||r.bottom>innerHeight+1);
  }).map(b=>b.textContent)};
 });
 // setViewportSize can return before Chromium delivers its resize event. Wait
 // for the actual fit rather than sampling the previous frame's DOM bounds.
 await expect.poll(async()=>{
  const l=await geometry();return {scale:l.scale,frameFits:l.frameFits,placed:l.placed,clipped:l.clipped,surfaceMatches:JSON.stringify(l.surface)===JSON.stringify(l.view),aligned:JSON.stringify(l.origin)===JSON.stringify(l.stageOrigin),sizeCorrect:l.sizeCorrect,worldScale:l.worldScale===(l.portrait?.5:1),filter:l.filtered===!l.portrait};
 }).toEqual({scale:1,frameFits:true,placed:true,clipped:[],surfaceMatches:true,aligned:true,sizeCorrect:true,worldScale:true,filter:true});
}
export async function rotateWithPlan(page:Page){
 const before=(await inspect(page)).battle;
 await page.setViewportSize({width:844,height:390});
 await phoneConsole(page);
 await expect(page.getByRole('button',{name:'Confirm healing',exact:true})).toBeInViewport();
 expect((await inspect(page)).battle).toEqual(before);
 await page.setViewportSize({width:390,height:844});await phoneConsole(page);
 expect(await page.locator('.pixel-source').evaluate(e=>(e as HTMLElement).inert)).toBe(false);
 expect((await inspect(page)).battle).toEqual(before);
 await expect(page.getByRole('button',{name:'Confirm healing',exact:true})).toBeInViewport();
 await capture(page,'phone-portrait-healing');
}
/** Compare a clear strip of the visible stage against a direct half-size scene
 * draw. A shared chunky raster would differ, even if layout metadata were right. */
export async function unfilteredPortraitWorld(page:Page){
 await expect.poll(()=>page.evaluate(()=>{
  const native=document.querySelector<HTMLCanvasElement>('.phaser-host canvas')!,output=document.querySelector<HTMLCanvasElement>('.pixel-output')!,world=document.querySelector('.world-input')!.getBoundingClientRect();
  const expected=document.createElement('canvas');expected.width=world.width;expected.height=world.height;
  const ctx=expected.getContext('2d')!;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(native,0,0,world.width,world.height);
  const x=Math.floor(world.width/2)-32,y=Math.floor(world.height/2)-16;
  const a=ctx.getImageData(x,y,64,24).data,b=output.getContext('2d')!.getImageData(world.x+x,world.y+y,64,24).data;
  return {matches:a.every((v,i)=>v===b[i]),nonblank:new Set(Array.from(a).filter((_,i)=>i%4!==3)).size>3};
 }),{message:'portrait paints the original scene without the chunky raster'}).toEqual({matches:true,nonblank:true});
}
export async function touchPan(page:Page){
 const before=await inspect(page),world=(await page.locator('.world-input').boundingBox())!;
 const session=await page.context().newCDPSession(page),x=Math.round(world.x+world.width*.6),y=Math.round(world.y+world.height*.5);
 await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
 await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-70,y:y-40}]});
 await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 // Keep this gesture session until the owning browser context closes, so the
 // subsequent touchscreen taps use continuous device emulation.
 expect(await page.evaluate(()=>navigator.maxTouchPoints)).toBeGreaterThan(0);
 const after=await inspect(page);
 expect(after.view.scrollX).toBeGreaterThan(before.view.scrollX);
 expect(after.view.scrollY).toBeGreaterThanOrEqual(before.view.scrollY);
 expect(after.battle,'dragging the view does not select or spend a command').toEqual(before.battle);
 await capture(page,'phone-portrait-pan');
}
