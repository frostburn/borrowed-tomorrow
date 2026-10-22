import type { MapId } from '../rules/state';
import { ARRANGEMENTS, scoreBar, type Instrument, type MusicMode } from './score';
import { Synth, type Effect } from './synth';

/** Bar-aligned arrangement changes and look-ahead timing, independent of frame rate. */
export class Audio {
  private context?:AudioContext;
  private master?:GainNode;
  private music?:Synth;
  private musicGain?:GainNode;
  private cinematicLevel=1;
  private effects?:Synth;
  private timer?:number;
  private next=0;
  private bar=0;
  private mode:MusicMode='station';
  private pending:MusicMode='station';
  private generation=0;
  private instruments?:readonly Instrument[];
  private volume=.75;
  private history:{mode:MusicMode;bar:number;start:number;beat:number;beats:number}[]=[];
  private steps=0;
  private lastStep=-1;
  enabled=false;
  private initialize(){
    const c=new AudioContext();this.context=c;
    const master=c.createGain(),compressor=c.createDynamicsCompressor(),music=c.createGain(),fx=c.createGain();
    this.master=master;this.musicGain=music;master.gain.value=0;music.gain.value=.52*this.cinematicLevel;fx.gain.value=.58;
    compressor.threshold.value=-12;compressor.knee.value=9;compressor.ratio.value=4;compressor.attack.value=.005;compressor.release.value=.2;
    music.connect(compressor);fx.connect(compressor);compressor.connect(master);master.connect(c.destination);
    // A quiet stereo room tail: no downloaded samples and no per-note reverbs.
    const room=c.createConvolver(),wet=c.createGain();wet.gain.value=.16;
    const impulse=c.createBuffer(2,Math.floor(c.sampleRate*.85),c.sampleRate);let seed=731;
    for(let ch=0;ch<2;ch++){const data=impulse.getChannelData(ch);for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;data[i]=((seed>>>0)/2147483648-1)*(1-i/data.length)**3*.4;}}
    room.buffer=impulse;music.connect(room);room.connect(wet);wet.connect(compressor);
    this.music=new Synth(c,music);this.effects=new Synth(c,fx);
  }
  async toggle():Promise<boolean>{
    if(this.enabled)this.pause();else await this.play(this.pending);
    return this.enabled;
  }
  async play(mode:MusicMode,bar=0,instruments?:readonly Instrument[]){
    if(!Number.isInteger(bar)||bar<0)throw new Error('Invalid score bar.');
    const generation=++this.generation;
    if(!this.context)this.initialize();const c=this.context!;await c.resume();if(generation!==this.generation)return;
    this.music!.release(c.currentTime);this.mode=this.pending=mode;this.bar=bar;this.instruments=instruments;
    this.history=[];this.next=c.currentTime+.045;this.enabled=true;
    this.master!.gain.setTargetAtTime(this.volume,c.currentTime,.025);this.schedule();
    if(!this.timer)this.timer=window.setInterval(()=>this.schedule(),25);
  }
  pause(){
    this.generation++;this.enabled=false;
    if(this.context){const now=this.context.currentTime;this.master!.gain.setTargetAtTime(0,now,.025);this.music!.stop(now+.08);this.effects!.stop(now+.08);}
    if(this.timer){clearInterval(this.timer);this.timer=undefined;}
  }
  setVolume(volume:number){
    this.volume=Math.max(0,Math.min(1,volume));
    if(this.context&&this.enabled)this.master!.gain.setTargetAtTime(this.volume,this.context.currentTime,.025);
  }
  position(){
    const now=this.context?.currentTime??0,entry=[...this.history].reverse().find(e=>e.start<=now)??this.history[0];
    return {mode:entry?.mode??this.pending,bar:entry?.bar??0,beat:entry?Math.max(0,Math.min(entry.beats-.001,(now-entry.start)/entry.beat)):0,playing:this.enabled};
  }
  cinematicMix(level:number){
    this.cinematicLevel=Math.max(0,Math.min(1,level));
    if(this.context&&this.musicGain)this.musicGain.gain.setTargetAtTime(.52*this.cinematicLevel,this.context.currentTime,.06);
  }
  setMode(mode:MusicMode){
    // An explicit selection starts a fanfare immediately, including battle restarts.
    // Ordinary location/arrangement changes retain their bar-aligned transition.
    this.pending=mode;if(!this.enabled)this.mode=mode;
    else if(ARRANGEMENTS[mode].introBars)void this.play(mode);
  }
  private schedule(){
    const c=this.context;if(!c||!this.enabled||c.state!=='running')return;
    if(this.next<c.currentTime)this.next=c.currentTime+.03;
    while(this.next<c.currentTime+.16){
      if(this.mode!==this.pending){this.music!.release(this.next);this.mode=this.pending;this.bar=0;}
      const {bpm,beats}=ARRANGEMENTS[this.mode],beat=60/bpm;
      this.history.push({mode:this.mode,bar:this.bar,start:this.next,beat,beats});if(this.history.length>3)this.history.shift();
      for(const n of scoreBar(this.mode,this.bar))if(!this.instruments||this.instruments.includes(n.instrument))this.music!.note(n.instrument,n.pitch,this.next+n.beat*beat,n.duration*beat,n.velocity,n.pan);
      this.next+=beat*beats;this.bar++;
    }
  }
  effect(kind:Effect,surface:MapId|'sluice'='station'){
    if(!this.enabled||!this.context)return;
    const now=this.context.currentTime;
    if(kind==='move'){if(now-this.lastStep<.105)return;this.lastStep=now;this.steps++;}
    this.effects!.effect(kind,now+.005,surface==='refuge'?'station':surface==='breakwater'?'yard':surface==='sanctuary'?'tunnel':surface==='rillbridge'||surface==='infirmary'||surface==='relayhall'?'station':surface==='conduit'?'tunnel':surface==='coast'||surface==='sluice'||surface==='cinderbank'||surface==='northglass'?'yard':surface,this.steps);
  }
}
