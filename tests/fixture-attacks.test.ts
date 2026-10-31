import {expect,it} from 'vitest';
import {cast,createBattle,damage,enemyTurn,fixtureDamage,legalAim,shape,targets,type Encounter} from '../src/rules/combat';
import {fixtureAt,teamStatus,type FixtureDefinition} from '../src/rules/combat-tactics';
import {characterProfiles,defaultBuild,newCharacterSettings} from '../src/rules/characters';
import {key,offset,type Hex} from '../src/rules/hex';
import {newGame} from '../src/rules/state';
import type {CompanionId} from '../src/rules/party';

function arena(hero:CompanionId,kind:FixtureDefinition['kind']='drum',hp=500){
 const party:CompanionId[]=hero==='kit'?['kit','petra','celia']:hero==='nell'?['nell','kit','celia']:[hero,'nell','kit'];
 const settings=newCharacterSettings();for(const id of party)settings.characters[id]=defaultBuild(id,15);
 const encounter:Encounter={id:'fixture-attacks',name:'Fixtures',music:'battle',flag:'test',xp:0,coins:0,rocks:[],
  enemies:[{kind:'guardian',col:5,row:3,hp:500}],fixtures:[{id:'prop',name:'Prop',kind,col:3,row:3,hp,power:0,vents:[[5,3]]}]};
 const b=createBattle(encounter,newGame(),undefined,characterProfiles(settings),party),u=b.units.find(u=>u.id===hero)!,enemy=b.units.find(u=>u.side==='enemy')!;
 party.forEach((id,i)=>{b.units.find(u=>u.id===id)!.hex=offset(1,3+i);});
 b.queue=[...party,enemy.id];return {b,u,enemy,prop:b.fixtures![0]};
}

for(const kind of ['drum','barricade']as const)for(const rank of [1,2,3])it(`Steam lance rank ${rank} hits the first ${kind}, protecting units behind it`,()=>{
 const {b,u,enemy,prop}=arena('orrin',kind);u.skills!.steam=rank;
 expect(legalAim(b,u,'steam',prop.hex)).toBe(true);
 expect(shape(b,u,'steam',enemy.hex)).toEqual([offset(2,3),prop.hex]);
 expect(targets(b,u,'steam',enemy.hex)).not.toContain(enemy);
 const hp=enemy.hp,power=fixtureDamage(u,'steam');
 expect(cast(b,u,'steam',prop.hex)).toBe(true);expect(prop.hp).toBe(500-power);expect(enemy.hp).toBe(hp);
 expect(b.obstacles.has(key(prop.hex))).toBe(true);
});
it('stops the fired beam at a bursting drum, then lets a later cast through the opened lane',()=>{
 const {b,u,enemy,prop}=arena('orrin','drum',1),hp=enemy.hp;
 expect(cast(b,u,'steam',prop.hex)).toBe(true);expect(prop.hp).toBe(0);expect(enemy.hp).toBe(hp);
 expect(b.obstacles.has(key(prop.hex))).toBe(false);
 b.queue=[u.id,enemy.id];u.focus=10;
 expect(shape(b,u,'steam',enemy.hex)).toContainEqual(enemy.hex);
 expect(cast(b,u,'steam',enemy.hex)).toBe(true);expect(enemy.hp).toBeLessThan(hp);
});
it('damages a nearby enemy behind a bursting drum with its explosion, not a second beam hit',()=>{
 const {b,u,enemy,prop}=arena('orrin','drum',1);enemy.hex=offset(4,3);enemy.armor=3;enemy.guard=4;prop.power=18;
 const hp=enemy.hp;expect(cast(b,u,'steam',prop.hex)).toBe(true);
 expect(enemy.hp).toBe(hp-11);expect(enemy.guard).toBe(0);
});
it('reports the fired enemy beam footprint before its drum blocker is destroyed',()=>{
 const {b,u,enemy,prop}=arena('orrin','drum',1),protectedAlly=b.units.find(v=>v.side==='party'&&v!==u)!;
 enemy.hex=offset(1,3);enemy.abilities=['steam'];enemy.focus=10;enemy.movement=0;enemy.anchored=true;
 u.hex=offset(2,3);protectedAlly.hex=offset(4,3);b.units=[u,protectedAlly,enemy];b.queue=[enemy.id,u.id,protectedAlly.id];
 const hp=[u.hp,protectedAlly.hp];let fired:Hex[]|undefined;
 expect(enemyTurn(b,undefined,(ability,aim,affected)=>{fired=affected??shape(b,enemy,ability,aim);})).toBe('steam');
 expect(prop.hp).toBe(0);expect(b.obstacles.has(key(prop.hex))).toBe(false);
 expect(u.hp).toBeLessThan(hp[0]);expect(protectedAlly.hp).toBe(hp[1]);
 expect(fired).toEqual([offset(2,3),prop.hex]);
 expect(shape(b,enemy,'steam',u.hex)).toContainEqual(protectedAlly.hex);
});
it('keeps solid rock blocking both the beam and shots at props behind it',()=>{
 const {b,u,prop}=arena('orrin');b.obstacles.add(key(offset(2,3)));
 expect(shape(b,u,'steam',prop.hex)).toEqual([]);expect(legalAim(b,u,'steam',prop.hex)).toBe(false);
 expect(legalAim(b,u,'rivet',prop.hex)).toBe(false);expect(prop.hp).toBe(500);
});
it('lets enemy straight beams hit destructible cover under the same rule',()=>{
 const {b,u,prop,enemy}=arena('orrin');enemy.kind='herald';enemy.abilities=['sunbeam'];enemy.hex=offset(1,3);u.hex=offset(5,3);b.queue=[enemy.id,u.id];
 expect(shape(b,enemy,'sunbeam',u.hex)).toEqual([offset(2,3),prop.hex]);
 const hp=u.hp;expect(cast(b,enemy,'sunbeam',prop.hex)).toBe(true);expect(prop.hp).toBeLessThan(500);expect(u.hp).toBe(hp);
});
for(const rank of [1,2,3])for(const kind of ['drum','barricade']as const)it(`Lantern burst rank ${rank} can aim directly at a ${kind}`,()=>{
 const {b,u,enemy,prop}=arena('nell',kind);u.skills!.burst=rank;enemy.hex=offset(4,3);
 expect(legalAim(b,u,'burst',prop.hex)).toBe(true);expect(shape(b,u,'burst',prop.hex)).toContainEqual(prop.hex);
 expect(targets(b,u,'burst',prop.hex)).toContain(enemy);
 const hp=enemy.hp,power=damage(u,enemy,'burst');
 expect(cast(b,u,'burst',prop.hex)).toBe(true);expect(prop.hp).toBeLessThan(500);expect(enemy.hp).toBe(hp-power);
});
it('lets Lantern volley aim at cover while preserving its team costs and enemy-only hits',()=>{
 const {b,u,enemy,prop}=arena('nell');enemy.hex=offset(4,3);
 const partner=teamStatus(b,u,'lanternvolley').partner!;partner.hex=offset(3,4);
 expect(legalAim(b,u,'lanternvolley',prop.hex)).toBe(true);expect(targets(b,u,'lanternvolley',prop.hex)).not.toContain(partner);
 const focus=[u.focus,partner.focus],hp=partner.hp;
 expect(cast(b,u,'lanternvolley',prop.hex)).toBe(true);expect(prop.hp).toBeLessThan(500);
 expect([u.focus,partner.focus]).toEqual(focus.map(n=>n-3));expect(partner.hp).toBe(hp);
});
for(const id of ['ricochet','crossfire']as const)it(`${id} can hit a prop and bounce to a visible enemy`,()=>{
 const {b,u,enemy,prop}=arena('kit');enemy.hex=offset(4,3);
 expect(legalAim(b,u,id,prop.hex)).toBe(true);expect(shape(b,u,id,prop.hex)).toEqual([prop.hex,enemy.hex]);
 const hp=enemy.hp,power=damage(u,enemy,id,teamStatus(b,u,id).partner);
 expect(cast(b,u,id,prop.hex)).toBe(true);expect(prop.hp).toBeLessThan(500);expect(enemy.hp).toBe(hp-power);
});
it('allows a lone prop hit with Ricochet, but cannot bounce or aim through intervening rock',()=>{
 const {b,u,enemy,prop}=arena('kit','barricade');b.obstacles.add(key(offset(4,3)));
 expect(shape(b,u,'ricochet',prop.hex)).toEqual([prop.hex]);
 const hp=enemy.hp;expect(cast(b,u,'ricochet',prop.hex)).toBe(true);expect(enemy.hp).toBe(hp);
 const other=arena('kit');other.b.obstacles.add(key(offset(2,3)));
 expect(legalAim(other.b,other.u,'ricochet',other.prop.hex)).toBe(false);
});
for(const [id,hero]of [['quickshot','kit'],['rivet','orrin'],['pin','kit'],['crush','petra']]as const)it(`${id} damages a prop without applying character-only status or movement to it`,()=>{
 const {b,u,prop}=arena(hero,'barricade');u.hex=offset(2,3);const hex={...prop.hex};
 expect(legalAim(b,u,id,hex)).toBe(true);expect(cast(b,u,id,hex)).toBe(true);
 expect(prop.hp).toBeLessThan(500);expect(prop.hex).toEqual(hex);expect(fixtureAt(b,hex)).toBe(prop);
});
it('does not bypass Taunt or range when aiming blasts or bounces at cover',()=>{
 for(const [hero,id]of [['nell','burst'],['kit','ricochet']]as const){
  const {b,u,enemy,prop}=arena(hero);u.tauntedBy=enemy.id;
  expect(legalAim(b,u,id,prop.hex)).toBe(false);delete u.tauntedBy;
  prop.hex=offset(10,6);b.obstacles=new Set([key(prop.hex)]);expect(legalAim(b,u,id,prop.hex)).toBe(false);
 }
});
it('cannot use healing, Dazzle or Shield bash to damage a drum or activate a valve',()=>{
 for(const kind of ['drum','valve']as const)for(const [hero,id]of [['nell','mend'],['nell','dazzle'],['petra','bash']]as const){
  const {b,u,prop}=arena(hero,kind);u.hex=offset(2,3);
  expect(legalAim(b,u,id,prop.hex)).toBe(false);expect(cast(b,u,id,prop.hex)).toBe(false);
  expect(prop.hp).toBe(500);expect(prop.bursts).toBeUndefined();
 }
});
it('keeps a nearby enemy forcing Cinder peck into melee even when a prop is selected',()=>{
 const {b,u,enemy,prop}=arena('orrin');enemy.kind='crow';enemy.abilities=['peck'];enemy.hex=offset(1,3);u.hex=offset(2,3);b.queue=[enemy.id,u.id];
 expect(legalAim(b,enemy,'peck',prop.hex)).toBe(false);
});
for(const [hero,id]of [['kit','quickshot'],['orrin','rivet'],['celia','celestialbolt']]as const)it(`${id} can hit a valve under an ally without shooting that ally`,()=>{
 const {b,u,prop}=arena(hero,'valve'),ally=b.units.find(v=>v.side===u.side&&v!==u)!;ally.hex={...prop.hex};
 const hp=ally.hp;expect(legalAim(b,u,id,prop.hex)).toBe(true);expect(targets(b,u,id,prop.hex)).not.toContain(ally);
 expect(cast(b,u,id,prop.hex)).toBe(true);expect(prop.bursts).toBe(1);expect(ally.hp).toBe(hp);
});
it('a Steam lance crossing a passable valve activates it once and continues to its ordinary targets',()=>{
 const {b,u,enemy,prop}=arena('orrin','valve'),hp=enemy.hp,hit=damage(u,enemy,'steam');
 expect(shape(b,u,'steam',enemy.hex)).toEqual([offset(2,3),prop.hex,offset(4,3),enemy.hex]);
 expect(cast(b,u,'steam',prop.hex)).toBe(true);expect(prop.bursts).toBe(1);expect(prop.hp).toBe(500);expect(enemy.hp).toBe(hp-hit-6);
});
