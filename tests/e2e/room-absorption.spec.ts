import {test,expect} from '@playwright/test';

test('room reflections absorb treble instead of sustaining a bright shimmer',async({page})=>{
 await page.goto('/');
 const rows=await page.evaluate(async()=>{
  // @ts-expect-error Render the production graph in a native audio context.
  const {RoomReverb}:typeof import('../../src/game/room-reverb')=await import('/src/game/room-reverb.ts');
  const rows=[];
  for(const rate of [44100,48000])for(const hz of [400,4000]){
   const c=new OfflineAudioContext(2,rate*3,rate),input=c.createGain(),room=new RoomReverb(c,input,c.destination);room.setRoom('court');
   const source=c.createOscillator(),envelope=c.createGain();source.frequency.value=hz;source.connect(envelope);envelope.connect(input);
   envelope.gain.setValueAtTime(0,.5);envelope.gain.linearRampToValueAtTime(.15,.51);envelope.gain.setValueAtTime(.15,.69);envelope.gain.linearRampToValueAtTime(0,.7);source.start(.5);source.stop(.71);
   const audio=await c.startRendering();let tail=0,late=0;
   for(let ch=0;ch<2;ch++){const data=audio.getChannelData(ch);for(let i=Math.ceil(.72*rate);i<data.length;i++){tail+=data[i]*data[i]/rate;if(i>1.2*rate)late+=data[i]*data[i]/rate;}}
   room.close();rows.push({rate,hz,tail,late});
  }
  return rows;
 });
 for(const rate of [44100,48000]){
  const low=rows.find(r=>r.rate===rate&&r.hz===400)!,high=rows.find(r=>r.rate===rate&&r.hz===4000)!;
  expect(low.tail).toBeGreaterThan(1e-9);
  expect(high.tail,JSON.stringify(rows)).toBeLessThan(low.tail*.1);
  expect(high.late,JSON.stringify(rows)).toBeLessThan(low.late*.05);
 }
});
