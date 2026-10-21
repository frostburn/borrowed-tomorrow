import Phaser from 'phaser';
import type { BattlePreview } from '../game/battle-preview';
import { bitmapText } from '../game/pixel-font';
import { ABILITIES, active, legalAim, targets, unitAt, type Unit } from '../rules/combat';
import { occupiedHexes } from '../rules/footprint';
import { distance, fromPixel, offset, toPixel } from '../rules/hex';
import { BOSS_ENCOUNTER, BOSS_ID, bossTurn, bossUnit, prepareBoss } from './boss-battle';
import { actorAsset } from '../content/actors';
import type { CompanionId } from '../rules/party';
import { vectorSurface } from '../game/vector-image';
import boss from './art/benefactor-motion.svg?url';
import domain from './art/benefactor-domain.svg?url';
import portrait from './art/benefactor-portrait.svg?url';
import { breathe, bossAttack, bossMotionEnabled, BOSS_FRAME_COUNT, BOSS_ATTACK_CONTACT, BOSS_ATTACK_DURATION } from './boss-motion';

export {portrait as BOSS_PORTRAIT};
const textureKey='benefactor-motion',domainKey='benefactor-domain';
export const BOSS_ASSETS=[{key:textureKey,url:boss},{key:domainKey,url:domain}];
let labelId=0;
let masks:Uint8Array[]|undefined,currentFrame=0;
function nativeTexture(scene:Phaser.Scene,key:string){
  const texture=scene.textures.get(key);
  for(const source of texture.source)if(source.image instanceof HTMLImageElement){
    source.source=source.image=vectorSurface(source.image);source.isCanvas=true;source.update();
  }
  texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
  return texture;
}
function label(scene:Phaser.Scene,world:Phaser.GameObjects.Container,x:number,y:number,value:string,scale=1,color='#f4d9aa'){
  const canvas=document.createElement('canvas');canvas.width=value.length*(scale===1?8:6*scale);canvas.height=9*scale;
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
    breathe(scene,image,hp>0,frame=>{currentFrame=frame;});return image;
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
    if(action==='move'||ABILITIES[action].heal||['guard','focus','taunt'].includes(ABILITIES[action].effect??''))return;
    const boss=bossUnit(b),u=active(b);if(!u||u.side!=='party'||boss.hp<=0)return;
    const p=placement(boss);if(x<p.x-180||x>p.x+180||y<p.y-288||y>p.y)return;
    const clicked=fromPixel(x,y);
    const direct=unitAt(b,clicked);if(direct&&direct.id!==BOSS_ID)return;
    if(unitAt(b,clicked)?.id===BOSS_ID&&legalAim(b,u,action,clicked)&&targets(b,u,action,clicked).some(v=>v.id===BOSS_ID))return clicked;
    const px=Math.floor(x-p.x+180),py=Math.floor(y-p.y+288);
    if(px<0||px>=360||py<0||py>=288||masks?.[currentFrame][py*360+px]===0)return;
    const parts=occupiedHexes(boss).sort((a,z)=>distance(u.hex,a)-distance(u.hex,z));
    return parts.find(h=>legalAim(b,u,action,h)&&targets(b,u,action,h).some(v=>v.id===boss.id))??parts[0];
  },
};
