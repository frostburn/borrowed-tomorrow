import { test, expect, type Page } from '@playwright/test';
import { brokenCheckpoint, coastCheckpoint } from '../support/progress';
import { approach, importSave } from './navigation';
import { capture, dialogue, inspect } from './controls';

test('piano notes decay while sustained arrangements release cleanly at a transition', async ({ page }) => {
  await page.goto('/');
  const levels = await page.evaluate(async () => {
    // @ts-expect-error Vite serves the actual live instrument rack.
    const { Synth }: typeof import('../../src/game/synth') = await import('/src/game/synth.ts');
    const rms = (b: AudioBuffer, from: number, to: number) => {
      const data = b.getChannelData(0).slice(Math.floor(from * b.sampleRate), Math.floor(to * b.sampleRate));
      return Math.sqrt(data.reduce((sum, n) => sum + n * n, 0) / data.length);
    };
    const piano = new OfflineAudioContext(2, 3 * 22050, 22050), keys = new Synth(piano, piano.destination);
    keys.note('keys', 'C5', .03, 2, .2);
    const struck = await piano.startRendering();
    const held = new OfflineAudioContext(2, 3 * 22050, 22050), pedal = new Synth(held, held.destination);
    pedal.note('strings', 'A3', .03, 7, .15);
    pedal.release(1);
    // A note in the incoming arrangement must survive the old voices' release.
    pedal.note('keys', 'C5', 1.5, .7, .2);
    const transition = await held.startRendering();
    return { attack: rms(struck, .05, .18), decay: rms(struck, 1.4, 1.7), held: rms(transition, .5, .8), silence: rms(transition, 1.15, 1.4), incoming: rms(transition, 1.52, 1.65) };
  });
  expect(levels.decay).toBeLessThan(levels.attack * .25);
  expect(levels.held).toBeGreaterThan(.01);
  expect(levels.silence).toBeLessThan(.00001);
  expect(levels.incoming).toBeGreaterThan(.01);
});

async function music(page: Page) {
  return page.evaluate(() => (window as unknown as { musicStatus: () => { mode: string; pending: string; enabled: boolean; running: boolean } }).musicStatus());
}
async function observeMusic(page:Page){
  await page.evaluate(async()=>{
    // @ts-expect-error Observe the actual browser mixer without a production API.
    const {Audio}:typeof import('../../src/game/audio')=await import('/src/game/audio.ts');
    const original=Audio.prototype.setMode;
    Audio.prototype.setMode=function(mode){
      const audio=this as unknown as {mode:string;pending:string;enabled:boolean;context?:AudioContext};
      (window as unknown as {musicStatus:()=>unknown}).musicStatus=()=>({mode:audio.mode,pending:audio.pending,enabled:audio.enabled,running:audio.context?.state==='running'});
      original.call(this,mode);
    };
  });
}
for(const [device,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]] as const){
  test(`Chapter Two uses regional variations for both raids, the loading walk and Petra on ${device}`,async({page})=>{
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    await page.setViewportSize(viewport);await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');await observeMusic(page);
    for(const [flag,object,expected]of [['kitJoined','signal-walk','coast-battle'],['kitJoined','loading-gate','coast-battle'],['settlementSeen','siding-collector','shunting'],['evacuationReady','siding-alban','petra-battle']] as const){
      const saved=coastCheckpoint(flag);if(saved.location.map==='cinderbank')saved.location=object==='siding-collector'?{map:'cinderbank',x:39,y:21}:{map:'cinderbank',x:45,y:26};
      await importSave(page,saved);if(!(await music(page)).enabled)await page.locator('#sound-button').click();
      await expect.poll(async()=>(await music(page)).mode,{timeout:6000}).toBe(saved.location.map);
      await approach(page,object);await dialogue(page);await expect.poll(async()=>(await inspect(page)).mode).toBe('battle');
      await expect.poll(async()=>(await music(page)).mode,{timeout:6000}).toBe(expected);
      if(object==='siding-alban')await capture(page,`petra-chapter-two-music-${device}`);
      await page.getByRole('button',{name:'Win battle',exact:true}).click();await page.getByRole('button',{name:'Continue the journey',exact:true}).click();
      await expect.poll(async()=>(await music(page)).mode,{timeout:6000}).toBe(saved.location.map);
    }
    await page.locator('#sound-button').click();expect((await music(page)).enabled).toBe(false);expect(errors).toEqual([]);
  });
}
for (const [device, viewport] of [['desktop', { width: 1280, height: 800 }], ['phone', { width: 390, height: 844 }]] as const) {
  test(`Chapter Four routes the live warden music and Sound control on ${device}`, async ({ page }) => {
    const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
    await page.setViewportSize(viewport); await page.goto('/');
    await expect(page).toHaveTitle(/Borrowed Tomorrow/);
    await page.evaluate(async () => {
      // Observe the real Audio instance without exposing a production debug API.
      // @ts-expect-error Vite serves this browser-only module.
      const { Audio }: typeof import('../../src/game/audio') = await import('/src/game/audio.ts');
      const original = Audio.prototype.setMode;
      Audio.prototype.setMode = function (mode) {
        const audio = this as unknown as { mode: string; pending: string; enabled: boolean; context?: AudioContext };
        (window as unknown as { musicStatus: () => unknown }).musicStatus = () => ({ mode: audio.mode, pending: audio.pending, enabled: audio.enabled, running: audio.context?.state === 'running' });
        original.call(this, mode);
      };
    });
    await importSave(page, brokenCheckpoint('sanctuaryEntered'));
    expect((await music(page)).enabled).toBe(false);
    await page.locator('#sound-button').click();
    await expect.poll(() => music(page)).toMatchObject({ mode: 'sanctuary', enabled: true, running: true });
    await approach(page, 'sanctuary-warden');
    await expect.poll(async () => (await inspect(page)).mode).toBe('battle');
    await expect.poll(async () => (await music(page)).mode, { timeout: 6000 }).toBe('four-warden');
    await capture(page, `warden-music-${device}`);
    await page.getByRole('button', { name: 'Win battle', exact: true }).click();
    await page.getByRole('button', { name: 'Continue the journey', exact: true }).click();
    await expect.poll(async () => (await music(page)).mode, { timeout: 6000 }).toBe('sanctuary');
    await page.locator('#sound-button').click(); expect((await music(page)).enabled).toBe(false);
    await page.locator('#sound-button').click(); expect((await music(page)).enabled).toBe(true);
    expect(errors).toEqual([]);
  });
}

test('@ci Iron Coast round bass keeps the tuned fundamental without a sub-octave or biting third partial',async({page})=>{
 await page.goto('/');
 const spectra=await page.evaluate(async()=>{
  // @ts-expect-error Vite serves the shared live instrument rack.
  const {Synth}:typeof import('../../src/game/synth')=await import('/src/game/synth.ts');
  const out=[];
  for(const instrument of ['bass','round-bass'] as const){
   const c=new OfflineAudioContext(1,2*22050,22050),synth=new Synth(c,c.destination);synth.note(instrument,'A2',.03,1.5,.2);
   const data=(await c.startRendering()).getChannelData(0),from=Math.round(.2*22050),length=22050;
   const amplitude=(hz:number)=>{let re=0,im=0;for(let n=0;n<length;n++){const w=.5-.5*Math.cos(2*Math.PI*n/(length-1)),a=2*Math.PI*hz*n/22050;re+=data[from+n]*w*Math.cos(a);im+=data[from+n]*w*Math.sin(a);}return Math.hypot(re,im)/length;};
   out.push({instrument,fundamental:amplitude(110),sub:amplitude(55),third:amplitude(330)});
  }
  return out;
 });
 const [ordinary,round]=spectra;
 expect(round.fundamental).toBeGreaterThan(.01);
 expect(round.sub/round.fundamental).toBeLessThan(.01);expect(round.third/round.fundamental).toBeLessThan(.01);
 expect(ordinary.sub/ordinary.fundamental).toBeGreaterThan(.15);expect(ordinary.third/ordinary.fundamental).toBeGreaterThan(.04);
});
