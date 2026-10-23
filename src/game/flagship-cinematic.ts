import Phaser from 'phaser';
import { nativeTexture } from './boss-display';

/** A temporary approach on the survey deck. It never moves campaign actors. */
export class FlagshipCinematic {
 private craft:Phaser.GameObjects.Container;
 private escorts:Phaser.GameObjects.Graphics;
 private started?:number;
 private closed=false;
 private reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 constructor(private scene:Phaser.Scene,world:Phaser.GameObjects.Container){
  this.craft=scene.add.container(0,0).setDepth(-996).setVisible(false);world.add(this.craft);
  for(const [key,x,y]of [['hull',0,0],['port',160,125],['starboard',600,125],['bridge',364,-30]]as const){
   nativeTexture(scene,`flagship-${key}`);
   this.craft.add(scene.add.image(x,y,`flagship-${key}`).setOrigin(0));
  }
  this.escorts=scene.add.graphics().setDepth(-995).setVisible(false);world.add(this.escorts);
  scene.events.on(Phaser.Scenes.Events.UPDATE,this.update);
 }
 play(){this.started=this.scene.time.now;this.craft.setVisible(true);this.escorts.setVisible(true);this.update();}
 private update=()=>{
  if(this.closed||this.started===undefined)return;
  const p=this.reduced?1:Math.min(1,(this.scene.time.now-this.started)/2200),ease=p*p*(3-2*p);
  this.craft.setPosition(560-185*ease,190-100*ease).setScale(.27+.57*ease);
  this.escorts.clear();
  for(const [x,y]of [[520+80*ease,346-32*ease],[1070-70*ease,360-24*ease]]){
   this.escorts.fillStyle(0x284551).fillPoints([[x,y],[x+33,y-9],[x+101,y-7],[x+128,y+6],[x+89,y+19],[x+32,y+16]].map(([x,y])=>new Phaser.Math.Vector2(x,y)),true);
   this.escorts.lineStyle(3,0xbca574).lineBetween(x+36,y+20,x+91,y+20);
   this.escorts.fillStyle(0xe5d6a5).fillRect(x+57,y+4,6,5);
  }
 };
 get animating(){return !this.closed&&!this.reduced&&this.started!==undefined&&this.scene.time.now-this.started<2300;}
 close(){if(this.closed)return;this.closed=true;this.scene.events.off(Phaser.Scenes.Events.UPDATE,this.update);this.craft.destroy(true);this.escorts.destroy();}
}
