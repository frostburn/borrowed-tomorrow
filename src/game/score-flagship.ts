import type { Note, Instrument } from './score';
import { octave, transpose, type Pitch } from './tuning';
import { phrasing } from './expression';

type Line=[eighth:number,pitch:Pitch,length:number][];
const harmony={
  dm:{root:'D2',notes:['F3','A3','C4','E4']}, bb:{root:'Bb1',notes:['F3','A3','Bb3','D4']},
  gm:{root:'G2',notes:['F3','G3','Bb3','D4']}, a:{root:'A1',notes:['G3','A3','C#4','E4']},
  f:{root:'F2',notes:['E3','A3','C4','G4']}, c:{root:'C2',notes:['E3','G3','B3','D4']},
  ce:{root:'E2',notes:['G3','B3','C4','E4']}, db:{root:'Db2',notes:['F3','Ab3','C4','Eb4']},
  eb:{root:'Eb2',notes:['G3','Bb3','C4','F4']},
} satisfies Record<string,{root:Pitch;notes:Pitch[]}>;
type Chord=keyof typeof harmony;
const changes:Chord[]=[
  'dm','bb','gm','a','dm','f','bb','a',
  'dm','c','bb','a','gm','bb','a','dm',
  'f','ce','bb','dm','db','eb','gm','a',
  'dm','bb','gm','a','dm','gm','a','a',
];
// Ten eighths: two square marching steps, then two longer airborne pulses.
// The brass call leaves a half-eighth of breath before each new attack.
const call:Line[]=[
  [[0,'D5',1],[2,'A4',1],[4,'D5',2],[7,'F5',2]],
  [[0,'F5',2],[2,'D5',1],[4,'Bb4',2],[7,'C5',1],[8,'D5',1]],
  [[0,'D5',1],[1,'G5',1],[2,'F5',2],[4,'D5',3],[8,'Bb4',1]],
  [[0,'C#5',2],[2,'E5',1],[4,'G5',2],[7,'E5',2]],
  [[0,'D5',1],[2,'A4',1],[4,'F5',2],[7,'A5',2]],
  [[0,'G5',2],[2,'F5',1],[4,'E5',2],[7,'C5',2]],
  [[0,'F5',2],[3,'D5',1],[4,'Bb4',2],[7,'C5',1],[8,'D5',1]],
  [[0,'E5',2],[2,'C#5',2],[4,'A4',3],[8,'C#5',1]],
];
const answer:Line[]=[
  call[0],[[0,'E5',2],[2,'G5',1],[4,'B5',2],[7, 'Bb5',1], [8,'G5',2]],
  [[0,'F5',2],[2,'D5',1],[4,'Bb4',3],[8,'D5',1]],
  [[0,'E5',2],[2,'C#5',1],[4,'G5',2],[7,'A5',2]],
  [[0,'Bb5',2],[2,'A5',1],[4,'G5',2],[7,'F5',2]],
  [[0,'F5',3],[4,'D5',2],[7,'Bb4',2]],
  [[0,'C#5',2],[2,'E5',1],[4,'G5',2],[7,'C#5',2]],
  [[0,'D5',4],[7,'A4',2]],
];
const lift:Line[]=[
  [[0,'A5',3],[4,'G5',2],[7,'F5',2]],
  [[0,'G5',2],[3,'E5',1],[4,'C5',3],[8,'E5',1]],
  [[0,'F5',3],[4,'D5',2],[7,'A4',2]],
  [[0,'F5',4],[7,'E5',2]],
  [[0,'F5',3],[4,'Ab5',2],[7,'F5',2]],
  [[0,'G5',3],[4,'F5',2],[7,'Eb5',2]],
  [[0,'D5',2],[3,'Bb4',1],[4,'A4',2],[7,'G4',2]],
  [[0,'G4',3],[4,'C#5',2],[7,'E5',2]],
];
const reprise:Line[]=[
  call[0],call[1],call[2],[[0,'E5',2],[2,'G5',1],[4,'A5',2],[7,'G5',2]],
  [[0,'A5',2],[2,'F5',1],[4,'D5',2],[7,'F5',2]],
  [[0,'G5',2],[2,'F5',1],[4,'D5',3],[8,'Bb4',1]],
  [[0,'C#5',2],[2,'E5',1],[4,'G5',3],[8,'E5',1]],
  [[0,'C#5',1],[2,'E5',1],[4,'G5',2],[7,'E5',1],[8,'C#5',1],[9,'A4',.5]],
];
const melody=[...call,...answer,...lift,...reprise];
// Four distinct arcs: assert the command, press harder, float back into the
// string-led middle, then rebuild the march towards the last dominant pickup.
const dynamics=[.76,.81,.86,.74,.84,.91,.8,.65,.82,.9,.95,.78,.98,.86,.76,.62,.64,.68,.72,.66,.81,.87,.78,.7,.85,.89,.94,.82,1.04,.96,.88,.78];

/** Canonical bars 0–1 are a one-shot fanfare; 2–33 form the repeating battle. */
export function flagshipBar(bar:number):Note[]{
  const notes:Note[]=[];
  const strength=bar<2?(bar===0?.8:.94):dynamics[bar-2];
  const add=(instrument:Instrument,pitch:Pitch,beat:number,duration:number,velocity:number,pan=0)=>{
    const note:Note={instrument,pitch,beat,duration,velocity,pan};
    note.expression=phrasing(strength*(beat===0?1:beat>=3.5?.9:.96),instrument==='strings'||instrument==='brass'&&duration>=.7);
    notes.push(note);
  };
  if(bar<2){
    const root:Pitch=bar===0?'D2':'A1',chord:Pitch[]=bar===0?['D3','A3','D4']:['G3','C#4','E4'];
    for(const pitch of chord)add('brass',pitch,0,bar===0?1.4:2.2,.09,-.16);
    add('round-bass',root,0,3,.15);add('timpani',root,0,1.6,.22,-.2);
    add('cymbal','F#2',0,.7,bar===0?.075:.04,.4);
    for(const pitch of harmony[bar===0?'dm':'a'].notes)add('strings',pitch,.5,4.2,.02,.35);
    if(bar===0){add('brass','Bb3',3.5,.7,.12,.1);add('brass','E4',3.5,.7,.07,-.1);}
    for(const [beat,velocity]of (bar===0?[[3.5,.09],[4,.12],[4.5,.16]]:[[3,.07],[3.5,.09],[4,.12],[4.5,.17]]) as [number,number][])add('timpani',bar===0?'D2':'E2',beat,.3,velocity,-.22);
    if(bar===1)for(const beat of [4,4.25,4.5,4.75])add('snare','D2',beat,.09,.035+(beat-4)*.035,-.18);
    return notes;
  }
  const b=bar-2,{root,notes:chord}=harmony[changes[b]],middle=b>=16&&b<24,last=b%8===7;
  const lead:Instrument=middle?'strings':'brass';
  for(const [eighth,pitch,length]of melody[b])add(lead,pitch,eighth/2,Math.max(.12,length/2-(middle?.06:.1)),middle?.17:.21,-.14);
  for(const [i,pitch]of chord.entries())add('strings',pitch,0,4.6,(middle?.034:.022)/Math.sqrt(chord.length),i%2?.44:-.42);
  // The bass shares 2+2+3+3 instead of forcing an extra 4/4 backbeat into the bar.
  const fifth=transpose(root,'P5');
  for(const [beat,pitch,length]of [[0,root,.8],[1,fifth,.65],[2,root,1.2],[3.5,b%4===3?transpose(root,'m7'):fifth,last?.8:1.1]] as [number,Pitch,number][])add('round-bass',pitch,beat,length,middle?.12:.16,-.05);
  for(const beat of middle?[0,3.5]:last?[0,1]:[0,1,3.5])for(const [i,pitch]of chord.entries())add('keys',octave(pitch,0),beat,beat>=2?.8:.3,.025/Math.sqrt(chord.length),i%2?.32:-.3);
  if(middle&&b%2===1){add('brass',octave(root,1),2,.7,.065,-.3);add('brass',octave(fifth,1),3.5,.7,.055,.2);}
  for(const beat of [0,2])add('kick','C2',beat,.15,middle?.065:.1);
  for(const beat of [1,3.5])add('snare','D2',beat,.13,middle?.05:.095,-.18);
  for(let beat=0;beat<5;beat+=.5)add('hat','F#2',beat,.07,[0,1,2,3.5].includes(beat)?.025:.014,.4);
  if(b%4===0)add('timpani',root,0,1.2,middle?.09:.15,-.25);
  if(b%8===0)add('cymbal','F#2',0,.9,middle?.035:.055,.38);
  if(last){
    for(const [i,beat]of [4,4.25,4.5,4.75].entries())add('snare','D2',beat,.09,.025+i*.012,-.18);
    add('timpani',root,4,.35,.1,-.2);add('timpani',fifth,4.5,.35,.12,-.2);
  }
  return notes;
}
