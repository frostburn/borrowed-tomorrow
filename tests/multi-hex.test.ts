import {expect,it} from 'vitest';
import {active,cast,damage,legalAim,move,movement,pushDestination,shape,targets,unitAt} from '../src/rules/combat';
import {bodyDistance,occupiedHexes} from '../src/rules/footprint';
import {cells,distance,inside,key,offset} from '../src/rules/hex';
import {BOSS_ID,bossTurn,bossUnit,createBossBattle,prepareBoss} from '../src/dev/boss-battle';

it('all nineteen occupied hexes belong to one anchored boss and block movement',()=>{
  const b=createBossBattle(),boss=bossUnit(b),hero=active(b)!;
  expect(occupiedHexes(boss)).toHaveLength(19);expect(occupiedHexes(boss).every(inside)).toBe(true);
  for(const h of occupiedHexes(boss)){expect(unitAt(b,h)).toBe(boss);expect(movement(b,hero).has(key(h))).toBe(false);}
  b.queue=[BOSS_ID];expect(movement(b,boss).size).toBe(1);expect(move(b,boss,offset(6,2))).toBeNull();
  boss.hp=0;for(const h of occupiedHexes(boss))expect(unitAt(b,h)).toBeUndefined();
});

it('melee reaches a perimeter hex, retaliates once, and anchored shield bash preserves its extra-action rules',()=>{
  const b=createBossBattle(),boss=bossUnit(b),petra=b.units.find(u=>u.id==='petra')!;
  b.queue=['petra','nell'];petra.skills!.bash=1;petra.hex=offset(5,5);
  const edge=occupiedHexes(boss).find(h=>distance(petra.hex,h)===1)!;
  expect(distance(petra.hex,boss.hex)).toBeGreaterThan(1);expect(bodyDistance(petra,boss)).toBe(1);
  expect(legalAim(b,petra,'bash',edge)).toBe(true);expect(pushDestination(b,petra,boss)).toBeUndefined();
  expect(cast(b,petra,'bash',edge)).toBe(true);expect(boss.hp).toBe(boss.maxHp);expect(petra.bonusUsed).toBe(true);expect(petra.moved).toBe(false);expect(active(b)).toBe(petra);
  const hp=petra.hp,retaliation=damage(boss,petra,'strike');expect(cast(b,petra,'strike',edge)).toBe(true);
  expect(petra.hp).toBe(hp-retaliation);expect(boss.retaliated).toBe(true);
});

it.each(['burst','steam'] as const)('%s intersects several body hexes but damages the boss once',ability=>{
  const b=createBossBattle(undefined,undefined,['nell','orrin']),boss=bossUnit(b),u=b.units.find(u=>u.id===(ability==='steam'?'orrin':'nell'))!;
  b.queue=[u.id,BOSS_ID];u.focus=6;
  const body=new Set(occupiedHexes(boss).map(key));
  const aim=cells().find(h=>legalAim(b,u,ability,h)&&shape(b,u,ability,h).filter(h=>body.has(key(h))).length>1)!;
  expect(aim).toBeTruthy();expect(targets(b,u,ability,aim).filter(v=>v.id===BOSS_ID)).toHaveLength(1);
  const expected=damage(u,boss,ability),hp=boss.hp;expect(cast(b,u,ability,aim)).toBe(true);expect(boss.hp).toBe(hp-expected);
});

it('movement and pushes validate the whole translated body against cover and board edges',()=>{
  const b=createBossBattle(),hero=b.units[0];b.units=[hero];b.queue=[hero.id];hero.hex=offset(1,3);hero.footprint=[{q:0,r:0},{q:1,r:0}];hero.movement=10;
  b.obstacles.add(key(offset(3,3)));expect(movement(b,hero).has(key(offset(2,3)))).toBe(false);
  for(const reach of movement(b,hero).values())for(const h of occupiedHexes(hero,reach.hex)){expect(inside(h)).toBe(true);expect(b.obstacles.has(key(h))).toBe(false);}
  const other={...hero,id:'other',hex:offset(0,3),footprint:undefined};b.units.push(other);
  expect(pushDestination(b,other,hero)).toBeUndefined();
});

it('warnings stay fixed during a round and the heart phase starts at the next announcement',()=>{
  const b=createBossBattle(),boss=bossUnit(b),cells=structuredClone(boss.intent!.cells);
  b.units[0].hex=offset(1,6);boss.hp=boss.maxHp/2;prepareBoss(b);
  expect(boss.intent!.cells).toEqual(cells);expect(boss.intent!.phase).toBe('Borrowed light');
  b.round++;prepareBoss(b);expect(boss.intent!.phase).toBe('The hollow heart');expect(boss.intent!.name).toBe('Sundering rays');
});

it('taunt redirects announced judgment and guard, defense and three-attack dazzle use ordinary damage rules',()=>{
  const b=createBossBattle(),boss=bossUnit(b),petra=b.units.find(u=>u.id==='petra')!,nell=b.units.find(u=>u.id==='nell')!;
  boss.tauntedBy=petra.id;prepareBoss(b);expect(boss.intent!.cells).toEqual([petra.hex]);expect(boss.intent!.name).toContain('Petra');
  petra.guard=10;petra.defending=true;boss.dazzledAttacks=3;b.queue=[BOSS_ID];
  const hp=petra.hp,expected=damage(boss,petra,'judgment'),nellHp=nell.hp;
  expect(bossTurn(b)).toBe('judgment');expect(petra.hp).toBe(hp-expected);expect(petra.guard).toBeLessThan(10);expect(nell.hp).toBe(nellHp);expect(boss.dazzledAttacks).toBe(2);
});

it('clearing the preview yields a normal victory without adding a campaign encounter',()=>{
  const b=createBossBattle(),boss=bossUnit(b),hero=b.units[0];b.queue=[hero.id,BOSS_ID];boss.hp=1;
  expect(cast(b,hero,'burst',occupiedHexes(boss).find(h=>legalAim(b,hero,'burst',h))!)).toBe(true);expect(b.result).toBe('victory');
});
