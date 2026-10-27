import {describe,it,expect} from 'vitest';
import {SKILLS,abilityFor,decodeSkillBook,presetSkills,skillAbilities,skillPoints,startingSkills,upgradeReason,upgradeSkill} from '../src/rules/skills';
import {newGame,level,recruitOrrin,recruit} from '../src/rules/state';
import {decodeSave} from '../src/rules/save';
import {characterProfiles,defaultBuild,newCharacterSettings} from '../src/rules/characters';
import {cast,createBattle,damage,awardVictory,legalAim,shape,targets,type Encounter} from '../src/rules/combat';
import {chapterTwoStart} from '../src/dev/canonical-saves';
import {offset,quad} from '../src/rules/hex';

const yard:Encounter={id:'skills-test',name:'Skills',music:'battle',flag:'skillsTest',xp:0,coins:0,rocks:[],enemies:[{kind:'hound',col:6,row:3,hp:500}]};
function battle(party:('nell'|'orrin'|'celia'|'petra'|'kit')[]=['nell','orrin']){
 const settings=newCharacterSettings();settings.party=party;for(const id of party)settings.characters[id]=defaultBuild(id,15);
 const b=createBattle(yard,newGame(),undefined,characterProfiles(settings),party);b.queue=b.units.map(u=>u.id);return {b,u:b.units[0],ally:b.units[1],enemy:b.units.at(-1)!};
}
describe('chosen skill progression',()=>{
 it('banks one point per level and lets the player choose between an upgrade and learning another eligible skill',()=>{
  const s=newGame(),r=s.skills.nell;s.xp=50;expect(level(s)).toBe(2);expect(skillPoints('nell',2,r)).toBe(1);
  expect(r.mend).toBe(0);expect(upgradeSkill('nell',2,r,'burst')).toBe(true);expect(r.burst).toBe(2);expect(skillPoints('nell',2,r)).toBe(0);expect(upgradeSkill('nell',2,r,'mend')).toBe(false);
  const alternative=startingSkills('nell');expect(upgradeSkill('nell',2,alternative,'mend')).toBe(true);expect(alternative.burst).toBe(1);expect(alternative.mend).toBe(1);
  expect(upgradeReason('nell',2,r,'burst')).toContain('level 6');s.xp=370;expect(skillPoints('nell',5,r)).toBe(3);
 });
 it('rejects locked or maxed ranks without spending a point',()=>{
  const r=startingSkills('nell');expect(upgradeSkill('nell',1,r,'dazzle')).toBe(false);expect(r.dazzle).toBe(0);
  expect(upgradeSkill('nell',6,r,'burst')).toBe(true);expect(upgradeSkill('nell',6,r,'burst')).toBe(true);const before=structuredClone(r);expect(upgradeSkill('nell',15,r,'burst')).toBe(false);expect(r).toEqual(before);expect(upgradeReason('nell',15,r,'burst')).toContain('Maximum');
 });
 it('stores choices in the campaign and validates skill ownership, rank gates and point budgets',()=>{
  const s=newGame();s.xp=50;upgradeSkill('nell',2,s.skills.nell,'burst');expect(decodeSave(JSON.stringify(s))).toEqual(s);
  for(const bad of [null,{}, {...s.skills,nell:{...s.skills.nell,burst:4}},{...s.skills,nell:{...s.skills.nell,prism:1}},{...s.skills,nell:{...s.skills.nell,burst:1.5}}])expect(()=>decodeSkillBook(bad,2)).toThrow();
  const excessive=structuredClone(s.skills);excessive.nell={burst:2,mend:1,dazzle:1,sunline:0};expect(()=>decodeSkillBook(excessive,3)).toThrow('Too many');
 });
 it('keeps themed upgrades under a single command and all authored builds within their point budgets',()=>{
  for(const hero of ['nell','orrin','kit','celia','petra']as const)for(let lv=1;lv<=15;lv++){
   const ranks=presetSkills(hero,lv),book=newGame().skills;book[hero]=ranks;expect(()=>decodeSkillBook(book,lv)).not.toThrow();
   const commands=skillAbilities(hero,ranks);expect(new Set(commands).size).toBe(commands.length);expect(commands.length).toBeLessThanOrEqual(9);
   for(const obsolete of ['beacon','dimhalo','pressureline','brace','bolt','volley','driving','bulwark'])expect(commands).not.toContain(obsolete);
   expect(SKILLS[hero].every(s=>(ranks[s.id]??0)<=s.ranks.length)).toBe(true);
  }
 });
 it('lets Kit spend both points at the canonical Chapter Two loading-gate victory',()=>{
  const s=chapterTwoStart();s.flags.coastSeen=true;recruit(s,'kit');s.flags.raidPlanned=s.flags.raidConfronted=true;s.flags.raidDiversion=false;
  const b=createBattle('coast-loading',s);b.result='victory';awardVictory(b,s);
  expect(level(s)).toBe(3);expect(skillPoints('kit',level(s),s.skills.kit)).toBe(2);
  expect(upgradeSkill('kit',level(s),s.skills.kit,'feint')).toBe(true);
  expect(upgradeSkill('kit',level(s),s.skills.kit,'feint')).toBe(true);
  expect(skillPoints('kit',level(s),s.skills.kit)).toBe(0);expect(abilityFor({kind:'kit',skills:s.skills.kit},'feint').cost).toBe(1);
  expect(skillAbilities('kit',s.skills.kit)).not.toContain('ricochet');expect(skillAbilities('kit',s.skills.kit)).not.toContain('lanternvolley');
  expect(decodeSave(JSON.stringify(s))).toEqual(s);
 });
 it('grants reserve characters the same earned points and does not silently spend them at battle victory',()=>{
  const s=newGame();recruitOrrin(s);s.xp=49;const before=structuredClone(s.skills),b=createBattle('workshop',s);b.result='victory';awardVictory(b,s);
  expect(level(s)).toBeGreaterThan(1);expect(s.skills).toEqual(before);expect(skillPoints('orrin',level(s),s.skills.orrin)).toBe(level(s)-1);
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
  expect(results).toEqual([[8,8],[13,13],[19,10]]);
 });
 it('upgraded Heal heals only allies and its final rank clears Dazzle and pin',()=>{
  const {b,u,ally,enemy}=battle(['celia','nell']);u.skills!.heal=3;u.hex=offset(4,3);ally.hex=offset(5,3);enemy.hex=offset(5,2);u.hp-=30;ally.hp-=40;enemy.hp=10;ally.dazzledAttacks=3;ally.pinned=true;
  const hp=ally.hp,predicted=damage(u,ally,'heal');expect(targets(b,u,'heal',ally.hex)).not.toContain(enemy);expect(cast(b,u,'heal',ally.hex)).toBe(true);expect(ally.hp).toBe(hp+predicted);expect(ally.dazzledAttacks).toBeUndefined();expect(ally.pinned).toBeUndefined();expect(enemy.hp).toBe(10);
 });
 it('party Rally excludes its caster and restores the previewed focus',()=>{
  const {b,u,ally}=battle(['celia','nell']);u.skills!.rally=2;ally.focus=1;b.queue=[u.id,b.units.at(-1)!.id,ally.id];const own=u.focus;
  expect(targets(b,u,'rally',u.hex)).toEqual([ally]);expect(cast(b,u,'rally',u.hex)).toBe(true);expect(ally.focus).toBe(3);expect(u.focus).toBe(own-3);
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
  const {b,u,ally,enemy}=battle(['petra','nell']);u.skills!.taunt=3;expect(cast(b,u,'taunt',u.hex)).toBe(true);expect(enemy.tauntedBy).toBe(u.id);expect(u.guard).toBe(33);expect(ally.guard).toBe(33);
 });
 it('team damage discounts the solo skills and grows with either upgrade, identically from either initiator',()=>{
  const {u,ally,enemy}=battle();u.skills!.sunline=1;ally.skills!.steam=1;u.bonus=ally.bonus=0;enemy.armor=0;
  expect(damage(u,enemy,'prism',ally)).toBe(25);expect(damage(ally,enemy,'prism',u)).toBe(25);
  u.skills!.sunline=2;expect(damage(u,enemy,'prism',ally)).toBe(29);
  ally.skills!.steam=3;expect(damage(u,enemy,'prism',ally)).toBe(40);expect(abilityFor(u,'prism',ally).power).toBe(40);
 });
});
