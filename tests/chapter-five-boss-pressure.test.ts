import {it,expect} from 'vitest';
import {createBattle,enemyTurn,active,move,movement,defend,shape,type Battle} from '../src/rules/combat';
import {newGame} from '../src/rules/state';
import {equal,offset,key} from '../src/rules/hex';
import {prepareWard,wardUnit,wardMirrors} from '../src/rules/ward';
import {prepareFlagship,flagshipPart,FLAGSHIP_PARTS} from '../src/rules/flagship';
import {chapterFiveFinaleStart} from '../src/dev/canonical-saves';

function nearWard(){
 const s=chapterFiveFinaleStart();s.activeParty=['nell','orrin','celia'];
 const b=createBattle('wind-engine',s),heroes=b.units.filter(u=>u.side==='party');
 heroes.forEach((u,i)=>{u.hex=offset([3,6,8][i],2);});
 wardMirrors(b).forEach(u=>{u.hp=0;});b.round=4;prepareWard(b);return b;
}
function upperDeck(){
 const b=createBattle('alban-flagship',chapterFiveFinaleStart());
 b.units.filter(u=>u.side==='party').forEach((u,i)=>{u.hex=offset([3,6,7][i],[1,3,0][i]);});
 b.round=3;prepareFlagship(b);return b;
}
function dodge(b:Battle,enemy:string){
 const gun=b.units.find(u=>u.id===enemy)!,hero=b.units.find(u=>u.side==='party'&&gun.intent!.cells.some(h=>equal(h,u.hex)))!;
 expect(hero).toBeDefined();
 const held=structuredClone(b),victim=held.units.find(u=>u.id===hero.id)!;
 held.queue=[enemy,hero.id];const hp=victim.hp;
 expect(enemyTurn(held)).toMatch(/judgment|refraction/);expect(victim.hp).toBeLessThan(hp);
 b.queue=[hero.id,enemy];hero.moved=false;
 const warning=structuredClone(gun.intent!.cells),safe=[...movement(b,hero).values()].find(v=>!warning.some(h=>equal(h,v.hex)));
 expect(safe).toBeDefined();expect(move(b,hero,safe!.hex)).not.toBeNull();
 // A warning follows the announced snapshot, never the player mid-turn.
 expect(gun.intent!.cells).toEqual(warning);expect(defend(b)).toBe(true);expect(active(b)).toBe(gun);
 expect(shape(b,gun,gun.abilities[0],gun.hex)).toEqual(warning);
 const dodgedHp=hero.hp;enemyTurn(b);expect(hero.hp).toBe(dodgedHp);
}
it('the exposed ward lens threatens the old safe upper rows but can be dodged',()=>{
 const b=nearWard(),core=wardUnit(b)!;
 expect(core.sealed).toBe(false);expect(core.intent!.cells.some(h=>h.r===2)).toBe(true);dodge(b,core.id);
});
it('the ward has a mobile screen, but stopping the core ends the encounter',()=>{
 const b=nearWard(),core=wardUnit(b)!,crows=b.units.filter(u=>u.kind==='crow');
 expect(crows).toHaveLength(2);expect(crows.every(u=>!u.passive&&b.queue.includes(u.id))).toBe(true);
 core.hp=0;b.queue=[b.units[0].id];expect(defend(b)).toBe(true);
 expect(b.result).toBe('victory');expect(crows.every(u=>u.hp===0)).toBe(true);
});
it('keeps the later domain ward profile independent',()=>{
 const b=createBattle('domain-ward',newGame());wardMirrors(b).forEach(u=>{u.hp=0;});b.round++;prepareWard(b);
 expect(b.wardTracking).toBe(false);expect(wardUnit(b)!.intent!.cells.every(h=>h.r===4)).toBe(true);
 expect(b.units.filter(u=>u.kind==='crow')).toHaveLength(0);
});
for(const id of FLAGSHIP_PARTS)it(`${id} marks an upper-deck target and preserves its dodge window`,()=>{
 const b=upperDeck();if(id==='flagship-bridge'){
  for(const gun of FLAGSHIP_PARTS.slice(0,2))flagshipPart(b,gun).hp=0;
  b.round++;prepareFlagship(b);expect(flagshipPart(b,id).intent!.name).toBe('Emergency broadside');
 }
 dodge(b,id);
});
it('re-aims after a round boundary and staggers the reinforced boarders',()=>{
 const b=upperDeck(),gun=flagshipPart(b,'flagship-port'),previous=structuredClone(gun.intent!.cells);
 const heroes=b.units.filter(u=>u.side==='party');heroes.forEach((u,i)=>{u.hex=offset([1,5,9][i],6);});
 prepareFlagship(b);expect(gun.intent!.cells).toEqual(previous);
 b.round++;prepareFlagship(b);expect(gun.intent!.cells).not.toEqual(previous);
 const marines=b.units.filter(u=>u.id.startsWith('flagship-marine'));
 expect(marines).toHaveLength(2);expect(marines.every(u=>u.hp===98)).toBe(true);
 expect(new Set(marines.map(u=>u.hex.r)).size).toBe(2);
 expect(new Set(b.units.map(u=>key(u.hex))).size).toBe(b.units.length);
});
