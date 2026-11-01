import {test,expect} from '@playwright/test';

test('retro rooms clear bass and treble tails independently of return volume',async({page},testInfo)=>{
 await page.goto('/');
 const rows=await page.evaluate(async()=>{
  // @ts-expect-error Vite serves the actual production feedback network.
  const {RoomReverb}:typeof import('../../src/game/room-reverb')=await import('/src/game/room-reverb.ts');
  // @ts-expect-error Production room profiles.
  const {ROOMS}:typeof import('../../src/content/rooms')=await import('/src/content/rooms.ts');
  const ids=Object.keys(ROOMS).filter(id=>id!=='dry')as Exclude<keyof typeof ROOMS,'dry'>[];
  const rows=[];
  for(const rate of [44100,48000])for(const id of ids)for(const hz of [82,110,165,220,330,400,700,1000,1600,2500,4000,6500]){
   const c=new OfflineAudioContext(2,rate*3,rate),input=c.createGain(),room=new RoomReverb(c,input,c.destination);room.setRoom(id);
   const tone=c.createOscillator(),env=c.createGain();tone.frequency.value=hz;tone.connect(env);env.connect(input);
   env.gain.setValueAtTime(0,.5);env.gain.linearRampToValueAtTime(.15,.51);env.gain.setValueAtTime(.15,.69);env.gain.linearRampToValueAtTime(0,.7);tone.start(.5);tone.stop(.71);
   const audio=await c.startRendering();
   for(let ch=0;ch<2;ch++){
    const d=audio.getChannelData(ch),start=Math.ceil(.72*rate);let total=0,late=0,sum=0,t999=0;
    for(let i=start;i<d.length;i++){total+=d[i]*d[i];if(i>1.2*rate)late+=d[i]*d[i];}
    for(let i=start;i<d.length;i++){sum+=d[i]*d[i];if(!t999&&sum>=total*.999)t999=i/rate-.7;}
    rows.push({id,rate,hz,ch,tail:total/rate,t999,lateFraction:late/total});
   }
   room.close();
  }
  return rows;
 });
 await testInfo.attach('retro-tone-decay',{body:JSON.stringify(rows,null,2),contentType:'application/json'});
 for(const r of rows){
  const label=JSON.stringify(r);
  // Audible reflections, with decay normalized separately for each channel.
  expect(r.tail,label).toBeGreaterThan(1e-10);expect(r.t999,label).toBeGreaterThan(.01);
  expect(r.t999,label).toBeLessThan(.65);expect(r.lateFraction,label).toBeLessThan(.01);
 }
});

test('retro rooms preserve midrange with gentle reflection damping',async({page},testInfo)=>{
 await page.goto('/');
 const rows=await page.evaluate(async()=>{
  // @ts-expect-error Measure the actual room return, excluding the unity dry impulse.
  const {RoomReverb}:typeof import('../../src/game/room-reverb')=await import('/src/game/room-reverb.ts');
  // @ts-expect-error Production room profiles.
  const {ROOMS}:typeof import('../../src/content/rooms')=await import('/src/content/rooms.ts');
  const ids=Object.keys(ROOMS).filter(id=>id!=='dry')as Exclude<keyof typeof ROOMS,'dry'>[];
  const rows=[];
  for(const rate of [44100,48000])for(const id of ids){
   const c=new OfflineAudioContext(2,rate*3,rate),input=c.createGain(),room=new RoomReverb(c,input,c.destination);room.setRoom(id);
   const source=c.createBufferSource();source.buffer=c.createBuffer(1,1,rate);source.buffer.getChannelData(0)[0]=.3;
   const amplitude=source.buffer.getChannelData(0)[0];source.connect(input);source.start(.5);
   const audio=await c.startRendering();
   for(let ch=0;ch<2;ch++){
    const wet=audio.getChannelData(ch).slice(rate*.5);wet[0]-=amplitude;
    const bands=[];
    for(const hz of [200,400,1000,2000]){
     let power=0;
     // Average a sixth-octave band: individual comb notches are not tilt.
     for(let bin=0;bin<31;bin++){
      const f=hz*2**((bin/30-.5)/6),angle=-2*Math.PI*f/rate,cr=Math.cos(angle),ci=Math.sin(angle);
      let re=0,im=0,zr=1,zi=0;
      for(const sample of wet){re+=sample*zr;im+=sample*zi;const next=zr*cr-zi*ci;zi=zr*ci+zi*cr;zr=next;}
      power+=(re*re+im*im)/(amplitude*amplitude*31);
     }
     bands.push({hz,db:10*Math.log10(power)});
    }
    rows.push({id,rate,ch,bands});
   }
   room.close();
  }
  return rows;
 });
 await testInfo.attach('retro-midrange-response',{body:JSON.stringify(rows,null,2),contentType:'application/json'});
 for(const r of rows){
  const label=JSON.stringify(r),gains=r.bands.map(b=>b.db);
  expect(Math.min(...gains),label).toBeGreaterThan(-32);
  expect(Math.max(...gains)-Math.min(...gains),label).toBeLessThan(3);
 }
});
