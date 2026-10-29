/** A presentation of the earned departure; no additional save flag is needed. */
export const CROSSING_SHOTS=[
 {id:'pass',title:'Beyond the pass',duration:5000},
 {id:'viaduct',title:'Down to the coast',duration:6500},
 {id:'exchange',title:'The Iron Coast',duration:4500},
] as const;
export const CROSSING_DURATION=CROSSING_SHOTS.reduce((sum,shot)=>sum+shot.duration,0);
export function crossingShotStart(index:number){return CROSSING_SHOTS.slice(0,Math.max(0,Math.min(CROSSING_SHOTS.length-1,index))).reduce((sum,shot)=>sum+shot.duration,0);}
export function crossingFrame(milliseconds:number){
 const elapsed=Math.max(0,Math.min(CROSSING_DURATION,Number.isFinite(milliseconds)?milliseconds:0));
 let start=0;
 for(const [index,shot]of CROSSING_SHOTS.entries()){
  if(elapsed<start+shot.duration||index===CROSSING_SHOTS.length-1)return {shot,index,time:elapsed-start,progress:(elapsed-start)/shot.duration,ended:elapsed>=CROSSING_DURATION};
  start+=shot.duration;
 }
 throw new Error('The crossing needs a shot.');
}
