import { octave,transpose,type Pitch } from './tuning';
import type { Note } from './score';
export type AnchorMode='airfield'|'airship'|'hammerplain'|'coolingworks'|'anchorforge'|'five-battle'|'five-furnace';
type Line=[number,Pitch,number][];
// A clear four-bar call and answer; each eight-bar phrase has a different end.
const flight:Line[]=[
 [[.5,'D5',1],[2,'G5',1.5]],[[0,'F#5',1],[1.5,'E5',.5],[2.5,'D5',1]],
 [[0,'B4',1.5],[2,'D5',.5],[3,'E5',.5]],[[0,'A4',2.5]],
 [[.5,'G5',1],[2,'A5',1]],[[0,'B5',1.5],[2,'G5',1]],
 [[0,'F#5',1],[1.5,'E5',.5],[2.5,'D5',.5]],[[0,'D5',1.5],[2.5,'B4',.75]],
];
const works:Line[]=[
 [[0,'D5',.75],[1.5,'F5',.5],[2.5,'E5',.75]],[[.5,'A4',1],[2,'C5',1]],
 [[0,'D5',1],[1.5,'A4',.5],[2.5,'G4',.75]],[[0,'B4',2],[3,'A4',.5]],
 [[0,'F5',1],[1.5,'E5',.5],[2.5,'D5',.75]],[[.5,'C5',1],[2,'A4',1]],
 [[0,'G4',1],[1.5,'B4',.5],[2.5,'D5',.75]],[[0,'C#5',1.5],[2.5,'E5',.75]],
];
const lift:Line[]=[
 [[0,'B5',1.5],[2,'A5',1]],[[.5,'G5',1],[2,'E5',1]],
 [[0,'A5',1],[1.5,'F#5',.5],[2.5,'D5',.75]],[[0,'E5',2.5]],
 [[0,'C6',1.5],[2,'B5',1]],[[.5,'A5',1],[2,'G5',1]],
 [[0,'F#5',1],[1.5,'E5',.5],[2.5,'D5',.75]],[[0,'D5',2.5]],
];
const middle:Line[]=[
 [[0,'A5',1.5],[2,'G5',1]],[[.5,'F5',1],[2,'E5',1]],
 [[0,'G5',1.5],[2,'E5',1]],[[0,'D5',2.5]],
 [[0,'F5',1],[1.5,'A5',.5],[2.5,'C6',.75]],[[.5,'B5',1],[2,'G5',1]],
 [[0,'E5',1.5],[2,'D5',.75]],[[0,'C#5',1.5],[3,'A4',.5]],
];
const flightRoots:Pitch[]=['G2','D2','E2','C2','G2','E2','A2','D2','G2','B2','E2','C2','A2','D2','D2','G2','E2','C2','D2','A2','C2','G2','A2','D2','G2','D2','E2','C2','A2','D2','D2','G2'];
const worksRoots:Pitch[]=['D2','C2','G2','G2','F2','A2','G2','A2','D2','C2','G2','G2','F2','A2','A2','D2','F2','C2','E2','D2','F2','G2','E2','A2','D2','C2','G2','G2','F2','A2','A2','A2'];
export function anchorBar(mode:AnchorMode,bar:number):Note[]{
 const i=((bar%32)+32)%32,phrase=Math.floor(i/8),n=i%8,end=n===7;
 const sky=mode==='airship'||mode==='airfield',fight=mode==='five-battle'||mode==='five-furnace',boss=mode==='five-furnace',quiet=mode==='anchorforge';
 const root=(sky?flightRoots:worksRoots)[i];
 const minor=sky?['E2','B2','A2'].includes(root):['D2','A2','E2'].includes(root),dominant=!sky&&root==='A2'&&[7,14,23,30,31].includes(i);
 const chord=[octave(root,1),transpose(octave(root,1),minor&&!dominant?'m3':'M3'),transpose(octave(root,1),'P5'),transpose(octave(root,1),dominant?'m7':minor?'m7':'M6')];
 const tune=phrase===2?(sky?lift:middle)[n]:(sky?flight:works)[n],out:Note[]=[];
 const add=(instrument:Note['instrument'],pitch:Pitch,beat:number,duration:number,velocity:number,pan=0)=>out.push({instrument,pitch,beat,duration,velocity,pan});
 for(const [beat,p,duration]of tune){
  const pitch=phrase===1&&n===7?(sky?'G5':'D5'):p;
  add(boss?'brass':sky?'reed':'keys',pitch,beat,duration,boss?.15:sky?.19:quiet?.12:.21,-.16);
  if(fight&&phrase!==2&&duration>=1.5)add('strings',octave(pitch,-1),beat,duration,.035,.35);
 }
 // Long airship phrases float over a grounded, two-pulse root/fifth bass.
 const bassHits=sky||quiet?[[0,0,2.4],[3,1,.65]]:phrase===2?[[0,0,1.4],[2,1,1.2]]:[[0,0,.7],[1,1,.6],[2,0,.7],[3,1,.6]];
 for(const [beat,fifth,duration]of bassHits)if(!(end&&beat===3))add(sky?'round-bass':'bass',fifth?transpose(root,'P5'):root,beat,duration,fight?.15:quiet?.08:.11);
 for(const beat of sky?end?[0]:[0,2]:quiet?[0]:end?[0,2]:[.5,2.5])for(const p of chord.slice(0,3))add('keys',p,beat,sky?1.5:.55,sky?.028:quiet?.022:.035,.28);
 if(sky||phrase===2||boss)for(const [j,p]of chord.entries())add('strings',p,0,end?2.7:3.6,sky?.018:.02,j%2?.4:-.4);
 if(sky||quiet)return out;
 const drum=fight?.11:.034;
 for(const beat of end?[0,2]:boss?[0,1.5,2,3.5]:[0,2])add('kick','C2',beat,.14,drum);
 for(const beat of end?[1]:[1,3])add('snare','D2',beat,.13,drum*.62,-.2);
 for(const beat of end?[0,.5,1,1.5]:[0,.5,1,1.5,2,2.5,3,3.5])add('hat','F#2',beat,.07,drum*(beat%1?.18:.1),.4);
 if(fight&&end)for(const beat of [2.5,3,3.5])add('snare','D2',beat,.1,drum*.32,-.2);
 if(boss&&n===0)add('timpani',root,0,.8,.08);
 if(boss&&i%8===0)add('cymbal','C2',0,1.5,.035,.3);
 return out;
}
