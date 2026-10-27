import type Phaser from 'phaser';
import type {AbilityId} from '../rules/abilities';
import {isBossDirectAbility} from '../rules/boss-direct';
import {toPixel,type Hex} from '../rules/hex';

/** Small aimed projectiles, visually distinct from the following area pattern. */
export function drawBossDirect(g:Phaser.GameObjects.Graphics,id:AbilityId,p:number,affected:Hex[],source:{x:number;y:number},reduced:boolean){
 if(!isBossDirectAbility(id))return false;
 const cold=id==='iceshard',metal=['slagshot','coveringshot','pressurebolt'].includes(id);
 const color=cold?0xa6dfe1:metal?0xd8a66a:id==='lensshot'?0xc1e0b6:0xf3d5a0;
 const height=id==='coveringshot'?82:id==='lensshot'?120:id==='claim'?140:110;
 const start={x:source.x,y:source.y-height},snap=(n:number)=>Math.round(n/2)*2;
 for(const h of affected){
  const target=toPixel(h),end={x:target.x,y:target.y-24},travel=reduced?1:Math.min(1,p/.55);
  const tip={x:snap(start.x+(end.x-start.x)*travel),y:snap(start.y+(end.y-start.y)*travel)};
  if(!reduced&&p<.65){
   if(id==='lensshot'){
    g.lineStyle(6,0x769c88,.3).lineBetween(start.x,start.y,tip.x,tip.y);
    g.lineStyle(2,color,.95).lineBetween(start.x,start.y,tip.x,tip.y);
   }else{
    const tail=Math.max(0,travel-.12),x=snap(start.x+(end.x-start.x)*tail),y=snap(start.y+(end.y-start.y)*tail);
    g.lineStyle(4,color,.5).lineBetween(x,y,tip.x,tip.y);
    if(metal)g.fillStyle(color).fillRect(tip.x-4,tip.y-4,8,8);
    else g.fillStyle(color).fillTriangle(tip.x,tip.y-8,tip.x-6,tip.y+4,tip.x+6,tip.y+4);
    g.fillStyle(0xffedce).fillRect(tip.x-2,tip.y-2,4,4);
   }
  }
  if(reduced||p>=.5){
   const r=8+snap(Math.max(0,p-.5)*24);
   g.lineStyle(2,color,.9).strokeEllipse(end.x,end.y,r*2,r);
   for(const sign of [-1,1])g.lineBetween(end.x+sign*4,end.y-2,end.x+sign*r,end.y-12);
  }
 }
 return true;
}
