import type Phaser from 'phaser';
import type { Battle } from '../rules/combat';
import { occupiedHexes } from '../rules/footprint';
import { equal,toPixel } from '../rules/hex';

/** Round outcomes are shown before handing control to the next fighter. */
export class BoardingPresentation {
 active=false;
 private completion?:()=>void;
 clear(){this.active=false;this.battle=undefined;this.completion=undefined;}
 settle(scene:Phaser.Scene){if(!this.active)return;this.active=false;scene.cameras.main.stopFollow();const done=this.completion;this.completion=undefined;if(done)scene.time.delayedCall(0,done);}
 private battle?:Battle;
 private round=1;
 private aboard=0;
 sync(b:Battle){if(this.battle!==b){this.active=false;this.completion=undefined;this.battle=b;this.round=b.round;this.aboard=b.evacuation?.boarded??0;}}
 play(scene:Phaser.Scene,layer:Phaser.GameObjects.Container,b:Battle,actor:(x:number,y:number)=>Phaser.GameObjects.Image,done:()=>void){
  const e=b.evacuation;if(!e)return false;
  const count=e.boarded-this.aboard,changed=b.round!==this.round;
  this.round=b.round;this.aboard=e.boarded;
  if((!count&&!changed)||b.result==='defeat')return false;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return false;
  const complete=()=>{this.active=false;this.completion=undefined;scene.cameras.main.stopFollow();done();};
  if(count>0){
   this.active=true;this.completion=complete;
   const points=e.route.map(toPixel);points.push({x:866,y:440});
   let left=count;
   for(let i=0;i<count;i++){
    const family=actor(points[0].x-32,points[0].y+9).setOrigin(.5,.85).setDepth(9000).setData('hero','civilian-family');
    if(i===count-1)scene.cameras.main.startFollow(family,false,1,1);
    const advance=(at:number)=>{
     if(!family.active)return;
     if(at===points.length){family.destroy();if(!--left)complete();return;}
     scene.tweens.add({targets:family,x:points[at].x,y:points[at].y+9,duration:170,onComplete:()=>advance(at+1)});
    };
    scene.time.delayedCall(i*300,()=>advance(0));
   }
  }else{
   const stop=e.route.findIndex(h=>b.units.some(u=>u.hp>0&&u.side==='enemy'&&occupiedHexes(u).some(p=>equal(p,h))));
   if(stop<0)return false;
   this.active=true;this.completion=complete;
   const glow=scene.add.graphics().setDepth(9000);layer.add(glow);
   const step=(at:number)=>{
    if(!glow.active)return;
    glow.clear();
    for(let i=0;i<=at;i++){
     const p=toPixel(e.route[i]);glow.lineStyle(4,0xffd878,1);
     glow.lineBetween(p.x-12,p.y+15,p.x+12,p.y+15);glow.lineBetween(p.x+5,p.y+8,p.x+12,p.y+15);glow.lineBetween(p.x+5,p.y+22,p.x+12,p.y+15);
    }
    if(at<stop)scene.time.delayedCall(100,()=>step(at+1));
    else{
     const p=toPixel(e.route[stop]);glow.lineStyle(4,0xe88b65,1).strokeCircle(p.x,p.y,31);
     scene.tweens.add({targets:glow,alpha:0,duration:650,onComplete:()=>{glow.destroy();complete();}});
    }
   };step(0);
  }
  return true;
 }
}
