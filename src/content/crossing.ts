import type {MusicMode} from '../game/score';
import type {MapId} from '../rules/state';

/** Presentations of earned departures, without additional save flags. */
export const CROSSING_SHOTS=[
 {id:'pass',title:'Beyond the pass',duration:5000},
 {id:'viaduct',title:'Down to the coast',duration:6500},
 {id:'exchange',title:'The Iron Coast',duration:4500},
] as const;
export const CAPITAL_CROSSING_SHOTS=[
 {id:'coaches',title:'The medical train',duration:5000},
 {id:'passengers',title:'Room for everyone',duration:6500},
 {id:'northglass',title:'The conduit works',duration:4500},
] as const;
export const REFUGE_CROSSING_SHOTS=[
 {id:'bridge',title:'The last bridge',duration:5000},
 {id:'together',title:'Still together',duration:6500},
 {id:'refuge',title:'The railway refuge',duration:4500},
] as const;
export type CrossingKind='coast'|'capital'|'refuge';
interface CrossingFilm {
 id:string;label:string;title:string;from:string;to:string;place:string;returnLabel:string;
 description:string;accessibility:string;music:MusicMode;map:MapId;
 shots:readonly {id:string;title:string;duration:number}[];
}
export const CROSSING_FILMS:Record<CrossingKind,CrossingFilm>={
 coast:{
  id:'one-two-crossing',label:'Chapter One → Two',title:'The Iron Coast crossing',from:'Leaving Home',to:'Prison Trains',place:'the Iron Coast',returnLabel:'Return to the pass',music:'crossing',map:'coast',shots:CROSSING_SHOTS,
  description:'Orrin’s coal engine leaves the mountain pass, crosses the coastal viaduct and approaches the exchange.',
  accessibility:'Nell and Orrin take their coal engine through the cliffs to the Iron Coast. Space pauses. Escape skips to Chapter Two.',
 },
 capital:{
  id:'two-three-crossing',label:'Chapter Two → Three',title:'The capital line',from:'Prison Trains',to:'The Conduit Works',place:'the conduit works',returnLabel:'Return to the siding',music:'capital-crossing',map:'northglass',shots:CAPITAL_CROSSING_SHOTS,
  description:'The coal engine carries the full medical coaches inland. Dena tends the passengers while Nell and Kit check the clearance. The green-iron conduit works come into view outside the capital.',
  accessibility:'Nell, Orrin and Kit take the rescued passengers to the imperial conduit works aboard the medical train. Space pauses. Escape skips to Chapter Three.',
 },
 refuge:{
  id:'three-four-crossing',label:'Chapter Three → Four',title:'The coastward run',from:'The Conduit Works',to:'A Light on the Water',place:'the railway refuge',returnLabel:'Return to the platform',music:'refuge-crossing',map:'refuge',shots:REFUGE_CROSSING_SHOTS,
  description:'The medical train clears the broken bridge outside the grounded green conduit works. The white-marble capital hangs above the valley. Nell and Tomas sit together; Kit and Petra stay aboard. The coastal ward appears beside a motionless fishing boat on calm water.',
  accessibility:'The medical train escapes the failing conduit works below the airborne marble capital, with Tomas and all the passengers safe. Nell sits with her brother on the journey to the still harbor. Space pauses. Escape skips to Chapter Four.',
 },
};
export function crossingDuration(kind:CrossingKind='coast'){return CROSSING_FILMS[kind].shots.reduce((sum,shot)=>sum+shot.duration,0);}
export const CROSSING_DURATION=crossingDuration();
export function crossingShotStart(index:number,kind:CrossingKind='coast'){
 const shots=CROSSING_FILMS[kind].shots;
 return shots.slice(0,Math.max(0,Math.min(shots.length-1,index))).reduce((sum,shot)=>sum+shot.duration,0);
}
export function crossingFrame(milliseconds:number,kind:CrossingKind='coast'){
 const shots=CROSSING_FILMS[kind].shots,duration=crossingDuration(kind);
 const elapsed=Math.max(0,Math.min(duration,Number.isFinite(milliseconds)?milliseconds:0));
 let start=0;
 for(const [index,shot]of shots.entries()){
  if(elapsed<start+shot.duration||index===shots.length-1)return {shot,index,time:elapsed-start,progress:(elapsed-start)/shot.duration,ended:elapsed>=duration};
  start+=shot.duration;
 }
 throw new Error('The crossing needs a shot.');
}
