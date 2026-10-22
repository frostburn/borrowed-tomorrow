import { octave,transpose,type Pitch } from './tuning';
import type { Note } from './score';
export type DawnwatchMode='dawnwatch'|'watchbarracks'|'signalwall'|'dawn-battle'|'dawn-commander';
type Line=[number,Pitch,number][];
// A restrained B–E call connects Petra's old crossing to a new, resolved answer.
const call:Line[]=[
 [[0,'B4',1],[1.5,'E5',1.5]],[[.5,'G5',1],[2,'F#5',1]],
 [[0,'E5',1.5],[2,'D5',.5],[3,'B4',.5]],[[0,'D#5',2.5]],
 [[.5,'E5',1],[2,'G5',.75],[3,'A5',.5]],[[0,'G5',1.5],[2,'E5',1]],
 [[0,'F#5',1],[1.5,'E5',.5],[2.5,'D#5',.75]],[[0,'B4',2.5]],
];
const answer:Line[]=[
 [[0,'B4',.5],[1,'E5',1],[2.5,'F#5',.5]],[[0,'G5',1.5],[2,'B5',1]],
 [[.5,'A5',.75],[2,'F#5',1]],[[0,'D#5',1.5],[2.5,'F#5',.75]],
 [[0,'A5',1],[1.5,'G5',.5],[2.5,'E5',.75]],[[.5,'C5',1],[2,'E5',1]],
 [[0,'D#5',1.5],[2,'F#5',.75]],[[0,'E5',2.5]],
];
const middle:Line[]=[
 [[0,'G5',1.5],[2,'E5',1]],[[.5,'A5',1],[2,'G5',1]],
 [[0,'F#5',1.5],[2,'A5',1]],[[0,'B5',2.5]],
 [[0,'C6',1],[1.5,'B5',.5],[2.5,'A5',.75]],[[.5,'G5',1],[2,'E5',1]],
 [[0,'F#5',1],[1.5,'E5',.5],[2.5,'D#5',.75]],[[0,'B4',2.5]],
];
const roots:Pitch[]=['E2','C2','D2','B2','E2','A2','B2','B2','E2','C2','D2','B2','A2','C2','B2','E2','C2','A2','D2','G2','A2','C2','B2','B2','E2','C2','D2','B2','A2','C2','B2','E2'];
export function dawnwatchBar(mode:DawnwatchMode,bar:number):Note[]{
 const i=((bar%32)+32)%32,n=i%8,phrase=Math.floor(i/8),end=n===7,root=roots[i];
 const fight=mode==='dawn-battle'||mode==='dawn-commander',boss=mode==='dawn-commander',quiet=mode==='signalwall';
 const third=root==='E2'||root==='A2'?'m3':'M3',chord=[octave(root,1),transpose(octave(root,1),third),transpose(octave(root,1),'P5')];
 const out:Note[]=[],add=(instrument:Note['instrument'],pitch:Pitch,beat:number,duration:number,velocity:number,pan=0)=>out.push({instrument,pitch,beat,duration,velocity,pan});
 const tune=(phrase===2?middle:phrase===1?answer:call)[n];
 for(const [beat,pitch,duration]of tune){
  add(boss?'strings':quiet?'bell':'reed',phrase===3&&n===7?'E5':pitch,beat,duration,boss?.15:quiet?.095:.18,-.15);
  if(boss&&phrase===2&&duration>=1.5)add('brass',octave(pitch,-1),beat+.5,duration-.5,.065,.25);
 }
 for(const beat of quiet?[0]:fight?[0,1,2,3]:[0,2])if(!(end&&beat===3))add('round-bass',beat===2?transpose(root,'P5'):root,beat,quiet?2.7:fight?.7:1.45,fight?.15:.1);
 for(const beat of quiet?[0]:end?[0]:[.5,2.5])for(const p of chord)add('keys',p,beat,quiet?2:.7,quiet?.022:.032,.3);
 if(phrase===2||boss||quiet)for(const [j,p]of chord.entries())add('strings',p,0,end?2.5:3.5,.017,j%2?.4:-.4);
 if(quiet)return out;
 const drums=fight?.105:mode==='watchbarracks'?.04:.023;
 // Straight marching foundation; the melodic answers supply the variation.
 for(const beat of [0,2])add('kick','C2',beat,.16,drums);
 for(const beat of end?[1]:[1,3])add('snare','D2',beat,.12,drums*.7,-.2);
 for(const beat of fight?[0,.5,1,1.5,2,2.5,3,3.5]:[.5,1.5,2.5,3.5])if(!(end&&beat>2))add('hat','F#2',beat,.07,drums*.17,.4);
 if(fight&&end)for(const beat of [2.5,3,3.5])add('snare','D2',beat,.1,drums*.35,-.2);
 if(boss&&n===0)add('timpani',root,0,.8,.065);
 return out;
}
