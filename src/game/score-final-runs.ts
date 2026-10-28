import type {Instrument,Note} from './score';
import {octave,type Pitch} from './tuning';
import {phrasing} from './expression';
// Twelve consecutive fifths: seven 3-step diatonic semitones and five
// 2-step chromatic semitones per octave. Flats are not respelled as sharps.
export const CHROMATIC_SHARPS:readonly Pitch[]=['C4','C#4','D4','D#4','E4','F4','F#4','G4','G#4','A4','A#4','B4'];
export const CHROMATIC_FLATS:readonly Pitch[]=['C4','Db4','D4','Eb4','E4','F4','Gb4','G4','Ab4','A4','Bb4','B4'];
export const ADJACENT_31:readonly Pitch[]=['C4','Ct4','C#4','Db4','Dd4','D4','Dt4','D#4','Eb4','Ed4','E4','Et4','E#4','F4','Ft4','F#4','Gb4','Gd4','G4','Gt4','G#4','Ab4','Ad4','A4','At4','A#4','Bb4','Bd4','B4','Bt4','B#4'];
interface Run {bar:number;beat:number;pitches:readonly Pitch[];step:number}
// Endpoints and timing are authored pickups to the NEXT existing melody note.
function path(scale:readonly Pitch[],from:number,to:number):Pitch[]{
 const direction=from<=to?1:-1;
 return Array.from({length:Math.abs(to-from)+1},(_,j)=>{const n=from+j*direction;return octave(scale[(n%scale.length+scale.length)%scale.length],Math.floor(n/scale.length));});
}
const run=(bar:number,beat:number,scale:readonly Pitch[],from:number,to:number,step=.25):Run=>({bar,beat,pitches:path(scale,from,to),step});
const mantle:readonly Run[]=[
 run(3,1,CHROMATIC_SHARPS,-5,6), // G3 rises to the next sentence's G4.
 run(7,1,CHROMATIC_SHARPS,22,11),
 run(11,2.5,ADJACENT_31,28,23), // B falls through six neighbouring steps to Ad.
 run(19,1,CHROMATIC_SHARPS,0,11),
 run(27,3,ADJACENT_31,22,19),
 run(31,1,CHROMATIC_SHARPS,16,5),
];
const sun:readonly Run[]=[
 run(3,3.75,ADJACENT_31,36,27,.125),
 run(7,2,CHROMATIC_FLATS,17,6),
 run(11,4.125,ADJACENT_31,10,16,.125),
 run(15,2,CHROMATIC_FLATS,0,11),
 run(23,3.125,ADJACENT_31,36,22,.125),
 run(31,2,CHROMATIC_FLATS,-4,7),
];
const heart:readonly Run[]=[
 run(3,1,CHROMATIC_SHARPS,-2,9),
 run(7,3,ADJACENT_31,36,29,.125),
 run(11,3,ADJACENT_31,30,23,.125),
 // A whole 31-step octave, landing on the untouched C5 at the quiet middle.
 run(15,0,ADJACENT_31,0,30,.125),
 run(19,1,CHROMATIC_SHARPS,2,13),
 run(23,1,CHROMATIC_SHARPS,23,12),
 run(27,3.5,ADJACENT_31,18,21,.125),
 run(31,1,CHROMATIC_SHARPS,19,8),
];
const plan=(mode:string):readonly Run[]=>mode==='benefactor'?mantle:mode==='hollow-sun'?sun:mode==='unborrowed'?heart:[];
const beats=(mode:string)=>mode==='hollow-sun'?5:4;
/** Cut the original lead only where an authored run takes over, including
 * held notes arriving from the previous bar. The rhythm section stays intact. */
export function finalLeadHold(mode:string,bar:number,beat:number,hold:number):number{
 const start=bar*beats(mode)+beat;
 for(const r of plan(mode)){
  const at=r.bar*beats(mode)+r.beat,end=at+r.pitches.length*r.step;
  if(start>=at&&start<end)return 0;
  if(start<at&&start+hold>at)hold=at-start;
 }
 return hold;
}
export function finalChromaticNotes(mode:string,bar:number,gain:number,strength:number):Note[]{
 // Piano attacks can articulate the heart's 32nds; the broad strings retain
 // their existing slow attack, rather than receiving an unsuitable tiny hold.
 const instrument:Instrument=mode==='benefactor'?'organ':mode==='hollow-sun'?'brass':'keys';
 return plan(mode).filter(r=>r.bar===bar).flatMap(r=>r.pitches.map((pitch,j)=>({
  instrument,pitch,beat:r.beat+j*r.step,duration:r.step*.8,
  velocity:gain*.88,pan:-.12,
  expression:{...phrasing(strength*(.74+.26*j/Math.max(1,r.pitches.length-1))),release:.035},
 })));
}
