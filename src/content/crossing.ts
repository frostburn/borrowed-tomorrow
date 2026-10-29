import type {MusicMode} from '../game/score';
import type {MapId} from '../rules/state';

/** Presentations of earned departures; neither needs an additional save flag. */
export const CROSSING_SHOTS=[
 {id:'pass',title:'Beyond the pass',duration:5000},
 {id:'viaduct',title:'Down to the coast',duration:6500},
 {id:'exchange',title:'The Iron Coast',duration:4500},
] as const;
export const CAPITAL_CROSSING_SHOTS=[
 {id:'coaches',title:'The medical train',duration:5000},
 {id:'passengers',title:'Room for everyone',duration:6500},
 {id:'northglass',title:'Below the palace',duration:4500},
] as const;
export type CrossingKind='coast'|'capital';
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
  id:'two-three-crossing',label:'Chapter Two → Three',title:'The capital line',from:'Prison Trains',to:'Beneath the Palace',place:'the capital',returnLabel:'Return to the siding',music:'northglass',map:'northglass',shots:CAPITAL_CROSSING_SHOTS,
  description:'The coal engine carries the full medical coaches inland. Dena tends the passengers while Nell and Kit check the clearance. The green-iron capital comes into view.',
  accessibility:'Nell, Orrin and Kit take the rescued passengers to the capital aboard the medical train. Space pauses. Escape skips to Chapter Three.',
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
