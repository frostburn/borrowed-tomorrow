import { pitchSteps,type Pitch } from './tuning';

/** Positions are fractions of a held note; values are gain multiples or cents. */
export type ControlCurve=readonly (readonly [position:number,value:number])[];
export interface NoteExpression {
 dynamics?:ControlCurve;
 vibrato?:{rate:number;depth:ControlCurve};
 /** Cents relative to the spelled 31-EDO pitch; independent of vibrato. */
 bend?:ControlCurve;
 /** Seconds after the written hold, before the final zero-valued tail. */
 release?:number;
}

/** Breath-shaped envelopes. Short connecting notes keep a clear, steady pitch. */
export function singing(colour:'clear'|'warm',strength:number,duration:number,cadence=false):NoteExpression {
 if(duration<=.75)return {dynamics:[[0,.76*strength],[.2,strength],[.65,.85*strength],[1,.48*strength]]};
 const warm=colour==='warm',depth=(warm?32:24)*Math.min(1,duration/2.5)*strength;
 return {
  dynamics:[[0,(warm?.42:.6)*strength],[.2,.88*strength],[warm?.58:.52,(warm?1.28:1.16)*strength],[.82,.8*strength],[1,(cadence?.24:.42)*strength]],
  vibrato:{rate:(warm?5.2:4.7)+(strength-1)*.7,depth:[[0,0],[warm?.18:.24,0],[.62,depth],[.82,depth*.85],[1,depth*.18]]},
 };
}
/** A struck phrase keeps its attack; a held inner voice grows into the line. */
export function phrasing(strength:number,held=false):NoteExpression {
 return {dynamics:held?[[0,.55*strength],[.24,.85*strength],[.6,strength],[1,.38*strength]]
  :[[0,strength],[.16,.92*strength],[.65,.74*strength],[1,.35*strength]]};
}

/** A short fretless approach, followed by a long exact-pitch centre and a sigh.
 * Wide register changes slide only their last eight steps, never an octave.
 * Duration is in score beats so the ensemble's rubato also shapes the slide. */
export function bassSlide(from:Pitch,to:Pitch,duration:number):ControlCurve {
 const steps=Math.max(-8,Math.min(8,pitchSteps(from)-pitchSteps(to))),cents=steps*1200/31;
 const arrival=Math.min(.22,.3/duration);
 return [[0,cents||-24],[arrival*.35,cents?cents*.8:-18],[arrival,0],[.82,0],[.94,-9],[1,0]];
}
