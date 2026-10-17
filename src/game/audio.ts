import { ARRANGEMENTS, scoreBar, type MusicMode } from './score';
import { Synth, type Effect } from './synth';

/** Bar-aligned arrangement changes and look-ahead timing, independent of frame rate. */
export class Audio {
  private context?:AudioContext;
  private master?:GainNode;
  private music?:Synth;
  private effects?:Synth;
  private timer?:number;
  private next=0;
  private bar=0;
  private mode:MusicMode='station';
  private pending:MusicMode='station';
  private steps=0;
  private lastStep=-1;
  enabled=false;
  private initialize(){
    const c=new AudioContext();this.context=c;
    const master=c.createGain(),compressor=c.createDynamicsCompressor(),music=c.createGain(),fx=c.createGain();
    this.master=master;master.gain.value=0;music.gain.value=.52;fx.gain.value=.58;
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
    if(!this.context)this.initialize();const c=this.context!;await c.resume();
    this.enabled=!this.enabled;this.master!.gain.setTargetAtTime(this.enabled?.75:0,c.currentTime,.025);
    if(!this.enabled){this.music!.stop(c.currentTime+.08);this.effects!.stop(c.currentTime+.08);}
    if(this.enabled){this.mode=this.pending;this.next=c.currentTime+.045;this.bar=0;this.schedule();}
    if(!this.timer)this.timer=window.setInterval(()=>this.schedule(),25);
    return this.enabled;
  }
  setMode(mode:MusicMode){this.pending=mode;if(!this.enabled)this.mode=mode;}
  private schedule(){
    const c=this.context;if(!c||!this.enabled||c.state!=='running')return;
    if(this.next<c.currentTime)this.next=c.currentTime+.03;
    while(this.next<c.currentTime+.16){
      if(this.mode!==this.pending){this.mode=this.pending;this.bar=0;}
      const beat=60/ARRANGEMENTS[this.mode].bpm;
      for(const n of scoreBar(this.mode,this.bar))this.music!.note(n.instrument,n.midi,this.next+n.beat*beat,n.duration*beat,n.velocity,n.pan);
      this.next+=beat*4;this.bar++;
    }
  }
  effect(kind:Effect,surface:'station'|'yard'|'tunnel'|'rillbridge'|'sluice'|'cinderbank'|'infirmary'='station'){
    if(!this.enabled||!this.context)return;
    const now=this.context.currentTime;
    if(kind==='move'){if(now-this.lastStep<.105)return;this.lastStep=now;this.steps++;}
    this.effects!.effect(kind,now+.005,surface==='rillbridge'||surface==='infirmary'?'station':surface==='sluice'||surface==='cinderbank'?'yard':surface,this.steps);
  }
}
