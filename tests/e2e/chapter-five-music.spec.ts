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
for(const [family,modes]of [
 ['flight',['airship','airfield','hammerplain','coolingworks']],
 ['foundry and crossing',['anchorforge','five-battle','five-furnace','petra-battle']],
]as const)test(`Rewritten ${family} complete loops and seams render without clipping or sample snaps`,async({page},testInfo)=>{
 test.setTimeout(120000);await page.goto('/');
 const results=await page.evaluate(async(modes)=>{
  // @ts-expect-error Vite serves the actual campaign score.
  const {scoreBar,scoreLength,ARRANGEMENTS}:typeof import('../../src/game/score')=await import('/src/game/score.ts');
  // @ts-expect-error Vite serves the actual campaign rack.
  const {Synth}:typeof import('../../src/game/synth')=await import('/src/game/synth.ts');
  const out=[],rate=22050;
  for(const mode of modes){
   const a=ARRANGEMENTS[mode],beat=60/a.bpm,barSeconds=a.beats*beat,count=scoreLength(mode)+2,seconds=count*barSeconds,c=new OfflineAudioContext(2,Math.ceil((seconds+2)*rate),rate),gain=c.createGain();gain.gain.value=.52;gain.connect(c.destination);const synth=new Synth(c,gain);
   for(let bar=-1;bar<count-1;bar++)for(const n of scoreBar(mode,bar))synth.note(n.instrument,n.pitch,.03+(bar+1)*barSeconds+n.beat*beat,n.duration*beat,n.velocity,n.pan);
   const rendered=await c.startRendering();let peak=0,sum=0,jump=0,samples=0;
   for(let channel=0;channel<2;channel++){const data=rendered.getChannelData(channel);for(let i=Math.ceil((.03+barSeconds)*rate);i<Math.floor(seconds*rate);i++){const v=data[i];if(!Number.isFinite(v))throw Error('Non-finite audio');peak=Math.max(peak,Math.abs(v));sum+=v*v;jump=Math.max(jump,Math.abs(v-data[i-1]));samples++;}}
   out.push({mode,peak,rms:Math.sqrt(sum/samples),jump});
  }
  return out;
 },modes);
 await testInfo.attach('full-loop-levels',{body:JSON.stringify(results,null,2),contentType:'application/json'});
 for(const r of results){expect(r.peak,JSON.stringify(r)).toBeLessThan(.9);expect(r.rms,JSON.stringify(r)).toBeGreaterThan(.005);expect(r.jump,JSON.stringify(r)).toBeLessThan(.25);}
});
