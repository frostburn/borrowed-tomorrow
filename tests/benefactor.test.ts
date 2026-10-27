import {fireBossDirect} from './support/boss';
import {expect,it} from 'vitest';
import {chapterSevenRefugeStart} from '../src/dev/canonical-saves';
import {createBattle,active,cast,damage,enemyTurn,legalAim,movement,shape,targets,unitAt} from '../src/rules/combat';
import {benefactorUnit,prepareBenefactor} from '../src/rules/benefactor';
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
