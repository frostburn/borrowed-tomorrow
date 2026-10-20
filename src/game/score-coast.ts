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
// The E–G call survives the rewrite, but its answers have different lengths:
// clipped departures, held arrivals, a broader middle and a quiet return.
const melody: [number,Pitch,number][][] = [
  [[0,'E5',1],[1.5,'G5',.5],[2.5,'F5',.5],[3.25,'E5',.5]],
  [[0,'D5',2],[2.5,'F5',.5],[3.5,'B4',.25]],
  [[0,'B4',.75],[1,'D5',.5],[2,'G4',1.5]],
  [[0,'A4',2.75]],
  [[0,'D5',.75],[1.5,'F5',.5],[2.5,'Eb5',.25],[3,'D5',.75]],
  [[0,'E5',2.25],[2.75,'D5',.5],[3.5,'Bb4',.25]],
  [[0,'A4',.5],[.75,'C5',.5],[1.5,'B4',.25],[2,'A4',1.5]],
  [[0,'G4',2.5]],
  [[0,'F5',1.5],[2,'A5',1.25],[3.5,'G5',.25]],
  [[0,'D5',.75],[1,'B4',.75],[2.5,'D5',1]],
  [[0,'E5',2],[2.5,'G5',.5],[3.5,'D5',.25]],
  [[0,'C5',2.75]],
  [[0,'A4',1],[1.5,'C5',1],[3,'G4',.5]],
  [[0,'A4',2],[2.5,'F5',.5],[3.5,'D5',.25]],
  [[0,'D5',.75],[1,'C5',.5],[2,'B4',1.75]],
  [[0,'C5',3]],
];
// The raid keeps the harbor's tune and borrowed harmony. Shorter replies and a
// higher middle make room for a moving rhythm section rather than a second lead.
const raid: [number,Pitch,number][][] = [
  [[0,'E5',.5],[.75,'G5',.5],[1.5,'E5',.5],[2.25,'F5',.5],[3,'D5',.75]],
  [[0,'D5',1],[1.5,'F5',.5],[2.25,'B4',.75],[3.25,'A4',.5]],
  [[0,'B4',.5],[1,'D5',.5],[1.75,'G5',.75],[3,'D5',.5]],
  [[0,'C5',1],[1.5,'E5',.5],[2.5,'A4',.75]],
  [[0,'D5',.75],[1,'F5',.5],[2,'Eb5',.25],[2.5,'D5',1]],
  [[0,'E5',1],[1.5,'D5',.5],[2.5,'Bb4',.5],[3.25,'G4',.5]],
  [[0,'A4',.5],[.75,'C5',.5],[1.5,'A4',.75],[3,'G4',.5]],
  [[0,'G4',1.5],[2,'B4',.5],[3,'D5',.5]],
  [[0,'F5',.75],[1,'A5',.75],[2.25,'C6',.5],[3,'A5',.75]],
  [[0,'G5',1],[1.5,'D5',.5],[2.25,'B4',.75],[3.25,'D5',.5]],
  [[0,'E5',.5],[.75,'G5',.5],[1.75,'D5',.75],[3,'E5',.5]],
  [[0,'C5',1],[1.5,'E5',.5],[2.5,'A4',.75]],
  [[0,'A4',.5],[1,'C5',.5],[1.75,'B4',.25],[2.25,'A4',.5],[3.25,'G4',.5]],
  [[0,'A4',1],[1.5,'F5',.5],[2.5,'D5',1]],
  [[0,'D5',.75],[1,'C5',.5],[2,'B4',.5],[3,'D5',.5]],
  [[0,'C5',2.5]],
];
const comping=[[0],[0,2],[0,2.5],[0],[0,2],[0,2.75],[0,1.5],[0],[0,2.5],[0,1.5],[0],[0],[0,2.25],[0],[0,2],[0]];
// Beat, duration, chord interval. Written bass replies leave the phrase ends open.
const bass: [number,number,'P1'|'P5'][] [] = [
  [[0,2.75,'P1']], [[0,1.8,'P1'],[2.5,.75,'P1']], [[0,1.5,'P1'],[2,.7,'P5']], [[0,3.4,'P1']],
  [[0,2.7,'P1'],[3,.6,'P5']], [[0,3.3,'P1']], [[0,1.5,'P1'],[2,1.3,'P5']], [[0,3.2,'P1']],
  [[0,2.7,'P1'],[3.25,.5,'P5']], [[0,1.5,'P1'],[2.5,.9,'P1']], [[0,3.3,'P1']], [[0,3.25,'P1']],
  [[0,1.7,'P1'],[2.25,.9,'P5']], [[0,2.8,'P1']], [[0,1.6,'P1'],[2,.65,'P5'],[3.25,.5,'P1']], [[0,3.4,'P1']],
];
export function coastBar(bar: number, battle:boolean): Note[] {
  const i=((bar%16)+16)%16, [root,...voicing]=chords[i], notes:Note[]=[];
  const add=(instrument:Note['instrument'],pitch:Pitch,beat:number,duration:number,velocity:number,pan=0)=>notes.push({instrument,pitch,beat,duration,velocity,pan});
  for(const [beat,pitch,duration] of (battle?raid:melody)[i])add('reed',pitch,beat,duration,battle?.23:i>=8&&i<12?.22:.2,-.15);
  // Round fundamental/octave support avoids a sub-octave and strong odd partials
  // rubbing against the meantone chords. Keep the accepted C–D–E bass opening.
  if(!battle){
    for(const [beat,duration,interval] of bass[i])add('round-bass',transpose(root,interval),beat,duration,beat===0?.14:.085);
    for(const beat of comping[i])for(const pitch of voicing)add('keys',octave(pitch,-1),beat,beat===0?1.6:.8,beat===0?.038:.026,.25);
    if([0,4,8,12].includes(i))add('hat','F#2',1.5,.08,.016,.4);
    if([2,6,9,14].includes(i))add('hat','F#2',3,.08,.013,.4);
  }else{
    const broad=i>=8&&i<12,end=i%4===3;
    for(const beat of (end?[0,2]:broad?[0,2.5]:i%2?[0,1.5,3]:[0,.75,2.5]))add('round-bass',transpose(root,beat===2.5?'P5':'P1'),beat,.6,beat===0?.16:.11);
    for(const beat of (end?[0]:i%2?[0,2.5]:[0,1.5,3]))for(const pitch of voicing)add('keys',octave(pitch,-1),beat,.42,beat===0?.04:.026,.25);
    for(const beat of (end?[0]:broad?[0,2.5]:[0,2]))add('kick','C2',beat,.18,.09);
    for(const beat of (end?[1]:broad?[2]:[1,3]))add('snare','D2',beat,.14,.055,-.1);
    for(const beat of (end?[.5,1.5]:i%2?[.5,2,3.5]:[.5,1.5,2.5,3.5]))add('hat','F#2',beat,.07,.021,.4);
    if(i===7||i===14)for(const beat of [3.25,3.75])add('snare','D2',beat,.1,.035,-.1);
  }
  // The lifted phrase adds a sustained layer, then drops back for the cadence.
  if(i>=8&&i<12)for(const pitch of voicing)add('strings',octave(pitch,-1),0,3.5,.014,.4);
  return notes;
}
