import {expect,test,type Page} from '@playwright/test';
import {coastCheckpoint} from '../support/progress';
import {importSave} from './navigation';
import {capture,inspect} from './controls';

/** Independent legacy full-size compositor: exact colors, alpha, clips and grid phase. */
async function compareFullFrame(page:Page){
 return page.evaluate(async()=>{
  const mod='/src/game/pixel-display.ts',{PixelDisplay,PALETTE}=await import(/* @vite-ignore */mod);
  return new Promise<number>(resolve=>{
   const paint=PixelDisplay.prototype.paint;
   PixelDisplay.prototype.paint=function(...args:Parameters<typeof paint>){
    const d=this as any,last=d.lastPaint;paint.apply(this,args);
    // The display intentionally skips some native frames. Compare the same
    // presented frame, not a newer scene against a cached display.
    if(d.lastPaint===last)return;PixelDisplay.prototype.paint=paint;
    const canvas=(w:number,h:number)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
    const full=canvas(d.width,d.height),fc=full.getContext('2d')!;fc.imageSmoothingEnabled=false;fc.fillStyle=PALETTE[0];fc.fillRect(0,0,full.width,full.height);
    fc.drawImage(d.lower,0,0);const r=d.worldRect;fc.drawImage(d.native,r.x,r.y,r.w,r.h);fc.drawImage(d.upper,0,0);
    const small=canvas(Math.ceil(full.width/2),Math.ceil(full.height/2)),sc=small.getContext('2d')!;sc.imageSmoothingEnabled=false;sc.drawImage(full,0,0,small.width*2,small.height*2,0,0,small.width,small.height);
    const expected=canvas(d.output.width,d.output.height),ec=expected.getContext('2d')!;ec.imageSmoothingEnabled=false;ec.fillStyle=PALETTE[0];ec.fillRect(0,0,expected.width,expected.height);
    ec.beginPath();ec.rect(d.physicalLeft,d.physicalTop,d.width*d.physicalScale,d.height*d.physicalScale);ec.clip();ec.drawImage(small,d.physicalLeft,d.physicalTop,small.width*2*d.physicalScale,small.height*2*d.physicalScale);
    const a=d.output.getContext('2d').getImageData(0,0,d.output.width,d.output.height).data,b=ec.getImageData(0,0,expected.width,expected.height).data;
    let different=0;for(let i=0;i<a.length;i++)if(a[i]!==b[i])different++;resolve(different);
   };
  });
 });
}
for(const [device,viewport,dpr]of [['desktop',{width:1280,height:800},1],['phone',{width:375,height:844},1.25]]as const)test.describe(`compositor on ${device}`,()=>{
 test.use({viewport,deviceScaleFactor:dpr});
 test('matches full-frame rendering while walking, opening overlays and resizing',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');await importSave(page,coastCheckpoint('kitJoined'));
  await expect(page.locator('.world-party')).toBeVisible();await page.waitForTimeout(250);
  expect(await compareFullFrame(page)).toBe(0);
  await page.locator('#canvas').focus();const start=(await inspect(page)).state.location.x;
  await page.keyboard.down('ArrowRight');
  for(let i=0;i<4;i++){await page.waitForTimeout(80);expect(await compareFullFrame(page)).toBe(0);}
  await page.keyboard.up('ArrowRight');await expect.poll(async()=>!(await inspect(page)).moving).toBe(true);
  expect((await inspect(page)).state.location.x).toBeGreaterThan(start);expect(await compareFullFrame(page)).toBe(0);
  await page.getByRole('button',{name:'Equipment',exact:true}).click();await expect(page.getByRole('dialog',{name:'Character inventory'})).toBeVisible();await page.waitForTimeout(100);expect(await compareFullFrame(page)).toBe(0);
  await page.getByRole('button',{name:'Close',exact:true}).click();expect(await compareFullFrame(page)).toBe(0);
  await page.setViewportSize({width:viewport.width-2,height:viewport.height-3});await page.waitForTimeout(100);expect(await compareFullFrame(page)).toBe(0);
  await capture(page,`compositor-${device}`);await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 });
});
