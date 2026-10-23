import Phaser from 'phaser';
import type { BattlePresentation } from './battle-presentation';
import { enemyTurn,type Encounter } from '../rules/combat';
import { nativeTexture,bossLabel,bossPlacement,pickBossBody } from './boss-display';
import { bossMotionEnabled } from './boss-motion';
import { actorAsset } from '../content/actors';
import type { CompanionId } from '../rules/party';
import { offset,toPixel } from '../rules/hex';
import { EMPEROR_ID,LIGHTBEARER_ID,imperialCore,imperialSupports,prepareImperial } from '../rules/imperial-vessel';
import { BATTLE_MAPS } from '../content/battle-maps';
import { drawTileMap } from './tilemap';
import { newGame } from '../rules/state';
export const IMPERIAL_ASSETS=['imperial-idle','imperial-charge','imperial-cast','imperial-fallen','imperial-support','imperial-support-broken','lightbearer-idle','lightbearer-rise','lightbearer-cast','lightbearer-resist'].map(key=>({key,url:`art/vector/chapter-six/${key}.svg`}));
export const imperialPortrait=(light=false)=>`${import.meta.env.BASE_URL}art/vector/chapter-six/${light?'lightbearer':'imperial'}-portrait.svg`;
const masks=new Map<string,Uint8Array>();
export function imperialPresentation(encounter:Encounter):BattlePresentation{
 const light=encounter.boss==='lightbearer',base=light?'lightbearer-idle':'imperial-idle';let texture=base,pattern=0;
 return {
  encounter,prepare:prepareImperial,focus:offset(5,3),animating:b=>!b.result&&bossMotionEnabled(),
  enemyTurn(b,onRetaliation,onAction){pattern=(b.round-1)%4;return enemyTurn(b,onRetaliation,onAction);},
  portrait:u=>u.id===EMPEROR_ID||u.id===LIGHTBEARER_ID?imperialPortrait(light):undefined,
  facing:u=>u.side==='party'?actorAsset(u.kind as CompanionId,'back'):undefined,
  position:(u,h)=>u.anchored?bossPlacement({...u,hex:h}):undefined,
  hint:b=>`${imperialCore(b)?.intent?.phase}. ${light?'When her lantern closes, the mantle opens.':'Break both supports. Occupied broken mountings cannot rebuild.'}`,
  background(scene,world){drawTileMap(scene,world,BATTLE_MAPS[light?'lightbearer':'imperial-vessel'],newGame());},
  actor(scene,u,hp,h){
   if(!u.anchored)return;
   for(const {key}of IMPERIAL_ASSETS){const t=nativeTexture(scene,key),c=t.getSourceImage() as HTMLCanvasElement;if(!masks.has(key)){const rgba=c.getContext('2d')!.getImageData(0,0,c.width,c.height).data;masks.set(key,Uint8Array.from({length:c.width*c.height},(_,i)=>rgba[i*4+3]));}}
   const core=u.id===EMPEROR_ID||u.id===LIGHTBEARER_ID,p=bossPlacement({...u,hex:h}),image=scene.add.image(p.x,p.y,core?base:hp>0?'imperial-support':'imperial-support-broken').setOrigin(.5,1);
   if(hp<=0)image.setTint(0x71818a).setAlpha(.45);
   if(!core)return image;
   let started:number|undefined;
   const paint=()=>{
    if(!image.active)return;const elapsed=started===undefined?Infinity:scene.time.now-started,moving=hp>0&&bossMotionEnabled(),attack=moving&&elapsed<900;
    const resisting=light&&(u.intent?.name.startsWith('The lantern closes')??false);
    texture=!light&&hp<=0?'imperial-fallen':resisting?'lightbearer-resist':attack?(elapsed<260?light?'lightbearer-rise':'imperial-charge':elapsed<700?light?'lightbearer-cast':'imperial-cast':base):moving&&scene.time.now%4000>3000?light?'lightbearer-rise':'imperial-charge':base;
    if(image.texture.key!==texture)image.setTexture(texture);
    image.setData('actor-motion',attack?'attack':resisting?'resist':moving?light?'hover':'mechanical':'idle');
   };
   image.setData('imperial-attack',(elapsed:number)=>{started=scene.time.now-elapsed;paint();});scene.events.on(Phaser.Scenes.Events.UPDATE,paint);image.once('destroy',()=>scene.events.off(Phaser.Scenes.Events.UPDATE,paint));paint();return image;
  },
  attackTiming:u=>u.id===EMPEROR_ID||u.id===LIGHTBEARER_ID?{contact:380,duration:900}:undefined,
  attack:(_scene,image,u,elapsed)=>{if(u.id===EMPEROR_ID||u.id===LIGHTBEARER_ID)(image.getData('imperial-attack') as (n:number)=>void)(elapsed);},
  attackSound:u=>u.id===LIGHTBEARER_ID?'flare':u.id===EMPEROR_ID?'resonance':undefined,
  attackEffect(scene,world,_image,u,id,affected){
   if(id!=='judgment'||!u.anchored)return false;
   const g=scene.add.graphics();world.add(g);
   scene.tweens.addCounter({from:0,to:1,duration:bossMotionEnabled()?470:100,onUpdate:t=>{
    if(!g.active)return;const p=t.getValue()??0;g.clear().setAlpha(1-p);
    for(const h of affected){const at=toPixel(h);g.fillStyle(light?0xffefb6:0xadd5d5,.25).fillEllipse(at.x,at.y,42+p*12,24+p*8);g.lineStyle(3,light?0xffefb6:0xe5cf8a,.9).lineBetween(at.x,0,at.x,at.y).lineBetween(at.x-17,at.y,at.x+17,at.y);if(pattern===2)g.lineBetween(at.x-20,at.y-10,at.x+20,at.y+10);}
   },onComplete:()=>g.active&&g.destroy()});return true;
  },
  overlay(scene,world,b){
   const core=imperialCore(b)!,g=scene.add.graphics();world.add(g);g.fillStyle(0x243943,.96).fillRect(270,0,400,27);bossLabel(scene,world,470,14,`${light?'Lightbearer':'The Emperor'}  ${core.hp}/${core.maxHp}`,2);
   g.fillStyle(0x243943,.96).fillRect(315,28,310,11).fillStyle(light?0xf2d8a1:0xa8d3cf).fillRect(320,32,Math.round(300*core.hp/core.maxHp),4);
   g.fillStyle(0x243943,.94).fillRect(320,43,300,19);bossLabel(scene,world,470,53,core.intent?.name??'',1);
   if(!light)for(const [i,p]of imperialSupports(b).entries())bossLabel(scene,world,190+i*560,53,`${i?'East':'West'} ${p.hp}/${p.maxHp}`,1);
  },
  pick(b,action,x,y){
   const core=imperialCore(b)!;
   for(const part of imperialSupports(b)){const h=pickBossBody(b,action,x,y,part,96,160,masks.get('imperial-support'));if(h)return h;}
   return pickBossBody(b,action,x,y,core,528,280,masks.get(texture));
  },
 };
}
