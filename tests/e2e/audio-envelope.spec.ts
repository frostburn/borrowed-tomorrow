import {test,expect} from '@playwright/test';

// Render the real rack: checking scheduled parameter calls alone misses the
// quiet bursts from cancelled future notes and the final nonzero sample.
test('cancelled queued instruments remain silent, while a new arrangement still plays',async({page})=>{
 await page.goto('/');
 const results=await page.evaluate(async()=>{
  // @ts-expect-error Vite serves the actual campaign/workshop synth.
  const {Synth}:typeof import('../../src/game/synth')=await import('/src/game/synth.ts');
  const results=[];
  for(const instrument of ['keys','strings','reed','bell','bass','round-bass','kick','snare','hat'] as const){
   const rate=48000,c=new OfflineAudioContext(2,rate*2,rate),synth=new Synth(c,c.destination);
   // Mimic seeking/stopping just before any of several queued note starts,
   // including starts inside the old 60ms release and its 10ms stop margin.
   for(const offset of [.0001,.007,.02,.04,.055,.06,.065,.1])synth.note(instrument,'E4',.5+offset,.4,.22);
   synth.release(.5);
   synth.note('keys','C5',1.1,.4,.2);
   const rendered=await c.startRendering();let cancelledPeak=0,incomingPeak=0;
   for(let channel=0;channel<2;channel++){
    const data=rendered.getChannelData(channel);
    for(let i=0;i<rate;i++)cancelledPeak=Math.max(cancelledPeak,Math.abs(data[i]));
    for(let i=Math.floor(1.1*rate);i<data.length;i++)incomingPeak=Math.max(incomingPeak,Math.abs(data[i]));
   }
   results.push({instrument,cancelledPeak,incomingPeak});
  }
  return results;
 });
 for(const result of results){expect(result.cancelledPeak,result.instrument).toBe(0);expect(result.incomingPeak,result.instrument).toBeGreaterThan(.01);}
});

test('natural note endings and scheduled stops fade to zero before source cutoff at both device rates',async({page})=>{
 await page.goto('/');
 const results=await page.evaluate(async()=>{
  // @ts-expect-error Vite serves the actual campaign/workshop synth.
  const {Synth}:typeof import('../../src/game/synth')=await import('/src/game/synth.ts');
  const results=[];
  for(const rate of [44100,48000])for(const stopped of [false,true]){
   const c=new OfflineAudioContext(2,rate,rate),synth=new Synth(c,c.destination),cutoff=stopped?.5177:.03+.2+.06+.01;
   synth.tone(137,.03,stopped?2:.2,.3);
   if(stopped)synth.stop(cutoff);
   const rendered=await c.startRendering();let edgeJump=0,tailPeak=0,bodyPeak=0;
   for(let channel=0;channel<2;channel++){
    const data=rendered.getChannelData(channel),end=Math.ceil(cutoff*rate);
    for(let i=end-5;i<=end+5;i++)edgeJump=Math.max(edgeJump,Math.abs(data[i]-data[i-1]));
    for(let i=end;i<data.length;i++)tailPeak=Math.max(tailPeak,Math.abs(data[i]));
    for(let i=Math.floor(.04*rate);i<Math.floor(.15*rate);i++)bodyPeak=Math.max(bodyPeak,Math.abs(data[i]));
   }
   results.push({rate,stopped,edgeJump,tailPeak,bodyPeak});
  }
  return results;
 });
 for(const result of results){
  expect(result.bodyPeak).toBeGreaterThan(.05);
  expect(result.edgeJump/result.bodyPeak,JSON.stringify(result)).toBeLessThan(.01);
  expect(result.tailPeak,JSON.stringify(result)).toBe(0);
 }
});

test('overdue notes get a fresh attack instead of jumping into a partially elapsed envelope',async({page})=>{
 await page.goto('/');
 const results=await page.evaluate(async()=>{
  // @ts-expect-error Vite serves the actual campaign/workshop synth.
  const {Synth}:typeof import('../../src/game/synth')=await import('/src/game/synth.ts');
  const results=[];
  for(const voice of ['tone','keys','strings','noise'] as const){
   const rate=48000,c=new OfflineAudioContext(1,Math.ceil(rate*1.5),rate),synth=new Synth(c,c.destination);
   const suspended=c.suspend(.5),rendered=c.startRendering();await suspended;const now=c.currentTime;
   // Simulate a main-thread stall after the scheduler chose the onset.
   if(voice==='tone')synth.tone(137,.2,.8,.3);
   else if(voice==='noise')synth.noise(.2,.8,.3,1700);
   else synth.note(voice,'E4',.2,.8,.3);
   await c.resume();const data=(await rendered).getChannelData(0);
   let early=0,body=0;
   for(let i=Math.ceil(now*rate);i<Math.ceil((now+.001)*rate);i++)early=Math.max(early,Math.abs(data[i]));
   for(let i=Math.ceil((now+.02)*rate);i<Math.ceil((now+.15)*rate);i++)body=Math.max(body,Math.abs(data[i]));
   results.push({voice,early,body});
  }
  return results;
 });
 for(const result of results){expect(result.body,result.voice).toBeGreaterThan(.005);expect(result.early,result.voice).toBeLessThan(result.body*.4);}
});
