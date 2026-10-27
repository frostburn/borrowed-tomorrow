import {it,expect} from 'vitest';
import {cast,createBattle,damage,targets} from '../src/rules/combat';
import {abilityFor} from '../src/rules/skills';
import {characterProfiles,defaultBuild,newCharacterSettings} from '../src/rules/characters';
import {newGame} from '../src/rules/state';
import {supportPower} from '../src/rules/combat-tactics';
import {chapterFiveFinaleStart,chapterSevenRefugeStart} from '../src/dev/canonical-saves';
import {decodeSave} from '../src/rules/save';
import {offset} from '../src/rules/hex';

function unit(hero:'nell'|'orrin'|'kit'|'petra'|'celia',level:number){
 const settings=newCharacterSettings();settings.characters[hero]=defaultBuild(hero,level);
 const b=createBattle('pursuit',newGame(),undefined,characterProfiles(settings),[hero]);
 const target=b.units.find(u=>u.side==='enemy')!;target.armor=2;
 return {u:b.units[0],target};
}
for(const [level,rank,ray,burst]of [[7,1,32,27],[10,2,44,33],[13,3,57,39]])it(`Horizon light has a paid narrow-damage role at level ${level}`,()=>{
 const {u,target}=unit('nell',level);u.skills!.sunline=rank;u.skills!.burst=3;
 expect(damage(u,target,'sunline')).toBe(ray);expect(damage(u,target,'burst')).toBe(burst);
 expect(abilityFor(u,'sunline').cost).toBe(3);expect(abilityFor(u,'sunline').description).toContain('3 focus');
});
it('Pressure wave exchanges Steam’s single-contact damage for surrounding push at the same cost',()=>{
 const {u,target}=unit('orrin',5);u.skills!.repulse=1;u.skills!.steam=2;
 expect(damage(u,target,'repulse')).toBe(18);expect(damage(u,target,'steam')).toBe(29);
 expect(abilityFor(u,'repulse').cost).toBe(2);expect(abilityFor(u,'repulse').effect).toBe('push');
});
it('Pinning shot pays a small damage premium for control early and outgrows free Quick shot later',()=>{
 const early=unit('kit',7);early.u.skills!.pin=1;early.u.skills!.quickshot=2;
 expect(damage(early.u,early.target,'pin')).toBe(20);expect(damage(early.u,early.target,'quickshot')).toBe(23);
 const late=unit('kit',13);late.u.skills!.pin=late.u.skills!.quickshot=3;
 expect(damage(late.u,late.target,'pin')).toBe(45);expect(damage(late.u,late.target,'quickshot')).toBe(40);
 const feint=abilityFor(late.u,'feint');expect(feint.cost).toBe(1);expect(feint.range).toBe(6);
});
it('Taunt’s party shield costs more and protects less than Celia’s dedicated ward at level ten',()=>{
 const {u:petra}=unit('petra',10),{u:celia}=unit('celia',10);petra.skills!.taunt=3;celia.skills!.sanctuary=2;
 const taunt=abilityFor(petra,'taunt'),ward=taunt.ward!.power+Math.floor((petra.level!-1)*1.5);
 expect(ward).toBe(23);expect(taunt.cost).toBe(4);expect(supportPower(celia,'sanctuary')).toBe(37);expect(abilityFor(celia,'sanctuary').cost).toBe(3);
});
for(const [level,rank,barrier,cost]of [[9,2,36,3],[12,3,48,4]]as const)it(`Sanctuary ${rank} at level ${level} previews and applies its stronger protection without stacking`,()=>{
 const settings=newCharacterSettings(),party=['celia','orrin','kit']as const;
 for(const id of party)settings.characters[id]=defaultBuild(id,level);
 const b=createBattle('pursuit',newGame(),undefined,characterProfiles(settings),[...party]);
 const [celia,orrin,kit]=b.units;celia.skills!.sanctuary=rank;celia.hex=offset(2,3);orrin.hex=offset(3,3);kit.hex=offset(9,6);
 b.queue=[celia.id,...b.queue.filter(id=>id!==celia.id)];orrin.guard=10;celia.guard=60;
 const aim=rank===2?orrin.hex:celia.hex;
 expect(targets(b,celia,'sanctuary',aim).map(u=>u.id)).toEqual(rank===2?['celia','orrin']:[...party]);
 expect(damage(celia,orrin,'sanctuary')).toBe(barrier-10);expect(damage(celia,celia,'sanctuary')).toBe(0);
 celia.bonus=999;expect(supportPower(celia,'sanctuary')).toBe(barrier);
 const before=celia.focus;expect(cast(b,celia,'sanctuary',aim)).toBe(true);
 expect(celia.focus).toBe(before-cost);expect(celia.guard).toBe(60);expect(orrin.guard).toBe(barrier);expect(kit.guard??0).toBe(rank===3?barrier:0);
 const {u:mechanic}=unit('orrin',level);mechanic.skills!.guard=rank;
 expect(supportPower(mechanic,'guard')).toBe(rank===2?28:41);expect(barrier).toBeGreaterThan(supportPower(mechanic,'guard'));
});
it('keeps current campaign skill ranks and requirements valid without a save migration',()=>{
 for(const make of [chapterFiveFinaleStart,chapterSevenRefugeStart]){const s=make();expect(decodeSave(JSON.stringify(s))).toEqual(s);}
});
