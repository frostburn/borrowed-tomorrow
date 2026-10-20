import { ACTOR_DIRECTIONS, type ActorDirection } from './actors';

export const MOTION_HEROES = ['nell','orrin'] as const;
export type MotionHero = typeof MOTION_HEROES[number];
export type ActorMotion = 'idle' | 'walk' | 'attack';
export const WALK_PHASES = ['Left contact','Left support','Right passing','Right contact','Right support','Left passing'] as const;
export const WALK_FRAMES = WALK_PHASES.length;
export const WALK_FRAME_MS = 80;
export const WALK_CYCLE_MS = WALK_FRAMES * WALK_FRAME_MS;
// Nell's rig advances 24 pixels per stride; Orrin retains his existing 60-pixel walk.
export const WALK_STRIDE_DISTANCE = {nell:24,orrin:60} as const;
export const walkFrameDistance = (hero:MotionHero) => WALK_STRIDE_DISTANCE[hero]/WALK_FRAMES;
export const ATTACK_WINDUP_FRAME = WALK_FRAMES;
export const ATTACK_CONTACT_FRAME = WALK_FRAMES + 1;
export const ATTACK_CONTACT_MS = 140;
export const ATTACK_DURATION_MS = 380;
export const animatedHero = (hero:string):hero is MotionHero => MOTION_HEROES.some(id=>id===hero);
export const motionPage = (hero:MotionHero,direction:ActorDirection) => ({key:`${hero}-motion-${direction}`,asset:`animation/${hero}-${direction}`});
export const MOTION_PAGES = MOTION_HEROES.flatMap(hero=>ACTOR_DIRECTIONS.map(direction=>motionPage(hero,direction)));
export const directionOf = (face:string):ActorDirection => ACTOR_DIRECTIONS.find(direction=>face.endsWith(`-${direction}`))??'front';
export const motionFrame = (motion:ActorMotion,elapsed:number):number|undefined => motion==='walk'?Math.floor(Math.max(0,elapsed)/WALK_FRAME_MS)%WALK_FRAMES:motion==='attack'?(elapsed<ATTACK_CONTACT_MS?ATTACK_WINDUP_FRAME:elapsed<280?ATTACK_CONTACT_FRAME:undefined):undefined;
