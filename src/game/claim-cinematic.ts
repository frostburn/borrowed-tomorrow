import Phaser from 'phaser';

/** A bodiless intervention: a seam of light and the ship's destruction. */
export class ClaimCinematic {
 private light:Phaser.GameObjects.Graphics;
 private sky:Phaser.GameObjects.Graphics;
 private targets:{image:Phaser.GameObjects.Image;alpha:number}[];
 private started?:number;
 private striking=false;
 private closed=false;
 private reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 constructor(private scene:Phaser.Scene,world:Phaser.GameObjects.Container){
  this.light=scene.add.graphics().setDepth(29999);world.add(this.light);
  this.sky=scene.add.graphics().setDepth(-998).setVisible(false);world.add(this.sky);
  this.targets=world.list.filter((o):o is Phaser.GameObjects.Image=>o instanceof Phaser.GameObjects.Image&&
   (o.texture.key.startsWith('scene-five-flagship-')&&!o.texture.key.endsWith('-launch')||String(o.getData('person')??'').startsWith('imperial-'))).map(image=>({image,alpha:image.alpha}));
  scene.events.on(Phaser.Scenes.Events.UPDATE,this.update);
 }
 play(strike:boolean){this.striking=strike;this.started=this.scene.time.now;this.update();}
 private update=()=>{
  if(this.closed||this.started===undefined)return;
  const t=this.reduced?1700:this.scene.time.now-this.started,p=Math.min(1,t/1700);
  this.light.clear();
  if(!this.striking){
   const width=this.reduced?18:18+2*Math.sin(t/360);
   this.light.lineStyle(width+28,0xdcc38b,.08).lineBetween(650,262,945,190);
   this.light.lineStyle(width+12,0xf4dca4,.22).lineBetween(650,262,945,190);
   this.light.lineStyle(width,0xffe9b6,.8).lineBetween(650,262,945,190);
   this.light.lineStyle(7,0xfff8da,1).lineBetween(650,262,945,190);return;
  }
  this.sky.setVisible(true).setAlpha(p).clear().fillStyle(0x425965).fillRect(0,0,1536,1008);
  this.sky.fillStyle(0x9caeaa).fillPoints([{x:0,y:575},{x:460,y:490},{x:950,y:580},{x:1536,y:485},{x:1536,y:1008},{x:0,y:1008}].map(p=>new Phaser.Math.Vector2(p.x,p.y)),true);
  for(const {image,alpha}of this.targets)if(image.active)image.setAlpha(alpha*(1-p));
  if(!this.reduced){
   const strength=Math.max(0,1-p);
   this.light.fillStyle(0xe8dba8,strength*.8).fillPoints([{x:720,y:0},{x:818,y:0},{x:1080,y:800},{x:648,y:800}].map(p=>new Phaser.Math.Vector2(p.x,p.y)),true);
   this.light.lineStyle(12,0xf5f1ce,strength).lineBetween(767,0,862,770);
   for(let i=0;i<8;i++)this.light.fillStyle(0xd9d5b2,strength*.7).fillRect(695+i*37,420+p*(120+i*8),5,9);
  }
 };
 get animating(){return !this.closed&&!this.reduced&&this.started!==undefined&&(!this.striking||this.scene.time.now-this.started<1750);}
 close(){if(this.closed)return;this.closed=true;this.scene.events.off(Phaser.Scenes.Events.UPDATE,this.update);for(const {image,alpha}of this.targets)if(image.active)image.setAlpha(alpha);this.light.destroy();this.sky.destroy();}
}
