import { DISK_B_ENCOUNTERS } from '../content/disk-b/encounters';
import { DISK_C_ENCOUNTERS } from '../content/disk-c/encounters';
import { blast, cells, distance, equal, inside, key, offset, ray, reachable, visible, type Hex } from './hex';
import { level, maxHp, type GameState, type HeroId } from './state';

export type AbilityId = 'strike' | 'burst' | 'steam' | 'mend' | 'bandage' | 'peck' | 'flare';
export interface Ability { id: AbilityId; name: string; description: string; range: number; power: number; cost: number; shape: 'single' | 'blast' | 'line'; heal?: boolean }
export const ABILITIES: Record<AbilityId, Ability> = {
  strike: { id: 'strike', name: 'Strike', description: 'Adjacent enemy. The first strike each round provokes retaliation.', range: 1, power: 11, cost: 0, shape: 'single' },
  burst: { id: 'burst', name: 'Lantern burst', description: 'Seven-hex blast. Hits allies too. 2 focus. Range 5; rocks block the aim.', range: 5, power: 12, cost: 2, shape: 'blast' },
  steam: { id: 'steam', name: 'Steam lance', description: 'Four hexes along one of six directions. Pierces units, hits allies, stops at rocks. 2 focus.', range: 4, power: 16, cost: 2, shape: 'line' },
  mend: { id: 'mend', name: 'Mend', description: 'Restore 18 HP to an ally. Range 4. 2 focus.', range: 4, power: 18, cost: 2, shape: 'single', heal: true },
  bandage: { id: 'bandage', name: 'Bandage', description: 'Restore 24 HP to an ally. Range 3. Uses one shared bandage.', range: 3, power: 24, cost: 0, shape: 'single', heal: true },
  peck: { id: 'peck', name: 'Cinder peck', description: 'Ranged attack. Rocks block the shot; adjacent enemies force melee.', range: 5, power: 7, cost: 0, shape: 'single' },
  flare: { id: 'flare', name: 'Signal flare', description: 'A seven-hex blast that punishes clustering. 2 focus.', range: 5, power: 9, cost: 2, shape: 'blast' },
};
export interface Unit {
  id: string; name: string; kind: string; side: 'party' | 'enemy'; hex: Hex;
  hp: number; maxHp: number; focus: number; speed: number; movement: number; armor: number; bonus: number;
  abilities: AbilityId[]; moved: boolean; defending: boolean; retaliated: boolean; waited: boolean;
}
export interface Battle {
  encounter: string; units: Unit[]; obstacles: Set<string>; water: Set<string>; vents:Set<string>; queue: string[]; round: number;
  log: string[]; bandages: number; result: 'victory' | 'defeat' | null;
}
export interface Encounter { id: string; name: string; flag: string; xp: number; coins: number; enemies: { kind: 'hound' | 'crow' | 'guardian' | 'inspector'; col: number; row: number; hp?:number; bonus?:number; name?:string }[]; rocks: [number, number][]; shallow?:[number,number][]; vents?:[number,number][]; terrain?:'sluice'|'cinderbank'; journal?:string; victory?:string }
export const ENCOUNTERS: Record<string, Encounter> = {
  ...DISK_B_ENCOUNTERS,
  ...DISK_C_ENCOUNTERS,
  yard: { id: 'yard', name: 'Strays in the signal yard', flag: 'yardCleared', xp: 30, coins: 25,
    enemies: [{ kind: 'hound', col: 7, row: 2 }, { kind: 'hound', col: 8, row: 3 }, { kind: 'crow', col: 9, row: 5 }], rocks: [[5, 2], [5, 4], [7, 5]] },
  scrap: { id: 'scrap', name: 'Something in the scrap', flag: 'scrapCleared', xp: 25, coins: 30,
    enemies: [{ kind: 'crow', col: 7, row: 1 }, { kind: 'hound', col: 7, row: 3 }, { kind: 'crow', col: 8, row: 5 }], rocks: [[4, 2], [5, 4], [7, 4]] },
  tunnel: { id: 'tunnel', name: 'The furnace that would not cool', flag: 'tunnelCleared', xp: 45, coins: 25,
    enemies: [{ kind: 'guardian', col: 7, row: 3 }, { kind: 'crow', col: 8, row: 1 }, { kind: 'crow', col: 9, row: 5 }], rocks: [[5, 1], [5, 5], [7, 5], [3, 3]] },
  inspector: { id: 'inspector', name: 'The last inspection', flag: 'inspectorCleared', xp: 65, coins: 40,
    enemies: [{ kind: 'inspector', col: 8, row: 3 }, { kind: 'hound', col: 7, row: 2 }, { kind: 'hound', col: 7, row: 4 }], rocks: [[5, 2], [5, 4], [8, 5]] },
};
const ENEMY_STATS = {
  hound: { name: 'Track hound', hp: 26, speed: 4, movement: 3, armor: 0, abilities: ['strike'] as AbilityId[], bonus: -3 },
  crow: { name: 'Ash crow', hp: 19, speed: 6, movement: 3, armor: 0, abilities: ['peck', 'strike'] as AbilityId[], bonus: -1 },
  guardian: { name: 'Rail guardian', hp: 68, speed: 2, movement: 2, armor: 2, abilities: ['steam', 'strike'] as AbilityId[], bonus: -6 },
  inspector: { name: 'The inspector', hp: 74, speed: 3, movement: 2, armor: 1, abilities: ['flare', 'strike'] as AbilityId[], bonus: 0 },
};

export function createBattle(encounter: string, state: GameState): Battle {
  const e = ENCOUNTERS[encounter];
  if (!e) throw new Error(`Unknown encounter: ${encounter}`);
  const units: Unit[] = state.party.map(h => ({ id: h.id, name: h.id === 'nell' ? 'Nell' : 'Orrin', kind: h.id, side: 'party',
    hex: offset(1, h.id === 'nell' ? 2 : 4), hp: Math.max(1, h.hp), maxHp: maxHp(h.id, state), focus: h.focus,
    speed: h.id === 'nell' ? 7 : 5, movement: h.id === 'nell' ? 3 : 2,
    armor: state.gear.includes('work-coats') ? 1 : 0,
    bonus: (level(state) - 1) * 2 + (h.id === 'nell' && state.gear.includes('brass-lantern') ? 3 : 0) + (h.id === 'orrin' ? 2 : 0),
    abilities: h.id === 'nell' ? ['strike', 'burst', 'mend', 'bandage'] : ['strike', 'steam', 'bandage'],
    moved: false, defending: false, retaliated: false, waited: false }));
  e.enemies.forEach((enemy, i) => {
    const stats = ENEMY_STATS[enemy.kind];
    units.push({ ...stats, id: `${enemy.kind}-${i}`, kind: enemy.kind, side: 'enemy', hex: offset(enemy.col, enemy.row),
      name:enemy.name??stats.name,bonus:enemy.bonus??stats.bonus,maxHp:enemy.hp??stats.hp,hp:enemy.hp??stats.hp,focus: 6, moved: false, defending: false, retaliated: false, waited: false });
  });
  const battle: Battle = { encounter, units, obstacles: new Set(e.rocks.map(([c, r]) => key(offset(c, r)))),
    water:new Set((encounter==='b-keeper'&&state.flags.bOrchardChannel?[]:e.shallow??[]).map(([c,r])=>key(offset(c,r)))),
    vents:new Set((encounter==='c-boiler'&&state.flags.cTrainHeat?[[3,1],[4,1],[5,1],[6,1],[7,1],[3,5],[4,5],[5,5],[6,5],[7,5]]:e.vents??[]).map(([c,r])=>key(offset(c,r)))),
    queue: [], round: 0, log: [e.name + '.'], bandages: state.bandages, result: null };
  nextRound(battle);
  return battle;
}
export const alive = (b: Battle) => b.units.filter(u => u.hp > 0);
export const active = (b: Battle) => b.units.find(u => u.id === b.queue[0]);
export const unitAt = (b: Battle, hex: Hex) => alive(b).find(u => equal(u.hex, hex));
export function movement(b: Battle, u: Unit) {
  const blocked = new Set([...b.obstacles, ...alive(b).filter(v => v.id !== u.id).map(v => key(v.hex))]);
  return reachable(u.hex, u.moved ? 0 : u.movement, blocked, h=>u.kind!=='crow'&&b.water.has(key(h))?2:1);
}
export function shape(b: Battle, u: Unit, id: AbilityId, aim: Hex): Hex[] {
  const a = ABILITIES[id];
  if (a.shape === 'blast') return blast(aim);
  if (a.shape === 'line') return ray(u.hex, aim, a.range, b.obstacles);
  return [aim];
}
export function targets(b: Battle, u: Unit, id: AbilityId, aim: Hex): Unit[] {
  const affected = new Set(shape(b, u, id, aim).map(key));
  return alive(b).filter(v => affected.has(key(v.hex)));
}
export function legalAim(b: Battle, u: Unit, id: AbilityId, aim: Hex): boolean {
  const a = ABILITIES[id];
  if (!inside(aim) || !u.abilities.includes(id) || u.focus < a.cost || b.result || active(b)?.id !== u.id) return false;
  if (id === 'bandage' && b.bandages <= 0) return false;
  if (a.shape === 'line') return !equal(u.hex, aim) && distance(u.hex, aim) <= a.range && shape(b, u, id, aim).length > 0;
  if (distance(u.hex, aim) > a.range || b.obstacles.has(key(aim)) || !visible(u.hex, aim, b.obstacles)) return false;
  const v = unitAt(b, aim);
  if (a.heal) return !!v && v.side === u.side && v.hp < v.maxHp;
  if (a.shape === 'single') {
    if (!v || v.side === u.side) return false;
    if (id === 'peck' && alive(b).some(t => t.side !== u.side && distance(t.hex, u.hex) === 1)) return false;
  }
  return true;
}
export function damage(u: Unit, v: Unit, id: AbilityId): number {
  const a = ABILITIES[id];
  if (a.heal) return Math.min(v.maxHp - v.hp, a.power);
  return Math.max(1, Math.round((a.power + u.bonus - v.armor) * (v.defending ? 0.6 : 1)));
}
function log(b: Battle, message: string) { b.log.push(message); if (b.log.length > 80) b.log.shift(); }
function beginTurn(b: Battle) {
  const u = active(b);
  if (u) { u.defending = false; u.moved = false; if (!u.waited) u.focus = Math.min(6, u.focus + 1); }
}
function nextRound(b: Battle) {
  b.round++;
  for (const u of alive(b)) { u.retaliated = false; u.waited = false; }
  b.queue = alive(b).sort((a, z) => z.speed - a.speed || a.id.localeCompare(z.id)).map(u => u.id);
  beginTurn(b);
}
function ended(b:Battle){
  const sides = new Set(alive(b).map(u => u.side));
  // If a discharge downs both sides, the party must retry rather than win unconscious.
  if (!sides.has('party')) { b.result = 'defeat'; log(b, 'The journey is not over. Try a different formation.'); return true; }
  if (!sides.has('enemy')) { b.result = 'victory'; log(b, 'The line is clear.'); return true; }
  return false;
}
function finishTurn(b: Battle) {
  if(ended(b))return;
  b.queue.shift();
  b.queue = b.queue.filter(id => b.units.some(u => u.id === id && u.hp > 0));
  if (!b.queue.length){
    for(const u of alive(b))if(u.kind!=='crow'&&b.vents.has(key(u.hex))){u.hp=Math.max(0,u.hp-6);log(b,`Steam vent hits ${u.name} for 6${u.hp?'.':' — down.'}`);}
    if(!ended(b))nextRound(b);
  }else beginTurn(b);
}
export function move(b: Battle, u: Unit, destination: Hex): Hex[] | null {
  if (active(b)?.id !== u.id || b.result || u.moved || equal(u.hex, destination)) return null;
  const visit = movement(b, u).get(key(destination));
  if (!visit) return null;
  u.hex = { ...destination }; u.moved = true;
  log(b, `${u.name} moves ${visit.path.length} hexes (${visit.cost} movement).`);
  return visit.path;
}
export function cast(b: Battle, u: Unit, id: AbilityId, aim: Hex): boolean {
  if (!legalAim(b, u, id, aim)) return false;
  const a = ABILITIES[id];
  u.focus -= a.cost;
  if (id === 'bandage') b.bandages--;
  const hit = targets(b, u, id, aim);
  for (const v of hit) {
    if (a.heal && v.side !== u.side) continue;
    const amount = damage(u, v, id);
    v.hp = Math.max(0, Math.min(v.maxHp, v.hp + (a.heal ? amount : -amount)));
    log(b, a.heal ? `${u.name} restores ${amount} HP to ${v.name}.` : `${u.name}: ${a.name} hits ${v.name} for ${amount}${v.hp ? '.' : ' — down.'}`);
  }
  if (!hit.length) log(b, `${u.name}'s ${a.name} strikes empty ground.`);
  if (id === 'strike') {
    const defender = hit[0];
    if (defender && defender.hp > 0 && !defender.retaliated && distance(u.hex, defender.hex) === 1) {
      defender.retaliated = true;
      const amount = damage(defender, u, 'strike');
      u.hp = Math.max(0, u.hp - amount);
      log(b, `${defender.name} retaliates for ${amount}.`);
    }
  }
  finishTurn(b);
  return true;
}
export function defend(b: Battle): boolean {
  const u = active(b); if (!u || b.result) return false;
  u.defending = true; u.focus = Math.min(6, u.focus + 1);
  log(b, `${u.name} defends: 40% less damage until their next turn.`); finishTurn(b); return true;
}
export function wait(b: Battle): boolean {
  const u = active(b); if (!u || u.waited || u.moved || b.result) return false;
  u.waited = true;
  b.queue.shift(); b.queue.push(u.id);
  log(b, `${u.name} waits until the end of the round.`);
  beginTurn(b); return true;
}

/** The AI evaluates every reachable firing position and the exact same AoE as the player. */
export function enemyTurn(b: Battle): AbilityId | 'defend' | undefined {
  const u = active(b); if (!u || u.side !== 'enemy' || b.result) return;
  const enemies = alive(b).filter(v => v.side !== u.side);
  let best: { pos: Hex; aim: Hex; ability: AbilityId; score: number } | null = null;
  const original = u.hex;
  for (const reach of movement(b, u).values()) {
    u.hex = reach.hex;
    for (const id of u.abilities) {
      for (const aim of cells()) {
        if (!legalAim(b, u, id, aim)) continue;
        let score = -reach.cost * 0.12-(u.kind!=='crow'&&b.vents.has(key(u.hex))?7:0);
        for (const v of targets(b, u, id, aim)) {
          score += (v.side !== u.side ? 1 : -2.5) * (Math.min(v.hp, damage(u, v, id)) + (v.hp <= damage(u, v, id) ? 8 : 0));
        }
        if (id === 'strike') {
          const victim = unitAt(b, aim);
          if (victim && !victim.retaliated && victim.hp > damage(u, victim, id)) score -= damage(victim, u, 'strike') * 0.6;
        }
        if (score > 0 && (!best || score > best.score)) best = { pos: reach.hex, aim, ability: id, score };
      }
    }
  }
  u.hex = original;
  if (best) {
    if (!equal(original, best.pos)) move(b, u, best.pos);
    cast(b, u, best.ability, best.aim);
    return best.ability;
  } else {
    const visits = [...movement(b, u).values()];
    const approach=(h:Hex)=>Math.min(...enemies.map(v=>distance(h,v.hex)))+(u.kind!=='crow'&&b.vents.has(key(h))?4:0);
    visits.sort((a, z) => approach(a.hex)-approach(z.hex)||a.cost-z.cost);
    if (visits[0] && !equal(original, visits[0].hex)) move(b, u, visits[0].hex);
    defend(b);
    return 'defend';
  }
}

export function awardVictory(b: Battle, s: GameState) {
  const e = ENCOUNTERS[b.encounter];
  if (b.result !== 'victory' || s.flags[e.flag]) return;
  const oldLevel = level(s);
  s.flags[e.flag] = true; s.xp += e.xp; s.coins += e.coins; s.bandages = b.bandages;
  for (const hero of s.party) {
    const unit = b.units.find(u => u.id === hero.id as HeroId)!;
    hero.hp = Math.min(maxHp(hero.id, s), Math.max(1, unit.hp) + 8 + (level(s) - oldLevel) * 6);
    hero.focus = 6;
  }
}
