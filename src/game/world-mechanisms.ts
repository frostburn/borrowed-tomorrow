import Phaser from 'phaser';
import { NAMAR_CLOCK_FRAMES } from '../content/cinematic-art';

/** Native mechanism poses run on scene time, including with a parked cursor. */
export class WorldMechanisms {
 private clock?:Phaser.GameObjects.Image;
 private paint=()=>{
  if(!this.clock?.active)return;
  const frame=window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:Math.floor(this.scene.time.now/400)%NAMAR_CLOCK_FRAMES.length;
  const key=NAMAR_CLOCK_FRAMES[frame];if(this.clock.texture.key!==key)this.clock.setTexture(key);
 };
 constructor(private scene:Phaser.Scene,world:Phaser.GameObjects.Container){
  this.clock=world.list.find((o):o is Phaser.GameObjects.Image=>o instanceof Phaser.GameObjects.Image&&o.getData('scene-piece')?.key==='scene-six-namar-clock');
  if(this.clock){scene.events.on(Phaser.Scenes.Events.UPDATE,this.paint);this.paint();}
 }
 get animating(){return !!this.clock?.active&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches;}
 close(){this.scene.events.off(Phaser.Scenes.Events.UPDATE,this.paint);this.clock=undefined;}
}
