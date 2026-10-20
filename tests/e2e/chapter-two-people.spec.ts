import { expect, test } from '@playwright/test';
import { CIVILIAN_SPRITES } from '../../src/content/civilians';
import { MAPS, visiblePeople } from '../../src/content/maps';
import { coastCheckpoint } from '../support/progress';
import { capture, clickWorld, inspect, nativeActor } from './controls';
import { importSave } from './navigation';

for(const [device,viewport,dpr] of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]] as const){
  test.describe(`silent Chapter Two people on ${device}`,()=>{
    test.use({viewport,deviceScaleFactor:dpr});
    test('populate the world and cutscenes without dialogue, then board with story progress',async({page})=>{
      const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
      await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');await page.emulateMedia({reducedMotion:'reduce'});
      await page.getByRole('button',{name:'Begin Chapter Two (canonical)',exact:true}).click();
      await expect.poll(async()=>(await inspect(page)).cinematic).toBe('two-coast');
      expect((await inspect(page)).people.map(p=>p.id)).toContain('waiting-family');
      await page.getByRole('button',{name:'Skip scene',exact:true}).click();

      const coast=coastCheckpoint('coastSeen');coast.location={map:'coast',x:28,y:27};await importSave(page,coast);
      await nativeActor(page,'civilian-family',{x:32,y:27});await nativeActor(page,'civilian-traveler',{x:22,y:29});
      await capture(page,`people-coast-${device}`);
      // Clicking a background person is ordinary navigation, never a talk target.
      await clickWorld(page,32,27);
      await expect.poll(async()=>{const s=await inspect(page);return !s.moving&&s.state.location.x===32&&s.state.location.y===27;}).toBe(true);
      await expect(page.locator('.dialogue')).toHaveCount(0);
      expect((await inspect(page)).state.flags).toEqual(coast.flags);

      for(const [flag,map,x,y] of [
        ['prisonersFreed','coast',27,18],['wardSeen','infirmary',31,24],
        ['settlementSeen','cinderbank',21,24],['coastCollectorWon','cinderbank',32,20],
        ['evacuationReady','cinderbank',32,20],
      ] as const){
        const saved=coastCheckpoint(flag);saved.location={map,x,y};await importSave(page,saved);
        const snapshot=await inspect(page),expected=visiblePeople(MAPS[map],saved);
        expect(snapshot.people.map(p=>p.id).sort()).toEqual(expected.map(p=>p.id).sort());
        for(const person of snapshot.people){expect(CIVILIAN_SPRITES).toContain(person.texture);expect(person.depth).toBe(person.y);}
        expect(snapshot.state.flags).toEqual(saved.flags);
        await expect(page.locator('.dialogue')).toHaveCount(0);
        if(flag==='wardSeen')await nativeActor(page,'civilian-patient',{x:25,y:20});
        if(flag==='settlementSeen')await nativeActor(page,'civilian-family',{x:19,y:21});
        if(flag==='coastCollectorWon')await nativeActor(page,'civilian-family',{x:30,y:16});
        await capture(page,`people-${flag}-${device}`);
      }
      await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();
      await expect.poll(async()=>(await inspect(page)).state.flags.evacuationReady).toBe(true);
      expect((await inspect(page)).people).toEqual([]);
      await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
    });
  });
}
