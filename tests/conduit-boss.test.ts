import {expect,it} from 'vitest';
import {active,cast,damage,defend,legalAim,move,movement,shape,targets,unitAt} from '../src/rules/combat';
import {occupiedHexes} from '../src/rules/footprint';
import {cells,distance,inside,key,offset} from '../src/rules/hex';
import {createConduitBattle,prepareConduit,regulatorUnit,conduitTurn,REGULATOR_ID} from '../src/dev/conduit-battle';

it.each(['feeds','pressure'] as const)('%s keeps a three-contact anchored base above a Chapter Three party',route=>{
 const b=createConduitBattle(route),boss=regulatorUnit(b),body=occupiedHexes(boss),heroes=b.units.filter(u=>u.side==='party');
 expect(body).toHaveLength(3);expect(body.every(inside)).toBe(true);
 for(const a of body)for(const z of body)expect(distance(a,z)).toBeLessThanOrEqual(1);
 expect(heroes.map(u=>u.id)).toEqual(['nell','orrin','kit']);expect(heroes.every(u=>u.hex.r>Math.max(...body.map(h=>h.r)))).toBe(true);
 for(const h of body){expect(unitAt(b,h)).toBe(boss);expect(movement(b,active(b)!).has(key(h))).toBe(false);}
 expect(boss.anchored).toBe(true);expect(boss.sealed===true).toBe(route==='feeds');
});
it('earth plates release the seal permanently through normal movement',()=>{
 const b=createConduitBattle(),boss=regulatorUnit(b),[nell,orrin,kit]=b.units,plates=b.grounding!.plates;
 b.queue=[nell.id,kit.id,orrin.id,REGULATOR_ID];expect(damage(nell,boss,'burst')).toBe(0);
 expect(move(b,nell,plates[0])).not.toBeNull();expect(b.grounding!.open).toBe(false);defend(b);
 expect(move(b,kit,plates[1])).not.toBeNull();expect(b.grounding!.open).toBe(true);expect(boss.sealed).toBe(false);expect(damage(nell,boss,'burst')).toBeGreaterThan(0);
 kit.moved=false;expect(move(b,kit,offset(7,6))).not.toBeNull();prepareConduit(b);expect(boss.sealed).toBe(false);
});
it.each(['burst','steam'] as const)('%s damages overlapping contacts once',ability=>{
 const b=createConduitBattle('pressure'),boss=regulatorUnit(b),u=b.units.find(u=>u.id===(ability==='steam'?'orrin':'nell'))!;
 u.hex=offset(6,5);b.queue=[u.id,REGULATOR_ID];u.focus=6;
 const body=new Set(occupiedHexes(boss).map(key)),aim=cells().find(h=>legalAim(b,u,ability,h)&&shape(b,u,ability,h).filter(h=>body.has(key(h))).length>1)!;
 expect(aim).toBeTruthy();expect(targets(b,u,ability,aim).filter(v=>v.id===REGULATOR_ID)).toHaveLength(1);
 const hp=boss.hp,expected=damage(u,boss,ability);expect(cast(b,u,ability,aim)).toBe(true);expect(boss.hp).toBe(hp-expected);
});
it('pressure warnings stay fixed, cycle by round, and Taunt redirects the actual discharge',()=>{
 const b=createConduitBattle('pressure',undefined,undefined,['nell','petra','orrin']),boss=regulatorUnit(b),petra=b.units.find(u=>u.id==='petra')!;
 const warning=structuredClone(boss.intent!.cells);b.units[0].hex=offset(1,6);prepareConduit(b);expect(boss.intent!.cells).toEqual(warning);
 b.round=2;prepareConduit(b);expect(boss.intent!.name).toBe('Scouring jets');expect(boss.intent!.cells.every(h=>h.r>=4)).toBe(true);
 boss.tauntedBy=petra.id;prepareConduit(b);expect(boss.intent!.cells).toEqual([petra.hex]);
 b.queue=[REGULATOR_ID,petra.id];const hp=petra.hp;expect(conduitTurn(b)).toBe('judgment');expect(petra.hp).toBeLessThan(hp);expect(b.log.some(t=>t.includes('Pressure lock on Petra hits Petra'))).toBe(true);
 b.round=3;prepareConduit(b);expect(boss.intent!.name).toBe('Crossfeed purge');expect(boss.intent!.cells.every(h=>h.r===4)).toBe(true);
});
it('a solo workshop fighter can use pressure walk, while sealed intake requires two earth contacts',()=>{
 expect(()=>createConduitBattle('feeds',undefined,undefined,['nell'])).toThrow('at least two');
 expect(createConduitBattle('pressure',undefined,undefined,['nell']).units.filter(u=>u.side==='party')).toHaveLength(1);
});
