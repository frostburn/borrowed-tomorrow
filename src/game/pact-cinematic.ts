import Phaser from 'phaser';
import type { StagePoint } from '../content/cinematics';
/** Temporary effects do not write progress; completion/skip owns the real seal. */
export class PactCinematic {
 private tweens:Phaser.Tweens.Tween[]=[];
 private cart?:Phaser.GameObjects.Image;
 private cartX=0;
 private objects:(Phaser.GameObjects.Image|Phaser.GameObjects.Graphics)[]=[];
 constructor(private scene:Phaser.Scene,private world:Phaser.GameObjects.Container){
  this.cart=world.list.find((o):o is Phaser.GameObjects.Image=>o instanceof Phaser.GameObjects.Image&&o.getData('scene-piece')?.key==='scene-six-mooring-city-life');this.cartX=this.cart?.x??0;
 }
 play(kind:'pact-seal'|'pact-break',focus?:StagePoint){
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(kind==='pact-seal'){
   const wall=this.scene.add.image(0,reduced?0:-250,'scene-six-mooring-barrier').setOrigin(0).setDepth(-997.5);this.world.add(wall);this.objects.push(wall);
   if(!reduced&&this.cart)this.tweens.push(this.scene.tweens.add({targets:this.cart,x:this.cartX+40,duration:3400,ease:'Linear'}));
   if(!reduced)this.tweens.push(this.scene.tweens.add({targets:wall,y:0,duration:1350,ease:'Cubic.easeOut'}));
  }else if(focus){
   const x=(focus.x+.5)*24,y=(focus.y+.5)*24-27,g=this.scene.add.graphics().setDepth(29999);this.world.add(g);this.objects.push(g);
   const draw=(p:number)=>{
    if(!g.active)return;g.clear();
    for(const side of [-1,1]){const dx=side*p*20;g.lineStyle(5,0xd2a559,1-p*.4).beginPath().arc(x+dx,y,18,side<0?Math.PI/2:-Math.PI/2,side<0?Math.PI*1.5:Math.PI/2,false).strokePath();}
    g.lineStyle(2,0xc4d2aa,1-p).strokeCircle(x,y,24+p*35);
   };
   draw(reduced?1:0);
   if(!reduced)this.tweens.push(this.scene.tweens.addCounter({from:0,to:1,duration:1050,onUpdate:t=>draw(t.getValue()??0)}));
  }
  this.world.sort('depth');
 }
 close(){for(const tween of this.tweens)tween.remove();this.tweens=[];if(this.cart?.active)this.cart.x=this.cartX;for(const object of this.objects){this.scene.tweens.killTweensOf(object);object.destroy();}this.objects=[];}
}
