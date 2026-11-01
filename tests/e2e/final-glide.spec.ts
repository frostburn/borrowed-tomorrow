import {test,expect} from '@playwright/test';

// Detailed audio checks stay outside the small @ci set.
test('the mantle sine falls continuously with a quiet rubbing echo and cancels both voices',async({page},testInfo)=>{
 await page.goto('/');
 const result=await page.evaluate(async()=>{
  // @ts-expect-error Actual production rack and performed gestures.
  const {Synth}:typeof import('../../src/game/synth')=await import('/src/game/synth.ts');
  // @ts-expect-error Actual production rack and performed gestures.
  const {performanceBar}:typeof import('../../src/game/score-performance')=await import('/src/game/score-performance.ts');
  // @ts-expect-error Exact 31-EDO target frequency.
  const {pitchFrequency}:typeof import('../../src/game/tuning')=await import('/src/game/tuning.ts');
  const notes=performanceBar('benefactor',4).notes.filter(n=>n.instrument==='sine'),[lead,echo]=notes,rate=48000,when=.03;
  const render=async(voices:typeof notes,cancel?:number)=>{
   const end=Math.max(...notes.map(n=>n.time-lead.time+n.seconds+(n.expression?.release??0)))+when+.3;
   const c=new OfflineAudioContext(1,Math.ceil(end*rate),rate),synth=new Synth(c,c.destination);
   for(const n of voices)synth.note(n.instrument,n.pitch,when+n.time-lead.time,n.seconds,n.velocity,n.pan,n.expression);
   if(cancel!==undefined)synth.stop(cancel);
   return(await c.startRendering()).getChannelData(0);
  };
  const main=await render([lead]),reflected=await render([echo]),samples=[];
  const measure=(data:Float32Array,position:number)=>{
   const start=Math.ceil((when+lead.seconds*position-.04)*rate),end=Math.floor((when+lead.seconds*position+.04)*rate),crossings=[];let energy=0;
   for(let i=start;i<end;i++){energy+=data[i]*data[i];if(data[i-1]<=0&&data[i]>0)crossings.push(i-1-data[i-1]/(data[i]-data[i-1]));}
   return{hz:(crossings.length-1)*rate/(crossings.at(-1)!-crossings[0]),rms:Math.sqrt(energy/(end-start))};
  };
  for(const position of [.2,.5,.8]){
   const a=measure(main,position),b=measure(reflected,position),expected=pitchFrequency(lead.pitch)*2**(lead.expression!.bend![0][1]*(1-position)/1200);
   samples.push({position,actual:a.hz,expected,rms:a.rms,echoRatio:b.rms/a.rms,separation:1200*Math.log2(b.hz/a.hz)});
  }
  const tails=[];
  for(const stop of [when+.08,when+lead.seconds*.5]){
   const cancelled=await render(notes,stop);let late=0;
   for(let i=Math.ceil((stop+.04)*rate);i<cancelled.length;i++)late=Math.max(late,Math.abs(cancelled[i]));
   tails.push(late);
  }
  return{samples,tails};
 });
 await testInfo.attach('sine-glide-and-echo',{body:JSON.stringify(result,null,2),contentType:'application/json'});
 for(const s of result.samples){expect(s.actual/s.expected).toBeGreaterThan(.97);expect(s.actual/s.expected).toBeLessThan(1.03);expect(s.rms).toBeGreaterThan(.01);expect(s.echoRatio).toBeGreaterThan(.2);expect(s.echoRatio).toBeLessThan(.4);expect(s.separation).toBeGreaterThan(20);expect(s.separation).toBeLessThan(45);}
 for(const late of result.tails)expect(late).toBeLessThan(1e-8);
});
