import type { Note } from './score';
import { octave,type Pitch } from './tuning';
import { fretless,phrasing } from './expression';
export type DawnwatchMode='dawnwatch'|'watchbarracks'|'signalwall'|'dawn-battle'|'dawn-commander';
type Line=[number,Pitch,number][];
type Tune=Line[];
const wheelDynamics=[.68,.77,.62,.49,.67,.72,.8,.66,.63,.48,.69,.74,.6,.47,.58,.65,.56,.44,.61,.46,.66,.71,.64,.48,.73,.82,.66,.5,.71,.65,.59,.52];
// Petra's refusal: C–Db–C, then G. The narrow resistance opens into a song.
// Three-bar statements answer in three, with two bars left for the decision.
const town:Tune=[
 [[0,'C5',.6],[.75,'Db5',.4],[1.5,'C5',.75],[2.5,'G4',.75]],[[.5,'Ab4',1.5],[2.5,'G4',.75]],[[0,'F4',2.5]],
 [[.5,'Ab4',.75],[1.5,'Bb4',.5],[2.5,'C5',1]],[[0,'Db5',1.5],[2,'C5',1]],[[0,'Bb4',2.5]],
 [[.5,'E5',.75],[1.5,'Db5',.5],[2.5,'C5',.75]],[[0,'F5',2.5]],
 [[0,'F5',1.5],[2,'Eb5',.75]],[[.5,'C5',1],[2,'Ab4',1]],[[0,'Bb4',2.5]],
 [[.5,'G4',.75],[1.5,'Ab4',.5],[2.5,'E4',.75]],[[0,'F4',2.5]],[[1,'Gb4',1],[2.5,'Bb4',.75]],
 [[0,'E5',1],[1.5,'Db5',.5],[2.5,'C5',.75]],[[0,'F5',2.5]],
 [[0,'Bb4',2]],[[1,'Ab4',1.5]],[[.5,'Gb4',2]],[[0,'Eb4',2.5]],
 [[0,'F4',1.5],[2,'Ab4',1]],[[.5,'G4',1],[2,'F4',1]],[[0,'Bb4',1.5],[2,'Ab4',.75]],[[0,'E4',2.5]],
 [[0,'C5',.6],[.75,'Db5',.4],[1.5,'C5',.75],[2.5,'G4',.75]],[[.5,'Ab4',1.5],[2.5,'Bb4',.75]],
 [[0,'Db5',1.5],[2,'C5',1]],[[.5,'Eb5',1.5]],[[0,'Db5',1],[1.5,'Bb4',1]],
 [[0,'Ab4',1.5],[2,'G4',1]],[[.5,'E4',1.5]],[[0,'F4',2.75]],
];
const terrace:Tune=[
 [[0,'C5',.4],[.5,'Db5',.4],[1.5,'C5',.65],[3,'G4',.6]],[[0,'Ab4',.75],[1.5,'C5',.5],[2.5,'Bb4',.75]],
 [[0,'Ab4',1],[1.5,'F4',1.5]],[[.5,'Ab4',.5],[1.5,'Bb4',.5],[2.5,'C5',.75]],
 [[0,'Db5',.75],[1.5,'C5',.5],[2.5,'Bb4',.75]],[[0,'G4',1],[1.5,'F4',.5],[2.5,'E4',.75]],
 [[0,'Db5',1],[1.5,'C5',1]],[[0,'F4',2.5]],
 ...town.slice(8,16),
 [[0,'Bb4',1.5],[2,'Ab4',1]],[[.5,'Gb4',1],[2,'F4',1]],[[0,'Eb4',2]],[[1,'Gb4',1.5]],
 [[0,'Ab4',1],[1.5,'F4',1]],[[.5,'G4',1],[2,'Bb4',1]],[[0,'C5',1.5],[2,'Bb4',.75]],[[0,'E4',2.5]],
 ...town.slice(24,32),
];
const wall:Tune=[
 [[1,'C5',1.5]],[[.5,'Db5',.75],[2,'C5',1.5]],[[0,'G4',2.5]],[],
 [[.5,'Ab4',2]],[[1,'Bb4',1.5]],[[.5,'E5',1.5]],[[0,'F5',2.5]],
 [[1,'Ab4',2]],[],[[.5,'Bb4',1.5]],[[1,'G4',2]],[[0,'F4',2.5]],[],
 [[.5,'E4',1.5]],[[1,'F4',2]],
 [[1,'Bb4',2]],[],[[.5,'Gb4',2]],[],[[0,'F4',2.5]],[[1,'G4',1.5]],[[.5,'Bb4',2]],[],
 [[1,'C5',1.5]],[[.5,'Db5',.75],[2,'C5',1.5]],[[0,'G4',2.5]],[],
 [[.5,'Ab4',2]],[[1,'G4',1.5]],[[.5,'E4',1.5]],[[0,'F4',2.75]],
];
const battle:Tune=[
 [[0,'C5',.5],[2/3,'Db5',.3],[4/3,'C5',.8],[8/3,'G4',.7]],[[0,'Ab4',.75],[1,'G4',.5],[2,'F4',1.5]],
 [[.5,'C5',.5],[1.5,'Eb5',.75],[3,'Db5',.6]],[[0,'C5',1.5],[2,'Ab4',1]],
 [[0,'Db5',.75],[1,'C5',.5],[2,'Bb4',1],[3.5,'Ab4',.4]],[[0,'G4',1],[1.5,'F4',.5],[2.5,'E4',.75]],
 [[0,'E5',1],[1.5,'Db5',.5],[2.5,'C5',.75]],[[0,'F5',2.5]],
 [[0,'Ab5',1.5],[2,'G5',.75]],[[.5,'Eb5',1],[2,'C5',1]],[[0,'Db5',1.5],[2,'Bb4',1]],
 [[0,'G4',.75],[1,'Ab4',.5],[2,'E4',1.5]],[[.5,'F4',1.5],[2.5,'C5',.75]],
 [[0,'Gb5',1],[1.5,'F5',.5],[2.5,'Db5',.75]],[[0,'E5',1.5],[2,'C5',1]],[[0,'F5',2.5]],
 [[0,'Bb4',2.5]],[[.5,'Ab4',1],[2,'Gb4',1]],[[0,'Eb4',2.5]],[[1,'F4',1.5]],
 [[0,'Ab4',1.5],[2,'F4',1]],[[.5,'G4',1],[2,'Bb4',1]],[[0,'C5',1],[1.5,'Bb4',.5],[2.5,'Ab4',.75]],[[0,'E4',2.5]],
 ...town.slice(24,30),[[0,'E5',1],[1.5,'Db5',.5],[2.5,'C5',.75]],[[0,'F5',2.5]],
];
// Aurel's brass tightens the neighbour into a tritone command. Petra answers
// in the middle register; the last phrase finally reaches her F-minor ground.
const command:Tune=[
 [[0,'G4',.65],[1,'Ab4',.5],[2,'G4',.65],[3,'Db5',.6]],[[0,'C5',1],[1.5,'Bb4',.5],[2.5,'G4',1]],
 [[0,'G4',.65],[1,'Ab4',.5],[2,'G4',.65],[3,'E5',.6]],[[0,'Db5',1.5],[2,'C5',1]],
 [[0,'F5',1],[1.5,'E5',.5],[2.5,'C5',.75]],[[0,'Bb4',1],[1.5,'Ab4',.5],[2.5,'G4',.75]],
 [[0,'E5',1.5],[2,'Db5',1]],[[0,'C5',2.5]],
 ...battle.slice(8,16),
 [[0,'C5',1],[1.5,'Db5',.5],[2.5,'C5',.75]],[[0,'G4',2.5]],
 [[.5,'Ab4',1.5],[2.5,'Bb4',.75]],[[0,'Gb4',2.5]],
 [[0,'F4',1.5],[2,'Ab4',1]],[[.5,'G4',1],[2,'F4',1]],
 [[0,'Bb4',1.5],[2,'Ab4',.75]],[[0,'E4',2.5]],
 [[0,'G4',.65],[1,'Ab4',.5],[2,'G4',.65],[3,'Db5',.6]],[[0,'C5',1],[1.5,'Ab4',1.5]],
 [[0,'Db5',1.5],[2,'C5',1]],[[.5,'Eb5',1.5]],[[0,'Db5',1],[1.5,'Bb4',1]],
 [[0,'Ab4',1.5],[2,'G4',1]],[[0,'E4',1.5]],[[0,'F4',2.75]],
];
const chords={
 fm:{bass:'F2',notes:['Ab3','C4','Eb4','G4']},db:{bass:'Ab1',notes:['F3','Ab3','C4','Eb4']},
 bb:{bass:'Bb1',notes:['Db3','F3','G3','C4']},cs:{bass:'C2',notes:['Bb3','F4','G4','C5']},
 c:{bass:'C2',notes:['Bb3','E4','G4','Db5']},gb:{bass:'Gb2',notes:['Bb3','Db4','Eb4','Ab4']},
 ab:{bass:'Ab1',notes:['Gb3','Bb3','C4','F4']},eb:{bass:'Eb2',notes:['Gb3','Bb3','Db4','F4']},
} satisfies Record<string,{bass:Pitch;notes:Pitch[]}>;
type Chord=keyof typeof chords;
const changes:Chord[]=[
 'fm','fm','db','db','bb','cs','c','fm','db','ab','bb','c','fm','gb','c','fm',
 'eb','eb','gb','gb','db','bb','cs','c','fm','db','bb','ab','gb','bb','c','fm',
];
export function dawnwatchBar(mode:DawnwatchMode,bar:number):Note[]{
 const i=((bar%32)+32)%32,quiet=mode==='signalwall',boss=mode==='dawn-commander',fight=boss||mode==='dawn-battle',guns=mode==='watchbarracks',middle=i>=16&&i<24;
 const harmony=boss&&i<8?(['c','db','c','db','fm','bb','c','cs']as Chord[])[i]:changes[i],{bass,notes:chord}=chords[harmony];
 const out:Note[]=[],add=(instrument:Note['instrument'],pitch:Pitch,beat:number,duration:number,velocity:number,pan=0)=>{const note:Note={instrument,pitch,beat,duration,velocity,pan};if(quiet)note.expression=phrasing(wheelDynamics[i],instrument==='strings');out.push(note);return note;};
 const tune=quiet?wall:boss?command:guns?terrace:fight?battle:town;
 const lead=quiet?'bell':boss&&!middle||guns?'brass':'strings';
 for(const [beat,pitch,duration]of tune[i])add(lead,pitch,beat,duration,quiet?.1:lead==='brass'?.15:.17,-.15);
 if(quiet){
  if(i%2===0){
   const from=chords[changes[(i+30)%32]].bass,hold=tune[(i+1)%32].length===0?7.5:3.5;
   const voice=add('round-bass',bass,0,hold,.16);
   voice.expression={...voice.expression,...fretless(from,bass,hold)};
   for(const [n,p]of chord.entries())add('strings',p,0,3.5,.017,n%2?.4:-.4);
  }
  if(!tune[i].length)add('keys',chord[1],1.5,1.2,.04,.3);
  return out;
 }
 // Soldiers keep a straight pulse; the tune decides when to resist it.
 const pulses=fight?[0,1,2,3]:guns?[0,2]:i%3===2?[0]:[0,2];
 for(const beat of pulses)add('round-bass',beat===2?octave(chord[0],-1):bass,beat,fight?.65:1.6,fight?.135:.095,-.08);
 for(const beat of fight?[.5,2.5]:guns?[1,3]:[0])for(const p of chord.slice(0,3))add('keys',p,beat,fight?.45:guns?.65:2.6,fight?.03:.023,.3);
 if(!guns&&(middle||i%3===2))for(const [n,p]of chord.entries())add('strings',p,0,3.5,.016,n%2?.4:-.4);
 if([2,5,10,18,26].includes(i))add(boss?'reed':'keys',i===18?'Gb4':'Ab4',3,.65,.055,.4);
 if(middle&&!fight&&!guns)return out;
 const drums=fight?.105:guns?.043:.022;
 for(const beat of boss?[0,1.5,2]:[0,2])add('kick','C2',beat,.15,drums);
 for(const beat of [1,3])add('snare','D2',beat,.12,drums*.68,-.2);
 for(const beat of fight||guns?[0,.5,1,1.5,2,2.5,3,3.5]:[.5,1.5,2.5,3.5])add('hat','F#2',beat,.07,drums*.16,.4);
 if(fight&&[7,15,31].includes(i))for(const beat of [2.5,3.5])add('snare','D2',beat,.1,drums*.3,-.2);
 if(boss&&[0,8,24].includes(i))add('timpani',bass,0,1,.065);
 return out;
}
// Chapter Two is the same person before her refusal. Strong-beat landings give
// the cell its footing; the occasional triplet pickup always returns to a beat.
const crossing:Line[]=[
 [[0,'C5',.75],[1,'Db5',.5],[2,'C5',.75],[3,'G4',.75]],[[0,'Ab4',1.5],[2,'G4',.5],[3,'F4',.75]],
 [[0,'C5',.75],[1.5,'Eb5',.4],[2,'Db5',1.5]],[[0,'C5',1.75],[2,'Ab4',1.5]],
 [[0,'Db5',.75],[1,'C5',.75],[2,'Bb4',.75],[3+2/3,'Ab4',1/3]],[[0,'G4',1.25],[2,'F4',.5],[3,'E4',.75]],
 [[0,'E5',1.5],[2,'Db5',.5],[3,'C5',.75]],[[0,'F5',3]],
 [[0,'Ab5',1.75],[2,'G5',1.5]],[[0,'Eb5',1.75],[2,'C5',1.5]],
 [[0,'Db5',1.25],[2,'Bb4',1.5]],[[0,'G4',.75],[1,'Ab4',.75],[2,'E4',1.5]],
 [[0,'C5',.75],[1,'Db5',.5],[2,'C5',.75],[3,'G4',.75]],[[0,'Ab4',1.5],[2,'G4',1.5]],
 [[0,'E5',1.5],[2,'Db5',.5],[3,'C5',.75]],[[0,'F5',3.5]],
];
export function petraCrossingBar(bar:number):Note[]{
 const i=((bar%16)+16)%16,{bass,notes:chord}=chords[changes[i]],out:Note[]=[];
 const add=(instrument:Note['instrument'],pitch:Pitch,beat:number,duration:number,velocity:number,pan=0)=>out.push({instrument,pitch,beat,duration,velocity,pan});
 for(const [beat,pitch,duration]of crossing[i])add('strings',pitch,beat,duration,.22,-.15);
 for(const beat of i%4===3?[0]:[0,2]){add('round-bass',bass,beat,4/3,beat===0?.16:.11,-.1);for(const p of chord)add('keys',p,beat,2/3,beat===0?.04:.027,.25);}
 if(i>=8&&i<12)for(const p of chord)add('strings',p,0,10/3,.016,.3);
 for(const beat of [0,2])add('kick','C2',beat,.18,.1);
 for(const beat of [1,3])add('snare','D2',beat,.16,.075,-.15);
 for(const beat of [0,.5,1,1.5,2,2.5,3,3.5])add('hat','F#2',beat,.07,beat%1?.022:.012,.4);
 if(i===6||i===14)for(const beat of [3.25,3.75])add('snare','D2',beat,.1,.04,-.15);
 return out;
}
