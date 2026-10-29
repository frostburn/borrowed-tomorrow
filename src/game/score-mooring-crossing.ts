import type {Instrument,Note} from './score';
import {flightOpeningBar} from './score-flight';
import {octave,type Pitch} from './tuning';
import {singing,phrasing} from './expression';

/** Above the Railway's opening, an octave lower and at half speed. Eight bars
 * at 120 BPM fit the film, with a quiet 60 BPM phrase and no percussion/rubato.
 * Leave Two Seals at the Gate untouched for the actual Chapter Six opening. */
export function mooringCrossingBar(bar:number):Note[]{
 const i=((bar%8)+8)%8,source=flightOpeningBar(Math.floor(i/2)),half=(i%2)*2,out:Note[]=[];
 const energy=[.82,.88,.8,.76,.88,.95,.83,.65][i];
 const add=(instrument:Instrument,pitch:Pitch,beat:number,duration:number,velocity:number,pan=0)=>{
  const note:Note={instrument,pitch,beat,duration,velocity:velocity*energy,pan};out.push(note);return note;
 };
 for(const [beat,pitch,length]of source.melody){
  if(beat<half||beat>=half+2)continue;
  const duration=length*2,voice=add(i<4?'strings':'keys',octave(pitch,-1),(beat-half)*2,duration,i<4?.17:.2,-.16);
  voice.expression=i<4?singing('warm',1,duration,false):phrasing(1,false);
  voice.expression.release=.7;
 }
 if(i%2===0){
  add('round-bass',source.bass,0,7.5,.075,-.08).expression={release:.6};
  for(const [n,pitch]of source.notes.entries()){
   const voice=add('strings',pitch,0,7.4,.012,n%2?.36:-.36);
   voice.expression=phrasing(.85,true);voice.expression.release=.7;
  }
  // Quiet lower chord tones keep the cabin's accompaniment out of the treble.
  for(const [n,pitch]of source.notes.slice(0,2).entries())add('keys',pitch,.5+n*.5,2.5,.025,.25);
 }
 return out;
}
