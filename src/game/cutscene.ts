import Phaser from 'phaser';
import { CHARACTERS } from '../content/characters';
import type { Cinematic, Shot, StagePoint } from '../content/cinematics';
import type { Audio } from './audio';

const pixel=(p:StagePoint)=>({x:Math.round((p.x+.5)*24),y:Math.round((p.y+.5)*24)+7});

/** Temporary staging never changes party positions, resources, or story flags. */
export class Cutscene {
  private layer:Phaser.GameObjects.Container;
  private actors=new Map<string,Phaser.GameObjects.Image>();
  private hidden:Phaser.GameObjects.Image[]=[];
  private focus?:StagePoint;
  private closed=false;
  private duration=window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:450;
  constructor(private scene:Phaser.Scene,world:Phaser.GameObjects.Container,readonly script:Cinematic,private audio:Audio){
    const sprites=new Set<string>(script.actors.map(a=>CHARACTERS[a.id].sprite));
    for(const child of world.list)if(child instanceof Phaser.GameObjects.Image&&child.visible){
      const name=child.texture.key.replace(/-(left|right|back)$/,'');
      if(sprites.has(name)||name.startsWith('label-')){child.setVisible(false);this.hidden.push(child);}
    }
    this.layer=scene.add.container(0,0);
    for(const actor of script.actors){
      const p=pixel(actor.at),image=scene.add.image(p.x,p.y,actor.face??CHARACTERS[actor.id].sprite).setOrigin(.5,.85).setVisible(!actor.hidden);
      this.layer.add(image);this.actors.set(actor.id,image);
    }
    scene.cameras.main.stopFollow();scene.cameras.main.roundPixels=true;audio.cinematicMix(.25);
  }
  get animating(){return !this.closed&&this.scene.cameras.main.panEffect.isRunning;}
  shot(shot?:Shot){
    if(this.closed||!shot)return;
    const camera=this.scene.cameras.main;camera.panEffect.reset();
    if(this.focus){const p=pixel(this.focus);camera.centerOn(p.x,p.y);}
    for(const actor of this.actors.values()){
      this.scene.tweens.killTweensOf(actor);const to=actor.getData('destination') as StagePoint|undefined;
      if(to){actor.setPosition(to.x,to.y);actor.setData('destination',undefined);}
    }
    if(shot.focus){
      this.focus=shot.focus;const p=pixel(shot.focus);
      if(shot.cut||!this.duration)camera.centerOn(p.x,p.y);else camera.pan(p.x,p.y,this.duration,'Sine.easeInOut',true);
    }
    for(const [id,direction] of Object.entries(shot.actors??{})){
      const actor=this.actors.get(id);if(!actor||!direction)continue;
      if(direction.face)actor.setTexture(direction.face);
      if(direction.visible!==undefined)actor.setVisible(direction.visible);
      if(direction.at){const p=pixel(direction.at);actor.setPosition(p.x,p.y);}
      if(direction.to){const p=pixel(direction.to);actor.setData('destination',p);this.scene.tweens.add({targets:actor,x:p.x,y:p.y,duration:this.duration,ease:'Sine.easeInOut'});}
    }
    this.audio.cinematicMix(shot.silence?0:.25);if(shot.cue)this.audio.effect(shot.cue);
  }
  reframe(){if(this.focus){const p=pixel(this.focus);this.scene.cameras.main.panEffect.reset();this.scene.cameras.main.centerOn(p.x,p.y);}}
  close(){
    if(this.closed)return;this.closed=true;
    for(const actor of this.actors.values())this.scene.tweens.killTweensOf(actor);
    this.scene.cameras.main.panEffect.reset();this.layer.destroy(true);
    for(const image of this.hidden)if(image.active)image.setVisible(true);
    this.audio.cinematicMix(1);
  }
}
