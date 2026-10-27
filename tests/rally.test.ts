import {it,expect} from 'vitest';
import {active,cast,createBattle,defend,endTurn,legalAim,movementOnly,shape,targets,wait,type Battle,type Encounter} from '../src/rules/combat';
import {rallyArea,rallyBonus,rallyRemaining,rallySources} from '../src/rules/rally';
import {characterProfiles,defaultBuild,newCharacterSettings} from '../src/rules/characters';
import {newGame} from '../src/rules/state';
import {blast,neighbors,offset} from '../src/rules/hex';

const encounter:Encounter={id:'rally-test',name:'Rally',music:'battle',flag:'test',xp:0,coins:0,rocks:[],enemies:[{kind:'guardian',col:8,row:3,hp:5000}]};
function arena(rank=1){
 const settings=newCharacterSettings();settings.party=['celia','orrin','kit'];
 for(const id of settings.party)settings.characters[id]=defaultBuild(id,10);
 const b=createBattle(encounter,newGame(),undefined,characterProfiles(settings),settings.party);
 const [celia,orrin,kit,enemy]=b.units;celia.skills!.rally=rank;celia.hex=offset(3,3);orrin.hex=offset(4,3);kit.hex=offset(1,5);
 orrin.focus=kit.focus=0;b.queue=[celia.id,orrin.id,kit.id,enemy.id];return {b,celia,orrin,kit,enemy};
}
function until(b:Battle,test:()=>boolean){for(let i=0;i<60&&!test();i++)expect(defend(b)).toBe(true);expect(test()).toBe(true);}

for(const rank of [1,2,3])it(`rank ${rank} previews the same moving field used at turn entry`,()=>{
 const {b,celia,orrin,kit,enemy}=arena(rank),own=celia.focus;
 expect(shape(b,celia,'rally',celia.hex)).toEqual(rank===1?neighbors(celia.hex):rank===2?blast(celia.hex):b.units.filter(u=>u.side==='party').map(u=>u.hex));
 expect(targets(b,celia,'rally',celia.hex).map(u=>u.id)).toEqual(rank===1?[orrin.id]:rank===2?[celia.id,orrin.id]:[celia.id,orrin.id,kit.id]);
 expect(cast(b,celia,'rally',celia.hex)).toBe(true);expect(celia.focus).toBe(own-3);expect(kit.focus).toBe(0);
 expect(active(b)).toBe(orrin);expect(orrin.focus).toBe(2);expect(rallyBonus(b,celia)).toBe(rank>=2?1:0);expect(rallyBonus(b,enemy)).toBe(0);
 expect(rallyRemaining(b,celia)).toBe(3);expect(celia.rally?.expiresRound).toBe(4);
});
it('rank one can prepare an empty ring, but needs another living same-side fighter',()=>{
 const {b,celia,orrin,kit}=arena();orrin.hex=offset(8,5);
 expect(targets(b,celia,'rally',celia.hex)).toEqual([]);expect(legalAim(b,celia,'rally',celia.hex)).toBe(true);
 orrin.hp=kit.hp=0;expect(legalAim(b,celia,'rally',celia.hex)).toBe(false);
 celia.skills!.rally=2;expect(legalAim(b,celia,'rally',celia.hex)).toBe(true);
});
it('eligibility follows Celia and the ally, rather than sticking to the initial recipients',()=>{
 const {b,celia,orrin,kit}=arena();cast(b,celia,'rally',celia.hex);expect(rallyBonus(b,orrin)).toBe(1);
 celia.hex=offset(2,5);expect(rallyBonus(b,orrin)).toBe(0);expect(rallyBonus(b,kit)).toBe(1);
 kit.hex=offset(7,6);expect(rallyBonus(b,kit)).toBe(0);
 expect(rallyArea(b,celia,1)).toEqual(neighbors(celia.hex));
});
it('refreshes a partly elapsed field without stacking or granting immediate focus',()=>{
 const {b,celia,orrin}=arena(3);cast(b,celia,'rally',celia.hex);
 until(b,()=>b.round===2&&active(b)===celia);expect(rallyRemaining(b,celia)).toBe(2);
 b.queue=[celia.id,b.units.at(-1)!.id,orrin.id];const hp=celia.hp,focus=celia.focus,other=orrin.focus;
 expect(cast(b,celia,'rally',celia.hex)).toBe(true);expect(celia.hp).toBe(hp);expect(celia.focus).toBe(focus-3);expect(orrin.focus).toBe(other);
 expect(rallyRemaining(b,celia)).toBe(3);expect(rallyBonus(b,orrin)).toBe(1);
 b.queue=[celia.id,orrin.id];celia.focus=6;expect(legalAim(b,celia,'rally',celia.hex)).toBe(false);
});
it('expires at the round boundary even if Celia waits or spends no further actions',()=>{
 const {b,celia}=arena(3);cast(b,celia,'rally',celia.hex);
 until(b,()=>b.round===3);expect(rallyRemaining(b,celia)).toBe(1);
 until(b,()=>b.round===4);expect(celia.rally).toBeUndefined();expect(rallySources(b)).toEqual([]);
});
it('Wait does not grant a second tick when the same main turn resumes',()=>{
 const {b,celia,orrin}=arena(3);cast(b,celia,'rally',celia.hex);expect(orrin.focus).toBe(2);
 expect(wait(b)).toBe(true);until(b,()=>active(b)===orrin);expect(b.round).toBe(1);expect(orrin.focus).toBe(2);
});
it('a spent team helper receives no normal or bonus focus, and cannot prolong the aura',()=>{
 const {b,celia,orrin,kit,enemy}=arena(3);cast(b,celia,'rally',celia.hex);
 b.queue=[orrin.id,celia.id,kit.id,enemy.id];orrin.focus=6;expect(celia.focus).toBe(3);
 expect(cast(b,orrin,'starline',enemy.hex)).toBe(true);expect(active(b)).toBe(celia);expect(movementOnly(b,celia)).toBe(true);expect(celia.focus).toBe(0);
 expect(endTurn(b)).toBe(true);expect(celia.focus).toBe(0);
 until(b,()=>b.round===4);expect(celia.rally).toBeUndefined();
});
it('stops immediately on Celia’s fall and does not return when she is revived',()=>{
 const {b,celia,orrin}=arena(3);cast(b,celia,'rally',celia.hex);celia.hp=0;
 expect(rallyBonus(b,orrin)).toBe(0);expect(defend(b)).toBe(true);expect(celia.rally).toBeUndefined();
 celia.hp=10;expect(rallyBonus(b,orrin)).toBe(0);
});
it('caps focus at six and never stacks several overlapping fields',()=>{
 const {b,celia,orrin}=arena(3);orrin.focus=5;cast(b,celia,'rally',celia.hex);expect(orrin.focus).toBe(6);
 orrin.rally={rank:3,expiresRound:4};expect(rallyBonus(b,celia)).toBe(1);expect(rallyBonus(b,orrin)).toBe(1);
});
it('does not persist a field outside its battle or share it with cloned forecasts',()=>{
 const {b,celia}=arena(3);cast(b,celia,'rally',celia.hex);const clone=structuredClone(b);clone.units[0].rally!.expiresRound=2;
 expect(celia.rally?.expiresRound).toBe(4);expect(arena(3).celia.rally).toBeUndefined();b.result='victory';expect(rallySources(b)).toEqual([]);
});
