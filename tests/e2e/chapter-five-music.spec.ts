import { test,expect } from '@playwright/test';
import { anchorCheckpoint } from '../support/anchors';
import { importSave,approach } from './navigation';
test('Act I foundry and carrier cues route to the live player and review in Music',async({page})=>{
 await page.goto('/?dev=music');await page.getByRole('button',{name:'Ch 5',exact:true}).click();
 for(const [mode,name]of [['airship','Above the Railway'],['hammerplain','The Next Shift'],['five-furnace','The Pouring Lane']]){await page.locator(`[data-cue="${mode}"]`).click();await expect(page.getByRole('heading',{name,exact:true})).toBeVisible();await expect(page.locator('.music-description').first()).toContainText('4/4');await expect(page.locator('.music-description').first()).toContainText('32 bars');}
 await page.goto('/');await page.evaluate(async()=>{
  // @ts-expect-error Observe the real mixer without adding a production API.
  const {Audio}:typeof import('../../src/game/audio')=await import('/src/game/audio.ts');const setMode=Audio.prototype.setMode;Audio.prototype.setMode=function(mode){(window as unknown as {actMusic:()=>{mode:string;enabled:boolean}}).actMusic=()=>({...this.position(),enabled:this.enabled});setMode.call(this,mode);};
 });const music=()=>page.evaluate(()=>(window as unknown as {actMusic:()=>{mode:string;enabled:boolean}}).actMusic());await page.emulateMedia({reducedMotion:'reduce'});await importSave(page,anchorCheckpoint('furnaceConfronted'));await page.getByRole('button',{name:'Sound off',exact:true}).click();await approach(page,'forge-carrier');await page.getByRole('button',{name:'Hold off the furnace carrier',exact:true}).click();
 await expect.poll(async()=>(await music()).mode,{timeout:6000}).toBe('five-furnace');await page.getByRole('button',{name:'Restart battle',exact:true}).click();await expect.poll(async()=>(await music()).mode,{timeout:6000}).toBe('five-furnace');await page.getByRole('button',{name:'Sound on',exact:true}).click();expect((await music()).enabled).toBe(false);
});
test('Act I complete themes render their opening, middle, return and loop seam without clipping',async({page})=>{
 test.setTimeout(120000);await page.goto('/');
 const sections=await page.evaluate(async()=>{
  // @ts-expect-error Vite serves the actual campaign score.
  const {scoreBar,ARRANGEMENTS}:typeof import('../../src/game/score')=await import('/src/game/score.ts');
  // @ts-expect-error Vite serves the actual campaign rack.
  const {Synth}:typeof import('../../src/game/synth')=await import('/src/game/synth.ts');
  const out=[],rate=22050;
  for(const mode of ['airship','hammerplain','anchorforge','five-battle','five-furnace']as const)for(const start of [0,16,28]){
   const beat=60/ARRANGEMENTS[mode].bpm,count=start===28?6:4,seconds=(count+1)*4*beat,c=new OfflineAudioContext(2,Math.ceil((seconds+2)*rate),rate),gain=c.createGain();gain.gain.value=.52;gain.connect(c.destination);const synth=new Synth(c,gain);
   for(let bar=start-1;bar<start+count;bar++)for(const n of scoreBar(mode,bar))synth.note(n.instrument,n.pitch,.03+(bar-start+1)*4*beat+n.beat*beat,n.duration*beat,n.velocity,n.pan);
   const rendered=await c.startRendering();let peak=0,sum=0,samples=0;
   for(let channel=0;channel<2;channel++){const data=rendered.getChannelData(channel);for(let i=Math.ceil((.03+4*beat)*rate);i<Math.floor(seconds*rate);i++){const v=data[i];if(!Number.isFinite(v))throw Error('Non-finite audio');peak=Math.max(peak,Math.abs(v));sum+=v*v;samples++;}}
   out.push({mode,start,peak,rms:Math.sqrt(sum/samples)});
  }
  return out;
 });
 for(const s of sections){expect(s.peak,JSON.stringify(s)).toBeLessThan(.9);expect(s.rms,JSON.stringify(s)).toBeGreaterThan(.005);}
});
