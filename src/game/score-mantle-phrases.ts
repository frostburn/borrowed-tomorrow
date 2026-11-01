import type {Instrument,Note} from './score';
import {octave,type Pitch} from './tuning';
import {singing} from './expression';

// One shared rhythmic sentence: organ call, then a harmonized band answer.
export const MANTLE_RHYTHM=[0,1,3,6,8,10,12,14];
type Part='brass'|'strings'|'inner';
interface Phrase {attacks?:readonly number[];bar:number;brass:readonly number[];strings:readonly number[];inner:readonly number[]}
const phrases:readonly Phrase[]=[
 {bar:2,brass:[4,7,6,4],strings:[2,1,-1,0],inner:[-8,-4,-5,-4]},
 {bar:6,attacks:[0,1,2,4,6],brass:[6,6,10,8,6],strings:[2,2,4,3,1],inner:[-2,-2,1,2,-2]},
 {bar:10,brass:[7,6,4,7],strings:[3,2,-2,-1],inner:[-5,-2,-4,-1]},
 {bar:14,attacks:[0,2,3,4,6],brass:[9,8,8,4,5],strings:[-3,0,0,1,0],inner:[-3,-6,-6,-8,-7]},
 {bar:18,brass:[9,7,5,7],strings:[4,2,3,1],inner:[-7,-4,-3,-6]},
 {bar:22,attacks:[0,1.5,2,4,5,6],brass:[10,10,8,9,9,7],strings:[4,4,2,5,5,4],inner:[-4,-4,0,-1,-1,-4]},
 {bar:26,attacks:[0,2,4,5,6,7],brass:[6,9,6,6,5,5],strings:[2,4,2,2,-3,-3],inner:[-6,-2,-3,-3,-6,-6]},
 {bar:30,brass:[8,7,3,2],strings:[4,2,-1,0],inner:[-8,-4,-5,-8]},
];
const radiant:readonly Pitch[]=['C4','D4','E4','Ft4','G4','Ad4','A#4','B4'];
const pitch=(degree:number)=>octave(radiant[(degree%8+8)%8],Math.floor(degree/8));
const parts:readonly {part:Part;instrument:Instrument;mix:number;pan:number}[]=[
 {part:'brass',instrument:'brass',mix:.54,pan:-.22},
 {part:'strings',instrument:'strings',mix:.42,pan:.24},
 {part:'inner',instrument:'organ',mix:.3,pan:.05},
];
export function mantlePhraseNotes(bar:number,gain:number,strength:number):Note[]{
 const phrase=phrases.find(p=>bar>=p.bar&&bar<p.bar+2);if(!phrase)return[];
 const offset=(bar-phrase.bar)*4,attacks=phrase.attacks??MANTLE_RHYTHM.slice(4).map(at=>at-8);
 return parts.flatMap(({part,instrument,mix,pan})=>phrase[part].flatMap((degree,j)=>{
  // All three voices strike together; extra taps repeat existing voicings.
  const at=attacks[j],hold=((attacks[j+1]??8)-at)*.7;
  if(at<offset||at>=offset+4)return[];
  return [{instrument,pitch:pitch(degree),beat:at-offset,duration:hold,velocity:gain*mix,pan,
   expression:{...singing('clear',strength*(j===0?1:.9),hold,j===attacks.length-1),release:part==='strings'?.2:.12}}];
 }));
}

/** The lead rests during each two-bar answer, with held calls cut at the handoff. */
export function mantleLeadHold(bar:number,beat:number,hold:number):number{
 const start=bar*4+beat;
 for(const p of phrases){
  const at=p.bar*4,end=at+8;
  if(start>=at&&start<end)return 0;
  if(start<at&&start+hold>at)hold=at-start;
 }
 return hold;
}
