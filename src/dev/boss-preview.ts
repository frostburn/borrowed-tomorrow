import type { BattlePresentation } from '../game/battle-presentation';
import { offset } from '../rules/hex';
import { BOSS_ENCOUNTER, BOSS_ID, bossTurn, bossUnit, prepareBoss } from './boss-battle';
import { actorAsset } from '../content/actors';
import type { CompanionId } from '../rules/party';
import { nativeTexture, bossLabel as label, bossPlacement as placement, pickBossBody } from '../game/boss-display';
import boss from './art/benefactor-motion.svg?url';
import domain from './art/benefactor-domain.svg?url';
import portrait from './art/benefactor-portrait.svg?url';
import { animateBoss, bossAttack, bossMotionEnabled, BOSS_FRAME_COUNT, BOSS_ATTACK_CONTACT, BOSS_ATTACK_DURATION } from '../game/boss-motion';

export {portrait as BOSS_PORTRAIT};
const textureKey='benefactor-motion',domainKey='benefactor-domain';
export const BOSS_ASSETS=[{key:textureKey,url:boss},{key:domainKey,url:domain}];
let masks:Uint8Array[]|undefined,currentFrame=0;

export const BOSS_PRESENTATION:BattlePresentation={
  encounter:BOSS_ENCOUNTER,prepare:prepareBoss,enemyTurn:bossTurn,focus:offset(5,2),
  animating:b=>bossUnit(b).hp>0&&bossMotionEnabled(),
  portrait:unit=>unit.id===BOSS_ID?portrait:undefined,
  facing:unit=>unit.side==='party'?actorAsset(unit.kind as CompanionId,'back'):undefined,
  hint:b=>`${bossUnit(b).intent?.name??'Judgment'}: red X hexes are struck on the god's turn.`,
  background(scene,world){
    nativeTexture(scene,domainKey);
    world.add(scene.add.image(0,0,domainKey).setOrigin(0));
  },
  actor(scene,unit,hp){
    if(unit.id!==BOSS_ID)return;
    const texture=nativeTexture(scene,textureKey),surface=texture.getSourceImage() as HTMLCanvasElement;
    if(!texture.has('0'))for(let i=0;i<BOSS_FRAME_COUNT;i++)texture.add(String(i),0,i%2*360,Math.floor(i/2)*288,360,288);
    masks??=Array.from({length:BOSS_FRAME_COUNT},(_,i)=>{
      const pixels=surface.getContext('2d')!.getImageData(i%2*360,Math.floor(i/2)*288,360,288).data;
      return Uint8Array.from({length:360*288},(_,p)=>pixels[p*4+3]);
    });
    const p=placement(unit),image=scene.add.image(p.x,p.y,textureKey,0).setOrigin(.5,1);
    animateBoss(scene,image,hp>0,frame=>{currentFrame=frame;});return image;
  },
  attackTiming:unit=>unit.id===BOSS_ID?{contact:BOSS_ATTACK_CONTACT,duration:BOSS_ATTACK_DURATION}:undefined,
  attack:(scene,image,unit,elapsed)=>{if(unit.id===BOSS_ID)bossAttack(scene,image,elapsed);},
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
    return pickBossBody(b,action,x,y,bossUnit(b),360,288,masks?.[currentFrame]);
  },
};
