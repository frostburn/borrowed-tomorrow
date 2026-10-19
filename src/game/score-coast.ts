import { octave, type Pitch } from './tuning';
import type { Note } from './score';
// C–Bm7b5–Em7–Am–Gm7–C7–F–Em–Dm–G–C, extended to sixteen bars.
const chords:Pitch[][] = [
  ['C2','C4','E4','G4'],['B1','A3','D4','F4'],['E2','B3','D4','G4'],['A2','C4','E4','A4'],
  ['G2','Bb3','D4','F4'],['C2','Bb3','E4','G4'],['F2','C4','F4','A4'],['E2','B3','E4','G4'],
  ['D2','C4','F4','A4'],['G2','B3','D4','G4'],['C2','C4','E4','G4'],['A2','C4','E4','A4'],
  ['F2','C4','F4','A4'],['D2','C4','F4','A4'],['G2','B3','D4','G4'],['C2','C4','E4','G4'],
];
// A two-bar call and answer returns over the borrowed chords, then rises in the
// third phrase. The last phrase recalls the call and settles into the loop.
// Short passing notes leave space between the longer, chord-supported arrivals.
const melody: [number,Pitch,number][][] = [
  [[0,'E5',1.25],[1.5,'G5',.25],[2,'F5',.25],[2.5,'E5',.25],[3,'D5',.75]],
  [[0,'D5',1.5],[2,'F5',.5],[3,'B4',.75]],
  [[0,'B4',1.25],[1.5,'D5',.25],[2,'C5',.25],[2.5,'B4',.25],[3,'G4',.75]],
  [[0,'A4',2.5]],
  [[0,'D5',1.25],[1.5,'F5',.25],[2,'Eb5',.25],[2.5,'D5',.25],[3,'C5',.75]],
  [[0,'E5',1.5],[2,'D5',.5],[3,'Bb4',.75]],
  [[0,'A4',1.25],[1.5,'C5',.25],[2,'B4',.25],[2.5,'A4',.25],[3,'G4',.75]],
  [[0,'G4',2.5]],
  [[0,'F5',1.25],[1.5,'A5',.25],[2,'G5',.25],[2.5,'F5',.25],[3,'E5',.75]],
  [[0,'D5',1.5],[2,'B4',.5],[3,'D5',.75]],
  [[0,'E5',1.25],[1.5,'G5',.25],[2,'F5',.25],[2.5,'E5',.25],[3,'D5',.75]],
  [[0,'C5',2.5]],
  [[0,'A4',1.25],[1.5,'C5',.25],[2,'B4',.25],[2.5,'A4',.25],[3,'G4',.75]],
  [[0,'A4',1.5],[2,'F5',.5],[3,'D5',.75]],
  [[0,'D5',1.25],[1.5,'C5',.25],[2,'B4',1.5]],
  [[0,'C5',3]],
];
export function coastBar(bar: number): Note[] {
  const i=((bar%16)+16)%16, [root,...voicing]=chords[i], notes:Note[]=[];
  const add=(instrument:Note['instrument'],pitch:Pitch,beat:number,duration:number,velocity:number,pan=0)=>notes.push({instrument,pitch,beat,duration,velocity,pan});
  for(const [beat,pitch,duration] of melody[i])add('reed',pitch,beat,duration,i>=8&&i<12?.22:.2,-.15);
  // Stable half-note support gives the melody room; no second moving treble line.
  add('bass',root,0,i%4===3?3.4:1.8,.14);
  if(i%4!==3)add('bass',root,2,1.7,.1);
  for(const pitch of voicing){
    add('keys',octave(pitch,-1),0,1.7,.038,.25);
    if(i%4!==3)add('keys',octave(pitch,-1),2,1.5,.028,.25);
  }
  // The lifted phrase adds a sustained layer, then drops back for the cadence.
  if(i>=8&&i<12)for(const pitch of voicing)add('strings',octave(pitch,-1),0,3.5,.014,.4);
  if(i%4!==3){add('hat','F#2',1,.08,.018,.4);add('hat','F#2',3,.08,.015,.4);}
  return notes;
}
