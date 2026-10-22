import { octave, transpose, type Pitch } from './tuning';
import type { Note } from './score';

type Tune=[number,Pitch,number][][];
const chords={
  em:{root:'E2',notes:['G3','B3','E4']},c:{root:'C2',notes:['G3','C4','E4']},b:{root:'B1',notes:['F#3','B3','D#4']},
  g:{root:'G2',notes:['G3','B3','D4']},am:{root:'A2',notes:['A3','C4','E4']},
  f:{root:'F2',notes:['A3','C4','F4']},dm:{root:'D2',notes:['A3','D4','F4']},
} satisfies Record<string,{root:Pitch;notes:Pitch[]}>;
export const SIDING_HARMONY=['em','em','c','b','em','g','am','b','c','g','am','b','em','c','b','em'] as const;
export const WARD_HARMONY=['c','c','f','g','am','am','dm','g','f','c','dm','g','c','f','g','c'] as const;

// E minor: a short pickup-shaped call, an answering descent, a bridge and a full cadence.
const siding:Tune=[
  [[0,'B4',.5],[.75,'E5',1.25],[2.5,'F#5',.5],[3,'G5',.75]],
  [[0,'E5',1.5],[2,'B4',1.5]],
  [[0,'E5',1],[1.5,'C5',.5],[2.5,'G4',1]],
  [[0,'D#5',1.5],[2,'F#5',.75],[3,'B4',.75]],
  [[0,'B4',.5],[.75,'E5',1.25],[2.5,'F#5',.5],[3,'G5',.75]],
  [[0,'D5',1.5],[2,'B4',.5],[3,'G4',.75]],
  [[0,'C5',1],[1.5,'E5',.75],[2.5,'A4',1]],
  [[0,'D#5',1.5],[2.5,'B4',1]],
  [[0,'G5',1.5],[2,'E5',.5],[3,'C5',.75]],
  [[0,'D5',1.5],[2,'B4',.5],[3,'G4',.75]],
  [[0,'C5',.75],[1,'E5',.75],[2.5,'A4',1]],
  [[0,'D#5',1],[1.5,'F#5',.75],[3,'B4',.75]],
  [[0,'B4',.5],[.75,'E5',1.25],[2.5,'F#5',.5],[3,'G5',.75]],
  [[0,'E5',1.5],[2,'C5',1.5]],
  [[0,'D#5',1],[1.5,'F#5',.5],[2.5,'B4',1]],
  [[0,'E5',3.25]],
];

// C major in 3/4: the right hand sings on the quarter-note pulse, with a bass
// downbeat and soft left-hand chords on two and three. No displaced 4/4 accents.
const ward:Tune=[
  [[0,'C5',2],[2,'E5',.75]],[[0,'G5',1],[1,'E5',.75],[2,'C5',.75]],
  [[0,'F5',1.5],[2,'C5',.75]],[[0,'D5',2],[2,'B4',.75]],
  [[0,'C5',2],[2,'E5',.75]],[[0,'E5',1],[1,'C5',.75],[2,'A4',.75]],
  [[0,'F5',1],[1,'D5',1.5]],[[0,'B4',2.5]],
  [[0,'A4',1],[1,'C5',.75],[2,'F5',.75]],[[0,'E5',2],[2,'C5',.75]],
  [[0,'D5',1],[1,'F5',.75],[2,'A4',.75]],[[0,'B4',2],[2,'D5',.75]],
  [[0,'C5',2],[2,'E5',.75]],[[0,'F5',1.5],[2,'C5',.75]],
  [[0,'D5',1],[1,'B4',1.5]],[[0,'C5',2.5]],
];

export function scoreC(mode:'cinderbank'|'infirmary'|'shunting',bar:number):Note[]{
  const index=((bar%16)+16)%16,quiet=mode==='infirmary',battle=mode==='shunting';
  const {root,notes:voicing}=chords[(quiet?WARD_HARMONY:SIDING_HARMONY)[index]],notes:Note[]=[];
  const add=(instrument:Note['instrument'],pitch:Pitch,beat:number,duration:number,velocity:number,pan=0)=>notes.push({instrument,pitch,beat,duration,velocity,pan});
  for(const [beat,pitch,duration] of (quiet?ward:siding)[index])add(quiet?'keys':'reed',pitch,beat,duration*(mode==='shunting'?.85:1),quiet?.22:battle?.23:.2,-.15);
  if(quiet){
    add('round-bass',root,0,index===15?2.8:2.65,.115,-.1);
    for(const beat of (index%4===3?[1]:[1,2]))for(const pitch of voicing)add('keys',pitch,beat,.65,beat===1?.033:.024,.25);
    if(index>=8&&index<12)for(const pitch of voicing)add('strings',pitch,0,2.8,.018,.2);
    return notes;
  }else if(battle){
    const broad=index>=8&&index<12,end=index%4===3;
    for(const beat of (end?[0]:index%2?[0,2.5]:[0,1.5,3]))for(const pitch of voicing)add('keys',pitch,beat,.4,beat===0?.045:.028,.25);
    for(const beat of (end?[0,2.5]:broad?[0,2]:index%2?[0,1.5,3]:[0,.75,2.5]))add('round-bass',transpose(root,beat===2.5?'P5':'P1'),beat,.6,beat===0?.17:.11,-.1);
    for(const beat of (end?[0]:broad?[0,2.5]:[0,2]))add('kick','C2',beat,.18,.1);
    for(const beat of (end?[1]:broad?[2]:[1,3]))add('snare','D2',beat,.16,.06,-.15);
    for(const beat of (end?[.5,1.5]:index%2?[.5,2,3.5]:[.5,1.5,2.5,3.5]))add('hat','F#2',beat,.07,.022,.4);
    if(index===6||index===14)for(const beat of [3.25,3.75])add('snare','D2',beat,.1,.035,-.15);
    if(broad)for(const pitch of voicing)add('strings',pitch,0,3.5,.016,.2);
  }else{
    for(const pitch of voicing)add('keys',pitch,0,1.4,.035,.25);
    if(index!==15)for(const pitch of voicing.slice(1))add('keys',pitch,2.5,1,.025,.25);
    if(index===1||index===5||index===9)add('bell',octave(voicing[2],1),3.5,.45,.04,.4);
    if(index>=8&&index<12)for(const pitch of voicing)add('strings',pitch,0,3.6,.018,.2);
  }
  if(!battle){add('bass',root,0,index===15?3.4:2.75,.15,-.1);if(index!==15)add('bass',transpose(root,'P5'),3,.65,.065,-.1);}
  return notes;
}
