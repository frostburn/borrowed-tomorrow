import Phaser from 'phaser';
import {IMPERIAL_ENTRY_PARTS,IMPERIAL_CLOSE_MS,IMPERIAL_UNFOLD_MS,imperialEntryPose,type ImperialEntryEffect} from '../content/imperial-entry';
import {nativeTexture} from './boss-display';

/** Temporary assembly only. The existing scene owns all saved progression. */
export class ImperialEntry {
 private parts=new Map<string,Phaser.GameObjects.Image>();
 private supports:Phaser.GameObjects.Image[]=[];
 private originals:{image:Phaser.GameObjects.Image;visible:boolean}[]=[];
 private phase?:ImperialEntryEffect;
 private started=0;
 private finished=false;
 private closed=false;
 private reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 private humanPose?:{depth:number;worldActor:boolean;visible:boolean;alpha:number};
 constructor(private scene:Phaser.Scene,world:Phaser.GameObjects.Container,private human?:Phaser.GameObjects.Image){
  for(const child of world.list)if(child instanceof Phaser.GameObjects.Image&&['scene-six-crown-vessel','scene-six-crown-west-support','scene-six-crown-east-support'].includes(child.getData('scene-piece')?.key)){
   this.originals.push({image:child,visible:child.visible});child.setVisible(false);
  }
  for(const [index,part]of IMPERIAL_ENTRY_PARTS.entries()){
   const key=`imperial-entry-${part}`;nativeTexture(scene,key);
   const image=scene.add.image(780,520,key).setOrigin(.5,1).setDepth(27000+index+(index?1:0));
   world.add(image);this.parts.set(part,image);
  }
  nativeTexture(scene,'imperial-support');
  for(const side of [-1,1]){const image=scene.add.image(780+side*64,520,'imperial-support').setOrigin(.5,1).setDepth(26999);world.add(image);this.supports.push(image);}
  if(human){this.humanPose={depth:human.depth,worldActor:!!human.getData('world-actor'),visible:human.visible,alpha:human.alpha};human.setData('world-actor',false).setDepth(27010);}
  this.draw(0);scene.events.on(Phaser.Scenes.Events.UPDATE,this.update,this);world.sort('depth');
 }
 get animating(){return !this.closed&&!this.reduced&&!!this.phase&&this.phase!=='imperial-enter';}
 play(phase:ImperialEntryEffect){
  if(this.closed)return;this.settle();this.phase=phase;this.started=this.scene.time.now;this.human?.setDepth(phase==='imperial-enter'?27010:27001);
  if(phase==='imperial-enter')this.draw(0);else if(this.reduced)this.settle();else this.update();
 }
 private update=()=>{
  if(this.closed||!this.phase||this.phase==='imperial-enter')return;
  const end=this.phase==='imperial-close'?IMPERIAL_CLOSE_MS:IMPERIAL_CLOSE_MS+IMPERIAL_UNFOLD_MS;
  const time=(this.phase==='imperial-unfold'?IMPERIAL_CLOSE_MS:0)+this.scene.time.now-this.started;
  if(time>=end)this.settle();else this.draw(time);
 };
 settle(){
  if(this.closed||!this.phase)return;
  const unfold=this.phase==='imperial-unfold';this.draw(this.phase==='imperial-enter'?0:IMPERIAL_CLOSE_MS+(unfold?IMPERIAL_UNFOLD_MS:0));
  this.phase=undefined;
  if(unfold){this.finished=true;for(const image of [...this.parts.values(),...this.supports])image.setVisible(false);for(const {image,visible}of this.originals)if(image.active)image.setVisible(visible);}
 }
 private draw(time:number){
  if(this.finished)return;const p=imperialEntryPose(time);
  for(const [part,image]of this.parts){
   const side=part.endsWith('left')?-1:part.endsWith('right')?1:0;
   image.setPosition(780,p.y).setScale(p.scale).setAlpha(part==='face'?p.faceAlpha:1);
   if(part.startsWith('arm-')){
    const px=side<0?187:341,py=135;
    image.setOrigin(px/528,py/280).setPosition(780+(px-264)*p.scale,p.y+(py-280)*p.scale).setRotation(side*p.armAngle);
   }else if(part.startsWith('collar-')||part.startsWith('front-'))image.x+=side*p.plateGap*p.scale;
  }
  this.supports.forEach((image,index)=>image.setPosition(p.supportCenter+(index?1:-1)*p.supportSpread,p.supportY).setScale(p.scale).setAlpha(p.supportAlpha));
  this.human?.setAlpha(p.humanAlpha).setVisible(p.humanAlpha>0);
 }
 close(){
  if(this.closed)return;this.closed=true;this.scene.events.off(Phaser.Scenes.Events.UPDATE,this.update,this);
  for(const image of [...this.parts.values(),...this.supports])image.destroy();this.parts.clear();this.supports=[];
  for(const {image,visible}of this.originals)if(image.active)image.setVisible(visible);this.originals=[];
  const p=this.humanPose;if(p&&this.human?.active)this.human.setDepth(p.depth).setData('world-actor',p.worldActor).setVisible(p.visible).setAlpha(p.alpha);
 }
}
