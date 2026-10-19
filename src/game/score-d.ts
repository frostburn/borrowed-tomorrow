import { octave, transpose, type Pitch } from './tuning';
import type { Note } from './score';

// The user's Evangelion harmony reference; the melodies below are original.
export const NORTHGLASS_HARMONY=['f','em','am','dm','g','gm7','c7','f'] as const;
export const NORTHGLASS_CHORDS={
  f:{root:'F2',notes:['F3','A3','C4','F4']},em:{root:'E2',notes:['E3','G3','B3','E4']},
  am:{root:'A2',notes:['E3','A3','C4','E4']},dm:{root:'D2',notes:['F3','A3','D4','F4']},
  g:{root:'G2',notes:['G3','B3','D4','G4']},gm7:{root:'G2',notes:['F3','Bb3','D4','G4']},
  c7:{root:'C2',notes:['E3','Bb3','C4','G4']},
} satisfies Record<string,{root:Pitch;notes:Pitch[]}>;
type Tune=[number,Pitch,number][][];
const yard:Tune=[
  [[0,'A4',1.25],[1.5,'C5',.5],[2.5,'E5',.5],[3.25,'C5',.5]],
  [[0,'B4',1],[1.5,'G4',.5],[2.5,'E4',1]],
  [[0,'A4',1.5],[2,'C5',.5],[3,'E5',.75]],
  [[0,'D5',1],[1.5,'C5',.5],[2.5,'A4',1]],
  [[0,'B4',1.5],[2,'D5',.5],[3,'G5',.75]],
  [[0,'F5',1],[1.5,'D5',.5],[2.5,'Bb4',1]],
  [[0,'E5',.75],[1,'D5',.5],[2,'Bb4',.75],[3,'G4',.75]],
  [[0,'A4',2.5],[3.25,'C5',.5]],
  [[0,'F5',1.5],[2,'E5',.5],[3,'C5',.75]],
  [[0,'E5',1],[1.5,'B4',.5],[2.5,'G4',1]],
  [[0,'C5',1.5],[2,'E5',.5],[3,'A4',.75]],
  [[0,'D5',1.5],[2,'F5',1.25]],
  [[0,'G5',1],[1.5,'D5',.5],[2.5,'B4',1]],
  [[0,'F5',1.5],[2,'D5',.5],[3,'Bb4',.75]],
  [[0,'E5',1],[1.5,'D5',.5],[2.5,'Bb4',.5],[3.25,'G4',.5]],
  [[0,'C5',3.25]],
];
const bridge:Tune=[
  [[0,'A5',1.5],[2,'G5',.5],[3,'F5',.75]],[[0,'G5',1],[1.5,'E5',.5],[2.5,'B4',1]],
  [[0,'E5',1.5],[2,'A5',1.25]],[[0,'F5',1.5],[2,'D5',.75],[3,'C5',.75]],
  [[0,'G5',1.5],[2,'D5',.5],[3,'B4',.75]],[[0,'F5',1],[1.5,'D5',.5],[2.5,'Bb4',1]],
  [[0,'E5',.75],[1,'D5',.5],[2,'Bb4',.75],[3,'G4',.75]],[[0,'A4',3.25]],
];
const hall:Tune=[
  [[0,'C5',2],[2.5,'A4',1]],[[0,'G4',1.5],[2,'B4',1.5]],
  [[0,'C5',1.5],[2,'E5',1.25]],[[0,'F5',2],[2.5,'D5',1]],
  [[0,'D5',1.5],[2,'B4',.5],[3,'G4',.75]],[[0,'Bb4',2],[2.5,'D5',1]],
  [[0,'Bb4',1.5],[2,'G4',1]],[[0,'A4',3.25]],
  [[0,'F5',2],[2.5,'C5',1]],[[0,'E5',1.5],[2,'B4',.5],[3,'G4',.75]],
  [[0,'A4',2],[2.5,'C5',1]],[[0,'D5',1.5],[2,'F5',1.25]],
  [[0,'G5',2],[2.5,'D5',1]],[[0,'F5',1.5],[2,'D5',.5],[3,'Bb4',.75]],
  [[0,'E5',1.5],[2,'Bb4',1]],[[0,'F5',3.25]],
];
const hallBridge:Tune=[
  [[0,'F5',1.5],[2,'A5',1],[3.25,'G5',.5]],[[0,'G5',2],[2.5,'E5',1]],
  [[0,'E5',1.5],[2,'C5',.5],[3,'A4',.75]],[[0,'D5',2],[2.5,'A4',1]],
  [[0,'B4',1.5],[2,'D5',1.25]],[[0,'Bb4',1],[1.5,'D5',.5],[2.5,'F5',1]],
  [[0,'E5',1.5],[2,'Bb4',1]],[[0,'C5',1.5],[2,'A4',1.25]],
];

/** A 32-bar tune: opening, answer, lifted bridge, varied return. */
export function scoreD(mode:'northglass'|'relayhall'|'switching',bar:number):Note[]{
  const index=((bar%32)+32)%32,quiet=mode==='relayhall',battle=mode==='switching';
  const {root,notes:chord}=NORTHGLASS_CHORDS[NORTHGLASS_HARMONY[index%8]],out:Note[]=[];
  const add=(instrument:Note['instrument'],pitch:Pitch,beat:number,duration:number,velocity:number,pan=0)=>out.push({instrument,pitch,beat,duration,velocity,pan});
  const middle=index>=16&&index<24;
  const tune=quiet?(middle?hallBridge[index-16]:hall[index<16?index:index-24]):middle?bridge[index-16]:yard[index<16?index:index-24];
  const lead=quiet?'reed':battle?'reed':'keys';
  for(const [beat,pitch,duration] of tune){
    const resolved=index===31?'F5':pitch;
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
    for(const beat of [1,2,3])add('bass',transpose(root,beat===2?'P5':'P1'),beat,.65,.16,-.15);
  }else if(index%8!==7)add('bass',transpose(root,index%8===6?'m7':'P5'),3,.65,.075,-.15);
  if([1,9,17,23].includes(index))add('bell',octave(chord[3],1),3.5,.4,.04,.5);
  if(!quiet){
    const gain=battle?.12:.035;
    add('kick','C2',0,.16,gain);if(index%8!==7)add('kick','C2',2,.15,gain*.75);
    for(const beat of [1,3])add('snare','D2',beat,.12,gain*.48,-.2);
    for(let beat=.5;beat<4;beat+=battle?.5:1)add('hat','F#2',beat,.07,gain*.2,.45);
    if(battle&&index%8===6)for(const beat of [3.25,3.5,3.75])add('snare','D2',beat,.1,gain*.25,-.2);
  }
  return out;
}
