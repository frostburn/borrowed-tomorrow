import { describe, expect, it } from 'vitest';
import { ABILITIES, active, cast, createBattle, defend, enemyTurn, legalAim, move, movement, targets, wait } from '../src/rules/combat';
import { blast, cells, distance, fromPixel, key, offset, ray, toPixel, visible } from '../src/rules/hex';
import { newGame, recruitOrrin } from '../src/rules/state';

function party() { const s = newGame(); recruitOrrin(s); return s; }
describe('hex geometry and cover', () => {
  it('round-trips all 77 cells and keeps the six neighboring centers equidistant', () => {
    expect(cells()).toHaveLength(77);
    for (const h of cells()) { const p = toPixel(h); expect(fromPixel(p.x,p.y)).toEqual(h); }
    const center = offset(5,3), p = toPixel(center);
    for (const h of blast(center).slice(1)) { const n = toPixel(h); expect(Math.hypot(n.x-p.x,n.y-p.y)).toBeCloseTo(Math.sqrt(3)*35); expect(distance(h,center)).toBe(1); }
  });
  it('clips blasts at the board edge and stops steam and sight at a rock', () => {
    expect(blast(offset(0,0))).toHaveLength(3);
    const rock = new Set([key(offset(4,3))]);
    expect(ray(offset(1,3),offset(8,3),6,rock)).toEqual([offset(2,3),offset(3,3)]);
    expect(visible(offset(1,3),offset(8,3),rock)).toBe(false);
  });
});
describe('position-sensitive combat', () => {
  it('the blast preview and committed damage include a neighboring ally', () => {
    const b=createBattle('collector',party()),nell=b.units[0],orrin=b.units[1],hound=b.units[2];
    b.obstacles.clear();nell.hex=offset(4,3);orrin.hex=offset(6,3);hound.hex=offset(5,3);
    const before=orrin.hp;
    expect(targets(b,nell,'burst',hound.hex).map(u=>u.id)).toContain(orrin.id);
    expect(cast(b,nell,'burst',hound.hex)).toBe(true);
    expect(orrin.hp).toBe(before-ABILITIES.burst.power);
  });
  it('movement cannot cross occupied cells or rocks and does not consume the attack', () => {
    const b=createBattle('collector',party()),nell=b.units[0],orrin=b.units[1];
    orrin.hex=offset(2,2);b.obstacles.add(key(offset(1,3)));
    expect(movement(b,nell).has(key(orrin.hex))).toBe(false);
    expect(movement(b,nell).has(key(offset(1,3)))).toBe(false);
    expect(move(b,nell,offset(2,1))).not.toBeNull();expect(active(b)?.id).toBe('nell');
    expect(move(b,nell,offset(3,1))).toBeNull();expect(wait(b)).toBe(false);
  });
  it('wait delays an action without granting extra focus, and can only happen once', () => {
    const b=createBattle('collector',party()),nell=b.units[0];nell.focus=3;
    expect(wait(b)).toBe(true);
    while(active(b)?.id!=='nell')defend(b);
    expect(nell.focus).toBe(3);expect(wait(b)).toBe(false);
  });
  it('retaliation is limited to once per defender per round', () => {
    const b=createBattle('collector',party()),nell=b.units[0],orrin=b.units[1],hound=b.units[2];
    b.obstacles.clear();nell.hex=offset(4,3);orrin.hex=offset(5,2);hound.hex=offset(5,3);hound.hp=100;hound.maxHp=100;
    cast(b,nell,'strike',hound.hex);expect(hound.retaliated).toBe(true);expect(nell.hp).toBeLessThan(nell.maxHp);
    b.queue=['orrin',...b.queue.filter(id=>id!=='orrin')];const before=orrin.hp;
    cast(b,orrin,'strike',hound.hex);expect(orrin.hp).toBe(before);
  });
  it.each(['nell','orrin'])('captures %s retaliation before the next round resets its flag',hero=>{
    const b=createBattle('collector',party()),defender=b.units.find(u=>u.kind===hero)!,hound=b.units.find(u=>u.kind==='hound')!;
    b.units=[defender,hound];b.queue=[hound.id];b.obstacles.clear();b.vents.clear();
    defender.hex=offset(5,3);hound.hex=offset(4,3);defender.hp=hound.hp=100;
    const round=b.round,counters:string[]=[];
    expect(enemyTurn(b,id=>counters.push(id))).toBe('strike');
    expect(b.round).toBe(round+1);expect(defender.retaliated).toBe(false);
    expect(counters).toEqual([defender.id]);expect(hound.hp).toBeLessThan(100);
  });
  it('enemies can reach a legal action without occupying another unit or an obstacle', () => {
    const b=createBattle('captain',party());
    for(let turn=0;turn<35&&!b.result;turn++){
      const u=active(b)!;if(u.side==='party')defend(b);else enemyTurn(b);
      const living=b.units.filter(u=>u.hp>0);
      expect(new Set(living.map(u=>key(u.hex))).size).toBe(living.length);
      for(const v of living)expect(b.obstacles.has(key(v.hex))).toBe(false);
      if(active(b)?.side==='party')for(const h of cells())if(legalAim(b,active(b)!,'burst',h))expect(distance(active(b)!.hex,h)).toBeLessThanOrEqual(5);
    }
    expect(b.log.some(s=>s.includes('Signal flare'))).toBe(true);
  });
});
