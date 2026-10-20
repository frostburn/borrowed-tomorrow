import type Phaser from 'phaser';
import { ABILITIES, type AbilityId } from '../rules/combat';
import { toPixel, type Hex } from '../rules/hex';

/** Short native-world effects, anchored to the tool rather than the actor's feet. */
export function battleEffect(scene:Phaser.Scene,world:Phaser.GameObjects.Container,source:{x:number;y:number},aim:Hex,ability:AbilityId,affected:Hex[],face:string){
  const g=scene.add.graphics();world.add(g);
  const steam=ability==='steam'||ability==='repulse',healing=ABILITIES[ability].heal||ability==='guard';
  const color=healing?0x9bcfb0:steam?0xc0e8ee:0xf6c667;
  const target=toPixel(ability==='steam'&&affected.length?affected[affected.length-1]:aim);
  const hand={x:source.x+(face.endsWith('-left')?-26:face.endsWith('-right')?26:face.endsWith('-back')?18:-18),y:source.y-30};
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  scene.tweens.addCounter({from:0,to:1,duration:reduced?100:240,onUpdate:tween=>{
    if(!g.active)return;const p=tween.getValue()??0;g.clear();g.setAlpha(1-p);
    if(ability==='strike'){
      g.lineStyle(3,color,1);g.lineBetween(target.x-12,target.y-39,target.x+12,target.y-17);
      g.lineBetween(target.x-8,target.y-15,target.x+8,target.y-41);
    }else if(ability==='repulse'){
      g.lineStyle(3,color,.8);g.strokeCircle(source.x,source.y-18,16+(reduced?30:p*65));
    }else if(ability==='taunt'){
      g.lineStyle(2,color,.8);g.strokeCircle(source.x,source.y-24,14+(reduced?18:p*28));
    }else if(ability==='bash'){
      g.lineStyle(3,color,.9);
      for(let i=-1;i<=1;i++)g.lineBetween(target.x+i*8,target.y-36,target.x+i*12,target.y-21);
    }else{
      if(!healing){
        g.lineStyle(steam?7:2,color,.8);g.lineBetween(hand.x,hand.y,target.x,target.y-25);
        if(steam)for(let i=1;i<8;i++){
          const t=i/8;g.fillStyle(color,.7);g.fillCircle(Math.round(hand.x+(target.x-hand.x)*t),Math.round(hand.y+(target.y-25-hand.y)*t+(i%2?1:-1)*p*8),3+p*4);
        }
      }
      for(const hex of affected.length?affected:[aim]){
        const at=toPixel(hex),r=reduced?13:7+p*23;g.lineStyle(2,color,.8);g.strokeCircle(at.x,at.y-24,r);
        g.fillStyle(color,1);g.fillRect(at.x-2,at.y-33,4,18);g.fillRect(at.x-9,at.y-26,18,4);
      }
    }
  },onComplete:()=>{if(g.active)g.destroy();}});
}
