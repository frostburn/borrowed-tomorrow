import Phaser from 'phaser';
import {nellLanternLens} from '../content/actor-motion';

/** A lens-centered flare, never an omen floating over Nell's torso. */
export class LanternGlint{
 private light:Phaser.GameObjects.Graphics;
 private started?:number;
 private reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 private closed=false;
 constructor(private scene:Phaser.Scene,world:Phaser.GameObjects.Container,private actor?:Phaser.GameObjects.Image){
  this.light=scene.add.graphics().setDepth(30001).setVisible(false).setData('lantern-glint',true);world.add(this.light);
  scene.events.on(Phaser.Scenes.Events.UPDATE,this.update);
 }
 play(){if(this.closed||!this.actor?.active)return;this.started=this.scene.time.now;this.update();}
 stop(){this.started=undefined;this.light.clear().setVisible(false);}
 private update=()=>{
  if(this.closed||this.started===undefined)return;
  const actor=this.actor!;if(!actor.active||!actor.visible){this.light.clear().setVisible(false);return;}
  const lens=nellLanternLens(String(actor.getData('actor-face')??actor.texture.key),actor.getData('actor-motion')==='walk'?Number(actor.frame.name):undefined);
  const x=Math.round((actor.x+(lens.x-actor.displayOriginX)*actor.scaleX)/2)*2;
  const y=Math.round((actor.y+(lens.y-actor.displayOriginY)*actor.scaleY)/2)*2;
  const t=(this.scene.time.now-this.started)%2400;
  const pulse=this.reduced.matches?.55:Math.pow(Math.max(0,Math.sin(Math.PI*t/1200)),6);
  const g=this.light;g.setVisible(true).clear();
  g.fillStyle(0xa3e0d9,.04+.08*pulse).fillRect(x-8,y-8,18,18);
  g.fillStyle(0xa3e0d9,.12+.18*pulse).fillRect(x-4,y-4,10,10);
  if(pulse>.25){
   g.fillStyle(0xc1eee4,.2+.3*pulse).fillRect(x-12,y,26,2).fillRect(x,y-12,2,26);
   g.fillStyle(0xc1eee4,.3+.4*pulse).fillRect(x-6,y-2,14,6).fillRect(x-2,y-6,6,14);
   g.fillStyle(0xc1eee4,.15+.25*pulse).fillRect(x-6,y-6,2,2).fillRect(x+6,y+6,2,2);
  }
  g.fillStyle(0xf7efc4,.45+.55*pulse).fillRect(x-2,y-2,6,6);
 };
 get animating(){return !this.closed&&this.started!==undefined&&!this.reduced.matches;}
 close(){if(this.closed)return;this.closed=true;this.scene.events.off(Phaser.Scenes.Events.UPDATE,this.update);this.light.destroy();}
}
