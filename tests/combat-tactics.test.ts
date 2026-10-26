import {describe,it,expect} from 'vitest';
import {ABILITIES,active,cast,createBattle,damage,defend,enemyTurn,legalAim,movement,shape,targets,wait,type Encounter} from '../src/rules/combat';
import {axisHexes,daybreakGuard,fixtureAt,prepareRelay,supportPower,teamStatus} from '../src/rules/combat-tactics';
import {cells,key,offset,distance} from '../src/rules/hex';
import {newGame} from '../src/rules/state';
import {characterProfiles,defaultBuild,newCharacterSettings} from '../src/rules/characters';
import {learnedAbilities} from '../src/rules/progression';
import {newInventory,equipmentBonuses} from '../src/rules/inventory';
import type {CompanionId} from '../src/rules/party';
import {ENCOUNTERS} from '../src/content/encounters';

const encounter:Encounter={id:'tactics-test',name:'Tactics',music:'battle',flag:'test',xp:0,coins:0,rocks:[],enemies:[{kind:'guardian',col:7,row:3,hp:500},{kind:'crow',col:8,row:1,hp:500},{kind:'hound',col:8,row:5,hp:500}]};
function yard(party:CompanionId[]=['nell','orrin','celia'],level=13,e:Encounter=encounter){
 const settings=newCharacterSettings();settings.party=party;for(const id of party)settings.characters[id]=defaultBuild(id,level);
 const b=createBattle(e,newGame(),equipmentBonuses(newInventory()),characterProfiles(settings),party);
 party.forEach((id,i)=>{b.units.find(u=>u.id===id)!.hex=offset(2,[3,4,1][i]);});
 b.queue=[...party,...b.units.filter(u=>u.side==='enemy').map(u=>u.id)];
 return {b,u:b.units[0],partner:b.units[1],third:b.units[2],enemy:b.units.find(u=>u.kind==='guardian')!,crow:b.units.find(u=>u.kind==='crow')!};
}

describe('shared-turn moves',()=>{
 it('spends two pending turns and both focus costs; the preview equals the applied damage',()=>{
  const {b,u,partner,enemy}=yard();u.focus=partner.focus=6;
  const predicted=damage(u,enemy,'prism',partner),hp=enemy.hp;
  expect(teamStatus(b,u,'prism').partner).toBe(partner);expect(cast(b,u,'prism',enemy.hex)).toBe(true);
  expect(enemy.hp).toBe(hp-predicted);expect(u.focus).toBe(3);expect(partner.focus).toBe(3);expect(b.queue).not.toContain(u.id);expect(b.queue).not.toContain(partner.id);expect(active(b)?.id).toBe('celia');
 });
 for(const reason of ['focus','spent','distance','cover','dead','unlearned']as const)it(`rejects a ${reason} partner without spending any resources`,()=>{
  const {b,u,partner,enemy}=yard();
  if(reason==='focus')partner.focus=2;
  if(reason==='spent')b.queue=b.queue.filter(id=>id!==partner.id);
  if(reason==='distance')partner.hex=offset(10,6);
  if(reason==='cover')b.obstacles.add(key(partner.hex));
  if(reason==='dead')partner.hp=0;
  if(reason==='unlearned')partner.abilities=partner.abilities.filter(id=>id!=='prism');
  const before=structuredClone(b);expect(teamStatus(b,u,'prism').reason).toBeTruthy();expect(cast(b,u,'prism',enemy.hex)).toBe(false);expect(b).toEqual(before);
 });
 it('allows waiting partners but clears the consumed partner’s pin, defense and taunt duration',()=>{
  const {b,u,partner,enemy}=yard(['kit','petra','celia']);partner.waited=true;partner.pinned=true;partner.defending=true;enemy.tauntedBy=partner.id;
  expect(cast(b,u,'crossfire',enemy.hex)).toBe(true);expect(partner.pinned).toBeUndefined();expect(partner.defending).toBe(false);expect(enemy.tauntedBy).toBeUndefined();
 });
 it('consumes a Dazzle attack from each participant, weakening their contribution once across all targets',()=>{
  const {b,u,partner,enemy,crow}=yard(['kit','petra','celia']);u.dazzledAttacks=3;partner.dazzledAttacks=2;
  const hit=targets(b,u,'crossfire',enemy.hex),before=new Map(hit.map(v=>[v.id,v.hp])),prediction=hit.map(v=>damage(u,v,'crossfire',partner));
  expect(hit).toEqual([enemy,crow]);cast(b,u,'crossfire',enemy.hex);
  hit.forEach((v,i)=>expect(before.get(v.id)!-v.hp).toBe(prediction[i]));expect(u.dazzledAttacks).toBe(2);expect(partner.dazzledAttacks).toBe(1);
 });
 it('rolls into the next round once when a team move consumes the last two turns',()=>{
  const {b,u,partner,enemy}=yard();b.queue=[u.id,partner.id];const round=b.round;
  expect(cast(b,u,'prism',enemy.hex)).toBe(true);expect(b.round).toBe(round+1);expect(b.queue.filter(id=>id===u.id)).toHaveLength(1);expect(b.queue.filter(id=>id===partner.id)).toHaveLength(1);
 });
 it('Daybreak heals the living formation and adds non-stacking scaled barriers',()=>{
  const {b,u,third}=yard();for(const v of b.units.filter(v=>v.side==='party'))v.hp-=50;
  const hp=u.hp;expect(teamStatus(b,u,'daybreak').partner).toBe(third);cast(b,u,'daybreak',u.hex);
  expect(u.hp).toBe(Math.min(u.maxHp,hp+62));expect(u.guard).toBe(26);expect(third.guard).toBe(daybreakGuard(u));expect(b.queue).not.toContain(third.id);
 });
});

describe('geometry and progression',()=>{
 it('covers all three full axial lines through every cell, independent of rocks',()=>{
  const {b,u}=yard();for(const [ability,axis]of [['sunline','r'],['pressureline','q'],['starline','s']]as const)for(const aim of cells()){
   expect(shape(b,u,ability,aim)).toEqual(axisHexes(axis,aim));
   const footprint=shape(b,u,ability,aim);expect(footprint).toContainEqual(aim);expect(footprint.length).toBeGreaterThan(0);
   expect(footprint.every(h=>axis==='s'?h.q+h.r===aim.q+aim.r:h[axis]===aim[axis])).toBe(true);
  }
  b.obstacles.add(key(offset(5,3)));expect(shape(b,u,'sunline',offset(5,3))).toHaveLength(11);
 });
 it('full lines hit an ally and a multi-contact enemy once, keeping their caster safe',()=>{
  const {b,u,partner,enemy}=yard();partner.hex=offset(3,3);enemy.footprint=[{q:0,r:0},{q:1,r:0},{q:0,r:1}];
  const hit=targets(b,u,'sunline',enemy.hex);expect(hit.filter(v=>v===enemy)).toHaveLength(1);expect(hit).toContain(partner);expect(hit).not.toContain(u);
 });
 it('bounces only to a distinct enemy, chooses nearest with stable ties, and obeys cover',()=>{
  const {b,u,enemy,crow,partner}=yard(['kit','petra','celia']);partner.hex=offset(7,2);
  const first=targets(b,u,'ricochet',enemy.hex);expect(first).toEqual([enemy,crow]);
  b.obstacles.add(key(crow.hex));expect(targets(b,u,'ricochet',enemy.hex).map(v=>v.kind)).toEqual(['guardian','hound']);b.units.find(v=>v.kind==='hound')!.hp=0;expect(targets(b,u,'ricochet',enemy.hex)).toEqual([enemy]);
  b.obstacles.clear();crow.hp=0;expect(targets(b,u,'ricochet',enemy.hex)).toEqual([enemy]);
  enemy.footprint=[{q:0,r:0},{q:1,r:0}];expect(targets(b,u,'ricochet',enemy.hex)).toEqual([enemy]);
 });
 it('offers a useful choice after level five for every companion and removes locked moves when lowering levels',()=>{
  for(const id of ['nell','orrin','kit','celia','petra']as const){
   const low=learnedAbilities(id,5),high=learnedAbilities(id,15);expect(high.length).toBeGreaterThan(low.length);expect(learnedAbilities(id,7).length).toBeGreaterThan(low.length);
   for(const skill of high)expect(ABILITIES[skill]).toBeDefined();
  }
  expect(learnedAbilities('nell',12)).not.toContain('daybreak');expect(learnedAbilities('celia',13)).toContain('daybreak');
 });
 it('pin limits the next turn’s movement without taking away its attack or extending through wait',()=>{
  const {b,u,enemy}=yard(['kit','petra','celia']);cast(b,u,'pin',enemy.hex);expect(enemy.pinned).toBe(true);
  b.queue=[enemy.id,'petra','celia'];expect([...movement(b,enemy).values()].every(v=>v.cost<=1)).toBe(true);
  wait(b);expect(enemy.pinned).toBe(true);b.queue=[enemy.id,'petra','celia'];defend(b);expect(enemy.pinned).toBeUndefined();
 });
});

describe('support at campaign levels',()=>{
 it('scales healing and guard by caster level rather than weapon damage or target stat edits',()=>{
  const {u,partner}=yard();u.level=1;expect(supportPower(u,'mend')).toBe(18);expect(supportPower(u,'guard')).toBe(10);
  u.level=15;expect(supportPower(u,'mend')).toBe(46);expect(supportPower(u,'beacon')).toBe(42);expect(supportPower(u,'guard')).toBe(31);expect(supportPower(u,'sanctuary')).toBe(29);
  const value=damage(u,{...partner,hp:1},'mend');u.bonus=999;expect(damage(u,{...partner,hp:1},'mend')).toBe(value);expect(supportPower(u,'bandage')).toBe(24);
 });
 it('revives exactly one ally on a clear hex with no extra turn or retaliation that round',()=>{
  const {b,u,partner}=yard(['celia','nell','orrin']);partner.hp=0;b.queue=[u.id,'orrin',...b.queue.filter(id=>!['celia','nell','orrin'].includes(id))];
  expect(legalAim(b,u,'revive',partner.hex)).toBe(true);cast(b,u,'revive',partner.hex);
  expect(partner.hp).toBe(Math.ceil(partner.maxHp*.35));expect(b.queue).not.toContain(partner.id);expect(partner.retaliated).toBe(true);expect(u.focus).toBe(2);
 });
 it('rejects revival onto an occupied or blocked hex, or on a living or opposing fighter',()=>{
  const {b,u,partner,third,enemy}=yard(['celia','nell','orrin']);partner.hp=0;third.hex={...partner.hex};
  expect(legalAim(b,u,'revive',partner.hex)).toBe(false);third.hex=offset(1,0);b.obstacles.add(key(partner.hex));expect(legalAim(b,u,'revive',partner.hex)).toBe(false);
  b.obstacles.clear();partner.hp=1;expect(legalAim(b,u,'revive',partner.hex)).toBe(false);enemy.hp=0;expect(legalAim(b,u,'revive',enemy.hex)).toBe(false);
 });
});

describe('disruptible enemy links and battlefield objects',()=>{
 it('announces a fixed even-round relay, spends both machine turns, and snapshots its area before advancing',()=>{
  const {b,u,enemy,crow}=yard(undefined,13,{...encounter,coordinated:true});b.round=2;b.queue=[crow.id,enemy.id,u.id];prepareRelay(b);
  expect(crow.intent?.cells.length).toBeGreaterThan(0);const announced=structuredClone(crow.intent!.cells);u.hex=offset(0,0);prepareRelay(b);expect(crow.intent?.cells).toEqual(announced);
  let captured:unknown;expect(enemyTurn(b,undefined,(id,aim)=>{captured={id,cells:shape(b,crow,id,aim)};})).toBe('relay');
  expect(captured).toEqual({id:'relay',cells:announced});expect(b.queue).not.toContain(enemy.id);expect(b.queue).not.toContain(crow.id);expect(crow.focus).toBe(4);expect(enemy.focus).toBe(4);
 });
 it('shows one shared charging warning for a whole round before a fast enemy can fire',()=>{
  const {b,u,enemy,crow}=yard(undefined,13,{...encounter,coordinated:true});expect(b.round).toBe(1);expect(crow.intent!.cells.length).toBeGreaterThan(0);expect(crow.intent!.cells).toEqual(enemy.intent!.cells);const warned=structuredClone(crow.intent!.cells);
  b.queue=[crow.id,enemy.id,u.id];expect(legalAim(b,crow,'relay',crow.hex)).toBe(false);b.queue=[enemy.id,u.id];prepareRelay(b);expect(crow.intent!.cells).toEqual(warned);
  b.round=2;b.queue=[crow.id,enemy.id,u.id];u.hex=offset(0,0);prepareRelay(b);expect(crow.intent!.cells).toEqual(warned);expect(enemy.intent!.cells).toEqual(warned);
 });
 it('clears the warning when a partner dies, has spent its turn, or loses its clear link',()=>{
  for(const failure of ['dead','spent','far','cover']as const){
   const {b,enemy,crow}=yard(undefined,13,{...encounter,coordinated:true});b.round=2;b.queue=[crow.id,enemy.id,'nell'];prepareRelay(b);expect(crow.intent!.cells.length).toBeGreaterThan(0);
   if(failure==='dead')enemy.hp=0;if(failure==='spent')b.queue=b.queue.filter(id=>id!==enemy.id);if(failure==='far')enemy.hex=offset(0,6);if(failure==='cover')b.obstacles.add(key(enemy.hex));
   prepareRelay(b);expect(crow.intent!.cells).toEqual([]);expect(legalAim(b,crow,'relay',crow.hex)).toBe(false);
  }
 });
 it('turning a valve spends a main action, toggles exactly its vents and does not attack occupants',()=>{
  const e:Encounter={...encounter,vents:[[10,6]],fixtures:[{id:'valve',kind:'valve',name:'Valve',col:3,row:3,active:true,vents:[[5,3]]}]};
  const {b,u,enemy}=yard(undefined,13,e);enemy.hex=offset(5,3);const hp=enemy.hp;expect(b.vents.size).toBe(2);
  expect(targets(b,u,'operate',offset(3,3))).toEqual([]);expect(cast(b,u,'operate',offset(3,3))).toBe(true);
  expect(enemy.hp).toBe(hp);expect(b.vents.has(key(enemy.hex))).toBe(false);expect(b.vents.has(key(offset(10,6)))).toBe(true);expect(b.queue).not.toContain(u.id);
 });
 it('breaks real cover, opening movement and sight while retaining enemies and the victory condition',()=>{
  const {b,u,enemy}=yard(['kit','petra','celia'],13,{...encounter,fixtures:[{id:'crate',kind:'barricade',name:'Crate',col:3,row:3,hp:20}]});
  expect(movement(b,u).has(key(offset(3,3)))).toBe(false);expect(legalAim(b,u,'quickshot',enemy.hex)).toBe(false);expect(legalAim(b,u,'quickshot',offset(3,3))).toBe(true);
  expect(cast(b,u,'quickshot',offset(3,3))).toBe(true);expect(fixtureAt(b,offset(3,3))).toBeUndefined();expect(b.obstacles.has(key(offset(3,3)))).toBe(false);expect(b.result).toBeNull();
  b.queue=[u.id,enemy.id];u.moved=false;expect(movement(b,u).has(key(offset(3,3)))).toBe(true);expect(legalAim(b,u,'quickshot',enemy.hex)).toBe(true);
 });
 it('a pressure drum hits either side once, respects barriers and triggers adjacent drums',()=>{
  const {b,u,partner,enemy}=yard(['kit','petra','celia'],13,{...encounter,fixtures:[{id:'one',kind:'drum',name:'First drum',col:3,row:3,hp:20,power:20},{id:'two',kind:'drum',name:'Second drum',col:3,row:2,hp:10,power:10}]});
  partner.hex=offset(4,3);partner.guard=15;enemy.hex=offset(4,2);const allyHp=partner.hp,enemyHp=enemy.hp;
  cast(b,u,'quickshot',offset(3,3));expect(b.fixtures!.every(f=>f.hp===0)).toBe(true);expect(partner.hp).toBeLessThanOrEqual(allyHp);expect(enemy.hp).toBeLessThan(enemyHp);expect(b.obstacles.size).toBe(0);
 });
 it('authored props avoid spawn bodies, and terrain remains opt-in for other campaign encounters',()=>{
  for(const e of Object.values(ENCOUNTERS)){
   const occupied=new Set(e.enemies.map(u=>key(offset(u.col,u.row))));
   for(const f of e.fixtures??[]){expect(occupied.has(key(offset(f.col,f.row))),e.id).toBe(false);expect(distance(offset(f.col,f.row),offset(1,3))).toBeGreaterThan(0);}
  }
  expect(ENCOUNTERS.captain.fixtures).toBeUndefined();expect(ENCOUNTERS['benefactor-heart'].coordinated).toBeUndefined();
 });
});
