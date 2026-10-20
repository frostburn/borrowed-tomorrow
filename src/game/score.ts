import { octave, transpose, type Pitch } from './tuning';
import { conduitBar } from './score-conduit';
import { returnBar } from './score-four';
import { coastBar } from './score-coast';
import { scoreB } from './score-b';
import { scoreD } from './score-d';
import { scoreC } from './score-c';
export type MusicMode = 'refuge'|'breakwater'|'sanctuary'|'four-battle'|'four-warden'|'conduit' | 'coast' | 'coast-battle' | 'petra-battle' | 'station' | 'yard' | 'tunnel' | 'battle' | 'inspector' | 'ending' | 'rillbridge' | 'sluice' | 'flood' | 'cinderbank' | 'infirmary' | 'shunting' | 'northglass' | 'relayhall' | 'switching';
export type Instrument = 'reed' | 'bell' | 'keys' | 'strings' | 'bass' | 'round-bass' | 'kick' | 'snare' | 'hat';
export interface Note { instrument:Instrument; pitch:Pitch; beat:number; duration:number; velocity:number; pan:number }
interface Arrangement { beats:3|4; bpm:number; lead:Instrument; leadGain:number; keys:number; strings:number; bass:number; percussion:number }
export const ARRANGEMENTS:Record<MusicMode,Arrangement>={
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
/** Dispatch complete scores; retained home arrangements use a sixteen-bar form. */
export function scoreBar(mode:MusicMode,bar:number):Note[]{
  if(mode==='refuge'||mode==='breakwater'||mode==='sanctuary'||mode==='four-battle'||mode==='four-warden')return returnBar(mode,bar);
  if(mode==='conduit')return conduitBar(bar);
  if(mode==='coast'||mode==='coast-battle')return coastBar(bar,mode==='coast-battle');
  if(mode==='northglass'||mode==='relayhall'||mode==='switching')return scoreD(mode,bar);
  if(mode==='cinderbank'||mode==='infirmary'||mode==='shunting'||mode==='petra-battle')return scoreC(mode,bar);
  if(mode==='rillbridge'||mode==='sluice'||mode==='flood')return scoreB(mode,bar);
  const a=ARRANGEMENTS[mode],index=((bar%16)+16)%16,phrase=Math.floor(index/4),within=index%4;
  const tense=mode==='battle'||mode==='inspector',root=ROOTS[index];
  const third=root==='D3'||root==='G2'||(root==='A2'&&index===7)?'m3':'M3';
  const chord=[root,transpose(root,third),transpose(root,'P5')];
  const result:Note[]=[];
  const add=(instrument:Instrument,pitch:Pitch,beat:number,duration:number,velocity:number,pan=0)=>{if(velocity>0)result.push({instrument,pitch,beat,duration,velocity,pan});};
  for(const [beat,pitch,duration] of PHRASES[phrase])if(beat>=within*4&&beat<within*4+4){
    const resolved=index===14&&pitch==='C5'?'C#5':pitch;
    const melody=octave(resolved,(mode==='ending'&&phrase===3?1:0)-(mode==='tunnel'?1:0));
    add(a.lead,melody,beat-within*4,duration,a.leadGain*(within===3?.85:1),-.18);
    if(tense&&duration>=1.5)add('bell',octave(melody,1),beat-within*4+.5,.45,.065,.4);
  }
  // The bridge answers the main line rather than playing every note in unison.
  if(phrase===2&&within%2===1)add(mode==='tunnel'?'reed':'bell',transpose(root,'P12'),1.5,1.75,a.leadGain*.35,.5);
  chord.forEach((pitch,i)=>add('strings',octave(pitch,mode==='ending'?1:0),0,3.9,a.strings/Math.sqrt(3),i===0?-.45:.45));
  if(tense){
    for(let beat=0;beat<4;beat+=.5)add('keys',octave(chord[[0,2,1,2][Math.round(beat*2)%4]],1),beat,.28,a.keys*(beat%1?.65:1),.3);
    for(let beat=0;beat<4;beat++)add('bass',octave(transpose(root,beat===2?'P5':'P1'),-1),beat,.72,a.bass);
  }else{
    const pattern=mode==='yard'?[0,2,1,2]:[0,1,2,1];
    for(let beat=0;beat<4;beat++)if(!(within===3&&beat===3))add('keys',octave(chord[pattern[beat]],1),beat+(beat%2&&mode==='yard'?.12:0),1.25,a.keys,.35);
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
  return ['refuge','breakwater','sanctuary','four-battle','four-warden','northglass','relayhall','switching'].includes(mode)?32:16;
}
