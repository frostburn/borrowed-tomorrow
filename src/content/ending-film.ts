import type {GameState} from '../rules/state';
import {ENDING_SHORE_DURATION,ENDING_CREDITS_START} from './credits';

/** Durations are scene time; seeking and workshop review never mutate a save. */
export const GOOD_ENDING_SHOTS=[
 {id:'release',title:'The days return',duration:9000,music:'homecoming'},
 {id:'station',title:'The next train',duration:11000,music:'homecoming'},
 {id:'window',title:'Window seats',duration:10000,music:'seaholiday'},
 {id:'shore',title:'Until evening',duration:ENDING_SHORE_DURATION,music:'seaholiday'},
] as const;
export const GOOD_ENDING_DURATION=GOOD_ENDING_SHOTS.reduce((sum,s)=>sum+s.duration,0);
export const BAD_ENDING_CUES={pullbackStart:1000,pullbackEnd:13000,trainStart:15000,trainEnd:24000,rainStart:25000,rainFull:30000,captionStart:66000} as const;
export const BAD_ENDING_HINT='Cure Nell for additional story content.';
export const BAD_ENDING_SHOTS=[
 {id:'empty-seat',title:'The empty seat',duration:72000,music:'laststation'},
] as const;
export const BAD_ENDING_DURATION=BAD_ENDING_SHOTS.reduce((sum,s)=>sum+s.duration,0);
export const ENDING_FILMS={
 good:{label:'Good ending',title:'The days return',description:'A journey to the real sea',shots:GOOD_ENDING_SHOTS,duration:GOOD_ENDING_DURATION,creditShot:3,creditStart:ENDING_CREDITS_START,room:'seaholiday'},
 bad:{label:'Bad ending',title:'The empty seat',description:'The empty seat',shots:BAD_ENDING_SHOTS,duration:BAD_ENDING_DURATION,creditShot:0,creditStart:28000,room:'laststation'},
} as const;
export type EndingKind=keyof typeof ENDING_FILMS;
export type EndingShotId=typeof GOOD_ENDING_SHOTS[number]['id']|typeof BAD_ENDING_SHOTS[number]['id'];
export function endingShotStart(index:number,kind:EndingKind='good'){
 const shots=ENDING_FILMS[kind].shots;
 const selected=Math.max(0,Math.min(shots.length-1,Math.trunc(Number.isFinite(index)?index:0)));
 return shots.slice(0,selected).reduce((sum,s)=>sum+s.duration,0);
}
export function endingFrame(milliseconds:number,kind:EndingKind='good'){
 const {shots,duration}=ENDING_FILMS[kind];
 const time=Math.max(0,Math.min(duration,Number.isFinite(milliseconds)?milliseconds:0));
 let start=0;
 for(let index=0;index<shots.length;index++){
  const shot=shots[index],end=start+shot.duration;
  if(time<end||index===shots.length-1)return {shot,index,time:time-start,progress:(time-start)/shot.duration,ended:time>=duration};
  start=end;
 }
 throw new Error('The ending needs at least one shot.');
}
export const canPlayGoodEnding=(state:Pick<GameState,'flags'>)=>!!(state.flags.chapterSevenComplete&&state.flags.realSeaSeen&&state.flags.nellRecovered&&!state.flags.nellLost&&!state.flags.lightbearerEnding);
export const canPlayBadEnding=(state:Pick<GameState,'flags'>)=>!!(state.flags.lightbearerEnding&&state.flags.nellLost&&state.flags.emptySeatSeen&&!state.flags.nellRecovered&&!state.flags.chapterSevenComplete);
/** Translate each film's last shot into the one shared credit-roll clock. */
export const endingCreditTime=(shotTime:number,kind:EndingKind='good')=>shotTime+ENDING_CREDITS_START-ENDING_FILMS[kind].creditStart;
