import type {Note} from './score';
import {octave,pitchSteps,transpose,type Interval,type Pitch} from './tuning';
import {phrasing} from './expression';

// Every neighbouring 31-EDO pitch, with spelling retained across octaves.
const adjacent:readonly Pitch[]=['C4','Ct4','C#4','Db4','Dd4','D4','Dt4','D#4','Eb4','Ed4','E4','Et4','E#4','F4','Ft4','F#4','Gb4','Gd4','G4','Gt4','G#4','Ab4','Ad4','A4','At4','A#4','Bb4','Bd4','B4','Bt4','B#4'];
interface Run {bar:number;beat:number;pitches:readonly Pitch[];step:number}
function closeRun(bar:number,beat:number,from:number,to:number,step=.125):Run{
 const direction=from<=to?1:-1;
 const pitches=Array.from({length:Math.abs(to-from)+1},(_,j)=>{
  const n=from+j*direction;return octave(adjacent[(n%31+31)%31],Math.floor(n/31));
 });
 return {bar,beat,pitches,step};
}
// Six lower anchors advance five 31-EDO steps apiece. Pair each with its
// tritone, reversing the pair order halfway: 15-step A4s then 16-step d5s.
// This gives whole-tone colour without pretending 31 divides into six tones.
const wholeTritones:readonly Pitch[]=['C4','F#4','D4','G#4','E4','A#4','C5','F#4','D5','G#4','E5','A#4'];
const tritones=(bar:number,beat:number,interval:Interval='P1'):Run=>({bar,beat,pitches:wholeTritones.map(p=>transpose(p,interval)),step:.25});
const sun:readonly Run[]=[
 closeRun(3,3.75,36,27),
 closeRun(7,2,25,14,.25),
 closeRun(11,4.125,10,16),
 tritones(15,2),
 closeRun(23,3.125,36,22),
 tritones(31,2,'-M2'),
];
const heart:readonly Run[]=[
 closeRun(3,1,13,24,.25),
 closeRun(7,3,36,29),
 closeRun(11,3,30,23),
 // The full adjacent-step octave returns before the untouched high C5.
 closeRun(15,0,0,30),
 tritones(19,1,'M2'),
 closeRun(23,1,40,29,.25),
 closeRun(27,3.5,18,21),
 tritones(31,1),
];
interface Glide {bar:number;beat:number;duration:number;from:Pitch;to:Pitch;echo:Pitch}
// The echo traces the same fall 3/8 beat late, one 31-EDO step lower.
// Its lag keeps it just above the lead during the shared descent, rubbing
// near unison before it falls below the next organ entrance.
const echoDelay=.375,echoGain=.28;
const mantle:readonly Glide[]=[
 {bar:2,beat:2,duration:6,from:'G5',to:'G4',echo:'Gd4'},
 {bar:6,beat:1,duration:7,from:'A#5',to:'A#4',echo:'At4'},
 {bar:10,beat:2,duration:6,from:'G5',to:'Ad4',echo:'Ab4'},
 {bar:18,beat:2,duration:6,from:'C6',to:'C5',echo:'B#4'},
 {bar:26,beat:3,duration:5,from:'Ft5',to:'G4',echo:'Gd4'},
 {bar:30,beat:1,duration:7,from:'E5',to:'E4',echo:'Ed4'},
];
const plan=(mode:string):readonly Run[]=>mode==='hollow-sun'?sun:mode==='unborrowed'?heart:[];
const beats=(mode:string)=>mode==='hollow-sun'?5:4;
/** Give each gesture its lead span, including held notes from a previous bar. */
export function finalLeadHold(mode:string,bar:number,beat:number,hold:number):number{
 const meter=beats(mode),start=bar*meter+beat;
 const windows=mode==='benefactor'?mantle.map(g=>({bar:g.bar,beat:g.beat,end:g.beat+g.duration})):
  plan(mode).map(r=>({bar:r.bar,beat:r.beat,end:r.beat+r.pitches.length*r.step}));
 for(const w of windows){
  const at=w.bar*meter+w.beat,end=w.bar*meter+w.end;
  if(start>=at&&start<end)return 0;
  if(start<at&&start+hold>at)hold=at-start;
 }
 return hold;
}
export function finalPhraseNotes(mode:string,bar:number,gain:number,strength:number):Note[]{
 if(mode==='benefactor')return mantle.filter(g=>g.bar===bar).flatMap(g=>{
  const bend=(pitchSteps(g.from)-pitchSteps(g.to))*1200/31;
  const voice=(echo:boolean):Note=>({
   instrument:'sine',pitch:echo?g.echo:g.to,beat:g.beat+(echo?echoDelay:0),duration:g.duration,
   velocity:gain*.88*(echo?echoGain:1),pan:echo?.2:-.12,
   expression:{...phrasing(strength,true),release:echo?.18:.1,bend:[[0,bend],[1,0]]},
  });
  return [voice(false),voice(true)];
 });
 const heart=mode==='unborrowed';
 return plan(mode).filter(r=>r.bar===bar).flatMap(r=>r.pitches.map((pitch,j)=>({
  instrument:heart?'keys':'organ',pitch,beat:r.beat+j*r.step,duration:r.step*(heart?.8:.96),velocity:gain*.88,pan:-.12,
  expression:{...phrasing(strength*(.74+.26*j/Math.max(1,r.pitches.length-1))),release:heart?.035:.05},
 })));
}
