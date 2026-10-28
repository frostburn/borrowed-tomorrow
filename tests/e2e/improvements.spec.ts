import {expect,test,type Page} from '@playwright/test';
import {chapterFiveFinaleStart,chapterSixCapitalStart,chapterSixStart} from '../../src/dev/canonical-saves';
import {jungleCheckpoint} from '../support/jungle';
import {approach,importSave} from './navigation';
import {capture,dialogue,inspect} from './controls';

async function choose(page:Page,label:string){
 const next=page.locator('.dialogue-actions').getByRole('button',{name:/Next$/});
 for(let n=0;n<8&&await next.count();n++)await next.click();
 await page.locator('.dialogue-actions').getByRole('button',{name:label,exact:true}).click();
}
for(const [device,viewport,deviceScaleFactor]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const){
 test.describe(`permanent improvements on ${device}`,()=>{
  test.use({viewport,deviceScaleFactor});
  test('airship confirms training, restores its larger capacity, and reloads the purchase',async({page})=>{
   const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
   await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
   const s=chapterFiveFinaleStart();s.coins=2000;s.party.find(h=>h.id==='orrin')!.focus=0;
   await importSave(page,s);await approach(page,'ship-supply');await choose(page,'Training · permanent improvements');
   await choose(page,'Train Orrin');await choose(page,'Focus training · 450 marks');
   await expect(page.locator('.dialogue')).toContainText('Max focus 6 → 7');await expect(page.locator('.dialogue')).toContainText('2000 → 1550 marks');
   await capture(page,`training-confirm-${device}`);expect((await inspect(page)).state.coins).toBe(2000);
   await choose(page,'Cancel improvement');await choose(page,'Focus training · 450 marks');await choose(page,'Confirm · 450 marks');
   expect((await inspect(page)).state.coins).toBe(1550);expect((await inspect(page)).state.party.find(h=>h.id==='orrin')!.focus).toBe(0);
   // Reveal the last card and inspect its disabled completed choice.
   const next=page.locator('.dialogue-actions').getByRole('button',{name:/Next$/});while(await next.count())await next.click();
   await expect(page.getByRole('button',{name:'Focus training · Completed',exact:true})).toBeDisabled();
   await choose(page,'Choose another character');await expect(page.getByRole('button',{name:'Train Orrin',exact:true})).toBeEnabled();
   await choose(page,'Train Orrin');await choose(page,'Endurance training · 300 marks');await choose(page,'Confirm · 300 marks');
   await choose(page,'Choose another character');await expect(page.getByRole('button',{name:'Train Orrin',exact:true})).toBeDisabled();
   await capture(page,`training-completed-${device}`);await choose(page,'Leave training');await capture(page,`training-marker-${device}`);
   await approach(page,'ship-supply');await choose(page,'Rest · restore everyone’s HP and focus');
   expect((await inspect(page)).state.party.find(h=>h.id==='orrin')!.focus).toBe(7);
   await page.getByRole('button',{name:'Equipment',exact:true}).click();await page.getByRole('group',{name:'Character',exact:true}).getByRole('button',{name:'Orrin',exact:true}).click();
   await expect(page.getByRole('dialog')).toContainText('Focus 7 / 7');await expect(page.getByRole('region',{name:'Permanent improvements'})).toContainText('Focus training');
   await capture(page,`training-inventory-${device}`);await page.getByRole('button',{name:'Close',exact:true}).click();
   await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();
   await expect.poll(async()=>(await inspect(page)).state.flags['improved-focus-orrin']).toBe(true);expect((await inspect(page)).state.coins).toBe(1250);expect(errors).toEqual([]);
  });
  test('specialists expose local offers, the jungle follows treatment, and ill Nell cannot train',async({page})=>{
   await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
   const s=chapterFiveFinaleStart();s.coins=500;s.location={map:'hammerplain',x:35,y:26};
   await importSave(page,s);await approach(page,'hammer-hester-after');await choose(page,'Counterbalanced lance · 500 marks');await choose(page,'Confirm · 500 marks');await choose(page,'Leave');
   expect((await inspect(page)).state.coins).toBe(0);await page.getByRole('button',{name:'Equipment',exact:true}).click();await page.getByRole('group',{name:'Character',exact:true}).getByRole('button',{name:'Orrin',exact:true}).click();
   await expect(page.getByRole('dialog')).toContainText('Move 3');await capture(page,`counterbalance-${device}`);await page.getByRole('button',{name:'Close',exact:true}).click();
   const ill=chapterSixStart();ill.flags.capitalSealed=true;ill.flags.sixRoutesKnown=true;ill.flags.jungleLeadKnown=true;
   await importSave(page,ill);await approach(page,'six-supplies');await choose(page,'Training · permanent improvements');await expect(page.getByRole('button',{name:'Train Nell',exact:true})).toBeDisabled();await choose(page,'Leave training');
   const cured=jungleCheckpoint('riverRestSeen');cured.location={map:'riverhaven',x:28,y:30};cured.coins=450;
   await importSave(page,cured);await dialogue(page);await approach(page,'river-tavi');await choose(page,'River courier training · 450 marks');await choose(page,'Confirm · 450 marks');await choose(page,'Leave');
   expect((await inspect(page)).state.flags['improved-kit-footing']).toBe(true);expect((await inspect(page)).state.flags.desertSeen).toBeFalsy();
   const capital=chapterSixCapitalStart(true);capital.coins=400;await importSave(page,capital);await dialogue(page);await approach(page,'capital-crew');
   await choose(page,'Reinforce Nell’s lantern · 400 marks');await choose(page,'Reinforced lantern housing · 400 marks');await choose(page,'Confirm · 400 marks');
   expect((await inspect(page)).state.flags['improved-nell-housing']).toBe(true);await capture(page,`lantern-housing-${device}`);
  });
 });
}
