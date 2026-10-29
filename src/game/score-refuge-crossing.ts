import type {Instrument,Note} from './score';
import {refugeOpeningBar} from './score-four';
import {transpose,octave,type Pitch} from './tuning';
import {singing} from './expression';

// An athletic A Place to Return: eight bars at 120 BPM fit the whole film.
// The urgent strings yield to piano as Nell and Tomas reach the coast.
export function refugeCrossingBar(bar:number):Note[]{
 const i=((bar%8)+8)%8,{root,notes:chord,melody}=refugeOpeningBar(i),out:Note[]=[];
 const energy=[1.04,1,.94,.88,.94,.88,.8,.7][i];
 const add=(instrument:Instrument,pitch:Pitch,beat:number,duration:number,velocity:number,pan=0)=>{
  const note:Note={instrument,pitch,beat,duration,velocity:velocity*energy,pan};out.push(note);return note;
 };
 for(const [beat,pitch,length]of melody){
  const duration=Math.min(length,i<4?1.3:1.6);
  const note=add(i<4?'strings':'keys',pitch,beat,duration,.23,-.12);
  if(i<4)note.expression=singing('warm',1,duration,false);
 }
 const fifth=transpose(root,'P5');
 for(const [n,pitch]of [root,root,fifth,octave(root,1),root,fifth,root,fifth].entries()){
  if(i===7&&n>=4)continue;
  add('bass',pitch,n*.5,n%2?.24:.37,n%2?.09:.15,-.16);
 }
 if(i===7)add('bass',root,2,1.8,.13,-.16);
 for(const beat of (i===7?[.5,1.5]:[.5,1.5,2.5,3.5])){
  for(const pitch of [chord[0],chord[2]])add('lute',pitch,beat,.24,.045,.3);
 }
 if(i>=4)for(const pitch of [chord[1],chord[3]])add('strings',pitch,0,3.7,.021,.32);
 for(const beat of (i===7?[0,2]:[0,1.5,2,2.75]))add('kick','C2',beat,.16,beat===0?.13:.08);
 for(const beat of [1,3])add('snare','D2',beat,.13,i<4?.09:.065,-.2);
 for(let beat=0;beat<4;beat+=.5)add('hat','F#2',beat,.065,beat%1?.023:.032,.4);
 if(i===1||i===3)for(const beat of [3.25,3.5,3.75])add('snare','D2',beat,.1,.035+(beat-3)*.025,-.2);
 if(i===0){add('timpani','A2',0,.7,.09);add('cymbal','C4',0,.8,.03,.3);}
 return out;
}
