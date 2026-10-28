import {fireBossDirect} from './support/boss';
import {expect,it} from 'vitest';
import {chapterSevenRefugeStart} from '../src/dev/canonical-saves';
import {createBattle,active,cast,damage,defend,enemyTurn,legalAim,movement,shape,targets,unitAt} from '../src/rules/combat';
import {benefactorUnit,benefactorMinions,prepareBenefactor,summonBenefactor} from '../src/rules/benefactor';
import {occupiedHexes} from '../src/rules/footprint';
import {cells,inside,key,offset} from '../src/rules/hex';
const ids=['benefactor-body','benefactor-sun','benefactor-heart'];
for(const id of ids)for(const party of [['nell'],['orrin','petra'],['kit','celia','nell']]as const)it(`${id} supports ${party.length} fighters below a legal solid body`,()=>{
 const s=chapterSevenRefugeStart();s.activeParty=[...party];const b=createBattle(id,s),core=benefactorUnit(b)!,body=occupiedHexes(core),heroes=b.units.filter(u=>u.side==='party');
 expect(body).toHaveLength(id==='benefactor-heart'?7:19);expect(body.every(inside)).toBe(true);
 expect(heroes.every(u=>u.hex.r>Math.max(...body.map(h=>h.r)))).toBe(true);
 for(const h of body){expect(unitAt(b,h)).toBe(core);expect(movement(b,heroes[0]).has(key(h))).toBe(false);}
 expect(core.intent!.cells.every(inside)).toBe(true);
});
it('keeps every warning fixed through the round, with Taunt redirecting the actual attack cells',()=>{
 for(const id of ids){
  const b=createBattle(id,chapterSevenRefugeStart()),core=benefactorUnit(b)!,hero=active(b)!,warning=structuredClone(core.intent);
  hero.hex=offset(10,6);prepareBenefactor(b);expect(core.intent).toEqual(warning);
  core.tauntedBy=hero.id;prepareBenefactor(b);expect(core.intent!.cells).toEqual(occupiedHexes(hero));
  core.tauntedBy=undefined;prepareBenefactor(b);expect(core.intent!.cells).toEqual(warning!.cells);
 }
});
it('does not consume Dazzle during the empty-source pause and still respects barriers on attacks',()=>{
 const b=createBattle('benefactor-body',chapterSevenRefugeStart()),core=benefactorUnit(b)!,hero=b.units[0];
 b.round=4;core.dazzledAttacks=3;prepareBenefactor(b);expect(core.intent!.power).toBe(0);b.queue=[core.id,hero.id];enemyTurn(b);expect(core.dazzledAttacks).toBe(3);
 b.round=5;prepareBenefactor(b);core.tauntedBy=hero.id;prepareBenefactor(b);hero.guard=10;b.queue=[core.id,hero.id];const hp=hero.hp;
 fireBossDirect(b);enemyTurn(b);expect(core.dazzledAttacks).toBe(1);expect(hero.guard).toBe(0);expect(hero.hp).toBeLessThan(hp);
});
it('hits overlapping contacts once and ends the final fight through ordinary damage',()=>{
 const s=chapterSevenRefugeStart();s.activeParty=['nell'];const b=createBattle('benefactor-heart',s),core=benefactorUnit(b)!,u=active(b)!;
 u.hex=offset(5,4);u.focus=6;b.queue=[u.id,core.id];const body=new Set(occupiedHexes(core).map(key));
 const aim=cells().find(h=>legalAim(b,u,'burst',h)&&shape(b,u,'burst',h).filter(p=>body.has(key(p))).length>1)!;
 expect(aim).toBeTruthy();expect(targets(b,u,'burst',aim).filter(t=>t.id===core.id)).toHaveLength(1);
 const hit=damage(u,core,'burst');core.hp=hit;expect(cast(b,u,'burst',aim)).toBe(true);expect(b.result).toBe('victory');
});

for(const id of ['benefactor-sun','benefactor-heart'])it(`${id} summons at its turn, keeps both attacks and queues arrivals for the next round`,()=>{
 const b=createBattle(id,chapterSevenRefugeStart()),core=benefactorUnit(b)!,warning=structuredClone(core.intent);
 expect(benefactorMinions(b)).toHaveLength(0);expect(summonBenefactor(b)).toEqual([]);
 b.queue=[core.id,...b.queue.filter(id=>id!==core.id)];const rest=b.queue.slice(1);
 expect(enemyTurn(b)).toBe('claim');expect(active(b)).toBe(core);
 const minions=benefactorMinions(b);expect(minions).toHaveLength(2);
 expect(minions[0]).toMatchObject({kind:'herald',hp:205,bonus:15,abilities:['sunbeam','strike']});
 expect(minions[1]).toMatchObject({kind:'glasswing',hp:100,bonus:13,abilities:['splinter','strike']});expect(b.queue).toEqual([core.id,...rest]);
 expect(minions.every(u=>u.retaliated)).toBe(true);expect(core.intent).toEqual(warning);
 expect(enemyTurn(b)).toBe('judgment');expect(benefactorMinions(b)).toHaveLength(2);
 while(b.round===1)defend(b);
 expect(minions.every(u=>b.queue.includes(u.id)&&!u.retaliated)).toBe(true);
 // Once alive, both archetypes use ordinary attacks and can strip protection.
 const u=minions[0],hero=b.units.find(u=>u.side==='party')!;hero.hex=offset(2,4);hero.guard=5;u.tauntedBy=hero.id;b.queue=[u.id,core.id];
 const before=hero.hp;expect(enemyTurn(b)).not.toBe('defend');expect(hero.guard).toBe(0);expect(hero.hp).toBeLessThan(before);
});
it('caps waves at two living minions, replaces losses only on later odd rounds and inherits active Taunt',()=>{
 const b=createBattle('benefactor-heart',chapterSevenRefugeStart()),core=benefactorUnit(b)!,hero=b.units.find(u=>u.side==='party')!;
 b.queue=[core.id,hero.id];core.tauntedBy=hero.id;
 const first=summonBenefactor(b);expect(first.map(u=>u.kind)).toEqual(['herald','glasswing']);expect(first.every(u=>u.tauntedBy===hero.id)).toBe(true);
 first[0].hp=0;expect(summonBenefactor(b)).toEqual([]);b.round=2;expect(summonBenefactor(b)).toEqual([]);
 b.round=3;const replacement=summonBenefactor(b);expect(replacement).toHaveLength(1);expect(replacement[0].kind).toBe('herald');expect(first.map(u=>u.id)).not.toContain(replacement[0].id);
 b.round=5;expect(summonBenefactor(b)).toEqual([]);expect(benefactorMinions(b).filter(u=>u.hp>0)).toHaveLength(2);
});
it('never overlaps bodies, heroes, fallen allies, cover or fixtures; blocked arrivals do not stall a turn',()=>{
 const b=createBattle('benefactor-heart',chapterSevenRefugeStart()),core=benefactorUnit(b)!,heroes=b.units.filter(u=>u.side==='party');b.queue=[core.id,...heroes.map(u=>u.id)];
 heroes[0].hex=offset(1,4);heroes[1].hex=offset(9,4);heroes[1].hp=0;
 b.obstacles.add(key(offset(1,5)));b.fixtures=[{id:'valve',name:'Valve',kind:'valve',hex:offset(9,5),hp:30,maxHp:30}];
 const before=new Set(b.units.flatMap(u=>occupiedHexes(u).map(key))),wave=summonBenefactor(b);
 expect(wave).toHaveLength(2);expect(wave.every(u=>inside(u.hex)&&!before.has(key(u.hex))&&!b.obstacles.has(key(u.hex))&&!b.fixtures!.some(f=>key(f.hex)===key(u.hex)))).toBe(true);
 for(const u of wave)u.hp=0;b.round=3;b.obstacles=new Set(cells().map(key));expect(summonBenefactor(b)).toEqual([]);
 expect(enemyTurn(b)).toBe('claim');expect(active(b)).toBe(core);
});
it('leaves the mantle and fourth-round respite unchanged, and killing either summoning source ends its minions',()=>{
 const mantle=createBattle('benefactor-body',chapterSevenRefugeStart()),body=benefactorUnit(mantle)!;mantle.queue=[body.id];expect(summonBenefactor(mantle)).toEqual([]);
 for(const id of ['benefactor-sun','benefactor-heart']){
  const s=chapterSevenRefugeStart(),b=createBattle(id,s),core=benefactorUnit(b)!,hero=b.units.find(u=>u.side==='party'&&u.kind==='nell')!;b.queue=[core.id,hero.id];summonBenefactor(b);
  b.round=4;prepareBenefactor(b);core.dazzledAttacks=3;expect(enemyTurn(b)).toBeUndefined();expect(core.dazzledAttacks).toBe(3);expect(benefactorMinions(b)).toHaveLength(2);
  hero.hex=offset(5,id==='benefactor-heart'?4:5);hero.focus=6;b.queue=[hero.id,core.id];core.hp=1;
  const aim=occupiedHexes(core).find(h=>legalAim(b,hero,'burst',h))!;expect(cast(b,hero,'burst',aim)).toBe(true);
  expect(b.result).toBe('victory');expect(benefactorMinions(b).every(u=>u.hp===0)).toBe(true);expect(summonBenefactor(b)).toEqual([]);
 }
});
