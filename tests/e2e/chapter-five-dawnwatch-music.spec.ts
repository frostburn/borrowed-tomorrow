import { test,expect } from '@playwright/test';
import { dawnwatchCheckpoint } from '../support/anchors';
import { importSave,approach } from './navigation';
test('Dawnwatch Music cues and live commander entry use the new regional family',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/?dev=music');await page.getByRole('button',{name:'Ch 5',exact:true}).click();
 for(const mode of ['dawnwatch','watchbarracks','signalwall','observation','dawn-battle','dawn-commander']){await page.locator(`[data-cue="${mode}"]`).click();await expect(page.locator('.music-description').first()).toContainText('31-EDO');await expect(page.locator('.music-description').first()).toContainText('4/4');await expect(page.locator('.music-description').first()).toContainText('32 bars');}
 await page.locator('[data-cue="dawnwatch"]').click();await expect(page.locator('#music-expression')).toHaveAttribute('aria-pressed','true');await expect(page.locator('#music-rubato')).toHaveCount(0);
 await page.locator('#music-expression').click();await expect(page.locator('#music-expression')).toHaveAttribute('aria-pressed','false');await page.locator('#music-expression').click();
 await page.locator('#music-play').click();await expect(page.locator('#music-position')).toContainText('Playing');await page.locator('#music-stop').click();
 await page.goto('/');await page.evaluate(async()=>{
  // @ts-expect-error Observe the real mixer without adding a production mutation API.
  const {Audio}:typeof import('../../src/game/audio')=await import('/src/game/audio.ts');const original=Audio.prototype.setMode;Audio.prototype.setMode=function(mode){(window as unknown as {dawnMusic:()=>{mode:string;enabled:boolean}}).dawnMusic=()=>({...this.position(),enabled:this.enabled});original.call(this,mode);};
 });const music=()=>page.evaluate(()=>(window as unknown as {dawnMusic:()=>{mode:string;enabled:boolean}}).dawnMusic());await page.emulateMedia({reducedMotion:'reduce'});await importSave(page,dawnwatchCheckpoint('aurelSeen'));await page.getByRole('button',{name:'Sound off',exact:true}).click();await expect.poll(async()=>(await music()).mode,{timeout:6000}).toBe('signalwall');await approach(page,'wall-commander');await page.getByRole('button',{name:'Face Commander Aurel',exact:true}).click();await expect.poll(async()=>(await music()).mode,{timeout:6000}).toBe('dawn-commander');await page.getByRole('button',{name:'Restart battle',exact:true}).click();await expect.poll(async()=>(await music()).mode,{timeout:6000}).toBe('dawn-commander');await page.getByRole('button',{name:'Sound on',exact:true}).click();expect((await music()).enabled).toBe(false);expect(errors).toEqual([]);
});
test('Dawnwatch complete loops and the cabin render through the real rack without clipping or sample snaps',async({page},testInfo)=>{
 test.setTimeout(120000);await page.goto('/');const results=await page.evaluate(async()=>{
  // @ts-expect-error Vite serves the actual procedural score.
  const {performanceBar,scoreTime}:typeof import('../../src/game/score-performance')=await import('/src/game/score-performance.ts');
  // @ts-expect-error Vite serves the actual campaign rack.
  const {Synth}:typeof import('../../src/game/synth')=await import('/src/game/synth.ts');const results=[],rate=22050;
  for(const mode of ['dawnwatch','watchbarracks','signalwall','observation','dawn-battle','dawn-commander']as const){
   const leadIn=-scoreTime(mode,-4),seconds=leadIn+scoreTime(mode,33*4),c=new OfflineAudioContext(2,Math.ceil((seconds+2)*rate),rate),gain=c.createGain();gain.gain.value=.52;gain.connect(c.destination);const synth=new Synth(c,gain);
   for(let bar=-1;bar<33;bar++)for(const n of performanceBar(mode,bar).notes)synth.note(n.instrument,n.pitch,.03+leadIn+scoreTime(mode,bar*4)+n.time,n.seconds,n.velocity,n.pan,n.expression);
   const rendered=await c.startRendering();let peak=0,sum=0,jump=0,samples=0;
   for(let ch=0;ch<2;ch++){const data=rendered.getChannelData(ch);for(let i=Math.ceil((.03+leadIn)*rate);i<Math.floor(seconds*rate);i++){const v=data[i];if(!Number.isFinite(v))throw Error('Invalid audio');peak=Math.max(peak,Math.abs(v));sum+=v*v;jump=Math.max(jump,Math.abs(v-data[i-1]));samples++;}}
   results.push({mode,peak,rms:Math.sqrt(sum/samples),jump});
  }return results;
 });await testInfo.attach('full-loop-levels',{body:JSON.stringify(results,null,2),contentType:'application/json'});for(const r of results){expect(r.peak,JSON.stringify(r)).toBeLessThan(.9);expect(r.rms,JSON.stringify(r)).toBeGreaterThan(.005);expect(r.jump,JSON.stringify(r)).toBeLessThan(.25);}
});
