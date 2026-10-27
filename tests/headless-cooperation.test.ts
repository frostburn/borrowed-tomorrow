import {it,expect,vi} from 'vitest';
import {createBattle,active,cast,move,endTurn,type Battle} from '../src/rules/combat';
import {characterProfiles,defaultBuild,newCharacterSettings} from '../src/rules/characters';
import {newGame} from '../src/rules/state';
import {offset} from '../src/rules/hex';
import {decideCooperatively,cooperativeForecast} from '../src/headless/cooperative';
import {decideDefensively} from '../src/headless/defensive';
import {playBattle} from '../src/headless/battle';
import {baselineAgent} from '../src/headless/campaign';
import * as tactics from '../src/headless/tactics';

// Stationary firing lanes isolate support/action economy from pathfinding.
function arena(){
 const s=newCharacterSettings();s.party=['nell','orrin','celia'];
 for(const id of s.party)s.characters[id]=defaultBuild(id,7);
 const b=createBattle('sanctuary-warden',newGame(),undefined,characterProfiles(s),s.party);
 b.obstacles.clear();b.water.clear();b.bandages=0;
 for(const u of b.units){u.movement=0;u.hp=u.maxHp;}
 return b;
}
function pressure(){
 const b=arena();b.units=b.units.filter(u=>u.side==='party'||u.kind==='guardian');
 for(const u of b.units){
  if(u.side==='enemy'){u.hp=u.maxHp=400;u.hex=offset(5,3);u.bonus=35;}
  else u.hex=offset(u.kind==='orrin'?4:3,u.kind==='celia'?4:3);
 }
 b.units.find(u=>u.id==='nell')!.hex=offset(3,2);
 b.queue=['nell','guardian-0','orrin','celia'];return b;
}
function focusLane(){
 const b=arena(),orrin=b.units.find(u=>u.id==='orrin')!,celia=b.units.find(u=>u.id==='celia')!,nell=b.units.find(u=>u.id==='nell')!;
 orrin.hex=offset(3,3);orrin.focus=0;celia.hex=offset(1,3);nell.hex=offset(1,6);
 b.units.filter(u=>u.side==='enemy').forEach((u,i)=>{u.hex=offset(5+i,3);u.hp=u.maxHp=85;});
 b.queue=['celia','orrin','nell',...b.units.filter(u=>u.side==='enemy').map(u=>u.id)];return b;
}
function commit(b:Battle){
 const d=decideCooperatively(b),u=active(b)!;
 expect(d.kind==='cast').toBe(true);
 if(d.kind==='cast')expect(cast(b,u,d.ability,d.hex)).toBe(true);
 return d;
}
it('recognizes Dazzle before repeated heavy attacks without mutating live state',()=>{
 const b=pressure(),before=structuredClone(b),d=decideCooperatively(b);
 expect(b).toEqual(before);expect(d).toMatchObject({kind:'cast',ability:'dazzle'});
 expect(decideDefensively(b)).not.toMatchObject({ability:'dazzle'});
 commit(b);expect(b.units.find(u=>u.side==='enemy')!.dazzledAttacks).toBe(3);
 const future=cooperativeForecast(b,3);
 expect(future.units.find(u=>u.side==='enemy')!.dazzledAttacks).toBeLessThan(3);
});
it('uses Rally for an actual following attack, not merely its restored-focus count',()=>{
 const b=focusLane(),before=structuredClone(b);
 expect(decideCooperatively(b)).toMatchObject({kind:'cast',ability:'rally'});expect(b).toEqual(before);
 commit(b);const orrin=active(b)!;expect(orrin.id).toBe('orrin');
 expect(orrin.focus).toBe(3); // Two restored, then the normal turn-entry tick.
 expect(cast(b,orrin,'steam',offset(4,3))).toBe(true);
 expect(b.units.filter(u=>u.side==='enemy'&&u.hp<u.maxHp)).toHaveLength(3);
 const unavailable=structuredClone(before);unavailable.units.find(u=>u.id==='celia')!.abilities=['strike','celestialbolt'];
 expect(decideCooperatively(unavailable)).not.toMatchObject({ability:'rally'});
});
it('takes the immediate kill instead of applying unnecessary control',()=>{
 const b=pressure();b.units.find(u=>u.side==='enemy')!.hp=1;
 expect(commit(b)).not.toMatchObject({ability:'dazzle'});expect(b.result).toBe('victory');
});
it('does not refresh existing Dazzle or Rally a full-focus party',()=>{
 const b=pressure();b.units.find(u=>u.side==='enemy')!.dazzledAttacks=3;
 expect(decideCooperatively(b)).not.toMatchObject({ability:'dazzle'});
 const full=focusLane();for(const u of full.units)u.focus=6;
 expect(decideCooperatively(full)).not.toMatchObject({ability:'rally'});
});
it('forecasts a spent team helper without giving them another main action',()=>{
 const b=focusLane();for(const u of b.units)u.focus=6;
 b.units.find(u=>u.id==='nell')!.abilities=[];
 // Falling stars spends Orrin's action before his turn-entry focus tick.
 expect(cast(b,active(b)!,'starline',offset(6,3))).toBe(true);
 expect(active(b)!.id).toBe('nell'); // Orrin has no movement in this fixture.
 const before=structuredClone(b),future=cooperativeForecast(b,2);expect(b).toEqual(before);
 expect(future.units.filter(u=>u.side==='enemy').map(u=>u.hp)).toEqual(before.units.filter(u=>u.side==='enemy').map(u=>u.hp));
});
it('avoids spending a partner action when a cheap solo attack ends the battle',()=>{
 const b=focusLane();b.units=b.units.filter(u=>u.side==='party'||u.kind==='guardian');
 b.queue=['celia','orrin','nell','guardian-0'];
 b.units.find(u=>u.side==='enemy')!.hp=1;
 expect(commit(b)).toMatchObject({ability:'celestialbolt'});
 expect(b.units.find(u=>u.id==='orrin')!.teamSpentRound).toBeUndefined();
});
it('evaluates the main action remaining after a bonus Shield bash',()=>{
 const s=newCharacterSettings();s.party=['petra'];s.characters.petra=defaultBuild('petra',7);
 const b=createBattle('sanctuary-warden',newGame(),undefined,characterProfiles(s),s.party);
 b.units=b.units.filter(u=>u.side==='party'||u.kind==='guardian');b.obstacles.clear();b.water.clear();
 const petra=b.units.find(u=>u.id==='petra')!,enemy=b.units.find(u=>u.side==='enemy')!;
 petra.hex=offset(3,3);enemy.hex=offset(4,3);b.queue=['petra',enemy.id];
 expect(cast(b,petra,'bash',enemy.hex)).toBe(true);expect(active(b)).toBe(petra);
 const before=structuredClone(b),future=cooperativeForecast(b,2);
 expect(b).toEqual(before);expect(future.units.find(u=>u.side==='enemy')!.hp).toBeLessThan(enemy.hp);
});
it('preserves legal movement-only decisions and a common round boundary',()=>{
 const b=focusLane(),orrin=b.units.find(u=>u.id==='orrin')!;
 for(const u of b.units)u.focus=6;orrin.movement=2;
 expect(cast(b,active(b)!,'starline',offset(6,3))).toBe(true);
 expect(active(b)).toBe(orrin);
 const d=decideCooperatively(b);
 if(d.kind==='move')expect(move(b,orrin,d.hex)).not.toBeNull();else {expect(d.kind).toBe('end');expect(endTurn(b)).toBe(true);}
 const last=focusLane();last.queue=['celia'];cast(last,active(last)!,'celestialbolt',offset(5,3));
 expect(last.round).toBe(2);const future=cooperativeForecast(last,3);
 expect(future.round).toBeLessThanOrEqual(3);
});
it('retains completed turns when a later agent decision fails',()=>{
 const b=focusLane(),recorded:Record<string,unknown>[]=[];
 const spy=vi.spyOn(tactics,'decideBattle').mockReturnValueOnce({kind:'defend'}).mockImplementationOnce(()=>{throw Error('Planning failed');});
 try{
  expect(()=>playBattle(b,baselineAgent,turn=>recorded.push(turn))).toThrow('Planning failed');
  expect(recorded).toHaveLength(1);expect(recorded[0]).toMatchObject({actor:'celia',decision:{kind:'defend'}});
 }finally{spy.mockRestore();}
});
