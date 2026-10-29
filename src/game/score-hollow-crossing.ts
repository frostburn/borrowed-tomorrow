import type {Instrument,Note} from './score';
import {sevenBar} from './score-seven';
import {singing,phrasing} from './expression';
import type {Pitch} from './tuning';

/** An urgent approach to Under the Hanging Sea, using its actual 31-EDO radiant
 * octatonic phrases. Strings give way to organ as the world turns overhead.
 * Eight 4/4 bars at 120 BPM match the sixteen-second journey, without rubato. */
export function hollowCrossingBar(bar:number):Note[]{
 const i=((bar%8)+8)%8,source=sevenBar('hollowsill',i),out:Note[]=[];
 const energy=[.78,.87,.94,1.02,1.08,1.04,.94,.78][i];
 const add=(instrument:Instrument,pitch:Pitch,beat:number,duration:number,velocity:number,pan=0)=>{
  const note:Note={instrument,pitch,beat,duration,velocity:velocity*energy,pan};out.push(note);return note;
 };
 for(const n of source){
  const melody=n.instrument==='organ'&&Math.abs(n.pan)===.12;
  if(melody){
   const voice=add(i<4?'strings':'organ',n.pitch,n.beat,n.duration,i<4?.2:.14,-.12);
   voice.expression=singing(i<4?'warm':'clear',energy,n.duration,false);
   voice.expression.release=.65;
  }else if(n.instrument==='organ'){
   // Long chord planes stay beneath the call and continue across the cuts.
   const voice=add('strings',n.pitch,n.beat,n.duration,.022,n.pan);
   voice.expression=phrasing(energy,true);voice.expression.release=.8;
  }else if(n.instrument==='round-bass'){
   const voice=add('round-bass',n.pitch,n.beat,n.duration,.095,-.1);
   voice.expression=phrasing(energy);voice.expression.release=.5;
  }else if(n.instrument==='bell'){
   add('bell',n.pitch,n.beat,n.duration,.055,.34).expression={...phrasing(energy),release:1.2};
  }
 }
 // Measured low percussion supports the climb, then leaves the last landing clear.
 for(const beat of i===7?[0]:[0,2])add('kick','C2',beat,.18,i<4?.08:.06);
 if(i===0||i===4)add('timpani','C2',0,1.1,.1,-.25);
 if(i===3)for(const [j,beat]of [2.5,3,3.5].entries())add('timpani','G2',beat,.3,.045+j*.012,-.25);
 if(i===4)add('cymbal','C3',0,1.8,.028,.3);
 return out;
}
