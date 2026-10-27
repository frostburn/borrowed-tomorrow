import type {MapPerson} from './maps';

export const PERSON_MOTION_SPRITES=['civilian-dockhand','civilian-traveler','civilian-family','civilian-patient','civilian-dockhand-rust','civilian-traveler-blue','civilian-family-blue','civilian-family-plum','civilian-patient-green'] as const;
export const steppingPerson=(sprite:string)=>sprite.includes('dockhand')||sprite.includes('traveler');
export const PERSON_MOTION_PAGES=PERSON_MOTION_SPRITES.map(sprite=>({key:`${sprite}-ambient`,asset:`animation/${sprite}-ambient`,frames:steppingPerson(sprite)?8:2}));
export function personStill(map:string,person:MapPerson,flags:Record<string,boolean>){
 return !!person.projection||!!person.motionAfter&&!flags[person.motionAfter]||map==='rillbridge'&&!flags.villageFreed||map==='cinderbank'&&!flags.coastCollectorWon;
}
export const animatedPerson=(sprite:string)=>PERSON_MOTION_SPRITES.some(id=>id===sprite);
export interface PersonPose {dy:number;frame?:number;motion:'idle'|'move'|'gesture'}
const idle:PersonPose={dy:0,motion:'idle'};
/** Brief, staggered actions separated by long rests. Small forward/back
 * adjustments use the original facing and preserve physical handedness. */
export function personPose(person:Pick<MapPerson,'sprite'>,time:number,slot:number,count:number,canStep=true):PersonPose{
 const period=Math.max(18000,count*3600),local=(time-1200-slot*3600)%period;
 if(local<0||!animatedPerson(person.sprite))return idle;
 if(steppingPerson(person.sprite)&&canStep){
  if(local>=4200)return idle;
  const travel=local<1400?local/1400:local<2800?1:(4200-local)/1400;
  const dy=Math.round(travel*8/2)*2;
  if(local>=1400&&local<2800)return {dy,motion:'idle'};
  return {dy,motion:'move'};
 }
 if(local>=1800)return idle;
 return {dy:0,frame:(steppingPerson(person.sprite)?6:0)+(local<450||local>=1350?0:1),motion:'gesture'};
}
/** Include the world sole offset when checking an eight-pixel step across
 * a cell edge. Decorative people do not change navigation occupancy. */
export function stepClear(person:MapPerson,walkable:(x:number,y:number)=>boolean){
 return [0,8].every(dy=>walkable(person.x,Math.floor(((person.y+.5)*24+7+dy)/24)));
}
