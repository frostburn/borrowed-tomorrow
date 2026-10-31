import {SKILLS} from '../src/rules/skills';
import {describe,it,expect} from 'vitest';
import {ABILITIES,active,cast,createBattle,damage,damagingAbility,defend,endTurn,enemyTurn,legalAim,movement,movementOnly,shape,targets,wait,type Encounter} from '../src/rules/combat';
import {axisHexes,battleAbilities,daybreakProtection,fixtureAt,prepareRelay,supportPower,teamStatus} from '../src/rules/combat-tactics';
import {add,cells,diagonalRay,diagonalStart,DIAGONALS,hexVertices,inside,key,offset,distance,scale} from '../src/rules/hex';
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
 it('allows distant party and enemy teammates even when cover lies between them',()=>{
  const {b,u,partner,enemy}=yard();partner.hex=offset(10,6);b.obstacles.add(key(partner.hex));expect(teamStatus(b,u,'prism').partner).toBe(partner);expect(cast(b,u,'prism',enemy.hex)).toBe(true);
  const m=yard(undefined,13,{...encounter,coordinated:true});m.enemy.hex=offset(0,6);m.crow.hex=offset(10,0);m.b.obstacles.add(key(m.enemy.hex));m.b.round=2;m.b.queue=[m.crow.id,m.enemy.id,m.u.id];prepareRelay(m.b);expect(m.crow.intent!.cells.length).toBeGreaterThan(0);expect(cast(m.b,m.crow,'relay',m.crow.hex)).toBe(true);
 });
 it('hides team commands only when their same-side partner is absent, retaining readiness explanations for fallen partners',()=>{
  const {b,u,partner,third,enemy}=yard();b.units=b.units.filter(v=>v.id!==third.id);
  expect(battleAbilities(b,u)).not.toContain('lanternvolley');expect(battleAbilities(b,u)).toContain('prism');
  partner.hex=offset(10,6);expect(battleAbilities(b,u)).toContain('prism');expect(teamStatus(b,u,'prism').partner).toBe(partner);
  partner.hp=0;expect(battleAbilities(b,u)).toContain('prism');expect(teamStatus(b,u,'prism').reason).toContain('Orrin is down');
  b.units=b.units.filter(v=>v.id!==partner.id);enemy.kind='orrin';expect(battleAbilities(b,u)).not.toContain('prism');
 });
 it('Celia and Orrin share Falling stars, protecting both operators and consuming both turns',()=>{
  const {b,u,partner,third,enemy}=yard(['celia','orrin','petra'],7);partner.hex=offset(3,2);enemy.hex=offset(4,2);u.hex=offset(3,3);third.hex=offset(4,1);
  const aim=enemy.hex,axis=axisHexes('s',aim),hp=[u.hp,partner.hp,enemy.hp];expect(shape(b,u,'starline',aim)).toEqual(axis);
  expect(teamStatus(b,u,'starline').partner).toBe(partner);expect(cast(b,u,'starline',aim)).toBe(true);
  expect([u.hp,partner.hp]).toEqual(hp.slice(0,2));expect(enemy.hp).toBeLessThan(hp[2]);expect(b.queue).not.toContain(u.id);expect(b.queue).toContain(partner.id);expect(movementOnly(b,partner)).toBe(true);expect(u.focus).toBe(3);expect(partner.focus).toBe(3);
 });
 it('spends two pending turns and both focus costs; the preview equals the applied damage',()=>{
  const {b,u,partner,enemy}=yard();u.focus=partner.focus=6;
  const predicted=damage(u,enemy,'prism',partner),hp=enemy.hp;
  expect(teamStatus(b,u,'prism').partner).toBe(partner);expect(cast(b,u,'prism',enemy.hex)).toBe(true);
  expect(enemy.hp).toBe(hp-predicted);expect(u.focus).toBe(3);expect(partner.focus).toBe(3);expect(b.queue).not.toContain(u.id);expect(b.queue).toContain(partner.id);expect(active(b)?.id).toBe('orrin');expect(movementOnly(b,partner)).toBe(true);
 });
 for(const initiator of ['nell','orrin']as const)for(const focus of [3,4,5])it(`keeps both Prism operators safe when ${initiator} starts with ${focus} focus`,()=>{
  const {b,u,partner,third,enemy}=yard();partner.hex=offset(3,3);third.hex=offset(4,3);const caster=initiator==='nell'?u:partner,other=caster===u?partner:u;b.queue=[caster.id,other.id,third.id,...b.queue.filter(id=>!['nell','orrin','celia'].includes(id))];caster.focus=focus;
  const preview=targets(b,caster,'prism',enemy.hex),partyHp=[u.hp,partner.hp],thirdHp=third.hp,predicted=damage(caster,third,'prism',other);
  expect(preview).toContain(third);expect(preview).not.toContain(u);expect(preview).not.toContain(partner);expect(cast(b,caster,'prism',enemy.hex)).toBe(true);
  expect([u.hp,partner.hp]).toEqual(partyHp);expect(third.hp).toBe(thirdHp-predicted);expect(caster.focus).toBe(focus-3);expect(other.focus).toBe(3);
 });
 for(const reason of ['focus','spent','dead','unlearned']as const)it(`rejects a ${reason} partner without spending any resources`,()=>{
  const {b,u,partner,enemy}=yard();
  if(reason==='focus')partner.focus=2;
  if(reason==='spent')b.queue=b.queue.filter(id=>id!==partner.id);
  if(reason==='dead')partner.hp=0;
  if(reason==='unlearned')partner.abilities=partner.abilities.filter(id=>id!=='steam');
  const before=structuredClone(b);expect(teamStatus(b,u,'prism').reason).toBeTruthy();expect(cast(b,u,'prism',enemy.hex)).toBe(false);expect(b).toEqual(before);
 });
 it('allows waiting partners and preserves pin for their remaining move, while clearing defense and old taunt',()=>{
  const {b,u,partner,enemy}=yard(['kit','petra','celia']);partner.waited=true;partner.pinned=true;partner.defending=true;enemy.tauntedBy=partner.id;
  expect(cast(b,u,'crossfire',enemy.hex)).toBe(true);expect(partner.pinned).toBe(true);expect(partner.defending).toBe(false);expect(enemy.tauntedBy).toBeUndefined();expect(endTurn(b)).toBe(true);expect(partner.pinned).toBeUndefined();
 });
 it('consumes a Dazzle attack from each participant, weakening their contribution once across all targets',()=>{
  const {b,u,partner,enemy,crow}=yard(['kit','petra','celia']);u.dazzledAttacks=3;partner.dazzledAttacks=2;
  const hit=targets(b,u,'crossfire',enemy.hex),before=new Map(hit.map(v=>[v.id,v.hp])),prediction=hit.map(v=>damage(u,v,'crossfire',partner));
  expect(hit).toEqual([enemy,crow]);cast(b,u,'crossfire',enemy.hex);
  hit.forEach((v,i)=>expect(before.get(v.id)!-v.hp).toBe(prediction[i]));expect(u.dazzledAttacks).toBe(2);expect(partner.dazzledAttacks).toBe(1);
 });
 it('rolls into the next round once after the last team partner finishes their movement',()=>{
  const {b,u,partner,enemy}=yard();b.queue=[u.id,partner.id];const round=b.round;
  expect(cast(b,u,'prism',enemy.hex)).toBe(true);expect(b.round).toBe(round);expect(endTurn(b)).toBe(true);expect(b.round).toBe(round+1);expect(b.queue.filter(id=>id===u.id)).toHaveLength(1);expect(b.queue.filter(id=>id===partner.id)).toHaveLength(1);
 });
 it('Daybreak heals the living formation, applies Petra’s Taunt and preserves stronger barriers',()=>{
  const {b,u,partner,third,enemy}=yard(['celia','petra','orrin'],14);for(const v of b.units.filter(v=>v.side==='party'))v.hp-=50;third.guard=60;
  const hp=u.hp,healing=supportPower(u,'daybreak',partner);expect(teamStatus(b,u,'daybreak').partner).toBe(partner);cast(b,u,'daybreak',u.hex);
  expect(u.hp).toBe(Math.min(u.maxHp,hp+healing));expect(u.guard).toBe(daybreakProtection(u,partner)!.power);expect(partner.guard).toBe(daybreakProtection(u,partner)!.power);expect(third.guard).toBe(60);expect(enemy.tauntedBy).toBe(partner.id);expect(b.queue).toContain(partner.id);
 });
});

describe('geometry and progression',()=>{
 it('reserves full-board axes for teams and keeps their preview independent of rocks',()=>{
  for(const a of Object.values(ABILITIES))if(a.shape==='axis')expect(a.team,a.name).toBeDefined();
  const {b,u}=yard();for(const [ability,axis]of [['prism','r'],['starline','s']]as const)for(const aim of cells()){
   expect(shape(b,u,ability,aim)).toEqual(axisHexes(axis,aim));
   const footprint=shape(b,u,ability,aim);expect(footprint).toContainEqual(aim);expect(footprint.length).toBeGreaterThan(0);
   expect(footprint.every(h=>axis==='s'?h.q+h.r===aim.q+aim.r:h[axis]===aim[axis])).toBe(true);
  }
  b.obstacles.add(key(offset(5,3)));expect(shape(b,u,'prism',offset(5,3))).toHaveLength(11);
 });
 it('casts six short diagonals from every origin, with spaced cells and no off-board or backward hits',()=>{
  for(const from of cells())for(const d of DIAGONALS){
   const expected=[1,2,3].map(n=>add(from,scale(d,n))).filter(inside),first=add(from,d);
   expect(diagonalRay(from,first,6,new Set())).toEqual(expected);
   for(const [i,h]of expected.entries())expect(distance(from,h)).toBe((i+1)*2);
   expect(hexVertices(from)).toContainEqual(diagonalStart(from,first));
  }
  expect(diagonalRay(offset(5,3),offset(5,3),6,new Set())).toEqual([]);
 });
 it('solo diagonals move with the caster, hit allies and deduplicate a multi-contact enemy',()=>{
  const {b,u,partner,enemy}=yard();u.hex=offset(2,1);partner.hex=offset(4,2);enemy.hex=offset(5,3);enemy.footprint=[{q:0,r:0},{q:1,r:1}];
  expect(shape(b,u,'sunline',enemy.hex)).toEqual([offset(4,2),offset(5,3),offset(7,4)]);
  const hit=targets(b,u,'sunline',enemy.hex),hp=enemy.hp,predicted=damage(u,enemy,'sunline');expect(hit.filter(v=>v===enemy)).toHaveLength(1);expect(hit).toContain(partner);expect(hit).not.toContain(u);
  cast(b,u,'sunline',enemy.hex);expect(enemy.hp).toBe(hp-predicted);
 });
 for(const rank of [1,2,3])it(`Horizon light rank ${rank} previews and hits beyond rocks and intact cover within its normal range`,()=>{
  const {b,u,enemy}=yard(undefined,15,{...encounter,fixtures:[{id:'cover',kind:'barricade',name:'Cover',col:4,row:2,hp:500}]});
  u.skills!.sunline=rank;u.hex=offset(2,1);enemy.hex=offset(5,3);
  b.obstacles.add(key(offset(3,2)));
  expect(shape(b,u,'sunline',enemy.hex)).toEqual([offset(4,2),offset(5,3),...(rank===1?[]:[offset(7,4)])]);
  expect(legalAim(b,u,'sunline',enemy.hex)).toBe(true);expect(targets(b,u,'sunline',enemy.hex)).toContain(enemy);
  expect(legalAim(b,u,'sunline',add(u.hex,scale(DIAGONALS[0],4)))).toBe(false);
  const hp=enemy.hp,predicted=damage(u,enemy,'sunline');
  expect(cast(b,u,'sunline',enemy.hex)).toBe(true);expect(enemy.hp).toBe(hp-predicted);
  expect(b.fixtures![0].hp).toBeLessThan(500);expect(b.fixtures![0].hp).toBeGreaterThan(0);
  expect(b.obstacles.has(key(offset(4,2)))).toBe(true);
 });
 it('keeps Orrin’s pressure seam and Steam lance blocked by obstacles',()=>{
  const {b,partner}=yard();partner.hex=offset(2,1);b.obstacles.add(key(offset(4,2)));
  expect(shape(b,partner,'pressureline',offset(5,3))).toEqual([offset(4,2)]);
  b.obstacles.add(key(offset(3,1)));expect(shape(b,partner,'steam',offset(5,1))).toEqual([]);
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
   const low=defaultBuild(id,5),high=learnedAbilities(id,15);expect(SKILLS[id].some(s=>(defaultBuild(id,15).skills[s.id]??0)>(low.skills[s.id]??0))).toBe(true);expect(SKILLS[id].some(s=>s.levels.some(l=>l>5))).toBe(true);
   for(const skill of high)expect(ABILITIES[skill]).toBeDefined();
  }
  expect(learnedAbilities('nell',1)).not.toContain('daybreak');expect(learnedAbilities('celia',1)).toContain('daybreak');
  expect(learnedAbilities('celia',15).filter(id=>damagingAbility(id)&&!ABILITIES[id].team)).toEqual(['strike','celestialbolt']);
 });
 it('pin limits the next turn’s movement without taking away its attack or extending through wait',()=>{
  const {b,u,enemy}=yard(['kit','petra','celia']);cast(b,u,'pin',enemy.hex);expect(enemy.pinned).toBe(true);
  b.queue=[enemy.id,'petra','celia'];expect([...movement(b,enemy).values()].every(v=>v.cost<=1)).toBe(true);
  wait(b);expect(enemy.pinned).toBe(true);b.queue=[enemy.id,'petra','celia'];defend(b);expect(enemy.pinned).toBeUndefined();
 });
});

describe('support at campaign levels',()=>{
 it('Dazzle cannot target allies while a halo only affects enemies',()=>{const {b,u,partner,enemy}=yard();expect(legalAim(b,u,'dazzle',partner.hex)).toBe(false);expect(targets(b,u,'dazzle',partner.hex)).toEqual([]);u.hex=offset(6,3);expect(targets(b,u,'dimhalo',enemy.hex).every(v=>v.side==='enemy')).toBe(true);});
 it('scales healing and guard by caster level rather than weapon damage or target stat edits',()=>{
  const {u,partner}=yard();u.skills!.mend=1;u.level=1;expect(supportPower(u,'mend')).toBe(18);expect(supportPower(u,'guard')).toBe(10);
  u.level=15;expect(supportPower(u,'mend')).toBe(46);expect(supportPower(u,'beacon')).toBe(42);expect(supportPower(u,'guard')).toBe(31);expect(supportPower(u,'sanctuary')).toBe(29);
  const value=damage(u,{...partner,hp:1},'mend');u.bonus=999;expect(damage(u,{...partner,hp:1},'mend')).toBe(value);expect(supportPower(u,'bandage')).toBe(24);
 });
 it('revives exactly one ally on a clear hex with no extra turn or retaliation that round',()=>{
  const {b,u,partner}=yard(['celia','nell','orrin']);partner.hp=0;b.queue=[u.id,'orrin',...b.queue.filter(id=>!['celia','nell','orrin'].includes(id))];
  expect(legalAim(b,u,'heal',partner.hex)).toBe(true);cast(b,u,'heal',partner.hex);
  expect(partner.hp).toBe(Math.ceil(partner.maxHp*.35));expect(b.queue).not.toContain(partner.id);expect(partner.retaliated).toBe(true);expect(u.focus).toBe(2);
 });
 it('rejects revival onto an occupied or blocked hex, or on a living or opposing fighter',()=>{
  const {b,u,partner,third,enemy}=yard(['celia','nell','orrin']);partner.hp=0;third.hex={...partner.hex};
  expect(legalAim(b,u,'heal',partner.hex)).toBe(false);third.hex=offset(1,0);b.obstacles.add(key(partner.hex));expect(legalAim(b,u,'heal',partner.hex)).toBe(false);
  b.obstacles.clear();partner.hp=1;expect(legalAim(b,u,'heal',partner.hex)).toBe(true);enemy.hp=0;expect(legalAim(b,u,'heal',enemy.hex)).toBe(false);
 });
});

describe('disruptible enemy links and battlefield objects',()=>{
 it('announces a fixed even-round relay, spends both machine turns, and snapshots its area before advancing',()=>{
  const {b,u,enemy,crow}=yard(undefined,13,{...encounter,coordinated:true});b.round=2;b.queue=[crow.id,enemy.id,u.id];prepareRelay(b);
  expect(crow.intent?.cells.length).toBeGreaterThan(0);const announced=structuredClone(crow.intent!.cells);u.hex=offset(0,0);prepareRelay(b);expect(crow.intent?.cells).toEqual(announced);
  let captured:unknown;expect(enemyTurn(b,undefined,(id,aim)=>{captured={id,cells:shape(b,crow,id,aim)};})).toBe('relay');
  expect(captured).toEqual({id:'relay',cells:announced});expect(b.queue).toContain(enemy.id);expect(movementOnly(b,enemy)).toBe(true);expect(b.queue).not.toContain(crow.id);expect(crow.focus).toBe(4);expect(enemy.focus).toBe(4);
 });
 it('shows one shared charging warning for a whole round before a fast enemy can fire',()=>{
  const {b,u,enemy,crow}=yard(undefined,13,{...encounter,coordinated:true});expect(b.round).toBe(1);expect(crow.intent!.cells.length).toBeGreaterThan(0);expect(crow.intent!.cells).toEqual(enemy.intent!.cells);const warned=structuredClone(crow.intent!.cells);
  b.queue=[crow.id,enemy.id,u.id];expect(legalAim(b,crow,'relay',crow.hex)).toBe(false);b.queue=[enemy.id,u.id];prepareRelay(b);expect(crow.intent!.cells).toEqual(warned);
  b.round=2;b.queue=[crow.id,enemy.id,u.id];u.hex=offset(0,0);prepareRelay(b);expect(crow.intent!.cells).toEqual(warned);expect(enemy.intent!.cells).toEqual(warned);
 });
 it('clears the warning when a partner dies, has spent its turn, or has no focus',()=>{
  for(const failure of ['dead','spent','focus']as const){
   const {b,enemy,crow}=yard(undefined,13,{...encounter,coordinated:true});b.round=2;b.queue=[crow.id,enemy.id,'nell'];prepareRelay(b);expect(crow.intent!.cells.length).toBeGreaterThan(0);
   if(failure==='dead')enemy.hp=0;if(failure==='spent')b.queue=b.queue.filter(id=>id!==enemy.id);if(failure==='focus')enemy.focus=0;
   prepareRelay(b);expect(crow.intent!.cells).toEqual([]);expect(legalAim(b,crow,'relay',crow.hex)).toBe(false);
  }
 });
 it('every strike adds a burst without disabling vents or damaging the wheel',()=>{
  const e:Encounter={...encounter,vents:[[10,6]],fixtures:[{id:'valve',kind:'valve',name:'Valve',col:3,row:3,vents:[[5,3]]}]};
  const {b,u,enemy}=yard(undefined,13,e);enemy.hex=offset(5,3);const hp=enemy.hp;expect(b.vents.size).toBe(2);
  const wheel=fixtureAt(b,offset(3,3))!,wheelHp=wheel.hp;
  expect(targets(b,u,'strike',wheel.hex)).toEqual([]);expect(cast(b,u,'strike',wheel.hex)).toBe(true);expect(wheel.hp).toBe(wheelHp);
  expect(enemy.hp).toBe(hp-6);expect(b.vents.has(key(enemy.hex))).toBe(true);expect(b.vents.has(key(offset(10,6)))).toBe(true);expect(b.queue).not.toContain(u.id);
  b.queue=[u.id,'orrin'];expect(cast(b,u,'strike',wheel.hex)).toBe(true);expect(b.vents.has(key(enemy.hex))).toBe(true);expect(enemy.hp).toBe(hp-12);expect(wheel.bursts).toBe(2);
 });
 it('ranged and area attacks trigger a burst, while support and zero-damage actions cannot',()=>{
  for(const [ability,hero] of [['quickshot','kit'],['burst','nell']]as const){
   const {b,u}=yard([hero,'petra','celia'],13,{...encounter,fixtures:[{id:'valve',kind:'valve',name:'Valve',col:5,row:3,vents:[[6,3]]}]});
   expect(cast(b,u,ability,offset(5,3))).toBe(true);expect(b.fixtures![0].bursts).toBe(1);expect(b.vents.size).toBe(1);
  }
  const {b,u}=yard(['petra','celia','nell'],13,{...encounter,fixtures:[{id:'valve',kind:'valve',name:'Valve',col:3,row:3,vents:[[6,3]]}]});
  for(const id of ['bash','bandage','taunt']as const)expect(legalAim(b,u,id,offset(3,3))).toBe(false);expect(b.fixtures![0].bursts).toBeUndefined();
 });
 it('campaign vents are always active, with an extra burst on every hit and unchanged round-end damage',()=>{
  for(const id of ['coast-loading','hammer-lift']){
   const {b,u,enemy}=yard(['nell','orrin','kit'],13,ENCOUNTERS[id]),wheel=b.fixtures!.find(f=>f.kind==='valve')!,hp=enemy.hp;
   expect(b.vents.size).toBe(wheel.vents!.length);enemy.hex={...wheel.vents![0]};
   b.queue=['orrin'];expect(defend(b)).toBe(true);expect(enemy.hp).toBe(hp-6);
   for(let hit=1;hit<=3;hit++){
    b.queue=[u.id,'orrin'];expect(cast(b,u,'strike',wheel.hex)).toBe(true);
    expect(enemy.hp).toBe(hp-6-hit*6);expect(wheel.bursts).toBe(hit);expect(b.vents.size).toBe(wheel.vents!.length);
   }
   b.queue=['orrin'];expect(defend(b)).toBe(true);expect(enemy.hp).toBe(hp-30);
  }
 });
 it('steam bursts hit either side once per body, ignore armour and barriers like floor heat, and miss flyers',()=>{
  const {b,u,enemy,third,crow}=yard(undefined,13,{...encounter,fixtures:[{id:'valve',kind:'valve',name:'Valve',col:3,row:3,vents:[[5,3],[6,3],[5,4],[6,4]]}]});
  enemy.hex=offset(5,3);enemy.footprint=[{q:0,r:0},{q:1,r:0}];enemy.armor=999;enemy.guard=99;enemy.defending=true;third.hex=offset(6,4);crow.hex=offset(5,4);
  const hp=[enemy.hp,third.hp,crow.hp];expect(cast(b,u,'strike',offset(3,3))).toBe(true);
  expect(enemy.hp).toBe(hp[0]-6);expect(enemy.guard).toBe(99);expect(third.hp).toBe(hp[1]-6);expect(crow.hp).toBe(hp[2]);
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
