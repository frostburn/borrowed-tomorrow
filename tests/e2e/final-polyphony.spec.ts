import {test,expect} from '@playwright/test';

// Detailed audio checks stay outside the small @ci set.
test('the mantle counterphrases have audible independent layers and cancel future notes',async({page},testInfo)=>{
 await page.goto('/');
 const result=await page.evaluate(async()=>{
  // @ts-expect-error Actual production rack and performed phrases.
  const {Synth}:typeof import('../../src/game/synth')=await import('/src/game/synth.ts');
  // @ts-expect-error Actual production rack and performed phrases.
  const {performanceBar}:typeof import('../../src/game/score-performance')=await import('/src/game/score-performance.ts');
  const notes=[4,5].flatMap((bar,i)=>{const p=performanceBar('benefactor',bar);return p.notes.map(n=>({...n,time:n.time+i*p.duration}));});
  const groups=[{name:'theme',pan:.12},{name:'brass',pan:-.22},{name:'strings',pan:.24},{name:'inner organ',pan:.05}];
  const rate=22050,when=.03,seconds=8*60/132;
  const render=async(voices:typeof notes,cancel=false)=>{
   const c=new OfflineAudioContext(2,Math.ceil((seconds+1)*rate),rate),synth=new Synth(c,c.destination);
   for(const n of voices)synth.note(n.instrument,n.pitch,when+n.time,n.seconds,n.velocity,n.pan,n.expression);
   if(cancel)synth.stop(.18);
   return await c.startRendering();
  };
  const layerNotes=notes.filter(n=>Math.abs(n.pan)===.12||[-.22,.24,.05].includes(n.pan)),layers=[];
  for(const group of groups){
   const voices=layerNotes.filter(n=>group.name==='theme'?Math.abs(n.pan)===.12:n.pan===group.pan),audio=await render(voices);let sum=0,count=0;
   for(let ch=0;ch<2;ch++)for(const value of audio.getChannelData(ch).subarray(0,Math.floor(seconds*rate))){sum+=value*value;count++;}
   layers.push({name:group.name,rms:Math.sqrt(sum/count)});
  }
  const mix=await render(layerNotes),cancelled=await render(layerNotes,true);let peak=0,jump=0,late=0;
  for(let ch=0;ch<2;ch++){
   const d=mix.getChannelData(ch);for(let i=1;i<d.length;i++){peak=Math.max(peak,Math.abs(d[i]));jump=Math.max(jump,Math.abs(d[i]-d[i-1]));}
   for(const v of cancelled.getChannelData(ch).subarray(Math.ceil(.23*rate)))late=Math.max(late,Math.abs(v));
  }
  return{layers,peak,jump,late};
 });
 await testInfo.attach('mantle-polyphony',{body:JSON.stringify(result,null,2),contentType:'application/json'});
 for(const layer of result.layers)expect(layer.rms,layer.name).toBeGreaterThan(.001);
 expect(result.peak).toBeLessThan(.9);expect(result.jump).toBeLessThan(.25);expect(result.late).toBeLessThan(1e-8);
});
