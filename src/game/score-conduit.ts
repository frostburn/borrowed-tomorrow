import type { Note } from './score';
// A suspended, non-functional eight-bar vamp, answered in the second half.
const chords=[[38,53,57,60,64],[46,53,57,60,62],[41,53,56,60,63],[44,55,60,63,67]];
const calls=[77,74,75,79];
export function conduitBar(bar:number):Note[]{
  const i=((bar%16)+16)%16,[root,...chord]=chords[Math.floor(i/2)%4],notes:Note[]=[];
  const add=(instrument:Note['instrument'],midi:number,beat:number,duration:number,velocity:number,pan=0)=>notes.push({instrument,midi,beat,duration,velocity,pan});
  add('bass',root,0,3.4,.11);
  for(const [n,pitch] of chord.entries())add('strings',pitch,0,3.5,.018,n%2?.25:-.25);
  if(i%2===0)add('bell',calls[Math.floor(i/2)%4]-(i>=8?12:0),.5,2.25,.11,-.2);
  else {add('keys',chord[1],1,1.3,.045,.3);add('keys',chord[2],3,.6,.03,.3);}
  return notes;
}
