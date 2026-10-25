import {BATTLE_MAPS} from '../content/battle-maps';
import {drawTileMap} from './tilemap';
import {newGame} from '../rules/state';
import type Phaser from 'phaser';
import type { BattlePresentation } from './battle-presentation';
import { actorAsset } from '../content/actors';
import type { CompanionId } from '../rules/party';
import { offset, toPixel } from '../rules/hex';
import type { Encounter } from '../rules/combat';
import { REGULATOR_ID } from '../content/chapter-three/regulator';
import { prepareConduit, regulatorUnit } from '../rules/conduit';
import { nativeTexture, bossLabel, bossPlacement, pickBossBody } from './boss-display';
import { animateBoss, bossAttack, bossMotionEnabled, BOSS_FRAME_COUNT, BOSS_ATTACK_CONTACT, BOSS_ATTACK_DURATION } from './boss-motion';
export const CONDUIT_PORTRAIT=`${import.meta.env.BASE_URL}art/vector/bosses/conduit-regulator-portrait.svg`;
const textureKey='conduit-regulator-motion',chamberKey='conduit-chamber';
export const CONDUIT_ASSETS=[{key:textureKey,url:'art/vector/bosses/conduit-regulator-motion.svg'},{key:chamberKey,url:'art/vector/bosses/conduit-chamber.svg'},{key:'conduit-regulator-portrait',url:'art/vector/bosses/conduit-regulator-portrait.svg'}];
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

export function conduitPresentation(encounter:Encounter):BattlePresentation{
  return {
    encounter,prepare:prepareConduit,focus:offset(5,3),
    lighting:encounter.id==='domain-collector'?{scene:'battle-domain-collector',ground:'M72 78L330 68L510 82L708 68L888 82L906 444L704 460L490 446L280 462L72 446Z'}:{scene:'conduit-regulator',ground:'M145 176H781L812 202V414L785 438H145L116 414V205Z'},
    animating:b=>regulatorUnit(b).hp>0&&bossMotionEnabled(),
    portrait:u=>u.id===REGULATOR_ID?CONDUIT_PORTRAIT:undefined,
    facing:u=>u.side==='party'?actorAsset(u.kind as CompanionId,'back'):undefined,
    hint:b=>`${regulatorUnit(b).intent?.name??'Pressure cycle'}: move clear of the red X hexes before the regulator fires.`,
    background(scene,world){
      if(encounter.id==='domain-collector'){drawTileMap(scene,world,BATTLE_MAPS[encounter.id],newGame());return;}
      nativeTexture(scene,chamberKey);world.add(scene.add.image(0,0,chamberKey).setOrigin(0).setDepth(-1000));},
    actor(scene,u,hp){
      if(u.id!==REGULATOR_ID)return;
      const texture=nativeTexture(scene,textureKey),surface=texture.getSourceImage() as HTMLCanvasElement;
      if(!texture.has('0'))for(let i=0;i<BOSS_FRAME_COUNT;i++)texture.add(String(i),0,i%2*256,Math.floor(i/2)*240,256,240);
      masks??=Array.from({length:BOSS_FRAME_COUNT},(_,i)=>{
        const pixels=surface.getContext('2d')!.getImageData(i%2*256,Math.floor(i/2)*240,256,240).data;
        return Uint8Array.from({length:256*240},(_,p)=>pixels[p*4+3]);
      });
      const p=bossPlacement(u),image=scene.add.image(p.x,p.y,textureKey,0).setOrigin(.5,1);
      animateBoss(scene,image,hp>0,frame=>{currentFrame=frame;},{motion:'mechanical',cycleMs:1600});return image;
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
      bossLabel(scene,world,p.x,12,`${u.name}  ${u.hp}/${u.maxHp}`,2);
      g.fillStyle(0x101d28,.97).fillRect(p.x-153,23,306,10);g.lineStyle(1,0x9c895e).strokeRect(p.x-153,23,306,10);
      g.fillStyle(u.sealed?0x86b7bf:0xb99b63).fillRect(p.x-150,26,Math.floor(300*u.hp/u.maxHp),4);
      bossLabel(scene,world,p.x,42,u.hp<=0?'Collector stopped':u.sealed?'Shielded · earth both plates':b.grounding?'Seal released':u.intent?.name??'Pressure cycle',1,'#b7c5c1');
      if(u.hp>0&&u.sealed){
        g.lineStyle(2,0x96cfc9,.65).strokeEllipse(p.x,p.y-113,148,180);
        g.lineStyle(2,0x96cfc9,.4).strokeEllipse(p.x,p.y-113,170,194);
      }
    },
    pick:(b,action,x,y)=>pickBossBody(b,action,x,y,regulatorUnit(b),256,240,masks?.[currentFrame]),
  };
}
