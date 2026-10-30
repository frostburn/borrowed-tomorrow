import Phaser from 'phaser';
import {MECHANISM_FRAMES,MECHANISM_SHEETS,STORY_MECHANISMS,mechanismTexture,harborFerryPosition,type MechanismSheet,type StoryMechanism} from '../content/story-mechanisms';

export function mechanismFrame(scene:Phaser.Scene,name:MechanismSheet,frame:number){
 const key=mechanismTexture(name),texture=scene.textures.get(key),d=MECHANISM_SHEETS[name];
 if(!texture.has(String(frame)))texture.add(String(frame),0,frame*d.width,0,d.width,d.height);
 return {key,frame:String(frame)};
}
interface Pose {image:Phaser.GameObjects.Image;key:string;frame:string|number;x:number;y:number;alpha:number;depth:number}
const clamp=(p:number)=>Phaser.Math.Clamp(p,0,1);
/** Temporary native prop poses; only the dialogue completion callback writes flags. */
export class MechanismCinematic {
 private originals=new Map<Phaser.GameObjects.Image,Pose>();
 private temporary:(Phaser.GameObjects.Image|Phaser.GameObjects.Graphics)[]=[];
 private tween?:Phaser.Tweens.Tween;
 private finish?:()=>void;
 private played=new Set<StoryMechanism>();
 constructor(private scene:Phaser.Scene,private world:Phaser.GameObjects.Container){}
 get animating(){return !!this.tween?.isPlaying();}
 private piece(key:string){
  const image=this.world.list.find((o):o is Phaser.GameObjects.Image=>o instanceof Phaser.GameObjects.Image&&o.getData('scene-piece')?.key===key);
  if(image&&!this.originals.has(image))this.originals.set(image,{image,key:image.texture.key,frame:image.frame.name,x:image.x,y:image.y,alpha:image.alpha,depth:image.depth});
  return image;
 }
 play(kind:StoryMechanism){
  this.settle();if(this.played.has(kind))return;this.played.add(kind);
  const definition=STORY_MECHANISMS[kind],updates:((p:number)=>void)[]=[];
  for(const name of definition.sheets){
   const image=this.piece(MECHANISM_SHEETS[name].target);if(!image)continue;
   updates.push(p=>{const phase=kind==='harbor-open'&&name==='harbor-gate'?clamp((p-.08)/.42):kind==='harbor-open'?clamp(p/.5):p;const f=mechanismFrame(this.scene,name,Math.round(phase*(MECHANISM_FRAMES-1)));image.setTexture(f.key,f.frame);});
  }
  const fade=(key:string)=>{const image=this.piece(key);if(image){const alpha=image.alpha;updates.push(p=>image.setAlpha(alpha*(1-p)));}};
  if(kind==='harbor-open'){
   const ferry=this.piece('scene-four-harbor-ferry-out');
   if(ferry){const from={x:ferry.x,y:ferry.y};updates.push(p=>{const to=harborFerryPosition(clamp((p-.38)/.62),from);ferry.setPosition(Math.round(to.x/2)*2,Math.round(to.y/2)*2).setDepth(ferry.y+192);});}
  }else if(kind==='cable-release'){
   const spark=this.scene.add.graphics().setDepth(29990);this.world.add(spark);this.temporary.push(spark);
   updates.push(p=>{spark.clear();if(p>0&&p<1){const x=1056-(p*276),y=544-(p*218);spark.fillStyle(0xe7e6c2,1).fillRect(Math.round(x/2)*2,Math.round(y/2)*2,6,4);}});
  }else if(kind==='cooling-open'){
   const water=this.scene.add.image(0,0,'scene-five-moving-water').setOrigin(0).setDepth(-998);this.world.add(water);this.temporary.push(water);
   updates.push(p=>{const width=Math.round(clamp((p-.25)/.75)*1536/2)*2;water.setCrop(1536-width,0,width,490).setVisible(width>0);});
  }else if(kind==='forge-release')fade('scene-five-gantry-signal');
  else if(kind==='watch-release')fade('scene-five-watch-return-line');
  else if(kind==='ward-release')fade('scene-five-gallery-light');
  else if(kind==='north-open'){
   const gate=this.piece('scene-six-north-pass-gate');if(gate){const y=gate.y;updates.push(p=>gate.setY(y-Math.round(p*80/2)*2).setAlpha(1-clamp((p-.85)/.15)));}
  }
  this.world.sort('depth');
  const paint=(p:number)=>{for(const update of updates)update(p);this.world.sort('depth');};
  this.finish=()=>paint(1);paint(0);
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){this.settle();return;}
  this.tween=this.scene.tweens.addCounter({from:0,to:1,duration:definition.duration,ease:'Sine.easeInOut',onUpdate:t=>paint(t.getValue()??0),onComplete:()=>{paint(1);this.tween=undefined;this.finish=undefined;}});
 }
 /** Fast dialogue advancement shows the final pose before staging the next line. */
 settle(){this.tween?.remove();this.tween=undefined;this.finish?.();this.finish=undefined;}
 close(){
  this.tween?.remove();this.tween=undefined;this.finish=undefined;
  for(const p of this.originals.values())if(p.image.active)p.image.setTexture(p.key,p.frame).setPosition(p.x,p.y).setAlpha(p.alpha).setDepth(p.depth);
  this.originals.clear();for(const object of this.temporary)object.destroy();this.temporary=[];this.world.sort('depth');
 }
}
