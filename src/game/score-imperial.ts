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
 [[.5,['F5','D5','E5','C5','D5','F5']],[4.5,['D5','C5','A4','Bb4','C5','D5']],
  [8.5,['Bb4','C5','D5','F5','Eb5','D5']],[12,['Bb4','A4','D5','C5','G4'],.9]],
 [[1,['A4','G4','F4','E4','F4','A4']],[4.5,['F4','C5','Bb4','A4','G4','A4']],
  [9,['C5','D5','C5','Bb4','A4','G4']],[12.5,['A4','G4','F4','E4','F4'],.85]],
 [[.5,['E5','C#5','D5','B4','C#5','E5']],[4.5,['C#5','E5','D5','G5','E5','F5']],
  [8.5,['A4','B4','D5','C#5','B4','C#5']],[12,['A4','G4','F4','E4'],1.25]],
 [[1,['Bb4','A4','G4','F4','G4','Bb4']],[4.5,['G4','A4','Bb4','C5','Bb4','A4']],
  [9,['D5','Eb5','D5','C5','Bb4','A4']],[12.5,['G4','Bb4','A4','Bb4','G4'],.85]],
 [[.5,['F5','Eb5','C5','Db5','C5','Ab4']],[4.5,['Db5','F5','Ab4','Bb4','C5','Db5']],
  [8.5,['Bb4','Db5','C5','F5','Eb5','Db5']],[12,['Bb4','C5','Ab4','F4'],1.25]],
 [[1,['G4','A4','G4','F4','E4','G4']],[4.5,['G4','A4','B4','C5','B4','A4']],
  [9,['E5','D5','C5','B4','A4','G4']],[12.5,['F4','E4','D4','G4'],1.25]],
 [[.5,['A4','E5','D5','B4','C#5','E5']],[4.5,['C#5','B4','A4','G4','A4','C#5']],
  [8.5,['E5','A4','B4','A4','B4','G4']],[12,['E4','F4','E4','C#4'],1.25]],
];
const emperor:readonly Sentence[]=[
 [[.5,['Ab4','Bb4','C5','Bb4','Ab4']],[3.5,['F4','Ab4','G4','Bb4']],
  [6.5,['C5','Ab4','Bb4','C5','F4']],[9.5,['G4','Ab4','G4','F4'],.65]],
 [[.5,['Ab4','F4','Gb4','Eb4','F4']],[3.5,['F4','Ab4','Gb4','F4']],
  [6.5,['Db5','Bb4','C5','Ab4','Gb4']],[9.5,['F4','Ab4','Bb4','G4'],.65]],
 [[.5,['C5','Bb4','G4','Ab4','Bb4']],[3.5,['Ab4','Bb4','Db5','C5']],
  [6.5,['Eb5','C5','Db5','Bb4','Ab4']],[9.5,['Bb4','C5','Bb4','Ab4'],.65]],
 [[.5,['E5','D5','B4','C5','B4']],[3.5,['G4','A4','B4','C5']],
  [6.5,['G4','E4','F4','D4','E4']],[9,['A4','G4','A4','C4'],1.1]],
 [[.5,['C5','Db5','C5','Bb4','Ab4']],[3.5,['Ab4','F4','G4','Ab4']],
  [6.5,['F4','Ab4','G4','Bb4','C5']],[9.5,['Bb4','Ab4','G4','F4'],.65]],
 [[.5,['Ab4','Bb4','Ab4','F4','Gb4']],[3.5,['G4','Ab4','Bb4','Ab4']],
  [6.5,['F4','Ab4','Bb4','Ab4','Db5']],[9.5,['C5','Bb4','Ab4','F4'],.65]],
 // Displayed bars 27–34 (including the intro): leave the running figure for
 // a slower answer. F supports Db over G as an altered dominant seventh;
 // the later C pedal supports the lead's final F without another close second.
 [[0,['F4'],1.85],[2,['D4'],.7],[3,['B3'],1.85],[5,['D4'],.7],
  [6,['E4'],.9],[7,['D4'],1.75],[9,['G4'],1.85],[11,['B4'],.7]],
 [[0,['G4'],1.85],[2,['E4'],.7],[3,['C4'],.9],[4,['E4'],1.7],
  [6,['G4'],1.85],[8,['D4'],.7],[9,['C4'],2.5]],
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
  const duration=j===pitches.length-1?(lastHold??.42):.42,beat=at+j*.5-within*beats;
  // Passing eighths stay lighter than their quarter-note landing.
  const accent=(Number.isInteger(beat)?1:.78)*(j===0?1:.94);
  return {instrument,pitch,beat,duration,velocity:.105,pan:.3,
   expression:singing('clear',strength*accent,duration,within===3)};
 })).filter(n=>n.beat>=0&&n.beat<beats);
}
