import { singing } from './expression';
import type { Note } from './score';
import { octave,type Pitch } from './tuning';
type Line=[number,Pitch,number][];
type Tune=Line[];
// Airship travel: E–D–B–C–A. A falling question, a breath, then another attempt.
// The first sentence takes twelve bars; the turn comes before the high point.
const flight:Tune=[
 [[.5,'E5',.75],[1.5,'D5',.5],[2.5,'B4',.75]],[[0,'C5',1],[1.5,'A4',2]],
 [[1,'B4',.5],[2,'D5',1.5]],[[0,'C5',2.5]],
 [[.5,'E5',1.5],[2.5,'D5',.5]],[[0,'B4',1],[1.5,'C5',.5],[2.5,'A4',1]],
 [[0,'G4',2],[2.5,'A4',.5],[3.5,'B4',.4]],[[0,'D5',2.5]],
 [[1,'C5',.75],[2,'B4',.5],[3,'A4',.75]],[[0,'F#4',1.5],[2,'G4',1]],
 [[.5,'B4',1.5],[2.5,'G#4',.75]],[[0,'A4',3]],
 [[0,'C5',1.5],[2,'B4',.5],[3,'G4',.75]],[[.5,'A4',2.5]],
 [[1,'D5',1],[2.5,'E5',1]],[[0,'C5',2.5]],
 [[0,'B4',1.5],[2,'A4',.75]],[[.5,'G4',1],[2,'F#4',1]],
 [[0,'A4',2],[2.5,'B4',1]],[[0,'D5',1],[1.5,'C5',1.5]],
 [[.5,'E5',1.5],[2.5,'G5',1]],[[0,'F#5',1.5],[2,'E5',1]],
 [[0,'D5',1.5],[2,'B4',.75]],[[.5,'G#4',2.5]],
 [[.5,'E5',.75],[1.5,'D5',.5],[2.5,'B4',.75]],[[0,'C5',1],[1.5,'A4',2]],
 [[1,'D5',1.5],[3,'C5',.5]],[[0,'B4',2.5]],
 [[0,'G5',1.5],[2,'E5',1]],[[.5,'D5',1],[2,'C5',1.5]],
 [[0,'B4',1],[1.5,'G#4',1]],[[0,'A4',2.75]],
];
const mooring:Tune=[
 [[0,'E5',.5],[1,'E5',.5],[2,'D5',.75],[3,'B4',.5]],[[.5,'C5',.75],[2,'A4',1.5]],
 [[0,'B4',.75],[1.5,'D5',.5],[2.5,'C5',.75]],[[0,'A4',2]],
 [[1,'E5',.75],[2.5,'D5',.5]],[[0,'C5',.75],[1,'B4',.5],[2,'A4',1.5]],
 [[.5,'G4',1],[2,'B4',1]],[[0,'D5',2.5]],
 [[0,'E5',.75],[1,'D5',.5],[2,'B4',.5],[3,'A4',.75]],[[.5,'C5',2]],
 [[0,'D5',1],[1.5,'B4',.75]],[[0,'G#4',1],[2,'A4',1.5]],
 [[.5,'C5',.5],[1.5,'B4',.5],[2.5,'G4',.75]],[[0,'A4',2.5]],
 [[0,'D5',.75],[1.5,'E5',.75],[3,'D5',.5]],[[0,'C5',2]],
 [[0,'E5',2]],[[1,'D5',1.5]],[[.5,'C5',2]],[[0,'A4',2.5]],
 [[0,'G5',1.5],[2,'E5',1]],[[0,'F#5',2],[2.5,'D5',.75]],
 [[.5,'C5',1],[2,'B4',.75]],[[0,'G#4',2]],
 [[0,'E5',.5],[1,'E5',.5],[2,'D5',.75],[3,'B4',.5]],[[.5,'C5',.75],[2,'A4',1.5]],
 [[0,'D5',.75],[1.5,'C5',.5],[2.5,'B4',.75]],[[0,'A4',2]],
 [[.5,'G5',1],[2,'E5',.75]],[[0,'D5',1],[1.5,'C5',1]],
 [[.5,'B4',1],[2,'G#4',1]],[[0,'A4',2.5]],
];
// The cabin remembers a fragment, not a slowed copy of the travel arrangement.
const memory:Tune=[
 [[1,'E5',1.5]],[[.5,'D5',1],[2.5,'B4',.75]],[[1,'C5',2]],[],
 [[1,'E5',1.5]],[[.5,'D5',1],[2.5,'B4',.75]],[[1,'C5',2]],[],
 [[1,'E5',1.5]],[[.5,'D5',1],[2.5,'B4',.75]],[[1,'C5',2]],[],
 [[.5,'A4',2]],[],[[1,'B4',1.5]],[],
 [[1,'C5',1.5]],[[.5,'B4',1],[2.5,'G4',.75]],[[1,'A4',2]],[],
 [[.5,'F#4',2]],[[1,'G4',1.5]],[[.5,'B4',2]],[],
 [[1,'E5',1.5]],[[.5,'D5',1],[2.5,'B4',.75]],[[1,'C5',2]],[],
 [[.5,'A4',2]],[[1,'G4',1.5]],[[.5,'B4',2]],[],
];
// Phrase dynamics follow the melodic sentences, including their quiet returns.
const dynamics=[0.78, 0.73, 0.8, 0.74, 0.85, 0.78, 0.8, 0.88, 0.75, 0.7, 0.78, 0.62, 0.76, 0.7, 0.9, 0.82, 0.67, 0.64, 0.74, 0.82, 1.06, 1.12, 0.9, 0.75, 0.84, 0.77, 0.84, 0.8, 1.08, 0.94, 0.78, 0.65];
const chords={
 am:{bass:'A2',notes:['G3','B3','C4','E4']},da:{bass:'A2',notes:['F#3','B3','D4','E4']},
 fc:{bass:'C2',notes:['F3','A3','E4','G4']},gd:{bass:'D2',notes:['G3','A3','C4','D4']},
 eb:{bass:'B1',notes:['D3','F#3','G3','B3']},g:{bass:'G2',notes:['F3','A3','B3','E4']},
 e:{bass:'E2',notes:['D3','G#3','B3','F#4']},c:{bass:'C2',notes:['G3','B3','D4','E4']},
} satisfies Record<string,{bass:Pitch;notes:Pitch[]}>;
type Chord=keyof typeof chords;
const changes:Chord[]=[
 'am','am','da','da','fc','fc','gd','gd','eb','g','e','am',
 'c','c','da','fc','eb','eb','da','gd','c','da','eb','e',
 'am','am','gd','eb','c','fc','e','am',
];
export function flightBar(mode:'airfield'|'airship'|'observation',bar:number):Note[]{
 const i=((bar%32)+32)%32,cabin=mode==='observation',ground=mode==='airfield',{bass,notes:chord}=chords[changes[i]],out:Note[]=[];
 const add=(instrument:Note['instrument'],pitch:Pitch,beat:number,duration:number,velocity:number,pan=0)=>{const note:Note={instrument,pitch,beat,duration,velocity,pan};out.push(note);return note;};
 for(const [n,[beat,pitch,duration]]of (cabin?memory:ground?mooring:flight)[i].entries()){
  const voice=add(cabin?'keys':'reed',pitch,beat,duration,cabin?.15:.19,-.16);
  if(mode==='airship')voice.expression=singing('nell',dynamics[i]*(1-n*.07),duration,[11,15,23,31].includes(i));
 }
 if(cabin){
  if(i%2===0){const hold=changes[i]===changes[i+1]?7.5:3.5;add('round-bass',bass,0,hold,.075);for(const [n,p]of chord.entries())add('strings',p,0,hold,.012,n%2?.4:-.4);}
  if([3,11,19,27].includes(i))add('bell','E4',2.5,.9,.035,.4);
  return out;
 }
 // Held inverted voicings and changing bass entrances let the line cross the bar.
 const sparse=i>=16&&i<20;
 add('round-bass',bass,ground?0:i%4===2?.5:0,sparse?3.4:2.4,.105,-.08);
 if(!sparse&&i%4===1)add('round-bass',octave(chord[0],-1),3,.6,.055,-.08);
 const hits=ground?[.5,2.5]:i%2?[1]:[0];
 for(const beat of hits)for(const p of chord.slice(0,ground?3:4))add('keys',p,beat,ground?.65:2.6,ground?.03:.025,.28);
 if(!ground&&i%2===0)for(const [n,p]of chord.entries())add('strings',p,0,changes[i]===changes[i+1]?7.3:3.5,.016,n%2?.4:-.4);
 if([3,11,19,27].includes(i)){add('keys',i===19?'G4':'E4',3,.65,.06,.32);}
 return out;
}
