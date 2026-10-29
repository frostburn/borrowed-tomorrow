import type {Instrument,Note} from './score';
import {ROOTS,WORKSHOP} from './score-home';
import {octave,transpose,type Pitch} from './tuning';

// Eight bars at 120 BPM fill the sixteen-second crossing. Piano hammer taps
// give way to Nell's festival answer in strings as the engine reaches the bay.
const energy=[.94,.9,1,.94,1.06,1,.96,1.04];
const pickups:Partial<Record<number,[number,Pitch,number][]>>={
 1:[[3.5,'C5',.25]],3:[[3,'G4',.28],[3.5,'C#5',.28]],
 5:[[2.5,'C5',.25]],7:[[2.5,'C#5',.28],[3.5,'E5',.28]],
};
export function crossingBar(bar:number):Note[]{
 const i=((bar%8)+8)%8,within=i%4,root=ROOTS[i],out:Note[]=[];
 const add=(instrument:Instrument,pitch:Pitch,beat:number,duration:number,velocity:number,pan=0)=>out.push({instrument,pitch,beat,duration,velocity,pan});
 const line=WORKSHOP[i<4?0:1].filter(([beat])=>beat>=within*4&&beat<(within+1)*4);
 for(const [absolute,pitch,length]of line){
  const beat=absolute-within*4,duration=Math.min(length,i<4?.6:1.35);
  add(i<4?'keys':'strings',pitch,beat,duration,(i<4?.22:.18)*energy[i],-.15);
  if(i<4&&length<.5)add('wood',octave(pitch,1),beat,.16,.065*energy[i],.24);
 }
 for(const [beat,pitch,duration]of pickups[i]??[])add(i<4?'keys':'strings',pitch,beat,duration,.15*energy[i],-.15);
 // Repeated low notes, fifths and offbeat plucks keep the wheel rhythm moving.
 const minor=root==='D3'||root==='G2',chord=[root,transpose(root,minor?'m3':'M3'),transpose(root,'P5')];
 const bass=octave(root,-1),fifth=transpose(bass,'P5');
 for(const [beat,pitch,length,gain]of [[0,bass,.65,1],[1,fifth,.28,.7],[1.5,bass,.28,.8],[2,octave(bass,1),.45,.9],[2.75,fifth,.18,.65],[3,bass,.35,.8],[3.5,fifth,.28,.7]]as const){
  if(i%4===3&&beat===2.75)continue;
  add('bass',pitch,beat,length,.15*gain);
 }
 for(const beat of [.5,1.5,2.5,3.5])for(const [n,pitch]of chord.entries())add('lute',octave(pitch,1),beat,.24,.037*(n===0?.8:1),.3);
 // Broad, quiet support lets the answering melody open up without a thick pad.
 if(i>=4)for(const pitch of chord.slice(1))add('strings',pitch,0,3.6,.018,.4);
 for(const beat of [0,1.5,2,2.75])if(!(i===7&&beat===2.75))add('kick','C2',beat,.16,beat===0?.115:.085);
 for(const beat of [1,3])add('snare','D2',beat,.13,.085,-.1);
 for(let beat=0;beat<4;beat+=.5)add('hat','F#2',beat,.07,beat%1?.023:.032,.4);
 if(i===3||i===7)for(const beat of [3.25,3.5,3.75])add('snare','D2',beat,.1,.035+(beat-3)*.04,-.12);
 return out;
}
