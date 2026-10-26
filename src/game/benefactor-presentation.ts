import type {BattlePresentation} from './battle-presentation';
import type {Encounter} from '../rules/combat';
import {BENEFACTOR_ID,benefactorUnit,prepareBenefactor} from '../rules/benefactor';
import {offset} from '../rules/hex';
import {actorAsset} from '../content/actors';
import {actorAtlasPages} from '../content/actor-art-skin';
import {benefactorDomainArt} from '../content/scene-art';
import {BATTLE_MAPS} from '../content/battle-maps';
import {newGame} from '../rules/state';
import {drawTileMap} from './tilemap';
import type {CompanionId} from '../rules/party';
import {BossMaskCache,nativeTexture,bossLabel as label,bossPlacement as placement,pickBossBody} from './boss-display';
import {animateBoss,bossAttack,bossMotionEnabled,BOSS_FRAME_COUNT,BOSS_ATTACK_CONTACT,BOSS_ATTACK_DURATION} from './boss-motion';
export const BENEFACTOR_PORTRAIT=`${import.meta.env.BASE_URL}art/vector/benefactor/benefactor-portrait.svg`;
export const BENEFACTOR_ASSETS=[
 ...['benefactor-motion','benefactor-sun-motion','benefactor-heart-motion'].map(key=>({key,url:`art/vector/benefactor/${key}.svg`})),
 ...benefactorDomainArt('vector'),...benefactorDomainArt('raster'),...actorAtlasPages('benefactor'),
];
const masks=new BossMaskCache<Uint8Array[]>();
export function benefactorPresentation(encounter:Encounter):BattlePresentation{
 const form=encounter.benefactorForm??0,key=form===0?'benefactor-motion':form===1?'benefactor-sun-motion':'benefactor-heart-motion';let currentFrame=0;
 return {
  encounter,prepare:prepareBenefactor,focus:offset(5,2),
  lighting:{scene:'battle-'+encounter.id,ground:'M148 94H783L833 152V407L782 443H148L101 401V152Z'},
  animating:b=>(benefactorUnit(b)?.hp??0)>0&&bossMotionEnabled(),
  portrait:u=>u.id===BENEFACTOR_ID?BENEFACTOR_PORTRAIT:undefined,
  facing:u=>u.side==='party'?actorAsset(u.kind as CompanionId,'back'):undefined,
  hint:b=>`${benefactorUnit(b)?.intent?.name??'Judgment'} · the marked hexes are struck on the god’s turn.`,
  background:(scene,world)=>drawTileMap(scene,world,BATTLE_MAPS[`benefactor-${['body','sun','heart'][form]}`],newGame()),
  actor(scene,u,hp){
   if(u.id!==BENEFACTOR_ID)return;
   const texture=nativeTexture(scene,key),surface=texture.getSourceImage() as HTMLCanvasElement;
   if(!texture.has('0'))for(let i=0;i<BOSS_FRAME_COUNT;i++)texture.add(String(i),0,i%2*360,Math.floor(i/2)*288,360,288);
   if(!masks.has(key))masks.set(key,Array.from({length:BOSS_FRAME_COUNT},(_,i)=>{const p=surface.getContext('2d')!.getImageData(i%2*360,Math.floor(i/2)*288,360,288).data;return Uint8Array.from({length:360*288},(_,j)=>p[j*4+3]);}));
   const p=placement(u),image=scene.add.image(p.x,p.y,key,0).setOrigin(.5,1);animateBoss(scene,image,hp>0,frame=>{currentFrame=frame;});return image;
  },
  attackTiming:u=>u.id===BENEFACTOR_ID?{contact:BOSS_ATTACK_CONTACT,duration:BOSS_ATTACK_DURATION}:undefined,
  attack:(scene,image,u,elapsed)=>{if(u.id===BENEFACTOR_ID)bossAttack(scene,image,elapsed);},
  overlay(scene,world,b){
   const u=benefactorUnit(b)!;label(scene,world,512,12,`${u.name}  ${u.hp}/${u.maxHp}`,2);
   const g=scene.add.graphics();world.add(g);g.fillStyle(0x111e2a,.97).fillRect(359,23,306,10).lineStyle(1,0xc5a36b).strokeRect(359,23,306,10).fillStyle(form===2?0x9bcfc5:0xc5a36b).fillRect(362,26,Math.floor(300*u.hp/u.maxHp),4);
   label(scene,world,512,42,u.hp>0?(u.intent?.phase??'Borrowed light'):'The claim is broken',1,'#b7c5d6');
  },
  pick:(b,action,x,y)=>pickBossBody(b,action,x,y,benefactorUnit(b)!,360,288,masks.get(key)?.[currentFrame]),
 };
}
