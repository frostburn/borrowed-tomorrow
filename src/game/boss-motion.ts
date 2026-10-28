import Phaser from 'phaser';

export const BOSS_IDLE_FRAMES=8;
export const BOSS_BREATH_MS=3200;
export const BOSS_HEARTBEAT_MS=1200;
export const BOSS_ATTACK_CONTACT=420;
export const BOSS_ATTACK_DURATION=920;
export const BOSS_FRAME_COUNT=12;
const attacks=new WeakMap<Phaser.GameObjects.Image,number>();
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
export const bossMotionEnabled=()=>!reduced.matches;

export function bossMotionFrame(now:number,started?:number,cycleMs=BOSS_BREATH_MS){
  const elapsed=started===undefined?BOSS_ATTACK_DURATION:now-started;
  return elapsed<BOSS_ATTACK_DURATION?elapsed<220?8:elapsed<BOSS_ATTACK_CONTACT?9:elapsed<660?10:11:Math.floor(now/(cycleMs/BOSS_IDLE_FRAMES))%BOSS_IDLE_FRAMES;
}

/** Each sprite owns its update listener; scene redraws destroy it immediately. */
export function animateBoss(scene:Phaser.Scene,image:Phaser.GameObjects.Image,alive:boolean,onFrame:(frame:number)=>void,idle:{motion:'breathe'|'mechanical'|'heartbeat';cycleMs:number}={motion:'breathe',cycleMs:BOSS_BREATH_MS}){
  const paint=()=>{
    const frame=alive&&!reduced.matches?bossMotionFrame(scene.time.now,attacks.get(image),idle.cycleMs):0;
    image.setFrame(frame).setData('actor-motion',frame>=BOSS_IDLE_FRAMES?'attack':alive&&!reduced.matches?idle.motion:'idle');
    onFrame(frame);
  };
  scene.events.on(Phaser.Scenes.Events.UPDATE,paint);
  image.once(Phaser.GameObjects.Events.DESTROY,()=>scene.events.off(Phaser.Scenes.Events.UPDATE,paint));
  image.setData('boss-paint',paint);paint();
}

export function bossAttack(scene:Phaser.Scene,image:Phaser.GameObjects.Image,elapsed:number){
  attacks.set(image,scene.time.now-elapsed);
  (image.getData('boss-paint') as ()=>void)();
}
