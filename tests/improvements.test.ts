import {expect,it} from 'vitest';
import {chapterFiveFinaleStart,chapterSixCapitalStart,chapterSixStart} from '../src/dev/canonical-saves';
import {jungleCheckpoint} from './support/jungle';
import {IMPROVEMENTS,buyImprovement,improvementFlag,maxFocus,improvementProblem} from '../src/rules/improvements';
import {maxHp,newGame,restoreParty,type GameState} from '../src/rules/state';
import {decodeSave} from '../src/rules/save';
import {active,awardVictory,cast,createBattle,createPartyUnit,defend,legalAim,movement,type Encounter} from '../src/rules/combat';
import {offset,key} from '../src/rules/hex';
import {abilityFor,presetSkills} from '../src/rules/skills';
import {defaultBuild,characterProfiles,newCharacterSettings} from '../src/rules/characters';
import {completeRiverTreatment} from '../src/content/chapter-six/jungle/recovery';
import {offerImprovements} from '../src/content/improvements';
import {interactChapterFive} from '../src/content/chapter-five/interactions';
import {interactChapterSix} from '../src/content/chapter-six/interactions';
import type {Dialogue} from '../src/content/dialogue';
import type {StoryHost} from '../src/content/story-host';

const arena:Encounter={id:'improvement-test',name:'Training test',music:'battle',flag:'test',xp:0,coins:0,rocks:[],enemies:[{kind:'guardian',col:8,row:3,hp:5000}]};
function ready(){const s=chapterFiveFinaleStart();s.coins=5000;return s;}
function purchase(s:GameState,id:string){expect(buyImprovement(s,id)).toBe(true);return s;}
function host(s:GameState){
 let d:Dialogue|undefined,saves=0;
 const h={state:s,talk:(v:Dialogue)=>{d=v;},refresh(){},save(){saves++;decodeSave(JSON.stringify(s));},toast(){}}as unknown as StoryHost;
 const choose=(label:string)=>{const c=d?.choices?.find(c=>c.label===label);expect(c,`choice ${label}`).toBeDefined();expect(c!.disabled).toBeFalsy();d=undefined;c!.action();};
 return {h,choose,read:()=>d!,saves:()=>saves};
}

it('requires recruitment, the real quest milestone, its local service and enough marks; charges once',()=>{
 const early=newGame(),before=structuredClone(early);expect(buyImprovement(early,'hp-nell')).toBe(false);expect(early).toEqual(before);
 const s=ready();s.location.map='hammerplain';s.flags.hammerplainComplete=false;
 expect(buyImprovement(s,'orrin-counterbalance')).toBe(false);s.flags.hammerplainComplete=true;s.coins=499;
 expect(improvementProblem(s,IMPROVEMENTS.find(i=>i.id==='orrin-counterbalance')!)).toBe('Need 1 more mark');
 expect(buyImprovement(s,'orrin-counterbalance')).toBe(false);s.coins=500;purchase(s,'orrin-counterbalance');
 expect(s.coins).toBe(0);expect(buyImprovement(s,'orrin-counterbalance')).toBe(false);
 expect(decodeSave(JSON.stringify(s))).toEqual(s);
 const unseen=ready();unseen.party=unseen.party.filter(h=>h.id!=='kit');expect(buyImprovement(unseen,'hp-kit')).toBe(false);
});
it('confirms exact prices, cancels freely, shows completed purchases and keeps future recruits hidden',()=>{
 const s=ready(),j=host(s),coins=s.coins,hp=s.party.find(p=>p.id==='orrin')!.hp;
 offerImprovements(j.h,'training');j.choose('Train Orrin');expect(j.read().lines.map(l=>l.text).join(' ')).toContain('Max focus 6 → 7');
 j.choose('Endurance training · 300 marks');expect(j.read().lines[0].text).toContain(`${coins} → ${coins-300}`);expect(s.coins).toBe(coins);
 j.choose('Cancel improvement');expect(s.coins).toBe(coins);
 j.choose('Endurance training · 300 marks');j.choose('Confirm · 300 marks');
 expect(j.saves()).toBe(1);expect(s.coins).toBe(coins-300);expect(s.party.find(p=>p.id==='orrin')!.hp).toBe(hp);
 expect(j.read().choices?.find(c=>c.label==='Endurance training · Completed')?.disabled).toBe(true);
 s.party=s.party.filter(p=>p.id!=='kit');offerImprovements(j.h,'training');expect(j.read().choices?.some(c=>c.label.includes('Kit'))).toBe(false);
});
it('persists max HP/focus across save, formation and equipment, without changing skill ranks or healing on purchase',()=>{
 const s=ready(),hp=maxHp('celia',s),skills=structuredClone(s.skills),gear=structuredClone(s.inventory);
 const celia=s.party.find(p=>p.id==='celia')!;celia.hp=2;celia.focus=0;
 purchase(s,'hp-celia');purchase(s,'focus-celia');expect(celia).toMatchObject({hp:2,focus:0});
 expect(s.skills).toEqual(skills);expect(s.inventory).toEqual(gear);s.activeParty=['nell','orrin','kit'];
 restoreParty(s);expect(celia).toMatchObject({hp:hp+12,focus:7});
 const loaded=decodeSave(JSON.stringify(s));expect(createPartyUnit(loaded,'celia')).toMatchObject({maxHp:hp+12,focus:7,maxFocus:7});
 expect(createPartyUnit(loaded,'celia',0,1,undefined,characterProfiles(newCharacterSettings()).celia)).toMatchObject({maxHp:defaultBuild('celia').maxHp,focus:6});
 const bad=structuredClone(s);bad.flags['improved-unknown']=true;expect(()=>decodeSave(JSON.stringify(bad))).toThrow('Invalid permanent improvement');
 bad.flags['improved-unknown']=false;bad.flags.airshipOwned=false;expect(()=>decodeSave(JSON.stringify(bad))).toThrow();
});
it('uses the increased focus cap for tonic targeting, Defend, turn regeneration, rest and victory',()=>{
 const s=ready();purchase(s,'focus-nell');s.inventory.bag['focus-tonic']=1;restoreParty(s);
 const b=createBattle(arena,s),nell=b.units.find(u=>u.id==='nell')!,enemy=b.units.at(-1)!;
 b.queue=[nell.id,enemy.id];nell.focus=6;expect(legalAim(b,nell,'focus-tonic',nell.hex)).toBe(true);
 expect(cast(b,nell,'focus-tonic',nell.hex)).toBe(true);expect(nell.focus).toBe(7);
 b.queue=[nell.id,enemy.id];nell.focus=6;defend(b);expect(nell.focus).toBe(7);
 b.queue=[enemy.id,nell.id];nell.focus=6;defend(b);expect(active(b)).toBe(nell);expect(nell.focus).toBe(7);
 expect(legalAim(b,nell,'focus-tonic',nell.hex)).toBe(false);
 const real=createBattle('airfield-guard',s);delete s.flags.airfieldGuardWon;real.result='victory';awardVictory(real,s);expect(s.party[0].focus).toBe(7);
});
it('ordinary training/rest never cures Nell; treatment restores previously trained capacity',()=>{
 const s=ready();purchase(s,'hp-nell');purchase(s,'focus-nell');
 const ill=chapterSixStart();ill.flags[improvementFlag('hp-nell')]=true;ill.flags[improvementFlag('focus-nell')]=true;
 const before=structuredClone(ill.party[0]);ill.coins=10000;expect(buyImprovement(ill,'nell-housing')).toBe(false);restoreParty(ill);expect(ill.party[0]).toEqual(before);expect(maxFocus(ill,'nell')).toBe(7);
 const treated=jungleCheckpoint('rainhouseWon');treated.flags[improvementFlag('hp-nell')]=true;treated.flags[improvementFlag('focus-nell')]=true;
 expect(completeRiverTreatment(treated)).toBe(true);expect(treated.party[0]).toMatchObject({hp:maxHp('nell',treated),focus:7});expect(decodeSave(JSON.stringify(treated))).toEqual(treated);
});
it('Orrin gains one real movement, including in battle previews',()=>{
 const s=ready();s.location.map='hammerplain';const before=createPartyUnit(s,'orrin').movement;purchase(s,'orrin-counterbalance');
 const b=createBattle(arena,s),orrin=b.units.find(u=>u.id==='orrin')!;expect(orrin.movement).toBe(before+1);expect(movement(b,orrin).get(key(offset(4,3)))?.cost).toBe(3);
});
it('Shield bash keeps its bonus-action limit, deals no damage and grants non-stacking Guard only to trained Petra',()=>{
 const s=ready();s.location.map='dawnwatch';purchase(s,'petra-recovery');s.activeParty=['nell','petra'];s.skills.petra=presetSkills('petra',10);s.skills.petra.bash=1;
 const b=createBattle(arena,s),petra=b.units.find(u=>u.id==='petra')!,enemy=b.units.at(-1)!;
 petra.hex=offset(3,3);enemy.hex=offset(4,3);b.queue=[petra.id,enemy.id];const hp=enemy.hp;
 expect(cast(b,petra,'bash',enemy.hex)).toBe(true);expect(enemy.hp).toBe(hp);expect(petra.guard).toBe(4);expect(active(b)).toBe(petra);expect(petra.bonusUsed).toBe(true);
 expect(cast(b,petra,'bash',enemy.hex)).toBe(false);petra.bonusUsed=false;petra.guard=20;enemy.hex=offset(4,3);cast(b,petra,'bash',enemy.hex);expect(petra.guard).toBe(20);
 expect(createPartyUnit(s,'nell').improvements?.bash).toBe(false);
});
it('Celia gets precisely one extra Heal range, shared by targeting and description, without altering Daybreak',()=>{
 const s=ready();s.location.map='windmere';s.activeParty=['nell','celia'];s.skills.celia=presetSkills('celia',10);
 const before=createPartyUnit(s,'celia'),range=abilityFor(before,'heal').range;purchase(s,'celia-sight');
 const b=createBattle(arena,s),celia=b.units.find(u=>u.id==='celia')!,nell=b.units[0];celia.hex=offset(1,3);nell.hex={q:celia.hex.q+range+1,r:celia.hex.r};nell.hp=1;b.queue=[celia.id,nell.id];
 expect(abilityFor(celia,'heal').range).toBe(range+1);expect(abilityFor(celia,'heal').description).toContain(`range ${range+1}`);expect(legalAim(b,celia,'heal',nell.hex)).toBe(true);
 expect(abilityFor(celia,'daybreak').range).toBe(abilityFor(before,'daybreak').range);expect(cast(b,celia,'heal',nell.hex)).toBe(true);expect(nell.hp).toBeGreaterThan(1);
});
it('Kit’s jungle service follows treatment AND the river scene, independent of the desert; terrain hazards still hurt',()=>{
 for(const desert of [false,true]){
  const s=jungleCheckpoint('nellRecovered');s.coins=5000;s.location.map='riverhaven';if(desert)s.flags.desertSealBroken=true;
  expect(buyImprovement(s,'kit-footing')).toBe(false);s.flags.riverRestSeen=true;purchase(s,'kit-footing');s.activeParty=['nell','kit'];
  const e={...arena,shallow:[[2,3],[3,3],[4,3]]as [number,number][]},b=createBattle(e,s),kit=b.units.find(u=>u.id==='kit')!;kit.hex=offset(1,3);
  expect(movement(b,kit).get(key(offset(4,3)))?.cost).toBe(3);delete kit.improvements;expect(movement(b,kit).get(key(offset(4,3)))).toBeUndefined();expect(movement(b,kit).get(key(offset(2,3)))?.cost).toBe(2);
  kit.improvements={terrain:true};b.winterIce=[kit.hex];b.queue=[kit.id];const hp=kit.hp;defend(b);expect(kit.hp).toBe(hp-6);
 }
});
it('Nell’s housing requires recovery and the capital, and grants her a fresh barrier only when a battle starts',()=>{
 const ill=chapterSixCapitalStart(false);ill.coins=5000;expect(buyImprovement(ill,'nell-housing')).toBe(false);
 const s=chapterSixCapitalStart(true);s.coins=5000;purchase(s,'nell-housing');s.activeParty=['nell','orrin'];
 const b=createBattle(arena,s),nell=b.units[0];expect(nell.guard).toBe(8);expect(b.units.slice(1).every(u=>!u.guard)).toBe(true);
 nell.guard=0;b.queue=[nell.id];defend(b);expect(nell.guard).toBe(0);expect(createBattle(arena,s).units[0].guard).toBe(8);expect(decodeSave(JSON.stringify(s))).toEqual(s);
});
it('the actual supplies and specialist interactions open their earned services',()=>{
 const s=ready(),j=host(s);interactChapterFive(j.h,'ship-supply');j.choose('Training · permanent improvements');expect(j.read().choices?.some(c=>c.label==='Train Orrin')).toBe(true);
 for(const [map,id,name]of [['hammerplain','hammer-hester-after','Counterbalanced lance'],['dawnwatch','dawn-soldier-after','Shield recovery drill'],['windmere','wind-sera','Long-range focus calibration']]as const){
  s.location.map=map;interactChapterFive(j.h,id);expect(j.read().choices?.some(c=>c.label.startsWith(name))).toBe(true);
 }
 const cured=jungleCheckpoint('riverRestSeen'),k=host(cured);cured.location.map='riverhaven';interactChapterSix(k.h,'river-tavi');expect(k.read().choices?.some(c=>c.label.startsWith('River courier training'))).toBe(true);
 const capital=chapterSixCapitalStart(true),n=host(capital);interactChapterSix(n.h,'capital-crew');n.choose('Reinforce Nell’s lantern · 400 marks');expect(n.read().choices?.some(c=>c.label.startsWith('Reinforced lantern housing'))).toBe(true);
});
