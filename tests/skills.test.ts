import {describe,it,expect} from 'vitest';
import {SKILLS,abilityFor,decodeSkillBook,newSkillBook,skillsAtLevel,skillAbilities,skillChanges,skillProgress} from '../src/rules/skills';
import {newGame,gainExperience,level,recruitOrrin,recruit} from '../src/rules/state';
import {decodeSave} from '../src/rules/save';
import {characterProfiles,defaultBuild,newCharacterSettings} from '../src/rules/characters';
import {cast,createBattle,damage,awardVictory,legalAim,shape,targets,type Encounter} from '../src/rules/combat';
import {chapterTwoStart,chapterFiveStart} from '../src/dev/canonical-saves';
import {offset,quad} from '../src/rules/hex';

const yard:Encounter={id:'skills-test',name:'Skills',music:'battle',flag:'skillsTest',xp:0,coins:0,rocks:[],enemies:[{kind:'hound',col:6,row:3,hp:500}]};
function battle(party:('nell'|'orrin'|'celia'|'petra'|'kit')[]=['nell','orrin']){
 const settings=newCharacterSettings();settings.party=party;for(const id of party)settings.characters[id]=defaultBuild(id,15);
 const b=createBattle(yard,newGame(),undefined,characterProfiles(settings),party);b.queue=b.units.map(u=>u.id);return {b,u:b.units[0],ally:b.units[1],enemy:b.units.at(-1)!};
}
describe('automatic skill progression',()=>{
 it('uses the agreed three milestones for every skill',()=>{
  const expected={nell:[[1,3,10],[2,6,12],[4,8,13],[7,11,15]],orrin:[[1,5,11],[2,7,12],[3,8,14],[6,10,15]],kit:[[1,4,10],[2,6,12],[5,9,14],[7,11,15]],celia:[[1,7,13],[1,4,11],[2,6,12],[5,9,15]],petra:[[1,6,12],[2,8,14],[3,7,11],[5,10,15]]};
  for(const hero of Object.keys(expected)as (keyof typeof expected)[])expect(SKILLS[hero].map(s=>s.levels)).toEqual(expected[hero]);
 });
 it('learns Mend on the first level-up and upgrades Burst separately at level three',()=>{
  const s=newGame();expect(s.skills.nell).toEqual({burst:1,mend:0,dazzle:0,sunline:0});
  gainExperience(s,50);expect(level(s)).toBe(2);expect(s.skills.nell).toEqual({burst:1,mend:1,dazzle:0,sunline:0});
  gainExperience(s,80);expect(level(s)).toBe(3);expect(s.skills.nell.burst).toBe(2);
  expect(skillChanges('nell',1,3)).toEqual([{id:'mend',rank:1,level:2},{id:'burst',rank:2,level:3}]);
  expect(skillChanges('nell',3,3)).toEqual([]);
 });
 it('reports every milestone in order for multi-level rewards and leaves quiet levels quiet',()=>{
  expect(skillChanges('orrin',1,8).map(c=>[c.id,c.rank,c.level])).toEqual([['rivet',1,2],['guard',1,3],['steam',2,5],['repulse',1,6],['rivet',2,7],['guard',2,8]]);
  expect(skillChanges('nell',4,5)).toEqual([]);expect(skillProgress('nell',5)).toEqual({mastered:false,nextLevel:6});
  for(const hero of ['nell','orrin','kit','celia','petra']as const)expect(skillProgress(hero,15)).toEqual({mastered:true,nextLevel:undefined});
 });
 it('gives reserves and later recruits the same level-based growth without changing resources or story availability',()=>{
  const s=newGame();recruitOrrin(s);recruit(s,'petra');s.activeParty=['nell','orrin'];s.flags.nellIll=true;
  const before=structuredClone({party:s.party,activeParty:s.activeParty,inventory:s.inventory,coins:s.coins,bandages:s.bandages,flags:s.flags});
  gainExperience(s,1180);expect(level(s)).toBe(9);expect(s.skills).toEqual(newSkillBook(9));
  expect({party:s.party,activeParty:s.activeParty,inventory:s.inventory,coins:s.coins,bandages:s.bandages,flags:s.flags}).toEqual(before);
  recruit(s,'celia');expect(s.skills.celia).toEqual(skillsAtLevel('celia',9));expect(s.skills.petra).toEqual(skillsAtLevel('petra',9));
 });
 it('normalizes existing current-format choices to the new schedule on load without changing any other progress',()=>{
  const s=chapterFiveStart(),before=structuredClone(s);s.skills.nell={burst:3,mend:2,dazzle:2,sunline:1};s.skills.kit={quickshot:3,feint:3,ricochet:2,pin:1};
  const loaded=decodeSave(JSON.stringify(s));expect(loaded).toEqual({...before,skills:newSkillBook(level(s))});
  expect(decodeSave(JSON.stringify(loaded))).toEqual(loaded);
  for(const bad of [null,{}, {...s.skills,nell:{...s.skills.nell,burst:4}},{...s.skills,nell:{...s.skills.nell,prism:1}},{...s.skills,nell:{...s.skills.nell,burst:1.5}},{...s.skills,nell:{...s.skills.nell,burst:0}}])expect(()=>decodeSkillBook(bad,3)).toThrow();
 });
 it('has no duplicate or obsolete commands at any level and reaches full mastery at fifteen',()=>{
  for(const hero of ['nell','orrin','kit','celia','petra']as const)for(let lv=1;lv<=15;lv++){
   const ranks=skillsAtLevel(hero,lv),commands=skillAbilities(hero,ranks);
   expect(new Set(commands).size).toBe(commands.length);expect(commands.length).toBeLessThanOrEqual(9);
   for(const obsolete of ['beacon','dimhalo','pressureline','brace','bolt','volley','driving','bulwark'])expect(commands).not.toContain(obsolete);
   for(const skill of SKILLS[hero]){expect(ranks[skill.id]).toBe(skill.levels.filter(required=>required<=lv).length);if(lv===15)expect(ranks[skill.id]).toBe(3);}
  }
 });
 it('automatically awards the canonical loading-gate skills and never repeats victory rewards',()=>{
  const s=chapterTwoStart();s.flags.coastSeen=true;recruit(s,'kit');s.flags.raidPlanned=s.flags.raidConfronted=true;s.flags.raidDiversion=false;
  const b=createBattle('coast-loading',s);b.result='victory';awardVictory(b,s);
  expect(level(s)).toBe(3);expect(s.skills.kit).toEqual(skillsAtLevel('kit',3));expect(s.skills.kit.feint).toBe(1);
  expect(skillAbilities('kit',s.skills.kit)).not.toContain('ricochet');expect(skillAbilities('kit',s.skills.kit)).not.toContain('lanternvolley');
  const before=structuredClone(s);awardVictory(b,s);expect(s).toEqual(before);expect(decodeSave(JSON.stringify(s))).toEqual(s);
 });
 it('updates growth at victory even for companions not deployed in that battle',()=>{
  const s=newGame();recruitOrrin(s);s.activeParty=['nell'];gainExperience(s,49);const b=createBattle('workshop',s);b.result='victory';awardVictory(b,s);
  expect(level(s)).toBeGreaterThan(1);expect(s.skills.orrin).toEqual(skillsAtLevel('orrin',level(s)));expect(s.skills.orrin.rivet).toBe(1);
 });
});
describe('ranked combat resolution',()=>{
 it('Lantern Burst grows from the slanted square into a hex ball, increases power each time and halves allied damage only at rank three',()=>{
  const results:number[][]=[];
  for(const rank of [1,2,3]){
   const {b,u,ally,enemy}=battle();u.skills!.burst=rank;u.hex=offset(1,3);ally.hex=offset(7,3);enemy.armor=ally.armor=0;u.bonus=0;
   const area=shape(b,u,'burst',enemy.hex);expect(area).toHaveLength(rank===1?4:7);if(rank===1)expect(area).toEqual(quad(enemy.hex));
   const predicted=[damage(u,enemy,'burst'),damage(u,ally,'burst')],hp=[enemy.hp,ally.hp];expect(cast(b,u,'burst',enemy.hex)).toBe(true);expect([hp[0]-enemy.hp,hp[1]-ally.hp]).toEqual(predicted);results.push(predicted);
  }
  expect(results).toEqual([[8,8],[12,12],[17,9]]);
 });
 it('upgraded Heal heals only allies and its final rank clears Dazzle and pin',()=>{
  const {b,u,ally,enemy}=battle(['celia','nell']);u.skills!.heal=3;u.hex=offset(4,3);ally.hex=offset(5,3);enemy.hex=offset(5,2);u.hp-=30;ally.hp-=40;enemy.hp=10;ally.dazzledAttacks=3;ally.pinned=true;
  const hp=ally.hp,predicted=damage(u,ally,'heal');expect(targets(b,u,'heal',ally.hex)).not.toContain(enemy);expect(cast(b,u,'heal',ally.hex)).toBe(true);expect(ally.hp).toBe(hp+predicted);expect(ally.dazzledAttacks).toBeUndefined();expect(ally.pinned).toBeUndefined();expect(enemy.hp).toBe(10);
 });
 it('Rallying cry II includes Celia and nearby allies without an immediate refill',()=>{
  const {b,u,ally,enemy}=battle(['celia','nell']);u.skills!.rally=2;u.hex=offset(3,3);ally.hex=offset(4,3);ally.focus=1;b.queue=[u.id,enemy.id,ally.id];const own=u.focus;
  expect(targets(b,u,'rally',u.hex)).toEqual([u,ally]);expect(cast(b,u,'rally',u.hex)).toBe(true);expect(ally.focus).toBe(1);expect(u.focus).toBe(own-3);expect(u.rally).toEqual({rank:2,expiresRound:4});
 });
 it('final Heal can cleanse an ally whose HP is already full',()=>{
  const {b,u,ally}=battle(['celia','nell']);u.skills!.heal=3;u.hex=offset(3,3);ally.hex=offset(4,3);ally.dazzledAttacks=3;ally.pinned=true;
  expect(legalAim(b,u,'heal',ally.hex)).toBe(true);expect(cast(b,u,'heal',ally.hex)).toBe(true);expect(ally.dazzledAttacks).toBeUndefined();expect(ally.pinned).toBeUndefined();expect(ally.hp).toBe(ally.maxHp);
 });
 it('final Shield bash pushes adjacent enemies without damage or consuming the main action',()=>{
  const {b,u,ally,enemy}=battle(['petra','nell']);u.skills!.bash=3;u.focus=0;u.hex=offset(4,3);ally.hex=offset(3,3);enemy.hex=offset(5,3);const hp=enemy.hp,friend={...ally.hex};
  expect(cast(b,u,'bash',u.hex)).toBe(true);expect(enemy.hex).toEqual(offset(6,3));expect(enemy.hp).toBe(hp);expect(ally.hex).toEqual(friend);expect(u.focus).toBe(0);expect(u.bonusUsed).toBe(true);expect(b.queue[0]).toBe(u.id);expect(cast(b,u,'bash',u.hex)).toBe(false);
 });
 it('maximal Taunt combines the old party barrier with enemy targeting',()=>{
  const {b,u,ally,enemy}=battle(['petra','nell']);u.skills!.taunt=3;expect(cast(b,u,'taunt',u.hex)).toBe(true);expect(enemy.tauntedBy).toBe(u.id);expect(u.guard).toBe(31);expect(ally.guard).toBe(31);
 });
 it('team damage discounts the solo skills and grows with either upgrade, identically from either initiator',()=>{
  const {u,ally,enemy}=battle();u.skills!.sunline=1;ally.skills!.steam=1;u.bonus=ally.bonus=0;enemy.armor=0;
  expect(damage(u,enemy,'prism',ally)).toBe(34);expect(damage(ally,enemy,'prism',u)).toBe(34);
  u.skills!.sunline=2;expect(damage(u,enemy,'prism',ally)).toBe(39);
  ally.skills!.steam=3;expect(damage(u,enemy,'prism',ally)).toBe(50);expect(abilityFor(u,'prism',ally).power).toBe(50);
 });
});
