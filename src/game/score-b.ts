import { octave, transpose, type Pitch } from './tuning';
import type { Note } from './score';
// A sixteen-bar G-minor tune, with a brighter first phrase for the festival morning.
const melody:[number,Pitch,number][][]=[
  [[0,'G5',1],[1.5,'A5',.5],[2,'Bb5',1.5],[4,'D6',2],[7,'C6',.75],[8,'Bb5',1],[10,'G5',2],[13,'F5',1.5]],
  [[0,'G5',1.5],[2,'Bb5',.75],[3,'A5',.5],[4,'G5',2.5],[8,'D5',1],[9.5,'F5',.5],[10,'G5',1.5],[13,'A5',2]],
  [[0,'Bb5',2],[3,'D6',.75],[4,'F6',1],[6,'D6',1.5],[8,'C6',2],[11,'Bb5',.75],[12,'A5',2.5]],
  [[0,'G5',1],[2,'F5',1],[4,'D5',2],[7,'F5',.75],[8,'G5',2],[12,'G5',3.5]],
];
const roots:Pitch[]=['G2','Bb2','Eb2','F2','G2','Eb2','C3','D2','Bb2','F2','Eb2','D2','G2','Eb2','D2','G2'];
export function scoreB(mode:'rillbridge'|'sluice'|'flood',bar:number):Note[]{
  if(mode==='rillbridge')return townBar(bar);
  const index=((bar%16)+16)%16,phrase=Math.floor(index/4),within=index%4,root=roots[index],flood=mode==='flood',quiet=mode==='sluice';
  const chord=[root,transpose(root,['G2','C3'].includes(root)?'m3':'M3'),transpose(root,'P5')],notes:Note[]=[];
  const add=(instrument:Note['instrument'],pitch:Pitch,beat:number,duration:number,velocity:number,pan=0)=>notes.push({instrument,pitch,beat,duration,velocity,pan});
  for(const [beat,pitch,duration] of melody[phrase])if(beat>=within*4&&beat<within*4+4){
    add(quiet?'bell':'reed',octave(pitch,quiet?-1:0),beat-within*4,duration,quiet?.18:flood?.32:.27,-.2);
  }
  if(index===6||index===10||index===14){add('strings',transpose(root,'P12'),1,1.5,.12,.4);add('strings',octave(chord[1],1),3,.8,.1,.4);}
  if(flood){
    for(let beat=0;beat<4;beat+=.5)add('keys',octave(chord[[0,2,1,2][Math.round(beat*2)%4]],1),beat,.3,.11,.3);
    for(const beat of [0,1.5,2.5])add('bass',octave(transpose(root,beat===2.5?'P5':'P1'),-1),beat,.85,.25);
    for(const beat of [0,2])add('kick','C2',beat,.2,.19);
    for(const beat of [1,3])add('snare','D2',beat,.18,.12,-.1);
    for(const beat of [.5,1.5,2.5,3.5])add('hat','F#2',beat,.08,.045,.4);
    if(index===7||index===15)for(const beat of [3.25,3.5,3.75])add('snare','D2',beat,.12,.065,-.1);
  }else{
    for(const beat of (within===3?[0,2.5]:[0,1.5,3]))add('keys',octave(chord[beat===1.5?2:1],1),beat,1.2,quiet?.065:.12,.35);
    add('bass',octave(root,-1),0,2.8,.18,-.1);
    if(index===3||index===11){add('bass',transpose(root,'-P4'),3,.45,.12);add('bass',transpose(root,'-m3'),3.5,.4,.1);}
    if(!quiet&&index%4!==3){add('hat','F#2',1.5,.08,.028,.5);add('hat','F#2',3.5,.08,.022,.5);}
  }
  if(quiet||phrase===2)for(const p of chord)add('strings',p,0,3.8,quiet?.065:.045,.15);
  return notes;
}

// A recurring two-bar tune, answered over a half cadence, with a contrasting bridge.
// Chord voicings move by small intervals and the lead stays within one octave.
const townChords={
  gm:{root:'G2',voicing:['G3','Bb3','D4']},eb:{root:'Eb2',voicing:['G3','Bb3','Eb4']},
  d:{root:'D2',voicing:['F#3','A3','D4']},cm:{root:'C2',voicing:['G3','C4','Eb4']},bb:{root:'Bb1',voicing:['F3','Bb3','D4']},
} satisfies Record<string,{root:Pitch;voicing:Pitch[]}>;
const townHarmony:(keyof typeof townChords)[]=['gm','gm','eb','d','gm','gm','eb','d','cm','cm','bb','d','eb','cm','d','gm'];
const townMelody:[number,Pitch,number][][]=[
  [[0,'G4',1.5],[2,'A4',.5],[2.5,'Bb4',.5],[3,'D5',.75]],
  [[0,'Bb4',1.5],[2,'A4',.5],[2.5,'G4',1]],
  [[0,'G4',1],[1.5,'Bb4',.5],[2,'G4',1.5]],
  [[0,'A4',1.5],[2,'F#4',1]],
  [[0,'G4',1.5],[2,'A4',.5],[2.5,'Bb4',.5],[3,'D5',.75]],
  [[0,'Bb4',1],[1.5,'A4',.5],[2,'G4',1.5]],
  [[0,'Bb4',1],[1.5,'G4',.5],[2,'Eb4',1.5]],
  [[0,'F#4',1],[1.5,'A4',.5],[2,'D5',1.5]],
  [[0,'Eb5',1.5],[2,'D5',.5],[2.5,'C5',1]],
  [[0,'G4',1],[1.5,'C5',.5],[2,'Eb5',1.5]],
  [[0,'D5',1.5],[2,'C5',.5],[2.5,'Bb4',1]],
  [[0,'A4',1.5],[2,'F#4',1]],
  [[0,'G4',1],[1.5,'Bb4',.5],[2,'G4',1.5]],
  [[0,'G4',1],[1.5,'C5',.5],[2,'Eb5',1.5]],
  [[0,'D5',1],[1.5,'A4',.5],[2,'F#4',1.5]],
  [[0,'G4',3]],
];
function townBar(bar:number):Note[]{
  const index=((bar%16)+16)%16,{root,voicing}=townChords[townHarmony[index]],notes:Note[]=[];
  const add=(instrument:Note['instrument'],pitch:Pitch,beat:number,duration:number,velocity:number,pan=0)=>notes.push({instrument,pitch,beat,duration,velocity,pan});
  for(const [beat,pitch,duration] of townMelody[index])add('reed',pitch,beat,duration,.2,-.12);
  for(const pitch of voicing)add('keys',pitch,0,1.4,.05,.2);
  if(index!==15)for(const pitch of voicing.slice(1))add('keys',pitch,2.25,1.1,.035,.2);
  add('bass',root,0,index===15?3.4:2.6,.16,-.1);
  if(index!==15)add('bass',transpose(root,'P5'),3,.65,.075,-.1);
  if(index>=8&&index<=11)for(const pitch of voicing)add('strings',pitch,0,3.7,.02,.12);
  if(index===1||index===5)add('bell','D5',3.5,.45,.055,.3);
  if(index===9||index===13)add('bell','G5',3.5,.45,.045,.3);
  return notes;
}
