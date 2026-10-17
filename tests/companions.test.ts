import { expect, it } from 'vitest';
import { characterProfiles, COMPANION_IDS, decodeCharacterSettings, defaultBuild, newCharacterSettings, setPartyMember } from '../src/rules/characters';
import { active, cast, createBattle, damage, defend, enemyTurn, legalAim, move, movement, targets, tauntTarget, wait } from '../src/rules/combat';
import { offset, key, equal } from '../src/rules/hex';
import { decodeInventory, equipmentBonuses, equipItem, newInventory, receiveItem } from '../src/rules/inventory';
import { newGame, recruitOrrin } from '../src/rules/state';

function trio(level = 5) {
  const settings = newCharacterSettings(); settings.party = ['kit', 'celia', 'petra'];
  for(const id of settings.party)settings.characters[id]=defaultBuild(id,level);
  settings.characters.celia.speed=30;
  const b=createBattle('workshop',newGame(),equipmentBonuses(newInventory()),characterProfiles(settings),settings.party);
  b.obstacles.clear();
  return {b,kit:b.units[0],celia:b.units[1],petra:b.units[2],enemy:b.units[3]};
}

it('keeps one to three distinct active companions and preserves reserve builds',()=>{
  const s=newCharacterSettings();s.characters.kit.attack=25;
  expect(setPartyMember(s,'kit',true)).toBe(true);
  const full=structuredClone(s);expect(setPartyMember(s,'celia',true)).toBe(false);expect(s).toEqual(full);
  expect(setPartyMember(s,'kit',true)).toBe(false);
  expect(setPartyMember(s,'nell',false)).toBe(true);expect(setPartyMember(s,'orrin',false)).toBe(true);
  expect(setPartyMember(s,'kit',false)).toBe(false);expect(s.party).toEqual(['kit']);expect(s.characters.kit.attack).toBe(25);
});
it('migrates two-character settings and round-trips the expanded roster and party',()=>{
  const nell={...defaultBuild('nell',4),attack:24},orrin=defaultBuild('orrin',2);
  const s=decodeCharacterSettings(JSON.stringify({version:1,characters:{nell,orrin}}));
  expect(s.version).toBe(2);expect(s.characters.nell).toEqual(nell);expect(s.characters.orrin).toEqual(orrin);
  expect(s.characters.kit).toEqual(defaultBuild('kit'));expect(s.party).toEqual(['nell','orrin']);
  s.party=['kit','celia','petra'];expect(decodeCharacterSettings(JSON.stringify(s))).toEqual(s);
  for(const party of [[],['nell','nell'],['nell','orrin','kit','celia'],['missing'],null]){
    expect(()=>decodeCharacterSettings(JSON.stringify({...s,party}))).toThrow();
  }
});
it('migrates old equipment without losing copies or assigning gear to newcomers',()=>{
  const old={version:1,bag:{'work-coat':1,'brass-reflector':0},characters:{nell:{fitting:'brass-reflector',coat:'work-coat'},orrin:{fitting:null,coat:null}}};
  const i=decodeInventory(JSON.stringify(old));
  expect(i.version).toBe(2);expect(i.bag).toEqual(old.bag);expect(i.characters.nell).toEqual(old.characters.nell);
  expect(i.characters.kit).toEqual({fitting:null,coat:null});expect(decodeInventory(JSON.stringify(i))).toEqual(i);
});
it('preserves the replaced courier’s build and lineup while rejecting duplicate aliases',()=>{
  const current=newCharacterSettings();current.characters.kit={...defaultBuild('kit',5),attack:29};current.party=['kit','celia','petra'];
  const {kit,...others}=current.characters;
  const legacy={...current,characters:{...others,esme:kit},party:['esme','celia','petra']};
  expect(decodeCharacterSettings(JSON.stringify(legacy))).toEqual(current);
  expect(()=>decodeCharacterSettings(JSON.stringify({...legacy,party:['esme','kit']}))).toThrow();
});
it('transfers the replaced courier’s equipped items without losing or duplicating copies',()=>{
  const current=newInventory();receiveItem(current,'courier-sight');receiveItem(current,'work-coat',3);
  equipItem(current,'kit','courier-sight');equipItem(current,'kit','work-coat');equipItem(current,'petra','work-coat');
  const {kit,...others}=current.characters;
  const migrated=decodeInventory(JSON.stringify({...current,characters:{...others,esme:kit}}));
  expect(migrated).toEqual(current);expect(equipmentBonuses(migrated).kit).toEqual({attack:3,armor:1,speed:1});
  expect(decodeInventory(JSON.stringify(migrated))).toEqual(current);
});
it('fits new tools to their owner and shares three coats without sharing their bonuses',()=>{
  const i=newInventory();receiveItem(i,'courier-sight');receiveItem(i,'medic-clasp');receiveItem(i,'saber-hilt');receiveItem(i,'work-coat',3);
  for(const id of ['kit','celia','petra'] as const)expect(equipItem(i,id,'work-coat')).toBe(true);
  expect(equipItem(i,'celia','courier-sight')).toBe(false);expect(equipItem(i,'kit','courier-sight')).toBe(true);
  expect(equipItem(i,'celia','medic-clasp')).toBe(true);expect(equipItem(i,'petra','saber-hilt')).toBe(true);
  expect(equipmentBonuses(i)).toMatchObject({kit:{attack:3,armor:1,speed:1},celia:{attack:0,armor:2,speed:1},petra:{attack:3,armor:2,speed:0},nell:{attack:0,armor:0,speed:0}});
});
it('creates any selected trio on separate spawn hexes and rejects invalid parties in the engine',()=>{
  const {b}=trio();expect(b.units.filter(u=>u.side==='party').map(u=>u.id)).toEqual(['kit','celia','petra']);
  expect(new Set(b.units.map(u=>key(u.hex))).size).toBe(b.units.length);expect(active(b)?.id).toBe('celia');
  expect(b.units[0]).toMatchObject({name:'Kit',role:'Courier',speed:9,movement:4});expect(b.units[2].armor).toBe(1);
  const s=newCharacterSettings(),profiles=characterProfiles(s),gear=equipmentBonuses(newInventory());
  for(const party of [[],['nell','nell'],[...COMPANION_IDS]])expect(()=>createBattle('workshop',newGame(),gear,profiles,party as typeof s.party)).toThrow();
  const campaign=newGame();recruitOrrin(campaign);expect(createBattle('workshop',campaign).units.filter(u=>u.side==='party').map(u=>u.id)).toEqual(['nell','orrin']);
});
it('makes each companion’s level-five skill usable only after its level unlock',()=>{
  for(const [hero,ability] of [['kit','volley'],['celia','sanctuary'],['petra','crush']] as const){
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
  const {b,celia,kit,enemy,petra}=trio();b.queue=[celia.id,petra.id,kit.id,enemy.id];kit.focus=5;
  expect(legalAim(b,celia,'rally',celia.hex)).toBe(false);expect(legalAim(b,celia,'rally',enemy.hex)).toBe(false);
  expect(damage(celia,kit,'rally')).toBe(1);expect(cast(b,celia,'rally',kit.hex)).toBe(true);
  expect(kit.focus).toBe(6);expect(celia.focus).toBe(3);
  b.queue=[celia.id,petra.id,kit.id,enemy.id];expect(legalAim(b,celia,'rally',kit.hex)).toBe(false);
});
it('Sanctuary protects allies around an empty center without replacing a stronger barrier',()=>{
  const {b,celia,kit,petra,enemy}=trio(),center=offset(5,3);
  celia.hex={q:center.q-1,r:center.r};kit.hex={q:center.q+1,r:center.r};petra.hex={q:center.q,r:center.r+1};enemy.hex={q:center.q,r:center.r-1};
  kit.guard=2;petra.guard=14;
  expect(targets(b,celia,'sanctuary',center).map(u=>u.id)).toEqual(['kit','celia','petra']);
  expect(cast(b,celia,'sanctuary',center)).toBe(true);
  expect(celia.guard).toBe(8);expect(kit.guard).toBe(8);expect(petra.guard).toBe(14);expect(enemy.guard).toBeUndefined();
});
it('Celia can use Celestial bolt at level one, ignoring distance and cover but respecting focus and enemy targeting',()=>{
  const {b,celia,kit,enemy}=trio(1);celia.hex=offset(4,3);enemy.hex=offset(6,3);
  expect(legalAim(b,celia,'celestialbolt',kit.hex)).toBe(false);
  b.obstacles.add(key(offset(5,3)));expect(legalAim(b,celia,'celestialbolt',enemy.hex)).toBe(true);
  enemy.hex=offset(10,3);b.obstacles.add(key(enemy.hex));expect(legalAim(b,celia,'celestialbolt',enemy.hex)).toBe(true);
  expect(legalAim(b,celia,'celestialbolt',offset(9,6))).toBe(false);expect(legalAim(b,celia,'celestialbolt',{q:99,r:99})).toBe(false);
  celia.focus=0;expect(cast(b,celia,'celestialbolt',enemy.hex)).toBe(false);celia.focus=3;
  const hp=enemy.hp,hit=damage(celia,enemy,'celestialbolt');
  expect(hit).toBe(5);expect(cast(b,celia,'celestialbolt',enemy.hex)).toBe(true);
  expect(enemy.hp).toBe(hp-hit);expect(celia.focus).toBe(2);expect(active(b)?.id).not.toBe(celia.id);
});
it('Shield bash pushes without retaliation and preserves movement and the main action',()=>{
  const {b,petra,enemy}=trio();b.queue=[petra.id,enemy.id,'kit','celia'];petra.hex=offset(5,3);enemy.hex=offset(6,3);
  const hp=petra.hp,queue=[...b.queue];enemy.hp=enemy.maxHp=100;enemy.guard=12;petra.dazzledAttacks=3;petra.bonus=100;
  expect(damage(petra,enemy,'bash')).toBe(0);
  expect(cast(b,petra,'bash',enemy.hex)).toBe(true);expect(enemy.hex).toEqual(offset(7,3));expect(enemy.hp).toBe(100);expect(enemy.guard).toBe(12);expect(petra.hp).toBe(hp);expect(petra.dazzledAttacks).toBe(3);
  expect(b.queue).toEqual(queue);expect(petra).toMatchObject({bonusUsed:true,moved:false,focus:5});
  petra.bonus=11;
  expect(move(b,petra,offset(6,3))).not.toBeNull();
  const after=enemy.hp;expect(cast(b,petra,'crush',enemy.hex)).toBe(true);expect(enemy.hp).toBeLessThan(after);
  expect(petra.focus).toBe(2);expect(active(b)?.id).toBe(enemy.id);
});
it('Petra moves three hexes, then bashes once even if knockback is blocked, then takes her main action',()=>{
  const {b,petra,enemy}=trio();b.queue=[petra.id,enemy.id,'kit','celia'];enemy.hex=offset(5,5);enemy.hp=enemy.maxHp=100;
  expect(movement(b,petra).get(key(offset(4,5)))?.cost).toBe(3);expect(movement(b,petra).has(key(offset(5,5)))).toBe(false);
  expect(move(b,petra,offset(4,5))).not.toBeNull();b.obstacles.add(key(offset(6,5)));
  expect(cast(b,petra,'bash',enemy.hex)).toBe(true);expect(enemy.hex).toEqual(offset(5,5));expect(petra.moved).toBe(true);
  const after=structuredClone(b);expect(cast(b,petra,'bash',enemy.hex)).toBe(false);expect(wait(b)).toBe(false);expect(b).toEqual(after);
  expect(cast(b,petra,'strike',enemy.hex)).toBe(true);expect(active(b)?.id).toBe(enemy.id);
});
it('waiting before a bash is allowed and its use refreshes only on Petra’s next turn',()=>{
  const {b,petra,enemy}=trio();b.units=[petra,enemy];b.queue=[petra.id,enemy.id];petra.speed=30;
  petra.hex=offset(5,3);enemy.hex=offset(6,3);enemy.hp=enemy.maxHp=100;b.obstacles.add(key(offset(7,3)));
  expect(wait(b)).toBe(true);expect(defend(b)).toBe(true);expect(active(b)?.id).toBe(petra.id);
  expect(cast(b,petra,'bash',enemy.hex)).toBe(true);expect(wait(b)).toBe(false);expect(defend(b)).toBe(true);
  expect(b.round).toBe(2);expect(active(b)?.id).toBe(petra.id);expect(petra.bonusUsed).toBe(false);
  expect(cast(b,petra,'bash',enemy.hex)).toBe(true);expect(cast(b,petra,'bash',enemy.hex)).toBe(false);
});
it('invalid bashes spend nothing and a bash cannot kill even a one-HP enemy',()=>{
  const {b,petra,enemy}=trio();b.units=[petra,enemy];b.queue=[petra.id,enemy.id];petra.hex=offset(5,3);enemy.hex=offset(6,3);
  const focus=petra.focus;expect(cast(b,petra,'bash',petra.hex)).toBe(false);expect(petra.focus).toBe(focus);expect(petra.bonusUsed).toBeFalsy();
  petra.focus=0;expect(cast(b,petra,'bash',enemy.hex)).toBe(false);expect(petra.bonusUsed).toBeFalsy();petra.focus=focus;
  enemy.hp=1;expect(cast(b,petra,'bash',enemy.hex)).toBe(true);expect(b.result).toBeNull();expect(enemy.hp).toBe(1);
  expect(petra.focus).toBe(focus-1);expect(move(b,petra,offset(6,3))).not.toBeNull();expect(cast(b,petra,'strike',enemy.hex)).toBe(true);expect(b.result).toBe('victory');
});
it('Saber sweep hits neighboring allies and enemies while excluding Petra',()=>{
  const {b,petra,kit,enemy}=trio();b.queue=[petra.id,enemy.id,'kit','celia'];petra.hex=offset(5,3);enemy.hex=offset(6,3);kit.hex=offset(4,3);
  const hp=petra.hp,allyHp=kit.hp,hit=damage(petra,kit,'sweep');
  expect(targets(b,petra,'sweep',petra.hex).map(u=>u.id)).toEqual(['kit',enemy.id]);
  expect(cast(b,petra,'sweep',petra.hex)).toBe(true);expect(petra.hp).toBe(hp);expect(kit.hp).toBe(allyHp-hit);
});

it('Taunt affects every living enemy across the board and consumes the main action',()=>{
  const {b,petra,celia}=trio();b.queue=[petra.id,...b.queue.filter(id=>id!==petra.id)];
  const enemies=b.units.filter(u=>u.side==='enemy'),hp=b.units.map(u=>u.hp);
  b.obstacles.add(key(petra.hex));
  expect(legalAim(b,petra,'taunt',celia.hex)).toBe(false);
  expect(targets(b,petra,'taunt',petra.hex)).toEqual(enemies);
  expect(cast(b,petra,'taunt',petra.hex)).toBe(true);
  expect(enemies.every(u=>tauntTarget(b,u)===petra)).toBe(true);expect(b.units.map(u=>u.hp)).toEqual(hp);
  expect(petra.focus).toBe(4);expect(active(b)?.id).not.toBe(petra.id);
});
it('taunted melee, ranged, line and blast enemies attack Petra despite a vulnerable alternative',()=>{
  for(const abilities of [['strike'],['peck','strike'],['steam'],['flare']] as const){
    const {b,petra,enemy,celia,kit}=trio();b.units=[petra,enemy,celia,kit];b.queue=[petra.id,enemy.id,celia.id,kit.id];
    petra.hex=offset(5,3);enemy.hex=offset(7,3);celia.hex=offset(7,4);celia.hp=1;kit.hex=offset(1,1);
    enemy.abilities=[...abilities];const hp=petra.hp;
    expect(cast(b,petra,'taunt',petra.hex)).toBe(true);
    if(abilities[0]!=='steam')expect(legalAim(b,enemy,abilities[0],celia.hex)).toBe(false);
    expect(enemyTurn(b)).not.toBe('defend');expect(petra.hp).toBeLessThan(hp);
    if(abilities[0]==='strike'||abilities[0]==='peck')expect(celia.hp).toBe(1);
  }
});
it('a taunted enemy approaches Petra instead of attacking an adjacent ally when she is out of reach',()=>{
  const {b,petra,enemy,celia}=trio();b.units=[petra,enemy,celia];b.queue=[petra.id,enemy.id,celia.id];
  petra.hex=offset(1,3);enemy.hex=offset(9,3);celia.hex=offset(8,3);enemy.movement=1;celia.hp=1;
  expect(cast(b,petra,'taunt',petra.hex)).toBe(true);const before={...enemy.hex};
  expect(enemyTurn(b)).toBe('defend');expect(equal(enemy.hex,before)).toBe(false);expect(celia.hp).toBe(1);
});
it('Taunt expires at Petra’s next turn and is unavailable below level two or without focus',()=>{
  for(const level of [1,2]){
    const {b,petra}=trio(level);petra.speed=31;b.queue=[petra.id,...b.units.filter(u=>u.id!==petra.id).map(u=>u.id)];
    petra.focus=1;expect(cast(b,petra,'taunt',petra.hex)).toBe(false);petra.focus=6;
    expect(cast(b,petra,'taunt',petra.hex)).toBe(level===2);
    if(level===1)continue;
    for(let i=0;i<b.units.length&&active(b)?.id!==petra.id;i++)expect(defend(b)).toBe(true);
    expect(active(b)?.id).toBe(petra.id);expect(b.units.every(u=>!u.tauntedBy)).toBe(true);
  }
});
it('Taunt prevents retaliation against other allies and releases enemies when Petra falls',()=>{
  const {b,petra,enemy,kit,celia}=trio();b.units=[petra,kit,enemy,celia];b.queue=[petra.id,kit.id,enemy.id,celia.id];
  petra.hex=offset(1,1);kit.hex=offset(5,3);enemy.hex=offset(6,3);celia.hex=offset(1,5);enemy.hp=100;
  expect(cast(b,petra,'taunt',petra.hex)).toBe(true);const hp=kit.hp;
  expect(cast(b,kit,'strike',enemy.hex)).toBe(true);expect(kit.hp).toBe(hp);
  petra.hp=0;kit.retaliated=true;expect(tauntTarget(b,enemy)).toBeUndefined();expect(enemyTurn(b)).toBe('strike');expect(kit.hp).toBeLessThan(hp);
});
