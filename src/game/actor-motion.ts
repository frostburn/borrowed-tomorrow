import type Phaser from 'phaser';
import { animatedHero, walkingHero, ATTACK_DURATION_MS, directionOf, motionFrame, motionPage, walkFrameDistance, WALK_FRAME_MS, type ActorMotion, type MotionHero } from '../content/actor-motion';
import { actorPresentation } from '../content/actors';

type Image = Phaser.GameObjects.Image;
export const presentActor = (image:Image,asset:string) => {
  const fit=actorPresentation(asset);
  return image.setOrigin(.5,fit.originY).setScale(fit.scale);
};
interface Playback { hero:MotionHero;face:string;motion:ActorMotion;start:number;until:number;distance:number;x:number;y:number }

/** Texture frames keep the actor's native size, origin, position and depth. */
export class ActorAnimator {
  private actors=new Map<Image,Playback>();
  private reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  constructor(private scene:Phaser.Scene){}
  get active(){return this.actors.size>0;}
  walk(image:Image,face:string,duration:number){
    const hero=face.split('-')[0];image.setData('actor-base',hero).setData('actor-face',face);
    if(!walkingHero(hero)||this.reduced.matches){this.stop(image);image.setTexture(face);return;}
    const now=this.scene.time.now,old=this.actors.get(image);
    // Carry stride distance through cell boundaries and turns. A planted foot then
    // moves back relative to the body at the same speed the body travels forward.
    const continuing=old?.motion==='walk'&&old.until>=now;
    const distance=continuing?old.distance+Math.hypot(image.x-old.x,image.y-old.y):0;
    this.actors.set(image,{hero,face,motion:'walk',start:now,until:now+duration+40,distance,x:image.x,y:image.y});
    this.paint(image,this.actors.get(image)!);
  }
  attack(image:Image,face:string,elapsed=0,motion:'attack'|'bash'='attack'){
    const hero=face.split('-')[0];image.setData('actor-base',hero).setData('actor-face',face);
    if(!animatedHero(hero)||this.reduced.matches){this.stop(image);image.setTexture(face);return;}
    const now=this.scene.time.now,state:Playback={hero,face,motion,start:now-elapsed,until:now+ATTACK_DURATION_MS-elapsed,distance:0,x:image.x,y:image.y};
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
    if(state.motion==='walk'){
      state.distance+=Math.hypot(image.x-state.x,image.y-state.y);state.x=image.x;state.y=image.y;
    }
    const elapsed=state.motion==='walk'&&walkingHero(state.hero)?state.distance/walkFrameDistance(state.hero)*WALK_FRAME_MS:this.scene.time.now-state.start;
    const frame=motionFrame(state.motion,elapsed,state.hero);
    if(frame===undefined)image.setTexture(state.face);
    else image.setTexture(motionPage(state.hero,directionOf(state.face)).key,frame);
    image.setData('actor-motion',state.motion);
  }
}
