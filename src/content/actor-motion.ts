import { ACTOR_DIRECTIONS, type ActorDirection } from './actors';

export const MOTION_HEROES = ['nell','orrin'] as const;
export type MotionHero = typeof MOTION_HEROES[number];
export type ActorMotion = 'idle' | 'walk' | 'attack';
export const WALK_FRAME_MS = 130;
export const ATTACK_CONTACT_MS = 140;
export const ATTACK_DURATION_MS = 380;
export const animatedHero = (hero:string):hero is MotionHero => MOTION_HEROES.some(id=>id===hero);
export const motionPage = (hero:MotionHero,direction:ActorDirection) => ({key:`${hero}-motion-${direction}`,asset:`animation/${hero}-${direction}`});
export const MOTION_PAGES = MOTION_HEROES.flatMap(hero=>ACTOR_DIRECTIONS.map(direction=>motionPage(hero,direction)));
export const directionOf = (face:string):ActorDirection => ACTOR_DIRECTIONS.find(direction=>face.endsWith(`-${direction}`))??'front';
export const motionFrame = (motion:ActorMotion,elapsed:number):number|undefined => motion==='walk'?Math.floor(Math.max(0,elapsed)/WALK_FRAME_MS)%2:motion==='attack'?(elapsed<ATTACK_CONTACT_MS?2:elapsed<280?3:undefined):undefined;
