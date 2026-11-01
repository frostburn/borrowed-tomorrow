import type {Instrument,Note} from './score';
import {octave,type Pitch} from './tuning';
import {singing} from './expression';

// Three independent two-bar lines, joining the original organ theme in the
// second half of each sentence. Degrees retain the radiant 31-EDO collection.
type Entry=readonly [beat:number,degree:number,hold:number];
interface Phrase {bar:number;brass:readonly Entry[];strings:readonly Entry[];inner:readonly Entry[]}
const phrases:readonly Phrase[]=[
 {bar:2,
  brass:[[0,4,.65],[.75,8,.85],[2,7,1.1],[3.5,4,.35],[5,6,.65],[6.5,4,1.1]],
  strings:[[1.25,2,1.5],[3,1,1.1],[4.5,-1,1.1],[6,0,1.75]],
  inner:[[0,-8,2],[2.5,-4,1.25],[4,-5,1.75],[6.25,-4,1.5]]},
 {bar:6,
  brass:[[0,6,.85],[1.5,9,.65],[2.5,10,1],[4.25,8,.6],[5.5,7,.65],[7,6,.75]],
  strings:[[.75,2,1.5],[2.75,4,1.25],[4.5,3,1.25],[6.25,1,1.5]],
  inner:[[0,-2,1.75],[2.25,1,1.25],[4,2,1.75],[6,-2,1.75]]},
 {bar:10,
  brass:[[0,7,1],[1.5,6,.65],[2.5,5,.6],[3.5,4,.35],[5,6,.7],[6.5,7,1.25]],
  strings:[[.5,3,1.5],[2.25,2,1.25],[4,0,1.25],[5.5,-2,1.1],[7,-1,.8]],
  inner:[[0,-5,2],[2.5,-2,1.25],[4.25,-4,1.5],[6.25,-1,1.5]]},
 {bar:14,
  brass:[[.5,9,1.4],[3,8,1.7],[5.5,4,.8],[7,5,.75]],
  strings:[[0,-3,1.75],[2.5,0,1.25],[4.25,1,1.5],[6.25,0,1.5]],
  inner:[[.25,-3,2],[2.75,-6,1],[4.25,-8,1.5],[6.25,-7,1.5]]},
 {bar:18,
  brass:[[0,9,.6],[.75,8,.55],[1.5,7,.75],[2.75,5,.7],[4,4,1],[5.5,5,.75],[7,7,.8]],
  strings:[[.5,4,1.5],[2.5,2,1.25],[4.25,3,1.25],[6,1,1.8]],
  inner:[[0,-7,2],[2.5,-4,1.25],[4,-3,1.75],[6.25,-6,1.5]]},
 {bar:22,
  brass:[[0,10,1],[1.5,9,.65],[2.5,8,.6],[3.5,7,.35],[5,9,.75],[6.5,7,1.2]],
  strings:[[.75,4,1.5],[2.75,2,1.25],[4.5,5,1.25],[6.25,4,1.5]],
  inner:[[0,-4,1.75],[2.25,0,1.25],[4,-1,1.75],[6,-4,1.75]]},
 {bar:26,
  brass:[[.5,6,.75],[1.75,7,.75],[3,9,.7],[4.5,6,1],[6.5,5,1.2]],
  strings:[[0,2,1.5],[1.75,3,1.25],[3.5,4,1.25],[5,2,1.1],[6.5,-3,1.25]],
  inner:[[.25,-6,1.75],[2.5,-2,1.25],[4.25,-3,1.5],[6.25,-6,1.5]]},
 {bar:30,
  brass:[[0,8,1],[1.5,7,.75],[3,4,.7],[4.5,3,1],[6.5,2,1.2]],
  strings:[[.75,4,1.25],[2.5,2,1.1],[4,1,1.25],[5.5,-1,.9],[6.75,0,1]],
  inner:[[0,-8,2],[2.5,-4,1.25],[4.25,-5,1.5],[6.25,-8,1.5]]},
];
const radiant:readonly Pitch[]=['C4','D4','E4','Ft4','G4','Ad4','A#4','B4'];
const pitch=(degree:number)=>octave(radiant[(degree%8+8)%8],Math.floor(degree/8));
const parts:readonly {part:'brass'|'strings'|'inner';instrument:Instrument;mix:number;pan:number}[]=[
 {part:'brass',instrument:'brass',mix:.54,pan:-.22},
 {part:'strings',instrument:'strings',mix:.42,pan:.24},
 {part:'inner',instrument:'organ',mix:.3,pan:.05},
];
export function mantlePhraseNotes(bar:number,gain:number,strength:number):Note[]{
 const phrase=phrases.find(p=>bar>=p.bar&&bar<p.bar+2);if(!phrase)return[];
 const offset=(bar-phrase.bar)*4;
 return parts.flatMap(({part,instrument,mix,pan})=>phrase[part].flatMap(([at,degree,hold],j)=>{
  if(at<offset||at>=offset+4)return[];
  return [{instrument,pitch:pitch(degree),beat:at-offset,duration:hold,velocity:gain*mix,pan,
   expression:{...singing('clear',strength*(j===0?1:.9),hold,at+hold>7.5),release:part==='strings'?.2:.12}}];
 }));
}
