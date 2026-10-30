import {expect,it} from 'vitest';
import {basicAction} from '../src/game/battle-basic';
import {createBattle,type Encounter} from '../src/rules/combat';
import {newGame,recruitOrrin} from '../src/rules/state';
import {offset} from '../src/rules/hex';
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
