import {expect,it,vi} from 'vitest';
import {Audio,AUDIO_OUTPUT_GAIN} from '../src/game/audio';

it('boosts output after the room while preserving incoming levels, volume control and mute',()=>{
 type Node={targets:Node[];connect:(target:Node)=>void;gain:{value:number;setTargetAtTime:ReturnType<typeof vi.fn>}};
 const nodes:Node[]=[],compressors:Node[]=[];
 const node=()=>{const n:Node={targets:[],connect(t){this.targets.push(t);},gain:{value:1,setTargetAtTime:vi.fn()}};nodes.push(n);return n;};
 const context={currentTime:4,sampleRate:48000,destination:node(),createGain:node,
  createBuffer:(_channels:number,length:number)=>({getChannelData:()=>new Float32Array(length)}),
  createDynamicsCompressor:()=>{const n={...node(),threshold:{value:0},knee:{value:0},ratio:{value:0},attack:{value:0},release:{value:0}};compressors.push(n);return n;},
 };
 vi.stubGlobal('AudioContext',function(){return context;});
 try{
  const audio=new Audio(),rack=audio as unknown as {initialize():void;master:Node;musicGain:Node;effects:{output:Node}};rack.initialize();
  const boost=nodes.find(n=>n.targets.includes(rack.master))!;
  expect(boost.gain.value).toBe(AUDIO_OUTPUT_GAIN);expect(AUDIO_OUTPUT_GAIN).toBeGreaterThan(1);
  const reaches=(from:Node,to:Node):boolean=>from===to||from.targets.some(t=>reaches(t,to));
  expect(compressors).toHaveLength(1);expect(reaches(compressors[0],boost)).toBe(true);expect(reaches(boost,compressors[0])).toBe(false);
  expect(rack.musicGain.gain.value).toBe(.52);expect(rack.effects.output.gain.value).toBe(.58);expect(rack.master.gain.value).toBe(0);
  audio.enabled=true;audio.setVolume(.25);expect(rack.master.gain.setTargetAtTime).toHaveBeenLastCalledWith(.25,4,.025);
  audio.setVolume(0);expect(rack.master.gain.setTargetAtTime).toHaveBeenLastCalledWith(0,4,.025);
  audio.setVolume(5);expect(rack.master.gain.setTargetAtTime).toHaveBeenLastCalledWith(1,4,.025);
  audio.cinematicMix(.4);expect(rack.musicGain.gain.setTargetAtTime).toHaveBeenLastCalledWith(.52*.4,4,.06);
  expect(boost.gain.value).toBe(AUDIO_OUTPUT_GAIN);
 }finally{vi.unstubAllGlobals();}
});
