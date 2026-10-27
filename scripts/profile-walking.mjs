import {chromium} from '@playwright/test';
import {createServer} from 'vite';
import {mkdir,mkdtemp,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';

// Opt-in development measurement. Writes profiles outside dist/ and never adds
// telemetry or mutation hooks to the shipped game. Run on a quiet machine.
const root=fileURLToPath(new URL('../',import.meta.url));
const directory=process.argv[2]?resolve(process.argv[2]):await mkdtemp(join(tmpdir(),'borrowed-tomorrow-walking-'));
const rate=Number(process.argv[3]??1);
if(!Number.isFinite(rate)||rate<1)throw new Error('CPU throttle must be a number >= 1.');
await mkdir(directory,{recursive:true});
const server=await createServer({root,server:{host:'127.0.0.1',port:5173}});
let browser;
const quantile=(values,p)=>[...values].sort((a,b)=>a-b)[Math.floor((values.length-1)*p)]??0;
try{
 await server.listen();const url=server.resolvedUrls.local[0];
 browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required']});
 const summaries=[];
 for(const [map,flag,x,y]of [['station','orrinJoined',23,18],['coast','kitJoined',24,26],['cinderbank','settlementSeen',27,22]]){
  const context=await browser.newContext({viewport:{width:1280,height:800},reducedMotion:'no-preference'});
  try{
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(url);await page.waitForFunction(()=>!!window.borrowedTomorrow);
   const state=await page.evaluate(async({map,flag,x,y})=>{
    const fixtures=await import('/tests/support/progress.ts');
    const state=map==='station'?fixtures.checkpoint(flag):fixtures.coastCheckpoint(flag);
    state.location={map,x,y};return state;
   },{map,flag,x,y});
   await page.getByRole('button',{name:/^Save files$|^Save$/}).first().click();
   const chooser=page.waitForEvent('filechooser');await page.getByRole('button',{name:'Import save file'}).click();
   await (await chooser).setFiles({name:'profile.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(state))});
   await page.getByRole('dialog').waitFor({state:'hidden'});
   await page.getByRole('button',{name:'Sound off',exact:true}).click();await page.getByRole('button',{name:'Sound on',exact:true}).waitFor();await page.waitForTimeout(500);
   await page.evaluate(async()=>{
    window.walkProfile={paint:[],rebuild:[],steps:[],raf:[],long:[],active:true};
    const {PixelDisplay}=await import('/src/game/pixel-display.ts');
    const rebuild=PixelDisplay.prototype.rebuild,paint=PixelDisplay.prototype.paint;
    PixelDisplay.prototype.rebuild=function(...args){const t=performance.now();const result=rebuild.apply(this,args);window.walkProfile.rebuild.push(performance.now()-t);return result;};
    PixelDisplay.prototype.paint=function(...args){const t=performance.now(),last=this.lastPaint;const result=paint.apply(this,args);if(this.lastPaint!==last)window.walkProfile.paint.push(performance.now()-t);return result;};
    const {Synth}=await import('/src/game/synth.ts'),effect=Synth.prototype.effect;
    Synth.prototype.effect=function(kind,when,...args){if(kind==='move')window.walkProfile.steps.push(when);return effect.call(this,kind,when,...args);};
    new PerformanceObserver(list=>window.walkProfile.long.push(...list.getEntries().map(e=>({time:e.startTime,duration:e.duration})))).observe({type:'longtask'});
    let last=performance.now();function tick(now){window.walkProfile.raf.push(now-last);last=now;if(window.walkProfile.active)requestAnimationFrame(tick);}requestAnimationFrame(tick);
   });
   const cdp=await context.newCDPSession(page);
   await cdp.send('Emulation.setCPUThrottlingRate',{rate});await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:500});await cdp.send('Profiler.start');
   await page.locator('#canvas').focus();
   for(const key of ['ArrowRight','ArrowLeft']){await page.keyboard.down(key);await page.waitForTimeout(2200);await page.keyboard.up(key);}
   await page.waitForTimeout(150);
   const {profile}=await cdp.send('Profiler.stop');
   const measurements=await page.evaluate(()=>{window.walkProfile.active=false;return {...window.walkProfile,location:window.borrowedTomorrow.inspect().state.location};});
   if(errors.length)throw new Error(errors.join('\n'));
   await writeFile(join(directory,`${map}.json`),JSON.stringify({profile,measurements}));
   const idle=new Set(profile.nodes.filter(n=>n.callFrame.functionName==='(idle)').map(n=>n.id));
   const total=profile.timeDeltas.reduce((a,b)=>a+b,0),idleTime=profile.samples.reduce((sum,id,i)=>sum+(idle.has(id)?profile.timeDeltas[i]:0),0);
   const intervals=measurements.steps.slice(1).map((t,i)=>(t-measurements.steps[i])*1000);
   summaries.push({map,cpuThrottle:rate,busyPercent:100*(1-idleTime/total),paintMedianMs:quantile(measurements.paint,.5),paintP95Ms:quantile(measurements.paint,.95),frameP95Ms:quantile(measurements.raf,.95),footstepP95Ms:quantile(intervals,.95),longTasks:measurements.long.length,steps:measurements.steps.length});
   console.log(JSON.stringify(summaries.at(-1)));
  }finally{await context.close();}
 }
 await writeFile(join(directory,'summary.json'),JSON.stringify(summaries,null,2)+'\n');
 console.log(`Profiles: ${directory}`);
}finally{await browser?.close();await server.close();}
