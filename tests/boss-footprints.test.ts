import {expect,it} from 'vitest';
import {createBattle,movement,unitAt} from '../src/rules/combat';
import {occupiedHexes} from '../src/rules/footprint';
import {inside,key,neighbors,toPixel} from '../src/rules/hex';
import {chapterSevenRefugeStart} from '../src/dev/canonical-saves';

const encounters=['heart-feeds','heart-pressure','hammer-carrier','wind-engine','alban-flagship','sun-serpent','winter-dragon','imperial-vessel','lightbearer','domain-furnace','domain-ward','domain-dragon','benefactor-body','benefactor-sun','benefactor-heart'];
for(const id of encounters)it(`${id} has connected, unique, unobstructed multi-hex bodies with no overlapping units`,()=>{
 const b=createBattle(id,chapterSevenRefugeStart()),hero=b.units.find(u=>u.side==='party')!,blocked=movement(b,hero),seen=new Set<string>();
 for(const u of b.units){
  const body=occupiedHexes(u),parts=new Set(body.map(key));expect(parts.size).toBe(body.length);expect(body.every(inside)).toBe(true);
  const visit=[body[0]],connected=new Set([key(body[0])]);
  while(visit.length)for(const h of neighbors(visit.shift()!))if(parts.has(key(h))&&!connected.has(key(h))){connected.add(key(h));visit.push(h);}
  expect(connected.size).toBe(body.length);
  for(const h of body){expect(seen.has(key(h)),`${u.id} overlaps at ${key(h)}`).toBe(false);seen.add(key(h));expect(unitAt(b,h)).toBe(u);expect(b.obstacles.has(key(h))).toBe(false);if(u.side==='enemy')expect(blocked.has(key(h))).toBe(false);}
 }
});
for(const id of ['imperial-vessel','lightbearer','winter-dragon','domain-dragon','benefactor-body','benefactor-sun','benefactor-heart'])it(`${id} has a balanced body centered above the party`,()=>{
 const b=createBattle(id,chapterSevenRefugeStart()),core=b.units.find(u=>u.side==='enemy'&&!u.passive)!,body=occupiedHexes(core).map(toPixel),center=toPixel(core.hex).x;
 expect(body.length).toBe(id.includes('dragon')?11:id.startsWith('benefactor-')&&!id.endsWith('heart')?19:7);
 for(const p of body)expect(body).toContainEqual({x:2*center-p.x,y:p.y});
 const allies=b.units.filter(u=>u.side==='party').map(u=>toPixel(u.hex));
 expect((Math.min(...allies.map(p=>p.x))+Math.max(...allies.map(p=>p.x)))/2).toBe(center);
 expect(Math.max(...body.map(p=>p.y))).toBeLessThan(Math.min(...allies.map(p=>p.y)));
});
