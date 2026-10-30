import {describe,it,expect} from 'vitest';
import {ABILITIES,cast,createBattle,damage,defend,endTurn,legalAim,shape,targets,type Encounter} from '../src/rules/combat';
import {teamSolo} from '../src/rules/abilities';
import {supportPower,battleAbilities,daybreakProtection,teamStatus} from '../src/rules/combat-tactics';
import {characterProfiles,defaultBuild,newCharacterSettings} from '../src/rules/characters';
import {abilityFor,decodeSkillBook,newSkillBook,skillAbilities,skillsAtLevel,startingSkills} from '../src/rules/skills';
import {COMPANION_IDS,type CompanionId} from '../src/rules/party';
import {add,DIRECTIONS,inside,key,offset,scale} from '../src/rules/hex';
import {newGame} from '../src/rules/state';

const encounter:Encounter={id:'circle-test',name:'Circle',music:'battle',flag:'test',xp:0,coins:0,rocks:[],enemies:[{kind:'guardian',col:7,row:3,hp:500}]};
function yard(party:CompanionId[]){
 const settings=newCharacterSettings();settings.party=party;for(const id of party)settings.characters[id]=defaultBuild(id,15);
 const b=createBattle(encounter,newGame(),undefined,characterProfiles(settings),party);b.queue=b.units.map(u=>u.id);
 return {b,u:b.units[0],partner:b.units[1],enemy:b.units.at(-1)!};
}
describe('a circle of team partners',()=>{
 it('gives every companion exactly two distinct partners in one connected five-edge circle',()=>{
  const teams=Object.values(ABILITIES).filter(a=>a.team?.pair.every(id=>COMPANION_IDS.includes(id as CompanionId)));
  expect(teams).toHaveLength(5);
  const partners=(hero:string)=>teams.filter(a=>a.team!.pair.includes(hero)).map(a=>a.team!.pair.find(id=>id!==hero)!);
  for(const hero of COMPANION_IDS){
   expect(new Set(partners(hero)).size).toBe(2);
   expect(new Set(teams.filter(a=>a.team!.pair.includes(hero)).map(a=>teamSolo(hero,a.id))).size).toBe(2);
  }
  const reached=new Set<string>(),visit=(hero:string)=>{if(reached.has(hero))return;reached.add(hero);partners(hero).forEach(visit);};visit('nell');expect(reached.size).toBe(5);
  expect(partners('nell').sort()).toEqual(['kit','orrin']);expect(partners('celia').sort()).toEqual(['orrin','petra']);
 });
 it('leaves every possible three-character formation at least one usable combination',()=>{
  for(let a=0;a<5;a++)for(let z=a+1;z<5;z++)for(let c=z+1;c<5;c++){
   const party=[COMPANION_IDS[a],COMPANION_IDS[z],COMPANION_IDS[c]],{b}=yard(party);
   expect(b.units.filter(u=>u.side==='party').some(u=>battleAbilities(b,u).some(id=>ABILITIES[id].team&&!!teamStatus(b,u,id).partner)),party.join(',')).toBe(true);
  }
 });
 for(const first of ['nell','kit']as const)it(`Lantern volley works from ${first}, spends both turns, and never hits an ally`,()=>{
  const {b,u,partner,enemy}=yard([first,first==='nell'?'kit':'nell','celia']),third=b.units[2];u.hex=offset(3,3);partner.hex=offset(4,3);enemy.hex=offset(6,3);third.hex=offset(6,2);
  const hp=enemy.hp,allyHp=third.hp,predicted=damage(u,enemy,'lanternvolley',partner),area=shape(b,u,'lanternvolley',enemy.hex);
  expect(area).toHaveLength(12);expect(targets(b,u,'lanternvolley',enemy.hex)).toEqual([enemy]);expect(cast(b,u,'lanternvolley',enemy.hex)).toBe(true);
  expect(enemy.hp).toBe(hp-predicted);expect(third.hp).toBe(allyHp);expect(b.queue).not.toContain(u.id);expect(b.queue).toContain(partner.id);expect(u.focus).toBe(3);expect(partner.focus).toBe(3);
 });
});
describe('distinct healing progression and caster-originating Steam lance',()=>{
 it('keeps Celia’s automatic Heal progression separate from Nell’s Mend',()=>{
  const nell=startingSkills('nell'),celia=startingSkills('celia');expect(celia.heal).toBe(1);expect(celia.mend).toBeUndefined();expect(nell.mend).toBe(0);expect(nell.heal).toBeUndefined();
  Object.assign(celia,skillsAtLevel('celia',4));Object.assign(nell,skillsAtLevel('nell',4));expect(celia.heal).toBe(2);expect(nell.mend).toBe(1);
  expect(abilityFor({kind:'celia',skills:celia},'heal').name).toBe('Heal');expect(skillAbilities('celia',celia)).not.toContain('mend');
  const book=newSkillBook(4);expect(decodeSkillBook(book,4)).toEqual(book);
  const bad=structuredClone(book);delete bad.celia.heal;bad.celia.mend=2;expect(()=>decodeSkillBook(bad,3)).toThrow();
 });
 for(const rank of [1,2,3])it(`Steam lance rank ${rank} stays a contiguous four-hex ray from Orrin in every direction`,()=>{
  const {b,u}=yard(['orrin','nell']);u.skills!.steam=rank;u.hex=offset(5,3);
  expect(abilityFor(u,'steam').shape).toBe('line');expect(abilityFor(u,'steam').power).toBe([16,21,28][rank-1]);
  for(const d of DIRECTIONS){
   const aim=add(u.hex,d),expected=[1,2,3,4].map(n=>add(u.hex,scale(d,n))).filter(inside);
   expect(shape(b,u,'steam',aim)).toEqual(expected);expect(shape(b,u,'steam',aim)).not.toContainEqual(u.hex);
   const block=expected[1];b.obstacles.add(key(block));expect(shape(b,u,'steam',aim)).toEqual(expected.slice(0,1));b.obstacles.clear();
  }
 });
});
describe('Celia and Petra’s Daybreak',()=>{
 for(const first of ['celia','petra']as const)for(const rank of [1,2,3])it(`uses Taunt rank ${rank} and Heal when ${first} initiates`,()=>{
  const {b,u,partner,enemy}=yard([first,first==='celia'?'petra':'celia','orrin']),celia=b.units.find(u=>u.kind==='celia')!,petra=b.units.find(u=>u.kind==='petra')!;
  petra.skills!.taunt=rank;celia.skills!.heal=2;for(const ally of b.units.filter(u=>u.side==='party'))ally.hp-=60;
  const hp=celia.hp,predicted=damage(u,celia,'daybreak',partner);expect(predicted).toBe(Math.floor(supportPower(celia,'heal')*9/10));expect(cast(b,u,'daybreak',u.hex)).toBe(true);
  expect(celia.hp).toBe(hp+predicted);expect(enemy.tauntedBy).toBe(petra.id);expect(petra.guard??0).toBe(rank===1?0:rank===2?27:27);expect(celia.guard??0).toBe(rank===3?27:0);
  expect(daybreakProtection(u,partner)!.vanguard).toBe(petra);expect(b.queue).not.toContain(u.id);expect(b.queue).toContain(partner.id);
 });
 it('can protect a full-health party and Taunt ends at Petra’s next turn',()=>{
  const {b,u,partner,enemy}=yard(['celia','petra','orrin']);partner.skills!.taunt=1;
  expect(legalAim(b,u,'daybreak',u.hex)).toBe(true);expect(cast(b,u,'daybreak',u.hex)).toBe(true);expect(enemy.tauntedBy).toBe(partner.id);
  b.queue=['orrin',partner.id];defend(b);expect(enemy.tauntedBy).toBe(partner.id);expect(endTurn(b)).toBe(true);defend(b);defend(b);expect(enemy.tauntedBy).toBeUndefined();
 });
});
