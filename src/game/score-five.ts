import { octave,type Pitch } from './tuning';
import type { Note } from './score';
import { flightBar } from './score-flight';
import { bassSlide,phrasing } from './expression';
export type AnchorMode='airfield'|'airship'|'observation'|'hammerplain'|'coolingworks'|'anchorforge'|'five-battle'|'five-furnace';
type Line=[number,Pitch,number][];
type Tune=Line[];
const gantryDynamics=[.66,.53,.76,.58,.62,.72,.64,.5,.73,.8,.7,.54,.78,.69,.6,.49,.57,.48,.61,.46,.68,.51,.64,.48,.7,.54,.79,.57,.72,.64,.59,.51];
// Orrin: two hammer taps, an upper neighbour, then a downward release.
const work:Tune=[
 [[0,'D5',.4],[.5,'D5',.4],[1.5,'Eb5',.4],[2,'D5',.75],[3,'A4',.6]],[[.5,'C5',.6],[1.5,'Bb4',.4],[2.5,'G4',.9]],
 [[0,'D5',.4],[.5,'D5',.4],[2,'E5',.75]],[[.5,'G5',1],[2,'E5',.5],[3,'D5',.6]],
 [[0,'D5',.4],[.5,'D5',.4],[1.5,'Eb5',.4],[2,'D5',.75],[3,'A4',.6]],[[0,'C5',1.5],[2,'Bb4',1]],
 [[.5,'A4',.6],[1.5,'G4',.4],[2.5,'F#4',.9]],[[0,'G4',2.4]],
 [[0,'G4',.4],[.5,'G4',.4],[1.5,'Bb4',.4],[2,'A4',.75],[3,'D5',.6]],[[.5,'C5',.6],[1.5,'Bb4',.4],[2.5,'G4',.9]],
 [[0,'E5',1],[1.5,'D5',.5],[2.5,'C5',.75]],[[.5,'Bb4',1.5]],
 [[0,'D5',.4],[.5,'D5',.4],[2,'Eb5',1]],[[0,'F5',1.5],[2,'D5',1]],
 [[.5,'C5',.6],[1.5,'A4',.4],[2.5,'F#4',.9]],[[0,'G4',2.5]],
 [[0,'G4',2]],[],[[.5,'F4',1],[2,'Eb4',1.5]],[],
 [[0,'A4',1.5],[2,'G4',1]],[[.5,'Bb4',1.5],[3,'A4',.6]],
 [[0,'C5',1],[1.5,'Bb4',.5],[2.5,'A4',.75]],[[0,'F#4',2]],
 [[0,'D5',.4],[.5,'D5',.4],[1.5,'Eb5',.4],[2,'D5',.75],[3,'A4',.6]],[[.5,'C5',.6],[1.5,'Bb4',.4],[2.5,'G4',.9]],
 [[0,'E5',1],[1.5,'D5',.5],[2.5,'C5',.75]],[[0,'Bb4',2]],
 [[.5,'D5',.75],[2,'F5',.75],[3,'E5',.6]],[[0,'D5',1],[1.5,'C5',.5],[2.5,'Bb4',.75]],
 [[0,'A4',1],[1.5,'F#4',1]],[[0,'G4',2.5]],
];
const water:Tune=[
 [[.5,'Bb4',.5],[1.5,'A4',.5],[2.5,'G4',1]],[[0,'D5',1],[1.5,'C5',.5],[3,'Bb4',.6]],
 [[.5,'E5',.5],[1.5,'D5',.5],[2.5,'C5',1]],[[0,'G4',1.5],[2.5,'Bb4',.75]],
 [[.5,'D5',.5],[1.5,'Eb5',.5],[2.5,'D5',.75]],[[0,'C5',1],[1.5,'Bb4',.5],[3,'G4',.6]],
 [[.5,'A4',1],[2,'F#4',1]],[[0,'G4',2.5]],
 [[0,'Bb4',1.5],[2,'A4',1]],[[.5,'G4',1],[2.5,'D5',1]],
 [[0,'E5',1],[1.5,'G5',.5],[2.5,'F5',.75]],[[0,'E5',2.5]],
 [[.5,'D5',.5],[1.5,'Eb5',.5],[2.5,'D5',.75]],[[0,'Bb4',1],[1.5,'G4',1]],
 [[0,'C5',.75],[1.5,'A4',.5],[2.5,'F#4',.75]],[[0,'G4',2.5]],
 [[0,'Bb4',2]],[[1,'G4',2]],[[.5,'F4',1.5]],[[0,'Eb4',2.5]],
 [[0,'C5',1.5],[2,'A4',1]],[[.5,'Bb4',1],[2.5,'G4',1]],
 [[0,'A4',1],[1.5,'C5',.5],[2.5,'A4',.75]],[[0,'F#4',2.5]],
 ...work.slice(24,32),
];
const gantry:Tune=[
 [[1,'D4',.6],[2,'D4',.6]],[],[[.5,'Eb4',1],[2,'D4',1.25]],[],
 [[1,'A3',2]],[[.5,'C4',1],[2.5,'Bb3',1]],[[1,'A3',1.5]],[],
 [[1,'D4',.6],[2,'D4',.6]],[[1,'G4',1.5]],[[.5,'E4',1.5]],[],
 [[1,'D4',2]],[[.5,'Bb3',1],[2,'G3',1]],[[1,'F#3',1.5]],[],
 [[1,'G3',2]],[],[[.5,'F3',1.5]],[],[[1,'A3',2]],[],[[.5,'C4',1],[2,'A3',1]],[],
 [[1,'D4',.6],[2,'D4',.6]],[],[[.5,'E4',1],[2,'D4',1]],[],
 [[1,'Bb3',1.5]],[[.5,'A3',1.5]],[[1,'F#3',1.5]],[[.5,'G3',2.5]],
];
const combat:Tune=[
 [[0,'D5',.4],[.5,'D5',.4],[1,'Eb5',.4],[1.5,'D5',.4],[2.5,'A4',.8]],[[0,'C5',.75],[1.5,'Bb4',.5],[2.5,'G4',1]],
 [[0,'E5',.75],[1,'D5',.5],[2,'C5',1],[3.5,'D5',.4]],[[0,'G5',1],[1.5,'E5',.5],[2.5,'D5',.75]],
 [[0,'F5',.4],[.5,'F5',.4],[1.5,'Eb5',.4],[2,'D5',.75],[3,'A4',.6]],[[.5,'C5',1],[2,'Bb4',1]],
 [[0,'A4',.75],[1,'G4',.5],[2,'F#4',1],[3.5,'A4',.4]],[[0,'G4',2.5]],
 [[0,'G5',.75],[1,'F5',.5],[2,'D5',.75],[3,'Bb4',.6]],[[0,'C5',1.5],[2.5,'G4',.75]],
 [[.5,'E5',1],[2,'D5',1]],[[0,'C5',.75],[1,'Bb4',.5],[2,'G4',1.5]],
 [[0,'D5',.4],[.5,'D5',.4],[1.5,'Eb5',.4],[2,'D5',.75],[3,'A4',.6]],[[0,'F5',1],[1.5,'D5',1.5]],
 [[0,'C5',.75],[1,'A4',.5],[2,'F#4',1],[3.5,'A4',.4]],[[0,'G4',2.5]],
 [[0,'Bb4',2],[2.5,'G4',.75]],[[1,'F4',1.5]],[[0,'Eb4',2],[2.5,'F4',.75]],[[0,'G4',2.5]],
 [[.5,'A4',1.5],[2.5,'C5',.75]],[[0,'Bb4',1.5],[2,'A4',1]],
 [[0,'C5',1],[1.5,'Bb4',.5],[2.5,'A4',.75]],[[0,'F#4',2],[3,'A4',.6]],
 ...work.slice(24,30),[[0,'C5',.75],[1,'Bb4',.5],[2,'A4',.75],[3,'F#4',.6]],[[0,'G4',1.5],[3.5,'D5',.4]],
];
const furnace:Tune=[
 [[0,'D4',.6],[1,'D4',.6],[2,'Eb4',.6],[3,'D4',.6]],[[0,'A3',1.5],[2,'Bb3',1]],
 [[0,'E4',.75],[1.5,'D4',.5],[2.5,'C4',1]],[[0,'G4',1.5],[2,'E4',1]],
 [[0,'D4',.6],[1,'D4',.6],[2,'F4',.6],[3,'Eb4',.6]],[[0,'D4',1],[1.5,'C4',.5],[2.5,'Bb3',1]],
 [[0,'A3',1.5],[2,'F#3',1]],[[0,'G3',2.5]],
 ...combat.slice(8,16),
 [[0,'Bb4',2]],[[1,'G4',1.5]],[[0,'F4',2]],[[1,'Eb4',1.5]],
 [[0,'C5',1.5],[2,'A4',1]],[[.5,'Bb4',1.5]],[[0,'C5',1.5],[2,'A4',1]],[[0,'F#4',2.5]],
 ...combat.slice(24,32),
];
const chords={
 gm:{bass:'G2',notes:['Bb3','D4','F4','A4']},c:{bass:'C2',notes:['Bb3','D4','E4','G4']},
 eb:{bass:'Bb1',notes:['G3','Bb3','D4','F4']},d:{bass:'A1',notes:['F#3','C4','Eb4','A4']},
 bb:{bass:'Bb1',notes:['A3','C4','D4','F4']},f:{bass:'F2',notes:['A3','C4','D4','G4']},
 cm:{bass:'C2',notes:['Bb3','D4','Eb4','G4']},
} satisfies Record<string,{bass:Pitch;notes:Pitch[]}>;
type Chord=keyof typeof chords;
const changes:Chord[]=[
 'gm','gm','c','c','eb','eb','d','gm','gm','eb','c','gm','gm','bb','d','gm',
 'eb','eb','cm','cm','f','bb','d','d','gm','gm','c','eb','bb','cm','d','gm',
];
export function anchorBar(mode:AnchorMode,bar:number):Note[]{
 if(mode==='airship'||mode==='airfield'||mode==='observation')return flightBar(mode,bar);
 const i=((bar%32)+32)%32,quiet=mode==='anchorforge',boss=mode==='five-furnace',fight=boss||mode==='five-battle',race=mode==='coolingworks',breakdown=i>=16&&i<20;
 const {bass,notes:chord}=chords[changes[i]],out:Note[]=[];
 const add=(instrument:Note['instrument'],pitch:Pitch,beat:number,duration:number,velocity:number,pan=0)=>{const note:Note={instrument,pitch,beat,duration,velocity,pan};if(quiet)note.expression=phrasing(gantryDynamics[i],instrument==='strings');out.push(note);return note;};
 const tune=quiet?gantry:boss?furnace:fight?combat:race?water:work;
 for(const [beat,pitch,duration]of tune[i]){
  const voice=add(boss?'brass':'keys',pitch,beat,duration,quiet?.12:boss?.15:.21,-.16);
  if(quiet&&duration>=1.5)voice.expression!.bend=[[0,-1200/31],[.12,0],[.8,0],[1,0]];
 }
 if(quiet){
  if(i%2===0){
   const hold=changes[i]===changes[i+1]?7.2:3.5,from=chords[changes[(i+30)%32]].bass;
   add('bass',bass,0,hold,.08).expression!.bend=bassSlide(from,bass,hold);
   for(const [n,p]of chord.entries())add('strings',octave(p,-1),0,hold,.015,n%2?.4:-.4);
  }
  if(!tune[i].length)add('keys',chord[1],2,.8,.035,.3);
  return out;
 }
 // A bass riff carries the work rhythm; the middle gives it the foreground.
 const rhythm:[number,Pitch,number][]=breakdown?[[0,bass,1.25],[1.5,bass,.45],[2.5,octave(chord[0],-1),.65]]:race?[[0,bass,.9],[1.5,octave(chord[0],-1),.45],[2.5,bass,.9]]:[[0,bass,.65],[.75,bass,.4],[2,octave(chord[0],-1),.65],[3,bass,.6]];
 for(const [beat,p,d]of rhythm)add('bass',p,beat,d,fight?.145:.105);
 for(const beat of breakdown?[0]:i%4===3?[.5]:race?[1,3]:[1.5,3])for(const p of chord.slice(0,boss?4:3))add('keys',p,beat,breakdown?2.5:.4,fight?.032:.025,.3);
 if(boss||i>=20&&i<24)for(const [n,p]of chord.entries())add('strings',p,0,3.6,.017,n%2?.4:-.4);
 if([3,11,19,27].includes(i))add(race?'reed':'bell',i===19?'G4':'D5',2.5,.7,.055,.35);
 if(breakdown&&!fight)return out;
 const drum=fight?.1:.033;
 for(const beat of boss?[0,1.5,2.5]:[0,2])add('kick','C2',beat,.14,drum);
 for(const beat of [1,3])add('snare','D2',beat,.12,drum*.66,-.2);
 for(const beat of breakdown?[.5,1.5,2.5,3.5]:[0,.5,1,1.5,2,2.5,3,3.5])add('hat','F#2',beat,.07,drum*(beat%1?.19:.1),.4);
 if(fight&&[7,15,31].includes(i))for(const beat of [2.5,3.5])add('snare','D2',beat,.1,.028,-.2);
 if(boss&&[0,8,24].includes(i)){add('timpani',bass,0,1,.075);add('cymbal','C2',0,1.4,.03,.3);}
 return out;
}
