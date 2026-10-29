import {RoomReverb} from './room-reverb';
import {MAP_ROOMS,type RoomId} from '../content/rooms';
import type { MapId } from '../rules/state';
import type { Instrument, MusicMode } from './score';
import { Synth, type Effect } from './synth';
import type { PerformanceOptions } from './score-performance';

/** Bar-aligned arrangement changes and look-ahead timing, independent of frame rate. */
export class Audio {
  private context?:AudioContext;
  private score?:typeof import('./music-runtime');
  private master?:GainNode;
  private reverb?:RoomReverb;
  private roomId:RoomId=MAP_ROOMS.station;
  get room(){return this.roomId;}
  setRoom(id:RoomId){this.roomId=id;if(this.enabled)this.reverb?.setRoom(id);}
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
  private starting?:{mode:MusicMode;bar:number;instruments?:readonly Instrument[];performance:PerformanceOptions};
  private instruments?:readonly Instrument[];
  private performance:PerformanceOptions={};
  private volume=.75;
  private history:{mode:MusicMode;bar:number;start:number;beats:number;rubato?:boolean}[]=[];
  private steps=0;
  private lastStep=-1;
  enabled=false;
  private initialize(){
    const c=new AudioContext();this.context=c;
    const master=c.createGain(),compressor=c.createDynamicsCompressor(),music=c.createGain(),fx=c.createGain();
    this.master=master;this.musicGain=music;master.gain.value=0;music.gain.value=.52*this.cinematicLevel;fx.gain.value=.58;
    compressor.threshold.value=-12;compressor.knee.value=9;compressor.ratio.value=4;compressor.attack.value=.005;compressor.release.value=.2;
    const mix=c.createGain();music.connect(mix);fx.connect(mix);
    // Control the excitation, then let the room decay independently. A
    // compressor on the return would duck existing tails and swell them back.
    mix.connect(compressor);this.reverb=new RoomReverb(c,compressor,master);master.connect(c.destination);
    this.music=new Synth(c,music);this.effects=new Synth(c,fx);
  }
  async toggle():Promise<boolean>{
    if(this.enabled)this.pause();else await this.play(this.pending);
    return this.enabled;
  }
  async play(mode:MusicMode,bar=0,instruments?:readonly Instrument[],performance:PerformanceOptions={}){
    if(!Number.isInteger(bar)||bar<0)throw new Error('Invalid score bar.');
    const generation=++this.generation;this.pending=mode;
    this.starting={mode,bar,instruments,performance:{...performance}};
    try{
    if(!this.context)this.initialize();const c=this.context!;
    const [score]=await Promise.all([import('./music-runtime'),c.resume()]);
    if(generation!==this.generation)return;this.score=score;
    this.music!.release(c.currentTime);this.mode=this.pending;this.bar=this.mode===mode?bar:0;this.instruments=instruments;this.performance={...performance};
    this.history=[];this.next=c.currentTime+.045;this.enabled=true;this.reverb!.setRoom(this.roomId);
    this.master!.gain.setTargetAtTime(this.volume,c.currentTime,.025);this.schedule();
    if(!this.timer)this.timer=window.setInterval(()=>this.schedule(),25);
    }finally{if(generation===this.generation)this.starting=undefined;}
  }
  pause(){
    this.generation++;this.starting=undefined;this.enabled=false;this.reverb?.setRoom('dry');
    if(this.context){const now=this.context.currentTime;this.master!.gain.setTargetAtTime(0,now,.025);this.music!.stop(now+.08);this.effects!.stop(now+.08);}
    if(this.timer){clearInterval(this.timer);this.timer=undefined;}
  }
  /** Freeze the listener's clock and queued notes for an exact transport pause. */
  async hold(){
    this.generation++;this.enabled=false;
    if(this.timer){clearInterval(this.timer);this.timer=undefined;}
    if(this.context)await this.context.suspend();
  }
  async resume(){
    const generation=++this.generation,c=this.context;
    if(!c||!this.score)throw new Error('No track is paused.');
    await c.resume();if(generation!==this.generation)return;
    this.enabled=true;this.master!.gain.setTargetAtTime(this.volume,c.currentTime,.025);this.schedule();
    if(!this.timer)this.timer=window.setInterval(()=>this.schedule(),25);
  }
  /** Suspend a soundtrack browser's host, including a pending first sound load.
   * Resume at the saved bar with its filters/performance; honor later scene cues. */
  suspend(){
    const position=this.position(),request=this.starting;
    const enabled=this.enabled||!!request,mode=this.pending;
    const bar=request?.mode===mode?request.bar:position.mode===mode?position.bar:0;
    const instruments=request?request.instruments:this.instruments,performance={...(request?.performance??this.performance)};
    this.pause();let restored=false;
    return async()=>{if(restored)return;restored=true;if(enabled)await this.play(this.pending,this.pending===mode?bar:0,instruments,performance);};
  }
  /** Release an isolated listener instance after its dialog closes. */
  close(){
    this.pause();const context=this.context;this.context=undefined;
    // Let the existing gain/voice release finish before closing the device.
    if(context)window.setTimeout(()=>{void context.close().catch(()=>{});},100);
  }
  setVolume(volume:number){
    this.volume=Math.max(0,Math.min(1,volume));
    if(this.context&&this.enabled)this.master!.gain.setTargetAtTime(this.volume,this.context.currentTime,.025);
  }
  position(){
    const now=this.context?.currentTime??0,entry=[...this.history].reverse().find(e=>e.start<=now)??this.history[0];
    const beat=entry?this.score!.scoreBeat(entry.mode,this.score!.scoreTime(entry.mode,entry.bar*entry.beats,entry.rubato)+Math.max(0,now-entry.start),entry.rubato)-entry.bar*entry.beats:0;
    return {mode:entry?.mode??this.pending,bar:entry?.bar??0,beat:entry?Math.max(0,Math.min(entry.beats-.001,beat)):0,playing:this.enabled};
  }
  cinematicMix(level:number){
    this.cinematicLevel=Math.max(0,Math.min(1,level));
    if(this.context&&this.musicGain)this.musicGain.gain.setTargetAtTime(.52*this.cinematicLevel,this.context.currentTime,.06);
  }
  setMode(mode:MusicMode){
    // An explicit selection starts a fanfare immediately, including battle restarts.
    // Ordinary location/arrangement changes retain their bar-aligned transition.
    this.pending=mode;if(!this.enabled)this.mode=mode;
    else if(this.score!.ARRANGEMENTS[mode].introBars)void this.play(mode);
  }
  private schedule(){
    const c=this.context;if(!c||!this.enabled||c.state!=='running')return;
    if(this.next<c.currentTime)this.next=c.currentTime+.03;
    while(this.next<c.currentTime+.16){
      if(this.mode!==this.pending){this.music!.release(this.next);this.mode=this.pending;this.bar=0;}
      const {beats}=this.score!.ARRANGEMENTS[this.mode],performed=this.score!.performanceBar(this.mode,this.bar,this.performance);
      this.history.push({mode:this.mode,bar:this.bar,start:this.next,beats,rubato:this.performance.rubato});if(this.history.length>3)this.history.shift();
      for(const n of performed.notes)if(!this.instruments||this.instruments.includes(n.instrument))this.music!.note(n.instrument,n.pitch,this.next+n.time,n.seconds,n.velocity,n.pan,n.expression);
      this.next+=performed.duration;this.bar++;
    }
  }
  effect(kind:Effect,surface:MapId|'sluice'='station'){
    if(!this.enabled||!this.context)return;
    const now=this.context.currentTime;
    if(kind==='move'){if(now-this.lastStep<.105)return;this.lastStep=now;this.steps++;}
    this.effects!.effect(kind,now+.005,['hollowsill','takenwater','firstfield','quietward','seasonstreet','lastrefuge','sunthrone'].includes(surface)?'tunnel':surface==='homecoming'||surface==='seaholiday'?'station':surface==='lastshore'||surface==='lastmorning'||surface==='laststation'?'station':surface==='stillcity'||surface==='lastpalace'||surface==='crown'?'yard':surface==='bellharbor'||surface==='capitalquay'?'yard':surface==='frostwatch'||surface==='glacier'||surface==='wintershrine'?'tunnel':surface==='riverhaven'||surface==='rainhouse'?'station':surface==='canopy'?'yard':surface==='namar'||surface==='sunpalace'||surface==='skywalk'||surface==='observatory'||surface==='outermooring'?'yard':surface==='windmere'||surface==='dispensary'?'station':surface==='mirrorward'?'tunnel':surface==='airship'||surface==='flagship'||surface==='observation'?'station':surface==='dawnwatch'||surface==='watchbarracks'?'yard':surface==='signalwall'?'tunnel':surface==='anchorforge'?'tunnel':surface==='airfield'||surface==='hammerplain'||surface==='coolingworks'?'yard':surface==='refuge'?'station':surface==='breakwater'?'yard':surface==='sanctuary'?'tunnel':surface==='rillbridge'||surface==='infirmary'||surface==='relayhall'?'station':surface==='conduit'?'tunnel':surface==='coast'||surface==='sluice'||surface==='cinderbank'||surface==='northglass'?'yard':surface==='tunnel'?'tunnel':surface==='yard'?'yard':'station',this.steps);
  }
}
