import {expect,it} from 'vitest';
import {chapterFiveFinaleStart,chapterSixCapitalStart,chapterSixStart,chapterSevenRefugeStart,chapterSevenStart} from '../src/dev/canonical-saves';
import {jungleCheckpoint} from './support/jungle';
import {IMPROVEMENTS,buyImprovement,improvementFlag,maxFocus,improvementProblem} from '../src/rules/improvements';
import {maxHp,newGame,restoreParty,type GameState} from '../src/rules/state';
import {decodeSave} from '../src/rules/save';
import {active,awardVictory,cast,createBattle,createPartyUnit,defend,legalAim,movement,type Encounter} from '../src/rules/combat';
import {offset,key} from '../src/rules/hex';
import {abilityFor,skillsAtLevel} from '../src/rules/skills';
import {defaultBuild,characterProfiles,newCharacterSettings} from '../src/rules/characters';
import {completeRiverTreatment} from '../src/content/chapter-six/jungle/recovery';
import {offerImprovements} from '../src/content/improvements';
import {interactChapterFive} from '../src/content/chapter-five/interactions';
import {interactChapterSeven} from '../src/content/chapter-seven/interactions';
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
 offerImprovements(j.h,'training');expect(j.read().choices?.find(c=>c.label==='Train Orrin')?.disabled).toBeFalsy();
 purchase(s,'focus-orrin');offerImprovements(j.h,'training');expect(j.read().choices?.find(c=>c.label==='Train Orrin')?.disabled).toBe(true);
 expect(j.read().choices?.find(c=>c.label==='Train Celia')?.disabled).toBeFalsy();
 s.party=s.party.filter(p=>p.id!=='kit');offerImprovements(j.h,'training');expect(j.read().choices?.some(c=>c.label.includes('Kit'))).toBe(false);
});
it('keeps earned anchor specialties available at every travelling training counter',()=>{
 for(const map of ['airship','outermooring','capitalquay','hollowsill','lastrefuge']as const){
  const s=ready();s.location.map=map;const hp=structuredClone(s.party),skills=structuredClone(s.skills);
  for(const id of ['orrin-counterbalance','petra-recovery','celia-sight'])purchase(s,id);
  expect(s.coins).toBe(3650);expect(s.party).toEqual(hp);expect(s.skills).toEqual(skills);
  for(const [map,id]of [['hammerplain','orrin-counterbalance'],['dawnwatch','petra-recovery'],['dispensary','celia-sight']]as const){
   s.location.map=map;expect(buyImprovement(s,id)).toBe(false);
  }
  expect(s.coins).toBe(3650);
 }
 const s=ready();s.location.map='outermooring';s.flags.hammerplainComplete=false;
 expect(buyImprovement(s,'orrin-counterbalance')).toBe(false);s.flags.hammerplainComplete=true;
 s.location.map='riverhaven';expect(buyImprovement(s,'orrin-counterbalance')).toBe(false);
 s.location.map='outermooring';s.party=s.party.filter(p=>p.id!=='orrin');expect(buyImprovement(s,'orrin-counterbalance')).toBe(false);
});
it('crew specialties confirm and persist once without remote trainer dialogue or curing Nell',()=>{
 const s=chapterSixStart();s.coins=1350;const before=structuredClone(s.party),j=host(s);
 offerImprovements(j.h,'training');j.choose('Specialist improvements');
 expect(j.read().lines[0]).toMatchObject({who:'Alda'});
 j.choose('Counterbalanced lance · 500 marks');expect(s.coins).toBe(1350);j.choose('Cancel improvement');expect(s.coins).toBe(1350);
 for(const [name,cost]of [['Counterbalanced lance',500],['Shield recovery drill',400],['Long-range focus calibration',450]]as const){
  j.choose(`${name} · ${cost} marks`);j.choose(`Confirm · ${cost} marks`);
  expect(j.read().choices?.find(c=>c.label===`${name} · Completed`)?.disabled).toBe(true);
 }
 expect(j.saves()).toBe(3);expect(s.coins).toBe(0);expect(s.party).toEqual(before);expect(s.flags.nellRecovered).toBeFalsy();expect(decodeSave(JSON.stringify(s))).toEqual(s);
 j.choose('Back to training');expect(j.read().choices?.find(c=>c.label==='Train Nell')?.disabled).toBe(true);
 const local=ready();local.location.map='hammerplain';purchase(local,'orrin-counterbalance');local.location.map='airship';
 const k=host(local);offerImprovements(k.h,'training');k.choose('Specialist improvements');expect(k.read().choices?.find(c=>c.label==='Counterbalanced lance · Completed')?.disabled).toBe(true);
 local.flags.dawnwatchComplete=false;local.party=local.party.filter(p=>p.id!=='celia');offerImprovements(k.h,'training');k.choose('Specialist improvements');
 expect(k.read().choices?.map(c=>c.label)).toEqual(['Counterbalanced lance · Completed','Back to training']);
 local.flags.hammerplainComplete=false;offerImprovements(k.h,'training');expect(k.read().choices?.some(c=>c.label==='Specialist improvements')).toBe(false);
 // Alda remains at the mooring; the final refuge uses its own supply crew.
 s.location.map='lastrefuge';offerImprovements(j.h,'training');expect(j.read().lines[0].who).toBe('Supply crew');expect(j.read().lines[0].text).not.toContain('survey deck');
 j.choose('Specialist improvements');expect(j.read().lines[0].who).toBe('Supply crew');
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
 const s=ready();s.location.map='dawnwatch';purchase(s,'petra-recovery');s.activeParty=['nell','petra'];s.skills.petra=skillsAtLevel('petra',10);s.skills.petra.bash=1;
 const b=createBattle(arena,s),petra=b.units.find(u=>u.id==='petra')!,enemy=b.units.at(-1)!;
 petra.hex=offset(3,3);enemy.hex=offset(4,3);b.queue=[petra.id,enemy.id];const hp=enemy.hp;
 expect(cast(b,petra,'bash',enemy.hex)).toBe(true);expect(enemy.hp).toBe(hp);expect(petra.guard).toBe(4);expect(active(b)).toBe(petra);expect(petra.bonusUsed).toBe(true);
 expect(cast(b,petra,'bash',enemy.hex)).toBe(false);petra.bonusUsed=false;petra.guard=20;enemy.hex=offset(4,3);cast(b,petra,'bash',enemy.hex);expect(petra.guard).toBe(20);
 expect(createPartyUnit(s,'nell').improvements?.bash).toBe(false);
});
it('Celia gets precisely one extra Heal range, shared by targeting and description, without altering Daybreak',()=>{
 const s=ready();s.location.map='windmere';s.activeParty=['nell','celia'];s.skills.celia=skillsAtLevel('celia',10);
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

it('the Chapter Seven mooring and refuge retain all earned specialties with real confirmation, cancellation and shared flags',()=>{
 for(const [start,map,object]of [[chapterSevenStart,'hollowsill','sill-rest'],[chapterSevenRefugeStart,'lastrefuge','refuge-seven-rest']]as const){
  const s=start();s.location.map=map;s.coins=2200;const hp=structuredClone(s.party),skills=structuredClone(s.skills),j=host(s);
  interactChapterSeven(j.h,object);j.choose('Training · permanent improvements');j.choose('Specialist improvements');
  j.choose('River courier training · 450 marks');expect(s.coins).toBe(2200);j.choose('Cancel improvement');expect(s.coins).toBe(2200);
  for(const [name,cost]of [['Counterbalanced lance',500],['Shield recovery drill',400],['Long-range focus calibration',450],['River courier training',450],['Reinforced lantern housing',400]]as const){
   j.choose(`${name} · ${cost} marks`);j.choose(`Confirm · ${cost} marks`);
   expect(j.read().choices?.find(c=>c.label===`${name} · Completed`)?.disabled).toBe(true);
  }
  expect(j.saves()).toBe(5);expect(s.coins).toBe(0);expect(s.party).toEqual(hp);expect(s.skills).toEqual(skills);expect(decodeSave(JSON.stringify(s))).toEqual(s);
  s.location.map='riverhaven';expect(buyImprovement(s,'kit-footing')).toBe(false);s.location.map='capitalquay';expect(buyImprovement(s,'nell-housing')).toBe(false);
  expect(s.coins).toBe(0);
 }
});
it('travelling later specialties still require their original quests, recruitment and Nell’s recovery',()=>{
 const s=chapterSixStart();s.coins=5000;s.location.map='outermooring';const j=host(s);
 offerImprovements(j.h,'training');j.choose('Specialist improvements');expect(j.read().choices?.some(c=>c.label.includes('courier')||c.label.includes('housing'))).toBe(false);
 expect(buyImprovement(s,'kit-footing')).toBe(false);expect(buyImprovement(s,'nell-housing')).toBe(false);
 s.flags.riverRestSeen=true;expect(buyImprovement(s,'kit-footing')).toBe(true);
 s.flags.capitalOpened=true;expect(buyImprovement(s,'nell-housing')).toBe(false);s.flags.nellRecovered=true;expect(buyImprovement(s,'nell-housing')).toBe(true);
 const missing=chapterSevenRefugeStart();missing.coins=5000;missing.party=missing.party.filter(h=>h.id!=='kit');expect(buyImprovement(missing,'kit-footing')).toBe(false);
});
