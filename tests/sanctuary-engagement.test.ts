import {expect,it} from 'vitest';
import {createBattle,enemyTurn} from '../src/rules/combat';
import {characterProfiles,defaultBuild,newCharacterSettings} from '../src/rules/characters';
import {newGame} from '../src/rules/state';

it('lets the sanctuary guardian attack a party holding its starting ground on its first turn',()=>{
 const settings=newCharacterSettings();settings.party=['nell','celia','petra'];
 for(const id of settings.party)settings.characters[id]=defaultBuild(id,8);
 const b=createBattle('sanctuary-warden',newGame(),undefined,characterProfiles(settings),settings.party);
 const guardian=b.units.find(u=>u.kind==='guardian')!,heroes=b.units.filter(u=>u.side==='party');
 const hp=heroes.map(u=>u.hp);b.queue=[guardian.id,...b.queue.filter(id=>id!==guardian.id)];
 expect(enemyTurn(b)).toBe('steam');
 expect(heroes.some((u,i)=>u.hp<hp[i])).toBe(true);
});
