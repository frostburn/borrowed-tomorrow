import {test,expect} from '@playwright/test';

test('room decay and the Captain Alban phrase clear after the source stops',async({page})=>{
 await page.goto('/');
 const measured=await page.evaluate(async()=>{
  // @ts-expect-error Vite serves the actual production reverb.
  const {RoomReverb}:typeof import('../../src/game/room-reverb')=await import('/src/game/room-reverb.ts');
  // @ts-expect-error Use the real instrument envelopes and score.
  const {Synth}:typeof import('../../src/game/synth')=await import('/src/game/synth.ts');
  // @ts-expect-error The theme under review, including its held strings.
  const {performanceBar}:typeof import('../../src/game/score-performance')=await import('/src/game/score-performance.ts');
  // @ts-expect-error Review the same canonical room as the music workshop.
  const {TRACK_ROOMS}:typeof import('../../src/content/rooms')=await import('/src/content/rooms.ts');
  const rooms=[];
  for(const rate of [44100,48000])for(const id of ['ward','works','hall','cave','domain']as const){
   const c=new OfflineAudioContext(2,rate*7,rate),input=c.createGain(),room=new RoomReverb(c,input,c.destination);room.setRoom(id);
   const source=c.createBufferSource();source.buffer=c.createBuffer(1,1,rate);source.buffer.getChannelData(0)[0]=.3;source.connect(input);source.start(.5);
   const audio=await c.startRendering(),energy=new Float64Array(audio.length);let total=0;
   for(let ch=0;ch<2;ch++){const data=audio.getChannelData(ch);for(let i=Math.ceil(.501*rate);i<data.length;i++){energy[i]+=data[i]*data[i];total+=data[i]*data[i];}}
   // Exclude the direct impulse; normalize the tail so lowering wet alone cannot pass.
   let accumulated=0,t999=0,late=0;
   for(let i=Math.ceil(.501*rate);i<energy.length;i++){accumulated+=energy[i];if(!t999&&accumulated>=total*.999)t999=i/rate-.5;if(i>1.5*rate)late+=energy[i];}
   room.close();rooms.push({rate,id,total,t999,lateFraction:late/total});
  }
  const tracks=[];
  for(const rate of [44100,48000]){
   const c=new OfflineAudioContext(2,rate*6,rate),input=c.createGain(),room=new RoomReverb(c,input,c.destination),synth=new Synth(c,input);room.setRoom(TRACK_ROOMS.inspector);
   for(const n of performanceBar('inspector',0,{}).notes)synth.note(n.instrument,n.pitch,.4+n.time,n.seconds,n.velocity,n.pan,n.expression);
   synth.stop(2.4);const audio=await c.startRendering();let body=0,late=0;
   for(let ch=0;ch<2;ch++){const data=audio.getChannelData(ch);for(let i=rate;i<2*rate;i++)body+=data[i]*data[i]/rate;for(let i=Math.ceil(3.4*rate);i<4.4*rate;i++)late+=data[i]*data[i]/rate;}
   room.close();tracks.push({rate,body,lateRatio:late/body});
  }
  return{rooms,tracks};
 });
 const limits={ward:{seconds:.75,late:.002},works:{seconds:.65,late:.001},hall:{seconds:1.4,late:.02},cave:{seconds:1.15,late:.002},domain:{seconds:1.9,late:.1}};
 for(const r of measured.rooms){
  const label=`${r.id} at ${r.rate} Hz`,limit=limits[r.id];
  expect(r.total,label).toBeGreaterThan(1e-8);expect(r.t999,label).toBeGreaterThan(.2);
  expect(r.t999,label).toBeLessThan(limit.seconds);expect(r.lateFraction,label).toBeLessThan(limit.late);
 }
 for(const r of measured.tracks){expect(r.body,`${r.rate} Hz phrase`).toBeGreaterThan(1e-8);expect(r.lateRatio,`${r.rate} Hz Alban tail`).toBeLessThan(1e-5);}
});
