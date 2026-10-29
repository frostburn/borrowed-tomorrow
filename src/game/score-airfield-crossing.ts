import type {Instrument,Note} from './score';
import {mooringOpeningBar} from './score-flight';
import {octave,transpose,type Pitch} from './tuning';
import {singing} from './expression';

/** The Western Mooring on foot: eight bars at 120 BPM, exactly sixteen seconds.
 * A quiet reed farewell, nimble piano on the road, then the reed's wider answer.
 * No rubato: the shared melody keeps its pitches while the film keeps its cuts. */
export function airfieldCrossingBar(bar:number):Note[]{
 const i=((bar%8)+8)%8,{bass,notes:chord,melody}=mooringOpeningBar(i),out:Note[]=[];
 const road=i>=2&&i<6,energy=[.77,.8,.96,1,.98,1.04,.92,.81][i];
 const add=(instrument:Instrument,pitch:Pitch,beat:number,duration:number,velocity:number,pan=0)=>{
  const note:Note={instrument,pitch,beat,duration,velocity:velocity*energy,pan};out.push(note);return note;
 };
 for(const [n,[beat,pitch,length]]of melody.entries()){
  const duration=Math.min(length,road?1.1:1.6);
  const voice=add(road?'keys':'reed',pitch,beat,duration,(road?.24:.22)*(1-n*.035),-.16);
  if(!road)voice.expression=singing('clear',1,duration,i===7);
 }
 const fifth=transpose(bass,'P5');
 const steps:readonly [number,Pitch,number][] = i===7?[[0,bass,.7],[1.5,fifth,.3],[2,bass,1.8]]:
  i%2?[[0,bass,.6],[1,fifth,.25],[1.5,bass,.35],[2.5,octave(chord[0],-1),.4],[3.5,fifth,.25]]:
  [[0,bass,.6],[1.5,fifth,.3],[2,bass,.5],[3,bass,.3],[3.5,fifth,.25]];
 for(const [beat,pitch,duration]of steps)add('bass',pitch,beat,duration,.13,-.1);
 // Broken voicings leave room for the phrase rather than doubling every note.
 for(const beat of i===7?[.5,1.5]:[.5,1.5,2.5,3.5]){
  const pair=beat%2<1?[chord[0],chord[2]]:[chord[1],chord[3]];
  for(const pitch of pair)add('lute',pitch,beat,.25,.05,.28);
 }
 if(i>=4)for(const [n,pitch]of chord.entries())add('strings',pitch,0,3.6,.016,n%2?.38:-.38);
 for(const beat of i===7?[0,2]:i%2?[0,1.5,2.5]:[0,2])add('kick','C2',beat,.14,road?.12:.085);
 for(const beat of [1,3])add('snare','D2',beat,.12,road?.078:.043,-.25);
 for(let beat=.5;beat<4;beat+=road?.5:1)add('hat','F#2',beat,.065,beat%1?.022:.014,.4);
 if(i===3||i===5)for(const beat of [3.25,3.75])add('wood',chord[1],beat,.1,.05,.3);
 if(i===6)add('cymbal','C4',0,.8,.025,.3);
 return out;
}
