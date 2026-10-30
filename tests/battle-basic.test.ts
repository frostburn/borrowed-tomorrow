import {expect,it} from 'vitest';
import {basicAction,basicStrike} from '../src/game/battle-basic';
import {cast,createBattle,damage,legalAim,move,movement,type Encounter} from '../src/rules/combat';
import {newGame,recruitOrrin} from '../src/rules/state';
import {distance,equal,key,neighbors,offset} from '../src/rules/hex';
import {occupiedHexes} from '../src/rules/footprint';

function yard(){
 const encounter:Encounter={id:'basic',name:'Basic',music:'battle',flag:'test',xp:0,coins:0,rocks:[],enemies:[{kind:'guardian',col:7,row:3}],fixtures:[{id:'valve',name:'Valve',kind:'valve',col:3,row:3}]};
 const state=newGame();recruitOrrin(state);const b=createBattle(encounter,state);
 return {b,u:b.units.find(u=>u.id==='nell')!,friend:b.units.find(u=>u.id==='orrin')!,enemy:b.units.find(u=>u.side==='enemy')!};
}
it('chooses movement for ground, friends and fallen enemies without mutating the battle',()=>{
 const {b,u,friend,enemy}=yard();enemy.hp=0;const before=structuredClone(b);
 for(const h of [offset(4,2),friend.hex,enemy.hex])expect(basicAction(b,u,h)).toBe('move');
 expect(b).toEqual(before);
});
it('chooses a strike for an enemy even out of range or after movement, without finding a path',()=>{
 const {b,u,enemy}=yard();u.moved=true;const before=structuredClone(b);
 expect(basicAction(b,u,enemy.hex)).toBe('strike');expect(b).toEqual(before);
});
it('recognizes every contact of a multi-hex enemy',()=>{
 const {b,u,enemy}=yard();enemy.footprint=[{q:0,r:0},{q:-1,r:1},{q:0,r:1}];
 for(const h of occupiedHexes(enemy))expect(basicAction(b,u,h)).toBe('strike');
});
it('strikes live fixtures and leaves destroyed fixtures as ground',()=>{
 const {b,u}=yard(),fixture=b.fixtures![0];expect(basicAction(b,u,fixture.hex)).toBe('strike');
 fixture.hp=0;expect(basicAction(b,u,fixture.hex)).toBe('move');
});
it('keeps a team helper in movement-only mode even over enemies or valves',()=>{
 const {b,u,enemy}=yard();u.teamSpentRound=b.round;
 expect(basicAction(b,u,enemy.hex)).toBe('move');expect(basicAction(b,u,b.fixtures![0].hex)).toBe('move');
});

it('forecasts the shortest legal approach and strike without spending anything',()=>{
 const {b,u,enemy,friend}=yard();b.queue=[u.id,friend.id];u.movement=10;
 const before=structuredClone(b),plan=basicStrike(b,u,enemy.hex)!;
 expect(plan.visit?.path.length).toBeGreaterThan(0);expect(distance(plan.actor.hex,enemy.hex)).toBe(1);
 expect(legalAim(plan.battle,plan.actor,'strike',plan.aim)).toBe(true);
 expect(plan.visit!.cost).toBe(Math.min(...[...movement(b,u).values()].filter(v=>distance(v.hex,enemy.hex)===1).map(v=>v.cost)));
 expect(b).toEqual(before);
 const path=move(b,u,plan.visit!.hex)!;expect(path).toEqual(plan.visit!.path);
 const hp=enemy.hp;expect(cast(b,u,'strike',plan.aim)).toBe(true);expect(enemy.hp).toBeLessThan(hp);expect(u.moved).toBe(true);
});
it('strikes in place when already adjacent, including after movement',()=>{
 const {b,u,enemy}=yard();b.queue=[u.id];u.hex=neighbors(enemy.hex)[0];u.moved=true;
 const plan=basicStrike(b,u,enemy.hex)!;expect(plan.visit).toBeUndefined();expect(plan.actor).toBe(u);
});
it('does not approach unreachable targets, fixtures, or use spent movement and team actions',()=>{
 const {b,u,enemy}=yard();b.queue=[u.id];u.movement=0;
 expect(basicStrike(b,u,enemy.hex)).toBeUndefined();u.movement=10;u.moved=true;
 expect(basicStrike(b,u,enemy.hex)).toBeUndefined();u.moved=false;u.teamSpentRound=b.round;
 expect(basicStrike(b,u,enemy.hex)).toBeUndefined();delete u.teamSpentRound;u.anchored=true;
 expect(basicStrike(b,u,enemy.hex)).toBeUndefined();u.anchored=false;u.pinned=true;
 expect(basicStrike(b,u,enemy.hex)).toBeUndefined();delete u.pinned;
 b.fixtures![0].hex=offset(10,0);expect(basicStrike(b,u,b.fixtures![0].hex)).toBeUndefined();
});
it('routes around cover and allies using movement costs, retaining a chosen destination',()=>{
 const {b,u,enemy,friend}=yard();b.queue=[u.id];u.movement=10;
 b.obstacles.add(key(offset(4,3)));friend.hex=offset(5,3);
 for(const h of neighbors(enemy.hex))b.water.add(key(h));
 const before=structuredClone(b),plan=basicStrike(b,u,enemy.hex)!;
 expect(plan.visit!.path.every(h=>!b.obstacles.has(key(h))&&!equal(h,friend.hex))).toBe(true);
 expect(plan.visit!.cost).toBeGreaterThan(plan.visit!.path.length);
 expect(basicStrike(b,u,enemy.hex,plan.visit!.hex)?.visit).toEqual(plan.visit);expect(b).toEqual(before);
 b.obstacles.add(key(plan.visit!.hex));expect(basicStrike(b,u,enemy.hex,plan.visit!.hex)).toBeUndefined();
});
it('finds an adjacent contact of a large enemy even when the clicked contact is farther away',()=>{
 const {b,u,enemy}=yard();b.queue=[u.id];u.movement=10;enemy.footprint=[{q:0,r:0},{q:-1,r:1},{q:0,r:1}];
 const plan=basicStrike(b,u,occupiedHexes(enemy)[2])!;
 expect(occupiedHexes(enemy).some(h=>distance(h,plan.actor.hex)===1)).toBe(true);
 expect(legalAim(plan.battle,plan.actor,'strike',plan.aim)).toBe(true);
});
it('does not offer an approach when the strike would violate Taunt or the active turn',()=>{
 const {b,u,enemy,friend}=yard();b.queue=[u.id];u.movement=10;u.tauntedBy='other';
 b.units.push({...enemy,id:'other',hex:offset(10,0)});
 expect(basicStrike(b,u,enemy.hex)).toBeUndefined();delete u.tauntedBy;b.queue=[friend.id];
 expect(basicStrike(b,u,enemy.hex)).toBeUndefined();
});

it('forecasts a shield opened by the approach using ordinary movement rules',()=>{
 const {b,u,enemy,friend}=yard();b.queue=[u.id,friend.id];u.movement=10;enemy.sealed=true;
 const destination=basicStrike(b,u,enemy.hex)!.visit!.hex;
 b.grounding={plates:[friend.hex,destination],open:false};const before=structuredClone(b);
 const plan=basicStrike(b,u,enemy.hex,destination)!;
 expect(plan.battle.grounding!.open).toBe(true);expect(plan.battle.units.find(v=>v.id===enemy.id)!.sealed).toBe(false);
 expect(b).toEqual(before);move(b,u,destination);const hp=enemy.hp;cast(b,u,'strike',plan.aim);
 expect(enemy.hp).toBe(hp-damage(plan.actor,plan.battle.units.find(v=>v.id===enemy.id)!,'strike'));
});
