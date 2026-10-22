import Phaser from 'phaser';
/** The shelter opens on scene time. Writes remain in the story completion callback. */
export class ShelterCinematic {
 private targets:{image:Phaser.GameObjects.Image;x:number;y:number;alpha:number}[]=[];
 private moving=false;
 private remaining=0;
 private closed=false;
 private reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 constructor(private scene:Phaser.Scene,private world:Phaser.GameObjects.Container){}
 get animating(){return this.moving&&!this.closed&&!this.reduced;}
 play(){
  if(this.targets.length||this.closed)return;
  const images=this.world.list.filter((o):o is Phaser.GameObjects.Image=>o instanceof Phaser.GameObjects.Image);
  const bar=images.find(o=>o.texture.key==='scene-five-shelter-bar');
  const residents=images.filter(o=>['lower-family','lower-resident'].includes(o.getData('person')));
  this.targets=[...(bar?[bar]:[]),...residents].map(image=>({image,x:image.x,y:image.y,alpha:image.alpha}));
  this.moving=true;this.remaining=residents.length;
  if(bar)this.scene.tweens.add({targets:bar,y:bar.y-80,alpha:0,duration:this.reduced?0:500});
  for(const [i,image]of residents.entries()){
   const goal=image.getData('person')==='lower-family'?{x:39,y:26}:{x:40,y:28};
   const points=[{x:29,y:29},{x:35,y:26},goal].map(p=>({x:(p.x+.5)*24,y:(p.y+.5)*24+7}));
   const advance=(step:number)=>{
    if(this.closed||!image.active)return;
    if(step===points.length){if(--this.remaining===0)this.moving=false;return;}
    this.scene.tweens.add({targets:image,...points[step],duration:this.reduced?0:650,delay:step===0&&!this.reduced?i*200:0,ease:'Linear',onComplete:()=>advance(step+1)});
   };advance(0);
  }
  if(!residents.length)this.moving=false;
 }
 close(){
  this.closed=true;this.moving=false;
  for(const {image,x,y,alpha}of this.targets)if(image.active){this.scene.tweens.killTweensOf(image);image.setPosition(x,y).setAlpha(alpha);}
 }
}
