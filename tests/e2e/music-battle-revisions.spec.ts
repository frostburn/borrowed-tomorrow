import {test,expect} from '@playwright/test';

test('held bells lose upper colour independently of hold length while retaining a quiet body',async({page},testInfo)=>{
 await page.goto('/');
 const results=await page.evaluate(async()=>{
  // @ts-expect-error Use the exact live rack, not a replacement oscillator model.
  const {Synth}:typeof import('../../src/game/synth')=await import('/src/game/synth.ts');
  const results=[];
  for(const rate of [44100,48000])for(const duration of [4,8]){
   const c=new OfflineAudioContext(2,Math.ceil((duration+1)*rate),rate),bus=c.createGain(),hp=c.createBiquadFilter(),merger=c.createChannelMerger(2);
   hp.type='highpass';hp.frequency.value=900;hp.Q.value=.707;
   bus.connect(merger,0,0);bus.connect(hp);hp.connect(merger,0,1);merger.connect(c.destination);
   new Synth(c,bus).note('bell','C4',.03,duration,.2);
   const buffer=await c.startRendering(),rms=(ch:number,from:number,to:number)=>{const data=buffer.getChannelData(ch);let sum=0;for(let i=Math.ceil(from*rate);i<Math.floor(to*rate);i++)sum+=data[i]**2;return Math.sqrt(sum/((to-from)*rate));};
   const brightness=(from:number,to:number)=>rms(1,from,to)/rms(0,from,to);
   results.push({rate,duration,attack:brightness(.06,.2),middle:brightness(.7,.9),late:brightness(2.2,2.4),body:rms(0,2.2,2.4),silence:rms(0,duration+.8,duration+.98)});
  }
  return results;
 });
 await testInfo.attach('bell-brightness-decay',{body:JSON.stringify(results,null,2),contentType:'application/json'});
 for(const r of results){expect(r.middle,JSON.stringify(r)).toBeLessThan(r.attack);expect(r.late,JSON.stringify(r)).toBeLessThan(r.attack*.65);expect(r.body).toBeGreaterThan(.01);expect(r.silence).toBe(0);}
 for(const rate of [44100,48000]){const pair=results.filter(r=>r.rate===rate);expect(pair[1].late/pair[0].late).toBeCloseTo(1,1);}
});

test('square bass has odd harmonics at the written 31-EDO fundamental without a sub-octave',async({page},testInfo)=>{
 await page.goto('/');const result=await page.evaluate(async()=>{
  // @ts-expect-error The same instrument and tuning are used in the campaign.
  const {Synth}:typeof import('../../src/game/synth')=await import('/src/game/synth.ts');
  // @ts-expect-error Retain the score's exact 31-EDO pitch.
  const {pitchFrequency}:typeof import('../../src/game/tuning')=await import('/src/game/tuning.ts');
  const rate=48000,c=new OfflineAudioContext(1,rate*2,rate);new Synth(c,c.destination).note('square-bass','G2',.03,.8,.2);
  const data=(await c.startRendering()).getChannelData(0),hz=pitchFrequency('G2');
  const magnitude=(frequency:number)=>{let re=0,im=0,weight=0;const from=Math.ceil(.15*rate),end=Math.floor(.55*rate);for(let i=from;i<end;i++){const w=.5-.5*Math.cos(2*Math.PI*(i-from)/(end-from-1));re+=w*data[i]*Math.cos(2*Math.PI*frequency*i/rate);im+=w*data[i]*Math.sin(2*Math.PI*frequency*i/rate);weight+=w;}return 2*Math.hypot(re,im)/weight;};
  return {fundamental:magnitude(hz),third:magnitude(hz*3),second:magnitude(hz*2),sub:magnitude(hz/2),tail:Math.max(...data.slice(rate*1.1,rate*1.2).map(Math.abs))};
 });
 await testInfo.attach('square-bass-partials',{body:JSON.stringify(result,null,2),contentType:'application/json'});
 expect(result.fundamental).toBeGreaterThan(.04);expect(result.third/result.fundamental).toBeGreaterThan(.15);expect(result.second/result.fundamental).toBeLessThan(.02);expect(result.sub/result.fundamental).toBeLessThan(.02);expect(result.tail).toBe(0);
});

test('revised battle themes and Mirrored Ward render full forms and loop seams cleanly',async({page},testInfo)=>{
 await page.goto('/');const results=await page.evaluate(async()=>{
  // @ts-expect-error Render the actual performed score, including long held bells.
  const {performanceBar,scoreTime}:typeof import('../../src/game/score-performance')=await import('/src/game/score-performance.ts');
  // @ts-expect-error Real campaign arrangements.
  const {ARRANGEMENTS,scoreLength}:typeof import('../../src/game/score')=await import('/src/game/score.ts');
  // @ts-expect-error Real shared synth.
  const {Synth}:typeof import('../../src/game/synth')=await import('/src/game/synth.ts');
  const out=[],rate=22050;
  for(const mode of ['coast-battle','petra-battle','five-furnace','mirrorward']as const){
   const beats=ARRANGEMENTS[mode].beats,bars=scoreLength(mode)+2,start=scoreTime(mode,-beats),seconds=scoreTime(mode,(bars-1)*beats)-start;
   const c=new OfflineAudioContext(2,Math.ceil((seconds+3)*rate),rate),gain=c.createGain();gain.gain.value=.52;gain.connect(c.destination);const synth=new Synth(c,gain);
   for(let bar=-1;bar<bars-1;bar++)for(const n of performanceBar(mode,bar).notes)synth.note(n.instrument,n.pitch,.03+scoreTime(mode,bar*beats)-start+n.time,n.seconds,n.velocity,n.pan,n.expression);
   const buffer=await c.startRendering();let peak=0,jump=0,sum=0,count=0;
   for(let ch=0;ch<2;ch++){const data=buffer.getChannelData(ch);for(let i=Math.ceil(-start*rate);i<seconds*rate;i++){const v=data[i];if(!Number.isFinite(v))throw Error('Non-finite audio');peak=Math.max(peak,Math.abs(v));jump=Math.max(jump,Math.abs(v-data[i-1]));sum+=v*v;count++;}}
   out.push({mode,peak,jump,rms:Math.sqrt(sum/count)});
  }return out;
 });
 await testInfo.attach('revised-full-loop-levels',{body:JSON.stringify(results,null,2),contentType:'application/json'});
 for(const r of results){expect(r.peak,JSON.stringify(r)).toBeLessThan(.9);expect(r.jump,JSON.stringify(r)).toBeLessThan(.25);expect(r.rms).toBeGreaterThan(.005);}
});

for(const [device,viewport,deviceScaleFactor]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const)test.describe(`revised music review ${device}`,()=>{
 test.use({viewport,deviceScaleFactor});
 test('square bass auditions alone and the revised battle tempi are shown',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('/?dev=music');await expect(page).toHaveTitle(/Borrowed Tomorrow/);await expect(page).toHaveURL(/dev=music/);
  await page.getByRole('button',{name:'Ch 5',exact:true}).click();await page.locator('[data-cue="five-furnace"]').click();await expect(page.locator('.music-review .music-description').first()).toContainText('136 BPM / 4/4');
  const parts=page.getByRole('group',{name:'Instrument audition'});await parts.getByRole('button',{name:'Bass',exact:true}).click();await expect(page.locator('#music-notes tbody')).toContainText('square-bass');
  await parts.getByRole('button',{name:'Square bass',exact:true}).click();await expect(page.locator('#music-notes tbody tr')).toHaveCount(8);
  await page.evaluate(async()=>{
   // @ts-expect-error Observe real scheduling without a production debug API.
   const {Synth}:typeof import('../../src/game/synth')=await import('/src/game/synth.ts');
   const observed=window as unknown as {auditionVoices:string[]};observed.auditionVoices=[];const real=Synth.prototype.note;
   Synth.prototype.note=function(...args){observed.auditionVoices.push(args[0]);real.apply(this,args);};
  });
  await page.getByRole('button',{name:'Play',exact:true}).click();await expect.poll(()=>page.evaluate(()=>(window as unknown as {auditionVoices:string[]}).auditionVoices.length)).toBeGreaterThan(0);
  expect(await page.evaluate(()=>(window as unknown as {auditionVoices:string[]}).auditionVoices.every(v=>v==='square-bass'))).toBe(true);
  await page.getByRole('button',{name:'Stop',exact:true}).click();await page.getByRole('button',{name:'Ch 2',exact:true}).click();await page.locator('[data-cue="petra-battle"]').click();await expect(page.locator('.music-review .music-description').first()).toContainText('132 BPM / 4/4');
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 });
});
