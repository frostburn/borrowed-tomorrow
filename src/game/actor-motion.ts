import type Phaser from 'phaser';
import { animatedHero, ATTACK_DURATION_MS, directionOf, motionFrame, motionPage, type ActorMotion, type MotionHero } from '../content/actor-motion';

type Image = Phaser.GameObjects.Image;
interface Playback { hero:MotionHero;face:string;motion:ActorMotion;start:number;until:number }

/** Texture frames keep the actor's native size, origin, position and depth. */
export class ActorAnimator {
  private actors=new Map<Image,Playback>();
  private reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  constructor(private scene:Phaser.Scene){}
  get active(){return this.actors.size>0;}
  walk(image:Image,face:string,duration:number){
    const hero=face.split('-')[0];image.setData('actor-base',hero).setData('actor-face',face);
    if(!animatedHero(hero)||this.reduced.matches){this.stop(image);image.setTexture(face);return;}
    const now=this.scene.time.now,old=this.actors.get(image);
    // Adjacent movement tweens share a gait instead of restarting on every cell.
    this.actors.set(image,{hero,face,motion:'walk',start:old?.motion==='walk'&&old.until>=now?old.start:now,until:now+duration+40});
    this.paint(image,this.actors.get(image)!);
  }
  attack(image:Image,face:string,elapsed=0){
    const hero=face.split('-')[0];image.setData('actor-base',hero).setData('actor-face',face);
    if(!animatedHero(hero)||this.reduced.matches){this.stop(image);image.setTexture(face);return;}
    const now=this.scene.time.now,state:Playback={hero,face,motion:'attack',start:now-elapsed,until:now+ATTACK_DURATION_MS-elapsed};
    this.actors.set(image,state);this.paint(image,state);
  }
  stop(image:Image){
    const state=this.actors.get(image);if(image.active){if(state)image.setTexture(state.face);image.setData('actor-motion','idle');}
    this.actors.delete(image);
  }
  clear(){for(const image of this.actors.keys())this.stop(image);}
  update(){
    for(const [image,state] of this.actors){
      if(!image.active){this.actors.delete(image);continue;}
      if(this.reduced.matches||this.scene.time.now>=state.until)this.stop(image);else this.paint(image,state);
    }
  }
  private paint(image:Image,state:Playback){
    const frame=motionFrame(state.motion,this.scene.time.now-state.start);
    if(frame===undefined)image.setTexture(state.face);
    else image.setTexture(motionPage(state.hero,directionOf(state.face)).key,frame);
    image.setData('actor-motion',state.motion);
  }
}
