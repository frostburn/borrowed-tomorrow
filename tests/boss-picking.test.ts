import {expect,it,vi} from 'vitest';
import {active,createBattle,legalAim,unitAt} from '../src/rules/combat';
import {cells,inside,key,neighbors,toPixel} from '../src/rules/hex';
import {occupiedHexes} from '../src/rules/footprint';
import {chapterSevenRefugeStart} from '../src/dev/canonical-saves';
import {bossPlacement,pickBossBody} from '../src/game/boss-display';
import {basicAction} from '../src/game/battle-basic';
vi.mock('phaser',()=>({default:{}}));

for(const [id,width,height]of [['heart-pressure',256,240],['winter-dragon',528,280],['imperial-vessel',528,280],['benefactor-body',360,288]]as const){
 const setup=()=>{
  const b=createBattle(id,chapterSevenRefugeStart()),boss=b.units.find(u=>u.side==='enemy'&&!u.passive)!,hero=b.units.find(u=>u.side==='party')!;
  b.queue=[hero.id];hero.hex=occupiedHexes(boss).flatMap(neighbors).find(h=>!unitAt(b,h)&&!b.obstacles.has(key(h)))!;
  const p=bossPlacement(boss),mask=new Uint8Array(width*height).fill(255);
  const ground=cells().find(h=>{const at=toPixel(h);return !unitAt(b,h)&&at.x>p.x-width/2&&at.x<p.x+width/2&&at.y>p.y-height&&at.y<p.y;})!;
  return {b,boss,hero,ground,point:toPixel(ground),mask};
 };
 it(`${id} preserves the exact empty ground hex beneath opaque artwork`,()=>{
  const {b,boss,hero,ground,point,mask}=setup();expect(inside(ground)).toBe(true);const before=structuredClone(b);
  expect(pickBossBody(b,'basic',point.x,point.y,boss,width,height,mask)).toBeUndefined();expect(basicAction(b,hero,ground)).toBe('move');
  hero.moved=true;expect(pickBossBody(b,'basic',point.x,point.y,boss,width,height,mask)).toBeUndefined();hero.moved=before.units.find(u=>u.id===hero.id)!.moved;
  expect(pickBossBody(b,'move',point.x,point.y,boss,width,height,mask)).toBeUndefined();expect(b).toEqual(before);
 });
 it(`${id} retains body shortcuts for explicit attacks and basic attacks on real contacts`,()=>{
  const {b,boss,point,mask}=setup(),picked=pickBossBody(b,'strike',point.x,point.y,boss,width,height,mask)!;
  expect(picked).toBeTruthy();expect(legalAim(b,active(b)!,'strike',picked)).toBe(true);
  const p=toPixel(picked);expect(pickBossBody(b,'basic',p.x,p.y,boss,width,height,mask)).toEqual(picked);
  expect(pickBossBody(b,'strike',point.x,point.y,boss,width,height,new Uint8Array(width*height))).toBeUndefined();
 });
}
