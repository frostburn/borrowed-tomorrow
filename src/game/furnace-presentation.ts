import type { BattlePresentation } from './battle-presentation';
import type { Encounter,Unit } from '../rules/combat';
import { offset,toPixel,type Hex } from '../rules/hex';
import { occupiedHexes } from '../rules/footprint';
import { actorAsset } from '../content/actors';
import type { CompanionId } from '../rules/party';
import { FURNACE_ID } from '../content/chapter-five/furnace';
import { furnaceUnit,prepareFurnace } from '../rules/furnace';
import { BATTLE_MAPS } from '../content/battle-maps';
import { drawTileMap } from './tilemap';
import { nativeTexture,bossLabel,pickBossBody } from './boss-display';
import { newGame } from '../rules/state';
const textureKey='furnace-carrier-battle';
export const FURNACE_ASSETS=[{key:textureKey,url:'art/vector/chapter-five/furnace-carrier-battle.svg'}];
let mask:Uint8Array|undefined;
const placement=(u:Unit,hex:Hex=u.hex)=>({x:Math.round(toPixel(hex).x),y:Math.round(Math.max(...occupiedHexes(u,hex).map(h=>toPixel(h).y))+24)});
export function furnacePresentation(encounter:Encounter):BattlePresentation{
 return {
  encounter,prepare:prepareFurnace,focus:offset(5,3),
  portrait:u=>u.id===FURNACE_ID?`${import.meta.env.BASE_URL}art/vector/portrait-furnace-carrier.svg`:undefined,
  facing:u=>u.side==='party'?actorAsset(u.kind as CompanionId,'back'):undefined,
  position:(u,hex)=>u.id===FURNACE_ID?placement(u,hex):undefined,
  hint:b=>`${furnaceUnit(b)?.intent?.name??'Casting cycle'} · red X: next pour. Orange tracks: 6 damage at round end; cool after the following round.`,
  background(scene,world){drawTileMap(scene,world,BATTLE_MAPS[encounter.id]??BATTLE_MAPS['hammer-carrier'],newGame());},
  actor(scene,u,_hp,hex){
   if(u.id!==FURNACE_ID)return;
   const texture=nativeTexture(scene,textureKey),surface=texture.getSourceImage() as HTMLCanvasElement;
   if(!mask){const rgba=surface.getContext('2d')!.getImageData(0,0,224,168).data;mask=Uint8Array.from({length:224*168},(_,p)=>rgba[p*4+3]);}
   const p=placement(u,hex);return scene.add.image(p.x,p.y,textureKey).setOrigin(.5,1);
  },
  attackTiming:u=>u.id===FURNACE_ID?{contact:320,duration:720}:undefined,
  attack(scene,image,u,elapsed){if(u.id===FURNACE_ID){const p=placement(u);image.setPosition(p.x,p.y);if(!elapsed)scene.tweens.add({targets:image,y:p.y-4,duration:150,yoyo:true,repeat:1});}},
  attackSound:(u,id)=>u.id===FURNACE_ID&&id==='judgment'?'steam':undefined,
  attackEffect(scene,world,image,u,id,affected){
   if(u.id!==FURNACE_ID||id!=='judgment')return false;
   const g=scene.add.graphics();world.add(g);
   scene.tweens.addCounter({from:0,to:1,duration:280,onUpdate:t=>{if(!g.active)return;const p=t.getValue()??0;g.clear().setAlpha(1-p);
    for(const hex of affected){const at=toPixel(hex);g.lineStyle(5,0xc9683a,.6).lineBetween(image.x,image.y-65,at.x,at.y);g.lineStyle(2,0xf6d490,.95).lineBetween(image.x,image.y-65,at.x,at.y);g.fillStyle(0xe6994b,.65).fillEllipse(at.x,at.y,32+p*20,12+p*12);}
   },onComplete:()=>{if(g.active)g.destroy();}});return true;
  },
  overlay(scene,world,b){
   const u=furnaceUnit(b)!;bossLabel(scene,world,512,16,`Furnace carrier  ${u.hp}/${u.maxHp}`,2);
   const g=scene.add.graphics();world.add(g);g.fillStyle(0x18252b,.97).fillRect(359,29,306,10).fillStyle(0xc87a49).fillRect(362,32,Math.floor(300*u.hp/u.maxHp),4);
   bossLabel(scene,world,512,49,u.hp>0?'Mobile · three contacts · hot tracks':'Carrier stopped',1);
  },
  pick:(b,action,x,y)=>pickBossBody(b,action,x,y,furnaceUnit(b)!,224,168,mask),
 };
}
