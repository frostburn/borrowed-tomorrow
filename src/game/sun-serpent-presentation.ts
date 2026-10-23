import Phaser from 'phaser';
import type { BattlePresentation } from './battle-presentation';
import { nativeTexture,bossLabel,bossPlacement,pickBossBody } from './boss-display';
import { bossMotionEnabled } from './boss-motion';
import { actorAsset } from '../content/actors';
import type { CompanionId } from '../rules/party';
import type { Encounter } from '../rules/combat';
import { offset,toPixel } from '../rules/hex';
import { SUN_SERPENT_ID,serpentHead,serpentCoils,prepareSerpent } from '../rules/sun-serpent';
import { BATTLE_MAPS } from '../content/battle-maps';
import { drawTileMap } from './tilemap';
import { newGame } from '../rules/state';
export const SERPENT_PORTRAIT=`${import.meta.env.BASE_URL}art/vector/chapter-six/serpent-portrait.svg`;
export const SERPENT_ASSETS=['serpent-head','serpent-inhale','serpent-fire','serpent-west','serpent-east'].map(key=>({key,url:`art/vector/chapter-six/${key}.svg`}));
const masks=new Map<string,Uint8Array>();
export function serpentPresentation(encounter:Encounter):BattlePresentation{
 let headTexture='serpent-head';
 return {
  encounter,prepare:prepareSerpent,focus:offset(5,3),animating:b=>!b.result&&bossMotionEnabled(),
  portrait:u=>u.id===SUN_SERPENT_ID||u.kind==='serpent-coil'?SERPENT_PORTRAIT:undefined,
  facing:u=>u.side==='party'?actorAsset(u.kind as CompanionId,'back'):undefined,
  position:(u,hex)=>u.id===SUN_SERPENT_ID||u.kind==='serpent-coil'?bossPlacement({...u,hex}):undefined,
  hint:b=>`${serpentHead(b)?.intent?.phase}. Broken coils weaken armor and stop reflections.`,
  background(scene,world){drawTileMap(scene,world,BATTLE_MAPS['sun-serpent'],newGame());},
  actor(scene,u,hp,hex){
   if(u.id!==SUN_SERPENT_ID&&u.kind!=='serpent-coil')return;
   const head=u.id===SUN_SERPENT_ID,size=head?{w:296,h:244}:{w:128,h:112};
   for(const key of head?['serpent-head','serpent-inhale','serpent-fire']:[u.id]){
    const texture=nativeTexture(scene,key);
    if(!masks.has(key)){const c=texture.getSourceImage() as HTMLCanvasElement,rgba=c.getContext('2d')!.getImageData(0,0,size.w,size.h).data;masks.set(key,Uint8Array.from({length:size.w*size.h},(_,i)=>rgba[i*4+3]));}
   }
   const p=bossPlacement({...u,hex}),image=scene.add.image(p.x,p.y,head?'serpent-head':u.id).setOrigin(.5,1);
   if(!head&&hp>0)image.setTint(u.sealed?0x9b9f8a:0xffffff);
   if(hp<=0)image.setTint(0x675f54).setAlpha(.42);
   if(head){
    let started:number|undefined;
    const paint=()=>{
     if(!image.active)return;
     const elapsed=started===undefined?Infinity:scene.time.now-started,moving=hp>0&&bossMotionEnabled(),attacking=moving&&elapsed<860;
     headTexture=attacking?elapsed<300?'serpent-inhale':elapsed<650?'serpent-fire':'serpent-head':moving&&scene.time.now%3400>2350?'serpent-inhale':'serpent-head';
     if(image.texture.key!==headTexture)image.setTexture(headTexture);
     image.setData('actor-motion',attacking?'attack':moving?'breathe':'idle');
    };
    image.setData('serpent-attack',(elapsed:number)=>{started=scene.time.now-elapsed;paint();});
    scene.events.on(Phaser.Scenes.Events.UPDATE,paint);image.once('destroy',()=>scene.events.off(Phaser.Scenes.Events.UPDATE,paint));paint();
   }
   return image;
  },
  attackTiming:u=>u.id===SUN_SERPENT_ID?{contact:380,duration:860}:undefined,
  attack:(_scene,image,u,elapsed)=>{if(u.id===SUN_SERPENT_ID)(image.getData('serpent-attack') as (elapsed:number)=>void)(elapsed);},
  attackSound:u=>u.id===SUN_SERPENT_ID?'burst':undefined,
  attackEffect(scene,world,image,u,id,affected){
   if(u.id!==SUN_SERPENT_ID||id!=='judgment')return false;
   const g=scene.add.graphics();world.add(g);
   scene.tweens.addCounter({from:0,to:1,duration:bossMotionEnabled()?420:100,onUpdate:t=>{
    if(!g.active)return;const p=t.getValue()??0;g.clear().setAlpha(1-p);
    for(const h of affected){const at=toPixel(h);g.lineStyle(9,0xdfa557,.22).lineBetween(image.x,image.y-154,at.x,at.y);g.lineStyle(2,0xf3d9a0,.8).lineBetween(image.x,image.y-154,at.x,at.y);g.fillStyle(0xd9c387,.45).fillEllipse(at.x,at.y,30+p*20,16+p*12);}
   },onComplete:()=>g.active&&g.destroy()});return true;
  },
  overlay(scene,world,b){
   const head=serpentHead(b)!,g=scene.add.graphics();world.add(g);
   g.fillStyle(0x243943,.96).fillRect(300,0,340,27);
   bossLabel(scene,world,470,14,`Sun serpent  ${head.hp}/${head.maxHp}`,2);
   g.fillStyle(0x243943,.95).fillRect(315,28,310,11).fillStyle(0xd6ae6b).fillRect(320,32,Math.round(300*head.hp/head.maxHp),4);
   for(const coil of serpentCoils(b)){const p=bossPlacement(coil);bossLabel(scene,world,p.x,p.y-123,coil.hp<=0?'Coil broken':coil.sealed?'Tight coil':'LOOSE COIL',1,coil.sealed?'#a6a78c':'#f1d19a');if(coil.hp>0)bossLabel(scene,world,p.x,p.y-109,`${coil.hp}/${coil.maxHp}`,1);}
   for(const h of b.sunGlass?.cells??[]){const p=toPixel(h);g.lineStyle(2,0x9ac6be,.8).strokePoints([[-15,0],[0,-8],[15,0],[0,8]].map(([x,y])=>new Phaser.Math.Vector2(p.x+x,p.y+y)),true);}
  },
  pick(b,action,x,y){
   for(const coil of serpentCoils(b)){const hit=pickBossBody(b,action,x,y,coil,128,112,masks.get(coil.id));if(hit)return hit;}
   return pickBossBody(b,action,x,y,serpentHead(b)!,296,244,masks.get(headTexture));
  },
 };
}
