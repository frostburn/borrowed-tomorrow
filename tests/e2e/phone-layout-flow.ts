import {expect,type Page} from '@playwright/test';
import {capture,inspect} from './controls';

export async function phoneConsole(page:Page){
 await expect(page.locator('.pixel-source')).toHaveClass(/phone-layout/);
 await expect(page.locator('.orientation-gate')).toBeHidden();
 const geometry=()=>page.evaluate(()=>{
  const stage=document.querySelector('.stage-wrap')!.getBoundingClientRect(),controls=document.querySelector('.controls')!.getBoundingClientRect(),world=document.querySelector<HTMLCanvasElement>('.world-input')!,bounds=world.getBoundingClientRect(),view=window.borrowedTomorrow.inspect().view;
  const pixels=window.borrowedTomorrowPixels.inspect();
  return {scale:pixels.cssScale,frameFits:pixels.width<=innerWidth&&pixels.height<=innerHeight,stageRight:stage.right,controlsLeft:controls.left,surface:[world.width,world.height],view:[view.width,view.height],origin:[bounds.x,bounds.y],stageOrigin:[stage.x,stage.y],clipped:[...document.querySelectorAll('.topbar button,.controls .actions button,#confirmation button')].filter(b=>{
   const r=b.getBoundingClientRect();return r.width>0&&(r.x<0||r.y<0||r.right>innerWidth+1||r.bottom>innerHeight+1);
  }).map(b=>b.textContent)};
 });
 // setViewportSize can return before Chromium delivers its resize event. Wait
 // for the actual fit rather than sampling the previous frame's DOM bounds.
 await expect.poll(async()=>{
  const l=await geometry();return {scale:l.scale,frameFits:l.frameFits,beside:l.controlsLeft>=l.stageRight,clipped:l.clipped,surfaceMatches:JSON.stringify(l.surface)===JSON.stringify(l.view),aligned:JSON.stringify(l.origin)===JSON.stringify(l.stageOrigin)};
 }).toEqual({scale:1,frameFits:true,beside:true,clipped:[],surfaceMatches:true,aligned:true});
}
export async function rotateWithPlan(page:Page){
 const before=(await inspect(page)).battle;
 await page.setViewportSize({width:390,height:844});
 await expect(page.getByRole('dialog',{name:'Turn your phone sideways'})).toBeVisible();
 expect(await page.locator('.pixel-source').evaluate(e=>(e as HTMLElement).inert)).toBe(true);
 await capture(page,'phone-portrait-rotate');
 await page.keyboard.press('Escape');await page.keyboard.press('Enter');await page.keyboard.press('Space');await page.keyboard.press('1');
 // Scene timers and the campaign clock must remain stopped, not just covered.
 const seconds=(await inspect(page)).state.playSeconds;
 await page.waitForTimeout(1100);
 expect((await inspect(page)).battle).toEqual(before);
 expect((await inspect(page)).state.playSeconds).toBe(seconds);
 await page.setViewportSize({width:844,height:390});
 await expect(page.getByRole('dialog',{name:'Turn your phone sideways'})).toBeHidden();
 expect(await page.locator('.pixel-source').evaluate(e=>(e as HTMLElement).inert)).toBe(false);
 expect((await inspect(page)).battle).toEqual(before);
 await phoneConsole(page);
}
export async function touchPan(page:Page){
 const before=await inspect(page),world=(await page.locator('.world-input').boundingBox())!;
 const session=await page.context().newCDPSession(page),x=Math.round(world.x+world.width*.6),y=Math.round(world.y+world.height*.5);
 await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
 await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-70,y:y-40}]});
 await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await session.detach();
 const after=await inspect(page);
 expect(after.view.scrollX).toBeGreaterThan(before.view.scrollX);
 expect(after.view.scrollY).toBeGreaterThanOrEqual(before.view.scrollY);
 expect(after.battle,'dragging the view does not select or spend a command').toEqual(before.battle);
 await capture(page,'phone-landscape-pan');
}
