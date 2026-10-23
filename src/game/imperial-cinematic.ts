import Phaser from 'phaser';
import type { StagePoint } from '../content/cinematics';
export type ImperialEffect='capital-street'|'capital-fall'|'capital-thread'|'capital-horizon'|'lightbearer-rise'|'lightbearer-fall';
/** Scene-time effects own no story state; completion/skip commits the checkpoint. */
export class ImperialCinematic {
 private tweens:Phaser.Tweens.Tween[]=[];
 private objects:Phaser.GameObjects.GameObject[]=[];
 private originals:{image:Phaser.GameObjects.Image;x:number;y:number;alpha:number}[]=[];
 constructor(private scene:Phaser.Scene,private world:Phaser.GameObjects.Container){}
 get animating(){return this.tweens.some(t=>t.isPlaying());}
 play(kind:ImperialEffect,focus?:StagePoint){
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches,x=((focus?.x??32)+.5)*24,y=((focus?.y??22)+.5)*24;
  if(kind==='capital-street'){
   for(const o of this.world.list)if(o instanceof Phaser.GameObjects.Image&&/city-return|palace-cordon|city-cart/.test(o.getData('scene-piece')?.key??'')){
    this.originals.push({image:o,x:o.x,y:o.y,alpha:o.alpha});
    if(reduced)o.setAlpha(.25);else this.tweens.push(this.scene.tweens.add({targets:o,x:o.x+(o.texture.key.includes('cart')?42:0),y:o.y+(o.texture.key.includes('cart')?12:22),alpha:o.texture.key.includes('cart')?1:0,duration:1000,ease:'Sine.easeInOut'}));
   }
  }else if(kind==='capital-fall'||kind==='lightbearer-rise'||kind==='lightbearer-fall'){
   const light=kind!=='capital-fall',image=this.scene.add.image(780,light&&kind==='lightbearer-rise'&&!reduced?920:504,light?'lightbearer-idle':'imperial-fallen').setOrigin(.5,1).setDepth(28000);this.world.add(image);this.objects.push(image);
   if(reduced)image.setAlpha(kind==='lightbearer-rise'?1:.35);
   else this.tweens.push(this.scene.tweens.add({targets:image,y:kind==='lightbearer-rise'?504:559,alpha:kind==='lightbearer-rise'?1:0,duration:1500,ease:'Cubic.easeInOut'}));
  }else{
   const g=this.scene.add.graphics().setDepth(28001);this.world.add(g);this.objects.push(g);
   const draw=(p:number)=>{
    if(!g.active)return;g.clear();
    if(kind==='capital-horizon'){
     g.lineStyle(10,0x1a2b3f,.9).strokeEllipse(x,y-220,210+p*180,24+p*13);g.lineStyle(3,0xf1d49b,.8).strokeEllipse(x,y-220,210+p*180,24+p*13);
    }else{
     g.lineStyle(8,0xe5ebcd,(1-p)*.35).lineBetween(x,y-210,x+80,y+330);g.lineStyle(2,0xffeab2,1-p).lineBetween(x,y-210,x+80,y+330);
     for(let i=0;i<6;i++)g.fillStyle(0xf2dfb4,1-p).fillRect(x+i*14-40,y+i*28-100+p*30,4,7);
    }
   };draw(reduced?kind==='capital-horizon'?1:.8:0);
   if(!reduced)this.tweens.push(this.scene.tweens.addCounter({from:0,to:1,duration:1400,onUpdate:t=>draw(t.getValue()??0)}));
  }
  this.world.sort('depth');
 }
 close(){for(const t of this.tweens)t.remove();this.tweens=[];for(const o of this.objects)o.destroy();this.objects=[];for(const p of this.originals)if(p.image.active)p.image.setPosition(p.x,p.y).setAlpha(p.alpha);this.originals=[];}
}
