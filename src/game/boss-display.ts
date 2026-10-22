import Phaser from 'phaser';
import { bitmapText } from './pixel-font';
import { ABILITIES, active, legalAim, targets, unitAt, type AbilityId, type Battle, type Unit } from '../rules/combat';
import { occupiedHexes } from '../rules/footprint';
import { distance, fromPixel, toPixel } from '../rules/hex';
import { vectorSurface } from './vector-image';

let labelId=0;
export function nativeTexture(scene:Phaser.Scene,key:string){
  const texture=scene.textures.get(key);
  for(const source of texture.source)if(source.image instanceof HTMLImageElement){
    source.source=source.image=vectorSurface(source.image);source.isCanvas=true;source.update();
  }
  texture.setFilter(Phaser.Textures.FilterMode.NEAREST);return texture;
}
export function bossLabel(scene:Phaser.Scene,world:Phaser.GameObjects.Container,x:number,y:number,value:string,scale=1,color='#f4d9aa'){
  const canvas=document.createElement('canvas');canvas.width=value.length*(scale===1?8:6*scale);canvas.height=scale===1?12:9*scale;
  bitmapText(canvas.getContext('2d')!,value,0,scale,color,scale);
  const key=`boss-label-${labelId++}`;scene.textures.addCanvas(key,canvas);
  world.add(scene.add.image(Math.round(x),Math.round(y),key).setOrigin(.5).once('destroy',()=>scene.textures.remove(key)));
}
export function bossPlacement(unit:Unit){
  return {x:Math.round(toPixel(unit.hex).x),y:Math.round(Math.max(...occupiedHexes(unit).map(h=>toPixel(h).y))+24)};
}

/** Projected art is a shortcut to a legal occupied cell, never to a nearby ally. */
export function pickBossBody(b:Battle,action:AbilityId|'move',x:number,y:number,boss:Unit,width:number,height:number,mask?:Uint8Array,visualOffset={x:0,y:0}){
  if(action==='move'||ABILITIES[action].heal||['guard','focus','taunt'].includes(ABILITIES[action].effect??''))return;
  const u=active(b);if(!u||u.side!=='party'||boss.hp<=0)return;
  const p=bossPlacement(boss),px=Math.floor(x-p.x-visualOffset.x+width/2),py=Math.floor(y-p.y-visualOffset.y+height);
  if(px<0||px>=width||py<0||py>=height)return;
  const clicked=fromPixel(x,y),direct=unitAt(b,clicked);
  if(direct&&direct.id!==boss.id)return;
  if(legalAim(b,u,action,clicked)&&targets(b,u,action,clicked).some(v=>v.id===boss.id))return clicked;
  if(!mask||mask[py*width+px]===0)return;
  const parts=occupiedHexes(boss).sort((a,z)=>distance(u.hex,a)-distance(u.hex,z));
  return parts.find(h=>legalAim(b,u,action,h)&&targets(b,u,action,h).some(v=>v.id===boss.id));
}
