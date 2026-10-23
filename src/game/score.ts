import { desertBar } from './score-desert';
import { claimBar } from './score-claim';
import { windmereBar } from './score-windmere';
import { dawnwatchBar,petraCrossingBar } from './score-dawnwatch';
import { anchorBar } from './score-five';
import { octave, transpose, type Pitch } from './tuning';
import { flagshipBar } from './score-flagship';
import { conduitBar } from './score-conduit';
import { returnBar } from './score-four';
import { coastBar } from './score-coast';
import { scoreB } from './score-b';
import { scoreD } from './score-d';
import { scoreC } from './score-c';
import type { NoteExpression } from './expression';
export type MusicMode = 'outermooring'|'namar'|'sunpalace'|'skywalk'|'observatory'|'desert-battle'|'sun-serpent'|'claim'|'windmere'|'dispensary'|'mirrorward'|'wind-battle'|'wind-engine'|'dawnwatch'|'watchbarracks'|'signalwall'|'observation'|'dawn-battle'|'dawn-commander'|'airfield'|'airship'|'hammerplain'|'coolingworks'|'anchorforge'|'five-battle'|'five-furnace'|'flagship'|'refuge'|'breakwater'|'sanctuary'|'four-battle'|'four-warden'|'conduit' | 'coast' | 'coast-battle' | 'petra-battle' | 'station' | 'yard' | 'tunnel' | 'battle' | 'inspector' | 'ending' | 'rillbridge' | 'sluice' | 'flood' | 'cinderbank' | 'infirmary' | 'shunting' | 'northglass' | 'relayhall' | 'switching';
export type Instrument = 'lute' | 'brass' | 'timpani' | 'cymbal' | 'reed' | 'bell' | 'keys' | 'strings' | 'bass' | 'round-bass' | 'kick' | 'snare' | 'hat';
export interface Note { instrument:Instrument; pitch:Pitch; beat:number; duration:number; velocity:number; pan:number; expression?:NoteExpression }
interface Arrangement { beats:3|4|5; meter?:readonly [number,number]; introBars?:number; bpm:number; lead:Instrument; leadGain:number; keys:number; strings:number; bass:number; percussion:number }
export const ARRANGEMENTS:Record<MusicMode,Arrangement>={
  outermooring:{beats:4,bpm:72,lead:'reed',leadGain:.12,keys:0,strings:.017,bass:.1,percussion:0},
  namar:{beats:4,bpm:96,lead:'reed',leadGain:.19,keys:0,strings:.02,bass:.12,percussion:.033},
  sunpalace:{beats:3,bpm:76,lead:'reed',leadGain:.19,keys:0,strings:.017,bass:.1,percussion:0},
  skywalk:{beats:4,bpm:104,lead:'lute',leadGain:.19,keys:0,strings:.02,bass:.12,percussion:.033},
  observatory:{beats:4,bpm:70,lead:'reed',leadGain:.12,keys:0,strings:.017,bass:.1,percussion:0},
  'desert-battle':{beats:4,bpm:136,lead:'reed',leadGain:.19,keys:0,strings:.02,bass:.16,percussion:.1},
  'sun-serpent':{beats:3,meter:[6,8],introBars:2,bpm:120,lead:'brass',leadGain:.19,keys:0,strings:.02,bass:.16,percussion:.1},
  claim:{beats:4,bpm:124,lead:'bell',leadGain:.12,keys:0,strings:.025,bass:.14,percussion:.095},
  windmere:{beats:3,bpm:76,lead:'reed',leadGain:.18,keys:.023,strings:.016,bass:.095,percussion:0},
  dispensary:{beats:3,bpm:88,lead:'keys',leadGain:.18,keys:.025,strings:0,bass:.095,percussion:0},
  mirrorward:{beats:4,bpm:66,lead:'bell',leadGain:.11,keys:.04,strings:.016,bass:.14,percussion:0},
  'wind-battle':{beats:4,bpm:128,lead:'strings',leadGain:.18,keys:.028,strings:.016,bass:.125,percussion:.1},
  'wind-engine':{beats:4,bpm:118,lead:'bell',leadGain:.13,keys:.028,strings:.016,bass:.135,percussion:.1},
  dawnwatch:{beats:4,bpm:92,lead:'strings',leadGain:.17,keys:.023,strings:.016,bass:.095,percussion:.022},
  watchbarracks:{beats:4,bpm:106,lead:'brass',leadGain:.15,keys:.023,strings:0,bass:.095,percussion:.043},
  signalwall:{beats:4,bpm:80,lead:'bell',leadGain:.1,keys:.04,strings:.017,bass:.16,percussion:0},
  observation:{beats:4,bpm:60,lead:'keys',leadGain:.15,keys:.035,strings:.012,bass:.075,percussion:0},
  'dawn-battle':{beats:4,bpm:132,lead:'strings',leadGain:.17,keys:.03,strings:.016,bass:.135,percussion:.105},
  'dawn-commander':{beats:4,bpm:124,lead:'brass',leadGain:.15,keys:.03,strings:.016,bass:.135,percussion:.105},
  airfield:{beats:4,bpm:96,lead:'reed',leadGain:.19,keys:.03,strings:0,bass:.105,percussion:0},
  airship:{beats:4,bpm:86,lead:'reed',leadGain:.19,keys:.025,strings:.016,bass:.105,percussion:0},
  hammerplain:{beats:4,bpm:102,lead:'keys',leadGain:.21,keys:.025,strings:.017,bass:.105,percussion:.033},
  coolingworks:{beats:4,bpm:102,lead:'keys',leadGain:.21,keys:.025,strings:.017,bass:.105,percussion:.033},
  anchorforge:{beats:4,bpm:84,lead:'keys',leadGain:.12,keys:.035,strings:.015,bass:.08,percussion:0},
  'five-battle':{beats:4,bpm:132,lead:'keys',leadGain:.21,keys:.032,strings:.017,bass:.145,percussion:.1},
  'five-furnace':{beats:4,bpm:120,lead:'brass',leadGain:.15,keys:.032,strings:.017,bass:.145,percussion:.1},
  flagship:{beats:5,meter:[10,8],introBars:2,bpm:132,lead:'brass',leadGain:.21,keys:.025,strings:.022,bass:.16,percussion:.1},
  refuge:{beats:4,bpm:78,lead:'reed',leadGain:.2,keys:.042,strings:.017,bass:.13,percussion:0},
  breakwater:{beats:4,bpm:104,lead:'keys',leadGain:.23,keys:.036,strings:.017,bass:.12,percussion:.042},
  sanctuary:{beats:4,bpm:66,lead:'bell',leadGain:.12,keys:.06,strings:.023,bass:.1,percussion:0},
  'four-battle':{beats:4,bpm:138,lead:'reed',leadGain:.24,keys:.05,strings:.017,bass:.17,percussion:.12},
  'four-warden':{beats:4,bpm:120,lead:'reed',leadGain:.24,keys:.05,strings:.022,bass:.17,percussion:.12},
  conduit:{beats:4,bpm:68,lead:'bell',leadGain:.11,keys:.045,strings:.018,bass:.11,percussion:0},
  'coast-battle':{beats:4,bpm:124,lead:'reed',leadGain:.23,keys:.04,strings:.016,bass:.16,percussion:.09},
  'petra-battle':{beats:4,bpm:116,lead:'strings',leadGain:.22,keys:.045,strings:.016,bass:.17,percussion:.1},
  coast:{beats:4,bpm:88,lead:'reed',leadGain:.2,keys:.038,strings:.014,bass:.14,percussion:.018},
  northglass:{beats:4,bpm:92,lead:'keys',leadGain:.23,keys:.035,strings:0,bass:.14,percussion:.035},
  relayhall:{beats:4,bpm:74,lead:'reed',leadGain:.17,keys:.045,strings:.023,bass:.11,percussion:0},
  switching:{beats:4,bpm:126,lead:'reed',leadGain:.23,keys:.047,strings:0,bass:.2,percussion:.12},
  cinderbank:{beats:4,bpm:84,lead:'reed',leadGain:.2,keys:.035,strings:.018,bass:.15,percussion:0},
  infirmary:{beats:3,bpm:78,lead:'keys',leadGain:.22,keys:.033,strings:.018,bass:.115,percussion:0},
  shunting:{beats:4,bpm:126,lead:'reed',leadGain:.23,keys:.045,strings:.016,bass:.17,percussion:.1},
  rillbridge:{beats:4,bpm:88,lead:'reed',leadGain:.27,keys:.12,strings:.045,bass:.18,percussion:.028},
  sluice:{beats:4,bpm:76,lead:'bell',leadGain:.18,keys:.065,strings:.065,bass:.18,percussion:0},
  flood:{beats:4,bpm:124,lead:'reed',leadGain:.32,keys:.11,strings:.045,bass:.25,percussion:.19},
  station:{beats:4,bpm:82,lead:'reed',leadGain:.29,keys:.14,strings:.08,bass:.2,percussion:0},
  yard:{beats:4,bpm:94,lead:'keys',leadGain:.24,keys:.13,strings:.045,bass:.23,percussion:.075},
  tunnel:{beats:4,bpm:68,lead:'bell',leadGain:.18,keys:.04,strings:.15,bass:.2,percussion:0},
  battle:{beats:4,bpm:128,lead:'reed',leadGain:.32,keys:.17,strings:.08,bass:.27,percussion:.2},
  inspector:{beats:4,bpm:136,lead:'strings',leadGain:.3,keys:.16,strings:.12,bass:.29,percussion:.22},
  ending:{beats:4,bpm:78,lead:'bell',leadGain:.25,keys:.13,strings:.14,bass:.18,percussion:0},
};
// D minor, four phrases: A, an answering A, B, and a resolving A.
// Entries are beat, spelled pitch, duration. Empty beats are intentional rests.
const PHRASES:[number,Pitch,number][][]=[
  [[0,'D5',1.5],[2,'F5',.75],[3,'E5',.75],[4,'D5',2],[7,'A4',.75],[8,'C5',1.5],[10,'D5',.75],[11,'F5',1],[12,'E5',2.5]],
  [[0,'D5',1],[1.5,'F5',.5],[2,'A5',1.5],[4,'G5',1],[5.5,'F5',.5],[6,'E5',1],[8,'D5',1.5],[10,'C5',1],[12,'A4',2.5],[15,'C5',.5]],
  [[0,'F5',2],[3,'G5',.75],[4,'A5',1.5],[6,'C6',1],[8,'Bb5',1.5],[10,'A5',.75],[11,'G5',.75],[12,'F5',2],[15,'E5',.75]],
  [[0,'D5',1.5],[2,'F5',.75],[3,'E5',.75],[4,'D5',2],[7,'C5',.75],[8,'A4',1.5],[10,'C5',.75],[11,'E5',.75],[12,'D5',3]],
];
const ROOTS:Pitch[]=['D3','Bb2','F3','C3','D3','Bb2','G2','A2','F3','C3','Bb2','A2','D3','Bb2','A2','D3'];
// Orrin works; Nell answers. His G-minor hammer cell is transposed into the
// workshop's D minor, then traded for the festival sentence, four bars at a time.
const WORKSHOP:[number,Pitch,number][][]=[
  [[0,'A4',.35],[.5,'A4',.35],[1.5,'Bb4',.35],[2,'A4',.65],[3,'E4',.65],
   [4,'F4',1.25],[6,'D4',.75],[7,'A4',.6],
   [8,'C5',.35],[8.5,'C5',.35],[9.5,'C5',.35],[10,'C5',.65],[11,'G4',.65],
   [12,'E5',.75],[13,'D5',.75],[14,'Bb4',1]],
  PHRASES[0],
  [[0,'C5',.35],[.5,'C5',.35],[1.5,'C5',.35],[2,'C5',.65],[3,'G4',.65],
   [4,'G4',.35],[4.5,'G4',.35],[5.5,'G4',.35],[6,'G4',.65],[7,'D4',.65],
   [8,'F4',1],[9.5,'A4',.5],[10.5,'F4',1],
   [12,'E4',.75],[13,'G4',.5],[14,'C#5',1]],
  PHRASES[3],
];
// The original sixteen bars precede these two new sentences. The flagship's
// contour enters only in the extension, recast in plain 4/4.
const ALBAN:[number,Pitch,number][][]=[[
  [0,'D5',.65],[1,'A4',.65],[2,'D5',.65],[3,'F5',.75],
  [4,'F5',.75],[5,'D5',.5],[6,'Bb4',.65],[7,'C5',.35],[7.5,'D5',.35],
  [8,'D5',.5],[8.5,'G5',.35],[9,'F5',.75],[10,'D5',1],[11.5,'Bb4',.35],
  [12,'C#5',.75],[13,'E5',.5],[14,'G5',.75],[15,'E5',.65],
],[
  [0,'D5',.65],[1,'A4',.65],[2,'F5',.65],[3,'A5',.75],
  [4,'G5',.75],[5,'F5',.5],[6,'D5',.75],[7,'Bb4',.65],
  [8,'E5',.75],[9,'C#5',.75],[10,'A4',1],[11.5,'C#5',.35],
  [12,'D5',2],[14.5,'A4',.5],[15.25,'D5',.5],
]];
const ALBAN_ROOTS:Pitch[]=['D3','Bb2','G2','A2','F3','Bb2','A2','D3'];
/** Dispatch complete scores; Alban adds eight bars to the retained home form. */
export function scoreBar(mode:MusicMode,bar:number):Note[]{
  if(mode==='outermooring'||mode==='namar'||mode==='sunpalace'||mode==='skywalk'||mode==='observatory'||mode==='desert-battle'||mode==='sun-serpent')return desertBar(mode,scorePosition(mode,bar));
  if(mode==='claim')return claimBar(bar);
  if(mode==='windmere'||mode==='dispensary'||mode==='mirrorward'||mode==='wind-battle'||mode==='wind-engine')return windmereBar(mode,bar);
  if(mode==='dawnwatch'||mode==='watchbarracks'||mode==='signalwall'||mode==='dawn-battle'||mode==='dawn-commander')return dawnwatchBar(mode,bar);
  if(mode==='observation')return anchorBar(mode,bar);
  if(mode==='petra-battle')return petraCrossingBar(bar);
  if(mode==='airfield'||mode==='airship'||mode==='hammerplain'||mode==='coolingworks'||mode==='anchorforge'||mode==='five-battle'||mode==='five-furnace')return anchorBar(mode,bar);
  if(mode==='flagship')return flagshipBar(scorePosition(mode,bar));
  if(mode==='refuge'||mode==='breakwater'||mode==='sanctuary'||mode==='four-battle'||mode==='four-warden')return returnBar(mode,bar);
  if(mode==='conduit')return conduitBar(bar);
  if(mode==='coast'||mode==='coast-battle')return coastBar(bar,mode==='coast-battle');
  if(mode==='northglass'||mode==='relayhall'||mode==='switching')return scoreD(mode,bar);
  if(mode==='cinderbank'||mode==='infirmary'||mode==='shunting')return scoreC(mode,bar);
  if(mode==='rillbridge'||mode==='sluice'||mode==='flood')return scoreB(mode,bar);
  const a=ARRANGEMENTS[mode],length=scoreLength(mode),index=((bar%length)+length)%length,phrase=Math.floor(index/4),within=index%4;
  const tense=mode==='battle'||mode==='inspector',root=index>=16?ALBAN_ROOTS[index-16]:ROOTS[index];
  const third=root==='D3'||root==='G2'||(root==='A2'&&index===7)?'m3':'M3';
  const chord=[root,transpose(root,third),transpose(root,'P5')];
  const result:Note[]=[];
  const add=(instrument:Instrument,pitch:Pitch,beat:number,duration:number,velocity:number,pan=0)=>{if(velocity>0)result.push({instrument,pitch,beat,duration,velocity,pan});};
  const sentence=mode==='yard'?WORKSHOP[phrase]:index>=16?ALBAN[phrase-4]:PHRASES[phrase];
  for(const [beat,pitch,duration] of sentence)if(beat>=within*4&&beat<within*4+4){
    const resolved=index===14&&pitch==='C5'?'C#5':pitch;
    const melody=octave(resolved,(mode==='ending'&&phrase===3?1:0)-(mode==='tunnel'?1:0));
    add(a.lead,melody,beat-within*4,duration,a.leadGain*(within===3?.85:1),-.18);
    if(tense&&duration>=1.5)add('bell',octave(melody,1),beat-within*4+.5,.45,.065,.4);
  }
  // The bridge answers the main line rather than playing every note in unison.
  if(phrase===2&&within%2===1&&mode!=='yard')add(mode==='tunnel'?'reed':'bell',transpose(root,'P12'),1.5,1.75,a.leadGain*.35,.5);
  chord.forEach((pitch,i)=>add('strings',octave(pitch,mode==='ending'?1:0),0,3.9,a.strings/Math.sqrt(3),i===0?-.45:.45));
  if(tense){
    for(let beat=0;beat<4;beat+=.5)add('keys',octave(chord[[0,2,1,2][Math.round(beat*2)%4]],1),beat,.28,a.keys*(beat%1?.65:1),.3);
    for(let beat=0;beat<4;beat++)add('bass',octave(transpose(root,beat===2?'P5':'P1'),-1),beat,.72,a.bass);
  }else{
    const pattern=mode==='yard'?[0,2,1,2]:[0,1,2,1];
    for(let beat=0;beat<4;beat++)if(!(within===3&&beat===3))add('keys',octave(chord[pattern[beat]],1),beat+(beat%2&&mode==='yard'?.12:0),mode==='yard'?.7:1.25,a.keys*(mode==='yard'?.55:1),.35);
    add('bass',octave(root,-1),0,2.8,a.bass,-.12);if(mode!=='tunnel')add('bass',transpose(root,'-P4'),3,.8,a.bass*.65,-.12);
    if(mode==='station'&&within===3)add('bell',octave(root,2),2.5,1.5,.08,.55);
  }
  if(a.percussion){
    add('kick','C2',0,.2,a.percussion);add('kick','C2',2,.2,a.percussion*.85);
    for(const beat of [1,3])add('snare','D2',beat,.18,a.percussion*.6,-.1);
    for(let beat=.5;beat<4;beat+=tense?.5:1)add('hat','F#2',beat,.08,a.percussion*(beat%1?.2:.32),.45);
    if(tense&&within===3)for(const beat of [3.25,3.5,3.75])add('snare','D2',beat,.12,a.percussion*.3,-.1);
  }
  return result;
}

export function scoreLength(mode:MusicMode):number {
  if(mode==='flagship'||mode==='sun-serpent')return 34;
  if(mode==='inspector')return 24;
  return ['outermooring','namar','sunpalace','skywalk','observatory','desert-battle','sun-serpent','windmere','dispensary','mirrorward','wind-battle','wind-engine','dawnwatch','watchbarracks','signalwall','observation','dawn-battle','dawn-commander','airfield','airship','hammerplain','coolingworks','anchorforge','five-battle','five-furnace','refuge','breakwater','sanctuary','four-battle','four-warden','northglass','relayhall','switching'].includes(mode)?32:16;
}

/** Absolute playback bars wrap after the one-shot intro, never back into it. */
export function scorePosition(mode:MusicMode,bar:number):number {
  const intro=ARRANGEMENTS[mode].introBars??0,length=scoreLength(mode)-intro;
  return bar>=0&&bar<intro?bar:intro+((bar-intro)%length+length)%length;
}
export function scoreMeter(mode:MusicMode):string {
  const a=ARRANGEMENTS[mode];return a.meter?a.meter.join('/'):`${a.beats}/4`;
}
