import {expect,test} from '@playwright/test';
import {coastCheckpoint,palaceCheckpoint} from '../support/progress';
import {importSave} from './navigation';
import {capture,inspect} from './controls';

type Probe={active:boolean;frames:{time:number;x:number;y:number}[]};
export function walkingCadenceFlows(production=false){
 for(const [map,viewport,dpr]of [['coast',{width:1280,height:800},1],['relayhall',{width:1280,height:800},1],['conduit',{width:390,height:844},1.25]]as const){
  test(`${production?'production ':''}walking cadence in ${map}`,async({browser})=>{
   const context=await browser.newContext({viewport,deviceScaleFactor:dpr,reducedMotion:'no-preference'}),page=await context.newPage();
   try{
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');
    const state=map==='coast'?coastCheckpoint('kitJoined'):palaceCheckpoint(map==='relayhall'?'tomasRescued':'conduitSeen');
    await importSave(page,state);await expect(page.locator('.world-party')).toBeVisible();
    await page.mouse.move(0,0);await page.waitForTimeout(250);
    // Measure the real visible canvas in both builds, without a dev mutation API.
    await page.evaluate(()=>{
     const probe:Probe={active:true,frames:[]},output=document.querySelector('.pixel-output');
     (window as unknown as {walkCadence:Probe}).walkCadence=probe;
     const draw=CanvasRenderingContext2D.prototype.drawImage;
     CanvasRenderingContext2D.prototype.drawImage=function(this:CanvasRenderingContext2D,...args:unknown[]){
      Reflect.apply(draw,this,args);
      if(this.canvas===output&&probe.active){const v=window.borrowedTomorrow.inspect().view;probe.frames.push({time:performance.now(),x:v.scrollX,y:v.scrollY});}
     };
    });
    await page.locator('#canvas').focus();await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(2000);await capture(page,`walking-${production?'production':'dev'}-${map}`);
    await page.keyboard.up('ArrowRight');await page.keyboard.down('ArrowLeft');await page.waitForTimeout(2000);await page.keyboard.up('ArrowLeft');
    const frames=await page.evaluate(()=>{const p=(window as unknown as {walkCadence:Probe}).walkCadence;p.active=false;return p.frames;});
    const intervals=frames.slice(1).map((f,i)=>f.time-frames[i].time).sort((a,b)=>a-b);
    const fps=1000*(frames.length-1)/(frames.at(-1)!.time-frames[0].time);
    expect(fps,'visible motion approaches 30Hz indoors and beside animated water').toBeGreaterThan(26);
    expect(fps).toBeLessThan(35);expect(intervals[Math.floor(intervals.length/2)]).toBeGreaterThan(25);
    expect(intervals[Math.floor(intervals.length/2)]).toBeLessThan(42);
    expect(frames.every(f=>f.x%2===0&&f.y%2===0)).toBe(true);
    await expect.poll(async()=>!(await inspect(page)).moving).toBe(true);
    expect((await inspect(page)).state.inventory).toEqual(state.inventory);
    await page.getByRole('button',{name:'Equipment',exact:true}).click();await expect(page.getByRole('dialog',{name:'Character inventory'})).toBeVisible();
    await page.getByRole('button',{name:'Close',exact:true}).click();
    await page.emulateMedia({reducedMotion:'reduce'});const start=(await inspect(page)).state.location.x;
    await page.keyboard.down('ArrowRight');await page.waitForTimeout(450);await page.keyboard.up('ArrowRight');
    await expect.poll(async()=>!(await inspect(page)).moving).toBe(true);
    const after=await inspect(page);expect(after.state.location.x).toBeGreaterThan(start);
    expect(after.actors.find(a=>a.hero==='nell')?.motion).toBe('idle');
    await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
   }finally{await context.close();}
  });
 }
}
