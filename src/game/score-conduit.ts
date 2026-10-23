import { octave, type Pitch } from './tuning';
import type { Note } from './score';
// A suspended, non-functional eight-bar vamp, answered in the second half.
const chords:Pitch[][]=[['D2','F3','A3','C4','E4'],['Bb2','F3','A3','C4','D4'],['F2','F3','Ab3','C4','Eb4'],['Ab2','G3','C4','Eb4','G4']];
const calls:Pitch[]=['F5','D5','Eb5','G5'];
export function conduitBar(bar:number):Note[]{
  const i=((bar%16)+16)%16,[root,...chord]=chords[Math.floor(i/2)%4],notes:Note[]=[];
  const add=(instrument:Note['instrument'],pitch:Pitch,beat:number,duration:number,velocity:number,pan=0)=>{const note:Note={instrument,pitch,beat,duration,velocity,pan};notes.push(note);return note;};
  add('bass',root,0,3.4,.11);
  for(const [n,pitch] of chord.entries())add('strings',pitch,0,3.5,.018,n%2?.25:-.25);
  if(i%2===0){
    // A pp upward roll draws breath before the bell, never a competing ostinato.
    for(const [n,pitch]of chord.entries())add('keys',pitch,n/8,.9,.013+n*.002,.15+n*.08);
    add('bell',octave(calls[Math.floor(i/2)%4],i>=8?-1:0),.5,2.25,.11,-.2).expression={release:1.8};
  }
  else {add('keys',chord[1],1,1.3,.045,.3);add('keys',chord[2],3,.6,.03,.3);}
  return notes;
}
