import type Phaser from 'phaser';
import { ABILITIES, type AbilityId } from '../rules/combat';
import { toPixel, type Hex } from '../rules/hex';

/** Short native-world effects from a tool, or from above for celestial attacks. */
export function battleEffect(scene:Phaser.Scene,world:Phaser.GameObjects.Container,source:{x:number;y:number},aim:Hex,ability:AbilityId,affected:Hex[],face:string){
  const g=scene.add.graphics();world.add(g);
  const steam=ability==='steam'||ability==='repulse',healing=ABILITIES[ability].heal||ability==='guard';
  const color=healing?0x9bcfb0:steam?0xc0e8ee:0xf6c667;
  const target=toPixel(ability==='steam'&&affected.length?affected[affected.length-1]:aim);
  const hand={x:source.x+(face.endsWith('-left')?-26:face.endsWith('-right')?26:face.endsWith('-back')?18:-18),y:source.y-30};
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  scene.tweens.addCounter({from:0,to:1,duration:reduced?100:240,onUpdate:tween=>{
    if(!g.active)return;const p=tween.getValue()??0;g.clear();g.setAlpha(1-p);
    if(ability==='barrage'){
      for(const hex of affected){
        const at=toPixel(hex),hit=reduced?1:Math.min(1,p*2),tip={x:Math.round(at.x-40*(1-hit)),y:Math.round(at.y-100*(1-hit))};
        if(!reduced&&p<.5){g.lineStyle(3,0xd9bb7f,.9);g.lineBetween(tip.x-10,tip.y-25,tip.x,tip.y);}
        if(reduced||p>=.4){const r=8+p*20;g.fillStyle(0xd4ae76,.25).fillEllipse(at.x,at.y,r*2,r);g.lineStyle(3,0xf2c47c,.9).strokeEllipse(at.x,at.y,r*2,r);for(const dx of [-12,0,12])g.lineBetween(at.x,at.y,at.x+dx*p,at.y-8-p*16);}
      }
    }else if(ABILITIES[ability].shape==='pattern'){
      for(const hex of affected){const at=toPixel(hex);g.fillStyle(0xf9dbad,.17).fillRect(Math.round(at.x-16),0,32,Math.round(at.y));g.lineStyle(3,0xf8dfb5,.85).lineBetween(at.x,0,at.x,at.y);g.strokeEllipse(at.x,at.y,38+p*12,16+p*10);}
    }else if(ability==='celestialbolt'){
      const y=target.y-24,tip=reduced?y:Math.round(y*Math.min(1,p/.55));
      g.fillStyle(0xf8dfb5,.18);g.fillRect(target.x-6,0,12,tip);
      g.lineStyle(3,0xfff0ce,.95);g.lineBetween(target.x,Math.max(0,tip-96),target.x,tip);
      if(reduced||p>=.55){
        const r=reduced?16:6+(p-.55)*40;
        g.lineStyle(2,color,.85);g.strokeEllipse(target.x,y,r*2,r);
        g.fillStyle(0xfff0ce,1);g.fillRect(target.x-2,y-12,4,24);g.fillRect(target.x-10,y-2,20,4);
      }
    }else if(ability==='strike'){
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
