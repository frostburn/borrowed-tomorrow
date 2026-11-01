import {expect,it} from 'vitest';
import {active,createBattle} from '../src/rules/combat';
import {chapterSevenRefugeStart} from '../src/dev/canonical-saves';
import {cells,key} from '../src/rules/hex';
import {occupiedHexes} from '../src/rules/footprint';
import {battleWarnings,partyWarningStyle,patternDisplayCells} from '../src/game/battle-warnings';

for(const id of ['heart-pressure','alban-flagship','imperial-vessel','winter-dragon','benefactor-body','benefactor-sun'])it(`${id} retains boss contacts beneath warnings and impact without changing the attack`,()=>{
 const b=createBattle(id,chapterSevenRefugeStart()),boss=b.units.find(u=>u.side==='enemy'&&u.intent)!;
 boss.intent!.cells=cells();const before=structuredClone(b),warning=battleWarnings(b);
 const contacts=b.units.filter(u=>u.side===boss.side&&u.hp>0).flatMap(u=>occupiedHexes(u));
 expect(contacts.length).toBeGreaterThan(0);
 for(const h of contacts)expect(warning.danger.has(key(h))).toBe(false);
 for(const h of occupiedHexes(boss))expect(warning.occupied.has(key(h))).toBe(true);
 const impact=battleWarnings(b,{actorId:boss.id,ability:'judgment',cells:boss.intent!.cells});
 for(const h of contacts)expect(impact.attackCells.has(key(h))).toBe(false);
 expect(impact.attackCells.has(key(b.units.find(u=>u.side==='party')!.hex))).toBe(true);
 expect(patternDisplayCells(b,boss,boss.intent!.cells)).toHaveLength(cells().length-contacts.length);
 expect(b).toEqual(before);
});

it('keeps other announced patterns visible during a direct shot and another source’s impact',()=>{
 const b=createBattle('alban-flagship',chapterSevenRefugeStart()),sources=b.units.filter(u=>u.intent);
 sources.forEach(u=>{u.intent!.cells=cells();});const boss=sources[0],hero=b.units.find(u=>u.side==='party')!;
 const direct=battleWarnings(b,{actorId:boss.id,ability:'strike',cells:[hero.hex]});
 expect(direct.danger.has(key(hero.hex))).toBe(true);expect(direct.attackCells.has(key(hero.hex))).toBe(true);
 const main=battleWarnings(b,{actorId:boss.id,ability:'judgment',cells:boss.intent!.cells});expect(main.danger.has(key(hero.hex))).toBe(true);
 const former=occupiedHexes(boss);boss.hp=0;
 for(const h of former){expect(battleWarnings(b).occupied.has(key(h))).toBe(false);expect(battleWarnings(b).danger.has(key(h))).toBe(true);}
});

it('emphasizes only the current party member and transfers that emphasis with initiative',()=>{
 const b=createBattle('benefactor-body',chapterSevenRefugeStart()),heroes=b.units.filter(u=>u.side==='party'),boss=b.units.find(u=>u.intent)!;
 boss.intent!.cells=heroes.map(u=>u.hex);b.queue=heroes.map(u=>u.id);
 const warnings=battleWarnings(b);expect(warnings.threatenedParty.size).toBe(heroes.length);
 expect([...warnings.actingDanger]).toEqual([key(active(b)!.hex)]);
 const strong=partyWarningStyle(true),quiet=partyWarningStyle(false);
 expect(strong.alpha).toBeGreaterThan(quiet.alpha);expect(strong.width).toBeGreaterThan(quiet.width);expect(strong.markerAlpha).toBeGreaterThan(quiet.markerAlpha);
 b.queue.shift();expect([...battleWarnings(b).actingDanger]).toEqual([key(heroes[1].hex)]);
 b.queue=[boss.id];expect(battleWarnings(b).actingDanger.size).toBe(0);
});
