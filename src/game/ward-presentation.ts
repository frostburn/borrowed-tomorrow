import type { BattlePresentation } from './battle-presentation';
import { enemyTurn,type Encounter } from '../rules/combat';
import { offset,toPixel,type Hex } from '../rules/hex';
import { actorAsset } from '../content/actors';
import type { CompanionId } from '../rules/party';
import { WARD_ID,wardUnit,wardMirrors,prepareWard } from '../rules/ward';
import { BATTLE_MAPS } from '../content/battle-maps';
import { drawTileMap } from './tilemap';
import { nativeTexture,bossLabel,bossPlacement,pickBossBody } from './boss-display';
import { newGame } from '../rules/state';
const textureKey='ward-engine-battle';
export const WARD_ASSETS=[{key:textureKey,url:'art/vector/chapter-five/ward-engine-battle.svg'}];
let mask:Uint8Array|undefined;
export function wardPresentation(encounter:Encounter):BattlePresentation{
 let source:Hex|undefined;
 return {
  encounter,prepare:prepareWard,focus:offset(5,3),
  portrait:u=>u.id===WARD_ID?`${import.meta.env.BASE_URL}art/vector/portrait-ward-engine.svg`:undefined,
  facing:u=>u.side==='party'?actorAsset(u.kind as CompanionId,'back'):undefined,
  position:(u,hex)=>u.id===WARD_ID?bossPlacement({...u,hex}):undefined,
  hint:b=>`${wardUnit(b)?.intent?.name??'Optical circuit'} · break the lit projection to interrupt this beam and open the core. Both gone: core stays open.`,
  background(scene,world){drawTileMap(scene,world,BATTLE_MAPS[encounter.id]??BATTLE_MAPS['wind-engine'],newGame());},
  actor(scene,u,_hp,hex){
   if(u.id!==WARD_ID)return;
   const texture=nativeTexture(scene,textureKey),surface=texture.getSourceImage() as HTMLCanvasElement;
   if(!mask){const rgba=surface.getContext('2d')!.getImageData(0,0,256,240).data;mask=Uint8Array.from({length:256*240},(_,p)=>rgba[p*4+3]);}
   const p=bossPlacement({...u,hex});return scene.add.image(p.x,p.y,textureKey).setOrigin(.5,1);
  },
  // Capture the fired mirror before enemyTurn can roll into a new announcement.
  enemyTurn(b,...args){const u=wardUnit(b);source=wardMirrors(b).find(m=>m.id===u?.intent?.via)?.hex;return enemyTurn(b,...args);},
  attackTiming:u=>u.id===WARD_ID?{contact:380,duration:780}:undefined,
  attack(scene,image,u,elapsed){if(u.id===WARD_ID&&!elapsed)scene.tweens.add({targets:image,alpha:.7,duration:170,yoyo:true,repeat:1});},
  attackEffect(scene,world,image,u,id,affected){
   if(u.id!==WARD_ID||id!=='refraction')return false;
   if(!affected.length)return true;
   const core=bossPlacement(u),mirror=source?toPixel(source):undefined,origin=mirror?{x:mirror.x,y:mirror.y-25}:{x:core.x,y:core.y-120};
   const g=scene.add.graphics();world.add(g);
   scene.tweens.addCounter({from:0,to:1,duration:330,onUpdate:t=>{if(!g.active)return;const p=t.getValue()??0;g.clear().setAlpha(1-p);
    if(source)g.lineStyle(7,0xe3d7a7,.8).lineBetween(image.x,image.y-120,origin.x,origin.y);
    for(const h of affected){const at=toPixel(h);g.lineStyle(5,0xaacbb5,.7).lineBetween(origin.x,origin.y,at.x,at.y);g.lineStyle(2,0xffedb9).lineBetween(origin.x,origin.y,at.x,at.y);g.fillStyle(0xe1e1af,.6).fillEllipse(at.x,at.y,32+p*15,16+p*8);}
   },onComplete:()=>{if(g.active)g.destroy();}});return true;
  },
  overlay(scene,world,b){
   const u=wardUnit(b)!;bossLabel(scene,world,512,16,`Mirrored ward engine  ${u.hp}/${u.maxHp}`,2);
   const g=scene.add.graphics();world.add(g);g.fillStyle(0x18252b,.97).fillRect(359,29,306,10).fillStyle(0xa4c6ae).fillRect(362,32,Math.floor(300*u.hp/u.maxHp),4);
   bossLabel(scene,world,512,49,u.hp<=0?'Engine stopped':u.sealed?'Core sealed · break the lit projection':'Core exposed',1);
   for(const m of wardMirrors(b).filter(m=>m.hp>0)){
    const p=toPixel(m.hex),lit=m.id===u.intent?.via;
    bossLabel(scene,world,p.x,p.y-77,lit?'LIT PROJECTION':'PROJECTION',1);
    if(lit)g.lineStyle(3,0xf3df9c,.8).strokeEllipse(p.x,p.y-25,70,72);
   }
  },
  pick:(b,action,x,y)=>pickBossBody(b,action,x,y,wardUnit(b)!,256,240,mask),
 };
}
