import { expect, it } from 'vitest';
import { characterProfiles, COMPANION_IDS, decodeCharacterSettings, defaultBuild, newCharacterSettings, setPartyMember } from '../src/rules/characters';
import { active, cast, createBattle, damage, legalAim, targets } from '../src/rules/combat';
import { offset, key } from '../src/rules/hex';
import { decodeInventory, equipmentBonuses, equipItem, newInventory, receiveItem } from '../src/rules/inventory';
import { newGame, recruitOrrin } from '../src/rules/state';

function trio(level = 5) {
  const settings = newCharacterSettings(); settings.party = ['esme', 'celia', 'petra'];
  for(const id of settings.party)settings.characters[id]=defaultBuild(id,level);
  settings.characters.celia.speed=30;
  const b=createBattle('workshop',newGame(),equipmentBonuses(newInventory()),characterProfiles(settings),settings.party);
  b.obstacles.clear();
  return {b,esme:b.units[0],celia:b.units[1],petra:b.units[2],enemy:b.units[3]};
}

it('keeps one to three distinct active companions and preserves reserve builds',()=>{
  const s=newCharacterSettings();s.characters.esme.attack=25;
  expect(setPartyMember(s,'esme',true)).toBe(true);
  const full=structuredClone(s);expect(setPartyMember(s,'celia',true)).toBe(false);expect(s).toEqual(full);
  expect(setPartyMember(s,'esme',true)).toBe(false);
  expect(setPartyMember(s,'nell',false)).toBe(true);expect(setPartyMember(s,'orrin',false)).toBe(true);
  expect(setPartyMember(s,'esme',false)).toBe(false);expect(s.party).toEqual(['esme']);expect(s.characters.esme.attack).toBe(25);
});
it('migrates two-character settings and round-trips the expanded roster and party',()=>{
  const nell={...defaultBuild('nell',4),attack:24},orrin=defaultBuild('orrin',2);
  const s=decodeCharacterSettings(JSON.stringify({version:1,characters:{nell,orrin}}));
  expect(s.version).toBe(2);expect(s.characters.nell).toEqual(nell);expect(s.characters.orrin).toEqual(orrin);
  expect(s.characters.esme).toEqual(defaultBuild('esme'));expect(s.party).toEqual(['nell','orrin']);
  s.party=['esme','celia','petra'];expect(decodeCharacterSettings(JSON.stringify(s))).toEqual(s);
  for(const party of [[],['nell','nell'],['nell','orrin','esme','celia'],['missing'],null]){
    expect(()=>decodeCharacterSettings(JSON.stringify({...s,party}))).toThrow();
  }
});
it('migrates old equipment without losing copies or assigning gear to newcomers',()=>{
  const old={version:1,bag:{'work-coat':1,'brass-reflector':0},characters:{nell:{fitting:'brass-reflector',coat:'work-coat'},orrin:{fitting:null,coat:null}}};
  const i=decodeInventory(JSON.stringify(old));
  expect(i.version).toBe(2);expect(i.bag).toEqual(old.bag);expect(i.characters.nell).toEqual(old.characters.nell);
  expect(i.characters.esme).toEqual({fitting:null,coat:null});expect(decodeInventory(JSON.stringify(i))).toEqual(i);
});
it('fits new tools to their owner and shares three coats without sharing their bonuses',()=>{
  const i=newInventory();receiveItem(i,'courier-sight');receiveItem(i,'medic-clasp');receiveItem(i,'saber-hilt');receiveItem(i,'work-coat',3);
  for(const id of ['esme','celia','petra'] as const)expect(equipItem(i,id,'work-coat')).toBe(true);
  expect(equipItem(i,'celia','courier-sight')).toBe(false);expect(equipItem(i,'esme','courier-sight')).toBe(true);
  expect(equipItem(i,'celia','medic-clasp')).toBe(true);expect(equipItem(i,'petra','saber-hilt')).toBe(true);
  expect(equipmentBonuses(i)).toMatchObject({esme:{attack:3,armor:1,speed:1},celia:{attack:0,armor:2,speed:1},petra:{attack:3,armor:2,speed:0},nell:{attack:0,armor:0,speed:0}});
});
it('creates any selected trio on separate spawn hexes and rejects invalid parties in the engine',()=>{
  const {b}=trio();expect(b.units.filter(u=>u.side==='party').map(u=>u.id)).toEqual(['esme','celia','petra']);
  expect(new Set(b.units.map(u=>key(u.hex))).size).toBe(b.units.length);expect(active(b)?.id).toBe('celia');
  expect(b.units[0]).toMatchObject({name:'Esme',role:'Courier',speed:9,movement:4});expect(b.units[2].armor).toBe(1);
  const s=newCharacterSettings(),profiles=characterProfiles(s),gear=equipmentBonuses(newInventory());
  for(const party of [[],['nell','nell'],[...COMPANION_IDS]])expect(()=>createBattle('workshop',newGame(),gear,profiles,party as typeof s.party)).toThrow();
  const campaign=newGame();recruitOrrin(campaign);expect(createBattle('workshop',campaign).units.filter(u=>u.side==='party').map(u=>u.id)).toEqual(['nell','orrin']);
});
it('makes each companion’s level-five skill usable only after its level unlock',()=>{
  for(const [hero,ability] of [['esme','volley'],['celia','sanctuary'],['petra','crush']] as const){
    for(const level of [1,5]){
      const {b,enemy}=trio(level),u=b.units.find(u=>u.id===hero)!;
      b.queue=[u.id,...b.queue.filter(id=>id!==u.id)];u.hex=offset(4,3);enemy.hex=offset(5,3);
      const aim=ability==='sanctuary'?u.hex:enemy.hex,focus=u.focus,hp=enemy.hp;
      expect(cast(b,u,ability,aim)).toBe(level===5);
      if(level===1){expect(u.focus).toBe(focus);expect(enemy.hp).toBe(hp);}
      else if(ability==='sanctuary')expect(u.guard).toBe(8);
      else expect(enemy.hp).toBeLessThan(hp);
    }
  }
});
it('Rally restores the previewed focus, pays its cost and refuses self, enemies or full focus',()=>{
  const {b,celia,esme,enemy,petra}=trio();b.queue=[celia.id,petra.id,esme.id,enemy.id];esme.focus=5;
  expect(legalAim(b,celia,'rally',celia.hex)).toBe(false);expect(legalAim(b,celia,'rally',enemy.hex)).toBe(false);
  expect(damage(celia,esme,'rally')).toBe(1);expect(cast(b,celia,'rally',esme.hex)).toBe(true);
  expect(esme.focus).toBe(6);expect(celia.focus).toBe(3);
  b.queue=[celia.id,petra.id,esme.id,enemy.id];expect(legalAim(b,celia,'rally',esme.hex)).toBe(false);
});
it('Sanctuary protects allies around an empty center without replacing a stronger barrier',()=>{
  const {b,celia,esme,petra,enemy}=trio(),center=offset(5,3);
  celia.hex={q:center.q-1,r:center.r};esme.hex={q:center.q+1,r:center.r};petra.hex={q:center.q,r:center.r+1};enemy.hex={q:center.q,r:center.r-1};
  esme.guard=2;petra.guard=14;
  expect(targets(b,celia,'sanctuary',center).map(u=>u.id)).toEqual(['esme','celia','petra']);
  expect(cast(b,celia,'sanctuary',center)).toBe(true);
  expect(celia.guard).toBe(8);expect(esme.guard).toBe(8);expect(petra.guard).toBe(14);expect(enemy.guard).toBeUndefined();
});
it('Shield bash pushes an adjacent survivor without a retaliation',()=>{
  const {b,petra,enemy}=trio();b.queue=[petra.id,enemy.id,'esme','celia'];petra.hex=offset(5,3);enemy.hex=offset(6,3);
  const hp=petra.hp,hit=damage(petra,enemy,'bash');enemy.hp=enemy.maxHp=100;
  expect(cast(b,petra,'bash',enemy.hex)).toBe(true);expect(enemy.hex).toEqual(offset(7,3));expect(enemy.hp).toBe(100-hit);expect(petra.hp).toBe(hp);
});
it('Saber sweep hits neighboring allies and enemies while excluding Petra',()=>{
  const {b,petra,esme,enemy}=trio();b.queue=[petra.id,enemy.id,'esme','celia'];petra.hex=offset(5,3);enemy.hex=offset(6,3);esme.hex=offset(4,3);
  const hp=petra.hp,allyHp=esme.hp,hit=damage(petra,esme,'sweep');
  expect(targets(b,petra,'sweep',petra.hex).map(u=>u.id)).toEqual(['esme',enemy.id]);
  expect(cast(b,petra,'sweep',petra.hex)).toBe(true);expect(petra.hp).toBe(hp);expect(esme.hp).toBe(allyHp-hit);
});
