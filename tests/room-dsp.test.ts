import {expect,it,vi,type Mock} from 'vitest';
import {ROOMS} from '../src/content/rooms';
import {ROOM_DELAYS,reflectionCoefficients} from '../src/game/room-dsp';
import {RoomReverb} from '../src/game/room-reverb';

it('uses passive unity-DC one-pole reflection loss for every preset at both device rates',()=>{
 for(const rate of [44100,48000])for(const p of Object.values(ROOMS)){
  const {feedforward:b,feedback:a}=reflectionCoefficients(rate,p.damping);
  expect(b).toHaveLength(1);expect(a).toHaveLength(2);
  expect(b[0]/(a[0]+a[1])).toBeCloseTo(1,12);
  expect(Math.abs(a[1])).toBeLessThan(1);
  for(const hz of [200,400,1000,2000,6500,rate/2]){
   const w=2*Math.PI*hz/rate,magnitude=b[0]/Math.hypot(1+a[1]*Math.cos(w),a[1]*Math.sin(w));
   expect(magnitude).toBeLessThanOrEqual(1+1e-12);
   if(hz<=2000)expect(magnitude).toBeGreaterThan(.95);
  }
 }
});

it('allocates four fixed delays and four one-pole filters, keeps dry direct, and disconnects the room',()=>{
 const nodes:{connect:Mock;disconnect:Mock}[]=[];
 // Only graph construction is mocked; native rendering lives in the opt-in suite.
 const node=()=>{const n={connect:vi.fn(),disconnect:vi.fn(),gain:{value:1,setValueAtTime:vi.fn(),linearRampToValueAtTime:vi.fn()}};nodes.push(n);return n;};
 const delays:number[]=[],coefficients:number[][]=[];
 const context={sampleRate:48000,currentTime:0,createGain:node,createChannelSplitter:node,createChannelMerger:node,
  createDelay:()=>({...node(),delayTime:{set value(seconds:number){delays.push(seconds);}}}),
  createIIRFilter:(b:number[],a:number[])=>{coefficients.push(a);expect(b).toHaveLength(1);return node();},
 }as unknown as BaseAudioContext;
 const input=node(),output=node(),room=new RoomReverb(context,input as unknown as AudioNode,output as unknown as AudioNode);
 const dry=nodes[2];expect(input.connect).toHaveBeenCalledWith(dry);expect(dry.connect).toHaveBeenCalledWith(output);
 room.setRoom('domain');expect(delays).toHaveLength(4);expect(coefficients).toHaveLength(4);
 const expected=[ROOM_DELAYS[0]*ROOMS.domain.size,ROOM_DELAYS[1]*ROOMS.domain.size,ROOM_DELAYS[0]*ROOMS.domain.size*1.071,ROOM_DELAYS[1]*ROOMS.domain.size*1.08];
 delays.forEach((seconds,i)=>expect(seconds).toBeCloseTo(expected[i],12));
 for(const a of coefficients)expect(a).toHaveLength(2);
 room.close();for(const n of nodes.slice(2))expect(n.disconnect).toHaveBeenCalledOnce();
});
