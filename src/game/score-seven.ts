import {finalLeadHold,finalChromaticNotes} from './score-final-runs';
import type {Note,Instrument} from './score';
import {octave,type Pitch} from './tuning';
import {phrasing,singing} from './expression';
export type SevenMode='hollowsill'|'takenwater'|'firstfield'|'quietward'|'seasonstreet'|'lastrefuge'|'sunthrone'|'homecoming'|'seaholiday'|'domain-battle'|'harvest-battle'|'hospice-battle'|'seasons-battle'|'benefactor'|'hollow-sun'|'unborrowed';
export const SEVEN_MODES:readonly SevenMode[]=['hollowsill','takenwater','firstfield','quietward','seasonstreet','lastrefuge','sunthrone','homecoming','seaholiday','domain-battle','harvest-battle','hospice-battle','seasons-battle','benefactor','hollow-sun','unborrowed'];
// The two approved octatonics, exactly on the existing 31-tone pitch grid.
const radiant:Pitch[]=['C4','D4','E4','Ft4','G4','Ad4','A#4','B4'];
const reflected:Pitch[]=['C4','Db4','Dt4','Ed4','F4','Gd4','Ab4','A#t4'];
const home:Pitch[]=['D4','E4','F4','G4','A4','Bb4','C5','D5'];
interface Form {lead:Instrument;inverted?:boolean;human?:boolean;beats:3|4|5;rhythm:number[];roots:number[];lines:number[][];gain:number;battle?:boolean;intro?:boolean}
// Each row is a four-bar sentence. Eight authored sentences make a complete form.
// Negative degrees carry the line beneath its opening register; no MIDI rounding.
const sea=[
 [6,4,3,0,1,3,2,-1],[5,3,1,2,0,-2,1,0],[4,6,7,4,3,1,2,-1],[3,2,0,-1,-3,0,1,3],
 [7,6,4,2,5,4,1,0],[8,6,3,4,2,0,-2,1],[5,7,4,1,3,2,0,-1],[3,1,0,-2,1,0,-1,0],
];
const platform=[
 [3,3,0,1,-1,2,1,-2],[4,2,2,0,3,1,-1,0],[6,3,1,2,-1,0,2,1],[5,2,0,-2,1,3,1,0],
 [7,4,2,3,0,1,4,2],[6,6,3,1,2,0,-1,1],[4,1,3,2,0,-2,1,0],[2,1,-1,0,-3,-1,1,0],
];
const harvest=[
 [0,4,2,1,3,2,0,-1],[2,5,4,1,2,0,1,3],[4,2,6,5,3,1,2,0],[3,0,2,-1,1,4,2,1],
 [5,7,4,2,6,3,1,0],[6,4,3,7,5,2,4,1],[4,1,3,0,2,-1,1,2],[3,2,0,1,-1,2,1,0],
];
const ward=[
 [5,4,2,1,0,2,1,-1],[6,3,2,0,1,-1,0,2],[7,5,3,1,4,2,0,-2],[4,2,1,-1,2,0,-1,1],
 [8,6,4,5,3,1,2,0],[7,4,6,3,2,0,1,-1],[5,3,1,2,0,-2,0,1],[3,1,2,0,-1,1,-2,0],
];
const seasons=[
 [0,1,5,4,2,3,1,-1],[3,4,0,2,1,-2,0,3],[5,2,6,4,1,3,0,2],[4,1,3,-1,2,0,-2,1],
 [7,4,5,2,6,3,4,1],[6,2,4,7,3,5,1,0],[5,1,2,4,0,3,-1,1],[3,0,1,-2,2,1,-1,0],
];
const refuge=[
 [4,2,1,0,3,2,4,1],[5,3,2,0,1,4,2,3],[6,4,3,1,5,2,0,1],[4,1,2,0,-1,3,1,0],
 [7,5,4,2,6,3,4,1],[6,3,5,2,4,1,0,2],[5,2,3,1,4,0,1,-1],[3,1,2,0,-1,1,0,0],
];
const god=[
 [2,1,-1,-1,3,2,0,-2],[4,2,1,-1,0,3,1,-2],[6,4,2,1,5,3,0,1],[5,2,0,-1,3,1,-2,0],
 [7,6,3,4,2,5,1,0],[8,5,7,4,6,3,2,0],[6,3,5,2,4,1,-1,1],[4,1,3,0,2,-1,1,0],
];
const sun=[
 [6,2,5,1,4,0,3,-1],[7,3,6,2,5,1,4,0],[4,0,3,-1,2,-2,1,0],[5,2,4,1,3,0,2,-1],
 [8,5,7,4,6,3,5,2],[7,4,6,3,5,2,4,1],[6,3,5,2,4,1,3,0],[5,2,4,1,3,0,1,-1],
];
const heart=[
 [4,4,1,2,0,3,1,0],[6,4,3,1,5,2,0,2],[7,5,4,2,6,3,1,0],[5,2,3,1,4,0,2,1],
 [8,7,5,6,4,2,3,1],[9,6,8,5,7,4,3,1],[7,4,6,3,5,2,4,1],[5,3,4,2,1,3,1,0],
];
const forms:Record<SevenMode,Form>={
 hollowsill:{lead:'organ',beats:4,rhythm:[0,2.5,4,6,8,10,12,14],roots:[0,5,3,6,0,4,2,0],lines:sea,gain:.13},
 takenwater:{lead:'bell',inverted:true,beats:4,rhythm:[.5,2,4.5,6,8.5,10,12,14],roots:[0,3,6,1,4,2,5,0],lines:platform,gain:.12},
 firstfield:{lead:'lute',beats:3,rhythm:[0,1,3,5,7,9,12,14],roots:[0,4,1,5,3,6,2,0],lines:harvest,gain:.17},
 quietward:{lead:'sine',inverted:true,beats:3,rhythm:[0,2,4,6,9,11,13,15],roots:[0,4,2,6,3,1,5,0],lines:ward,gain:.16},
 seasonstreet:{lead:'wood',inverted:true,beats:4,rhythm:[0,1.5,3,5,8,9.5,12,14],roots:[0,2,5,1,6,3,4,0],lines:seasons,gain:.17},
 lastrefuge:{lead:'keys',human:true,beats:4,rhythm:[0,2,4,7,8,10.5,12,14],roots:[0,5,3,6,4,1,5,0],lines:refuge,gain:.15},
 sunthrone:{lead:'organ',beats:4,rhythm:[0,3,4,6,8,11,12,14],roots:[0,6,3,5,1,4,2,0],lines:god,gain:.14},
 homecoming:{lead:'reed',human:true,beats:4,rhythm:[0,1,3,4,8,9,11,14],roots:[0,5,3,6,4,1,5,0],lines:refuge,gain:.18},
 seaholiday:{lead:'lute',human:true,beats:3,rhythm:[0,2,3,5,8,10,12,14],roots:[0,3,5,0,6,4,1,0],lines:harvest,gain:.17},
 'domain-battle':{lead:'brass',inverted:true,beats:4,rhythm:[0,1,2.5,4,7,9,12,14],roots:[0,3,5,1,6,2,4,0],lines:platform,gain:.21,battle:true},
 'harvest-battle':{lead:'brass',beats:4,rhythm:[0,1.5,3,4,6.5,9,11,14],roots:[0,4,1,5,3,6,2,0],lines:harvest,gain:.21,battle:true},
 'hospice-battle':{lead:'organ',inverted:true,beats:3,rhythm:[0,2,3,5,7,10,12,14],roots:[0,4,2,6,3,1,5,0],lines:ward,gain:.18,battle:true},
 'seasons-battle':{lead:'tritaver',inverted:true,beats:5,rhythm:[0,2,3,5,8,11,14,17],roots:[0,2,5,1,6,3,4,0],lines:seasons,gain:.19,battle:true},
 benefactor:{lead:'organ',beats:4,rhythm:[0,1,3,6,8,10,12,14],roots:[0,6,3,5,1,4,2,0],lines:god,gain:.19,battle:true,intro:true},
 'hollow-sun':{lead:'brass',inverted:true,beats:5,rhythm:[0,1.5,3,5,8,10,13.5,17],roots:[0,3,6,2,5,1,4,0],lines:sun,gain:.21,battle:true,intro:true},
 unborrowed:{lead:'strings',beats:4,rhythm:[0,1,3,4.5,8,9,11,14],roots:[0,4,2,5,3,6,1,0],lines:heart,gain:.19,battle:true,intro:true},
};
export function sevenBar(mode:SevenMode,bar:number):Note[]{
 const a=forms[mode],beats=a.beats,notes:Note[]=[],scale=a.human?home:a.inverted?reflected:radiant;
 const pitch=(degree:number,register=0)=>octave(scale[(degree%8+8)%8],Math.floor(degree/8)+register);
 const add=(instrument:Instrument,p:Pitch,beat:number,duration:number,velocity:number,pan=0)=>{const n:Note={instrument,pitch:p,beat,duration,velocity,pan};notes.push(n);return n;};
 if(a.intro&&bar<2){
  const register=bar===0?-1:0;
  for(const [j,d]of [0,4,6].entries())add('organ',pitch(d,register),j*.5,beats-j*.5,.11,j%2?.3:-.3).expression={release:.8,...phrasing(.8+bar*.3,true)};
  add('timpani',pitch(0,-2),0,1.4,.16);
  if(bar===1){
   add('brass',pitch(2),beats-1,.75,.19);add('cymbal','C3',0,2,.04);
   for(const [j,at]of [beats-1,beats-.75,beats-.5,beats-.25].entries())add('snare','D2',at,.08,.04+j*.018,.12);
  }
  return notes;
 }
 const i=((bar-(a.intro?2:0))%32+32)%32,phrase=Math.floor(i/4),within=i%4,root=a.roots[phrase];
 const strength=[.78,.88,.94,.82,1.04,1.12,.98,.78][phrase]*(within===3?.89:1),t=beats===5?a.rhythm:a.rhythm.map(n=>n*beats/4),melody=a.lines[phrase];
 for(let j=0;j<melody.length;j++){
  const at=t[j],local=at-within*beats;if(local<0||local>=beats)continue;
  const next=t[j+1]??beats*4,hold=finalLeadHold(mode,i,local,Math.max(.22,(next-at)*(a.battle?.7:.94)));
  if(hold<=0)continue;
  const n=add(a.lead,pitch(melody[j]),local,hold,a.gain*strength,j%2?-.12:.12);
  n.expression=a.lead==='bell'?{...phrasing(strength),release:1.6}:a.lead==='wood'||a.lead==='lute'||a.lead==='keys'?phrasing(strength):singing(a.human?'warm':'clear',strength,hold,within===3);
 }
 if(a.battle){
  const boss=mode!=='domain-battle',heart=mode==='unborrowed',hollow=mode==='hollow-sun',god=mode==='benefactor',seasons=mode==='seasons-battle';
  // Distinct engines: the harvest's straight drive, the hospice's three-beat
  // tread, the city's broken five, then march / ten eighths / exposed sprint.
  const bassBeats=!boss?within===2?[0,1,2.5,3]:[0,1.5,2,3]:
   hollow?[0,.5,1,1.5,2,2.5,3,3.5,4,4.5]:seasons?[0,.5,1.5,2,3,3.5,4.5]:
   beats===3?[0,.5,1,1.5,2,2.5]:god?[0,.5,1,2,2.5,3]:
   heart&&i>=16&&i<20?[0,1,2,3]:[0,.5,1,1.5,2,2.5,3,3.5];
  for(const [j,at]of bassBeats.entries())add(boss?'square-bass':'bass',pitch(root+(boss?(j%4===3?4:0):j===2?4:j===3?7:0),-2),at,boss?.3:j===0?.8:.45,(boss?(at%1?.1:.16):.13)*strength,-.1);
  const kicks=!boss?[0]:hollow?[0,1,2.5,4]:seasons?[0,1.5,3]:beats===3?[0,1.5]:
   heart&&!(i>=16&&i<20)?[0,.5,1.5,2,2.5,3.5]:[0,1.5,2,2.5];
  for(const at of kicks)add('kick','C2',at,.16,boss?.155:.1);
  const snares=beats===3?[1,2]:hollow?[1.5,3.5]:seasons?[1,2.5,4]:[1,3];
  for(const at of snares)add('snare','D2',at,.14,boss?.11:.07,.12);
  for(let at=.5;at<beats;at+=boss?.5:1)add('hat','F#2',at,boss?.075:.09,boss?(at%1?.027:.017):.022,.45);
  if(god&&within%2===0)for(const at of [0,2])for(const d of [root,root+4])add('brass',pitch(d,-1),at,.35,.045*strength,-.25);
  if(boss&&within===0)add('timpani',pitch(root,-2),0,.9,.13,-.3);
  if(boss&&within===3)for(const [j,at]of [beats-.75,beats-.5,beats-.25].entries())add('snare','D2',at,.08,.04+j*.012,.12);
  if(within===3){add('timpani',pitch(root,-2),beats-1,.55,.1,-.3);add('timpani',pitch(root+4,-2),beats-.5,.45,.08,.3);}
  if(i%8===0)add('cymbal','C3',0,2,boss?.05:.035,.3);
 }else if(within%2===0)add('round-bass',pitch(root,-2),0,beats*2-.15,.1*strength,-.1).expression=singing('warm',strength,beats*2-.15);
 if(within===0)for(const [j,d]of [root,root+3,root+4].entries())add(a.human?'strings':'organ',pitch(d,-1),0,beats*4-.2,.022*strength,j%2?.4:-.4).expression=singing('warm',strength,beats*4-.2);
 // Answers occupy actual gaps, with held releases rather than a new chord at each bar.
 if(within===1||within===3){const at=beats-1;add('bell',pitch(root+4),at,2.4,a.battle?.038:.046,.35).expression={release:1.6,...phrasing(strength)};}
 if(mode==='firstfield'||mode==='seasonstreet')for(const at of [0,1.5])if(at<beats)add('wood',pitch(root,-1),at,.18,.045,-.3);
 if(mode==='unborrowed'&&(within===1||within===3))add('brass',pitch(melody[7],-1),0,beats-.2,.09,.3).expression=singing('clear',strength,beats-.2);
 notes.push(...finalChromaticNotes(mode,i,a.gain,strength));
 return notes;
}
