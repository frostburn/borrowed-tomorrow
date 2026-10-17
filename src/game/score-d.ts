import type { Note } from './score';

// The user's Evangelion harmony reference; the melodies below are original.
export const NORTHGLASS_HARMONY=['f','em','am','dm','g','gm7','c7','f'] as const;
export const NORTHGLASS_CHORDS={
  f:{root:41,notes:[53,57,60,65]},em:{root:40,notes:[52,55,59,64]},
  am:{root:45,notes:[52,57,60,64]},dm:{root:38,notes:[53,57,62,65]},
  g:{root:43,notes:[55,59,62,67]},gm7:{root:43,notes:[53,58,62,67]},
  c7:{root:36,notes:[52,58,60,67]},
};
type Tune=[number,number,number][][];
const yard:Tune=[
  [[0,69,1.25],[1.5,72,.5],[2.5,76,.5],[3.25,72,.5]],
  [[0,71,1],[1.5,67,.5],[2.5,64,1]],
  [[0,69,1.5],[2,72,.5],[3,76,.75]],
  [[0,74,1],[1.5,72,.5],[2.5,69,1]],
  [[0,71,1.5],[2,74,.5],[3,79,.75]],
  [[0,77,1],[1.5,74,.5],[2.5,70,1]],
  [[0,76,.75],[1,74,.5],[2,70,.75],[3,67,.75]],
  [[0,69,2.5],[3.25,72,.5]],
  [[0,77,1.5],[2,76,.5],[3,72,.75]],
  [[0,76,1],[1.5,71,.5],[2.5,67,1]],
  [[0,72,1.5],[2,76,.5],[3,69,.75]],
  [[0,74,1.5],[2,77,1.25]],
  [[0,79,1],[1.5,74,.5],[2.5,71,1]],
  [[0,77,1.5],[2,74,.5],[3,70,.75]],
  [[0,76,1],[1.5,74,.5],[2.5,70,.5],[3.25,67,.5]],
  [[0,72,3.25]],
];
const bridge:Tune=[
  [[0,81,1.5],[2,79,.5],[3,77,.75]],[[0,79,1],[1.5,76,.5],[2.5,71,1]],
  [[0,76,1.5],[2,81,1.25]],[[0,77,1.5],[2,74,.75],[3,72,.75]],
  [[0,79,1.5],[2,74,.5],[3,71,.75]],[[0,77,1],[1.5,74,.5],[2.5,70,1]],
  [[0,76,.75],[1,74,.5],[2,70,.75],[3,67,.75]],[[0,69,3.25]],
];
const hall:Tune=[
  [[0,72,2],[2.5,69,1]],[[0,67,1.5],[2,71,1.5]],
  [[0,72,1.5],[2,76,1.25]],[[0,77,2],[2.5,74,1]],
  [[0,74,1.5],[2,71,.5],[3,67,.75]],[[0,70,2],[2.5,74,1]],
  [[0,70,1.5],[2,67,1]],[[0,69,3.25]],
  [[0,77,2],[2.5,72,1]],[[0,76,1.5],[2,71,.5],[3,67,.75]],
  [[0,69,2],[2.5,72,1]],[[0,74,1.5],[2,77,1.25]],
  [[0,79,2],[2.5,74,1]],[[0,77,1.5],[2,74,.5],[3,70,.75]],
  [[0,76,1.5],[2,70,1]],[[0,77,3.25]],
];
const hallBridge:Tune=[
  [[0,77,1.5],[2,81,1],[3.25,79,.5]],[[0,79,2],[2.5,76,1]],
  [[0,76,1.5],[2,72,.5],[3,69,.75]],[[0,74,2],[2.5,69,1]],
  [[0,71,1.5],[2,74,1.25]],[[0,70,1],[1.5,74,.5],[2.5,77,1]],
  [[0,76,1.5],[2,70,1]],[[0,72,1.5],[2,69,1.25]],
];

/** A 32-bar tune: opening, answer, lifted bridge, varied return. */
export function scoreD(mode:'northglass'|'relayhall'|'switching',bar:number):Note[]{
  const index=((bar%32)+32)%32,quiet=mode==='relayhall',battle=mode==='switching';
  const {root,notes:chord}=NORTHGLASS_CHORDS[NORTHGLASS_HARMONY[index%8]],out:Note[]=[];
  const add=(instrument:Note['instrument'],midi:number,beat:number,duration:number,velocity:number,pan=0)=>out.push({instrument,midi,beat,duration,velocity,pan});
  const middle=index>=16&&index<24;
  const tune=quiet?(middle?hallBridge[index-16]:hall[index<16?index:index-24]):middle?bridge[index-16]:yard[index<16?index:index-24];
  const lead=quiet?'reed':battle?'reed':'keys';
  for(const [beat,pitch,duration] of tune){
    const resolved=index===31?77:pitch;
    add(lead,resolved,beat,duration,quiet?.17:battle?.23:.23,-.12);
  }
  // Comping has space; the melody carries the movement through the borrowed Gm7.
  for(const pitch of chord){
    if(quiet)add('strings',pitch,0,3.8,.023,.2);
    else {add('keys',pitch,0,.9,battle?.047:.035,.3);if(index%8!==7)add('keys',pitch,2.5,.7,battle?.035:.025,.3);}
  }
  if(quiet){add('keys',chord[0],0,1.5,.045,.3);add('keys',chord[2],2,1.4,.035,.3);}
  add('bass',root,0,quiet?3.25:battle?.8:2.4,quiet?.11:battle?.2:.14,-.15);
  if(battle){
    for(const beat of [1,2,3])add('bass',root+(beat===2?7:0),beat,.65,.16,-.15);
  }else if(index%8!==7)add('bass',root+(index%8===6?10:7),3,.65,.075,-.15);
  if([1,9,17,23].includes(index))add('bell',chord[3]+12,3.5,.4,.04,.5);
  if(!quiet){
    const gain=battle?.12:.035;
    add('kick',36,0,.16,gain);if(index%8!==7)add('kick',36,2,.15,gain*.75);
    for(const beat of [1,3])add('snare',38,beat,.12,gain*.48,-.2);
    for(let beat=.5;beat<4;beat+=battle?.5:1)add('hat',42,beat,.07,gain*.2,.45);
    if(battle&&index%8===6)for(const beat of [3.25,3.5,3.75])add('snare',38,beat,.1,gain*.25,-.2);
  }
  return out;
}
