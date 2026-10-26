import type Phaser from 'phaser';
import type {AbilityId} from '../rules/abilities';
import {toPixel,type Hex} from '../rules/hex';

/** Contact is shared by the effect and the HP/terrain reveal in Adventure. */
export const TEAM_ANIMATION:Partial<Record<AbilityId,{duration:number;contact:number}>>={
 starline:{duration:780,contact:440},prism:{duration:640,contact:210},
 crossfire:{duration:680,contact:380},daybreak:{duration:800,contact:360},relay:{duration:640,contact:340},
};
export interface TeamSource {kind:string;x:number;y:number}
const snap=(n:number)=>Math.round(n/2)*2;
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const star=(g:Phaser.GameObjects.Graphics,x:number,y:number,r:number,color:number)=>{
 const points=Array.from({length:10},(_,i)=>{const a=-Math.PI/2+i*Math.PI/5,d=i%2?r*.42:r;return {x:snap(x+Math.cos(a)*d),y:snap(y+Math.sin(a)*d)};});
 g.fillStyle(color).beginPath().moveTo(points[0].x,points[0].y);for(const at of points.slice(1))g.lineTo(at.x,at.y);g.closePath().fillPath();
};
const slash=(g:Phaser.GameObjects.Graphics,x:number,y:number,p:number)=>{
 const r=snap(12+clamp(p)*24);
 g.lineStyle(6,0x86aab0,.65).lineBetween(x-r,y+r/2,x+r,y-r);
 g.lineStyle(2,0xf3e0b4,.95).lineBetween(x-r,y+r/2,x+r,y-r);
};

/** Distinct team silhouettes, drawn on the same chunky grid as actors and hexes. */
export function drawTeamEffect(g:Phaser.GameObjects.Graphics,id:AbilityId,p:number,affected:Hex[],sources:TeamSource[],reduced:boolean):boolean{
 const timing=TEAM_ANIMATION[id];if(!timing)return false;
 const contact=timing.contact/timing.duration,points=affected.map(toPixel),phase=reduced?1:p;
 g.setAlpha(reduced?.85:1-clamp((p-.7)/.3));
 if(id==='starline'){
  for(const [i,at]of points.entries()){
   const delay=(i%4)*.025,fall=clamp((phase-delay)/(contact-delay)),landed=phase>=contact;
   if(phase<delay)continue;
   const x=snap(at.x-48*(1-fall)),y=snap(at.y-22-176*(1-fall));
   if(!landed){
    g.lineStyle(12,0xadacae,.3).lineBetween(x-20,y-70,x,y);
    g.lineStyle(4,0xbadad8,.9).lineBetween(x-14,y-48,x,y);
    star(g,x,y,12,0xf4ce86);star(g,x,y,6,0xfff2ce);
   }else{
    const after=clamp((phase-contact)/(1-contact)),r=snap(10+after*24);
    g.fillStyle(0xf8d998,.17).fillEllipse(at.x,at.y,r*2,r);
    g.lineStyle(2,0xf6d6a0,.9).strokeEllipse(at.x,at.y,r*2,r);
    star(g,at.x,at.y-22,snap(14-after*8),0xffedc0);
    for(const dx of [-18,18])star(g,at.x+dx,at.y-32-snap(after*24),4,0xc7e8db);
   }
  }
 }else if(id==='prism'){
  const first=points[0],last=points.at(-1);if(!first||!last)return true;
  const travel=clamp(phase/contact),tip={x:snap(first.x+(last.x-first.x)*travel),y:snap(first.y+(last.y-first.y)*travel)-24};
  // Broad mist, narrow hot core, and separated colored planes rather than a white bar.
  g.lineStyle(20,0x83aeb3,.3).lineBetween(first.x,first.y-24,tip.x,tip.y);
  for(const [dy,color]of [[-6,0x8acbc8],[0,0xf4dba0],[6,0xc3abd0]]as const)g.lineStyle(4,color,.85).lineBetween(first.x,first.y-24+dy,tip.x,tip.y+dy);
  g.lineStyle(2,0xfff1ce,1).lineBetween(first.x,first.y-24,tip.x,tip.y);
  for(const [i,at]of points.entries())if(travel>=i/Math.max(1,points.length-1)){
   const r=snap(8+phase*12);g.fillStyle(i%2?0xadd6d0:0xe3cb9b,.25).fillEllipse(at.x,at.y-26,r*2,r);
   if(phase>=contact)star(g,at.x,at.y-24,8,0xf1dfaf);
  }
 }else if(id==='crossfire'){
  const shooter=sources.find(s=>s.kind==='kit')??sources[0],guard=sources.find(s=>s.kind==='petra'),first=points[0];if(!shooter||!first)return true;
  const path=[shooter,...points.map(at=>({x:at.x,y:at.y-24}))],travel=clamp(phase/contact)*(path.length-1);
  for(let i=0;i<path.length-1;i++){
   const t=clamp(travel-i);if(!t)continue;const a=path[i],b=path[i+1],x=snap(a.x+(b.x-a.x)*t),y=snap(a.y+(b.y-a.y)*t);
   g.lineStyle(2,0xe7c184,.85).lineBetween(a.x,a.y,x,y);g.fillStyle(0xffedbe).fillRect(x-6,y-2,12,4);
   if(t===1){slash(g,b.x,b.y,phase);g.lineStyle(2,0xe6b77d,.8).lineBetween(b.x-22,b.y-20,b.x+20,b.y+16);}
  }
  if(guard){slash(g,guard.x,guard.y,phase);g.lineStyle(4,0xbea779,.8).strokeEllipse(guard.x,guard.y+4,24,36);}
 }else if(id==='daybreak'){
  const centers=sources.length?sources:points,center={x:snap(centers.reduce((n,s)=>n+s.x,0)/Math.max(1,centers.length)),y:snap(centers.reduce((n,s)=>n+s.y,0)/Math.max(1,centers.length))};
  const dawn=clamp(phase/contact),radius=snap(20+dawn*260);
  g.fillStyle(0xefc88c,.12).fillEllipse(center.x,center.y,radius*2,radius);
  g.lineStyle(4,0xf1ce8f,.7).strokeEllipse(center.x,center.y,radius*2,radius);
  g.fillStyle(0xffe3a6,.85).fillCircle(center.x,center.y-snap(dawn*36),16);
  for(const at of points){
   const r=snap(12+dawn*16);g.lineStyle(2,0xb5dcc0,.8).strokeEllipse(at.x,at.y,r*2,r);
   g.lineStyle(4,0xf7dcac,.8).beginPath().arc(at.x,at.y-24,22,Math.PI,Math.PI*2).strokePath();
   if(phase>=contact){star(g,at.x,at.y-40-snap((phase-contact)*28),6,0xffebbd);g.fillStyle(0xbcdec0,.85).fillRect(at.x-2,at.y-32,4,16).fillRect(at.x-8,at.y-26,16,4);}
  }
 }else if(id==='relay'){
  const travel=clamp(phase/contact);
  for(const [i,at]of points.entries()){
   const from=sources[i%sources.length]??{x:at.x-80,y:0},x=snap(from.x+(at.x-from.x)*travel),y=snap(from.y+(at.y-14-from.y)*travel-Math.sin(travel*Math.PI)*80);
   if(phase<contact){g.lineStyle(4,0x9ccecc,.8).lineBetween(x-8,y-20,x,y);g.fillStyle(0xf2d9a6).fillRect(x-4,y-4,8,8);}
   else{const r=snap(10+(phase-contact)*36);g.fillStyle(0xafd8d2,.28).fillEllipse(at.x,at.y-12,r*2,r);g.lineStyle(4,0xe3d6ad,.8).strokeEllipse(at.x,at.y,r*2,r);}
  }
 }
 return true;
}
