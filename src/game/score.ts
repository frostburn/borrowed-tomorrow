import { scoreB } from './score-b';
import { scoreC } from './score-c';
export type MusicMode = 'station' | 'yard' | 'tunnel' | 'battle' | 'inspector' | 'ending' | 'rillbridge' | 'sluice' | 'flood' | 'cinderbank' | 'infirmary' | 'shunting';
export type Instrument = 'reed' | 'bell' | 'keys' | 'strings' | 'bass' | 'kick' | 'snare' | 'hat';
export interface Note { instrument:Instrument; midi:number; beat:number; duration:number; velocity:number; pan:number }
interface Arrangement { bpm:number; lead:Instrument; leadGain:number; keys:number; strings:number; bass:number; percussion:number }
export const ARRANGEMENTS:Record<MusicMode,Arrangement>={
  cinderbank:{bpm:84,lead:'reed',leadGain:.2,keys:.035,strings:.018,bass:.15,percussion:0},
  infirmary:{bpm:66,lead:'keys',leadGain:.22,keys:.04,strings:.022,bass:.115,percussion:0},
  shunting:{bpm:118,lead:'reed',leadGain:.24,keys:.065,strings:0,bass:.22,percussion:.16},
  rillbridge:{bpm:88,lead:'reed',leadGain:.27,keys:.12,strings:.045,bass:.18,percussion:.028},
  sluice:{bpm:76,lead:'bell',leadGain:.18,keys:.065,strings:.065,bass:.18,percussion:0},
  flood:{bpm:124,lead:'reed',leadGain:.32,keys:.11,strings:.045,bass:.25,percussion:.19},
  station:{bpm:82,lead:'reed',leadGain:.29,keys:.14,strings:.08,bass:.2,percussion:0},
  yard:{bpm:94,lead:'keys',leadGain:.24,keys:.13,strings:.045,bass:.23,percussion:.075},
  tunnel:{bpm:68,lead:'bell',leadGain:.18,keys:.04,strings:.15,bass:.2,percussion:0},
  battle:{bpm:128,lead:'reed',leadGain:.32,keys:.17,strings:.08,bass:.27,percussion:.2},
  inspector:{bpm:136,lead:'strings',leadGain:.3,keys:.16,strings:.12,bass:.29,percussion:.22},
  ending:{bpm:78,lead:'bell',leadGain:.25,keys:.13,strings:.14,bass:.18,percussion:0},
};
// D minor, four phrases: A, an answering A, B, and a resolving A.
// Entries are beat, MIDI pitch, duration. Empty beats are intentional rests.
const PHRASES:[number,number,number][][]=[
  [[0,74,1.5],[2,77,.75],[3,76,.75],[4,74,2],[7,69,.75],[8,72,1.5],[10,74,.75],[11,77,1],[12,76,2.5]],
  [[0,74,1],[1.5,77,.5],[2,81,1.5],[4,79,1],[5.5,77,.5],[6,76,1],[8,74,1.5],[10,72,1],[12,69,2.5],[15,72,.5]],
  [[0,77,2],[3,79,.75],[4,81,1.5],[6,84,1],[8,82,1.5],[10,81,.75],[11,79,.75],[12,77,2],[15,76,.75]],
  [[0,74,1.5],[2,77,.75],[3,76,.75],[4,74,2],[7,72,.75],[8,69,1.5],[10,72,.75],[11,76,.75],[12,74,3]],
];
const ROOTS=[50,46,53,48,50,46,43,45,53,48,46,45,50,46,45,50];
/** A complete sixteen-bar score. Every location keeps the motif but changes its arrangement. */
export function scoreBar(mode:MusicMode,bar:number):Note[]{
  if(mode==='cinderbank'||mode==='infirmary'||mode==='shunting')return scoreC(mode,bar);
  if(mode==='rillbridge'||mode==='sluice'||mode==='flood')return scoreB(mode,bar);
  const a=ARRANGEMENTS[mode],index=((bar%16)+16)%16,phrase=Math.floor(index/4),within=index%4;
  const tense=mode==='battle'||mode==='inspector',root=ROOTS[index];
  const third=root===50||root===43||(root===45&&index===7)?3:4;
  const chord=[root,root+third,root+7];
  const result:Note[]=[];
  const add=(instrument:Instrument,midi:number,beat:number,duration:number,velocity:number,pan=0)=>{if(velocity>0)result.push({instrument,midi,beat,duration,velocity,pan});};
  for(const [beat,pitch,duration] of PHRASES[phrase])if(beat>=within*4&&beat<within*4+4){
    const resolved=index===14&&pitch===72?73:pitch;
    const melody=resolved+(mode==='ending'&&phrase===3?12:0)-(mode==='tunnel'?12:0);
    add(a.lead,melody,beat-within*4,duration,a.leadGain*(within===3?.85:1),-.18);
    if(tense&&duration>=1.5)add('bell',melody+12,beat-within*4+.5,.45,.065,.4);
  }
  // The bridge answers the main line rather than playing every note in unison.
  if(phrase===2&&within%2===1)add(mode==='tunnel'?'reed':'bell',root+19,1.5,1.75,a.leadGain*.35,.5);
  chord.forEach((pitch,i)=>add('strings',pitch+(mode==='ending'?12:0),0,3.9,a.strings/Math.sqrt(3),i===0?-.45:.45));
  if(tense){
    for(let beat=0;beat<4;beat+=.5)add('keys',chord[[0,2,1,2][Math.round(beat*2)%4]]+12,beat,.28,a.keys*(beat%1?.65:1),.3);
    for(let beat=0;beat<4;beat++)add('bass',root-12+(beat===2?7:0),beat,.72,a.bass);
  }else{
    const pattern=mode==='yard'?[0,2,1,2]:[0,1,2,1];
    for(let beat=0;beat<4;beat++)if(!(within===3&&beat===3))add('keys',chord[pattern[beat]]+12,beat+(beat%2&&mode==='yard'?.12:0),1.25,a.keys,.35);
    add('bass',root-12,0,2.8,a.bass,-.12);if(mode!=='tunnel')add('bass',root-5,3,.8,a.bass*.65,-.12);
    if(mode==='station'&&within===3)add('bell',root+24,2.5,1.5,.08,.55);
  }
  if(a.percussion){
    add('kick',36,0,.2,a.percussion);add('kick',36,2,.2,a.percussion*.85);
    for(const beat of [1,3])add('snare',38,beat,.18,a.percussion*.6,-.1);
    for(let beat=.5;beat<4;beat+=tense?.5:1)add('hat',42,beat,.08,a.percussion*(beat%1?.2:.32),.45);
    if(tense&&within===3)for(const beat of [3.25,3.5,3.75])add('snare',38,beat,.12,a.percussion*.3,-.1);
  }
  return result;
}
