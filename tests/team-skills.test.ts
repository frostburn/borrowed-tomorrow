import {describe,it,expect} from 'vitest';
import {ABILITIES,teamOutput,teamSolo} from '../src/rules/abilities';
import {active,cast,createBattle,damage,fixtureDamage,legalAim,movementOnly,targets,type Encounter} from '../src/rules/combat';
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
 for(const id of ['prism','starline','crossfire','lanternvolley']as const)it(`${id} trades ten percent of the actual solo damage for timing and coverage including separate armor, piercing, defense and Dazzle`,()=>{
  const {b,u,partner,enemy}=yard([...ABILITIES[id].team!.pair]as CompanionId[]);
  u.hex=offset(3,3);partner.hex=offset(2,4);u.bonus=7;partner.bonus=13;u.dazzledAttacks=3;partner.dazzledAttacks=1;enemy.armor=6;enemy.defending=true;
  const first=teamSolo(u.kind,id)!,second=teamSolo(partner.kind,id)!;
  const soloTotal=damage(u,enemy,first)+damage(partner,enemy,second),sum=teamOutput(soloTotal);expect(sum).toBeLessThan(soloTotal);
  expect(damage(u,enemy,id,partner)).toBe(sum);expect(damage(partner,enemy,id,u)).toBe(sum);
  enemy.guard=11;expect(damage(u,enemy,id,partner)).toBe(Math.max(0,sum-11));
  const expected=damage(u,enemy,id,partner),hp=enemy.hp;expect(cast(b,u,id,enemy.hex)).toBe(true);expect(hp-enemy.hp).toBe(expected);expect(enemy.guard).toBe(Math.max(0,11-sum));
  expect(u.dazzledAttacks).toBe(2);expect(partner.dazzledAttacks).toBe(0);
 });
 it('Prism uses Horizon light for enemies, friendly fire and fixtures, independently of Burst upgrades',()=>{
  const {u,partner,enemy}=yard(['nell','orrin']);u.skills!.burst=1;enemy.side=u.side;
  const expected=teamOutput(damage(u,enemy,'sunline')+damage(partner,enemy,'steam'));
  expect(damage(u,enemy,'prism',partner)).toBe(expected);
  u.skills!.burst=3;expect(damage(u,enemy,'prism',partner)).toBe(expected);
  expect(fixtureDamage(u,'prism',partner)).toBe(teamOutput(fixtureDamage(u,'sunline')+fixtureDamage(partner,'steam')));
 });
 for(const [id,first,second,learn]of [['prism','nell','orrin','sunline'],['lanternvolley','kit','nell','pin']]as const)it(`${id} waits for the later solo skill, then works at rank one without another gate`,()=>{
  const {b,u,partner,enemy}=yard([first,second]);u.hex=offset(3,3);
  for(const fighter of [u,partner]){fighter.skills=startingSkills(fighter.kind as CompanionId);fighter.level=6;}
  const nell=[u,partner].find(v=>v.kind==='nell')!;upgradeSkill('nell',6,nell.skills!,'burst');upgradeSkill('nell',6,nell.skills!,'burst');
  if(first==='kit')upgradeSkill('kit',6,u.skills!,'quickshot');
  const refresh=()=>{for(const fighter of [u,partner])fighter.abilities=skillAbilities(fighter.kind as CompanionId,fighter.skills!);};refresh();
  expect(battleAbilities(b,u)).not.toContain(id);expect(battleAbilities(b,partner)).toContain(id);
  expect(teamStatus(b,partner,id).reason).toBe(`${u.name} needs to learn ${ABILITIES[learn].name}.`);
  const before=structuredClone(b);expect(cast(b,u,id,enemy.hex)).toBe(false);expect(b).toEqual(before);
  expect(upgradeSkill(first,6,u.skills!,learn)).toBe(false);
  expect(upgradeSkill(first,7,u.skills!,learn)).toBe(true);refresh();
  expect(u.skills![learn]).toBe(1);expect(teamStatus(b,u,id).partner).toBe(partner);expect(teamStatus(b,partner,id).partner).toBe(u);
  expect(cast(b,u,id,enemy.hex)).toBe(true);
 });
 it('enemy relay power also discounts the sum of its two attacks and independent of the starting operator',()=>{
  const {b,u,enemy}=yard(['nell','orrin']),crow=b.units.find(u=>u.kind==='crow')!;
  const sum=teamOutput(damage(enemy,u,'steam')+damage(crow,u,'peck'));expect(damage(enemy,u,'relay',crow)).toBe(sum);expect(damage(crow,u,'relay',enemy)).toBe(sum);
 });
 it('Daybreak uses Celia’s Heal at her own rank and level, without turning weapon power into healing or reviving',()=>{
  const {b,u,partner}=yard(['celia','petra']);u.skills!.heal=3;u.level=11;partner.level=3;u.hp=1;partner.hp=1;
  expect(supportPower(u,'heal')).toBe(48);const sum=43;expect(supportPower(u,'daybreak',partner)).toBe(sum);expect(supportPower(partner,'daybreak',u)).toBe(sum);
  u.bonus=partner.bonus=999;expect(damage(u,u,'daybreak',partner)).toBe(sum);
  expect(cast(b,u,'daybreak',u.hex)).toBe(true);expect(u.hp).toBe(1+sum);
 });
 it('trades damage for defeating a target before the borrowed partner would act',()=>{
  const {b,u,partner,enemy}=yard(['kit','petra']);u.hex=offset(3,3);partner.hex=offset(7,4);
  b.queue=[u.id,enemy.id,partner.id];enemy.hp=damage(u,enemy,'crossfire',partner);
  const separate=structuredClone(b),first=separate.units.find(v=>v.id===u.id)!,victim=separate.units.find(v=>v.id===enemy.id)!;
  expect(cast(separate,first,'ricochet',victim.hex)).toBe(true);expect(victim.hp).toBeGreaterThan(0);expect(active(separate)?.id).toBe(enemy.id);
  expect(cast(b,u,'crossfire',enemy.hex)).toBe(true);expect(enemy.hp).toBe(0);expect(active(b)).toBe(partner);expect(movementOnly(b,partner)).toBe(true);
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
