import { describe, expect, it } from 'vitest';
import { active, awardVictory, cast, createBattle, damage, legalAim, movementOnly } from '../src/rules/combat';
import { ITEMS, equipItem, receiveItem, unequipItem, type ItemId } from '../src/rules/inventory';
import { CONSUMABLES, isConsumable } from '../src/rules/consumables';
import { buySupply, canBuy, sellEquipment, sellPrice, shopStock } from '../src/rules/supplies';
import { decodeSave } from '../src/rules/save';
import { newGame, restoreParty } from '../src/rules/state';
import { offset } from '../src/rules/hex';
import { checkpoint, coastCheckpoint, palaceCheckpoint, brokenCheckpoint } from './support/progress';
import { interactChapterTwo } from '../src/content/chapter-two/interactions';
import type { StoryHost } from '../src/content/story-host';
import type { Dialogue } from '../src/content/dialogue';

describe('early shops and gear sales', () => {
  it('offers starter supplies at Larkspur and upgraded stock before the first coast battle', () => {
    const s = newGame(); s.coins = 300;
    expect(buySupply(s, 'focus-tonic')).toBe(false);
    expect(buySupply(s, 'field-bandage')).toBe(false);
    expect(buySupply(s, 'coastal-reflector', 'coast')).toBe(false);
    const coast = coastCheckpoint('kitJoined');
    expect(buySupply(coast, 'coastal-reflector', 'coast')).toBe(true);
    expect(coast.inventory.characters.nell.fitting).toBeNull();
    expect(coast.inventory.bag['coastal-reflector']).toBe(1);
    expect(buySupply(coast, 'field-bandage', 'coast')).toBe(false);
    expect(buySupply(coast, 'focus-tonic', 'coast')).toBe(false);
    expect(decodeSave(JSON.stringify(coast))).toEqual(coast);
  });
  it('hides future companions from purchases, allows coats for each wearer and rejects unavailable stock', () => {
    const s = coastCheckpoint('coastSeen'); s.coins = 200;
    const before = structuredClone(s);
    expect(canBuy(s, 'steady-stock', 'coast')).toBe(false);
    expect(buySupply(s, 'steady-stock', 'coast')).toBe(false);
    expect(buySupply(s, 'palace-focus', 'coast')).toBe(false);
    expect(s).toEqual(before);
    for (let i = 0; i < 3; i++) expect(buySupply(s, 'travel-coat', 'coast')).toBe(true);
    expect(s.inventory.bag['travel-coat']).toBe(3);
  });
  it('rejects unaffordable or full purchases atomically', () => {
    const s = brokenCheckpoint('refugeSeen'); s.coins = 17;
    let before = structuredClone(s); expect(buySupply(s, 'field-bandage', 'field')).toBe(false); expect(s).toEqual(before);
    s.coins = 100; s.inventory.bag['field-bandage'] = 99; s.inventory.bag['focus-tonic'] = 99;
    before = structuredClone(s);
    expect(buySupply(s, 'field-bandage', 'field')).toBe(false); expect(buySupply(s, 'focus-tonic', 'field')).toBe(false); expect(s).toEqual(before);
  });
  it('sells exactly one spare, preserves worn copies, and permits buying a sold fitting again', () => {
    const s = checkpoint('orrinJoined'); s.coins = 100;
    expect(buySupply(s, 'brass-reflector')).toBe(true); equipItem(s.inventory, 'nell', 'brass-reflector');
    let before = structuredClone(s); expect(sellEquipment(s, 'brass-reflector')).toBe(false); expect(s).toEqual(before);
    receiveItem(s.inventory, 'brass-reflector');
    expect(sellEquipment(s, 'brass-reflector')).toBe(true); expect(s.coins).toBe(85);
    expect(s.inventory.characters.nell.fitting).toBe('brass-reflector'); expect(canBuy(s, 'brass-reflector')).toBe(false);
    unequipItem(s.inventory, 'nell', 'fitting'); expect(sellEquipment(s, 'brass-reflector')).toBe(true);
    expect(s.coins).toBe(100); expect(buySupply(s, 'brass-reflector')).toBe(true); expect(s.coins).toBe(70);
    before = structuredClone(s); expect(sellEquipment(s, 'work-coat')).toBe(false); expect(s).toEqual(before);
    expect(decodeSave(JSON.stringify(s))).toEqual(s);
  });
  it('cannot sell medicine, unknown objects or past the saved currency ceiling', () => {
    const s = coastCheckpoint('wardSeen'); s.inventory.bag['field-bandage'] = 2; receiveItem(s.inventory, 'work-coat');
    for (const id of ['field-bandage', 'crystal-shard', '__proto__']) {
      const before = structuredClone(s); expect(sellEquipment(s, id as ItemId)).toBe(false); expect(s).toEqual(before);
    }
    s.coins = 1e7; const before = structuredClone(s); expect(sellEquipment(s, 'work-coat')).toBe(false); expect(s).toEqual(before);
  });
  it('never creates money by buying and reselling or paying a battle twice', () => {
    for (const shop of ['station', 'coast', 'ward'] as const) for (const supply of shopStock(shop)) if (!isConsumable(supply.id)) expect(sellPrice(supply.id)).toBeLessThan(supply.cost);
    const s = coastCheckpoint('raidConfronted'), b = createBattle('coast-loading', s); b.result = 'victory';
    awardVictory(b, s); const before = structuredClone(s); awardVictory(b, s); expect(s).toEqual(before);
  });
  it('funds useful choices from actual Chapter One and Two rewards without farming', () => {
    // Main path, no shed reward: 18 starting + 84 Chapter One + 124 Chapter Two.
    const s = checkpoint('orrinJoined'); expect(s.coins).toBe(36);
    expect(buySupply(s, 'lance-nozzle')).toBe(true); expect(s.coins).toBe(6);
    for (const id of ['collector', 'captain']) { const b = createBattle(id, s); b.result = 'victory'; awardVictory(b, s); }
    expect(s.coins).toBe(72);
    const coast = coastCheckpoint('kitJoined'); coast.coins = s.coins;
    expect(buySupply(coast, 'coastal-reflector', 'coast')).toBe(true); expect(coast.coins).toBe(26);
    for (const id of ['coast-loading', 'coast-collector']) { const b = createBattle(id, coast); b.result = 'victory'; awardVictory(b, coast); }
    expect(coast.coins).toBe(100);
    expect(buySupply(coast, 'sealed-nozzle', 'ward')).toBe(true);
    expect(buySupply(coast, 'bandage', 'ward')).toBe(true); expect(buySupply(coast, 'bandage', 'ward')).toBe(true);
    expect(coast.coins).toBe(38);
    expect(ITEMS['silver-reflector'].bonuses.armor).toBeGreaterThan(ITEMS['coastal-reflector'].bonuses.armor);
    expect(ITEMS['baffled-nozzle'].bonuses.speed).toBeGreaterThan(ITEMS['sealed-nozzle'].bonuses.speed);
    expect(ITEMS['ratchet-sight'].bonuses.speed).toBeGreaterThan(ITEMS['steady-stock'].bonuses.speed);
  });
  it('opens the full coastal counter, ward counter and pre-Petra supplies through existing interactions', () => {
    const s = coastCheckpoint('evacuationReady'); let d: Dialogue | undefined; const opened: string[] = [];
    const h = { state: s, talk: (dialogue: Dialogue) => { d = dialogue; }, shop: (id: string) => opened.push(id) } as unknown as StoryHost;
    for (const [interaction, shop] of [['coast-engine', 'coast'], ['ward-rest', 'ward'], ['siding-coaches', 'ward']]) {
      interactChapterTwo(h, interaction); d!.choices!.find(c => c.label === 'Browse supplies and trade gear')!.action(); expect(opened.at(-1)).toBe(shop);
    }
  });
});

it('introduces stronger medicine at Chapter Four medical counters, not early shops', () => {
  const early=coastCheckpoint('wardSeen'); early.coins=300;
  for(const shop of ['station','coast','ward','field'] as const) for(const id of ['field-bandage','focus-tonic'] as const) expect(buySupply(early,id,shop)).toBe(false);
  const later=brokenCheckpoint('refugeSeen'); later.coins=100;
  expect(buySupply(later,'field-bandage','field')).toBe(true); expect(buySupply(later,'focus-tonic','field')).toBe(true);
  expect(later.coins).toBe(68); expect(decodeSave(JSON.stringify(later))).toEqual(later);
});

describe('shared medical supplies', () => {
  const prepared = () => {
    const s = coastCheckpoint('raidConfronted'); s.inventory.bag['field-bandage'] = 2; s.inventory.bag['focus-tonic'] = 2;
    const b = createBattle('coast-loading', s), u = active(b)!;
    return { s, b, u };
  };
  it('heals 48 HP without level or equipment scaling and spends one item and main action', () => {
    const { s, b, u } = prepared(); u.maxHp = 100; u.hp = 8; u.level = 15; u.bonus = 99;
    expect(damage(u, u, 'field-bandage')).toBe(48); expect(cast(b, u, 'field-bandage', u.hex)).toBe(true);
    expect(u.hp).toBe(56); expect(b.supplies['field-bandage']).toBe(1); expect(b.queue).not.toContain(u.id);
    expect(s.inventory.bag['field-bandage']).toBe(2); expect(b.bandages).toBe(s.bandages);
  });
  it('caps healing and focus at the actual missing amount', () => {
    const { b, u } = prepared(); u.hp = u.maxHp - 2;
    expect(damage(u, u, 'field-bandage')).toBe(2); expect(cast(b, u, 'field-bandage', u.hex)).toBe(true); expect(u.hp).toBe(u.maxHp);
    const second = prepared(); second.u.focus = 5;
    expect(damage(second.u, second.u, 'focus-tonic')).toBe(1); expect(cast(second.b, second.u, 'focus-tonic', second.u.hex)).toBe(true); expect(second.u.focus).toBe(6);
  });
  it('lets a tonic restore the user at zero focus, without a skill or gear bonus', () => {
    const { b, u } = prepared(); u.focus = 0; u.bonus = 90; u.level = 15;
    expect(cast(b, u, 'focus-tonic', u.hex)).toBe(true); expect(u.focus).toBe(3);
    expect(b.supplies['focus-tonic']).toBe(1); expect(b.queue).not.toContain(u.id);
  });
  it('allows one ally to use the common stock on another', () => {
    const { b, u } = prepared(); const ally = b.units.find(v => v.id === 'orrin')!; ally.hex = offset(2, 2); ally.focus = 1;
    expect(cast(b, u, 'focus-tonic', ally.hex)).toBe(true); expect(ally.focus).toBe(4); expect(b.supplies['focus-tonic']).toBe(1);
  });
  it('rejects full, fallen, opposing, blocked and distant targets without spending items or actions', () => {
    const { b, u } = prepared(), enemy = b.units.find(v => v.side === 'enemy')!;
    for (const [id, aim] of [['field-bandage', u.hex], ['focus-tonic', u.hex], ['field-bandage', enemy.hex], ['field-bandage', offset(10, 6)]] as const) {
      const before = structuredClone(b); expect(cast(b, u, id, aim)).toBe(false); expect(b).toEqual(before);
    }
    const ally = b.units.find(v => v.side === 'party' && v.id !== u.id)!; ally.hp = 0; ally.hex = offset(2, 2);
    expect(legalAim(b, u, 'field-bandage', ally.hex)).toBe(false);
    ally.hp = 1; b.obstacles.add(`${ally.hex.q},${ally.hex.r}`); expect(legalAim(b, u, 'field-bandage', ally.hex)).toBe(false);
  });
  it('rejects an exhausted stack and movement-only helper actions', () => {
    const { b, u } = prepared(); u.hp = 1; b.supplies['field-bandage'] = 0;
    expect(cast(b, u, 'field-bandage', u.hex)).toBe(false);
    b.supplies['field-bandage'] = 1; u.teamSpentRound = b.round; expect(movementOnly(b, u)).toBe(true);
    expect(cast(b, u, 'field-bandage', u.hex)).toBe(false); expect(b.supplies['field-bandage']).toBe(1);
  });
  it('commits the remaining bag stock only on victory; retry starts with the original stock', () => {
    const { s, b, u } = prepared(); u.focus = 0; cast(b, u, 'focus-tonic', u.hex);
    expect(createBattle('coast-loading', s).supplies['focus-tonic']).toBe(2);
    b.result = 'defeat'; awardVictory(b, s); expect(s.inventory.bag['focus-tonic']).toBe(2);
    b.result = 'victory'; awardVictory(b, s); expect(s.inventory.bag['focus-tonic']).toBe(1);
    expect(decodeSave(JSON.stringify(s))).toEqual(s); expect(createBattle('coast-collector', s).supplies['focus-tonic']).toBe(1);
  });
  it('does not replenish consumables through rest', () => {
    const { s } = prepared(); const before = structuredClone(s.inventory); restoreParty(s); expect(s.inventory).toEqual(before);
  });
  it('validates saved stacks and never accepts medical supplies as worn equipment', () => {
    const { s } = prepared(); expect(decodeSave(JSON.stringify(s))).toEqual(s);
    for (const value of [-1, .5, 100, '2']) {
      const bad = structuredClone(s) as any; bad.inventory.bag['field-bandage'] = value; expect(() => decodeSave(JSON.stringify(bad))).toThrow();
    }
    const bad = structuredClone(s) as any; bad.inventory.characters.nell.fitting = 'field-bandage'; expect(() => decodeSave(JSON.stringify(bad))).toThrow();
    expect(Object.keys(CONSUMABLES)).toHaveLength(3);
  });
});

 it('sells midgame protection without leaking stronger medicine or unrecruited fittings',()=>{
  const early=coastCheckpoint('chapterTwoComplete');early.coins=500;
  expect(buySupply(early,'insulated-coat','conduit')).toBe(false);
  const s=palaceCheckpoint('capitalSeen');s.coins=500;
  expect(buySupply(s,'insulated-coat','conduit')).toBe(true);expect(s.coins).toBe(452);
  expect(s.inventory.bag['insulated-coat']).toBe(1);expect(s.inventory.characters.nell.coat).not.toBe('insulated-coat');
  expect(buySupply(s,'saber-hilt','conduit')).toBe(false);expect(buySupply(s,'field-bandage','conduit')).toBe(false);
  const later=brokenCheckpoint('worksArrival');later.coins=500;
  expect(buySupply(later,'medic-clasp','field')).toBe(true);expect(buySupply(later,'insulated-coat','field')).toBe(true);
  expect(decodeSave(JSON.stringify(later))).toEqual(later);
  for(const shop of ['conduit','field']as const)for(const supply of shopStock(shop))if(!isConsumable(supply.id))expect(sellPrice(supply.id)).toBeLessThan(supply.cost);
 });
