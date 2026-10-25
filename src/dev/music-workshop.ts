import {ROOMS,TRACK_ROOMS,MAP_ROOMS,type RoomId} from '../content/rooms';
import {RoomReverb} from '../game/room-reverb';
import { hasExpression,hasRubato } from '../game/score-performance';
import { Audio } from '../game/audio';
import { ARRANGEMENTS, scoreBar, scoreLength, scorePosition, scoreMeter, type Instrument, type MusicMode } from '../game/score';
import { fifthsCircle, isPercussion, pitchFrequency, pitchSteps, transpose, type Pitch } from '../game/tuning';
import { Synth } from '../game/synth';

const library: {mode:MusicMode;title:string;group:string}[] = [
 {mode:'hollowsill',title:'Under the Hanging Sea',group:'7'},
 {mode:'takenwater',title:'The Bell’s Second Note',group:'7'},
 {mode:'firstfield',title:'The First Good Year',group:'7'},
 {mode:'quietward',title:'You May Leave',group:'7'},
 {mode:'seasonstreet',title:'Snow on the Postal Stair',group:'7'},
 {mode:'lastrefuge',title:'The Unwritten Hour',group:'7'},
 {mode:'sunthrone',title:'The Empty Channels',group:'7'},
 {mode:'homecoming',title:'One Train without Us',group:'7'},
 {mode:'seaholiday',title:'Until Evening',group:'7'},
 {mode:'domain-battle',title:'The Road We Know',group:'7'},
 {mode:'harvest-battle',title:'The Uncut Row',group:'7'},
 {mode:'hospice-battle',title:'Discharge the Patient',group:'7'},
 {mode:'seasons-battle',title:'The Winter Kept Here',group:'7'},
 {mode:'benefactor',title:'The God Who Lent Tomorrow',group:'7'},
 {mode:'hollow-sun',title:'The Broken Meridian',group:'7'},
 {mode:'unborrowed',title:'Tomorrow',group:'7'},

  {mode:'stillcity',title:'The Procession Never Ends',group:'6'},{mode:'lastpalace',title:'A Place at the Table',group:'6'},
  {mode:'capital-battle',title:'Open the Patient Stair',group:'6'},{mode:'emperor',title:'The Emperor’s Last Day',group:'6'},
  {mode:'lightbearer',title:'The Hand on the Shutter',group:'6'},{mode:'capital-return',title:'The City Comes Down',group:'6'},
  {mode:'laststation',title:'The Empty Seat',group:'6'},
  {mode:'bellharbor',title:'Skeld · Answering Bells',group:'6'}, {mode:'frostwatch',title:'The Covered Road',group:'6'},
  {mode:'glacier',title:'The Fleet beneath the Ice',group:'6'}, {mode:'wintershrine',title:'A Bell for the Outer Marker',group:'6'},
  {mode:'north-battle',title:'Skeld · Open the Mountain',group:'6'}, {mode:'winter-dragon',title:'Wings over the Winter Bell',group:'6'},
  {mode:'riverhaven',title:'Iria · The Next Launch',group:'6'}, {mode:'canopy',title:'Under the Green Signal',group:'6'},
  {mode:'rainhouse',title:'The Waiting Basin',group:'6'}, {mode:'rainhouse-rest',title:'A Seat by the River',group:'6'},
  {mode:'river-battle',title:'Iria · Open the Waterway',group:'6'}, {mode:'rain-warden',title:'Wings on the Landing',group:'6'},
  {mode:'outermooring',title:'Two Seals at the Gate',group:'6'}, {mode:'namar',title:'Namar · Letters on the Water',group:'6'},
  {mode:'sunpalace',title:'The Queen’s Half of the Pact',group:'6'}, {mode:'skywalk',title:'Above the Awnings',group:'6'},
  {mode:'observatory',title:'The Bronze Sky',group:'6'}, {mode:'desert-battle',title:'Namar · The Postal Stair',group:'6'},
  {mode:'sun-serpent',title:'Coils around the Sun',group:'6'},
  {mode:'windmere',title:'Windmere · The Garden Walk',group:'5'}, {mode:'dispensary',title:'Beds beside the Water Lift',group:'5'}, {mode:'mirrorward',title:'The Mirrored Ward',group:'5'},
  {mode:'wind-battle',title:'Windmere · Keep the Ward Open',group:'5'}, {mode:'wind-engine',title:'The Light We Keep',group:'5'},
  {mode:'airship',title:'Above the Railway',group:'5'}, {mode:'airfield',title:'The Western Mooring',group:'5'},
  {mode:'hammerplain',title:'The Next Shift',group:'5'}, {mode:'coolingworks',title:'The Cooling Race',group:'5'}, {mode:'anchorforge',title:'Under the Gantry',group:'5'},
  {mode:'five-battle',title:'Hammerplain · Hold the Floor',group:'5'}, {mode:'five-furnace',title:'The Pouring Lane',group:'5'},
  {mode:'dawnwatch',title:'Dawnwatch · The Open Gate',group:'5'}, {mode:'watchbarracks',title:'The Gun Terraces',group:'5'}, {mode:'signalwall',title:'The Town Wheel',group:'5'},
  {mode:'dawn-battle',title:'Dawnwatch · Across the Terraces',group:'5'}, {mode:'dawn-commander',title:'Orders Worth Refusing',group:'5'}, {mode:'observation',title:'The Empty Cabin',group:'5'},
  {mode:'flagship',title:'Iron Above the Clouds',group:'5'}, {mode:'claim',title:'The Sky Answers',group:'5'},
  {mode:'refuge',title:'A Place to Return',group:'4'}, {mode:'breakwater',title:'The Sea Gate',group:'4'},
  {mode:'sanctuary',title:'Under the Hollow Sun',group:'4'}, {mode:'four-battle',title:'Hold the Line',group:'4'}, {mode:'four-warden',title:"The Emperor's Order",group:'4'},
  {mode:'station',title:'Larkspur festival',group:'1'}, {mode:'yard',title:"Orrin's workshop",group:'1'}, {mode:'tunnel',title:'After the raid / pass',group:'1'},
  {mode:'rillbridge',title:'Rillbridge freed',group:'1'}, {mode:'battle',title:'Leaving Home battle',group:'1'}, {mode:'inspector',title:'Captain Alban',group:'1'}, {mode:'ending',title:'Departure',group:'1'},
  {mode:'coast',title:'Iron Coast',group:'2'}, {mode:'coast-battle',title:'Iron Coast · train raid',group:'2'}, {mode:'cinderbank',title:'Cinderbank siding',group:'2'}, {mode:'infirmary',title:'Railway ward',group:'2'}, {mode:'shunting',title:'Cinderbank · loading walk',group:'2'}, {mode:'petra-battle',title:'Petra · the last crossing',group:'2'},
  {mode:'northglass',title:'Capital medical siding',group:'3'}, {mode:'relayhall',title:'Control gallery',group:'3'}, {mode:'conduit',title:'Vessel chamber',group:'3'}, {mode:'switching',title:'Beneath the Palace battle',group:'3'},
  {mode:'sluice',title:'Retained sluice',group:'Library'}, {mode:'flood',title:'Retained flood battle',group:'Library'},
];
const groups=['Themes',...[...new Set(library.map(c=>c.group).filter(g=>g!=='Library'))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true})),'Library'];
// A short review path through the new character identities; these are campaign cues.
const themes:Partial<Record<MusicMode,{name:string;description:string}>>={
 station:{name:'Nell',description:'The festival song from Larkspur. D minor; a home melody that also answers Orrin in the workshop.'},
 hammerplain:{name:'Orrin',description:'Repeated hammer taps and a downward release. G minor with a working bass riff.'},
 coast:{name:'Kit',description:'Iron Coast: a courier keeps moving. The open coastal phrase and its determined train-raid answer.'},
 dawnwatch:{name:'Petra',description:'C, Db, C, then G: resistance before the decision. F minor; three-bar calls over a straight march.'},
 windmere:{name:'Celia',description:'A long descending breath. Db major, borrowed Cb, and a ten-bar sentence in 3/4.'},
 flagship:{name:'Alban',description:'Iron Above the Clouds: a plunging fourth, a return and a rising third. Foreshadowed in his first battle, now a 10/8 march.'},
};
const parts:Record<string,readonly Instrument[]|undefined>={All:undefined,Organ:['organ'],Wood:['wood'],'Hand drum':['hand-drum'],Shaker:['shaker'],Lute:['lute'],Sine:['sine'],Tritaver:['tritaver'],Reed:['reed'],Piano:['keys'],Bell:['bell'],Strings:['strings'],Brass:['brass'],Timpani:['timpani'],Bass:['bass','round-bass'],Drums:['hand-drum','shaker','kick','snare','hat','cymbal','timpani']};
const pc=(pitch:Pitch)=>((pitchSteps(pitch)%31)+31)%31;
const displayBeat=(beat:number)=>{
  const whole=Math.floor(beat),third=Math.round((beat-whole)*3);
  return third>0&&third<3&&Math.abs(beat-whole-third/3)<1e-6?`${whole+1}+${third}/3`:String(Number((beat+1).toFixed(3)));
};

/** Development-only controls; playback uses the campaign's actual mixer and rack. */
export class MusicWorkshop {
  private mode:MusicMode='refuge';
  private group='4';
  private bar=0;
  private part='All';
  private expression=true;
  private rubato=true;
  private volume=75;
  private room?:RoomId;
  private get selectedRoom(){return this.room??TRACK_ROOMS[this.mode];}
  private auditionRoom?:RoomReverb;
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
  hide(){if(!this.container)return;this.stop();this.audio.setMode('station');this.audio.setRoom(MAP_ROOMS.station);if(this.timer)clearInterval(this.timer);this.timer=undefined;this.container=undefined;}
  toggle(){if(this.audio.enabled||performance.now()<this.auditionUntil)this.stop();else void this.play();}
  private async play(){
    try{this.endAudition();this.audio.setRoom(this.selectedRoom);this.audio.cinematicMix(1);this.audio.setVolume(this.volume/100);await this.audio.play(this.mode,this.bar,parts[this.part],{expression:this.expression,rubato:this.rubato});this.sound(this.audio.enabled);this.tick();}
    catch{this.stop();this.error('Audio could not start in this browser.');}
  }
  private endAudition(){
    this.auditionGeneration++;this.auditionRoom?.setRoom('dry');
    if(this.auditionContext)this.auditionSynth?.release(this.auditionContext.currentTime);
    if(this.auditionTimer)clearTimeout(this.auditionTimer);this.auditionTimer=undefined;this.auditionUntil=0;
  }
  stop(){
    const before=this.bar;
    if(this.audio.enabled)this.bar=scorePosition(this.mode,this.audio.position().bar);
    this.audio.pause();this.endAudition();this.sound(false);if(this.bar!==before)this.notes();this.tick();
  }
  private async audition(pitches:Pitch[]){
    this.stop();const generation=this.auditionGeneration;
    try{
      if(!this.auditionContext){this.auditionContext=new AudioContext();const gain=this.auditionContext.createGain();gain.gain.value=this.volume/150;this.auditionGain=gain;this.auditionRoom=new RoomReverb(this.auditionContext,gain,this.auditionContext.destination);this.auditionSynth=new Synth(this.auditionContext,gain);}
      const c=this.auditionContext;await c.resume();if(generation!==this.auditionGeneration)return;this.auditionRoom!.setRoom(this.selectedRoom);
      for(const [n,pitch]of pitches.entries())this.auditionSynth!.note('keys',pitch,c.currentTime+.03+n*.35,.85,.22/Math.sqrt(pitches.length),n? .15:-.15);
      this.auditionUntil=performance.now()+1400;this.sound(true);this.auditionTimer=window.setTimeout(()=>{this.sound(this.audio.enabled);this.auditionUntil=0;},1400);
    }catch{this.error('Audio could not start in this browser.');}
  }
  private selectBar(bar:number){
    if(!Number.isInteger(bar)||bar<0||bar>=scoreLength(this.mode)){this.error(`Choose a bar from 1 to ${scoreLength(this.mode)}.`);return;}
    const playing=this.audio.enabled;this.bar=bar;this.notes();if(playing)void this.play();this.tick();
  }
  private render(){
    const root=this.container!,theme=themes[this.mode];
    const cues=this.group==='Themes'?Object.keys(themes).map(mode=>library.find(c=>c.mode===mode)!):library.filter(c=>c.group===this.group);
    root.innerHTML=`<div class="music-layout"><section class="music-library" aria-label="Music library"><h2>Cues</h2><div class="music-groups" role="group" aria-label="Cue chapters">${groups.map(g=>`<button data-group="${g}" aria-pressed="${g===this.group}">${g==='Library'||g==='Themes'?g:`Ch ${g}`}</button>`).join('')}</div><div class="music-cues">${cues.map(c=>`<button data-cue="${c.mode}" aria-pressed="${c.mode===this.mode}"><span>${this.group==='Themes'?themes[c.mode]!.name:c.title}</span><small>${c.mode} / ${ARRANGEMENTS[c.mode].bpm} BPM / ${scoreMeter(c.mode)}</small></button>`).join('')}</div></section>
    <section class="music-review" aria-label="Music review"><h2>${library.find(c=>c.mode===this.mode)!.title}</h2><p class="music-description">31-EDO / A4 = 440 Hz / ${ARRANGEMENTS[this.mode].bpm} BPM / ${scoreMeter(this.mode)} / ${scoreLength(this.mode)} bars${ARRANGEMENTS[this.mode].introBars?` / ${ARRANGEMENTS[this.mode].introBars}-bar intro, then ${scoreLength(this.mode)-ARRANGEMENTS[this.mode].introBars!}-bar loop${ARRANGEMENTS[this.mode].pulses?` / ${ARRANGEMENTS[this.mode].pulses!.join('+')}`:''}`:''}</p>${theme?`<p class="music-theme">${theme.name} · ${theme.description}</p>`:''}<details class="music-rooms"><summary>Room: ${this.room?ROOMS[this.room].name:`Canonical · ${ROOMS[TRACK_ROOMS[this.mode]].name}`}</summary><div class="music-parts" role="group" aria-label="Room"><button data-room="" aria-pressed="${this.room===undefined}">Canonical · ${ROOMS[TRACK_ROOMS[this.mode]].name}</button>${Object.entries(ROOMS).map(([id,p])=>`<button data-room="${id}" aria-pressed="${this.room===id}">${p.name}</button>`).join('')}</div></details><div class="music-transport"><button id="music-play">Play</button><button id="music-stop">Stop</button><button id="music-restart">Restart cue</button><span id="music-position" role="status"></span></div><div class="music-bar"><button id="music-previous" aria-label="Previous bar">Previous</button><label for="music-bar">Bar</label><input id="music-bar" type="number" min="1" max="${scoreLength(this.mode)}" value="${this.bar+1}"/><button id="music-next" aria-label="Next bar">Next</button></div><div class="music-parts" role="group" aria-label="Instrument audition">${Object.keys(parts).map(p=>`<button data-part="${p}" aria-pressed="${p===this.part}">${p}</button>`).join('')}</div>${hasExpression(this.mode)?`<div class="music-parts" role="group" aria-label="Expressive performance"><button id="music-expression" aria-pressed="${this.expression}" title="Dynamics, vibrato, pitch bends and release">Expression</button>${hasRubato(this.mode)?`<button id="music-rubato" aria-pressed="${this.rubato}">Rubato</button>`:''}</div>`:''}<div class="music-volume"><button id="music-quieter" aria-label="Lower music volume">-</button><span id="music-volume">Volume ${this.volume}%</span><button id="music-louder" aria-label="Raise music volume">+</button></div><h3 id="music-notes-title"></h3><p class="music-description">Click a pitch to hear it alone. Wood and timpani are tuned; other drum pitches are unpitched.</p><div id="music-notes"></div></section>
    <section class="music-tuning" aria-label="31-EDO tuning"><h2>Circle of fifths</h2><p>Every fifth advances 18 of 31 steps. Sharps raise two steps; flats lower two. The circle closes after 31 fifths.</p><div class="music-circle">${fifthsCircle().map((p,i)=>`<button data-fifth="${i}" aria-label="Hear fifth ${p}">${p.replace(/4$/,'')}<small>${pc(p)}</small></button>`).join('')}</div><p>C# and Db are one step apart. Compare their sound:</p><div class="music-comparisons"><button id="music-sharp">Hear C#4</button><button id="music-flat">Hear Db4</button><button id="music-compare">Compare C#4 / Db4</button></div></section></div>`;
    for(const b of root.querySelectorAll<HTMLButtonElement>('[data-group]'))b.onclick=()=>{this.group=b.dataset.group!;this.render();};
    for(const b of root.querySelectorAll<HTMLButtonElement>('[data-cue]'))b.onclick=()=>{const playing=this.audio.enabled;this.stop();this.mode=b.dataset.cue as MusicMode;this.room=undefined;this.bar=0;this.audio.setRoom(this.selectedRoom);this.render();if(playing)void this.play();};
    for(const button of root.querySelectorAll<HTMLButtonElement>('[data-room]'))button.onclick=()=>{
      this.room=button.dataset.room as RoomId||undefined;this.audio.setRoom(this.selectedRoom);
      if(this.auditionUntil>performance.now())this.auditionRoom?.setRoom(this.selectedRoom);
      root.querySelector('.music-rooms summary')!.textContent=`Room: ${this.room?ROOMS[this.room].name:`Canonical · ${ROOMS[TRACK_ROOMS[this.mode]].name}`}`;
      for(const b of root.querySelectorAll<HTMLButtonElement>('[data-room]'))b.setAttribute('aria-pressed',String((b.dataset.room||undefined)===this.room));
      root.querySelector<HTMLDetailsElement>('.music-rooms')!.open=false;
    };
    root.querySelector<HTMLButtonElement>('#music-play')!.onclick=()=>void this.play();
    root.querySelector<HTMLButtonElement>('#music-stop')!.onclick=()=>this.stop();
    root.querySelector<HTMLButtonElement>('#music-restart')!.onclick=()=>{this.bar=0;this.notes();void this.play();};
    root.querySelector<HTMLButtonElement>('#music-previous')!.onclick=()=>this.selectBar((this.bar+scoreLength(this.mode)-1)%scoreLength(this.mode));
    root.querySelector<HTMLButtonElement>('#music-next')!.onclick=()=>this.selectBar((this.bar+1)%scoreLength(this.mode));
    root.querySelector<HTMLInputElement>('#music-bar')!.onchange=e=>this.selectBar(Number((e.target as HTMLInputElement).value)-1);
    for(const b of root.querySelectorAll<HTMLButtonElement>('[data-part]'))b.onclick=()=>{this.part=b.dataset.part!;const playing=this.audio.enabled;this.render();if(playing)void this.play();};
    for(const [id,key]of [['music-expression','expression'],['music-rubato','rubato']]as const){const button=root.querySelector<HTMLButtonElement>(`#${id}`);if(button)button.onclick=()=>{this[key]=!this[key];const playing=this.audio.enabled;this.render();if(playing)void this.play();};}
    const volume=(delta:number)=>{this.volume=Math.max(0,Math.min(100,this.volume+delta));this.audio.setVolume(this.volume/100);if(this.auditionGain&&this.auditionContext)this.auditionGain.gain.setTargetAtTime(this.volume/150,this.auditionContext.currentTime,.025);root.querySelector('#music-volume')!.textContent=`Volume ${this.volume}%`;};
    root.querySelector<HTMLButtonElement>('#music-quieter')!.onclick=()=>volume(-5);root.querySelector<HTMLButtonElement>('#music-louder')!.onclick=()=>volume(5);
    for(const b of root.querySelectorAll<HTMLButtonElement>('[data-fifth]'))b.onclick=()=>{const p=fifthsCircle()[Number(b.dataset.fifth)];void this.audition([p,transpose(p,'P5')]);};
    root.querySelector<HTMLButtonElement>('#music-sharp')!.onclick=()=>void this.audition(['C#4']);root.querySelector<HTMLButtonElement>('#music-flat')!.onclick=()=>void this.audition(['Db4']);root.querySelector<HTMLButtonElement>('#music-compare')!.onclick=()=>void this.audition(['C#4','Db4']);
    this.notes();this.tick();
  }
  private notes(){
    if(!this.container)return;
    this.container.querySelector('#music-notes-title')!.textContent=`Bar ${this.bar+1} / ${scoreLength(this.mode)}${ARRANGEMENTS[this.mode].introBars?(this.bar<ARRANGEMENTS[this.mode].introBars!?' / Intro':' / Loop'):''}`;
    const notes=scoreBar(this.mode,this.bar).filter(n=>!parts[this.part]||parts[this.part]!.includes(n.instrument)).sort((a,b)=>a.beat-b.beat);
    this.container.querySelector('#music-notes')!.innerHTML=`<table><thead><tr><th>Voice</th><th>Pitch</th><th>Step</th><th>Hz</th><th>${ARRANGEMENTS[this.mode].meter?.[1]===8?'Eighth':'Beat'}</th></tr></thead><tbody>${notes.map(n=>`<tr><td>${n.instrument}</td><td>${isPercussion(n.instrument)?'-':`<button data-pitch="${n.pitch}" aria-label="Hear ${n.pitch}">${n.pitch}</button>`}</td><td>${isPercussion(n.instrument)?'-':pc(n.pitch)}</td><td>${isPercussion(n.instrument)?'-':pitchFrequency(n.pitch).toFixed(2)}</td><td>${displayBeat(n.beat*(ARRANGEMENTS[this.mode].meter?.[1]??4)/4)}</td></tr>`).join('')}</tbody></table>${notes.length?'':'<p>No notes in this part of the bar.</p>'}`;
    for(const b of this.container.querySelectorAll<HTMLButtonElement>('[data-pitch]'))b.onclick=()=>void this.audition([b.dataset.pitch as Pitch]);
  }
  private tick(){
    if(!this.container)return;
    const p=this.audio.position();if(p.playing&&p.mode===this.mode){const bar=scorePosition(this.mode,p.bar);if(bar!==this.bar){this.bar=bar;this.notes();}}
    const input=this.container.querySelector<HTMLInputElement>('#music-bar')!;if(document.activeElement!==input&&input.value!==String(this.bar+1))input.value=String(this.bar+1);
    const label=`${p.playing?'Playing':'Stopped'} / bar ${this.bar+1}${p.playing?` / beat ${Math.floor(p.beat*(ARRANGEMENTS[this.mode].meter?.[1]??4)/4)+1}`:''}`,status=this.container.querySelector('#music-position')!;if(status.textContent!==label)status.textContent=label;
  }
}
