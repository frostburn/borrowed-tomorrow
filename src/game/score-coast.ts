import type { Note } from './score';
// C–Bm7b5–Em7–Am–Gm7–C7–F–Em–Dm–G–C, extended to sixteen bars.
const chords = [
  [36,60,64,67],[35,57,62,65],[40,59,62,67],[45,60,64,69],
  [43,58,62,65],[36,58,64,67],[41,60,65,69],[40,59,64,67],
  [38,60,65,69],[43,59,62,67],[36,60,64,67],[45,60,64,69],
  [41,60,65,69],[38,60,65,69],[43,59,62,67],[36,60,64,67],
];
// A two-bar call and answer returns over the borrowed chords, then rises in the
// third phrase. The last phrase recalls the call and settles into the loop.
// Short passing notes leave space between the longer, chord-supported arrivals.
const melody: [number,number,number][][] = [
  [[0,76,1.25],[1.5,79,.25],[2,77,.25],[2.5,76,.25],[3,74,.75]],
  [[0,74,1.5],[2,77,.5],[3,71,.75]],
  [[0,71,1.25],[1.5,74,.25],[2,72,.25],[2.5,71,.25],[3,67,.75]],
  [[0,69,2.5]],
  [[0,74,1.25],[1.5,77,.25],[2,75,.25],[2.5,74,.25],[3,72,.75]],
  [[0,76,1.5],[2,74,.5],[3,70,.75]],
  [[0,69,1.25],[1.5,72,.25],[2,71,.25],[2.5,69,.25],[3,67,.75]],
  [[0,67,2.5]],
  [[0,77,1.25],[1.5,81,.25],[2,79,.25],[2.5,77,.25],[3,76,.75]],
  [[0,74,1.5],[2,71,.5],[3,74,.75]],
  [[0,76,1.25],[1.5,79,.25],[2,77,.25],[2.5,76,.25],[3,74,.75]],
  [[0,72,2.5]],
  [[0,69,1.25],[1.5,72,.25],[2,71,.25],[2.5,69,.25],[3,67,.75]],
  [[0,69,1.5],[2,77,.5],[3,74,.75]],
  [[0,74,1.25],[1.5,72,.25],[2,71,1.5]],
  [[0,72,3]],
];
export function coastBar(bar: number): Note[] {
  const i=((bar%16)+16)%16, [root,...voicing]=chords[i], notes:Note[]=[];
  const add=(instrument:Note['instrument'],midi:number,beat:number,duration:number,velocity:number,pan=0)=>notes.push({instrument,midi,beat,duration,velocity,pan});
  for(const [beat,midi,duration] of melody[i])add('reed',midi,beat,duration,i>=8&&i<12?.22:.2,-.15);
  // Stable half-note support gives the melody room; no second moving treble line.
  add('bass',root,0,i%4===3?3.4:1.8,.14);
  if(i%4!==3)add('bass',root,2,1.7,.1);
  for(const pitch of voicing){
    add('keys',pitch-12,0,1.7,.038,.25);
    if(i%4!==3)add('keys',pitch-12,2,1.5,.028,.25);
  }
  // The lifted phrase adds a sustained layer, then drops back for the cadence.
  if(i>=8&&i<12)for(const pitch of voicing)add('strings',pitch-12,0,3.5,.014,.4);
  if(i%4!==3){add('hat',42,1,.08,.018,.4);add('hat',42,3,.08,.015,.4);}
  return notes;
}
