import {test,expect} from '@playwright/test';

test('production room paths reach the master without passing through compression',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(async()=>{
  // @ts-expect-error Inspect the actual production mixer, not a copied graph.
  const {Audio}:typeof import('../../src/game/audio')=await import('/src/game/audio.ts');
  const c=new OfflineAudioContext(2,48000,48000),Native=window.AudioContext,connect=AudioNode.prototype.connect;
  const edges=new Map<AudioNode,AudioNode[]>(),compressors:DynamicsCompressorNode[]=[];
  const createCompressor=c.createDynamicsCompressor.bind(c);
  c.createDynamicsCompressor=()=>{const n=createCompressor();compressors.push(n);return n;};
  window.AudioContext=function(){return c;}as unknown as typeof AudioContext;
  AudioNode.prototype.connect=function(this:AudioNode,...args:unknown[]){
   if(this.context===c&&args[0] instanceof AudioNode){const targets=edges.get(this)??[];targets.push(args[0]);edges.set(this,targets);}
   return Reflect.apply(connect,this,args);
  }as typeof AudioNode.prototype.connect;
  const audio=new Audio(),rack=audio as unknown as {initialize():void;master:GainNode;musicGain:GainNode;reverb:{current:{send:GainNode};dry:GainNode;setRoom(id:'domain'):void;close():void}};
  try{rack.initialize();rack.reverb.setRoom('domain');}finally{window.AudioContext=Native;AudioNode.prototype.connect=connect;}
  const reaches=(start:AudioNode,target:AudioNode)=>{const seen=new Set<AudioNode>(),pending=[start];while(pending.length){const n=pending.pop()!;if(n===target)return true;if(seen.has(n))continue;seen.add(n);pending.push(...edges.get(n)??[]);}return false;};
  const result={compressors:compressors.length,inputCompressed:reaches(rack.musicGain,compressors[0]),wetReachesMaster:reaches(rack.reverb.current.send,rack.master),dryReachesMaster:reaches(rack.reverb.dry,rack.master),wetCompressed:reaches(rack.reverb.current.send,compressors[0]),dryCompressed:reaches(rack.reverb.dry,compressors[0])};
  rack.reverb.close();return result;
 });
 expect(result).toEqual({compressors:1,inputCompressed:true,wetReachesMaster:true,dryReachesMaster:true,wetCompressed:false,dryCompressed:false});
});

test('the full mixer keeps headroom with boss music and overlapping combat effects',async({page},testInfo)=>{
 await page.goto('/');
 const results=await page.evaluate(async()=>{
  // @ts-expect-error Exercise production mixer and compression settings.
  const {Audio}:typeof import('../../src/game/audio')=await import('/src/game/audio.ts');
  // @ts-expect-error Preserve the actual played note timings and expression.
  const {performanceBar,scoreTime}:typeof import('../../src/game/score-performance')=await import('/src/game/score-performance.ts');
  // @ts-expect-error Canonical campaign/workshop rooms and meters.
  const {ARRANGEMENTS}:typeof import('../../src/game/score')=await import('/src/game/score.ts');
  // @ts-expect-error Canonical room profiles.
  const {TRACK_ROOMS}:typeof import('../../src/content/rooms')=await import('/src/content/rooms.ts');
  const rows=[];
  for(const [mode,start]of [['five-furnace',8],['benefactor',26],['hollow-sun',26],['unborrowed',26]]as const){
   const rate=48000,beats=ARRANGEMENTS[mode].beats,reference=scoreTime(mode,(start-4)*beats),begin=scoreTime(mode,start*beats)-reference,end=scoreTime(mode,(start+8)*beats)-reference;
   const c=new OfflineAudioContext(2,Math.ceil((end+3)*rate),rate),Native=window.AudioContext;
   window.AudioContext=function(){return c;}as unknown as typeof AudioContext;
   const audio=new Audio(),rack=audio as unknown as {initialize():void;master:GainNode;music:import('../../src/game/synth').Synth;effects:import('../../src/game/synth').Synth;reverb:{setRoom(id:typeof TRACK_ROOMS[typeof mode]):void;close():void}};
   try{rack.initialize();}finally{window.AudioContext=Native;}
   rack.master.gain.value=.75;rack.reverb.setRoom(TRACK_ROOMS[mode]);
   for(let bar=start-4;bar<start+8;bar++)for(const n of performanceBar(mode,bar).notes)rack.music.note(n.instrument,n.pitch,.03+scoreTime(mode,bar*beats)-reference+n.time,n.seconds,n.velocity,n.pan,n.expression);
   for(let time=begin+.4;time<end;time+=2){rack.effects.effect('burst',time);rack.effects.effect('steam',time+.15);rack.effects.effect('strike',time+.3);}
   const audioBuffer=await c.startRendering();let peak=0,jump=0,energy=0,count=0;
   for(let ch=0;ch<2;ch++){const data=audioBuffer.getChannelData(ch);for(let i=Math.ceil((begin+.03)*rate);i<data.length;i++){const v=data[i];if(!Number.isFinite(v))throw Error('Non-finite audio');peak=Math.max(peak,Math.abs(v));jump=Math.max(jump,Math.abs(v-data[i-1]));energy+=v*v;count++;}}
   rack.reverb.close();rows.push({mode,peak,jump,rms:Math.sqrt(energy/count)});
  }
  return rows;
 });
 await testInfo.attach('full-mixer-levels',{body:JSON.stringify(results,null,2),contentType:'application/json'});
 for(const r of results){expect(r.peak,JSON.stringify(r)).toBeLessThan(.95);expect(r.jump,JSON.stringify(r)).toBeLessThan(.25);expect(r.rms).toBeGreaterThan(.005);}
});
