import {it,expect} from 'vitest';
import {decideDefensively,enemyForecast} from '../src/headless/defensive';
import {createBattle,cast,active,move,endTurn} from '../src/rules/combat';
import {characterProfiles,defaultBuild,newCharacterSettings} from '../src/rules/characters';
import {newGame} from '../src/rules/state';
import {offset} from '../src/rules/hex';

function arena(){
 const settings=newCharacterSettings();settings.party=['nell','petra','celia'];
 for(const id of settings.party)settings.characters[id]=defaultBuild(id,7);
 const b=createBattle('sanctuary-warden',newGame(),undefined,characterProfiles(settings),settings.party);
 const crow=b.units.find(u=>u.kind==='crow')!;b.units=b.units.filter(u=>u.side==='party'||u===crow);b.obstacles.clear();b.water.clear();
 const petra=b.units.find(u=>u.id==='petra')!,celia=b.units.find(u=>u.id==='celia')!,nell=b.units.find(u=>u.id==='nell')!,boss=b.units.find(u=>u.side==='enemy')!;
 petra.hex=offset(3,3);celia.hex=offset(6,3);nell.hex=offset(1,1);boss.hex=offset(8,3);celia.hp=12;
 b.queue=['petra',boss.id,'celia','nell'];return {b,petra,celia};
}
it('forecasts ordinary reach and Taunt without changing live state',()=>{
 const {b,petra,celia}=arena(),before=structuredClone(b),exposed=enemyForecast(b);
 expect(b).toEqual(before);expect(exposed.units.find(u=>u.id===celia.id)!.hp).toBeLessThan(celia.hp);
 expect(cast(b,petra,'taunt',petra.hex)).toBe(true);
 const protectedState=enemyForecast(b);expect(protectedState.units.find(u=>u.id==='celia')!.hp).toBe(celia.hp);
});
it('plans defensively on a private copy and commits only legal decisions',()=>{
 const {b}=arena(),before=structuredClone(b);const decision=decideDefensively(b);
 expect(b).toEqual(before);
 if(decision.kind==='move')expect(move(b,active(b)!,decision.hex)).not.toBeNull();
 else {expect(decision.kind).toBe('cast');if(decision.kind==='cast')expect(cast(b,active(b)!,decision.ability,decision.hex)).toBe(true);}
});
it('preserves a spent team helper’s movement-only restriction',()=>{
 const {b,petra,celia}=arena();celia.hp=celia.maxHp;b.queue=['celia','petra',...b.queue.filter(id=>id!=='celia'&&id!=='petra')];
 expect(cast(b,celia,'daybreak',celia.hex)).toBe(true);expect(active(b)).toBe(petra);
 const before=structuredClone(b),decision=decideDefensively(b);expect(b).toEqual(before);
 if(decision.kind==='move')expect(move(b,petra,decision.hex)).not.toBeNull();else {expect(decision.kind).toBe('end');expect(endTurn(b)).toBe(true);}
});
