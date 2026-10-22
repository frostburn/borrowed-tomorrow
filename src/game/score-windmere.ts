import { octave,type Pitch } from './tuning';
import type { Note } from './score';
export type WindmereMode='windmere'|'dispensary'|'mirrorward'|'wind-battle'|'wind-engine';
type Line=[number,Pitch,number][];
type Tune=Line[];
// Celia: Ab–Gb–F–Eb, then Db–C–Ab–Bb. A long exhale, not a fanfare.
// The first ten-bar sentence keeps singing through two of its bar lines.
const ward:Tune=[
 [[0,'Ab5',4.5]],[],[[0,'Gb5',2.5]],[[.5,'F5',2]],[[0,'Eb5',4.5]],[],
 [[0,'Db5',2]],[[1,'C5',1.5]],[[0,'Ab4',2]],[[.5,'Bb4',2]],
 [[0,'F5',2]],[[.5,'Eb5',2]],[[0,'Db5',1.5],[2,'C5',.75]],
 [[0,'Bb4',2.5]],[[.5,'Ab4',1.5]],[[0,'Db5',2.5]],
 [[0,'Gb4',2.5]],[[.5,'Ab4',1.5]],[[0,'Bb4',2]],[[1,'Cb5',1.5]],
 [[0,'Ab4',2.5]],[[.5,'Gb4',1.5]],[[0,'Eb4',2]],[[0,'C5',2.5]],
 [[0,'Ab5',2.5]],[[.5,'Gb5',1.5]],[[0,'F5',2]],[[.5,'Eb5',2]],
 [[0,'Db5',1.5],[2,'C5',.75]],[[0,'Bb4',2]],[[.5,'Ab4',1.5]],[[0,'Db5',2.5]],
];
// Staff at work: a separate walking tune, with the song heard only in its turn.
const rounds:Tune=[
 [[.5,'F5',.5],[1.5,'Eb5',.5],[2.5,'Db5',.4]],[[0,'C5',1],[1.5,'Ab4',1]],
 [[.5,'Db5',.5],[1.5,'Eb5',1]],[[0,'F5',2]],
 [[0,'Gb5',1],[1.5,'F5',.5]],[[.5,'Eb5',1],[2,'Db5',.75]],
 [[0,'C5',1],[1.5,'Bb4',1]],[[0,'Ab4',2]],
 [[.5,'Ab5',1],[2,'Gb5',.75]],[[0,'F5',1.5],[2,'Eb5',.75]],
 [[.5,'Db5',.5],[1.5,'C5',1]],[[0,'Bb4',2]],
 [[0,'F5',1],[1.5,'Eb5',.5]],[[.5,'Db5',1],[2,'C5',.75]],
 [[0,'Ab4',1.5],[2,'Bb4',.75]],[[0,'Db5',2.5]],
 [[0,'Gb4',2]],[[1,'Ab4',1.5]],[[0,'Bb4',2]],[[.5,'Cb5',2]],
 [[0,'Ab4',2]],[[.5,'Gb4',1.5]],[[0,'Eb4',2]],[[0,'C5',2.5]],
 [[.5,'F5',.5],[1.5,'Eb5',.5],[2.5,'Db5',.4]],[[0,'C5',1],[1.5,'Ab4',1]],
 [[.5,'Gb5',1],[2,'F5',.75]],[[0,'Eb5',2]],[[0,'Db5',1.5],[2,'C5',.75]],
 [[.5,'Bb4',1.5]],[[0,'Ab4',2]],[[0,'Db5',2.5]],
];
const gallery:Tune=[
 [[1,'Ab5',2.5]],[],[[.5,'Gb5',2]],[],[[1,'F5',2.5]],[],[[.5,'Eb5',2]],[],
 [[1,'Db5',2]],[[.5,'C5',2]],[[1,'Ab4',2]],[[.5,'Bb4',2.5]],
 [[1,'F5',2]],[],[[.5,'C5',2]],[[1,'Db5',2.5]],
 [[1,'Gb4',2]],[],[[.5,'Bb4',2]],[[1,'Cb5',2]],[[.5,'Ab4',2.5]],[],[[1,'Eb4',2]],[],
 [[1,'Ab5',2.5]],[[.5,'Gb5',2]],[[1,'F5',2]],[[.5,'Eb5',2.5]],
 [[1,'Db5',2]],[[.5,'C5',2]],[[1,'Ab4',2]],[[.5,'Db5',2.75]],
];
// In battle the long descent becomes a quick question with a broad string reply.
const rescue:Tune=[
 [[0,'Ab5',.75],[1,'Gb5',.5],[2,'F5',.75],[3,'Eb5',.6]],[[.5,'Db5',1],[2,'C5',1]],
 [[0,'Ab4',1],[1.5,'Bb4',1],[3,'Db5',.6]],[[0,'F5',2.5]],
 [[0,'Gb5',1],[1.5,'F5',.5],[2.5,'Eb5',.75]],[[0,'Db5',1.5],[2,'Bb4',1]],
 [[.5,'C5',1],[2,'Eb5',1]],[[0,'F5',2.5]],
 [[0,'F5',1.5],[2,'Eb5',1]],[[.5,'Db5',1],[2,'C5',1]],
 [[0,'Bb4',2],[2.5,'Db5',.75]],[[0,'Ab4',2.5]],
 [[0,'Gb5',1],[1.5,'F5',.5],[2.5,'Eb5',.75]],[[0,'Db5',1],[1.5,'C5',.5],[2.5,'Bb4',.75]],
 [[0,'C5',1.5],[2,'Ab4',1]],[[0,'Bb4',2.5]],
 [[0,'Gb4',2.5]],[[1,'Ab4',1.5]],[[.5,'Bb4',2]],[[0,'Cb5',2.5]],
 [[0,'Ab4',1.5],[2,'Gb4',1]],[[.5,'F4',1],[2,'Eb4',1]],
 [[0,'Gb4',1],[1.5,'F4',.5],[2.5,'Eb4',.75]],[[0,'C5',2.5]],
 [[0,'Ab5',.75],[1,'Gb5',.5],[2,'F5',.75],[3,'Eb5',.6]],[[.5,'Db5',1],[2,'C5',1]],
 [[0,'Gb5',1.5],[2,'F5',1]],[[.5,'Eb5',2]],[[0,'Db5',1],[1.5,'C5',.5],[2.5,'Bb4',.75]],
 [[0,'Ab4',2]],[[.5,'C5',1],[2,'Eb5',.75]],[[0,'Db5',2.75]],
];
// The machine answers in reverse order. Its repeated bass never inhales.
const reflection:Tune=[
 [[0,'Eb5',.6],[1,'F5',.6],[2,'Gb5',.6],[3,'Ab5',.6]],[[.5,'Gb5',1],[2,'F5',1]],
 [[0,'Eb5',1.5],[2,'C5',1]],[[0,'Db5',2.5]],
 [[0,'Eb5',.6],[1,'F5',.6],[2,'Gb5',.6],[3,'Bb5',.6]],[[0,'Ab5',1.5],[2,'Gb5',1]],
 [[0,'F5',1],[1.5,'Eb5',.5],[2.5,'C5',.75]],[[0,'Db5',2.5]],
 ...rescue.slice(8,16),
 [[0,'Gb4',2.5]],[[1,'Ab4',1.5]],[[0,'Cb5',1],[1.5,'Bb4',.5],[2.5,'Ab4',.75]],[[0,'Gb4',2.5]],
 [[.5,'F4',1],[2,'Ab4',1]],[[0,'Gb4',1.5],[2,'Eb4',1]],
 [[0,'C5',1.5],[2,'Db5',1]],[[0,'Eb5',2.5]],
 ...rescue.slice(24,32),
];
const chords={
 db:{bass:'Ab1',notes:['F3','Ab3','C4','Eb4']},bb:{bass:'Bb1',notes:['Db3','F3','Ab3','C4']},
 gb:{bass:'Gb2',notes:['Bb3','Db4','Eb4','Ab4']},cb:{bass:'Cb2',notes:['Gb3','Bb3','Cb4','Eb4']},
 ab:{bass:'Ab1',notes:['Gb3','C4','Eb4','Bb4']},sus:{bass:'Ab1',notes:['Gb3','Db4','Eb4','Bb4']},
 eb:{bass:'Eb2',notes:['Gb3','Bb3','Db4','F4']},f:{bass:'F2',notes:['Ab3','C4','Eb4','G4']},
} satisfies Record<string,{bass:Pitch;notes:Pitch[]}>;
type Chord=keyof typeof chords;
const changes:Chord[]=[
 'db','db','bb','bb','gb','gb','eb','ab','db','bb','gb','cb','bb','eb','ab','db',
 'gb','gb','cb','cb','bb','bb','sus','ab','db','bb','gb','cb','bb','eb','ab','db',
];
export function windmereBar(mode:WindmereMode,bar:number):Note[]{
 const i=((bar%32)+32)%32,boss=mode==='wind-engine',fight=boss||mode==='wind-battle',quiet=mode==='mirrorward',round=mode==='dispensary',middle=i>=16&&i<24;
 const tune=quiet?gallery:boss?reflection:fight?rescue:round?rounds:ward;
 const harmony=fight&&i<8?(['bb','bb','eb','f','gb','eb','f','bb']as Chord[])[i]:changes[i],{bass,notes:chord}=chords[harmony];
 const out:Note[]=[],add=(instrument:Note['instrument'],pitch:Pitch,beat:number,duration:number,velocity:number,pan=0)=>out.push({instrument,pitch,beat,duration,velocity,pan});
 const lead=quiet||boss&&!middle?'bell':fight?'strings':round?'keys':'reed';
 for(const [beat,pitch,duration]of tune[i])add(lead,pitch,beat,duration,quiet?.11:lead==='bell'?.13:.18,-.17);
 if(quiet){
  if(i%2===0){const hold=changes[i]===changes[i+1]?7.5:3.5;add('round-bass',bass,0,hold,.075);for(const [n,p]of chord.entries())add('strings',p,0,hold,.016,n%2?.4:-.4);}
  if(!tune[i].length)add('keys',chord[0],2,1,.04,.35);
  return out;
 }
 if(!fight){
  // The waltz is carried by the staff's footsteps; the ward itself can rest.
  if(round||i%2===0||changes[i]!==changes[i-1])add('round-bass',bass,0,round?1.7:changes[i]===changes[i+1]?5.5:2.5,.095,-.08);
  const hits=round?(i%4===3?[1]:[1,2]):i%2?[.5]:[0];
  for(const beat of hits)for(const p of chord.slice(0,round?3:4))add('keys',p,beat,round?.6:2.3,round?.025:.023,.28);
  if(!round&&i%2===0)for(const [n,p]of chord.entries())add('strings',p,0,changes[i]===changes[i+1]?5.5:2.5,.016,n%2?.4:-.4);
  if(round&&[3,11,27].includes(i))add('reed',i===11?'Eb4':'Ab4',2,.7,.045,.35);
  return out;
 }
 const pulses=boss?[0,.75,2,2.75]:middle?[0,2]:[0,1.5,3];
 for(const beat of pulses)add('round-bass',boss?bass:beat===1.5?octave(chord[0],-1):bass,beat,boss?.45:middle?1.3:.7,boss?.135:.125);
 for(const beat of middle?[0]:boss?[1,3]:[.5,2.5])for(const p of chord.slice(0,3))add('keys',p,beat,middle?2.6:.5,.028,.3);
 if(!boss||middle)for(const [n,p]of chord.entries())add('strings',p,0,3.6,.016,n%2?.4:-.4);
 if(boss&&[3,7,27].includes(i))add('keys','Bb4',3.25,.5,.05,.4);
 for(const beat of [0,2])add('kick','C2',beat,.15,.1);
 for(const beat of [1,3])add('snare','D2',beat,.13,.068,-.2);
 for(const beat of [0,.5,1,1.5,2,2.5,3,3.5])add('hat','F#2',beat,.065,beat%1?.018:.011,.4);
 if([9,15,31].includes(i))for(const beat of [2.5,3.5])add('snare','D2',beat,.1,.03,-.2);
 if(boss&&[0,8,24].includes(i))add('timpani',bass,0,1,.065);
 return out;
}
