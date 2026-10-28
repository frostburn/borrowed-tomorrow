import {expect,it} from 'vitest';
import {chapterSixFinaleStart} from '../src/dev/canonical-saves';
import {active,cast,createBattle,move} from '../src/rules/combat';
import {offset,equal} from '../src/rules/hex';
import {occupiedHexes} from '../src/rules/footprint';
import {imperialCore,imperialSupports,prepareImperial} from '../src/rules/imperial-vessel';
import {imperialMountingValue} from '../src/headless/imperial-objectives';
import {decideDefensively} from '../src/headless/defensive';

function exposed(){
 const s=chapterSixFinaleStart(true);s.activeParty=['celia','nell','orrin'];
 const b=createBattle('imperial-vessel',s),[west,east]=imperialSupports(b);
 west.hp=east.hp=0;prepareImperial(b);
 const celia=b.units.find(u=>u.id==='celia')!,nell=b.units.find(u=>u.id==='nell')!,orrin=b.units.find(u=>u.id==='orrin')!;
 celia.hex=offset(3,3);nell.hex={...east.hex};orrin.hex=offset(5,4);
 b.round=4;prepareImperial(b);b.queue=['celia','orrin','nell',imperialCore(b)!.id];return {b,celia,nell,west,east};
}
it('moves onto a vacant mounting, keeps attacking from it, and prevents the next rebuild',()=>{
 const {b,celia,west,east}=exposed(),before=structuredClone(b),d=decideDefensively(b);
 expect(b).toEqual(before);expect(d.kind).toBe('move');if(d.kind!=='move')throw Error('Expected mounting move');
 expect(occupiedHexes(west).some(h=>equal(h,d.hex))).toBe(true);expect(move(b,celia,d.hex)).not.toBeNull();
 const attack=decideDefensively(b);expect(attack.kind).toBe('cast');if(attack.kind!=='cast')throw Error('Expected a real follow-up attack');
 const hp=imperialCore(b)!.hp;expect(cast(b,active(b)!,attack.ability,attack.hex)).toBe(true);expect(imperialCore(b)!.hp).toBeLessThan(hp);
 b.round=5;prepareImperial(b);expect([west.hp,east.hp]).toEqual([0,0]);expect(imperialCore(b)!.sealed).toBe(false);
});
it('does not double-book heroes or count fallen heroes as mounting holders',()=>{
 const {b,celia,west,nell}=exposed();celia.hex={...west.hex};
 const both=imperialMountingValue(b);expect(both).toBeGreaterThan(0);
 celia.hp=0;const one=imperialMountingValue(b);expect(one).toBeLessThan(both);
 b.units=b.units.filter(u=>u.side==='enemy'||u===nell);expect(imperialMountingValue(b)).toBeLessThan(both);
 nell.hp=0;expect(imperialMountingValue(b)).toBe(0);
});
it('has no mounting objective for living supports, a defeated vessel, or the Lightbearer',()=>{
 const s=chapterSixFinaleStart(true);expect(imperialMountingValue(createBattle('imperial-vessel',s))).toBe(0);
 const {b}=exposed();imperialCore(b)!.hp=0;expect(imperialMountingValue(b)).toBe(0);
 expect(imperialMountingValue(createBattle('lightbearer',chapterSixFinaleStart(false)))).toBe(0);
});
