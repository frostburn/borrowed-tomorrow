import {expect,it} from 'vitest';
import { createBattle, enemyTurn, damage, type Encounter } from '../src/rules/combat';
import { ENCOUNTERS } from '../src/content/encounters';
import {newGame,recruitOrrin} from '../src/rules/state';
import {ENEMY_VARIANTS} from '../src/content/enemy-variants';
import {offset,key,distance} from '../src/rules/hex';
import {palaceCheckpoint,brokenCheckpoint} from './support/progress';
import {readFileSync} from 'node:fs';

function hound(){
 const s=newGame();recruitOrrin(s);const b=createBattle('pursuit',s),nell=b.units[0],enemy=b.units[2];
 b.units=[nell,enemy];b.queue=[enemy.id,nell.id];b.obstacles.clear();enemy.hex=offset(6,3);nell.hex=offset(5,3);
 // This makes retaliation more expensive than the attack itself.
 nell.bonus=50;return {b,nell,enemy};
}
it('a hound attacks a reachable target even when retaliation will kill it',()=>{
 const {b,nell,enemy}=hound(),hp=nell.hp;expect(damage(nell,enemy,'strike')).toBeGreaterThan(enemy.hp);
 expect(enemyTurn(b)).toBe('strike');expect(nell.hp).toBeLessThan(hp);expect(enemy.hp).toBe(0);
 expect(b.log.some(t=>t.includes('defends'))).toBe(false);
});
it('a hound moves into reach and attacks despite retaliation and a vent penalty',()=>{
 const {b,nell,enemy}=hound();nell.hex=offset(2,3);b.vents.add(key(offset(3,3)));
 expect(enemyTurn(b)).toBe('strike');expect(distance(enemy.hex,nell.hex)).toBe(1);expect(enemy.moved).toBe(true);
});
it('a hound approaches and defends only when it cannot reach an attack this turn',()=>{
 const {b,nell,enemy}=hound();enemy.hex=offset(10,3);nell.hex=offset(1,3);const start=distance(enemy.hex,nell.hex);
 expect(enemyTurn(b)).toBe('defend');expect(distance(enemy.hex,nell.hex)).toBeLessThan(start);expect(nell.hp).toBe(nell.maxHp);
});
it('an enemy attacks through a full barrier instead of treating zero HP damage as unreachable',()=>{
 const {b,nell,enemy}=hound();nell.guard=99;const guard=nell.guard;
 expect(damage(enemy,nell,'strike')).toBe(0);expect(enemyTurn(b)).toBe('strike');expect(nell.guard).toBeLessThan(guard);
});
it('variants remain fixed to their encounter and keep their base combat roles and unique bosses',()=>{
 for(const [id,variant]of Object.entries(ENEMY_VARIANTS)){
  const e:Encounter={...ENCOUNTERS.workshop,enemies:[{kind:variant.kind,variant:id as keyof typeof ENEMY_VARIANTS,col:7,row:3}]};
  const low=createBattle(e,newGame()).units.at(-1)!;const s=newGame();s.xp=9999;const high=createBattle(e,s).units.at(-1)!;
  expect(low).toMatchObject({kind:variant.kind,appearance:id,name:variant.name,maxHp:variant.hp,bonus:variant.bonus,armor:variant.armor,speed:variant.speed,movement:variant.movement});
  expect(high).toEqual(low);
  const base=createBattle({...e,enemies:[{kind:variant.kind,col:7,row:3}]},newGame()).units.at(-1)!;expect(low.abilities).toEqual(base.abilities);
  const svg=readFileSync(`public/art/vector/${id}.svg`,'utf8');expect(svg).toContain('width="80" height="80"');expect(svg).not.toContain('<image');
 }
 const b=createBattle('works-warden',palaceCheckpoint('worksSeen'));expect(b.units.find(u=>u.appearance==='relay-keeper')).toMatchObject({name:'The Engine Warden',maxHp:145,bonus:3});
 expect(createBattle('sanctuary-warden',brokenCheckpoint('signalCut')).units.find(u=>u.appearance==='sluice-keeper')).toMatchObject({maxHp:245,bonus:9});
});
it('each later chapter uses tougher common enemies, visibly tied to a distinct palette',()=>{
 for(const kind of ['hound','crow','guardian']as const){
  const tiers=Object.entries(ENEMY_VARIANTS).filter(([,v])=>v.kind===kind).sort(([,a],[,z])=>a.chapter-z.chapter);
  expect([...new Set(tiers.map(([,v])=>v.chapter))]).toEqual([2,3,4,5,6]);
  for(let i=1;i<tiers.length;i++){
   // Parallel regions in one chapter may share a tier; later chapters still
   // exceed every prior region, independently of registry order.
   const [id,v]=tiers[i];for(const [,prior]of tiers.filter(([,p])=>p.chapter<v.chapter)){expect(v.hp,id).toBeGreaterThan(prior.hp);expect(v.bonus,id).toBeGreaterThan(prior.bonus);}
   expect(v.colors).not.toEqual(tiers[i-1][1].colors);
  }
 }
 for(const e of Object.values(ENCOUNTERS))for(const enemy of e.enemies){
  if(enemy.variant){expect(ENEMY_VARIANTS[enemy.variant].kind).toBe(enemy.kind);expect(enemy.hp).toBeUndefined();expect(enemy.bonus).toBeUndefined();}
 }
 expect(()=>createBattle({...ENCOUNTERS.workshop,enemies:[{kind:'crow',variant:'hound-steel',col:7,row:3}]},newGame())).toThrow('combat role');
});
