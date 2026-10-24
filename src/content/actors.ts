import { COMPANION_IDS, type CompanionId } from '../rules/party';

export const ACTOR_DIRECTIONS = ['front', 'left', 'right', 'back'] as const;
export type ActorDirection = typeof ACTOR_DIRECTIONS[number];
export const ACTOR_SIZE = 80;
export const ACTOR_FEET = 68;
export const actorAsset = (hero: CompanionId, direction: ActorDirection = 'front') => direction === 'front' ? hero : `${hero}-${direction}`;
export const facingAsset = (hero: CompanionId, dx: number, dy: number) => actorAsset(hero, Math.abs(dx)>=Math.abs(dy)&&dx!==0?(dx<0?'left':'right'):dy<0?'back':'front');
export const PLAYABLE_ACTORS = COMPANION_IDS.flatMap(hero => ACTOR_DIRECTIONS.map(direction => actorAsset(hero, direction)));
/** World-only stature; native review frames and combat boss bodies stay intact. */
export const worldActorScaleY=(sprite:string)=>sprite==='boiler-keeper'?1.35:1;
