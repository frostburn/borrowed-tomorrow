import type { Note } from './score';

type Tune=[number,number,number][][];
const chords={
  em:{root:40,notes:[55,59,64]},c:{root:36,notes:[55,60,64]},b:{root:35,notes:[54,59,63]},
  g:{root:43,notes:[55,59,62]},am:{root:45,notes:[57,60,64]},
  f:{root:41,notes:[57,60,65]},dm:{root:38,notes:[57,62,65]},
};
export const SIDING_HARMONY=['em','em','c','b','em','g','am','b','c','g','am','b','em','c','b','em'] as const;
export const WARD_HARMONY=['c','c','f','g','am','am','dm','g','f','c','dm','g','c','f','g','c'] as const;

// E minor: a short pickup-shaped call, an answering descent, a bridge and a full cadence.
const siding:Tune=[
  [[0,71,.5],[.75,76,1.25],[2.5,78,.5],[3,79,.75]],
  [[0,76,1.5],[2,71,1.5]],
  [[0,76,1],[1.5,72,.5],[2.5,67,1]],
  [[0,75,1.5],[2,78,.75],[3,71,.75]],
  [[0,71,.5],[.75,76,1.25],[2.5,78,.5],[3,79,.75]],
  [[0,74,1.5],[2,71,.5],[3,67,.75]],
  [[0,72,1],[1.5,76,.75],[2.5,69,1]],
  [[0,75,1.5],[2.5,71,1]],
  [[0,79,1.5],[2,76,.5],[3,72,.75]],
  [[0,74,1.5],[2,71,.5],[3,67,.75]],
  [[0,72,.75],[1,76,.75],[2.5,69,1]],
  [[0,75,1],[1.5,78,.75],[3,71,.75]],
  [[0,71,.5],[.75,76,1.25],[2.5,78,.5],[3,79,.75]],
  [[0,76,1.5],[2,72,1.5]],
  [[0,75,1],[1.5,78,.5],[2.5,71,1]],
  [[0,76,3.25]],
];

// C major: a separate, slower receiving-hall melody, with space after each answer.
const ward:Tune=[
  [[0,72,2],[2.5,76,1]],[[0,79,1.5],[2,76,.5],[3,72,.75]],
  [[0,77,1.5],[2,72,.75],[3,69,.75]],[[0,74,2],[2.5,71,1]],
  [[0,72,2],[2.5,76,1]],[[0,76,1.5],[2,72,.5],[3,69,.75]],
  [[0,77,1.5],[2,74,1]],[[0,71,2.5]],
  [[0,69,1.5],[2,72,.5],[3,77,.75]],[[0,76,2],[2.5,72,1]],
  [[0,74,1.5],[2,77,.5],[3,69,.75]],[[0,71,2],[2.5,74,1]],
  [[0,72,2],[2.5,76,1]],[[0,77,1.5],[2,72,1]],
  [[0,74,1.5],[2,71,1]],[[0,72,3.25]],
];

export function scoreC(mode:'cinderbank'|'infirmary'|'shunting',bar:number):Note[]{
  const index=((bar%16)+16)%16,quiet=mode==='infirmary',battle=mode==='shunting';
  const {root,notes:voicing}=chords[(quiet?WARD_HARMONY:SIDING_HARMONY)[index]],notes:Note[]=[];
  const add=(instrument:Note['instrument'],midi:number,beat:number,duration:number,velocity:number,pan=0)=>notes.push({instrument,midi,beat,duration,velocity,pan});
  for(const [beat,pitch,duration] of (quiet?ward:siding)[index])add(quiet?'keys':'reed',pitch,beat,duration,quiet?.22:battle?.24:.2,-.15);
  for(const pitch of voicing){
    if(quiet)add('strings',pitch,0,3.65,.022,.2);
    else add('keys',pitch,0,1.4,battle?.05:.035,.25);
  }
  if(quiet){
    // Soft broken support below the melody; no competing piano line.
    add('keys',voicing[0],0,2,.04,.25);add('keys',voicing[1],2,1.5,.035,.25);
    if([3,7,11,14].includes(index))add('bell',voicing[2]+12,3.5,.45,.035,.45);
  }else if(battle){
    for(let beat=.5;beat<4;beat+=.5)add('keys',voicing[(beat*2)%3],beat,.28,.065,.3);
    for(const beat of [0,1.5,2.5])add('bass',root+(beat===2.5?7:0),beat,.7,.22,-.1);
    for(const beat of [0,2])add('kick',36,beat,.2,.16);
    for(const beat of [1,3])add('snare',38,beat,.18,.09,-.15);
    for(const beat of [.5,1.5,2.5,3.5])add('hat',42,beat,.08,.03,.4);
  }else{
    if(index!==15)for(const pitch of voicing.slice(1))add('keys',pitch,2.5,1,.025,.25);
    if(index===1||index===5||index===9)add('bell',voicing[2]+12,3.5,.45,.04,.4);
    if(index>=8&&index<12)for(const pitch of voicing)add('strings',pitch,0,3.6,.018,.2);
  }
  if(!battle){add('bass',root,0,index===15?3.4:2.75,quiet?.115:.15,-.1);if(index!==15&&!quiet)add('bass',root+7,3,.65,.065,-.1);}
  return notes;
}
