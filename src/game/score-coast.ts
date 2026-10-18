import type { Note } from './score';
// Harbor call, answer, a lifted middle phrase and a quieter return. Original melody.
// C–Bm7b5–Em7–Am–Gm7–C7–F–Em–Dm–G–C, extended to sixteen bars.
const chords = [
  [36,60,64,67],[35,59,62,65],[40,59,62,67],[45,60,64,69],
  [43,58,62,65],[36,58,64,67],[41,60,65,69],[40,59,64,67],
  [38,60,65,69],[43,59,62,67],[36,60,64,67],[45,60,64,69],
  [41,60,65,69],[38,60,65,69],[43,59,62,67],[36,60,64,67],
];
const melody: [number,number,number][][] = [
  [[0,72,1.5],[2,76,.5],[3,79,.75]], [[0,77,1],[1.5,74,.5],[2.5,71,1]],
  [[0,74,1.5],[2,79,1]], [[0,76,2],[3,72,.5]],
  [[0,74,1],[1.5,77,.5],[2.5,82,1]], [[0,79,1.5],[2,76,1]],
  [[0,77,2],[3,81,.5]], [[0,79,1.5],[2,76,1]],
  [[0,81,1.5],[2,77,.5],[3,84,.75]], [[0,83,1],[1.5,79,.5],[2.5,74,1]],
  [[0,76,2],[3,79,.5]], [[0,81,1],[2,76,1.5]],
  [[0,77,1.5],[2,76,.5],[3,72,.75]], [[0,74,2],[3,69,.5]],
  [[0,71,1],[1.5,74,.5],[2.5,79,1]], [[0,72,3]],
];
export function coastBar(bar: number): Note[] {
  const i=((bar%16)+16)%16, [root,...voicing]=chords[i], notes:Note[]=[];
  const add=(instrument:Note['instrument'],midi:number,beat:number,duration:number,velocity:number,pan=0)=>notes.push({instrument,midi,beat,duration,velocity,pan});
  for(const [beat,midi,duration] of melody[i])add('reed',midi,beat,duration,.23,-.2);
  add('bass',root,0,2.8,.15);if(i%4!==3)add('bass',root+7,3,.7,.09);
  for(const [n,pitch] of voicing.entries())add('keys',pitch,n*.75,1.5,.045,.3);
  if(i>=8&&i<12)for(const pitch of voicing)add('strings',pitch-12,0,3.7,.018,.4);
  if(i%4!==3){add('hat',42,1.5,.08,.026,.45);add('hat',42,3.5,.08,.022,.45);}
  if(i===7||i===15)add('bell',voicing[0]+12,3,1.25,.055,.5);
  return notes;
}
