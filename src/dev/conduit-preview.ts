import type Phaser from 'phaser';
import type { BattlePreview } from '../game/battle-preview';
import { actorAsset } from '../content/actors';
import type { CompanionId } from '../rules/party';
import { offset, toPixel } from '../rules/hex';
import { CONDUIT_ENCOUNTERS, REGULATOR_ID, conduitTurn, prepareConduit, regulatorUnit, type ConduitRoute } from './conduit-battle';
import { nativeTexture, bossLabel, bossPlacement, pickBossBody } from './boss-display';
import { breathe, bossAttack, bossMotionEnabled, BOSS_FRAME_COUNT, BOSS_ATTACK_CONTACT, BOSS_ATTACK_DURATION } from './boss-motion';
import motion from './art/conduit-regulator-motion.svg?url';
import chamber from './art/conduit-chamber.svg?url';
import portrait from './art/conduit-regulator-portrait.svg?url';

export {portrait as CONDUIT_PORTRAIT};
const textureKey='conduit-regulator-motion',chamberKey='conduit-chamber';
export const CONDUIT_ASSETS=[{key:textureKey,url:motion},{key:chamberKey,url:chamber}];
let masks:Uint8Array[]|undefined,currentFrame=0;

function pressureEffect(scene:Phaser.Scene,world:Phaser.GameObjects.Container,source:{x:number;y:number},affected:{q:number;r:number}[]){
  const g=scene.add.graphics();world.add(g);
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  scene.tweens.addCounter({from:0,to:1,duration:reduced?100:280,onUpdate:t=>{
    if(!g.active)return;const p=t.getValue()??0;g.clear();g.setAlpha(1-p);
    for(const hex of affected){
      const at=toPixel(hex),hand={x:source.x+(at.x<source.x?-64:64),y:source.y-65};
      g.lineStyle(6,0xb5d7ce,.45).lineBetween(hand.x,hand.y,at.x,at.y-12);
      g.lineStyle(2,0xe1e5cc,.9).lineBetween(hand.x,hand.y,at.x,at.y-12);
      for(let i=0;i<3;i++)g.fillStyle(0xc0d8ca,.5).fillEllipse(at.x+(i-1)*10,at.y-12-p*(14+i*5),16+p*22,10+p*16);
      g.lineStyle(2,0x99c9c5,.85).strokeEllipse(at.x,at.y,34+p*16,12+p*8);
    }
  },onComplete:()=>{if(g.active)g.destroy();}});
}

export function conduitPresentation(route:ConduitRoute):BattlePreview{
  return {
    encounter:CONDUIT_ENCOUNTERS[route],prepare:prepareConduit,enemyTurn:conduitTurn,focus:offset(5,3),
    animating:b=>regulatorUnit(b).hp>0&&bossMotionEnabled(),
    portrait:u=>u.id===REGULATOR_ID?portrait:undefined,
    facing:u=>u.side==='party'?actorAsset(u.kind as CompanionId,'back'):undefined,
    hint:b=>`${regulatorUnit(b).intent?.name??'Pressure cycle'}: move clear of the red X hexes before the regulator fires.`,
    background(scene,world){nativeTexture(scene,chamberKey);world.add(scene.add.image(0,0,chamberKey).setOrigin(0));},
    actor(scene,u,hp){
      if(u.id!==REGULATOR_ID)return;
      const texture=nativeTexture(scene,textureKey),surface=texture.getSourceImage() as HTMLCanvasElement;
      if(!texture.has('0'))for(let i=0;i<BOSS_FRAME_COUNT;i++)texture.add(String(i),0,i%2*256,Math.floor(i/2)*240,256,240);
      masks??=Array.from({length:BOSS_FRAME_COUNT},(_,i)=>{
        const pixels=surface.getContext('2d')!.getImageData(i%2*256,Math.floor(i/2)*240,256,240).data;
        return Uint8Array.from({length:256*240},(_,p)=>pixels[p*4+3]);
      });
      const p=bossPlacement(u),image=scene.add.image(p.x,p.y,textureKey,0).setOrigin(.5,1);
      breathe(scene,image,hp>0,frame=>{currentFrame=frame;});return image;
    },
    attackTiming:u=>u.id===REGULATOR_ID?{contact:BOSS_ATTACK_CONTACT,duration:BOSS_ATTACK_DURATION}:undefined,
    attack:(scene,image,u,elapsed)=>{if(u.id===REGULATOR_ID)bossAttack(scene,image,elapsed);},
    attackSound:(u,id)=>u.id===REGULATOR_ID&&id==='judgment'?'steam':undefined,
    attackEffect(scene,world,image,u,id,affected){
      if(u.id!==REGULATOR_ID||id!=='judgment')return false;
      pressureEffect(scene,world,image,affected);return true;
    },
    overlay(scene,world,b){
      const u=regulatorUnit(b),p=bossPlacement(u),g=scene.add.graphics();world.add(g);
      bossLabel(scene,world,p.x,12,`Heart regulator  ${u.hp}/${u.maxHp}`,2);
      g.fillStyle(0x101d28,.97).fillRect(p.x-153,23,306,10);g.lineStyle(1,0x9c895e).strokeRect(p.x-153,23,306,10);
      g.fillStyle(u.sealed?0x86b7bf:0xb99b63).fillRect(p.x-150,26,Math.floor(300*u.hp/u.maxHp),4);
      bossLabel(scene,world,p.x,42,u.hp<=0?'Regulator stopped':u.sealed?'Shielded · earth both plates':'Seal released',1,'#b7c5c1');
      if(u.hp>0&&u.sealed){
        g.lineStyle(2,0x96cfc9,.65).strokeEllipse(p.x,p.y-113,148,180);
        g.lineStyle(2,0x96cfc9,.4).strokeEllipse(p.x,p.y-113,170,194);
      }
    },
    pick:(b,action,x,y)=>pickBossBody(b,action,x,y,regulatorUnit(b),256,240,masks?.[currentFrame]),
  };
}
