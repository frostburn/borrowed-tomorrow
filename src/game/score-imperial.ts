import type {MusicMode,Note,Instrument} from './score';
import type {Pitch} from './tuning';
import {singing} from './expression';
type Sentence=readonly (readonly [beat:number,pitch:Pitch,hold:number])[];
// Independent upper voices: descending sequences, neighbour notes and delayed
// resolutions. Positions span four bars, with silence between each sentence.
// These are composed against the actual changes, not transposed chord patterns.
const order:readonly Sentence[]=[
 [[1,'F6',.75],[2,'E6',.5],[3,'D6',.5],[4,'D6',1],[5,'C6',.5],[6,'Bb5',1],[9,'A5',1],[10,'G5',.5],[11,'F5',.5],[12,'G5',1],[13,'F5',.5],[14,'E5',1]],
 [[1,'Bb5',1],[2,'A5',.5],[3,'G5',.5],[4,'F5',1],[5,'G5',.5],[6,'A5',1],[9,'G5',1],[10,'F5',.5],[11,'E5',.5],[12,'E5',1.5],[14,'C6',.75]],
 [[1,'F6',.75],[2,'E6',.5],[3,'D6',.5],[4,'F6',1],[5,'E6',.5],[6,'D6',1],[9,'C6',1],[10,'Bb5',.5],[11,'A5',.5],[12,'G5',1.5],[14,'E6',.75]],
 [[1,'D6',1],[2,'C6',.5],[3,'Bb5',.5],[4,'Bb5',1],[5,'A5',.5],[6,'F5',1],[9,'E6',1],[10,'D6',.5],[11,'C6',.5],[12,'A5',2]],
 [[1,'C6',1],[2.5,'Bb5',.5],[3,'Ab5',.5],[4,'Ab5',1.5],[6,'F5',1],[9,'C6',1],[10.5,'Bb5',.5],[11,'Ab5',.5],[12,'Bb5',1.5],[14,'G5',1]],
 [[1,'Ab5',1],[2.5,'Gb5',.5],[3,'F5',.5],[4,'G5',1.5],[6,'Eb5',1],[9,'B5',1],[10,'A5',.5],[11,'G#5',.5],[12,'B5',1],[13,'A5',.5],[14,'G#5',1]],
 [[1,'F6',.75],[2,'E6',.5],[3,'D6',.5],[4,'F6',1],[5,'E6',.5],[6,'D6',1],[9,'C6',1],[10,'Bb5',.5],[11,'A5',.5],[12,'G5',1.5],[14,'E6',.75]],
 [[1,'D6',1],[2,'C6',.5],[3,'Bb5',.5],[4,'Bb5',1],[5,'A5',.5],[6,'F5',1],[9,'B5',1],[10,'A5',.5],[11,'G#5',.5],[12,'E6',1.5],[14,'C6',.75]],
];
const capital:readonly Sentence[]=[
 [[1,'F6',1.5],[3,'E6',.5],[4,'D6',2],[7,'C6',.5],[8,'A5',1.5],[10,'G5',1],[12,'F5',2]],
 [[1,'F6',1],[2.5,'E6',.5],[3,'D6',.5],[4,'D6',1.5],[6,'C6',1],[8,'Bb5',2],[11,'A5',.5],[12,'G5',2]],
 [[1,'A5',1.5],[3,'G5',.5],[4,'F5',2],[7,'E5',.5],[8,'C6',1.5],[10,'Bb5',1],[12,'A5',2]],
 [[1,'E6',1.5],[3,'D6',.5],[4,'C#6',2],[7,'B5',.5],[8,'A5',1],[9.5,'G5',.5],[10,'F5',1],[12,'E5',2]],
 [[1,'Bb5',1.5],[3,'A5',.5],[4,'G5',2],[7,'F5',.5],[8,'E5',1],[10,'D5',1],[12,'Bb5',2]],
 [[1,'F6',1.5],[3,'Eb6',.5],[4,'Db6',2],[7,'C6',.5],[8,'Bb5',1],[10,'Ab5',1],[12,'F5',2]],
 [[1,'B5',1],[2.5,'A5',.5],[3,'G5',.5],[4,'G5',1.5],[6,'F5',1],[8,'E5',1.5],[10,'D5',1],[12,'B5',2]],
 [[1,'E6',1.5],[3,'D6',.5],[4,'C#6',2],[7,'B5',.5],[8,'A5',1],[9.5,'G5',.5],[10,'F5',1],[12,'E5',2]],
];
const emperor:readonly Sentence[]=[
 [[1,'Ab5',1],[2,'G5',.5],[3,'F5',1.5],[5,'E5',.5],[6,'C6',1],[7.5,'Bb5',.5],[8,'Ab5',.75],[9,'G5',1],[10,'F5',1]],
 [[1,'Ab5',1],[2,'Gb5',.5],[3,'F5',1.5],[5,'Eb5',.5],[6,'Db6',1],[7.5,'C6',.5],[8,'Bb5',.75],[9,'Ab5',2]],
 [[1,'C6',1],[2,'Bb5',.5],[3,'Ab5',1.5],[5,'G5',.5],[6,'Eb6',1],[7.5,'Db6',.5],[8,'C6',.75],[9,'Bb5',2]],
 [[1,'E6',1],[2,'D6',.5],[3,'C6',1.5],[5,'B5',.5],[6,'G5',1],[7.5,'F5',.5],[8,'E5',.75],[9,'D5',1],[10,'C5',1]],
 [[1,'C6',1],[2,'Bb5',.5],[3,'Ab5',1.5],[5,'G5',.5],[6,'F5',1],[7.5,'G5',.5],[8,'Ab5',.75],[9,'C6',2]],
 [[1,'Ab5',1],[2,'Gb5',.5],[3,'F5',1.5],[5,'Eb5',.5],[6,'F5',1],[7.5,'Ab5',.5],[8,'Bb5',.75],[9,'Ab5',2]],
 [[1,'D6',1],[2,'C6',.5],[3,'B5',1.5],[5,'A5',.5],[6,'G5',1],[7.5,'A5',.5],[8,'B5',.75],[9,'D6',2]],
 [[1,'G5',1],[2,'F5',.5],[3,'E5',1.5],[5,'D5',.5],[6,'C6',1],[7.5,'B5',.5],[8,'A5',.75],[9,'G5',1],[10,'E5',1]],
];
export function imperialCounterline(mode:MusicMode,bar:number):Note[]{
 let form:readonly Sentence[],beats:number,intro=0,instrument:Instrument='strings',gain=.105;
 switch(mode){
  case 'four-warden':form=order;beats=4;break;
  case 'capital-battle':form=capital;beats=4;break;
  case 'emperor':form=emperor;beats=3;intro=2;break;
  default:return [];
 }
 if(bar<intro)return [];
 const i=bar-intro,phrase=Math.floor(i/4)%form.length,within=i%4;
 // Reeds carry the upper voice when the Emperor melody turns to strings.
 if(mode==='emperor'&&i>=16&&i<24)instrument='reed';
 const strength=within===3?.75:within===0?.88:1;
 return form[phrase].filter(([at])=>at>=within*beats&&at<(within+1)*beats).map(([at,pitch,duration])=>({
  instrument,pitch,beat:at-within*beats,duration,velocity:gain,pan:.3,
  expression:singing('clear',strength,duration,within===3),
 }));
}
