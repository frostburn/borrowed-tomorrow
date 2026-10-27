import type { Instrument } from './score';
export type Effect = 'lanternvolley' | 'drum' | 'rivet' | 'lightline' | 'pressure' | 'stars' | 'ricochet' | 'bolt' | 'barrier' | 'revive' | 'shield' | 'prism' | 'crossfire' | 'relay' | 'valve' | 'strike' | 'burst' | 'steam' | 'mend' | 'bandage' | 'peck' | 'flare' | 'move' | 'win' | 'click' | 'defend' | 'punch' | 'return-call' | 'paper' | 'resonance';
import { isBass, isPercussion, pitchFrequency, type Pitch } from './tuning';
import type { ControlCurve,NoteExpression } from './expression';

/** Shared instrument rack, usable by live and offline Web Audio contexts. */
export class Synth {
  private noiseBuffer:AudioBuffer;
  private tritaverWave?:PeriodicWave;
  private random=0x6d2b79f5;
  private sources=new Set<AudioScheduledSourceNode>();
  private envelopes=new Set<GainNode>();
  private track<T extends AudioScheduledSourceNode>(source:T):T{
    this.sources.add(source);source.addEventListener('ended',()=>this.sources.delete(source));return source;
  }
  private fadeOut(start:number,end:number){
    for(const gain of this.envelopes){gain.gain.cancelAndHoldAtTime(start);gain.gain.linearRampToValueAtTime(0,end);}
    for(const source of this.sources)source.stop(end+.01);
  }
  stop(when:number){
    const now=this.context.currentTime,end=Math.max(when,now+.005);
    this.fadeOut(Math.max(now,end-.005),end);
  }
  /** Release the previous arrangement at its bar boundary, including held pedals. */
  release(when:number){
    const start=Math.max(when,this.context.currentTime);
    this.fadeOut(start,start+.06);
  }
  constructor(private context:BaseAudioContext,private output:AudioNode){
    this.noiseBuffer=context.createBuffer(1,context.sampleRate*2,context.sampleRate);
    const data=this.noiseBuffer.getChannelData(0);
    for(let i=0;i<data.length;i++){this.random^=this.random<<13;this.random^=this.random>>>17;this.random^=this.random<<5;data[i]=(this.random>>>0)/2147483648-1;}
  }
  private route(when:number,duration:number,volume:number,pan:number,attack=.006,release=.15,plucked=false){
    const c=this.context,gain=c.createGain(),panner=c.createStereoPanner();
    this.envelopes.add(gain);
    gain.gain.value=0;
    panner.pan.value=pan;gain.connect(panner);panner.connect(this.output);
    gain.gain.setValueAtTime(0,when);gain.gain.linearRampToValueAtTime(Math.max(.0001,volume),when+attack);
    if(plucked)gain.gain.exponentialRampToValueAtTime(Math.max(.0001,volume*.28),when+Math.min(.16,duration*.55));
    gain.gain.exponentialRampToValueAtTime(Math.max(.0001,volume*(plucked?.025:.6)),when+Math.max(attack+.001,duration));
    gain.gain.exponentialRampToValueAtTime(.0001,when+duration+release);
    // Exponential envelopes cannot reach zero. Finish quietly before stopping
    // the sources, rather than chopping their remaining waveform at the floor.
    gain.gain.linearRampToValueAtTime(0,when+duration+release+.005);
    return {gain,end:when+duration+release+.01,cleanup:()=>{this.envelopes.delete(gain);gain.disconnect();panner.disconnect();}};
  }
  tone(hz:number,when:number,duration:number,volume:number,type:OscillatorType='sine',pan=0,endHz=hz){
    when=Math.max(when,this.context.currentTime);
    const c=this.context,o=this.track(c.createOscillator()),r=this.route(when,duration,volume,pan,.003,.06);
    o.type=type;o.frequency.setValueAtTime(hz,when);o.frequency.exponentialRampToValueAtTime(endHz,when+duration);
    o.connect(r.gain);o.start(when);o.stop(r.end);o.onended=()=>{o.disconnect();r.cleanup();};
  }
  noise(when:number,duration:number,volume:number,hz:number,endHz=hz,pan=0,type:BiquadFilterType='bandpass'){
    when=Math.max(when,this.context.currentTime);
    const c=this.context,source=this.track(c.createBufferSource()),filter=c.createBiquadFilter(),r=this.route(when,duration,volume,pan,.004,.08);
    source.buffer=this.noiseBuffer;filter.type=type;filter.Q.value=.8;filter.frequency.setValueAtTime(hz,when);filter.frequency.exponentialRampToValueAtTime(endHz,when+duration);
    source.connect(filter);filter.connect(r.gain);source.start(when,.17);source.stop(r.end);
    source.onended=()=>{source.disconnect();filter.disconnect();r.cleanup();};
  }
  private cymbal(when:number,duration:number,volume:number,pan:number){
    const c=this.context,source=this.track(c.createBufferSource()),filter=c.createBiquadFilter();
    const r=this.route(when,duration,volume,pan,.003,.5,true),nodes:AudioNode[]=[source,filter];
    source.buffer=this.noiseBuffer;filter.type='highpass';filter.frequency.value=3500;
    source.connect(filter);filter.connect(r.gain);source.start(when,.31);source.stop(r.end);
    // Quiet inharmonic metal over a fast-decaying wash, separate from the closed hat.
    for(const ratio of [1,1.37,1.81,2.43]){
      const o=this.track(c.createOscillator()),g=c.createGain();o.type='square';o.frequency.value=1780*ratio;g.gain.value=.024;
      o.connect(g);g.connect(filter);o.start(when);o.stop(r.end);nodes.push(o,g);
    }
    source.onended=()=>{for(const node of nodes)node.disconnect();r.cleanup();};
  }
  private tritaver():PeriodicWave{
    if(!this.tritaverWave){
      // Six tritave-spaced partials retain the written fundamental.
      const real=new Float32Array(244),imag=new Float32Array(244);
      for(let i=0;i<6;++i)imag[3 ** i]=1/(i*i*i+1);
      this.tritaverWave=this.context.createPeriodicWave(real,imag);
    }
    return this.tritaverWave;
  }
  note(instrument:Instrument,pitch:Pitch,when:number,duration:number,volume:number,pan=0,expression?:NoteExpression){
    // A delayed scheduler must play the attack now, not start halfway through
    // an envelope whose timestamp has already passed on the audio clock.
    when=Math.max(when,this.context.currentTime);
    // Unpitched strikes take their phrase accent at the attack. Their short
    // material envelopes supply the decay rather than a sustained-note swell.
    if(isPercussion(instrument))volume*=expression?.dynamics?.[0][1]??1;
    if(instrument==='hand-drum'){
      const rim=pitch.startsWith('G'),hz=rim?186:98;
      this.tone(hz*1.16,when,rim?.095:.2,volume,'sine',pan,hz);
      this.tone(hz*1.59,when,rim?.055:.13,volume*.23,'sine',pan,hz*1.5);
      this.noise(when,.035,volume*(rim?.55:.23),rim?2300:1100,650,pan);return;
    }
    if(instrument==='shaker'){this.noise(when,duration,volume,6200,4300,pan,'highpass');return;}
    if(instrument==='kick'){this.tone(120,when,.13,volume,'sine',pan,43);this.noise(when,.018,volume*.15,1600,600,pan);return;}
    if(instrument==='snare'){this.noise(when,duration,volume,1700,950,pan);this.tone(185,when,.07,volume*.35,'triangle',pan,110);return;}
    if(instrument==='cymbal'){this.cymbal(when,duration,volume,pan);return;}
    if(instrument==='hat'){this.noise(when,duration,volume,8000,5200,pan,'highpass');return;}
    const c=this.context,hz=pitchFrequency(pitch),nodes:AudioNode[]=[];
    const bell=instrument==='bell',plucked=instrument==='keys'||instrument==='lute'||instrument==='wood',strings=instrument==='strings',brass=instrument==='brass',timpani=instrument==='timpani';
    const release=expression?.release??(bell?.65:strings?.35:timpani?.25:brass?.22:.16);
    const r=this.route(when,duration,volume,pan,instrument==='square-bass'?.008:strings?.12:bell||timpani?.003:plucked?.004:brass?.018:.025,release,plucked||timpani);
    const filter=c.createBiquadFilter();filter.type='lowpass';filter.Q.value=.5;
    filter.frequency.setValueAtTime(instrument==='square-bass'?1100:isBass(instrument)?650:instrument==='tritaver'?7000:bell?7000:plucked?2800:strings?1700:brass?700:timpani?2200:2400,when);
    // Square-bass attacks retain bite; sustained notes shed upper harmonics
    // on a real-time clock, while keeping the written fundamental intact.
    if(instrument==='square-bass')filter.frequency.setTargetAtTime(Math.max(180,hz*1.4),when+.02,.22);
    if(bell)filter.frequency.setTargetAtTime(Math.min(7000,Math.max(700,hz*1.8)),when+.02,.8);
    if(brass){filter.Q.value=.7;filter.frequency.exponentialRampToValueAtTime(Math.min(4800,hz*7),when+.045);filter.frequency.exponentialRampToValueAtTime(Math.max(600,hz*3),when+Math.max(.05,duration));}
    if(plucked)filter.frequency.exponentialRampToValueAtTime(650,when+Math.min(.3,duration));
    nodes.push(filter);
    const automate=(param:AudioParam,curve:ControlCurve)=>{
      param.setValueAtTime(curve[0][1],when);
      for(const [position,value]of curve.slice(1))param.linearRampToValueAtTime(value,when+position*duration);
    };
    if(expression?.dynamics){
      // The outer attack/release still silences every future swell on cancel.
      const swell=c.createGain();automate(swell.gain,expression.dynamics);
      filter.connect(swell);swell.connect(r.gain);nodes.push(swell);
    }else filter.connect(r.gain);
    const voices:OscillatorNode[]=[];
    const osc=(type:OscillatorType,detune=0,relative=1,mix=1,decay?:number)=>{
      const o=this.track(c.createOscillator()),g=c.createGain();if(type==='custom')o.setPeriodicWave(this.tritaver());else o.type=type;o.frequency.value=hz*relative;o.detune.value=detune;g.gain.value=mix;
      if(decay)g.gain.setTargetAtTime(.00001,when,decay);
      o.connect(g);g.connect(filter);o.start(when);o.stop(r.end);voices.push(o);nodes.push(o,g);return o;
    };
    if(bell){
      const carrier=osc('sine'),mod=this.track(c.createOscillator()),index=c.createGain();
      // A struck bell loses its upper colour in real time, independently of
      // the written hold. Long notes retain a warm fundamental, not a frozen
      // metallic attack. Release/expression and cancellation still wrap it all.
      mod.frequency.value=hz*2.76;index.gain.setValueAtTime(hz*.65,when);index.gain.setTargetAtTime(.1,when+.015,.35);
      mod.connect(index);index.connect(carrier.frequency);mod.start(when);mod.stop(r.end);voices.push(mod);nodes.push(mod,index);osc('sine',0,2,.1,.45);
    }else if(brass){osc('sawtooth',-2,1,.43);osc('sawtooth',2,1,.43);osc('triangle',0,.5,.12);}
    else if(timpani){
      for(const [ratio,mix]of [[1,.75],[1.48,.19],[2.15,.09],[2.9,.035]]){const o=osc('sine',0,ratio,mix);o.frequency.setValueAtTime(hz*ratio*1.025,when);o.frequency.exponentialRampToValueAtTime(hz*ratio,when+.065);}
    }else if(strings){osc('sawtooth',-6,1,.38);osc('sawtooth',6,1,.38);}
    else if(instrument==='organ'){osc('sine',0,1,.62);osc('sine',0,2,.22);osc('sine',0,3,.1);osc('sine',0,4,.04);}
    else if(instrument==='sine'){osc('sine');}
    else if(instrument==='tritaver'){osc('custom');}
    else if(instrument==='round-bass'){osc('sine',0,1,.82);osc('sine',0,2,.18);}
    else if(instrument==='square-bass'){osc('square',0,1,.7);}
    else if(instrument==='bass'){osc('triangle',0,1,.8);osc('sine',0,.5,.2);}
    else if(instrument==='wood'){osc('sine',0,1,.84);osc('sine',0,2,.12);osc('sine',0,4,.035);}
    else if(instrument==='lute'){osc('triangle',0,1,.68);osc('sine',0,2,.2);osc('sine',0,3,.08);osc('sine',0,4,.035);}
    else if(plucked){osc('triangle',0,1,.76);osc('sine',0,2,.17);osc('sine',0,3.005,.055);}
    else {
      const reed=osc('triangle',0,1,.85);osc('sine',0,2,.15);
      if(!expression){
        const vibrato=this.track(c.createOscillator()),depth=c.createGain();vibrato.frequency.value=4.6;
        depth.gain.setValueAtTime(0,when);depth.gain.linearRampToValueAtTime(hz*.004,when+.2);
        vibrato.connect(depth);depth.connect(reed.frequency);vibrato.start(when);vibrato.stop(r.end);nodes.push(vibrato,depth);
      }
    }
    if(expression?.bend){
      // An additive cents bus preserves the rack's small unison detunes. It
      // bends fundamentals, upper partials and the bell's FM modulator together.
      const bend=this.track(c.createConstantSource());automate(bend.offset,expression.bend);
      for(const voice of voices)bend.connect(voice.detune);
      bend.start(when);bend.stop(r.end);nodes.push(bend);
    }
    if(expression?.vibrato){
      const vibrato=this.track(c.createOscillator()),depth=c.createGain();vibrato.frequency.value=expression.vibrato.rate;
      automate(depth.gain,expression.vibrato.depth);vibrato.connect(depth);
      // Modulate every harmonic equally in cents, centred on the spelled pitch.
      for(const voice of voices)depth.connect(voice.detune);
      vibrato.start(when);vibrato.stop(r.end);nodes.push(vibrato,depth);
    }
    voices[0].onended=()=>{for(const node of nodes)node.disconnect();r.cleanup();};
  }
  effect(kind:Effect,when:number,surface:'station'|'yard'|'tunnel'='station',variant=0){
    const tone=(hz:number,offset:number,duration:number,volume:number,type:OscillatorType='sine',endHz=hz)=>this.tone(hz,when+offset,duration,volume,type,0,endHz);
    const noise=(offset:number,duration:number,volume:number,hz:number,endHz=hz)=>this.noise(when+offset,duration,volume,hz,endHz);
    switch(kind){
      case 'drum':noise(0,.3,.28,700,3200);tone(90,0,.3,.18,'triangle',40);noise(.1,.25,.15,2400,600);break;
      case 'rivet':tone(340,0,.045,.12,'triangle',180);noise(.03,.055,.15,2600,600);tone(1220,.08,.17,.07);break;
      case 'valve':noise(0,.12,.15,1200,500);tone(240,.03,.12,.1,'triangle',150);noise(.12,.28,.18,600,2000);break;
      case 'bolt':noise(0,.04,.12,2500,900);tone(1800,.02,.08,.14,'triangle',420);noise(.09,.06,.18,800);break;
      case 'lanternvolley':
        [0,.045,.09].forEach(t=>{noise(t,.035,.08,2300,800);tone(1700,t,.12,.065,'triangle',500);});noise(.36,.16,.12,1800,500);tone(480,.36,.22,.07,'sine',240);break;
      case 'ricochet':case 'crossfire':
        noise(0,.045,.17,2200,800);tone(1700,.03,.09,.12,'triangle',640);tone(2300,.18,.1,.1,'sine',1000);noise(.3,.08,.18,1200,500);if(kind==='crossfire')tone(180,.02,.28,.12,'triangle',70);break;
      case 'shield':noise(0,.08,.18,900,300);tone(160,0,.16,.17,'triangle',60);tone(780,.02,.2,.08);break;
      case 'barrier':[260,520,780].forEach((hz,i)=>tone(hz,i*.04,.35,.055,'sine',hz*1.08));noise(0,.08,.08,1200);break;
      case 'revive':(['D4','A4','D5','F5','A5']as Pitch[]).forEach((p,i)=>this.note('bell',p,when+i*.07,.48,.14));break;
      case 'stars':
        [2800,2200,3300,1900].forEach((hz,i)=>tone(hz,i*.035,.4,.045,'sine',hz*.25));noise(.32,.12,.1,2800,750);[660,990,1320].forEach((hz,i)=>tone(hz,.44+i*.025,.23,.04));break;
      case 'lightline':
        [900,1350,1800].forEach((hz,i)=>tone(hz,i*.045,.24,.055,'sine',hz*.75));noise(.02,.24,.12,1700,3700);break;
      case 'pressure':case 'prism':case 'relay':
        tone(120,0,.25,.12,'triangle',65);noise(.03,.4,.22,700,3600);noise(.2,.15,.14,2600,500);
        if(kind!=='pressure')[880,1320].forEach(hz=>tone(hz,.13,.35,.065));break;
      case 'resonance':
        tone(146.8,0,1.6,.1);tone(149.1,.04,1.5,.08);tone(440.4,.02,1.2,.025);break;
      case 'punch':
        noise(0,.025,.2,2400,900);tone(180,0,.06,.16,'triangle',72);tone(370,.05,.4,.09);break;
      case 'return-call':
        [0,.24,.64].forEach((offset,i)=>{tone(880,offset,i===2?.7:.13,.12);tone(1320,offset,i===2?.55:.1,.045);});break;
      case 'paper':noise(0,.12,.09,2700,1400);noise(.1,.08,.06,1800,3200);break;
      case 'click':tone(1150,0,.013,.1,'triangle',820);noise(0,.012,.045,3200);break;
      case 'move':{
        const hz=surface==='yard'?1400:surface==='tunnel'?480:780;
        noise(0,.035,.18,hz,hz*.65);tone(125+variant%2*15,0,.03,.09,'sine',72);
        if(surface==='yard')noise(.025,.035,.06,3300,2200);break;
      }
      case 'strike':
        noise(0,.065,.42,1200,550);tone(130,0,.09,.25,'triangle',55);
        for(const [hz,gain] of [[690,.14],[1130,.1],[1810,.07]])tone(hz,.008,.24,gain);break;
      case 'burst':
        tone(2300,0,.025,.13,'square',800);noise(.025,.22,.38,600,3600);
        tone(180,.035,.18,.18,'sine',58);[1046,1568,2093].forEach((hz,i)=>tone(hz,.09+i*.025,.3,.09));break;
      case 'flare':
        [0,.06,.12].forEach(offset=>tone(1480,offset,.04,.14,'square',740));
        noise(.09,.28,.36,1800,520);tone(110,.09,.24,.22,'triangle',48);
        tone(880,.14,.35,.13);tone(1320,.14,.35,.08);break;
      case 'steam':
        noise(0,.62,.45,600,4500);noise(.08,.35,.24,3600,800);tone(94,0,.5,.15,'triangle',42);
        tone(540,.03,.28,.075,'sine',260);break;
      case 'mend':
        (['D5','F5','A5','D6'] as Pitch[]).forEach((pitch,i)=>this.note('bell',pitch,when+i*.085,.3,.19,i%2?.3:-.3));break;
      case 'bandage':noise(0,.1,.12,2800,1300);noise(.14,.14,.12,1700,700);this.note('keys','D5',when+.24,.25,.13);break;
      case 'peck':noise(0,.06,.16,750,1800);noise(.055,.05,.1,1500,500);tone(1700,.1,.035,.18,'triangle',820);break;
      case 'defend':tone(210,0,.065,.12,'triangle',190);tone(620,.015,.18,.08);break;
      case 'win':
        (['D4','F4','A4','D5','F5','A5','D6'] as Pitch[]).forEach((pitch,i)=>this.note('bell',pitch,when+i*.095,.5,.2,i%2?.3:-.3));
        (['D3','A3','D4'] as Pitch[]).forEach(pitch=>this.note('strings',pitch,when+.38,1.4,.11));break;
    }
  }
}
