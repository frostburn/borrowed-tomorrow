import { expect, it } from 'vitest';
import { active, awardVictory, cast, createBattle, defend, enemyTurn, legalAim, type Battle } from '../src/rules/combat';
import { equal, offset } from '../src/rules/hex';
import { coastCheckpoint } from './support/progress';
import { ownedCopies } from '../src/rules/inventory';

// Resolve a round without moving its defenders: isolate the boarding condition
// from the AI's choice of where to fight.
function holdRound(b:Battle) {
  const round=b.round;
  for(let turns=0;turns<12&&!b.result&&b.round===round;turns++)defend(b);
}

it('boards one family per clear round and ends the rescue with machines still alive',()=>{
  const state=coastCheckpoint('settlementSeen'),b=createBattle('coast-collector',state);
  holdRound(b);expect(b.evacuation?.boarded).toBe(1);expect(b.result).toBeNull();
  holdRound(b);expect(b.evacuation?.boarded).toBe(2);
  holdRound(b);expect(b.result).toBe('victory');expect(b.units.filter(u=>u.side==='enemy').every(u=>u.hp>0)).toBe(true);
  awardVictory(b,state);const xp=state.xp;awardVictory(b,state);
  expect(state.xp).toBe(xp);expect(ownedCopies(state.inventory,'work-coat')).toBe(1);
});

it('pauses boarding safely when a machine blocks the walk, and party members can defend it',()=>{
  const b=createBattle('coast-collector',coastCheckpoint('settlementSeen')),e=b.evacuation!;
  const enemy=b.units.find(u=>u.side==='enemy')!;enemy.hex={...e.route[3]};
  holdRound(b);expect(e.boarded).toBe(0);expect(b.result).toBeNull();expect(b.log.at(-1)).toContain('wait safely');
  enemy.hex=offset(8,3);b.units.find(u=>u.side==='party')!.hex={...e.route[3]};
  holdRound(b);expect(e.boarded).toBe(1);
});

it('clears the remaining boarding when all machines fall, while defeat takes precedence',()=>{
  for(const lost of [false,true]){
    const b=createBattle('coast-collector',coastCheckpoint('settlementSeen'));
    for(const u of b.units)if(u.side==='enemy'||lost)u.hp=0;
    defend(b);expect(b.result).toBe(lost?'defeat':'victory');expect(b.evacuation?.boarded).toBe(lost?0:3);
  }
});

it('collector guards advance toward the loading route rather than idling beyond attack range',()=>{
  const b=createBattle('coast-collector',coastCheckpoint('settlementSeen')),u=b.units.find(u=>u.kind==='guardian')!;
  b.queue=[u.id,...b.queue.filter(id=>id!==u.id)];u.hex=offset(9,6);
  enemyTurn(b);expect(b.evacuation!.route.some(h=>equal(h,u.hex))).toBe(true);
});

it('Petra, rather than Alban, holds the crossing and draws every party member onto her shield',()=>{
  const b=createBattle('coast-recapture',coastCheckpoint('evacuationReady')),petra=b.units.find(u=>u.appearance==='petra')!;
  expect(petra).toMatchObject({name:'Petra',kind:'knight',abilities:['strike','bash','taunt','sweep']});
  expect(b.units.some(u=>u.appearance==='alban')).toBe(false);
  b.queue=[petra.id,...b.queue.filter(id=>id!==petra.id)];
  expect(enemyTurn(b)).toBe('taunt');expect(active(b)?.side).toBe('party');
  expect(b.units.filter(u=>u.side==='party').every(u=>u.tauntedBy===petra.id)).toBe(true);
});

it('Petra can bash without damage before spending her main action on an attack',()=>{
  const b=createBattle('coast-recapture',coastCheckpoint('evacuationReady')),petra=b.units.find(u=>u.appearance==='petra')!,nell=b.units.find(u=>u.id==='nell')!;
  b.round=2;b.queue=[petra.id,...b.queue.filter(id=>id!==petra.id)];petra.hex=offset(6,3);nell.hex=offset(5,3);
  const hp=nell.hp,aim={...nell.hex},actions:unknown[]=[];
  expect(enemyTurn(b,undefined,(ability,hex)=>actions.push({ability,hex}))).toBe('bash');expect(nell.hp).toBe(hp);expect(active(b)).toBe(petra);expect(petra.bonusUsed).toBe(true);
  expect(actions).toEqual([{ability:'bash',hex:aim}]);expect(nell.hex).not.toEqual(aim);
  expect(['strike','sweep']).toContain(enemyTurn(b));expect(active(b)?.id).not.toBe(petra.id);expect(nell.hp).toBeLessThan(hp);
});

it('a taunted surrounding attack remains usable when Petra is in its affected hexes',()=>{
  const state=coastCheckpoint('evacuationReady');state.xp=370;
  const b=createBattle('coast-recapture',state),petra=b.units.find(u=>u.appearance==='petra')!,orrin=b.units.find(u=>u.id==='orrin')!;
  petra.hex=offset(5,3);orrin.hex=offset(4,3);b.queue=[petra.id,orrin.id,...b.queue.filter(id=>id!==petra.id&&id!==orrin.id)];
  expect(cast(b,petra,'taunt',petra.hex)).toBe(true);expect(legalAim(b,orrin,'repulse',orrin.hex)).toBe(true);
  petra.hex=offset(6,3);expect(legalAim(b,orrin,'repulse',orrin.hex)).toBe(false);
  petra.hex=offset(5,3);const hp=petra.hp;expect(cast(b,orrin,'repulse',orrin.hex)).toBe(true);expect(petra.hp).toBeLessThan(hp);
});
