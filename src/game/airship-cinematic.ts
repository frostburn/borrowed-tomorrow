import Phaser from 'phaser';
import { arrival } from '../content/maps';
import { facingAsset } from '../content/actors';
import { walkingHero } from '../content/actor-motion';
import type { ActorAnimator } from './actor-motion';
/** Temporary boarding and takeoff transforms, with no campaign writes. */
export class AirshipCinematic {
 private targets:{image:Phaser.GameObjects.Image;x:number;y:number;alpha:number}[]=[];
 private cast:Phaser.GameObjects.Image[];
 private entry:{x:number;y:number};
 private started?:number;
 private closed=false;
 private ramp?:Phaser.GameObjects.Image;
 private rampAlpha=1;
 private reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 constructor(private scene:Phaser.Scene,world:Phaser.GameObjects.Container,actors:ReadonlyMap<string,Phaser.GameObjects.Image>,private motion:ActorAnimator){
  const ship=world.list.find(o=>o instanceof Phaser.GameObjects.Image&&o.texture.key==='scene-five-survey-ship') as Phaser.GameObjects.Image|undefined;
  this.ramp=world.list.find(o=>o instanceof Phaser.GameObjects.Image&&o.texture.key==='scene-five-airfield-gangway') as Phaser.GameObjects.Image|undefined;
  this.rampAlpha=this.ramp?.alpha??1;
  this.cast=['nell','orrin','kit','petra','celia','alda'].map(id=>actors.get(id)).filter((a):a is Phaser.GameObjects.Image=>!!a);
  const cabin=arrival('airfield','cabin');this.entry={x:(cabin.x+.5)*24,y:(cabin.y+.5)*24+7};
  this.targets=[...(ship?[ship]:[]),...this.cast].map(image=>({image,x:image.x,y:image.y,alpha:image.alpha}));
 }
 board(){
  for(const [i,image]of this.cast.entries()){
   image.setData('destination',this.entry);
   if(this.reduced){image.setPosition(this.entry.x,this.entry.y).setAlpha(0);continue;}
   this.scene.tweens.add({targets:image,x:this.entry.x,y:this.entry.y,delay:i*180,duration:1000,ease:'Linear',
    onStart:()=>{if(!image.active||this.closed)return;const hero=String(image.getData('hero'));if(walkingHero(hero))this.motion.walk(image,facingAsset(hero,this.entry.x-image.x,this.entry.y-image.y),1000);},
    onComplete:()=>{if(!image.active||this.closed)return;this.motion.stop(image);image.setAlpha(0);image.setData('destination',undefined);}});
  }
 }
 private update=()=>{
  if(this.closed||this.started===undefined)return;
  const p=this.reduced?1:Math.min(1,(this.scene.time.now-this.started)/1800),lift=86*p*p*(3-2*p);
  for(const {image,x,y}of this.targets)if(image.active)image.setPosition(x+Math.round(12*p),y-Math.round(lift));
  if(p===1)this.scene.events.off(Phaser.Scenes.Events.UPDATE,this.update);
 };
 get animating(){return !this.closed&&this.started!==undefined&&!this.reduced&&this.scene.time.now<this.started+1800;}
 play(){
  if(this.started!==undefined)return;
  this.ramp?.setAlpha(0);
  // Fast advance finishes boarding before departure. Passengers are inside
  // the closed cabin, rather than standing in an overlapping pile on its hull.
  for(const image of this.cast){this.scene.tweens.killTweensOf(image);this.motion.stop(image);image.setPosition(this.entry.x,this.entry.y).setAlpha(0);image.setData('destination',undefined);}
  this.targets=this.targets.map(t=>({...t,x:t.image.x,y:t.image.y}));this.started=this.scene.time.now;
  this.scene.events.on(Phaser.Scenes.Events.UPDATE,this.update);this.update();
 }
 close(){
  if(this.closed)return;this.closed=true;this.scene.events.off(Phaser.Scenes.Events.UPDATE,this.update);
  if(this.ramp?.active)this.ramp.setAlpha(this.rampAlpha);
  for(const {image,x,y,alpha}of this.targets)if(image.active){this.scene.tweens.killTweensOf(image);image.setPosition(x,y).setAlpha(alpha);}
 }
}
