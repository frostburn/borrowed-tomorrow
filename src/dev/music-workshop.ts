import { Audio } from '../game/audio';
import { ARRANGEMENTS, scoreBar, scoreLength, type Instrument, type MusicMode } from '../game/score';
import { fifthsCircle, isPercussion, pitchFrequency, pitchSteps, transpose, type Pitch } from '../game/tuning';
import { Synth } from '../game/synth';

const library: {mode:MusicMode;title:string;group:string}[] = [
  {mode:'refuge',title:'A Place to Return',group:'4'}, {mode:'breakwater',title:'Nineteen Out',group:'4'},
  {mode:'sanctuary',title:'Under the Hollow Sun',group:'4'}, {mode:'four-battle',title:'Hold the Line',group:'4'}, {mode:'four-warden',title:"The Emperor's Order",group:'4'},
  {mode:'station',title:'Larkspur festival',group:'1'}, {mode:'yard',title:"Orrin's workshop",group:'1'}, {mode:'tunnel',title:'After the raid / pass',group:'1'},
  {mode:'rillbridge',title:'Rillbridge freed',group:'1'}, {mode:'battle',title:'Leaving Home battle',group:'1'}, {mode:'inspector',title:'Captain Alban',group:'1'}, {mode:'ending',title:'Departure',group:'1'},
  {mode:'coast',title:'Iron Coast',group:'2'}, {mode:'cinderbank',title:'Cinderbank siding',group:'2'}, {mode:'infirmary',title:'Railway ward',group:'2'},
  {mode:'northglass',title:'Capital medical siding',group:'3'}, {mode:'relayhall',title:'Control gallery',group:'3'}, {mode:'conduit',title:'Vessel chamber',group:'3'}, {mode:'switching',title:'Beneath the Palace battle',group:'3'},
  {mode:'sluice',title:'Retained sluice',group:'Library'}, {mode:'flood',title:'Retained flood battle',group:'Library'}, {mode:'shunting',title:'Retained shunting battle',group:'Library'},
];
const parts:Record<string,readonly Instrument[]|undefined>={All:undefined,Reed:['reed'],Piano:['keys'],Bell:['bell'],Strings:['strings'],Bass:['bass'],Drums:['kick','snare','hat']};
const pc=(pitch:Pitch)=>((pitchSteps(pitch)%31)+31)%31;

/** Development-only controls; playback uses the campaign's actual mixer and rack. */
export class MusicWorkshop {
  private mode:MusicMode='refuge';
  private group='4';
  private bar=0;
  private part='All';
  private volume=75;
  private container?:HTMLElement;
  private timer?:number;
  private auditionContext?:AudioContext;
  private auditionSynth?:Synth;
  private auditionGain?:GainNode;
  private auditionUntil=0;
  private auditionGeneration=0;
  private auditionTimer?:number;
  constructor(private audio:Audio,private sound:(on:boolean)=>void,private error:(message:string)=>void){}
  get active(){return !!this.container;}
  show(container:HTMLElement){if(!this.container){this.audio.pause();this.sound(false);}this.container=container;this.render();if(!this.timer)this.timer=window.setInterval(()=>this.tick(),100);}
  hide(){if(!this.container)return;this.stop();this.audio.setMode('station');if(this.timer)clearInterval(this.timer);this.timer=undefined;this.container=undefined;}
  toggle(){if(this.audio.enabled||performance.now()<this.auditionUntil)this.stop();else void this.play();}
  private async play(){
    try{this.endAudition();this.audio.cinematicMix(1);this.audio.setVolume(this.volume/100);await this.audio.play(this.mode,this.bar,parts[this.part]);this.sound(this.audio.enabled);this.tick();}
    catch{this.stop();this.error('Audio could not start in this browser.');}
  }
  private endAudition(){
    this.auditionGeneration++;
    if(this.auditionContext)this.auditionSynth?.release(this.auditionContext.currentTime);
    if(this.auditionTimer)clearTimeout(this.auditionTimer);this.auditionTimer=undefined;this.auditionUntil=0;
  }
  stop(){
    const before=this.bar;
    if(this.audio.enabled)this.bar=this.audio.position().bar%scoreLength(this.mode);
    this.audio.pause();this.endAudition();this.sound(false);if(this.bar!==before)this.notes();this.tick();
  }
  private async audition(pitches:Pitch[]){
    this.stop();const generation=this.auditionGeneration;
    try{
      if(!this.auditionContext){this.auditionContext=new AudioContext();const gain=this.auditionContext.createGain();gain.gain.value=this.volume/150;this.auditionGain=gain;gain.connect(this.auditionContext.destination);this.auditionSynth=new Synth(this.auditionContext,gain);}
      const c=this.auditionContext;await c.resume();if(generation!==this.auditionGeneration)return;
      for(const [n,pitch]of pitches.entries())this.auditionSynth!.note('keys',pitch,c.currentTime+.03+n*.35,.85,.22/Math.sqrt(pitches.length),n? .15:-.15);
      this.auditionUntil=performance.now()+1400;this.sound(true);this.auditionTimer=window.setTimeout(()=>{this.sound(this.audio.enabled);this.auditionUntil=0;},1400);
    }catch{this.error('Audio could not start in this browser.');}
  }
  private selectBar(bar:number){
    if(!Number.isInteger(bar)||bar<0||bar>=scoreLength(this.mode)){this.error(`Choose a bar from 1 to ${scoreLength(this.mode)}.`);return;}
    const playing=this.audio.enabled;this.bar=bar;this.notes();if(playing)void this.play();this.tick();
  }
  private render(){
    const root=this.container!;
    root.innerHTML=`<div class="music-layout"><section class="music-library" aria-label="Music library"><h2>Cues</h2><div class="music-groups" role="group" aria-label="Cue chapters">${['1','2','3','4','Library'].map(g=>`<button data-group="${g}" aria-pressed="${g===this.group}">${g==='Library'?g:`Ch ${g}`}</button>`).join('')}</div><div class="music-cues">${library.filter(c=>c.group===this.group).map(c=>`<button data-cue="${c.mode}" aria-pressed="${c.mode===this.mode}"><span>${c.title}</span><small>${c.mode} / ${ARRANGEMENTS[c.mode].bpm} BPM</small></button>`).join('')}</div></section>
    <section class="music-review" aria-label="Music review"><h2>${library.find(c=>c.mode===this.mode)!.title}</h2><p class="music-description">31-EDO / A4 = 440 Hz / ${ARRANGEMENTS[this.mode].bpm} BPM / ${scoreLength(this.mode)} bars</p><div class="music-transport"><button id="music-play">Play</button><button id="music-stop">Stop</button><button id="music-restart">Restart cue</button><span id="music-position" role="status"></span></div><div class="music-bar"><button id="music-previous" aria-label="Previous bar">Previous</button><label for="music-bar">Bar</label><input id="music-bar" type="number" min="1" max="${scoreLength(this.mode)}" value="${this.bar+1}"/><button id="music-next" aria-label="Next bar">Next</button></div><div class="music-parts" role="group" aria-label="Instrument audition">${Object.keys(parts).map(p=>`<button data-part="${p}" aria-pressed="${p===this.part}">${p}</button>`).join('')}</div><div class="music-volume"><button id="music-quieter" aria-label="Lower music volume">-</button><span id="music-volume">Volume ${this.volume}%</span><button id="music-louder" aria-label="Raise music volume">+</button></div><h3 id="music-notes-title"></h3><p class="music-description">Click a pitch to hear it alone. Drum pitches are unpitched.</p><div id="music-notes"></div></section>
    <section class="music-tuning" aria-label="31-EDO tuning"><h2>Circle of fifths</h2><p>Every fifth advances 18 of 31 steps. Sharps raise two steps; flats lower two. The circle closes after 31 fifths.</p><div class="music-circle">${fifthsCircle().map((p,i)=>`<button data-fifth="${i}" aria-label="Hear fifth ${p}">${p.replace(/4$/,'')}<small>${pc(p)}</small></button>`).join('')}</div><p>C# and Db are one step apart. Compare their sound:</p><div class="music-comparisons"><button id="music-sharp">Hear C#4</button><button id="music-flat">Hear Db4</button><button id="music-compare">Compare C#4 / Db4</button></div></section></div>`;
    for(const b of root.querySelectorAll<HTMLButtonElement>('[data-group]'))b.onclick=()=>{this.group=b.dataset.group!;this.render();};
    for(const b of root.querySelectorAll<HTMLButtonElement>('[data-cue]'))b.onclick=()=>{const playing=this.audio.enabled;this.stop();this.mode=b.dataset.cue as MusicMode;this.bar=0;this.render();if(playing)void this.play();};
    root.querySelector<HTMLButtonElement>('#music-play')!.onclick=()=>void this.play();
    root.querySelector<HTMLButtonElement>('#music-stop')!.onclick=()=>this.stop();
    root.querySelector<HTMLButtonElement>('#music-restart')!.onclick=()=>{this.bar=0;void this.play();};
    root.querySelector<HTMLButtonElement>('#music-previous')!.onclick=()=>this.selectBar((this.bar+scoreLength(this.mode)-1)%scoreLength(this.mode));
    root.querySelector<HTMLButtonElement>('#music-next')!.onclick=()=>this.selectBar((this.bar+1)%scoreLength(this.mode));
    root.querySelector<HTMLInputElement>('#music-bar')!.onchange=e=>this.selectBar(Number((e.target as HTMLInputElement).value)-1);
    for(const b of root.querySelectorAll<HTMLButtonElement>('[data-part]'))b.onclick=()=>{this.part=b.dataset.part!;const playing=this.audio.enabled;this.render();if(playing)void this.play();};
    const volume=(delta:number)=>{this.volume=Math.max(0,Math.min(100,this.volume+delta));this.audio.setVolume(this.volume/100);if(this.auditionGain&&this.auditionContext)this.auditionGain.gain.setTargetAtTime(this.volume/150,this.auditionContext.currentTime,.025);root.querySelector('#music-volume')!.textContent=`Volume ${this.volume}%`;};
    root.querySelector<HTMLButtonElement>('#music-quieter')!.onclick=()=>volume(-5);root.querySelector<HTMLButtonElement>('#music-louder')!.onclick=()=>volume(5);
    for(const b of root.querySelectorAll<HTMLButtonElement>('[data-fifth]'))b.onclick=()=>{const p=fifthsCircle()[Number(b.dataset.fifth)];void this.audition([p,transpose(p,'P5')]);};
    root.querySelector<HTMLButtonElement>('#music-sharp')!.onclick=()=>void this.audition(['C#4']);root.querySelector<HTMLButtonElement>('#music-flat')!.onclick=()=>void this.audition(['Db4']);root.querySelector<HTMLButtonElement>('#music-compare')!.onclick=()=>void this.audition(['C#4','Db4']);
    this.notes();this.tick();
  }
  private notes(){
    if(!this.container)return;
    this.container.querySelector('#music-notes-title')!.textContent=`Bar ${this.bar+1} / ${scoreLength(this.mode)}`;
    const notes=scoreBar(this.mode,this.bar).filter(n=>!parts[this.part]||parts[this.part]!.includes(n.instrument)).sort((a,b)=>a.beat-b.beat);
    this.container.querySelector('#music-notes')!.innerHTML=`<table><thead><tr><th>Voice</th><th>Pitch</th><th>Step</th><th>Hz</th><th>Beat</th></tr></thead><tbody>${notes.map(n=>`<tr><td>${n.instrument}</td><td>${isPercussion(n.instrument)?'-':`<button data-pitch="${n.pitch}" aria-label="Hear ${n.pitch}">${n.pitch}</button>`}</td><td>${isPercussion(n.instrument)?'-':pc(n.pitch)}</td><td>${isPercussion(n.instrument)?'-':pitchFrequency(n.pitch).toFixed(2)}</td><td>${n.beat+1}</td></tr>`).join('')}</tbody></table>${notes.length?'':'<p>No notes in this part of the bar.</p>'}`;
    for(const b of this.container.querySelectorAll<HTMLButtonElement>('[data-pitch]'))b.onclick=()=>void this.audition([b.dataset.pitch as Pitch]);
  }
  private tick(){
    if(!this.container)return;
    const p=this.audio.position();if(p.playing&&p.mode===this.mode){const bar=p.bar%scoreLength(this.mode);if(bar!==this.bar){this.bar=bar;this.notes();}}
    const input=this.container.querySelector<HTMLInputElement>('#music-bar')!;if(document.activeElement!==input&&input.value!==String(this.bar+1))input.value=String(this.bar+1);
    const label=`${p.playing?'Playing':'Stopped'} / bar ${this.bar+1}${p.playing?` / beat ${Math.floor(p.beat)+1}`:''}`,status=this.container.querySelector('#music-position')!;if(status.textContent!==label)status.textContent=label;
  }
}
