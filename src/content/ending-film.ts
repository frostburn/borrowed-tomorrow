import type {GameState} from '../rules/state';
import {ENDING_SHORE_DURATION} from './credits';

/** Durations are scene time; seeking and workshop review never mutate a save. */
export const GOOD_ENDING_SHOTS=[
 {id:'release',title:'The days return',duration:9000,music:'homecoming'},
 {id:'station',title:'The next train',duration:11000,music:'homecoming'},
 {id:'window',title:'Window seats',duration:10000,music:'seaholiday'},
 {id:'shore',title:'Until evening',duration:ENDING_SHORE_DURATION,music:'seaholiday'},
] as const;
export const GOOD_ENDING_DURATION=GOOD_ENDING_SHOTS.reduce((sum,s)=>sum+s.duration,0);
export type EndingShotId=typeof GOOD_ENDING_SHOTS[number]['id'];
export function endingShotStart(index:number){
 const selected=Math.max(0,Math.min(GOOD_ENDING_SHOTS.length-1,Math.trunc(Number.isFinite(index)?index:0)));
 return GOOD_ENDING_SHOTS.slice(0,selected).reduce((sum,s)=>sum+s.duration,0);
}
export function endingFrame(milliseconds:number){
 const time=Math.max(0,Math.min(GOOD_ENDING_DURATION,Number.isFinite(milliseconds)?milliseconds:0));
 let start=0;
 for(let index=0;index<GOOD_ENDING_SHOTS.length;index++){
  const shot=GOOD_ENDING_SHOTS[index],end=start+shot.duration;
  if(time<end||index===GOOD_ENDING_SHOTS.length-1)return {shot,index,time:time-start,progress:(time-start)/shot.duration,ended:time>=GOOD_ENDING_DURATION};
  start=end;
 }
 throw new Error('The ending needs at least one shot.');
}
export const canPlayGoodEnding=(state:Pick<GameState,'flags'>)=>!!(state.flags.chapterSevenComplete&&state.flags.realSeaSeen&&state.flags.nellRecovered&&!state.flags.nellLost&&!state.flags.lightbearerEnding);
