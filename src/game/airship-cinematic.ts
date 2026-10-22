import Phaser from 'phaser';
/** A temporary takeoff transform, with no campaign writes. Closing restores it. */
export class AirshipCinematic {
 private targets:{image:Phaser.GameObjects.Image;x:number;y:number}[]=[];
 private started?:number;
 private closed=false;
 private reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 constructor(private scene:Phaser.Scene,world:Phaser.GameObjects.Container,actors:Iterable<Phaser.GameObjects.Image>){
  const ship=world.list.find(o=>o instanceof Phaser.GameObjects.Image&&o.texture.key==='scene-five-survey-ship') as Phaser.GameObjects.Image|undefined;
  this.targets=[...(ship?[ship]:[]),...actors].map(image=>({image,x:image.x,y:image.y}));
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
  // Capture the completed boarding positions, not the initial stage positions.
  this.targets=this.targets.map(t=>({...t,x:t.image.x,y:t.image.y}));this.started=this.scene.time.now;
  this.scene.events.on(Phaser.Scenes.Events.UPDATE,this.update);this.update();
 }
 close(){if(this.closed)return;this.closed=true;this.scene.events.off(Phaser.Scenes.Events.UPDATE,this.update);for(const {image,x,y}of this.targets)if(image.active)image.setPosition(x,y);}
}
