import type Phaser from 'phaser';
import { ABILITIES, type AbilityId,type Ability } from '../rules/combat';
import { diagonalStart, toPixel, type Hex } from '../rules/hex';
import {drawTeamEffect,TEAM_ANIMATION,type TeamSource} from './battle-team-effects';

/** Short native-world effects from a tool, or from above for celestial attacks. */
export function battleEffect(scene:Phaser.Scene,world:Phaser.GameObjects.Container,source:{x:number;y:number},aim:Hex,ability:AbilityId,affected:Hex[],face:string,origin?:Hex,definition:Ability=ABILITIES[ability],teamSources:TeamSource[]=[]){
  const g=scene.add.graphics();world.add(g);
  const steam=['steam','repulse','pressureline','prism','relay'].includes(ability),healing=definition.heal||definition.effect==='guard';
  const rich=['axis','diagonal','bounce'].includes(definition.shape)||!!definition.team;
  const color=healing?0x9bcfb0:steam?0xc0e8ee:0xf6c667;
  const target=toPixel((ability==='steam'||ability==='sunbeam')&&affected.length?affected[affected.length-1]:aim);
  const hand={x:source.x+(face.endsWith('-left')?-26:face.endsWith('-right')?26:face.endsWith('-back')?18:-18),y:source.y-30};
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  scene.tweens.addCounter({from:0,to:1,duration:reduced?100:TEAM_ANIMATION[ability]?.duration??(rich?580:300),onUpdate:tween=>{
    if(!g.active)return;const p=tween.getValue()??0;g.clear();g.setAlpha(1-p);
    if(drawTeamEffect(g,ability,p,affected,teamSources,reduced))return;
    if(definition.shape==='diagonal'&&origin&&affected.length){
      const start=diagonalStart(origin,affected[0]),points=affected.map(toPixel),last=points.at(-1)!,progress=reduced?1:Math.min(1,p*2);
      const tip={x:Math.round((start.x+(last.x-start.x)*progress)/2)*2,y:Math.round((start.y+(last.y-start.y)*progress)/2)*2};
      g.lineStyle(10,steam?0x6babb3:0xd8b66e,.3).lineBetween(start.x,start.y,tip.x,tip.y);
      g.lineStyle(4,color,.9).lineBetween(start.x,start.y,tip.x,tip.y);
      for(const [i,at]of points.entries())if(reduced||progress>=(i+2/3)/(points.length-1/3)){
        const r=6+Math.round(p*6)*2;g.lineStyle(2,color,.9).strokeEllipse(at.x,at.y,r*2,r);
        g.lineBetween(at.x,at.y+4,at.x,at.y-20);g.fillStyle(0xeff0ce).fillRect(at.x-2,at.y-18,4,12);
      }
    }else if(definition.shape==='axis'){
      const points=affected.map(toPixel),first=points[0],last=points.at(-1);
      if(first&&last){
        const progress=reduced?1:Math.min(1,p*2),x=Math.round((first.x+(last.x-first.x)*progress)/2)*2,y=Math.round((first.y+(last.y-first.y)*progress)/2)*2-24;
        g.lineStyle(14,steam?0x6babb3:0xd8b66e,.35).lineBetween(first.x,first.y-24,x,y);
        g.lineStyle(6,color,.9).lineBetween(first.x,first.y-24,x,y);g.lineStyle(2,0xf3f1d0,1).lineBetween(first.x,first.y-24,x,y);
        for(const [i,at]of points.entries())if(reduced||p*2>=i/points.length){const r=6+Math.round(p*8)*2;g.lineStyle(2,color,.7).strokeEllipse(at.x,at.y-20,r*2,r);if(steam)g.fillStyle(0xd0ece5,.35).fillCircle(at.x,at.y-32,r);}
      }
    }else if(definition.shape==='bounce'){
      const points=[hand,...affected.map(h=>{const p=toPixel(h);return {x:p.x,y:p.y-24};})],segment=reduced?points.length-2:Math.min(points.length-2,Math.floor(p*points.length)),travel=reduced?1:Math.min(1,(p*points.length)%1);
      for(let i=0;i<=segment;i++){
        const from=points[i],to=points[i+1];if(!from||!to)continue;const t=i<segment?1:travel;
        const x=Math.round((from.x+(to.x-from.x)*t)/2)*2,y=Math.round((from.y+(to.y-from.y)*t)/2)*2;
        g.lineStyle(i?4:2,i?0xe6e6b1:0xd5a568,.9).lineBetween(from.x,from.y,x,y);g.fillStyle(0xffe1a2).fillRect(x-4,y-2,8,4);
        if(i<segment||reduced){g.lineStyle(2,0xf2dca1,.9).strokeCircle(to.x,to.y,8+Math.round(p*6)*2);for(const dx of [-1,1])g.lineBetween(to.x,to.y,to.x+dx*14,to.y-12);}
      }
    }else if(ability==='relay'){
      for(const hex of affected){const at=toPixel(hex),r=8+Math.round(p*12)*2;g.fillStyle(0x9dc8ce,.2).fillRect(at.x-8,at.y-90,16,70);g.lineStyle(4,0xd0e9df,.85).lineBetween(at.x,at.y-90,at.x,at.y-20);g.strokeEllipse(at.x,at.y-12,r*2,r);}
    }else if(ability==='barrage'){
      for(const hex of affected){
        const at=toPixel(hex),hit=reduced?1:Math.min(1,p*2),tip={x:Math.round(at.x-40*(1-hit)),y:Math.round(at.y-100*(1-hit))};
        if(!reduced&&p<.5){g.lineStyle(3,0xd9bb7f,.9);g.lineBetween(tip.x-10,tip.y-25,tip.x,tip.y);}
        if(reduced||p>=.4){const r=8+p*20;g.fillStyle(0xd4ae76,.25).fillEllipse(at.x,at.y,r*2,r);g.lineStyle(3,0xf2c47c,.9).strokeEllipse(at.x,at.y,r*2,r);for(const dx of [-12,0,12])g.lineBetween(at.x,at.y,at.x+dx*p,at.y-8-p*16);}
      }
    }else if(definition.shape==='pattern'){
      for(const hex of affected){const at=toPixel(hex);g.fillStyle(0xf9dbad,.17).fillRect(Math.round(at.x-16),0,32,Math.round(at.y));g.lineStyle(3,0xf8dfb5,.85).lineBetween(at.x,0,at.x,at.y);g.strokeEllipse(at.x,at.y,38+p*12,16+p*10);}
    }else if(ability==='sunbeam'){
      for(const hex of affected){const at=toPixel(hex);g.lineStyle(5,0xf4dc9e,.8).lineBetween(hand.x,hand.y,at.x,at.y-14);g.lineStyle(2,0xe5f5e0,1).lineBetween(hand.x,hand.y,at.x,at.y-14);}
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
      for(const dx of [-1,1]){g.lineStyle(2,0xf1d6b0,.8).lineBetween(target.x,target.y-26,target.x+dx*(10+p*16),target.y-38-p*10);}
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

/** A normal attack spins the resilient valve wheel and changes its connected vents. */
export function valveTurn(scene:Phaser.Scene,world:Phaser.GameObjects.Container,hex:Hex,vents:Hex[],active:boolean){
 const g=scene.add.graphics(),at=toPixel(hex);world.add(g);const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 scene.tweens.addCounter({from:0,to:1,duration:reduced?100:360,onUpdate:t=>{
  if(!g.active)return;const p=t.getValue()??0,angle=(reduced?1:p)*Math.PI/2;
  const dx=Math.round(Math.cos(angle)*14/2)*2,dy=Math.round(Math.sin(angle)*14/2)*2;
  g.clear().setAlpha(1-p).lineStyle(4,active?0xe9ae66:0xa3dac2).strokeCircle(at.x,at.y-24,18);
  g.lineBetween(at.x-dx,at.y-24-dy,at.x+dx,at.y-24+dy);
  for(const h of vents){const v=toPixel(h),r=4+Math.round(p*8)*2;g.lineStyle(2,active?0xedbb75:0xa3dac2,.7).strokeEllipse(v.x,v.y,r*2,r);if(active)g.fillStyle(0xc5e1d7,.3).fillCircle(v.x,v.y-8-Math.round(p*8)*2,r);}
 },onComplete:()=>{if(g.active)g.destroy();}});
}

/** A short linked wind-up makes both participating tools readable before contact. */
export function teamWindup(scene:Phaser.Scene,world:Phaser.GameObjects.Container,a:{x:number;y:number},b:{x:number;y:number},healing:boolean){
 const g=scene.add.graphics();world.add(g);
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 scene.tweens.addCounter({from:0,to:1,duration:reduced?80:140,onUpdate:t=>{
  if(!g.active)return;const p=t.getValue()??0,c=healing?0xa4d6ba:0xe5c27d;
  g.clear().lineStyle(2,c,.6);g.lineBetween(a.x,a.y-24,b.x,b.y-24);
  for(const source of [a,b]){const r=6+Math.round(p*4)*2;g.lineStyle(2,c,.9).strokeEllipse(source.x,source.y-24,r*2,r);g.fillStyle(c,.6).fillRect(source.x-2,source.y-34,4,20);}
 },onComplete:()=>{if(g.active)g.destroy();}});
}
export function fixtureBurst(scene:Phaser.Scene,world:Phaser.GameObjects.Container,hex:Hex,drum:boolean){
 const g=scene.add.graphics(),at=toPixel(hex);world.add(g);const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 scene.tweens.addCounter({from:0,to:1,duration:reduced?100:420,onUpdate:t=>{
  if(!g.active)return;const p=t.getValue()??0;g.clear().setAlpha(1-p);
  for(let i=0;i<8;i++){
   const angle=i*Math.PI/4,r=reduced?16:12+p*44,x=at.x+Math.round(Math.cos(angle)*r/2)*2,y=at.y-18+Math.round(Math.sin(angle)*r/4)*2;
   if(drum)g.fillStyle(i%2?0xc2e5db:0x89b5bb,.7).fillCircle(x,y,6+Math.round(p*5)*2);
   else g.fillStyle(i%2?0xa98051:0xd0a36b).fillRect(x,y,12,4);
  }
  if(drum)g.lineStyle(4,0xe6d8ac,.8).strokeEllipse(at.x,at.y-10,24+p*90,12+p*44);
 },onComplete:()=>{if(g.active)g.destroy();}});
}
