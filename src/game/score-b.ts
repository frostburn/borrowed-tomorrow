import type { Note } from './score';
// A sixteen-bar G-minor tune, with a brighter first phrase for the festival morning.
const melody:[number,number,number][][]=[
  [[0,79,1],[1.5,81,.5],[2,82,1.5],[4,86,2],[7,84,.75],[8,82,1],[10,79,2],[13,77,1.5]],
  [[0,79,1.5],[2,82,.75],[3,81,.5],[4,79,2.5],[8,74,1],[9.5,77,.5],[10,79,1.5],[13,81,2]],
  [[0,82,2],[3,86,.75],[4,89,1],[6,86,1.5],[8,84,2],[11,82,.75],[12,81,2.5]],
  [[0,79,1],[2,77,1],[4,74,2],[7,77,.75],[8,79,2],[12,79,3.5]],
];
const roots=[43,46,39,41,43,39,48,38,46,41,39,38,43,39,38,43];
export function scoreB(mode:'rillbridge'|'sluice'|'flood',bar:number):Note[]{
  const index=((bar%16)+16)%16,phrase=Math.floor(index/4),within=index%4,root=roots[index],flood=mode==='flood',quiet=mode==='sluice';
  const chord=[root,root+([43,48].includes(root)?3:4),root+7],notes:Note[]=[];
  const add=(instrument:Note['instrument'],midi:number,beat:number,duration:number,velocity:number,pan=0)=>notes.push({instrument,midi,beat,duration,velocity,pan});
  for(const [beat,pitch,duration] of melody[phrase])if(beat>=within*4&&beat<within*4+4){
    add(quiet?'bell':'reed',pitch-(quiet?12:0),beat-within*4,duration,quiet?.18:flood?.32:.27,-.2);
  }
  if(index===6||index===10||index===14){add('strings',root+19,1,1.5,.12,.4);add('strings',root+15,3,.8,.1,.4);}
  if(flood){
    for(let beat=0;beat<4;beat+=.5)add('keys',chord[[0,2,1,2][Math.round(beat*2)%4]]+12,beat,.3,.11,.3);
    for(const beat of [0,1.5,2.5])add('bass',root-12+(beat===2.5?7:0),beat,.85,.25);
    for(const beat of [0,2])add('kick',36,beat,.2,.19);
    for(const beat of [1,3])add('snare',38,beat,.18,.12,-.1);
    for(const beat of [.5,1.5,2.5,3.5])add('hat',42,beat,.08,.045,.4);
    if(index===7||index===15)for(const beat of [3.25,3.5,3.75])add('snare',38,beat,.12,.065,-.1);
  }else{
    for(const beat of (within===3?[0,2.5]:[0,1.5,3]))add('keys',chord[beat===1.5?2:1]+12,beat,1.2,quiet?.065:.12,.35);
    add('bass',root-12,0,2.8,.18,-.1);
    if(index===3||index===11){add('bass',root-5,3,.45,.12);add('bass',root-3,3.5,.4,.1);}
    if(!quiet&&index%4!==3){add('hat',42,1.5,.08,.028,.5);add('hat',42,3.5,.08,.022,.5);}
  }
  if(quiet||phrase===2)for(const p of chord)add('strings',p,0,3.8,quiet?.065:.045,.15);
  return notes;
}
