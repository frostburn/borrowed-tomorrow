import { expect,test } from '@playwright/test';
import { anchorCheckpoint } from '../support/anchors';
import { maxHp,type GameState } from '../../src/rules/state';
import { importSave,approach } from './navigation';
import { capture,clickWorld,inspect } from './controls';

// Wall-clock play time continues while the player walks between controls.
const progress=({playSeconds:_,...state}:GameState)=>state;

for(const [device,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]as const){
 test.describe(`Hammerplain preparation on ${device}`,()=>{
  test.use({viewport,deviceScaleFactor:1.25});
  test('boards from an older dock save and rests on the gantry before confronting the carrier',async({page})=>{
   const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
   await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
   const old=anchorCheckpoint('hammerplainSeen');old.location={map:'hammerplain',x:8,y:30};old.party[1].hp=2;old.party[1].focus=1;
   await importSave(page,old);const dock=(await inspect(page)).state;
   expect(dock.location).not.toEqual(old.location);
   expect(progress({...dock,location:old.location})).toEqual(progress(old));
   await capture(page,`docked-survey-ship-${device}`);
   // Click the visible middle of the gangway, even when its far-end marker is offscreen.
   await clickWorld(page,13,30);await expect.poll(async()=>(await inspect(page)).state.location.map).toBe('airship');
   await approach(page,'ship-chart');
   await page.getByRole('button',{name:'Hammerplain · casting works',exact:true}).click();
   await expect.poll(async()=>(await inspect(page)).state.location.map).toBe('hammerplain');
   const returned=(await inspect(page)).state;
   expect(progress({...returned,location:old.location})).toEqual(progress(old));

   const hurt=anchorCheckpoint('forgeGantrySeen');hurt.activeParty=['nell','petra','celia'];
   for(const p of hurt.party){p.hp=1;p.focus=0;}
   await importSave(page,hurt);await clickWorld(page,16,28);
   await expect(page.getByRole('button',{name:'Rest · restore everyone’s HP and focus',exact:true})).toBeVisible();
   await capture(page,`gantry-rest-bench-${device}`);
   await page.getByRole('button',{name:'Rest · restore everyone’s HP and focus',exact:true}).click();
   const rested=(await inspect(page)).state;
   expect(rested.party.map(p=>[p.hp,p.focus])).toEqual(rested.party.map(p=>[maxHp(p.id,rested),6]));
   expect(progress({...rested,party:hurt.party,location:hurt.location})).toEqual(progress(hurt));
   await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();
   await expect.poll(async()=>progress((await inspect(page)).state)).toEqual(progress(rested));
   await approach(page,'forge-carrier');
   await expect(page.locator('.dialogue')).toContainText('The metal behind its tracks will burn straight through your boots.');
   await expect(page.locator('.dialogue')).not.toContainText(/six damage|round end|hexes/i);
   await capture(page,`orrin-carrier-warning-${device}`);
   await page.getByRole('button',{name:'Hold off the furnace carrier',exact:true}).click();
   await expect.poll(async()=>(await inspect(page)).mode).toBe('battle');
   expect((await inspect(page)).battle!.encounter).toBe('hammer-carrier');
   expect(errors).toEqual([]);
  });
 });
}
