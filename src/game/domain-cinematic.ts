import Phaser from 'phaser';
import type {StagePoint} from '../content/cinematics';
export type DomainEffect='domain-break'|'domain-fragment'|'domain-release';
/** Scene-time light and debris. Story completion owns every permanent change. */
export class DomainCinematic{
 private tweens:Phaser.Tweens.Tween[]=[];
 private objects:Phaser.GameObjects.Graphics[]=[];
 private faded:Phaser.GameObjects.Image[]=[];
 constructor(private scene:Phaser.Scene,private world:Phaser.GameObjects.Container,private actors:Map<string,Phaser.GameObjects.Image>){}
 get animating(){return this.tweens.some(t=>t.isPlaying());}
 play(kind:DomainEffect,focus?:StagePoint){
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const center={x:focus?(focus.x+.5)*24:768,y:focus?(focus.y+.5)*24-80:440};
  const g=this.scene.add.graphics().setDepth(29999);this.world.add(g);this.objects.push(g);
  const nell=this.actors.get('nell'),from={x:(nell?.x??780)+18,y:(nell?.y??660)-27},to={x:768,y:412};
  if(kind==='domain-break'||kind==='domain-release'){
   const body=this.world.list.find((o):o is Phaser.GameObjects.Image=>o instanceof Phaser.GameObjects.Image&&o.visible&&String(o.getData('scene-piece')?.key??'').startsWith('scene-seven-sunthrone-')&&['monument','revealed-sun','revealed-heart'].some(n=>String(o.getData('scene-piece')?.key).endsWith(n)));
   if(body){this.faded.push(body);if(reduced)body.setAlpha(.3);else this.tweens.push(this.scene.tweens.add({targets:body,alpha:.1,duration:1400,ease:'Sine.easeIn'}));}
  }
  const draw=(p:number)=>{
   if(!g.active)return;g.clear();
   if(kind==='domain-fragment'){
    const x=from.x+(to.x-from.x)*p,y=from.y+(to.y-from.y)*p-Math.sin(p*Math.PI)*45;
    g.fillStyle(0xe8e6bf,1).fillTriangle(x,y-7,x+5,y,x,y+7).fillTriangle(x,y-7,x,y+7,x-5,y);
    g.lineStyle(2,0x91ccc4,.7).strokeCircle(to.x,to.y,10+p*22);
   }else{
    const r=34+p*125,alpha=1-p*.85;g.lineStyle(3,0xd6c79a,alpha).strokeCircle(center.x,center.y,r);
    for(let i=0;i<12;i++){
     const a=i*Math.PI/6,x=center.x+Math.cos(a)*r,y=center.y+Math.sin(a)*r;
     g.fillStyle(i%2?0x92c7c0:0xc8a770,alpha).fillTriangle(x,y-9,x+7,y+4,x-5,y+9);
    }
    if(kind==='domain-release')for(let i=0;i<18;i++){
     const x=center.x-300+(i*83)%600,y=center.y+170-((i*23+p*250)%330);
     g.fillStyle(0xb7d8cf,alpha*.8).fillRect(Math.round(x),Math.round(y),3,9);
    }
   }
  };
  draw(reduced?1:0);
  if(!reduced)this.tweens.push(this.scene.tweens.addCounter({from:0,to:1,duration:kind==='domain-fragment'?1800:2100,ease:'Sine.easeInOut',onUpdate:t=>draw(t.getValue()??0)}));
 }
 close(){for(const t of this.tweens)t.remove();this.tweens=[];for(const o of this.objects)o.destroy();this.objects=[];for(const image of this.faded)if(image.active)image.setAlpha(1);this.faded=[];}
}
