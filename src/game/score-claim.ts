import type { Note,Instrument } from './score';
import type { Pitch } from './tuning';
import { phrasing } from './expression';
type Line=[number,Pitch,number][];
// A falling semitone interrupted by a tritone. Its long gaps leave the bell exposed.
const tune:Line[]=[
 [[0,'E5',1.25],[2,'Eb5',.75],[3,'A4',.5]],[[1,'Bb4',1.5]],
 [[0,'F5',.75],[1,'E5',1.5]],[[2,'C#5',1.5]],
 [[0,'E5',.75],[1.5,'Eb5',.75],[3,'A4',.75]],[[0,'Bb4',2.5],[3,'F4',.5]],
 [[.5,'Ab4',1],[2,'G4',1]],[[0,'E4',2.5]],
 [[0,'A5',1.5],[2,'Eb5',1.5]],[[.5,'D5',.75],[2,'Bb4',1.5]],
 [[0,'E5',.75],[1,'F5',.75],[2.5,'C#5',1]],[[0,'D5',2.5]],
 [[0,'Bb5',1],[1.5,'A5',1],[3,'Eb5',.5]],[[0,'D5',1.5],[2,'Ab4',1.5]],
 [[0,'E5',1.5],[2,'Eb5',.75]],[[1,'A4',2.5]],
];
const harmony:{bass:Pitch;tones:Pitch[]}[]=[
 {bass:'D2',tones:['F3','A3','C4','E4']},{bass:'Eb2',tones:['G3','Bb3','D4','A4']},
 {bass:'D2',tones:['F3','A3','C4','E4']},{bass:'Bb1',tones:['D3','F3','A3','E4']},
];
/** Sixteen bars: exposed bell call, then a string answer over the same suspended harmony. */
export function claimBar(bar:number):Note[]{
 const b=((bar%16)+16)%16,notes:Note[]=[],h=harmony[b%4],answer=b>=8;
 const add=(instrument:Instrument,pitch:Pitch,beat:number,duration:number,velocity:number,pan=0)=>notes.push({instrument,pitch,beat,duration,velocity,pan,expression:phrasing(b%4===3?.72:.9,instrument==='strings')});
 for(const [beat,pitch,length]of tune[b])add(answer?'strings':'bell',pitch,beat,length,answer?.17:.12,-.15);
 for(const [i,pitch]of h.tones.entries())add('strings',pitch,0,3.7,.025,i%2?.38:-.4);
 add('round-bass',h.bass,0,b%4===3?3.6:1.5,.14);
 if(b%4!==3)add('round-bass',h.bass,2,.8,.11);
 if(answer&&b%2===0)add('bell',b%4===0?'E6':'F6',2.5,1.2,.065,.24);
 for(const beat of b%4===3?[0]:[0,2])add('kick','C2',beat,.14,.095);
 for(const beat of [1,3])add('snare','D2',beat,.12,b%4===3?.045:.08,-.2);
 for(let beat=0;beat<4;beat+=.5)add('hat','F#2',beat,.06,beat%1===0?.022:.012,.35);
 if(b===0||b===8)add('cymbal','F#2',0,.8,.035,.3);
 if(b%4===3)add('timpani',h.bass,3,.7,.12,-.25);
 return notes;
}
