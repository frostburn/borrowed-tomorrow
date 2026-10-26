import {describe,it,expect} from 'vitest';
import {ABILITIES,teamSolo} from '../src/rules/abilities';
import {cast,createBattle,damage,fixtureDamage,legalAim,targets,type Encounter} from '../src/rules/combat';
import {battleAbilities,supportPower,teamStatus} from '../src/rules/combat-tactics';
import {SKILLS,abilityFor,skillAbilities,skillPoints,startingSkills,upgradeSkill} from '../src/rules/skills';
import {characterProfiles,defaultBuild,newCharacterSettings} from '../src/rules/characters';
import {newGame} from '../src/rules/state';
import {offset} from '../src/rules/hex';
import type {CompanionId} from '../src/rules/party';

const encounter:Encounter={id:'teams',name:'Teams',music:'battle',flag:'test',xp:0,coins:0,rocks:[],enemies:[{kind:'guardian',col:7,row:3,hp:500},{kind:'crow',col:8,row:1,hp:500}],coordinated:true};
function yard(party:CompanionId[]){
 const settings=newCharacterSettings();settings.party=party;for(const id of party)settings.characters[id]=defaultBuild(id,15);
 const b=createBattle(encounter,newGame(),undefined,characterProfiles(settings),party);b.queue=b.units.map(u=>u.id);
 return {b,u:b.units[0],partner:b.units[1],enemy:b.units.find(u=>u.kind==='guardian')!};
}

describe('teams inherit solo skills',()=>{
 it('never charges a separate team rank or persists one, and derives a command from the corresponding solo',()=>{
  for(const hero of ['nell','orrin','kit','celia','petra']as const){
   expect(SKILLS[hero].every(s=>!ABILITIES[s.id].team)).toBe(true);
   const ranks=startingSkills(hero),points=skillPoints(hero,15,ranks);
   for(const a of Object.values(ABILITIES).filter(a=>a.team?.pair.includes(hero))){
    const solo=teamSolo(hero,a.id)!;expect(a.id in ranks).toBe(false);
    expect(skillAbilities(hero,ranks).includes(a.id)).toBe((ranks[solo as keyof typeof ranks]??0)>0);
   }
   expect(skillPoints(hero,15,ranks)).toBe(points);
  }
  const ranks=startingSkills('kit');expect(skillAbilities('kit',ranks)).not.toContain('crossfire');
  expect(upgradeSkill('kit',5,ranks,'ricochet')).toBe(true);expect(skillAbilities('kit',ranks)).toContain('crossfire');expect(skillPoints('kit',5,ranks)).toBe(3);
 });
 for(const id of ['prism','starline','crossfire']as const)it(`${id} sums the actual solo damage including separate armor, piercing, defense and Dazzle`,()=>{
  const {b,u,partner,enemy}=yard([...ABILITIES[id].team!.pair]as CompanionId[]);
  u.hex=offset(3,3);partner.hex=offset(2,4);u.bonus=7;partner.bonus=13;u.dazzledAttacks=3;partner.dazzledAttacks=1;enemy.armor=6;enemy.defending=true;
  const first=teamSolo(u.kind,id)!,second=teamSolo(partner.kind,id)!;
  const sum=damage(u,enemy,first)+damage(partner,enemy,second);
  expect(damage(u,enemy,id,partner)).toBe(sum);expect(damage(partner,enemy,id,u)).toBe(sum);
  enemy.guard=11;expect(damage(u,enemy,id,partner)).toBe(Math.max(0,sum-11));
  const expected=damage(u,enemy,id,partner),hp=enemy.hp;expect(cast(b,u,id,enemy.hex)).toBe(true);expect(hp-enemy.hp).toBe(expected);expect(enemy.guard).toBe(Math.max(0,11-sum));
  expect(u.dazzledAttacks).toBe(2);expect(partner.dazzledAttacks).toBe(0);
 });
 it('inherits half-friendly Burst damage for its contribution without weakening the other fighter',()=>{
  const {u,partner,enemy}=yard(['nell','orrin']);u.skills!.burst=3;enemy.side=u.side;
  expect(damage(u,enemy,'prism',partner)).toBe(damage(u,enemy,'burst')+damage(partner,enemy,'steam'));
  expect(fixtureDamage(u,'prism',partner)).toBe(fixtureDamage(u,'burst')+fixtureDamage(partner,'steam'));
 });
 it('enemy relay power is also the sum of its two attacks and independent of the starting operator',()=>{
  const {b,u,enemy}=yard(['nell','orrin']),crow=b.units.find(u=>u.kind==='crow')!;
  const sum=damage(enemy,u,'steam')+damage(crow,u,'peck');expect(damage(enemy,u,'relay',crow)).toBe(sum);expect(damage(crow,u,'relay',enemy)).toBe(sum);
 });
 it('Daybreak adds each Mend with its own rank and level, without turning weapon power into healing or reviving',()=>{
  const {b,u,partner}=yard(['nell','celia']);u.skills!.mend=1;u.level=3;partner.skills!.mend=3;partner.level=11;u.hp=1;partner.hp=1;
  const sum=supportPower(u,'mend')+supportPower(partner,'mend');expect(sum).toBe(70);expect(supportPower(u,'daybreak',partner)).toBe(sum);expect(supportPower(partner,'daybreak',u)).toBe(sum);
  u.bonus=partner.bonus=999;expect(damage(u,u,'daybreak',partner)).toBe(sum);
  expect(cast(b,u,'daybreak',u.hex)).toBe(true);expect(u.hp).toBe(1+sum);
 });
 it('names the busy, exhausted, fallen or untrained partner and keeps unavailable commands in the list',()=>{
  const {b,u,partner,enemy}=yard(['nell','orrin']);b.queue=b.queue.filter(id=>id!==partner.id);
  expect(battleAbilities(b,u)).toContain('prism');expect(teamStatus(b,u,'prism').reason).toBe('Orrin has already used their action this round.');expect(legalAim(b,u,'prism',enemy.hex)).toBe(false);
  b.queue.push(partner.id);partner.focus=1;expect(teamStatus(b,u,'prism').reason).toBe('Orrin needs 3 focus (has 1).');
  partner.hp=0;expect(teamStatus(b,u,'prism').reason).toContain('Orrin is down');
  partner.hp=1;partner.focus=6;partner.abilities=partner.abilities.filter(id=>id!=='steam');expect(teamStatus(b,u,'prism').reason).toBe('Orrin needs to learn Steam lance.');
 });
 it('Crossfire takes its aiming and bounce reach from Kit’s solo rank for either initiator',()=>{
  for(const reverse of [false,true]){
   const {b,u,partner,enemy}=yard(reverse?['petra','kit']:['kit','petra']),kit=b.units.find(u=>u.kind==='kit')!;
   kit.skills!.ricochet=3;u.hex=offset(1,3);partner.hex=offset(2,3);enemy.hex=offset(7,3);
   expect(abilityFor(u,'crossfire',partner).range).toBe(6);expect(abilityFor(u,'crossfire',partner).bounceRange).toBe(4);expect(legalAim(b,u,'crossfire',enemy.hex)).toBe(true);expect(targets(b,u,'crossfire',enemy.hex)).toHaveLength(2);
   kit.skills!.ricochet=1;expect(legalAim(b,u,'crossfire',enemy.hex)).toBe(false);
  }
 });
});
