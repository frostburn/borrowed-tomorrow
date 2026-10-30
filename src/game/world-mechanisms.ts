import Phaser from 'phaser';
import type {GameState} from '../rules/state';
import {MECHANISM_SHEETS,mechanismPoseForPiece} from '../content/story-mechanisms';
import {mechanismFrame} from './mechanism-cinematic';
import { NAMAR_CLOCK_FRAMES,COURT_FOUNTAIN_FRAMES } from '../content/cinematic-art';

/** Native mechanism poses run on scene time, including with a parked cursor. */
export class WorldMechanisms {
 private mechanisms:{image:Phaser.GameObjects.Image;frames:string[];interval:number}[]=[];
 private paint=()=>{
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  for(const {image,frames,interval}of this.mechanisms){
   if(!image.active)continue;
   const key=frames[reduced?0:Math.floor(this.scene.time.now/interval)%frames.length];
   if(image.texture.key!==key)image.setTexture(key);
  }
 };
 constructor(private scene:Phaser.Scene,world:Phaser.GameObjects.Container,state:Pick<GameState,'flags'>){
  for(const d of Object.values(MECHANISM_SHEETS)){
   const image=world.list.find((o):o is Phaser.GameObjects.Image=>o instanceof Phaser.GameObjects.Image&&o.getData('scene-piece')?.key===d.target);
   if(image){const pose=mechanismPoseForPiece(d.target,state.flags)!,f=mechanismFrame(scene,pose.name,pose.frame);image.setTexture(f.key,f.frame);}
  }
  for(const [frames,interval]of [[NAMAR_CLOCK_FRAMES,400],[COURT_FOUNTAIN_FRAMES,140]]as const){
   const image=world.list.find((o):o is Phaser.GameObjects.Image=>o instanceof Phaser.GameObjects.Image&&o.getData('scene-piece')?.key===frames[0]);
   if(image)this.mechanisms.push({image,frames,interval});
  }
  if(this.mechanisms.length){scene.events.on(Phaser.Scenes.Events.UPDATE,this.paint);this.paint();}
 }
 get animating(){return this.mechanisms.some(m=>m.image.active)&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches;}
 close(){this.scene.events.off(Phaser.Scenes.Events.UPDATE,this.paint);this.mechanisms=[];}
}
