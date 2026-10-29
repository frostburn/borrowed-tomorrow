import type {MusicMode} from '../game/score';
import type {GameState,MapId} from '../rules/state';

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
export const AIRFIELD_CROSSING_SHOTS=[
 {id:'farewell',title:'The open harbor',duration:5000},
 {id:'road',title:'The western road',duration:6500},
 {id:'mooring',title:'The survey mooring',duration:4500},
] as const;
export const MOORING_CROSSING_SHOTS=[
 {id:'clouds',title:'Beyond the fleet',duration:5000},
 {id:'berth',title:'Keeping watch',duration:6500},
 {id:'capital',title:'The outer lights',duration:4500},
] as const;
export const HOLLOW_CROSSING_SHOTS=[
 {id:'ascent',title:'Above the landed city',duration:5000},
 {id:'threshold',title:'Through the broken sun',duration:6500},
 {id:'hangingsea',title:'Beneath the water',duration:4500},
] as const;
export type CrossingKind='coast'|'capital'|'refuge'|'airfield'|'mooring'|'hollow';
export const CHAPTER_CROSSINGS:Partial<Record<GameState['chapter'],CrossingKind>>={
 'chapter-one':'coast','chapter-two':'capital','chapter-three':'refuge','chapter-four':'airfield','chapter-five':'mooring','chapter-six':'hollow',
};
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
 airfield:{
  id:'four-five-crossing',label:'Chapter Four → Five',title:'The westward road',from:'A Light on the Water',to:'Taking the World Back',place:'the western airfield',returnLabel:'Return to the refuge',music:'airfield-crossing',map:'airfield',shots:AIRFIELD_CROSSING_SHOTS,
  description:'Tomas waves from the refuge as the ferry crosses the open harbor. Nell, Orrin, Kit, Celia and Petra take the coastal road west. Beyond the headland, the survey ship waits at its mooring, still tied down beside the hangar.',
  accessibility:'Nell leaves Tomas safe at the railway refuge. All five companions walk along the coast to the western airfield. The survey airship stays moored; the party has not boarded it. Space pauses. Escape skips to Chapter Five.',
 },
 mooring:{
  id:'five-six-crossing',label:'Chapter Five → Six',title:'The long approach',from:'Taking the World Back',to:'The Emperor’s Last Day',place:'the outer mooring',returnLabel:'Return to the flight deck',music:'mooring-crossing',map:'outermooring',shots:MOORING_CROSSING_SHOTS,
  description:'The survey ship leaves the fleet’s last smoke behind. Below deck, Kit keeps watch beside Nell’s berth while Celia stays with her. Orrin and Petra watch the airborne marble capital draw closer. The landing bridge and the Emperor’s pact remain part of Chapter Six’s opening.',
  accessibility:'The survey ship carries the companions toward the capital. Nell remains ill in her berth, with Kit and Celia beside her. Orrin and Petra watch the white-marble city from the bow. Space pauses. Escape skips to Chapter Six.',
 },
 hollow:{
  id:'six-seven-crossing',label:'Chapter Six → Seven',title:'Through the broken sun',from:'The Emperor’s Last Day',to:'The God Who Lent Tomorrow',place:'the hollow sill',returnLabel:'Return to the allied landing',music:'hollow-crossing',map:'hollowsill',shots:HOLLOW_CROSSING_SHOTS,
  description:'The survey ship climbs above the landed marble capital. Recovered Nell carries the lantern on deck with all four companions as the broken sun fills their view. Beyond it, the ship holds a mooring beside a pier beneath a suspended sea. The Benefactor’s warning belongs to Chapter Seven’s opening.',
  accessibility:'The companions leave the grounded capital aboard the survey ship. Nell is well and carries the lantern in her right hand. They cross beneath hanging water while the ship keeps their way back open. Space pauses. Escape skips to Chapter Seven.',
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
