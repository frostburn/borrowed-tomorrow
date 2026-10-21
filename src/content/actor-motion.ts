import { ACTOR_DIRECTIONS, type ActorDirection } from './actors';

export const MOTION_HEROES = ['nell','orrin','kit','petra','celia'] as const;
export type MotionHero = typeof MOTION_HEROES[number];
export type ActorMotion = 'idle' | 'walk' | 'attack' | 'bash';
export const WALK_PHASES = ['Left contact','Left support','Right passing','Right contact','Right support','Left passing'] as const;
export const WALK_FRAMES = WALK_PHASES.length;
export const WALK_FRAME_MS = 80;
export const WALK_CYCLE_MS = WALK_FRAMES * WALK_FRAME_MS;
// Match the authored heel/toe contacts for each character's rig.
export const WALK_STRIDE_DISTANCE = {nell:24,orrin:28,kit:26,petra:24,celia:24} as const;
export const walkFrameDistance = (hero:MotionHero) => WALK_STRIDE_DISTANCE[hero]/WALK_FRAMES;
export const ATTACK_WINDUP_FRAME = WALK_FRAMES;
export const ATTACK_CONTACT_FRAME = WALK_FRAMES + 1;
export const BASH_WINDUP_FRAME = WALK_FRAMES + 2;
export const BASH_CONTACT_FRAME = WALK_FRAMES + 3;
export const ATTACK_CONTACT_MS = 140;
export const ATTACK_DURATION_MS = 380;
export const walkingHero = (hero:string):hero is MotionHero => MOTION_HEROES.some(id=>id===hero);
export const animatedHero = (hero:string):hero is MotionHero => hero!=='celia'&&walkingHero(hero);
export const NELL_ATTACK_TIMES = [0, ATTACK_CONTACT_MS, 220, 300] as const;
export const motionPage = (hero:MotionHero,direction:ActorDirection) => ({key:`${hero}-motion-${direction}`,asset:`animation/${hero}-${direction}`,frames:hero==='celia'?6:hero==='nell'?9:hero==='petra'?10:8});
export const MOTION_PAGES = MOTION_HEROES.flatMap(hero=>ACTOR_DIRECTIONS.map(direction=>motionPage(hero,direction)));
export const directionOf = (face:string):ActorDirection => ACTOR_DIRECTIONS.find(direction=>face.endsWith(`-${direction}`))??'front';
export const motionFrame = (motion:ActorMotion,elapsed:number,hero?:string):number|undefined => {
  if(hero==='celia'&&motion!=='walk')return undefined;
  if(hero==='nell'&&motion==='attack'){
    if(elapsed>=NELL_ATTACK_TIMES[3])return undefined;
    return WALK_FRAMES+(elapsed<NELL_ATTACK_TIMES[1]?0:elapsed<NELL_ATTACK_TIMES[2]?1:2);
  }
  return motion==='walk'?Math.floor(Math.max(0,elapsed)/WALK_FRAME_MS)%WALK_FRAMES:motion==='attack'||motion==='bash'?(elapsed<ATTACK_CONTACT_MS?(motion==='bash'?BASH_WINDUP_FRAME:ATTACK_WINDUP_FRAME):elapsed<280?(motion==='bash'?BASH_CONTACT_FRAME:ATTACK_CONTACT_FRAME):undefined):undefined;
};
