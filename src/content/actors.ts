import { COMPANION_IDS, type CompanionId } from '../rules/party';

export const ACTOR_DIRECTIONS = ['front', 'left', 'right', 'back'] as const;
export type ActorDirection = typeof ACTOR_DIRECTIONS[number];
export const ACTOR_SIZE = 80;
export const ACTOR_FEET = 68;
// Curated Nell frames retain their native pixels and a lower sole line.
// Fit the 74px figure to the cast's 63px standing height without resampling files.
export const actorPresentation = (asset: string) => asset.split('-')[0] === 'nell'
  ? { originY: 78 / ACTOR_SIZE, scale: 63 / 74, feet: 78 }
  : { originY: ACTOR_FEET / ACTOR_SIZE, scale: 1, feet: ACTOR_FEET };
export const actorAsset = (hero: CompanionId, direction: ActorDirection = 'front') => direction === 'front' ? hero : `${hero}-${direction}`;
export const facingAsset = (hero: CompanionId, dx: number, dy: number) => actorAsset(hero, Math.abs(dx)>=Math.abs(dy)&&dx!==0?(dx<0?'left':'right'):dy<0?'back':'front');
export const PLAYABLE_ACTORS = COMPANION_IDS.flatMap(hero => ACTOR_DIRECTIONS.map(direction => actorAsset(hero, direction)));
