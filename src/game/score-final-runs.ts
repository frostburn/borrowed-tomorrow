import type {Note} from './score';
import {octave,transpose,type Interval,type Pitch} from './tuning';
import {phrasing} from './expression';
import {mantlePhraseNotes} from './score-mantle-phrases';

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
const plan=(mode:string):readonly Run[]=>mode==='hollow-sun'?sun:mode==='unborrowed'?heart:[];
const beats=(mode:string)=>mode==='hollow-sun'?5:4;
/** Runs take their lead span, including held arrivals; mantle counterlines leave it intact. */
export function finalLeadHold(mode:string,bar:number,beat:number,hold:number):number{
 const meter=beats(mode),start=bar*meter+beat;
 const windows=plan(mode).map(r=>({bar:r.bar,beat:r.beat,end:r.beat+r.pitches.length*r.step}));
 for(const w of windows){
  const at=w.bar*meter+w.beat,end=w.bar*meter+w.end;
  if(start>=at&&start<end)return 0;
  if(start<at&&start+hold>at)hold=at-start;
 }
 return hold;
}
export function finalPhraseNotes(mode:string,bar:number,gain:number,strength:number):Note[]{
 if(mode==='benefactor')return mantlePhraseNotes(bar,gain,strength);
 const heart=mode==='unborrowed';
 return plan(mode).filter(r=>r.bar===bar).flatMap(r=>r.pitches.map((pitch,j)=>({
  instrument:heart?'keys':'organ',pitch,beat:r.beat+j*r.step,duration:r.step*(heart?.8:.96),velocity:gain*.88,pan:-.12,
  expression:{...phrasing(strength*(.74+.26*j/Math.max(1,r.pitches.length-1))),release:heart?.035:.05},
 })));
}
