import type Phaser from 'phaser';
import type {Battle} from '../rules/combat';
import {toPixel} from '../rules/hex';
/** Small native vector props with broad material planes, drawn at their hex's feet. */
export function drawBattleFixtures(scene:Phaser.Scene,world:Phaser.GameObjects.Container,b:Battle,before?:ReadonlyMap<string,{hp:number;active?:boolean}>){
 for(const actual of b.fixtures??[]){
  const old=before?.get(`fixture:${actual.id}`),f={...actual,hp:old?.hp??actual.hp,active:old?.active??actual.active};
  const {x,y}=toPixel(f.hex),g=scene.add.graphics();world.add(g);
  if(f.hp<=0){g.fillStyle(0x695c49,.8).fillRect(x-18,y+4,28,4).fillRect(x-8,y-2,24,4);continue;}
  g.fillStyle(0x1b2827,.25).fillEllipse(x,y+6,52,18);
  if(f.kind==='barricade'){
   g.fillStyle(0x8f6a44).fillRect(x-24,y-32,48,36);g.fillStyle(0xc59a63).fillRect(x-24,y-32,48,8);
   g.fillStyle(0x5e4934).fillRect(x+12,y-24,12,28);g.lineStyle(4,0xb88a55).lineBetween(x-20,y-24,x+12,y).lineBetween(x+12,y-24,x-20,y);
   if(f.hp<f.maxHp)g.lineStyle(2,0x594536).lineBetween(x,y-24,x-4,y-12).lineBetween(x-4,y-12,x+2,y-4);
  }else if(f.kind==='drum'){
   g.fillStyle(0x748e88).fillRect(x-16,y-36,32,36);g.fillStyle(0xa9beb1).fillEllipse(x,y-36,32,12);
   g.fillStyle(0x425e5b).fillRect(x+8,y-30,8,30);g.lineStyle(4,0xd4a46a).lineBetween(x-16,y-26,x+16,y-26).lineBetween(x-16,y-6,x+16,y-6);
   g.fillStyle(0xd7b27a).fillTriangle(x,y-24,x-8,y-10,x+8,y-10);
  }else{
   g.fillStyle(0x526d68).fillRect(x-8,y-18,16,24);g.fillStyle(0x8eaaa0).fillRect(x-6,y-18,6,22);
   const cy=y-24;g.lineStyle(4,f.active?0xcb8954:0x8dbfa7).strokeCircle(x,cy,16);
   for(const dx of [-1,1])g.lineBetween(x-10,cy+dx*10,x+10,cy-dx*10);
   g.fillStyle(0xe1bf82).fillRect(x-4,cy-4,8,8);
  }
  g.fillStyle(0x203330).fillRect(x-20,y+10,40,4);g.fillStyle(f.kind==='valve'?(f.active?0xd99a59:0x92bea9):0xc4a070).fillRect(x-20,y+10,40*(f.kind==='valve'?1:f.hp/f.maxHp),4);
 }
}
