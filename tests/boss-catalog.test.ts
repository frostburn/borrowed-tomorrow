import {expect,it} from 'vitest';
import {BOSS_CHOICES,CAMPAIGN_BOSSES,createCampaignBoss,workshopBoss} from '../src/dev/boss-catalog';
import {ENCOUNTERS} from '../src/content/encounters';
import {BATTLE_MAPS} from '../src/content/battle-maps';
import {sceneAssets} from '../src/content/scene-art';
import {newCharacterSettings,defaultBuild,characterProfiles} from '../src/rules/characters';

it('lists every patterned campaign boss and the earlier named bosses under stable chapter selections',()=>{
 const covered=new Set([...CAMPAIGN_BOSSES.map(e=>e.encounter),'heart-feeds','heart-pressure','alban-flagship','winter-dragon','sun-serpent','imperial-vessel','lightbearer','benefactor-body','benefactor-sun','benefactor-heart']);
 for(const e of Object.values(ENCOUNTERS))if(e.boss)expect(covered.has(e.id),e.id).toBe(true);
 expect(new Set(BOSS_CHOICES.map(e=>e.id)).size).toBe(BOSS_CHOICES.length);
 for(const e of BOSS_CHOICES)expect(workshopBoss(e.id)).toBe(e.id);
 expect(workshopBoss('missing')).toBe('benefactor');expect(workshopBoss(null)).toBe('benefactor');
});
it('builds all thirteen additions from independent, reward-free campaign definitions',()=>{
 expect(CAMPAIGN_BOSSES).toHaveLength(13);
 for(const entry of CAMPAIGN_BOSSES){
  const source=structuredClone(ENCOUNTERS[entry.encounter]),{battle,encounter}=createCampaignBoss(entry.id);
  expect(encounter.id).toBe(source.id);expect(encounter.music).toBe(source.music);expect(encounter.boss).toBe(source.boss);
  expect(encounter.enemies).toEqual(source.enemies);expect(encounter.rocks).toEqual(source.rocks);expect(encounter.wardTracking).toBe(source.wardTracking);
  expect([encounter.xp,encounter.coins]).toEqual([0,0]);expect(encounter.item).toBeUndefined();expect(encounter.journal).toBeUndefined();expect(encounter.flag).toBe('devCampaignBoss');
  expect(battle.units.filter(u=>u.side==='party').map(u=>u.id)).toEqual(entry.party);
  expect(battle.units.filter(u=>u.side==='party').every(u=>u.level===entry.level)).toBe(true);
  expect(battle.units.filter(u=>u.side==='enemy')).toHaveLength(source.enemies.length);
  expect(sceneAssets(BATTLE_MAPS[source.id]).length).toBeGreaterThan(0);
  encounter.enemies[0].hp=1;encounter.rocks.push([0,0]);expect(ENCOUNTERS[source.id]).toEqual(source);
 }
});
it('accepts the workshop formation and profiles without replacing their builds',()=>{
 const settings=newCharacterSettings();settings.characters.celia=defaultBuild('celia',9);settings.characters.celia.movement=6;
 const {battle}=createCampaignBoss('furnace',characterProfiles(settings),undefined,['celia']);
 const party=battle.units.filter(u=>u.side==='party');expect(party).toHaveLength(1);expect(party[0]).toMatchObject({id:'celia',level:9,movement:6});
});
