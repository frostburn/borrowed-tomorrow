import Phaser from 'phaser';
import type { StagePoint } from '../content/cinematics';
/** Boat/chain motion and the treatment pulse are temporary scene state. */
export class RiverCinematic {
 private tweens:Phaser.Tweens.Tween[]=[];
 private objects:Phaser.GameObjects.Graphics[]=[];
 private originals=new Map<Phaser.GameObjects.Image,{x:number;y:number;alpha:number}>();
 constructor(private scene:Phaser.Scene,private world:Phaser.GameObjects.Container){}
 get animating(){return this.tweens.some(t=>t.isPlaying());}
 private piece(key:string){
  const image=this.world.list.find((o):o is Phaser.GameObjects.Image=>o instanceof Phaser.GameObjects.Image&&o.getData('scene-piece')?.key===key);
  if(image&&!this.originals.has(image))this.originals.set(image,{x:image.x,y:image.y,alpha:image.alpha});
  return image;
 }
 play(kind:'river-launch'|'river-treatment',focus?:StagePoint){
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(kind==='river-launch'){
   const chain=this.piece('scene-six-river-chain'),boat=this.piece('scene-six-canopy-launch')??this.piece('scene-six-rainhouse-launch');
   if(chain){if(reduced)chain.setY(chain.y-96).setAlpha(0);else this.tweens.push(this.scene.tweens.add({targets:chain,y:chain.y-96,alpha:0,duration:650,ease:'Sine.easeInOut'}));}
   if(boat){
    const x=boat.x,y=boat.y,dx=chain?64:-30,dy=chain?-94:-18;
    if(reduced)boat.setPosition(x+dx,y+dy);
    else this.tweens.push(this.scene.tweens.add({targets:boat,x:x+dx,y:y+dy,duration:1350,ease:'Sine.easeInOut'}));
   }
  }else if(focus){
   const g=this.scene.add.graphics().setDepth(29998),x=(focus.x+.5)*24+48,y=(focus.y+.5)*24-44;this.world.add(g);this.objects.push(g);
   const draw=(p:number)=>{
    if(!g.active)return;g.clear();const pulse=Math.sin(p*Math.PI*4)*(1-p),r=15+pulse*8;
    g.fillStyle(0xa8c4a0,.11+(1-p)*.09).fillEllipse(x,y,r*2.8,r);
    g.lineStyle(2,0xd7d2a4,.7-p*.45).strokeEllipse(x,y,r*2,r*.7);
    g.lineStyle(2,0x8da5a0,.35*(1-p)).strokeEllipse(x,y,44+pulse*12,18+pulse*4);
   };
   draw(reduced?1:0);
   if(!reduced)this.tweens.push(this.scene.tweens.addCounter({from:0,to:1,duration:1800,onUpdate:t=>draw(t.getValue()??0)}));
  }
  this.world.sort('depth');
 }
 close(){
  for(const tween of this.tweens)tween.remove();this.tweens=[];
  for(const [image,p]of this.originals)if(image.active)image.setPosition(p.x,p.y).setAlpha(p.alpha);this.originals.clear();
  for(const g of this.objects)g.destroy();this.objects=[];
 }
}
