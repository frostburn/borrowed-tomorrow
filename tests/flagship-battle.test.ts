import { describe, expect, it } from 'vitest';
import { active, cast, damage, defend, legalAim, targets, type Battle } from '../src/rules/combat';
import { cells, equal, inside, key, offset } from '../src/rules/hex';
import { occupiedHexes } from '../src/rules/footprint';
import { createFlagshipBattle, FLAGSHIP_PARTS, flagshipPart, flagshipTurn, prepareFlagship } from '../src/dev/flagship-battle';

const enemies=(b:Battle)=>b.units.filter(u=>u.side==='enemy');
const next=(b:Battle)=>{if(active(b)?.side==='party')defend(b);else flagshipTurn(b);prepareFlagship(b);};

describe('dev flagship components',()=>{
  it('places three separate anchored bodies above the chosen one-to-three heroes',()=>{
    for(const party of [['nell'],['nell','celia'],['nell','orrin','petra']] as const){
      const b=createFlagshipBattle(undefined,undefined,party),occupied=b.units.flatMap(u=>occupiedHexes(u));
      expect(occupied.every(inside)).toBe(true);expect(new Set(occupied.map(key)).size).toBe(occupied.length);
      for(const id of FLAGSHIP_PARTS){const u=flagshipPart(b,id);expect(u.anchored).toBe(true);expect(occupiedHexes(u)).toHaveLength(3);expect(u.hex.r).toBeLessThan(4);}
      expect(b.units.filter(u=>u.side==='party').map(u=>u.id)).toEqual(party);expect(b.units.filter(u=>u.side==='party').every(u=>u.hex.r===6)).toBe(true);
    }
  });
  it('keeps the bridge sealed until both batteries fall, and never restores a gun',()=>{
    const b=createFlagshipBattle(),bridge=flagshipPart(b,'flagship-bridge'),port=flagshipPart(b,'flagship-port'),starboard=flagshipPart(b,'flagship-starboard');
    const hero=active(b)!;hero.hex=offset(4,2);b.queue=[hero.id,...enemies(b).map(u=>u.id)];
    expect(damage(hero,bridge,'strike')).toBe(0);
    port.hp=0;prepareFlagship(b);expect(bridge.sealed).toBe(true);expect(port.intent).toBeUndefined();
    starboard.hp=0;prepareFlagship(b);expect(bridge.sealed).toBe(false);expect(damage(hero,bridge,'strike')).toBeGreaterThan(0);
    prepareFlagship(b);expect(b.log.filter(t=>t.includes('bridge is exposed'))).toHaveLength(1);
    b.round++;prepareFlagship(b);expect(port.hp).toBe(0);expect(starboard.intent).toBeUndefined();expect(bridge.intent!.name).toBe('Emergency broadside');
  });
  it('hits each component once with an area attack and exposes only legal contact cells',()=>{
    const b=createFlagshipBattle(),u=b.units.find(u=>u.id==='nell')!,gun=flagshipPart(b,'flagship-port');
    u.hex=offset(3,3);b.queue=[u.id,...enemies(b).map(u=>u.id)];
    const aim=occupiedHexes(gun).find(h=>legalAim(b,u,'burst',h))!;
    expect(aim).toBeDefined();expect(targets(b,u,'burst',aim).filter(v=>v.id===gun.id)).toHaveLength(1);
    const before=gun.hp,amount=damage(u,gun,'burst');expect(cast(b,u,'burst',aim)).toBe(true);expect(gun.hp).toBe(before-amount);
  });
  it('holds announced cells across turns, honors Taunt and restores the original warning',()=>{
    const b=createFlagshipBattle(),gun=flagshipPart(b,'flagship-port'),petra=b.units.find(u=>u.id==='petra')!,original=structuredClone(gun.intent!.cells);
    b.units.find(u=>u.id==='nell')!.hex=offset(0,6);prepareFlagship(b);expect(gun.intent!.cells).toEqual(original);
    gun.tauntedBy=petra.id;prepareFlagship(b);expect(gun.intent!.cells).toEqual([petra.hex]);
    delete gun.tauntedBy;prepareFlagship(b);expect(gun.intent!.cells).toEqual(original);
    b.round++;prepareFlagship(b);expect(gun.intent!.name).toBe('Deck bombardment');expect(gun.intent!.cells).not.toEqual(original);
  });
  it('announces the next round after the last cannon without changing the fired shape',()=>{
    const b=createFlagshipBattle(),gun=flagshipPart(b,'flagship-port');b.queue=[gun.id];
    const before=structuredClone(gun.intent!.cells),hero=b.units.find(u=>u.id==='nell')!,hp=hero.hp,amount=damage(gun,hero,'judgment');
    expect(before.some(h=>equal(h,hero.hex))).toBe(true);expect(flagshipTurn(b)).toBe('judgment');expect(hero.hp).toBe(hp-amount);
    expect(b.round).toBe(2);prepareFlagship(b);expect(gun.intent!.round).toBe(2);expect(gun.intent!.cells).not.toEqual(before);
  });
  it('lets boarders attack and bash without stalling the initiative queue',()=>{
    const b=createFlagshipBattle();let attacked=false,pushed=false;
    for(let step=0;!b.result&&step<100;step++){
      next(b);attacked||=b.log.some(t=>t.includes('Boarding marine: Strike hits'));pushed||=b.log.some(t=>t.includes('is pushed one hex'));
    }
    expect(attacked).toBe(true);expect(pushed).toBe(true);expect(b.round).toBeGreaterThan(3);
    // A bash can push a defending survivor outside the fixed gun lanes. That is
    // a legal safe position, not an initiative stall or a required defeat.
    if(!b.result)expect(active(b)?.hp).toBeGreaterThan(0);
    else expect(b.result).toBe('defeat');
  });
  it('ends the boarding when the bridge falls, while preserving defeat and clone independence',()=>{
    const b=createFlagshipBattle(undefined,undefined,undefined,true),clone=structuredClone(b);
    expect(flagshipPart(b,'flagship-bridge').sealed).toBe(false);expect(flagshipPart(b,'flagship-port').hp).toBe(0);
    flagshipPart(b,'flagship-bridge').hp=0;prepareFlagship(b);expect(b.result).toBe('victory');expect(enemies(b).every(u=>u.hp===0)).toBe(true);
    expect(clone.result).toBeNull();expect(flagshipPart(clone,'flagship-bridge').hp).toBe(240);
    clone.result='defeat';flagshipPart(clone,'flagship-bridge').hp=0;prepareFlagship(clone);expect(clone.result).toBe('defeat');
    const mutual=createFlagshipBattle();for(const u of mutual.units)u.hp=0;prepareFlagship(mutual);expect(mutual.result).toBe('defeat');
  });
  it('makes gunfire use its announced cells rather than requiring an adjacent target',()=>{
    const b=createFlagshipBattle(),gun=flagshipPart(b,'flagship-starboard');b.queue=[gun.id];
    expect(legalAim(b,gun,'judgment',gun.hex)).toBe(true);
    expect(cells().filter(h=>gun.intent!.cells.some(c=>equal(c,h)))).toEqual(gun.intent!.cells);
    gun.dazzledAttacks=3;flagshipTurn(b);expect(gun.dazzledAttacks).toBe(2);
  });
});
