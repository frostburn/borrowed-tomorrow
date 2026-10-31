import {MAPS} from '../src/content/maps';
import {visibleSceneArt} from '../src/content/scene-art';
import {expect,it} from 'vitest';
import {createBattle,movement,unitAt,targets,pushDestination} from '../src/rules/combat';
import {occupiedHexes} from '../src/rules/footprint';
import {inside,key,neighbors,toPixel,offset} from '../src/rules/hex';
import {chapterSevenRefugeStart} from '../src/dev/canonical-saves';

const encounters=['heart-feeds','heart-pressure','hammer-carrier','wind-engine','alban-flagship','sun-serpent','winter-dragon','imperial-vessel','lightbearer','domain-furnace','domain-ward','domain-dragon','benefactor-body','benefactor-sun','benefactor-heart'];
for(const id of encounters)it(`${id} has unique, unobstructed multi-hex bodies with no overlapping units`,()=>{
 const b=createBattle(id,chapterSevenRefugeStart()),hero=b.units.find(u=>u.side==='party')!,blocked=movement(b,hero),seen=new Set<string>();
 for(const u of b.units){
  const body=occupiedHexes(u),parts=new Set(body.map(key));expect(parts.size).toBe(body.length);expect(body.every(inside)).toBe(true);
  const visit=[body[0]],connected=new Set([key(body[0])]);
  while(visit.length)for(const h of neighbors(visit.shift()!))if(parts.has(key(h))&&!connected.has(key(h))){connected.add(key(h));visit.push(h);}
  if(!id.includes('dragon'))expect(connected.size).toBe(body.length);
  for(const h of body){expect(seen.has(key(h)),`${u.id} overlaps at ${key(h)}`).toBe(false);seen.add(key(h));expect(unitAt(b,h)).toBe(u);expect(b.obstacles.has(key(h))).toBe(false);if(u.side==='enemy')expect(blocked.has(key(h))).toBe(false);}
 }
});
for(const id of ['imperial-vessel','lightbearer','winter-dragon','domain-dragon','benefactor-body','benefactor-sun','benefactor-heart'])it(`${id} has a balanced body centered above the party`,()=>{
 const b=createBattle(id,chapterSevenRefugeStart()),core=b.units.find(u=>u.side==='enemy'&&!u.passive)!,body=occupiedHexes(core).map(toPixel),center=toPixel(core.hex).x;
 expect(body.length).toBe(id.includes('dragon')?2:id.startsWith('benefactor-')&&!id.endsWith('heart')?19:7);
 for(const p of body)expect(body).toContainEqual({x:2*center-p.x,y:p.y});
 const allies=b.units.filter(u=>u.side==='party').map(u=>toPixel(u.hex));
 expect((Math.min(...allies.map(p=>p.x))+Math.max(...allies.map(p=>p.x)))/2).toBe(center);
 expect(Math.max(...body.map(p=>p.y))).toBeLessThan(Math.min(...allies.map(p=>p.y)));
});

for(const id of ['winter-dragon','domain-dragon'])it(`${id} occupies its feet but leaves the wing span and central gap walkable`,()=>{
 const b=createBattle(id,chapterSevenRefugeStart()),dragon=b.units.find(u=>u.id==='winter-dragon')!,hero=b.units.find(u=>u.side==='party')!;
 const feet=occupiedHexes(dragon);expect(feet.map(toPixel)).toEqual([{x:370,y:266},{x:550,y:266}]);
 expect(dragon.hex).toEqual(offset(5,2));expect(dragon.anchored).toBe(true);
 hero.hex=offset(2,3);hero.movement=20;
 for(const h of [offset(2,2),offset(3,2),offset(4,3),offset(5,3),offset(6,2),offset(7,2)]){
  expect(unitAt(b,h)).toBeUndefined();expect(movement(b,hero).has(key(h)),key(h)).toBe(true);
 }
 for(const h of feet){expect(unitAt(b,h)).toBe(dragon);expect(movement(b,hero).has(key(h))).toBe(false);}
 expect(targets(b,hero,'burst',feet[0]).filter(u=>u===dragon)).toHaveLength(1);
 expect(pushDestination(b,hero,dragon)).toBeUndefined();
});

it('keeps the shrine shadow on its own floor layer and removes it with the defeated dragon',()=>{
 const map=MAPS.wintershrine.tiles!,pieces=visibleSceneArt(map,{flags:{}})!;
 const body=pieces.find(p=>p.key==='scene-six-shrine-dragon')!,shadow=pieces.find(p=>p.key==='scene-six-shrine-dragon-shadow')!;
 expect(shadow.layerId).not.toBe(body.layerId);expect(shadow.depth).toBeLessThan(0);
 expect(shadow.url).toBe('art/vector/chapter-six/dragon-shadow.svg');
 const cleared=visibleSceneArt(map,{flags:{winterDragonWon:true}})!;
 expect(cleared.some(p=>p.key==='scene-six-shrine-dragon'||p.key==='scene-six-shrine-dragon-shadow')).toBe(false);
});
