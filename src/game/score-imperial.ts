import type {MusicMode,Note,Instrument} from './score';
import type {Pitch} from './tuning';
import {singing} from './expression';
type Figure=readonly [beat:number,pitches:readonly Pitch[],lastHold?:number];
type Sentence=readonly Figure[];
// Four-bar sentences in a lower register. Short eighth-note runs move against
// the broad lead, with a breath between figures and a longer cadence note.
// Each line follows its actual harmony rather than transposing an arpeggio.
const capital:readonly Sentence[]=[
 [[1,['F5','E5','D5','C5','D5','E5']],[4.5,['D5','C5','Bb4','A4','Bb4','C5']],
  [9,['A4','Bb4','C5','D5','C5','Bb4']],[12.5,['A4','G4','F4','E4','F4'],.85]],
 [[.5,['F5','E5','D5','C5','D5','F5']],[4.5,['D5','C5','Bb4','A4','Bb4','D5']],
  [8.5,['Bb4','C5','D5','F5','Eb5','D5']],[12,['C5','Bb4','A4','Bb4','G4'],.9]],
 [[1,['A4','G4','F4','E4','F4','A4']],[4.5,['F4','G4','A4','Bb4','A4','G4']],
  [9,['C5','D5','C5','Bb4','A4','G4']],[12.5,['A4','G4','F4','E4','F4'],.85]],
 [[.5,['E5','D5','C#5','B4','C#5','E5']],[4.5,['C#5','D5','E5','G5','F5','E5']],
  [8.5,['A4','B4','C#5','D5','C#5','B4']],[12,['A4','G4','F4','E4'],1.25]],
 [[1,['Bb4','A4','G4','F4','G4','Bb4']],[4.5,['G4','A4','Bb4','C5','Bb4','A4']],
  [9,['D5','Eb5','D5','C5','Bb4','A4']],[12.5,['G4','A4','Bb4','A4','G4'],.85]],
 [[.5,['F5','Eb5','Db5','C5','Db5','F5']],[4.5,['Db5','C5','Bb4','Ab4','Bb4','Db5']],
  [8.5,['Bb4','C5','Db5','F5','Eb5','Db5']],[12,['C5','Bb4','Ab4','F4'],1.25]],
 [[1,['B4','A4','G4','F4','E4','G4']],[4.5,['G4','A4','B4','C5','B4','A4']],
  [9,['E5','D5','C5','B4','A4','G4']],[12.5,['F4','E4','D4','E4'],1.25]],
 [[.5,['E5','D5','C#5','B4','C#5','E5']],[4.5,['C#5','B4','A4','G4','A4','C#5']],
  [8.5,['E5','D5','C#5','B4','A4','G4']],[12,['F4','E4','D4','C#4'],1.25]],
];
const emperor:readonly Sentence[]=[
 [[.5,['Ab4','Bb4','C5','Bb4','Ab4']],[3.5,['F4','G4','Ab4','G4']],
  [6.5,['C5','Bb4','Ab4','G4','F4']],[9.5,['G4','Ab4','G4','F4'],.65]],
 [[.5,['Ab4','Gb4','F4','Eb4','F4']],[3.5,['F4','Gb4','Ab4','Bb4']],
  [6.5,['Db5','C5','Bb4','Ab4','Gb4']],[9.5,['F4','Eb4','F4','Ab4'],.65]],
 [[.5,['C5','Bb4','Ab4','G4','Ab4']],[3.5,['Ab4','Bb4','C5','Db5']],
  [6.5,['Eb5','Db5','C5','Bb4','Ab4']],[9.5,['Bb4','C5','Bb4','Ab4'],.65]],
 [[.5,['E5','D5','C5','B4','C5']],[3.5,['G4','A4','B4','C5']],
  [6.5,['G4','F4','E4','D4','E4']],[9,['F4','E4','D4','C4'],1.1]],
 [[.5,['C5','Db5','C5','Bb4','Ab4']],[3.5,['Ab4','G4','F4','E4']],
  [6.5,['F4','G4','Ab4','Bb4','C5']],[9.5,['Bb4','Ab4','G4','F4'],.65]],
 [[.5,['Ab4','Bb4','Ab4','Gb4','F4']],[3.5,['F4','Eb4','Db4','Eb4']],
  [6.5,['F4','Ab4','Bb4','C5','Db5']],[9.5,['C5','Bb4','Ab4','F4'],.65]],
 [[.5,['D5','C5','B4','A4','G4']],[3.5,['G4','A4','B4','C5']],
  [6.5,['D5','E5','D5','C5','B4']],[9.5,['A4','G4','A4','B4'],.65]],
 [[.5,['G4','F4','E4','D4','C4']],[3.5,['E4','F4','G4','A4']],
  [6.5,['C5','B4','A4','G4','F4']],[9,['E4','F4','G4','E4'],1.1]],
];
export function imperialCounterline(mode:MusicMode,bar:number):Note[]{
 let form:readonly Sentence[],beats:number,intro=0,instrument:Instrument='strings';
 switch(mode){
  case 'capital-battle':form=capital;beats=4;break;
  case 'emperor':form=emperor;beats=3;intro=2;break;
  default:return [];
 }
 if(bar<intro)return [];
 const i=bar-intro,phrase=Math.floor(i/4)%form.length,within=i%4;
 // Reeds carry the counterline when the Emperor melody turns to strings.
 if(mode==='emperor'&&i>=16&&i<24)instrument='reed';
 const strength=within===3?.75:within===0?.88:1;
 return form[phrase].flatMap(([at,pitches,lastHold])=>pitches.map((pitch,j)=>{
  const duration=j===pitches.length-1?(lastHold??.42):.42;
  return {instrument,pitch,beat:at+j*.5-within*beats,duration,velocity:.105,pan:.3,
   expression:singing('clear',strength*(j===0?1:.9),duration,within===3)};
 })).filter(n=>n.beat>=0&&n.beat<beats);
}
