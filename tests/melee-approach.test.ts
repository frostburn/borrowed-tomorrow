import {describe,it,expect} from 'vitest';
import {approachAbility,approachAttack} from '../src/game/battle-basic';
import {active,cast,createBattle,damage,legalAim,move,movement,movementOnly,targets,type AbilityId,type Encounter} from '../src/rules/combat';
import {newCharacterSettings,defaultBuild,characterProfiles} from '../src/rules/characters';
import {newGame} from '../src/rules/state';
import {distance,equal,key,offset} from '../src/rules/hex';
import {occupiedHexes} from '../src/rules/footprint';
const encounter:Encounter={id:'approach',name:'Approach',music:'battle',flag:'test',xp:0,coins:0,rocks:[],enemies:[{kind:'guardian',col:5,row:3,hp:2000},{kind:'crow',col:9,row:0,hp:2000}]};
function yard(id:AbilityId='crush'){
 const settings=newCharacterSettings();settings.party=['petra','kit','orrin'];
 for(const hero of settings.party)settings.characters[hero]=defaultBuild(hero,15);
 const b=createBattle(encounter,newGame(),undefined,characterProfiles(settings),settings.party),u=b.units.find(u=>u.id===(id==='repulse'?'orrin':'petra'))!,enemy=b.units.find(u=>u.kind==='guardian')!;
 b.units.find(u=>u.id==='kit')!.hex=offset(0,0);b.units.find(v=>v.id===(u.id==='petra'?'orrin':'petra'))!.hex=offset(0,6);
 u.hex=offset(2,4);u.movement=4;u.focus=6;b.queue=[u.id,...b.units.filter(v=>v!==u).map(v=>v.id)];
 return {b,u,enemy};
}
describe('confirmed approach for adjacent attacks',()=>{
 for(const id of ['crush','bash','sweep','repulse']as const)for(const rank of [1,2,3])it(`forecasts and resolves ${id} rank ${rank} from the closest legal square`,()=>{
  const {b,u,enemy}=yard(id);u.skills![id]=rank;
  const before=structuredClone(b),plan=approachAttack(b,u,id,enemy.hex)!;
  expect(approachAbility(u,id)).toBe(true);expect(plan.visit?.path.length).toBeGreaterThan(0);expect(b).toEqual(before);
  expect(distance(plan.actor.hex,enemy.hex)).toBe(1);expect(legalAim(plan.battle,plan.actor,id,plan.aim)).toBe(true);
  expect(targets(plan.battle,plan.actor,id,plan.aim).some(v=>v.id===enemy.id)).toBe(true);
  const costs=[...movement(b,u).values()].filter(v=>distance(v.hex,enemy.hex)===1).map(v=>v.cost);expect(plan.visit!.cost).toBe(Math.min(...costs));
  if(id==='sweep'||id==='repulse'||id==='bash'&&rank===3)expect(plan.aim).toEqual(plan.actor.hex);else expect(plan.aim).toEqual(enemy.hex);
  const hp=enemy.hp,predicted=damage(plan.actor,plan.battle.units.find(v=>v.id===enemy.id)!,id),focus=u.focus;
  expect(move(b,u,plan.visit!.hex)).toEqual(plan.visit!.path);expect(cast(b,u,id,plan.aim)).toBe(true);
  expect(enemy.hp).toBe(hp-predicted);expect(u.moved).toBe(true);expect(u.focus).toBe(focus-(id==='crush'?3:id==='sweep'?2:id==='repulse'?2:rank===1?1:0));
  if(id==='bash'){expect(active(b)).toBe(u);expect(u.bonusUsed).toBe(true);expect(approachAttack(b,u,id,enemy.hex)).toBeUndefined();}
  else expect(active(b)).not.toBe(u);
 });
 it('keeps in-range skills stationary, including self-centred attacks aimed through an adjacent enemy',()=>{
  for(const id of ['crush','sweep','bash']as const){const {b,u,enemy}=yard(id);u.hex=offset(4,3);u.moved=true;
   const plan=approachAttack(b,u,id,enemy.hex)!;expect(plan.visit).toBeUndefined();expect(plan.battle).toBe(b);expect(plan.actor).toBe(u);
   expect(legalAim(b,u,id,plan.aim)).toBe(true);
  }
 });
 it('approaches the nearest contact of a large enemy and applies an area only once',()=>{
  for(const id of ['crush','bash','sweep','repulse']as const){
   const {b,u,enemy}=yard(id);enemy.footprint=[{q:0,r:0},{q:-1,r:1},{q:0,r:1}];
   const contacts=occupiedHexes(enemy),plan=approachAttack(b,u,id,contacts[2])!;
   expect(plan.visit).toBeTruthy();expect(contacts.some(h=>distance(h,plan.actor.hex)===1)).toBe(true);
   expect(targets(plan.battle,plan.actor,id,plan.aim).filter(v=>v.id===enemy.id)).toHaveLength(1);
   const hp=enemy.hp,predicted=id==='bash'?0:damage(plan.actor,plan.battle.units.find(v=>v.id===enemy.id)!,id);
   expect(move(b,u,plan.visit!.hex)).toBeTruthy();expect(cast(b,u,id,plan.aim)).toBe(true);expect(enemy.hp).toBe(hp-predicted);
  }
 });
 it('uses normal costs and blockers, and rejects a stale destination without spending anything',()=>{
  const {b,u,enemy}=yard();u.movement=8;b.obstacles.add(key(offset(3,4)));b.units.find(v=>v.id==='kit')!.hex=offset(3,3);
  for(const h of [offset(4,3),offset(4,4),offset(5,4)])b.water.add(key(h));
  const before=structuredClone(b),plan=approachAttack(b,u,'crush',enemy.hex)!;
  expect(plan.visit!.path.every(h=>!b.obstacles.has(key(h))&&!equal(h,b.units.find(v=>v.id==='kit')!.hex))).toBe(true);
  expect(plan.visit!.cost).toBeGreaterThanOrEqual(plan.visit!.path.length);expect(b).toEqual(before);
  b.obstacles.add(key(plan.visit!.hex));expect(approachAttack(b,u,'crush',enemy.hex,plan.visit!.hex)).toBeUndefined();
 });
 it('does not invent movement for an unlearned, unaffordable, used, pinned, anchored or inactive attack',()=>{
  for(const blocked of ['unlearned','focus','moved','pinned','anchored','turn','taunt','dead']as const){const {b,u,enemy}=yard();
   if(blocked==='unlearned')u.abilities=u.abilities.filter(a=>a!=='crush');if(blocked==='focus')u.focus=0;if(blocked==='moved')u.moved=true;
   if(blocked==='pinned')u.pinned=true;if(blocked==='anchored')u.anchored=true;if(blocked==='turn')b.queue.reverse();if(blocked==='dead')u.hp=0;
   if(blocked==='taunt')u.tauntedBy=b.units.find(v=>v.kind==='crow')!.id;
   const before=structuredClone(b);expect(approachAttack(b,u,'crush',enemy.hex),blocked).toBeUndefined();expect(b).toEqual(before);
  }
 });
 it('allows an assisting Petra to approach and Bash after a team attack without another main action',()=>{
  const {b,u:petra,enemy}=yard('bash'),kit=b.units.find(u=>u.id==='kit')!;kit.hex=offset(2,2);b.queue=[kit.id,petra.id,'orrin',enemy.id];
  expect(cast(b,kit,'crossfire',enemy.hex)).toBe(true);expect(active(b)).toBe(petra);expect(movementOnly(b,petra)).toBe(true);
  expect(approachAttack(b,petra,'crush',enemy.hex)).toBeUndefined();const plan=approachAttack(b,petra,'bash',enemy.hex)!;
  expect(plan.visit).toBeTruthy();expect(move(b,petra,plan.visit!.hex)).not.toBeNull();expect(active(b)).toBe(petra);
  expect(cast(b,petra,'bash',plan.aim)).toBe(true);expect(petra.bonusUsed).toBe(true);expect(active(b)?.id).toBe('orrin');
 });
 it('leaves ranged, team, support and empty-ground targeting alone',()=>{
  const {b,u,enemy}=yard();for(const id of ['quickshot','steam','taunt','heal','crossfire','daybreak']as const)expect(approachAttack(b,u,id,enemy.hex)).toBeUndefined();
  expect(approachAttack(b,u,'sweep',offset(8,6))).toBeUndefined();expect(approachAttack(b,u,'crush',offset(8,6))).toBeUndefined();
 });
});
