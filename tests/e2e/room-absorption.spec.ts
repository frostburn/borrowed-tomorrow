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

test('isolated upper-register notes clear quickly in large rooms without losing the low room tail',async({page})=>{
 await page.goto('/');
 const rows=await page.evaluate(async()=>{
  // @ts-expect-error Probe the actual production graph with treble-only sources.
  const {RoomReverb}:typeof import('../../src/game/room-reverb')=await import('/src/game/room-reverb.ts');
  const rows=[];
  for(const rate of [44100,48000])for(const id of ['court','hall','domain']as const)for(const hz of [400,1600,2500,4000,6500]){
   const c=new OfflineAudioContext(2,rate*4,rate),input=c.createGain(),room=new RoomReverb(c,input,c.destination);room.setRoom(id);
   const tone=c.createOscillator(),env=c.createGain();tone.frequency.value=hz;tone.connect(env);env.connect(input);
   env.gain.setValueAtTime(0,.5);env.gain.linearRampToValueAtTime(.15,.51);env.gain.setValueAtTime(.15,.69);env.gain.linearRampToValueAtTime(0,.7);tone.start(.5);tone.stop(.71);
   const audio=await c.startRendering(),energy=new Float64Array(audio.length);let total=0,late=0,t999=0,accumulated=0;
   for(let ch=0;ch<2;ch++){const d=audio.getChannelData(ch);for(let i=Math.ceil(.72*rate);i<d.length;i++){energy[i]+=d[i]*d[i];total+=d[i]*d[i];if(i>1.2*rate)late+=d[i]*d[i];}}
   for(let i=Math.ceil(.72*rate);i<energy.length;i++){accumulated+=energy[i];if(!t999&&accumulated>=total*.999)t999=i/rate-.7;}
   room.close();rows.push({id,rate,hz,total:total/rate,late:late/rate,lateFraction:late/total,t999});
  }return rows;
 });
 for(const r of rows){
  const label=JSON.stringify(r);expect(r.total,label).toBeGreaterThan(0);
  if(r.hz===400){expect(r.total,label).toBeGreaterThan(1e-6);if(r.id==='domain')expect(r.t999,label).toBeGreaterThan(1);continue;}
  // Normalized decay cannot be fixed just by turning the wet return down.
  expect(r.t999,label).toBeLessThan(r.hz===1600?.9:r.hz===2500?.65:.5);
  expect(r.lateFraction,label).toBeLessThan(r.hz===1600?.18:r.hz===2500?.005:.001);
  const low=rows.find(low=>low.id===r.id&&low.rate===r.rate&&low.hz===400)!;
  expect(r.late,label).toBeLessThan(low.late*.01);
 }
});

test('Engine hall clears isolated bass and midrange notes without muting the room',async({page},testInfo)=>{
 await page.goto('/');
 const rows=await page.evaluate(async()=>{
  // @ts-expect-error Measure the production room, including its feedback network.
  const {RoomReverb}:typeof import('../../src/game/room-reverb')=await import('/src/game/room-reverb.ts');
  const rows=[];
  for(const rate of [44100,48000])for(const hz of [82,110,165,220,330,440,550,660,700,880,1000,1320,1600]){
   const c=new OfflineAudioContext(2,rate*3,rate),input=c.createGain(),room=new RoomReverb(c,input,c.destination);room.setRoom('works');
   const tone=c.createOscillator(),env=c.createGain();tone.frequency.value=hz;tone.connect(env);env.connect(input);
   env.gain.setValueAtTime(0,.5);env.gain.linearRampToValueAtTime(.15,.51);env.gain.setValueAtTime(.15,.69);env.gain.linearRampToValueAtTime(0,.7);tone.start(.5);tone.stop(.71);
   const audio=await c.startRendering(),energy=new Float64Array(audio.length);let total=0,late=0,t999=0,sum=0;
   for(let ch=0;ch<2;ch++){const d=audio.getChannelData(ch);for(let i=Math.ceil(.72*rate);i<d.length;i++){energy[i]+=d[i]*d[i];total+=d[i]*d[i];if(i>1.2*rate)late+=d[i]*d[i];}}
   for(let i=Math.ceil(.72*rate);i<energy.length;i++){sum+=energy[i];if(!t999&&sum>=total*.999)t999=i/rate-.7;}
   room.close();rows.push({rate,hz,tail:total/rate,lateFraction:late/total,t999});
  }
  return rows;
 });
 await testInfo.attach('engine-hall-decay',{body:JSON.stringify(rows,null,2),contentType:'application/json'});
 for(const r of rows){
  const label=JSON.stringify(r);
  // Keep a real room return, and measure its shape independently of wet volume.
  expect(r.tail,label).toBeGreaterThan(1e-8);expect(r.t999,label).toBeGreaterThan(.1);
  expect(r.t999,label).toBeLessThan(.65);expect(r.lateFraction,label).toBeLessThan(.005);
 }
});
