import {expect,it} from 'vitest';
import {active,cast,createBattle,damage,enemyTurn,shape,type Battle} from '../src/rules/combat';
import {bossDirectAbility,bossDirectHint,bossDirectTarget} from '../src/rules/boss-direct';
import {chapterFiveStart,chapterSixDragonStart,chapterSixFinaleStart,chapterSevenRefugeStart} from '../src/dev/canonical-saves';
import {prepareBenefactor} from '../src/rules/benefactor';
import {prepareImperial} from '../src/rules/imperial-vessel';
import {prepareWard,wardMirrors,wardUnit} from '../src/rules/ward';
import {enemyForecast} from '../src/headless/defensive';
import {offset} from '../src/rules/hex';

const encounters=['hammer-carrier','wind-engine','alban-flagship','sun-serpent','winter-dragon','imperial-vessel','lightbearer','domain-collector','domain-furnace','domain-ward','domain-dragon','benefactor-body','benefactor-sun','benefactor-heart'];
const setup=(id:string)=>createBattle(id,id==='lightbearer'?chapterSixFinaleStart(false):id==='imperial-vessel'?chapterSixFinaleStart(true):id==='sun-serpent'||id==='winter-dragon'?chapterSixDragonStart(true):id.startsWith('domain-')||id.startsWith('benefactor-')?chapterSevenRefugeStart():chapterFiveStart());
const shooter=(b:Battle)=>b.units.find(u=>bossDirectAbility(u))!;

for(const id of encounters)it(`${id} fires one direct shot and retains exactly one marked main action`,()=>{
 const b=setup(id),u=shooter(b),shot=bossDirectAbility(u)!,target=bossDirectTarget(b,u)!;
 expect(b.units.filter(u=>bossDirectAbility(u))).toHaveLength(1);
 const warning=structuredClone(u.intent),hp=target.hp,hit=damage(u,target,shot),round=b.round,callbacks:string[]=[];
 b.queue=[u.id,target.id];
 expect(enemyTurn(b,undefined,(id,aim)=>{callbacks.push(id);expect(shape(b,u,id,aim)).toEqual([target.hex]);})).toBe(shot);
 expect(callbacks).toEqual([shot]);expect(target.hp).toBe(hp-hit);expect(active(b)).toBe(u);expect(b.round).toBe(round);
 expect(u.intent).toEqual(warning);expect(u.bonusUsed).toBe(true);
 expect(cast(b,u,shot,target.hex)).toBe(false);
 expect(enemyTurn(b)).toBe(u.abilities.includes('refraction')?'refraction':'judgment');
 expect(active(b)?.id).not.toBe(u.id);expect(b.round).toBe(round);
});

it('dodging the marked area still avoids the heavy hit while a direct shot reaches safe ground',()=>{
 const b=setup('benefactor-body'),u=shooter(b),heroes=b.units.filter(u=>u.side==='party');
 heroes.forEach((h,i)=>{h.hex=offset(10-i,6);});
 const target=bossDirectTarget(b,u)!,hp=target.hp,warning=structuredClone(u.intent!.cells);
 b.queue=[u.id,...heroes.map(h=>h.id)];expect(bossDirectHint(b)).toContain(`targets ${target.name} directly`);
 expect(enemyTurn(b)).toBe('claim');expect(target.hp).toBeLessThan(hp);
 const afterShot=heroes.map(h=>h.hp);expect(enemyTurn(b)).toBe('judgment');expect(heroes.map(h=>h.hp)).toEqual(afterShot);
 expect(u.intent!.cells).toEqual(warning);
});

it('honors Taunt, defense, guard and three attacks of Dazzle, independently for each shot and pattern',()=>{
 const s=chapterSevenRefugeStart();s.activeParty=['nell','petra','celia'];
 const b=createBattle('benefactor-body',s),u=shooter(b),petra=b.units.find(u=>u.id==='petra')!;
 u.tauntedBy=petra.id;u.dazzledAttacks=3;petra.defending=true;petra.guard=8;prepareBenefactor(b);
 b.queue=[u.id,'nell'];const hp=petra.hp,expected=damage(u,petra,'claim');
  expect(bossDirectHint(b)).toContain('targets Petra directly');expect(bossDirectHint(b,true)).toBe('Claimed light: Petra (direct).');expect(enemyTurn(b)).toBe('claim');
 expect(petra.hp).toBe(hp-expected);expect(petra.guard).toBeLessThan(8);expect(u.dazzledAttacks).toBe(2);
 const afterShot=petra.hp,marked=damage(u,petra,'judgment');expect(enemyTurn(b)).toBe('judgment');
 expect(petra.hp).toBe(afterShot-marked);expect(u.dazzledAttacks).toBe(1);
 b.round++;u.bonusUsed=false;prepareBenefactor(b);b.queue=[u.id,'nell'];
 expect(enemyTurn(b)).toBe('claim');expect(u.dazzledAttacks).toBe(0);
});

it('rotates targets between rounds without selecting the most wounded fighter',()=>{
 const b=setup('benefactor-body'),u=shooter(b),heroes=b.units.filter(h=>h.side==='party');heroes[2].hp=1;
 for(let i=0;i<3;i++){b.round=i+1;expect(bossDirectTarget(b,u)).toBe(heroes[i]);}
 heroes[1].hp=0;b.round=2;expect(bossDirectTarget(b,u)).toBe(heroes[2]);
});

for(const id of ['imperial-vessel','lightbearer','benefactor-body','benefactor-sun','benefactor-heart'])it(`${id} keeps its fourth-round pause completely quiet`,()=>{
 const b=setup(id),u=shooter(b);b.round=4;u.dazzledAttacks=3;
 if(b.benefactor)prepareBenefactor(b);else prepareImperial(b);
 b.queue=[u.id,b.units[0].id];const hp=b.units.map(u=>u.hp),callbacks:string[]=[];
 expect(bossDirectHint(b)).toBe('');expect(enemyTurn(b,undefined,id=>callbacks.push(id))).toBeUndefined();
 expect(callbacks).toEqual([]);expect(b.units.map(u=>u.hp)).toEqual(hp);expect(u.dazzledAttacks).toBe(3);expect(u.bonusUsed).toBe(false);
});

it('breaking the lit ward projection interrupts both shots, even under Taunt',()=>{
 const b=setup('wind-engine'),u=wardUnit(b)!;wardMirrors(b).find(m=>m.id===u.intent!.via)!.hp=0;
 u.tauntedBy=b.units[0].id;u.dazzledAttacks=3;prepareWard(b);b.queue=[u.id,b.units[0].id];
 const hp=b.units[0].hp;expect(bossDirectHint(b)).toBe('');expect(enemyTurn(b)).toBeUndefined();
 expect(b.units[0].hp).toBe(hp);expect(u.dazzledAttacks).toBe(3);expect(active(b)?.id).not.toBe(u.id);
});

it('keeps earlier chapters and passive supports free of additional shots',()=>{
 for(const id of ['heart-feeds','heart-pressure','sanctuary-warden']){
  const b=createBattle(id,chapterFiveStart());expect(b.units.some(u=>bossDirectAbility(u))).toBe(false);
 }
 for(const id of encounters)expect(setup(id).units.filter(u=>u.passive).some(u=>bossDirectAbility(u))).toBe(false);
});

it('the defensive forecast resolves the extra shot and the marked attack using the same rules',()=>{
 const b=setup('benefactor-body'),u=shooter(b),target=bossDirectTarget(b,u)!;
 u.tauntedBy=target.id;prepareBenefactor(b);b.queue=[u.id,target.id];const copy=structuredClone(b);
 enemyTurn(copy);enemyTurn(copy);
 expect(enemyForecast(b).units.map(u=>u.hp)).toEqual(copy.units.map(u=>u.hp));
 expect(b.units.find(u=>u.id===target.id)!.hp).toBe(target.maxHp);
});
