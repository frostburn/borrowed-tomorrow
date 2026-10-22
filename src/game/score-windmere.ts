import { octave,transpose,type Pitch } from './tuning';
import type { Note } from './score';
export type WindmereMode='windmere'|'dispensary'|'mirrorward'|'wind-battle'|'wind-engine';
type Line=[number,Pitch,number][];
const call:Line[]=[
 [[0,'A4',1],[1.5,'D5',1]],[[0,'F#5',1.5],[2,'E5',.75]],
 [[0,'D5',1],[1.5,'B4',1]],[[0,'C#5',2.5]],
 [[.5,'D5',1],[2,'F#5',.75]],[[0,'E5',1],[1.5,'B4',1]],
 [[0,'A4',1.5],[2,'C#5',.75]],[[0,'D5',2.5]],
];
const answer:Line[]=[
 [[0,'F#5',1],[1.5,'A5',1]],[[0,'G5',1],[1.5,'F#5',.5],[2.5,'E5',.5]],
 [[0,'D5',1.5],[2,'F#5',.75]],[[0,'E5',2.5]],
 [[0,'G5',1],[1.5,'B5',1]],[[0,'A5',1.5],[2,'F#5',.75]],
 [[0,'E5',1],[1.5,'C#5',1]],[[0,'D5',2.5]],
];
const middle:Line[]=[
 [[0,'B4',1.5],[2,'D5',.75]],[[0,'E5',1],[1.5,'G5',1]],
 [[0,'F#5',1.5],[2,'D5',.75]],[[0,'A4',2.5]],
 [[.5,'G5',1],[2,'F#5',.75]],[[0,'E5',1.5],[2,'D5',.75]],
 [[0,'B4',1],[1.5,'C#5',1]],[[0,'A4',2.5]],
];
const roots:Pitch[]=['D2','G2','B2','A2','D2','E2','A2','D2','D2','A2','B2','A2','G2','D2','A2','D2','B2','E2','G2','D2','E2','G2','A2','A2','D2','G2','B2','A2','G2','D2','A2','D2'];
/** The ward's three-beat call becomes a grounded four-beat battle answer.
 * No continuous arpeggio: lift machinery and mirrors leave space between phrases. */
export function windmereBar(mode:WindmereMode,bar:number):Note[]{
 const i=((bar%32)+32)%32,n=i%8,phrase=Math.floor(i/8),end=n===7;
 const fight=mode==='wind-battle'||mode==='wind-engine',boss=mode==='wind-engine',gallery=mode==='mirrorward',beats=fight||gallery?4:3;
 const root=roots[i],chord=[octave(root,1),transpose(octave(root,1),['B2','E2'].includes(root)?'m3':'M3'),transpose(octave(root,1),'P5')];
 const out:Note[]=[],add=(instrument:Note['instrument'],pitch:Pitch,beat:number,duration:number,velocity:number,pan=0)=>out.push({instrument,pitch,beat,duration,velocity,pan});
 const tune=(phrase===2?middle:phrase===1?answer:call)[n];
 for(const [beat,p,duration]of tune){
  const pitch=phrase===3&&n===7?'D5':p;
  add(boss||gallery?'bell':mode==='dispensary'?'keys':'reed',gallery?octave(pitch,-1):pitch,beat,duration,gallery?.075:boss?.12:mode==='dispensary'?.15:.18,-.18);
  if(boss&&duration>=1.5)add('strings',octave(pitch,-1),beat,duration,.035,.3);
 }
 for(const [j,p]of chord.entries())if(gallery||phrase===2||boss)add('strings',p,0,end?2:beats-.2,.017,j%2?.4:-.4);
 for(const beat of gallery?[0]:fight?[0,1,2,3]:[0,2])if(!(end&&beat>=2))add('round-bass',beat===2?transpose(root,'P5'):root,beat,gallery?2.7:fight?.7:beat===0?1.5:.65,fight?.14:.095);
 for(const beat of gallery?[0]:fight?[.5,2.5]:end?[0]:[1])for(const p of chord)add('keys',p,beat,gallery?2.5:fight?.6:1.3,gallery?.02:.028,.25);
 if(!fight)return out;
 for(const beat of [0,2])add('kick','C2',beat,.15,.1);
 for(const beat of end?[1]:[1,3])add('snare','D2',beat,.13,.064,-.2);
 for(const beat of end?[0,.5,1,1.5]:[0,.5,1,1.5,2,2.5,3,3.5])add('hat','F#2',beat,.065,.014,.4);
 if(end)for(const beat of [2.5,3,3.5])add('snare','D2',beat,.1,.028,-.2);
 if(boss&&n===0)add('timpani',root,0,.9,.06);
 // The engine reflects the opening gesture after a full beat of silence.
 if(boss&&n%2===0)add('bell',phrase===2?'A5':'D5',3.5,.35,.045,.45);
 return out;
}
