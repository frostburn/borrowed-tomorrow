import Phaser from 'phaser';
import type { BattlePreview } from '../game/battle-preview';
import { bitmapText } from '../game/pixel-font';
import { active, legalAim, targets, unitAt, type Unit } from '../rules/combat';
import { occupiedHexes } from '../rules/footprint';
import { distance, fromPixel, offset, toPixel } from '../rules/hex';
import { BOSS_ENCOUNTER, BOSS_ID, bossTurn, bossUnit, prepareBoss } from './boss-battle';
import { actorAsset } from '../content/actors';
import type { CompanionId } from '../rules/party';
import p00 from './art/benefactor-0-0.webp?url';
import p10 from './art/benefactor-1-0.webp?url';
import p20 from './art/benefactor-2-0.webp?url';
import p01 from './art/benefactor-0-1.webp?url';
import p11 from './art/benefactor-1-1.webp?url';
import p21 from './art/benefactor-2-1.webp?url';
import portrait from './art/benefactor-portrait.webp?url';

export {portrait as BOSS_PORTRAIT};
export const BOSS_ASSETS=[p00,p10,p20,p01,p11,p21].map((url,i)=>({key:`benefactor-page-${i}`,url}));
const textureKey='benefactor-native';
const points=(items:{x:number;y:number}[])=>items.map(p=>new Phaser.Math.Vector2(p.x,p.y));
let labelId=0;
function label(scene:Phaser.Scene,world:Phaser.GameObjects.Container,x:number,y:number,value:string,scale=1,color='#f4d9aa'){
  const canvas=document.createElement('canvas');canvas.width=value.length*6*scale;canvas.height=9*scale;
  bitmapText(canvas.getContext('2d')!,value,0,scale,color,scale);
  const key=`boss-label-${labelId++}`;scene.textures.addCanvas(key,canvas);
  const text=scene.add.image(Math.round(x),Math.round(y),key).setOrigin(.5);world.add(text);
  text.once('destroy',()=>scene.textures.remove(key));
}
function placement(unit:Unit){
  return {x:Math.round(toPixel(unit.hex).x),y:Math.round(Math.max(...occupiedHexes(unit).map(h=>toPixel(h).y))+24)};
}

export const BOSS_PRESENTATION:BattlePreview={
  encounter:BOSS_ENCOUNTER,prepare:prepareBoss,enemyTurn:bossTurn,focus:offset(5,2),
  portrait:unit=>unit.id===BOSS_ID?portrait:undefined,
  facing:unit=>unit.side==='party'?actorAsset(unit.kind as CompanionId,'back'):undefined,
  hint:b=>`${bossUnit(b).intent?.name??'Judgment'}: red X hexes are struck on the god's turn.`,
  background(scene,world){
    const g=scene.add.graphics();world.add(g);g.fillStyle(0x090e20).fillRect(0,0,1024,480);
    for(let i=0;i<105;i++){
      const x=(i*137+29)%1024,y=(i*79+17)%470;g.fillStyle(i%4?0x496077:0xa9c3c7,.65).fillRect(x,y,i%8?1:2,1);
    }
    g.lineStyle(1,0x9b8053,.4).strokeCircle(463,170,213).strokeCircle(463,170,219);
    const platform=[{x:131,y:72},{x:797,y:72},{x:856,y:142},{x:856,y:421},{x:791,y:462},{x:128,y:462},{x:78,y:414},{x:78,y:143}];
    g.fillStyle(0x0e1424).fillPoints(points(platform.map(p=>({x:p.x,y:p.y+16}))),true);
    g.fillStyle(0x1b2233).fillPoints(points(platform),true);g.lineStyle(2,0x806e52,.8).strokePoints(points(platform),true);
    g.lineStyle(1,0x354457,.7);
    for(let x=105;x<850;x+=61)g.lineBetween(x,145,x,435);
    for(let y=145;y<440;y+=53)g.lineBetween(90,y,846,y);
    g.lineStyle(2,0x7b705a,.45).strokeEllipse(463,274,714,337).strokeEllipse(463,274,728,349);
    g.fillStyle(0x090e20,.6).fillEllipse(463,327,321,52);
    for(const [x,y,w] of [[30,110,35],[932,72,62],[906,392,65],[34,402,24]]){
      g.fillStyle(0x263047).fillPoints(points([{x:x-w/2,y},{x:x+w/2,y:y-12},{x:x+w/2+8,y:y+4},{x:x-8,y:y+20}]),true);
      g.fillStyle(0x12192b).fillPoints(points([{x:x-w/2,y},{x:x-8,y:y+20},{x:x+w/2+8,y:y+4},{x,y:y+48}]),true);
    }
  },
  actor(scene,unit){
    if(unit.id!==BOSS_ID)return;
    if(!scene.textures.exists(textureKey)){
      const texture=scene.textures.createCanvas(textureKey,360,288)!;
      BOSS_ASSETS.forEach((page,i)=>texture.context.drawImage(scene.textures.get(page.key).getSourceImage() as HTMLImageElement,i%3*120,Math.floor(i/3)*144));
      texture.refresh();
    }
    const p=placement(unit);return scene.add.image(p.x,p.y,textureKey).setOrigin(.5,1);
  },
  overlay(scene,world,b){
    const boss=bossUnit(b),p=placement(boss),g=scene.add.graphics();world.add(g);
    label(scene,world,p.x,12,`The Benefactor  ${boss.hp}/${boss.maxHp}`,2);
    g.fillStyle(0x111421,.97).fillRect(p.x-153,23,306,10);
    g.lineStyle(1,0x9c895e).strokeRect(p.x-153,23,306,10);
    g.fillStyle(boss.intent?.phase==='The hollow heart'?0x9fbfc9:0xb19a66).fillRect(p.x-150,26,Math.floor(300*boss.hp/boss.maxHp),4);
    label(scene,world,p.x,42,boss.hp>0?(boss.intent?.phase??'Borrowed light'):'The claim is broken',1,'#b7c5d6');
    if(boss.hp>0&&boss.intent?.phase==='The hollow heart'){
      g.lineStyle(2,0xb2e8e4,.7).strokeCircle(p.x,p.y-151,23);
      g.lineStyle(1,0xe1c680,.8);for(const dx of [-30,30])g.lineBetween(p.x+dx,p.y-157,p.x+dx*1.6,p.y-181);
    }
  },
  pick(b,action,x,y){
    if(action==='move')return;
    const boss=bossUnit(b),u=active(b);if(!u||u.side!=='party'||boss.hp<=0)return;
    const p=placement(boss);if(x<p.x-180||x>p.x+180||y<p.y-288||y>p.y)return;
    const clicked=fromPixel(x,y);
    if(unitAt(b,clicked)?.id===BOSS_ID&&legalAim(b,u,action,clicked)&&targets(b,u,action,clicked).some(v=>v.id===BOSS_ID))return clicked;
    const parts=occupiedHexes(boss).sort((a,z)=>distance(u.hex,a)-distance(u.hex,z));
    return parts.find(h=>legalAim(b,u,action,h)&&targets(b,u,action,h).some(v=>v.id===boss.id))??parts[0];
  },
};
