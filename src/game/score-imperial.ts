import type {MusicMode,Note,Instrument} from './score';
import type {Pitch} from './tuning';
import {singing} from './expression';
type Figure=readonly [beat:number,pitches:readonly Pitch[],lastHold?:number];
type Sentence=readonly Figure[];
// Four-bar sentences in a lower register. Short eighth-note runs move against
// the broad lead, with a breath between figures and a longer cadence note.
// Each line follows its actual harmony rather than transposing an arpeggio.
// Opening runs trade with slower answers; later sentences follow the lead's
// actual entrances, including its borrowed minor colours and final descent.
const capital:readonly Sentence[]=[
 [[1,['F5','E5','D5','C5','D5','E5']],[4,['A4'],1.5],[6,['C5'],.7],[7,['G4'],.7],
  [8,['C5'],.8],[10,['F4'],1.6],[12,['F4'],1.7],[14,['F4'],.8]],
 [[.5,['F5','D5','E5','C5','D5','F5']],[4,['Bb4'],1.7],[6,['D5'],1.5],
  [8,['D5'],1.75],[10,['C5'],.75],[11,['G4'],.75],[12,['Bb4'],.75],[13,['F4'],1.5],[15,['D4'],.7]],
 [[0,['A4'],1.5],[2,['G4'],.7],[3,['F4'],.7],[4,['C5'],.75],[5,['F4'],1.5],[7,['G4'],.7],
  [8,['C4'],2.5],[10.5,['A4'],1],[12,['A4'],1.5],[14,['C5'],.8]],
 [[0,['C#4'],1.5],[2,['G4'],.75],[4,['B3'],1.5],[6,['A3'],1.7],
  [8,['C#4'],2.6],[12,['E4'],.7],[13,['C#4'],1.6]],
 [[0,['Bb4'],2.2],[2.5,['C5'],.4],[4,['G4'],.8],[5,['F4'],.7],[6,['C5'],1.1],
  [8,['D5'],.75],[9,['G4'],1.7],[12,['Bb3'],2.7],[15,['D4'],.7]],
 [[0,['Db5'],1.5],[2,['Bb4'],.7],[3,['G4'],.7],[4,['F4'],2.7],
  [8,['F4'],1.5],[10,['Db5'],.7],[12,['Bb3'],.8],[14,['Ab4'],.8],[15,['F4'],.7]],
 [[0,['G4'],2.4],[4,['B3'],1.5],[6,['E4'],1.6],
  [8,['C5'],.8],[10,['G4'],1.6],[12,['G4'],2.7]],
 [[0,['E4'],1.5],[2.5,['E4'],1.1],[4,['B3'],2.7],
  [8,['A3'],2.7],[12,['C#4'],2.4]],
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
