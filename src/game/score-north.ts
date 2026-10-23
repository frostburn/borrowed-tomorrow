import type { Instrument,Note } from './score';
import { octave,type Pitch } from './tuning';
import { phrasing,singing } from './expression';
export type NorthMode='bellharbor'|'frostwatch'|'glacier'|'wintershrine'|'north-battle'|'winter-dragon';
// C-rooted Orwell[9] and Myna[7], spelled as exact 31-EDO pitches.
export const ORWELL_NINE:readonly Pitch[]=['C4','Dd4','D#4','Et4','Ft4','G4','Ab4','A#4','B4'];
export const MYNA_SEVEN:readonly Pitch[]=['C4','D#4','Eb4','F#4','F#t4','A4','At4'];
type Phrase=readonly (readonly [beat:number,pitch:Pitch,hold:number])[];
// A hymn with two different thirds (D# = 7, Et = 11), not a major/minor
// approximation. Long descending sentences leave room for the harbor answers.
const harbor:readonly Phrase[]=[
 [[0,'G4',2],[3,'Et4',.75],[4,'Dd4',2],[7,'C4',1],[8,'D#4',2.5],[12,'G4',3]],
 [[0,'Ab4',3],[4,'G4',2],[7,'Ft4',1],[8,'Et4',2],[11,'Dd4',1],[13,'C4',2]],
 [[0,'B4',2.5],[4,'A#4',2],[7,'G4',1],[8,'Et4',3],[12,'D#4',2]],
 [[0,'Ft4',2],[3,'G4',1],[5,'Dd4',2],[8,'D#4',2.5],[12,'C4',3]],
 [[0,'C5',3],[4,'B4',2],[7,'Ab4',1],[8,'G4',3],[12,'Et4',2.5]],
 [[0,'A#4',2],[3,'G4',1],[5,'Ft4',2],[8,'Dd4',2],[11,'Et4',1.5],[14,'D#4',1]],
 [[0,'Ab4',3],[4,'Et5',2],[7,'Dd5',1],[8,'C5',2.5],[12,'G4',3]],
 [[0,'Ft4',2],[3,'Et4',1],[5,'Dd4',2],[8,'D#4',2],[11,'Dd4',1],[13,'C4',2.5]],
];
const road:readonly Phrase[]=[
 [[0,'G4',1],[2,'G4',.5],[3,'Et4',.75],[5,'Dd4',1],[7,'C4',.75],[8,'D#4',2],[12,'G4',2]],
 [[0,'Ab4',1.5],[2,'G4',1],[4,'Ft4',1],[6,'Et4',1],[8,'Dd4',2],[12,'C4',2.5]],
 [[0,'B4',1],[2,'A#4',1],[4,'G4',1.5],[7,'Et4',.75],[9,'D#4',2],[13,'C4',2]],
 [[0,'Dd4',1],[2,'Ft4',1],[4,'G4',2],[7,'Ab4',.75],[9,'Et4',2],[13,'C4',2]],
 [[0,'C5',2],[3,'B4',1],[5,'Ab4',1],[7,'G4',.75],[9,'Et4',2],[13,'D#4',2]],
 [[0,'A#4',1.5],[2,'G4',1],[4,'Et4',2],[7,'Ft4',.75],[9,'Dd4',2],[13,'D#4',2]],
 [[0,'G4',1],[2,'Ab4',1],[4,'Et5',2],[7,'Dd5',.75],[9,'C5',2],[13,'G4',2]],
 [[0,'Ft4',1.5],[2,'Et4',1],[4,'Dd4',2],[7,'D#4',.75],[9,'G4',2],[13,'C4',2.5]],
];
// Myna's one-step neighbours colour the wrecks; let each ringing tone decay
// before its neighbour answers. No continuously doubled semitone clusters.
const wreck:readonly Phrase[]=[
 [[0,'At4',3],[5,'A4',2.5],[10,'F#t4',3]],
 [[1,'F#4',3],[7,'Eb4',2],[12,'D#4',2.5]],
 [[0,'C5',3.5],[6,'At4',2],[11,'A4',3]],
 [[0,'F#t4',3],[6,'F#4',2.5],[11,'C4',3]],
 [[0,'Eb5',3],[5,'D#5',2],[10,'At4',3.5]],
 [[1,'A4',3],[7,'F#4',2],[12,'D#4',2.5]],
 [[0,'F#t5',3],[5,'Eb5',2],[10,'C5',3]],
 [[0,'At4',3],[5,'F#t4',2.5],[10,'D#4',2],[13,'C4',2]],
];
const sanctuary:readonly Phrase[]=[
 [[0,'D#4',3],[5,'G4',2],[10,'Et4',3.5]],
 [[0,'Ab4',3],[6,'Ft4',2],[11,'Dd4',3]],
 [[0,'B4',3],[5,'G4',2.5],[11,'D#4',3]],
 [[0,'Et4',3],[5,'Dd4',2],[10,'C4',4]],
 [[0,'Et5',3],[5,'C5',2.5],[11,'Ab4',3]],
 [[0,'A#4',3],[6,'Ft4',2],[11,'Et4',3]],
 [[0,'G4',3],[5,'B4',2.5],[11,'Dd5',3]],
 [[0,'C5',3],[5,'G4',2],[10,'D#4',2],[13,'C4',2.5]],
];
const fight:readonly Phrase[]=[
 [[0,'G4',.75],[1.5,'Et4',.5],[3,'Dd4',.75],[4,'C4',1],[6,'D#4',1],[8,'G4',1.5],[11,'Ft4',.75],[13,'Et4',1.5]],
 [[0,'Ab4',1],[2,'G4',.75],[3.5,'Ft4',.5],[5,'Et4',1],[7,'Dd4',.5],[8,'D#4',1.5],[11,'G4',.75],[13,'C4',2]],
 [[0,'B4',1.5],[2,'A#4',.5],[3.5,'G4',.5],[5,'Et4',1],[7,'D#4',.75],[9,'Dd4',1],[11,'G4',1],[13,'Ab4',1.5]],
 [[0,'Ft4',1],[2,'Dd4',.75],[4,'C4',1.5],[6,'D#4',.5],[8,'Et4',1],[10,'G4',1],[12,'Dd4',1],[14,'C4',1]],
 [[0,'C5',1.5],[2,'B4',.5],[4,'Ab4',1],[6,'G4',.75],[8,'Et4',1.5],[11,'D#4',.75],[13,'G4',1.5]],
 [[0,'A#4',1],[2,'G4',.75],[4,'Ft4',1.5],[6,'Dd4',.5],[8,'Et4',1.5],[11,'D#4',1],[13,'C4',2]],
 [[0,'Ab4',1],[2,'Et5',1.5],[4,'Dd5',1],[6,'C5',.75],[8,'G4',1],[10,'Ft4',1],[12,'Et4',1],[14,'D#4',1]],
 [[0,'Ft4',1],[2,'Et4',.75],[4,'Dd4',1.5],[7,'D#4',.75],[9,'G4',1],[11,'Dd4',1],[13,'C4',2]],
];
// Four-bar 5/4 sentences. Heavy three-beat steps, then a two-beat wing lift.
const dragon:readonly Phrase[]=[
 [[0,'D#5',2],[3,'C5',1.5],[5,'G4',2],[8,'Ft4',1],[10,'Ab4',2.5],[14,'G4',1],[15,'Et4',2],[18,'D#4',1.5]],
 [[0,'B4',2],[3,'Ab4',1],[5,'G4',2.5],[8,'Et4',1],[10,'Ft4',2],[13,'Dd4',1],[15,'D#4',2],[18,'C4',1.5]],
 [[0,'Et5',2.5],[3,'D#5',1],[5,'C5',2],[8,'G4',1.5],[10,'A#4',2],[13,'Ab4',1],[15,'Ft4',2],[18,'Dd4',1.5]],
 [[0,'D#5',2],[3,'Ab4',1],[5,'Ft4',2],[8,'G4',1.5],[10,'Et4',2],[13,'Dd4',1],[15,'C4',3.5]],
 [[0,'C5',3],[4,'B4',.75],[5,'Ab4',2.5],[8,'G4',1],[10,'Et5',3],[14,'Dd5',.75],[15,'D#5',2.5],[18,'C5',1]],
 [[0,'A#4',2],[3,'Ft4',1.5],[5,'G4',2],[8,'Et4',1],[10,'Ab4',2],[13,'G4',1],[15,'D#4',2],[18,'Dd4',1.5]],
 [[0,'D#5',2.5],[3,'Et5',1],[5,'G5',2],[8,'B4',1],[10,'Ab4',2],[13,'Ft4',1],[15,'Et4',2],[18,'D#4',1.5]],
 [[0,'Ft4',2],[3,'G4',1],[5,'Dd4',2.5],[8,'C4',1],[10,'D#4',2],[13,'Et4',1],[15,'C4',4]],
];
const forms:Record<NorthMode,readonly Phrase[]>={bellharbor:harbor,frostwatch:road,glacier:wreck,wintershrine:sanctuary,'north-battle':fight,'winter-dragon':dragon};
const gains=[.73,.84,.9,.69,.8,.91,.86,.65,.82,.88,.96,.72,.86,.95,.79,.63,.88,.98,1,.83,.86,.94,.82,.72,.91,1,.93,.77,.83,.89,.76,.59];
export function northBar(mode:NorthMode,bar:number):Note[]{
 const boss=mode==='winter-dragon',battle=boss||mode==='north-battle',quiet=mode==='glacier'||mode==='wintershrine',beats=boss?5:4;
 const out:Note[]=[];
 const add=(instrument:Instrument,pitch:Pitch,beat:number,duration:number,velocity:number,pan=0)=>{const note:Note={instrument,pitch,beat,duration,velocity,pan};out.push(note);return note;};
 if(boss&&bar<2){
  add('timpani','C2',0,1.8,.16);add('bass',bar?'D#2':'C2',0,4.8,.15);
  for(const [j,p]of (bar?['Ab3','Ft3','D#3']:['C3','D#3','Ft3','Ab3']).entries())add('tritaver',p as Pitch,j,2.2,.11,-.22+j*.13).expression=singing('clear',.85,2.2);
  add('bell',bar?'D#5':'C5',4,2.5,.1,.32).expression={...phrasing(.8),release:1.1};
  return out;
 }
 const i=((bar-(boss?2:0))%32+32)%32,phrase=Math.floor(i/4),within=i%4,strength=gains[i];
 const lead=battle?'tritaver':mode==='glacier'?'bell':'sine';
 for(const [at,p,hold]of forms[mode][phrase])if(at>=within*beats&&at<(within+1)*beats){
  const n=add(lead,p,at-within*beats,hold,mode==='glacier'?.12:battle?.19:.17,-.15);
  n.expression=lead==='bell'?{...phrasing(strength),release:1.2}:singing(quiet||mode==='bellharbor'?'warm':'clear',strength,hold,within===3);
 }
 const tones=mode==='glacier'?MYNA_SEVEN:ORWELL_NINE;
 // Hold roots through the quieter answer bars. Orwell's thirds alternate at
 // phrase boundaries; the melody supplies the other third without a loud clash.
 const rootIndex=[0,6,2,0,4,6,1,0][phrase],root=mode==='glacier'?tones[[0,3,5,2,4,1,5,0][phrase]]:tones[rootIndex];
 const rootBass=octave(root,-2);
 if(battle){
  for(const beat of boss?[0,2,3,4]:[0,1.5,2,3])add('bass',rootBass,beat,beat===0?1.25:.65,.145*strength,-.1);
  for(const beat of boss?[0,3]:[0,2])add('kick','C2',beat,.22,.11);
  for(const beat of boss?[2,4]:[1,3])add('snare','D2',beat,.22,.08, .06);
  for(let beat=.5;beat<beats;beat++)add('hat','F#2',beat,.1,.026,.4);
  if(within===3){add('timpani','C2',beats-1,.5,.1,-.25);add('timpani','G2',beats-.5,.4,.085,.2);}
  if(i%8===0)add('cymbal','C3',0,2,.045,.2);
  const chord=boss?['C3','D#3','Ft3','Ab3']as const:[octave(root,-1),octave(tones[(rootIndex+2)%9],-1),octave(tones[(rootIndex+5)%9],-1)];
  for(const [j,p]of chord.entries())add('strings',p,0,beats-.25,.025*strength,j%2?-.4:.4).expression=phrasing(strength,true);
  if(boss&&within===2)add('bell',tones[(phrase*2+4)%9],3,2.5,.07,.3).expression={...phrasing(strength),release:1.2};
 }else{
  if(within%2===0)add('round-bass',rootBass,0,beats*2-.15,.13,-.08).expression=phrasing(strength,true);
  const third=mode==='glacier'?tones[(phrase+2)%7]:phrase%2?'Et4':'D#4';
  if(within===0){for(const [j,p]of [octave(root,-1),octave(third,-1)].entries())add('strings',p,0,beats*4-.25,.025,j?-.4:.4).expression=singing('warm',strength,beats*4-.25);}
  if(within===0||within===2)add('bell',octave(mode==='glacier'?tones[(phrase+3)%7]:tones[(phrase+5)%9],1),within===0?2.5:3,beats+1.5,quiet?.055:.06,.3).expression={...phrasing(strength),release:1.4};
  if(mode==='frostwatch'){
   for(const at of [0,2])add('timpani','C2',at,.35,.045*strength,-.2);
   add('wood',octave(root,1),3,.6,.045,.4);
  }
  if(mode==='bellharbor'&&within===1)add('sine',tones[(phrase+4)%9],2,1.5,.065,.4).expression=singing('warm',strength,1.5);
 }
 return out;
}
