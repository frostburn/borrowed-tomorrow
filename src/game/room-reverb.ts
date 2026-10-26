import {ROOMS,type RoomId} from '../content/rooms';

export const ROOM_FADE=.28;
const delays=[.0137,.0199,.0311,.0437,.0613,.0899];

/** Damped Schroeder diffuser: H(z) = (L(z) z^-m - g) / (1 - g L(z) z^-m).
 * L is a nonresonant two-pole absorption filter on the delayed branch,
 * including its feedback. High frequencies lose energy on every reflection.
 * Every feedback cycle contains a fixed delay; |g| < 1. No oscillators,
 * convolution buffers, delay modulation or pitch-shifting room transitions. */
function diffuser(c:BaseAudioContext,input:AudioNode,seconds:number,g:number,damping:number,nodes:AudioNode[]){
 const sum=c.createGain(),delay=c.createDelay(1),feedback=c.createGain(),forward=c.createGain(),out=c.createGain();
 // Two real poles attenuate upper-register reflections on every pass. A
 // return-only lowpass cannot stop those notes circulating in a large room.
 const pole=Math.exp(-2*Math.PI*Math.min(damping,1800)/c.sampleRate),absorption=c.createIIRFilter([(1-pole)**2],[1,-2*pole,pole*pole]);
 delay.delayTime.value=seconds;feedback.gain.value=g;forward.gain.value=-g;
 input.connect(sum);sum.connect(delay);delay.connect(absorption);absorption.connect(feedback);feedback.connect(sum);
 sum.connect(forward);forward.connect(out);absorption.connect(out);
 nodes.push(sum,delay,absorption,feedback,forward,out);return out;
}

/** One immutable stereo room, shared by all incoming voices. */
function room(c:BaseAudioContext,input:AudioNode,output:AudioNode,id:RoomId,started:number){
 const p=ROOMS[id],send=c.createGain(),wet=c.createGain(),nodes:AudioNode[]=[send,wet];
 send.gain.value=0;send.channelCount=2;send.channelCountMode='explicit';wet.gain.value=p.wet;
 if(p.wet){
  input.connect(send);
  const split=c.createChannelSplitter(2),merge=c.createChannelMerger(2);nodes.push(split,merge);send.connect(split);
  for(let ch=0;ch<2;ch++){
   const channel=c.createGain();nodes.push(channel);split.connect(channel,ch);
   let end:AudioNode=channel;
   for(const [i,t]of delays.entries())end=diffuser(c,end,t*p.size*(ch?1.071+i*.009:1),p.feedback,p.damping,nodes);
   const filter=c.createBiquadFilter();filter.type='lowpass';filter.frequency.value=p.damping;filter.Q.value=.5;nodes.push(filter);
   end.connect(filter);filter.connect(merge,0,ch);
  }
  merge.connect(wet);wet.connect(output);
 }
 return {id,started,send,wet,close(){input.disconnect(send);for(const n of nodes)n.disconnect();}};
}
type Room=ReturnType<typeof room>;

/** At most two rooms coexist. Rapid changes queue only the newest request;
 * retiring graphs disconnect on the audio clock, including after suspension. */
export class RoomReverb {
 private current?:Room;
 private retiring?:Room;
 private requested:RoomId='dry';
 private cleanup?:AudioBufferSourceNode;
 private dry:GainNode;
 get activeRoom():RoomId{return this.current?.id??'dry';}
 constructor(private c:BaseAudioContext,private input:AudioNode,private output:AudioNode){
  this.dry=c.createGain();input.connect(this.dry);this.dry.connect(output);
 }
 setRoom(id:RoomId){
  this.requested=id;
  if(this.retiring||this.current?.id===id)return;
  const c=this.c,now=c.currentTime,previous=this.current;
  // A dry room has no feedback network to allocate or retire.
  this.current=id==='dry'?undefined:room(c,this.input,this.output,id,now);
  if(this.current){this.current.send.gain.setValueAtTime(0,now);this.current.send.gain.linearRampToValueAtTime(1,now+ROOM_FADE);}
  if(!previous)return;
  this.retiring=previous;
  // Anchor both ramps at now. A constant AudioParam with no scheduled event
  // can otherwise ramp from an earlier time and jump when automation is added.
  previous.send.gain.cancelAndHoldAtTime(now);
  previous.send.gain.setValueAtTime(Math.min(1,(now-previous.started)/ROOM_FADE),now);
  previous.send.gain.linearRampToValueAtTime(0,now+ROOM_FADE);
  previous.wet.gain.setValueAtTime(ROOMS[previous.id].wet,now);
  previous.wet.gain.linearRampToValueAtTime(0,now+ROOM_FADE);
  const clock=c.createBufferSource();clock.buffer=c.createBuffer(1,1,c.sampleRate);clock.connect(this.output);this.cleanup=clock;
  clock.onended=()=>{
   clock.disconnect();previous.close();this.retiring=undefined;this.cleanup=undefined;this.setRoom(this.requested);
  };
  clock.start(now+ROOM_FADE+.01);
 }
 close(){
  if(this.cleanup){this.cleanup.onended=null;this.cleanup.stop();this.cleanup.disconnect();this.cleanup=undefined;}
  this.current?.close();this.retiring?.close();this.current=this.retiring=undefined;
  this.input.disconnect(this.dry);this.dry.disconnect();
 }
}
