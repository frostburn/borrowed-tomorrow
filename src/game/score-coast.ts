import { octave, transpose, type Pitch } from './tuning';
import type { Note } from './score';
// C–Bm7b5/D–Em7–Am–Gm7–C7–F–Em–Dm–G–C, extended to sixteen bars.
// Put the half-diminished chord in first inversion for a C–D–E bass ascent.
const chords:Pitch[][] = [
  ['C2','C4','E4','G4'],['D2','A3','B3','D4','F4'],['E2','B3','D4','G4'],['A2','C4','E4','A4'],
  ['G2','Bb3','D4','F4'],['C2','Bb3','E4','G4'],['F2','C4','F4','A4'],['E2','B3','E4','G4'],
  ['D2','C4','F4','A4'],['G2','B3','D4','G4'],['C2','C4','E4','G4'],['A2','C4','E4','A4'],
  ['F2','C4','F4','A4'],['D2','C4','F4','A4'],['G2','B3','D4','G4'],['C2','C4','E4','G4'],
];
// Preserve the original two-bar opening, then develop it over a shared
// half-note pulse with longer phrase endings and a lifted middle.
const melody: [number,Pitch,number][][] = [
  [[0,'E5',1.25],[1.5,'G5',.25],[2,'F5',.25],[2.5,'E5',.25],[3,'D5',.75]],
  [[0,'D5',1.5],[2,'F5',.5],[3,'B4',.75]],
  [[0,'B4',1],[1.5,'D5',.5],[2,'G4',1.5]],
  [[0,'A4',3]],
  [[0,'D5',1.5],[2,'F5',.5],[2.5,'Eb5',.5],[3,'D5',.75]],
  [[0,'E5',2],[2.5,'D5',.5],[3,'Bb4',.75]],
  [[0,'A4',1],[1.5,'C5',.5],[2,'A4',1.5]],
  [[0,'G4',3.5]],
  [[0,'F5',2],[2.5,'A5',1]],
  [[0,'D5',1.5],[2,'B4',.5],[3,'D5',.75]],
  [[0,'E5',2],[2.5,'G5',.5],[3,'D5',.75]],
  [[0,'C5',3]],
  [[0,'A4',1.5],[2,'C5',.5],[2.5,'B4',.5],[3,'A4',.75]],
  [[0,'A4',2],[2.5,'F5',.5],[3,'D5',.75]],
  [[0,'D5',1],[1.5,'C5',.5],[2,'B4',1.5]],
  [[0,'C5',3]],
];
// The raid remembers the coastal call in C minor. Its last phrase moves
// through a French sixth to a suspended G7(b9), leaving the raid unresolved.
// The exploration harmony and its accepted opening stay independent.
const raidChords:Pitch[][]=[
 ['C2','C4','Eb4','G4'],['D2','A3','B3','D4','F4'],['Eb2','Bb3','D4','G4'],['Ab2','C4','Eb4','G4'],
 ['G2','Bb3','D4','F4'],['C2','Bb3','Eb4','G4'],['F2','C4','F4','Ab4'],['G2','B3','D4','F4'],
 ['D2','C4','F4','Ab4'],['G2','B3','D4','Ab4'],['C2','Bb3','Eb4','G4'],['Ab2','C4','Eb4','G4'],
 ['F2','C4','F4','Ab4'],['D2','C4','F4','Ab4'],['Ab1','C4','D4','F#4'],['G2','C4','D4','F4'],
];
const raid: [number,Pitch,number][][] = [
  // Call and answer.
  [[0,'Eb5',.5],[1,'G5',.5],[2,'F5',.5],[2.5,'Eb5',.5],[3,'D5',.75]],
  [[0,'D5',1.5],[2,'F5',.5],[3,'B4',.75]],
  [[0,'Bb4',.5],[1,'D5',.5],[2,'C5',.5],[2.5,'Bb4',.5],[3,'G4',.75]],
  [[0,'C5',1],[1.5,'Eb5',.5],[2,'Ab4',1.5]],
  // The same sentence, answering over Gm7–Cm7–Fm–G7.
  [[0,'D5',.5],[1,'F5',.5],[2,'Eb5',.5],[2.5,'D5',.5],[3,'C5',.75]],
  [[0,'Eb5',1.5],[2,'D5',.5],[3,'Bb4',.75]],
  [[0,'Ab4',.5],[1,'C5',.5],[2,'Bb4',.5],[2.5,'Ab4',.5],[3,'G4',.75]],
  [[0,'G4',1],[1.5,'B4',.5],[2,'D5',1.5]],
  // Open the register and let the melody breathe over a half-time backbeat.
  [[0,'F5',2],[2.5,'Ab5',1.5]],
  [[0,'G5',1.5],[2,'D5',.5],[3,'B4',.75]],
  [[0,'Eb5',2],[2.5,'G5',1.5]],
  [[0,'C5',2],[2.5,'Eb5',.5],[3,'G5',.75]],
  // Return to the call, then leave a suspended dominant at the loop.
  [[0,'Ab4',.5],[1,'C5',.5],[2,'B4',.5],[2.5,'Ab4',.5],[3,'G4',.75]],
  [[0,'Ab4',1.5],[2,'F5',.5],[3,'D5',.75]],
  [[0,'D5',.5],[1,'F#5',.5],[2,'D5',.5],[2.5,'C5',.5],[3,'Ab4',.75]],
  [[0,'D5',1],[1.5,'C5',.5],[2,'B4',1],[3.5,'D5',.5]],
];
export function coastBar(bar: number, battle:boolean): Note[] {
  const i=((bar%16)+16)%16, [root,...voicing]=(battle?raidChords:chords)[i], notes:Note[]=[];
  const add=(instrument:Note['instrument'],pitch:Pitch,beat:number,duration:number,velocity:number,pan=0)=>notes.push({instrument,pitch,beat,duration,velocity,pan});
  for(const [beat,pitch,duration] of (battle?raid:melody)[i])add('reed',pitch,beat,duration,battle?.23:i>=8&&i<12?.22:.2,-.15);
  // Round fundamental/octave support avoids a sub-octave and strong odd partials
  // rubbing against the meantone chords. Keep the accepted C–D–E bass opening.
  if(!battle){
    const end=i%4===3,opening=i<2;
    for(const beat of (end?[0]:[0,2])){
      add('round-bass',transpose(root,beat===2&&[2,6,9,13].includes(i)?'P5':'P1'),beat,end?3.4:opening&&beat===0?1.8:1.7,beat===0?.14:opening?.1:.095);
      for(const pitch of voicing)add('keys',octave(pitch,-1),beat,end?2.5:opening?(beat===0?1.7:1.5):1.6,beat===0?.038:opening?.028:.026,.25);
    }
    if(!end)for(const beat of [1,3])add('hat','F#2',beat,.08,opening?(beat===1?.018:.015):beat===1?.014:.011,.4);
  }else{
    const broad=i>=8&&i<12;
    for(const beat of (broad?[0,2]:[0,1,2,3]))add('round-bass',transpose(root,beat%2?'P5':'P1'),beat,broad?1.7:.7,beat===0?.16:beat%2?.1:.13);
    for(const beat of (broad?[0]:[0,2]))for(const pitch of battle&&i===15&&beat===2?['B3','D4','F4','Ab4']as Pitch[]:voicing)add('keys',octave(pitch,-1),beat,broad?3.2:.55,beat===0?.04:.026,.25);
    for(const beat of [0,2])add('kick','C2',beat,.18,.09);
    for(const beat of (broad?[2]:[1,3]))add('snare','D2',beat,.14,.055,-.1);
    for(const beat of (broad?[0,1,2,3]:[.5,1.5,2.5,3.5]))add('hat','F#2',beat,.07,broad?.016:.021,.4);
    if(i===7||i===15)for(const beat of [3.25,3.75])add('snare','D2',beat,.1,.035,-.1);
  }
  // The lifted phrase adds a sustained layer, then drops back for the cadence.
  if(i>=8&&i<12)for(const pitch of voicing)add('strings',octave(pitch,-1),0,3.5,.014,.4);
  return notes;
}
