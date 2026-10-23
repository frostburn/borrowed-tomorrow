import Phaser from 'phaser';
import type { BattlePresentation } from './battle-presentation';
import type { Encounter } from '../rules/combat';
import { nativeTexture,bossLabel,bossPlacement,pickBossBody } from './boss-display';
import { bossMotionEnabled } from './boss-motion';
import { actorAsset } from '../content/actors';
import type { CompanionId } from '../rules/party';
import { offset,toPixel } from '../rules/hex';
import { WINTER_DRAGON_ID,winterDragon,prepareWinterDragon } from '../rules/winter-dragon';
import { BATTLE_MAPS } from '../content/battle-maps';
import { drawTileMap } from './tilemap';
import { newGame } from '../rules/state';
export const DRAGON_PORTRAIT=`${import.meta.env.BASE_URL}art/vector/chapter-six/dragon-portrait.svg`;
export const DRAGON_ASSETS=['winter-dragon','dragon-inhale','dragon-breath','dragon-shatter'].map(key=>({key,url:`art/vector/chapter-six/${key}.svg`}));
const masks=new Map<string,Uint8Array>();
export function winterDragonPresentation(encounter:Encounter):BattlePresentation{
 let texture='winter-dragon';
 return {
  encounter,prepare:prepareWinterDragon,focus:offset(5,3),animating:b=>!b.result&&bossMotionEnabled(),
  portrait:u=>u.id===WINTER_DRAGON_ID?DRAGON_PORTRAIT:undefined,
  facing:u=>u.side==='party'?actorAsset(u.kind as CompanionId,'back'):undefined,
  position:(u,hex)=>u.id===WINTER_DRAGON_ID?bossPlacement({...u,hex}):undefined,
  hint:b=>`${winterDragon(b)?.intent?.phase}. Loose ice costs 2 movement and deals 6 cold damage at round end.`,
  background(scene,world){drawTileMap(scene,world,BATTLE_MAPS['winter-dragon'],newGame());},
  actor(scene,u,hp,hex){
   if(u.id!==WINTER_DRAGON_ID)return;
   for(const {key}of DRAGON_ASSETS){
    const native=nativeTexture(scene,key);
    if(!masks.has(key)){const c=native.getSourceImage() as HTMLCanvasElement,rgba=c.getContext('2d')!.getImageData(0,0,528,280).data;masks.set(key,Uint8Array.from({length:528*280},(_,i)=>rgba[i*4+3]));}
   }
   const p=bossPlacement({...u,hex}),image=scene.add.image(p.x,p.y,'winter-dragon').setOrigin(.5,1);
   if(hp<=0)image.setTint(0x61717e).setAlpha(.42);
   let started:number|undefined;
   const pattern=()=>u.intent?.name.toLowerCase().includes('shatter')?'dragon-shatter':u.intent?.name.toLowerCase().includes('drawn')?'dragon-inhale':'dragon-breath';
   const paint=()=>{
    if(!image.active)return;
    const elapsed=started===undefined?Infinity:scene.time.now-started,moving=hp>0&&bossMotionEnabled(),attacking=moving&&elapsed<950;
    texture=attacking?(elapsed<320?'dragon-inhale':elapsed<730?pattern():'winter-dragon'):moving&&scene.time.now%4200>3150?'dragon-inhale':'winter-dragon';
    if(image.texture.key!==texture)image.setTexture(texture);
    image.setData('actor-motion',attacking?'attack':moving?'breathe':'idle');
   };
   image.setData('dragon-attack',(elapsed:number)=>{started=scene.time.now-elapsed;paint();});
   scene.events.on(Phaser.Scenes.Events.UPDATE,paint);image.once('destroy',()=>scene.events.off(Phaser.Scenes.Events.UPDATE,paint));paint();
   return image;
  },
  attackTiming:u=>u.id===WINTER_DRAGON_ID?{contact:400,duration:950}:undefined,
  attack:(_scene,image,u,elapsed)=>{if(u.id===WINTER_DRAGON_ID)(image.getData('dragon-attack') as (n:number)=>void)(elapsed);},
  attackSound:u=>u.id===WINTER_DRAGON_ID?'steam':undefined,
  attackEffect(scene,world,image,u,id,affected){
   if(u.id!==WINTER_DRAGON_ID||id!=='judgment')return false;
   const g=scene.add.graphics();world.add(g);const inhale=u.intent?.name.toLowerCase().includes('drawn');
   scene.tweens.addCounter({from:0,to:1,duration:bossMotionEnabled()?470:100,onUpdate:t=>{
    if(!g.active)return;const p=t.getValue()??0;g.clear().setAlpha(1-p);
    for(const h of affected){const at=toPixel(h),mouth={x:image.x,y:image.y-126};
     g.lineStyle(9,0x91d8e4,.16).lineBetween(mouth.x,mouth.y,at.x,at.y);
     g.lineStyle(2,0xd5eff0,.8);
     if(inhale){const q=1-p;g.strokeEllipse(mouth.x+(at.x-mouth.x)*q,mouth.y+(at.y-mouth.y)*q,20+q*17,8+q*9);}
     else{g.fillStyle(0xb9e2e9,.45).fillEllipse(at.x,at.y,30+p*19,17+p*10);g.lineBetween(at.x-17,at.y+8,at.x+14,at.y-7).lineBetween(at.x-11,at.y-8,at.x+10,at.y+9);}
    }
   },onComplete:()=>g.active&&g.destroy()});return true;
  },
  overlay(scene,world,b){
   const dragon=winterDragon(b)!,g=scene.add.graphics();world.add(g);
   g.fillStyle(0x233b55,.96).fillRect(300,0,340,27);bossLabel(scene,world,470,14,`Winter dragon  ${dragon.hp}/${dragon.maxHp}`,2);
   g.fillStyle(0x233b55,.95).fillRect(315,28,310,11).fillStyle(0xaedce3).fillRect(320,32,Math.round(300*dragon.hp/dragon.maxHp),4);
   for(const h of b.winterIce??[]){const p=toPixel(h);g.fillStyle(0x82c6dc,.3).fillEllipse(p.x,p.y,44,25);g.lineStyle(2,0xd8f1ef,.95).lineBetween(p.x-18,p.y+6,p.x-3,p.y-5).lineBetween(p.x-3,p.y-5,p.x+16,p.y+5).lineBetween(p.x-3,p.y-5,p.x+7,p.y-12);}
  },
  pick:(b,action,x,y)=>pickBossBody(b,action,x,y,winterDragon(b)!,528,280,masks.get(texture)),
 };
}
