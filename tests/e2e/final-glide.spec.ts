import {test,expect} from '@playwright/test';

// Detailed audio checks stay outside the small @ci set.
test('the mantle triangle glides continuously and stops its future bend on cancellation',async({page},testInfo)=>{
 await page.goto('/');
 const result=await page.evaluate(async()=>{
  // @ts-expect-error Actual production rack and performed gesture.
  const {Synth}:typeof import('../../src/game/synth')=await import('/src/game/synth.ts');
  // @ts-expect-error Actual production rack and performed gesture.
  const {performanceBar}:typeof import('../../src/game/score-performance')=await import('/src/game/score-performance.ts');
  // @ts-expect-error Exact 31-EDO target frequency.
  const {pitchFrequency}:typeof import('../../src/game/tuning')=await import('/src/game/tuning.ts');
  const n=performanceBar('benefactor',5).notes.find(n=>n.instrument==='triangle')!,rate=48000,when=.03;
  const render=async(cancel:boolean)=>{
   const c=new OfflineAudioContext(1,Math.ceil((n.seconds+.5)*rate),rate),synth=new Synth(c,c.destination);
   synth.note(n.instrument,n.pitch,when,n.seconds,n.velocity,n.pan,n.expression);
   if(cancel)synth.stop(when+n.seconds*.5);
   return(await c.startRendering()).getChannelData(0);
  };
  const data=await render(false),samples=[];
  for(const position of [.2,.5,.8]){
   const start=Math.ceil((when+n.seconds*position-.04)*rate),end=Math.floor((when+n.seconds*position+.04)*rate),crossings=[];let energy=0;
   for(let i=start;i<end;i++){energy+=data[i]*data[i];if(data[i-1]<=0&&data[i]>0)crossings.push(i-1-data[i-1]/(data[i]-data[i-1]));}
   const actual=(crossings.length-1)*rate/(crossings.at(-1)!-crossings[0]);
   const cents=n.expression!.bend![0][1]*(1-position),expected=pitchFrequency(n.pitch)*2**(cents/1200);
   samples.push({position,actual,expected,rms:Math.sqrt(energy/(end-start))});
  }
  const cancelled=await render(true);let late=0;
  for(let i=Math.ceil((when+n.seconds*.5+.04)*rate);i<cancelled.length;i++)late=Math.max(late,Math.abs(cancelled[i]));
  return{samples,late};
 });
 await testInfo.attach('triangle-glide',{body:JSON.stringify(result,null,2),contentType:'application/json'});
 for(const s of result.samples){expect(s.actual/s.expected).toBeGreaterThan(.97);expect(s.actual/s.expected).toBeLessThan(1.03);expect(s.rms).toBeGreaterThan(.01);}
 expect(result.late).toBeLessThan(1e-8);
});
