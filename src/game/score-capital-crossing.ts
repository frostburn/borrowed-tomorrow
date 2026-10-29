import type {Instrument,Note} from './score';
import {NORTHGLASS_CHORDS,NORTHGLASS_HARMONY,NORTHGLASS_MELODY} from './score-d';
import {octave,transpose,type Pitch} from './tuning';

// The complete eight-chord Northglass sentence, at a running 120 BPM, fills
// the sixteen-second film. Articulated piano opens; strings lift the answer.
export function capitalCrossingBar(bar:number):Note[]{
 const i=((bar%8)+8)%8,{root,notes:chord}=NORTHGLASS_CHORDS[NORTHGLASS_HARMONY[i]],out:Note[]=[];
 const strength=[.92,.88,1,.94,1.06,1,.98,.9][i];
 const add=(instrument:Instrument,pitch:Pitch,beat:number,duration:number,velocity:number,pan=0)=>out.push({instrument,pitch,beat,duration,velocity:velocity*strength,pan});
 for(const [beat,pitch,duration]of NORTHGLASS_MELODY[i]){
  const at=beat===.75?.5:beat===3.25?3.5:beat;
  add(i<4?'keys':'strings',pitch,at,Math.min(duration,i===7?1.4:i<4?.7:1.1),i<4?.24:.2,-.12);
  if(i===0||i===2||i===4)add('wood',octave(pitch,1),at,.16,.045,.25);
 }
 // Chord tones and a late dominant approach carry the wheels forward without
 // doubling the vocal-shaped lead. The final F bar leaves room for arrival.
 const fifth=transpose(root,'P5'),third=octave(chord[1],-1);
 const basses=[root,fifth,third,fifth,octave(root,1),fifth,root,i===6?'E2':fifth] as Pitch[];
 for(const [n,pitch]of basses.entries()){
  if(i===7&&n>3)continue;
  add('bass',pitch,n*.5,n%2?.25:.36,n%2?.095:.145,-.15);
 }
 if(i===7)add('bass',root,2,1.7,.13,-.15);
 for(const beat of [.5,1.5,2.5,3.5]){
  if(i===7&&beat>2)continue;
  // Alternating voicings retain the borrowed seventh and avoid block triads.
  for(const pitch of [chord[beat===.5||beat===2.5?0:1],chord[2]])add('lute',pitch,beat,.23,.055,.28);
 }
 if(i>=4&&i<=6)for(const pitch of [chord[1],chord[3]])add('strings',pitch,0,3.5,.021,.35);
 for(const beat of [0,1.5,2,3.5])if(i!==7||beat===0||beat===2)add('kick','C2',beat,.16,beat===0?.13:.085);
 for(const beat of [1,3])add('snare','D2',beat,.12,.09,-.2);
 for(let beat=0;beat<4;beat+=.5)add('hat','F#2',beat,.065,beat%1?.026:.035,.4);
 if(i===3||i===6)for(const beat of [3.25,3.5,3.75])add('snare','D2',beat,.09,.035+(beat-3)*.035,-.2);
 if(i===0||i===4)add('cymbal','C4',0,.7,.025,.3);
 return out;
}
