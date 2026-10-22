import { AirshipCinematic } from './airship-cinematic';
import Phaser from 'phaser';
import { CHARACTERS } from '../content/characters';
import type { Cinematic, Shot, StagePoint } from '../content/cinematics';
import type { Audio } from './audio';
import type { ActorAnimator } from './actor-motion';
import { walkingHero } from '../content/actor-motion';
import { facingAsset } from '../content/actors';
import { EMPEROR_WALK } from '../content/cinematic-art';
import { ConduitCinematic } from './conduit-cinematic';

const pixel=(p:StagePoint)=>({x:Math.round((p.x+.5)*24),y:Math.round((p.y+.5)*24)+7});

/** Temporary staging never changes party positions, resources, or story flags. */
export class Cutscene {
  private layer:Phaser.GameObjects.Container;
  private actors=new Map<string,Phaser.GameObjects.Image>();
  private hidden:Phaser.GameObjects.Image[]=[];
  private focus?:StagePoint;
  private omen?:Phaser.GameObjects.Graphics;
  private closed=false;
  private effects?:ConduitCinematic;
  private launch?:AirshipCinematic;
  private tracked?:Phaser.GameObjects.Image;
  private duration=window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:450;
  constructor(private scene:Phaser.Scene,world:Phaser.GameObjects.Container,readonly script:Cinematic,private audio:Audio,private motion:ActorAnimator){
    const sprites=new Set<string>(script.actors.map(a=>CHARACTERS[a.id].sprite));
    for(const child of world.list)if(child instanceof Phaser.GameObjects.Image&&child.visible){
      const name=child.getData('hero')??child.texture.key.replace(/-(left|right|back)$/,'');
      if(sprites.has(name)||name.startsWith('label-')){child.setVisible(false);this.hidden.push(child);}
    }
    this.layer=scene.add.container(0,0).setDepth(30000);world.add(this.layer);
    for(const actor of script.actors){
      const p=pixel(actor.at),image=scene.add.image(p.x,p.y,actor.face??CHARACTERS[actor.id].sprite).setOrigin(.5,.85).setVisible(!actor.hidden).setData('world-actor',true).setDepth(p.y);
      image.setData('hero',CHARACTERS[actor.id].sprite);world.add(image);this.actors.set(actor.id,image);
    }
    if(script.id==='five-launch')this.launch=new AirshipCinematic(scene,world,this.actors.values());
    if(script.id==='three-rupture')this.effects=new ConduitCinematic(scene,world,this.layer,this.actors.get('emperor'));
    world.sort('depth');scene.cameras.main.stopFollow();scene.cameras.main.roundPixels=false;audio.cinematicMix(.25);
  }
  get animating(){return !this.closed&&(this.scene.cameras.main.panEffect.isRunning||!!this.effects?.animating||!!this.launch?.animating);}
  shot(shot?:Shot){
    if(this.closed||!shot)return;
    const duration=this.duration?(shot.duration??this.duration):0;
    const camera=this.scene.cameras.main;camera.stopFollow();camera.panEffect.reset();
    if(this.tracked?.active)camera.centerOn(this.tracked.x,this.tracked.y);
    else if(this.focus){const p=pixel(this.focus);camera.centerOn(p.x,p.y);}
    this.tracked=undefined;
    for(const actor of this.actors.values()){
      this.motion.stop(actor);
      this.scene.tweens.killTweensOf(actor);const to=actor.getData('destination') as StagePoint|undefined;
      if(to){actor.setPosition(to.x,to.y);actor.setData('destination',undefined);const idle=actor.getData('cinematic-idle');if(idle)actor.setTexture(idle);}
    }
    if(shot.focus){
      this.focus=shot.focus;const p=pixel(shot.focus);
      if(shot.cut||!duration)camera.centerOn(p.x,p.y);else camera.pan(p.x,p.y,duration,'Sine.easeInOut',true);
    }
    for(const [id,direction] of Object.entries(shot.actors??{})){
      const actor=this.actors.get(id);if(!actor||!direction)continue;
      if(direction.face)actor.setTexture(direction.face);
      if(direction.visible!==undefined)actor.setVisible(direction.visible);
      if(direction.at){const p=pixel(direction.at);actor.setPosition(p.x,p.y);}
      if(direction.fallen){actor.setOrigin(.5,.5).setAngle(90).setY(actor.y-10);}
      if(direction.to){const p=pixel(direction.to),hero=CHARACTERS[id as keyof typeof CHARACTERS].sprite;actor.setData('destination',p);
        if(walkingHero(hero))this.motion.walk(actor,direction.face??facingAsset(hero,p.x-actor.x,p.y-actor.y),duration);
        const emperor=hero==='emperor'&&this.scene.textures.exists(EMPEROR_WALK[0]),start={x:actor.x,y:actor.y};
        if(emperor)actor.setData('cinematic-idle','emperor-left');
        this.scene.tweens.add({targets:actor,x:p.x,y:p.y,duration,ease:'Sine.easeInOut',
          onUpdate:()=>{if(emperor&&duration)actor.setTexture(EMPEROR_WALK[Math.floor(Math.hypot(actor.x-start.x,actor.y-start.y)/7)%EMPEROR_WALK.length]);},
          onComplete:()=>{if(emperor&&actor.active)actor.setTexture('emperor-left');}});}
    }
    if(shot.track){this.tracked=this.actors.get(shot.track);if(this.tracked)camera.startFollow(this.tracked,false,1,1);}
    if(shot.effect==='fleet-sighting')this.layer.add(this.scene.add.image(0,0,'scene-five-ship-fleet').setOrigin(0));else if(shot.effect==='survey-launch')this.launch?.play();else if(shot.effect)this.effects?.play(shot.effect);
    if(shot.omen){
      this.omen?.destroy();this.omen=undefined;
      if(shot.omen!=='none'){
        const g=this.scene.add.graphics();this.omen=g;this.layer.add(g);
        if(shot.omen==='sun'){
          const center=this.focus?pixel(this.focus):{x:camera.midPoint.x,y:camera.midPoint.y};
          const radius=Math.min(104,Math.floor(camera.width/3)),x=center.x,y=center.y;
          g.fillStyle(0x07151d,1).fillRect(0,0,2048,1536);
          g.lineStyle(4,0xe5bd73,1).strokeCircle(x,y,radius);
          for(let ray=0;ray<12;ray++){
            const angle=ray*Math.PI/6;
            g.lineBetween(Math.round(x+Math.cos(angle)*(radius+9)),Math.round(y+Math.sin(angle)*(radius+9)),Math.round(x+Math.cos(angle)*(radius+25)),Math.round(y+Math.sin(angle)*(radius+25)));
          }
          g.lineStyle(3,0xf2e2af,1);g.lineBetween(x-radius+20,y,x,y-25).lineBetween(x,y-25,x+radius-20,y).lineBetween(x+radius-20,y,x,y+25).lineBetween(x,y+25,x-radius+20,y);
          g.fillStyle(0xf2e2af,1).fillRect(x-5,y-19,10,38);
        }else{
          const actor=this.actors.get('nell'),x=Math.round(actor?.x??camera.midPoint.x),y=Math.round((actor?.y??camera.midPoint.y)-28);
          g.lineStyle(2,0x98e8ef,1).strokeCircle(x,y,23);
          g.fillStyle(0xf8f0c8,1).fillRect(x-3,y-14,6,28).fillRect(x-14,y-3,28,6);
          for(const [dx,dy] of [[-29,-15],[24,-23],[-22,24],[32,17]])g.fillRect(x+dx,y+dy,3,3);
        }
      }
    }
    this.audio.cinematicMix(shot.silence?0:.25);if(shot.cue)this.audio.effect(shot.cue);
  }
  reframe(){const p=this.tracked?.active?this.tracked:this.focus?pixel(this.focus):undefined;if(p){this.scene.cameras.main.panEffect.reset();this.scene.cameras.main.centerOn(p.x,p.y);}}
  close(){
    if(this.closed)return;this.closed=true;this.effects?.close();this.launch?.close();this.scene.cameras.main.stopFollow();
    for(const actor of this.actors.values()){this.motion.stop(actor);this.scene.tweens.killTweensOf(actor);actor.destroy();}
    this.scene.cameras.main.panEffect.reset();this.layer.destroy(true);
    for(const image of this.hidden)if(image.active)image.setVisible(true);
    this.audio.cinematicMix(1);
  }
}
