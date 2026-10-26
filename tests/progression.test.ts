import {abilityFor} from '../src/rules/skills';
import { expect, it } from 'vitest';
import { characterProfiles, decodeCharacterSettings, defaultBuild, newCharacterSettings } from '../src/rules/characters';
import { active, cast, createBattle, damage, defend, legalAim, move, pushDestination, targets, wait } from '../src/rules/combat';
import { key, offset } from '../src/rules/hex';
import { equipmentBonuses, equipItem, newInventory, receiveItem } from '../src/rules/inventory';
import { newGame, recruitOrrin } from '../src/rules/state';

function practice() {
  const state = newGame(); recruitOrrin(state);
  const settings = newCharacterSettings();
  settings.characters.nell = defaultBuild('nell', 5); settings.characters.orrin = defaultBuild('orrin', 5);
  const b = createBattle('workshop', state, equipmentBonuses(newInventory()), characterProfiles(settings));
  const [nell, orrin, enemy] = b.units;
  b.units = [nell, orrin, enemy]; b.queue = b.units.map(u => u.id);
  b.obstacles.clear(); b.water.clear(); b.vents.clear();
  nell.hex = offset(4, 3); enemy.hex = { q: nell.hex.q + 1, r: nell.hex.r };
  orrin.hex = { q: enemy.hex.q, r: enemy.hex.r - 1 };
  enemy.hp = enemy.maxHp = 100;
  return { b, nell, orrin, enemy };
}

it('derives independent ability unlocks from level, and removes them again when lowering level', () => {
  const settings = newCharacterSettings();
  expect(characterProfiles(settings).nell.abilities).toEqual(['strike', 'burst', 'bandage']);
  settings.characters.nell = defaultBuild('nell', 5);
  expect(characterProfiles(settings).nell.abilities).toEqual(['strike', 'burst', 'bandage', 'mend', 'dazzle']);
  expect(characterProfiles(settings).orrin.abilities).toEqual(['strike', 'steam', 'bandage']);
  settings.characters.orrin = defaultBuild('orrin', 3);
  expect(characterProfiles(settings).orrin.abilities).toContain('guard');
  expect(characterProfiles(settings).orrin.abilities).not.toContain('repulse');
  settings.characters.nell = defaultBuild('nell', 1);
  expect(characterProfiles(settings).nell.abilities).not.toContain('mend');
});

it('round-trips only validated character settings and rejects invalid levels or stat values', () => {
  const settings = newCharacterSettings(); settings.characters.nell = defaultBuild('nell', 10);
  expect(decodeCharacterSettings(JSON.stringify(settings))).toEqual(settings);
  for (const patch of [{ level: 0 }, { level: 16 }, { level: 2.5 }, { attack: -1 }, { armor: null }, { speed: 0 }, { movement: 11 }, { focus: 7 }, { maxHp: 1000 }, { attack: '12' }]) {
    const invalid = structuredClone(settings); Object.assign(invalid.characters.nell, patch);
    expect(() => decodeCharacterSettings(JSON.stringify(invalid))).toThrow();
  }
  for (const text of ['null', '{}', '{', '{"version":1,"characters":{}}']) expect(() => decodeCharacterSettings(text)).toThrow();
});

it('uses edited base stats plus gear in practice without changing the campaign battle defaults', () => {
  const state = newGame(); recruitOrrin(state);
  const settings = newCharacterSettings(), inventory = newInventory();
  settings.characters.nell = { ...defaultBuild('nell',5), level: 5, maxHp: 120, attack: 20, armor: 4, speed: 12, movement: 6, focus: 2 };
  receiveItem(inventory, 'brass-reflector'); receiveItem(inventory, 'heavy-coat');
  equipItem(inventory, 'nell', 'brass-reflector'); equipItem(inventory, 'nell', 'heavy-coat');
  const b = createBattle('workshop', state, equipmentBonuses(inventory), characterProfiles(settings));
  expect(b.units[0]).toMatchObject({ hp: 120, maxHp: 120, bonus: 12, armor: 6, speed: 10, movement: 6, focus: 3, level: 5 });
  expect(active(b)?.id).toBe('nell');
  expect(abilityFor(b.units[0],'mend').shape).toBe('blast');
  const campaign = createBattle('workshop', state);
  expect(campaign.units[0]).toMatchObject({ maxHp: 42, bonus: 0, armor: 0, movement: 3 });
  expect(campaign.units[0].abilities).not.toContain('beacon'); expect(state.xp).toBe(0);
});

it('Dazzle weakens three attacks, spends focus, and cannot be reapplied until those attacks are used', () => {
  const { b, nell, enemy } = practice();
  const normal = damage(enemy, nell, 'strike');
  expect(cast(b, nell, 'dazzle', enemy.hex)).toBe(true); expect(nell.focus).toBe(4);
  b.queue = [nell.id, enemy.id, 'orrin'];
  expect(legalAim(b, nell, 'dazzle', enemy.hex)).toBe(false);
  for(let remaining=3;remaining>0;remaining--){
    b.queue = [enemy.id, nell.id, 'orrin'];
    const hp = nell.hp;
    expect(cast(b, enemy, 'strike', nell.hex)).toBe(true);
    expect(hp - nell.hp).toBe(Math.round(normal * .6)); expect(enemy.dazzledAttacks).toBe(remaining-1);
  }
  expect(damage(enemy, nell, 'strike')).toBe(normal);
  b.queue = [enemy.id, nell.id, 'orrin']; const hp = nell.hp;
  expect(cast(b, enemy, 'strike', nell.hex)).toBe(true); expect(hp - nell.hp).toBe(normal);
  expect(legalAim(b, nell, 'dazzle', enemy.hex)).toBe(true);
});

it('retaliation consumes one of Dazzle’s three attacks', () => {
  const { b, nell, orrin, enemy } = practice();
  const normal = damage(enemy, orrin, 'strike');
  cast(b, nell, 'dazzle', enemy.hex);
  const hp = orrin.hp; expect(active(b)?.id).toBe(orrin.id);
  expect(cast(b, orrin, 'strike', enemy.hex)).toBe(true);
  expect(hp - orrin.hp).toBe(Math.round(normal * .6));
  expect(enemy.dazzledAttacks).toBe(2); expect(enemy.retaliated).toBe(true);
});

it('movement, waiting, defending, healing, guard and new rounds preserve Dazzle attacks', () => {
  const { b, nell, enemy } = practice();
  cast(b, nell, 'dazzle', enemy.hex);
  b.queue = [enemy.id, nell.id, 'orrin'];
  expect(wait(b)).toBe(true); expect(enemy.dazzledAttacks).toBe(3);
  b.queue = [enemy.id, nell.id, 'orrin'];
  expect(move(b, enemy, {q: enemy.hex.q+1, r: enemy.hex.r})).not.toBeNull();
  expect(enemy.dazzledAttacks).toBe(3); expect(defend(b)).toBe(true);
  b.queue = [enemy.id, nell.id, 'orrin']; enemy.abilities = ['strike', 'mend', 'guard']; enemy.hp = 50; enemy.focus = 6;
  expect(cast(b, enemy, 'mend', enemy.hex)).toBe(true); expect(enemy.dazzledAttacks).toBe(3);
  b.queue = [enemy.id, nell.id, 'orrin'];
  expect(cast(b, enemy, 'guard', enemy.hex)).toBe(true); expect(enemy.dazzledAttacks).toBe(3);
  const round=b.round;
  while(b.round===round)defend(b);
  expect(enemy.dazzledAttacks).toBe(3);
});

it('an area attack consumes one Dazzle attack while weakening every hit', () => {
  const { b, nell, orrin, enemy } = practice();
  cast(b, nell, 'dazzle', enemy.hex);
  b.queue = [enemy.id, nell.id, orrin.id]; enemy.abilities = ['burst']; enemy.bonus = 0;
  const before = new Map(b.units.map(u=>[u.id,u.hp]));
  const hit=targets(b,enemy,'burst',enemy.hex); expect(hit).toHaveLength(3);
  expect(cast(b, enemy, 'burst', enemy.hex)).toBe(true);
  for(const u of hit)expect(before.get(u.id)!-u.hp).toBe(7);
  expect(enemy.dazzledAttacks).toBe(2);
});

it('Upgraded Mend can target an empty center, heals only allies, and clamps at maximum HP', () => {
  const { b, nell, orrin, enemy } = practice(), center = offset(5, 3);
  nell.hex = { q: center.q - 1, r: center.r }; orrin.hex = { q: center.q + 1, r: center.r }; enemy.hex = { q: center.q, r: center.r - 1 };
  nell.hp -= 20; orrin.hp -= 5; enemy.hp = 10;
  expect(targets(b, nell, 'mend', center).map(u => u.id)).toEqual(['nell', 'orrin']);
  expect(cast(b, nell, 'mend', center)).toBe(true);
  expect(nell.hp).toBe(nell.maxHp); expect(orrin.hp).toBe(orrin.maxHp); expect(enemy.hp).toBe(10);
  expect(nell.focus).toBe(3);
});

it('Safety guard absorbs real attacks, does not stack, and is consumed before HP', () => {
  const { b, nell, orrin, enemy } = practice(); b.queue = [orrin.id, enemy.id, nell.id];
  expect(cast(b, orrin, 'guard', nell.hex)).toBe(true); expect(nell.guard).toBe(16);
  b.queue = [orrin.id, enemy.id, nell.id]; expect(legalAim(b, orrin, 'guard', nell.hex)).toBe(false);
  b.queue = [enemy.id, nell.id, orrin.id]; const hp = nell.hp;
  expect(cast(b, enemy, 'strike', nell.hex)).toBe(true);
  expect(nell.hp).toBe(hp); expect(nell.guard).toBe(8);
  expect(cast(b, nell, 'strike', enemy.hex)).toBe(true);
  expect(nell.guard).toBe(0); expect(nell.hp).toBe(hp);
});

it('Rivet shot ignores two armor but still obeys line of sight and focus', () => {
  const { b, orrin, enemy } = practice(); b.queue = [orrin.id, enemy.id, 'nell']; orrin.bonus = 0; enemy.armor = 5;
  expect(damage(orrin, enemy, 'rivet')).toBe(7);
  b.obstacles.add(key(enemy.hex)); expect(legalAim(b, orrin, 'rivet', enemy.hex)).toBe(false); b.obstacles.clear();
  orrin.focus = 0; expect(cast(b, orrin, 'rivet', enemy.hex)).toBe(false);
  orrin.focus = 1; expect(cast(b, orrin, 'rivet', enemy.hex)).toBe(true); expect(enemy.hp).toBe(93); expect(orrin.focus).toBe(0);
});

it('Pressure wave excludes its caster, hits allies, and previews the same clear or blocked push it commits', () => {
  const { b, nell, orrin, enemy } = practice(); b.queue = [orrin.id, enemy.id, nell.id]; orrin.hex = offset(5, 3); orrin.bonus = 0;
  nell.hex = { q: orrin.hex.q + 1, r: orrin.hex.r }; enemy.hex = { q: orrin.hex.q - 1, r: orrin.hex.r };
  const nellStart = { ...nell.hex }, enemyEnd = { q: orrin.hex.q - 2, r: orrin.hex.r };
  b.obstacles.add(key({ q: orrin.hex.q + 2, r: orrin.hex.r }));
  expect(targets(b, orrin, 'repulse', orrin.hex).map(u => u.id)).toEqual(['nell', enemy.id]);
  expect(pushDestination(b, orrin, nell)).toBeUndefined(); expect(pushDestination(b, orrin, enemy)).toEqual(enemyEnd);
  const hp = orrin.hp, allyHp = nell.hp;
  expect(cast(b, orrin, 'repulse', orrin.hex)).toBe(true);
  expect(orrin.hp).toBe(hp); expect(nell.hp).toBe(allyHp - 8); expect(nell.hex).toEqual(nellStart); expect(enemy.hex).toEqual(enemyEnd);
});

it('pushes never enter an occupied hex or leave the board', () => {
  const { b, nell, orrin, enemy } = practice();
  orrin.hex = offset(2, 3); enemy.hex = offset(1, 3); nell.hex = offset(0, 3);
  expect(pushDestination(b, orrin, enemy)).toBeUndefined();
  orrin.hex = offset(1, 3); enemy.hex = offset(0, 3); nell.hp = 0;
  expect(pushDestination(b, orrin, enemy)).toBeUndefined();
});
