import type { Note } from './score';
export type ReturnMode='refuge'|'breakwater'|'sanctuary'|'four-battle';
// One returning melody across four arrangements. Open voicings never force a dominant cadence.
const harmony=[{root:36,chord:[52,55,59,62]},{root:38,chord:[54,57,62,64]},{root:31,chord:[50,54,57,59]},{root:29,chord:[48,52,57,60]}];
const melody:[number,number,number][][]=[
 [[0,76,1.5],[2,79,.5],[3,81,.75]],[[0,79,1.5],[2,76,.75]],
 [[0,74,1],[1.5,78,.5],[2,81,1.5]],[[0,83,1.5],[2,81,.75],[3,79,.5]],
 [[0,79,1.5],[2,81,.75]],[[0,83,1],[1.5,81,.5],[2,79,1.5]],
 [[0,76,1.5],[2,79,.75]],[[0,72,2.5]],
 [[0,83,2],[3,86,.75]],[[0,83,1],[2,81,1.5]],
 [[0,81,1.5],[2,86,.75]],[[0,85,1.5],[2,81,1]],
 [[0,83,1.5],[2,81,.75]],[[0,79,1],[2,78,1.5]],
 [[0,76,1.5],[2,74,.75]],[[0,72,3]],
];
export function returnBar(mode:ReturnMode,bar:number):Note[]{
 const i=((bar%16)+16)%16,{root,chord}=harmony[Math.floor(i/2)%4],notes:Note[]=[];
 const sacred=mode==='sanctuary',battle=mode==='four-battle',works=mode==='breakwater';
 const add=(instrument:Note['instrument'],midi:number,beat:number,duration:number,velocity:number,pan=0)=>notes.push({instrument,midi,beat,duration,velocity,pan});
 const lead=sacred?'bell':works?'keys':'reed',gain=sacred?.105:battle?.21:works?.16:.17;
 for(const [beat,pitch,duration] of melody[i])add(lead,pitch-(sacred?12:0),beat,duration,gain,-.15);
 add('bass',root,0,battle?1.1:3.1,battle?.18:.12);
 if(battle||works)add('bass',root+7,2.5,1,.08);
 for(const p of chord)add('strings',p,0,3.7,sacred?.019:.014,p%2?.3:-.3);
 if(!sacred){
  for(const p of chord.slice(0,3))add('keys',p,0,1.3,battle?.035:.025,.25);
  if(i%4!==3)for(const p of chord.slice(1))add('keys',p,2.25,1,.02,.25);
 }else if(i%2===1)add('keys',chord[1],2,1.4,.035,.3);
 // The lifted phrase adds one quiet answer; the last bar leaves the melody room to finish.
 if(i===9||i===13)add(sacred?'reed':'bell',chord[2]+12,3.25,.6,.035,.35);
 if(battle||works){
  const gain=battle?.085:.025;add('kick',36,0,.2,gain);if(i!==15)add('kick',36,2,.2,gain*.8);
  for(const beat of [1,3])add('snare',38,beat,.15,gain*.5,-.1);
  if(i%4!==3)for(const beat of [.5,1.5,2.5,3.5])add('hat',42,beat,.08,gain*.22,.35);
 }
 return notes;
}
