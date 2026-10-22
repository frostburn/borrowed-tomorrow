/** Positions are fractions of a held note; values are gain multiples or cents. */
export type ControlCurve=readonly (readonly [position:number,value:number])[];
export interface NoteExpression {
 dynamics?:ControlCurve;
 vibrato?:{rate:number;depth:ControlCurve};
}

/** Breath-shaped envelopes. Short connecting notes keep a clear, steady pitch. */
export function singing(character:'nell'|'celia',strength:number,duration:number,cadence=false):NoteExpression {
 if(duration<=.75)return {dynamics:[[0,.76*strength],[.2,strength],[.65,.85*strength],[1,.48*strength]]};
 const warm=character==='celia',depth=(warm?32:24)*Math.min(1,duration/2.5)*strength;
 return {
  dynamics:[[0,(warm?.42:.6)*strength],[.2,.88*strength],[warm?.58:.52,(warm?1.28:1.16)*strength],[.82,.8*strength],[1,(cadence?.24:.42)*strength]],
  vibrato:{rate:(warm?5.2:4.7)+(strength-1)*.7,depth:[[0,0],[warm?.18:.24,0],[.62,depth],[.82,depth*.85],[1,depth*.18]]},
 };
}
