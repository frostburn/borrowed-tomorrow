import { expect,it } from 'vitest';
import { active,cast,createBattle,damage,defend,enemyTurn,legalAim,movement,pushDestination,shape,targets,unitAt } from '../src/rules/combat';
import { chapterFiveStart } from '../src/dev/canonical-saves';
import { furnaceUnit,prepareFurnace } from '../src/rules/furnace';
import { occupiedHexes } from '../src/rules/footprint';
import { cells,distance,inside,key,offset } from '../src/rules/hex';
function setup(){const s=chapterFiveStart();s.activeParty=['nell','petra','orrin'];const b=createBattle('hammer-carrier',s);return {s,b,boss:furnaceUnit(b)!};}
it('the mobile carrier occupies three adjacent contacts above the actual chosen party',()=>{
 const {b,boss}=setup(),body=occupiedHexes(boss);expect(body).toHaveLength(3);expect(body.every(inside)).toBe(true);expect(boss.anchored).toBeFalsy();
 for(const a of body)for(const z of body)expect(distance(a,z)).toBeLessThanOrEqual(1);
 for(const h of body){expect(unitAt(b,h)).toBe(boss);expect(movement(b,active(b)!).has(key(h))).toBe(false);}
 expect(b.units.filter(u=>u.side==='party').map(u=>u.id)).toEqual(['nell','petra','orrin']);
 expect(b.units.filter(u=>u.side==='party').every(u=>u.hex.r>3)).toBe(true);
});
it('a lane move uses a legal body path and leaves temporary hot metal outside its new base',()=>{
 const {b,boss}=setup(),before={...boss.hex};b.queue=[boss.id,'nell'];const path=movement(b,boss).get(key(boss.intent!.destination!))!.path;
 expect(enemyTurn(b)).toBe('judgment');expect(boss.hex).not.toEqual(before);expect(boss.hex).toEqual(offset(7,2));expect(path.length).toBeGreaterThan(0);
 expect(b.furnaceHeat!.length).toBeGreaterThan(0);expect(b.vents).toEqual(new Set(b.furnaceHeat!.map(h=>key(h.hex))));
 const body=new Set(occupiedHexes(boss).map(key));expect(b.furnaceHeat!.every(h=>inside(h.hex)&&!body.has(key(h.hex)))).toBe(true);
 b.round=2;prepareFurnace(b);expect(b.vents.size).toBeGreaterThan(0);b.round=3;prepareFurnace(b);expect(b.vents.size).toBe(0);
});
it('blocked destination tracks cannot pass through an occupied cell or push off the board',()=>{
 const {b,boss}=setup(),nell=b.units[0];nell.hex=offset(6,2);b.queue=[boss.id,nell.id];
 const paths=[...movement(b,boss).values()];expect(paths.every(v=>occupiedHexes(boss,v.hex).every(h=>inside(h)&&!occupiedHexes(nell).some(p=>key(h)===key(p))))).toBe(true);
 enemyTurn(b);expect(occupiedHexes(boss).some(h=>key(h)===key(nell.hex))).toBe(false);
 boss.hex=offset(0,2);nell.hex=offset(1,2);expect(pushDestination(b,nell,boss)).toBeUndefined();
});
it('announced pours stay fixed across moves and round rollover; Taunt redirects the actual hit',()=>{
 const {b,boss}=setup(),petra=b.units.find(u=>u.id==='petra')!,warning=structuredClone(boss.intent!.cells);b.units[0].hex=offset(1,6);prepareFurnace(b);expect(boss.intent!.cells).toEqual(warning);
 boss.tauntedBy=petra.id;prepareFurnace(b);expect(boss.intent!.cells).toEqual([petra.hex]);const hp=petra.hp;b.queue=[boss.id,'nell'];expect(enemyTurn(b)).toBe('judgment');expect(petra.hp).toBe(hp-damage(boss,petra,'judgment'));expect(b.log.some(t=>t.includes('Pour on Petra hits Petra'))).toBe(true);
 delete boss.tauntedBy;b.queue=[boss.id];boss.moved=false;const old=structuredClone(boss.intent!.cells);enemyTurn(b);expect(b.round).toBe(2);expect(boss.intent!.round).toBe(2);expect(boss.intent!.cells).not.toEqual(old);expect(boss.intent!.destination).toEqual(offset(3,2));
});
it('area attacks hit the carrier once through overlapping contacts, while Dazzle lasts three attacks',()=>{
 const {b,boss}=setup(),nell=b.units[0];nell.hex=offset(6,5);b.queue=[nell.id,boss.id];nell.focus=6;
 const occupied=new Set(occupiedHexes(boss).map(key)),aim=cells().find(h=>legalAim(b,nell,'burst',h)&&shape(b,nell,'burst',h).filter(p=>occupied.has(key(p))).length>1)!;
 expect(aim).toBeTruthy();expect(targets(b,nell,'burst',aim).filter(u=>u.id===boss.id)).toHaveLength(1);const hp=boss.hp,amount=damage(nell,boss,'burst');expect(cast(b,nell,'burst',aim)).toBe(true);expect(boss.hp).toBe(hp-amount);
 boss.dazzledAttacks=3;b.queue=[boss.id,nell.id];boss.intent!.cells=[nell.hex];const reduced=damage(boss,nell,'judgment');boss.dazzledAttacks=0;expect(reduced).toBeLessThan(damage(boss,nell,'judgment'));boss.dazzledAttacks=3;enemyTurn(b);expect(boss.dazzledAttacks).toBe(2);
});
it('hot metal damages ground units once per round and flying crows ignore it',()=>{
 const {b,boss}=setup(),nell=b.units[0],crow=b.units.find(u=>u.kind==='crow')!;b.furnaceHeat=[{hex:nell.hex,untilRound:2},{hex:crow.hex,untilRound:2},{hex:boss.hex,untilRound:2}];prepareFurnace(b);b.queue=[nell.id];const nhp=nell.hp,chp=crow.hp,bhp=boss.hp;
 defend(b);expect(nell.hp).toBe(nhp-6);expect(crow.hp).toBe(chp);expect(boss.hp).toBe(bhp);expect(b.round).toBe(2);expect(boss.intent!.round).toBe(2);
});
