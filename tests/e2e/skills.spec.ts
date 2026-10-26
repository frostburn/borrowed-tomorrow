import {test,expect} from '@playwright/test';
import {checkpoint} from '../support/progress';
import {importSave,approach} from './navigation';
import {inspect,clickHex,capture} from './controls';
import {offset} from '../../src/rules/hex';
import {damage,type Unit} from '../../src/rules/combat';
import {newCharacterSettings,defaultBuild} from '../../src/rules/characters';

for(const [device,viewport,deviceScaleFactor]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const){
 test.describe(`skill choices ${device}`,()=>{
  test.use({viewport,deviceScaleFactor});
  test('a real level-up offers independent character choices and saves the selected rank',async({page})=>{
   const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await importSave(page,checkpoint('collectorConfronted'));
   await approach(page,'collector');await page.getByRole('button',{name:'Win battle',exact:true}).click();await expect(page.getByRole('heading',{name:'The line is clear',exact:true})).toBeVisible();await page.getByRole('button',{name:'Upgrade skills',exact:true}).click();
   const panel=page.getByRole('dialog',{name:'Character skills'});await expect(panel).toContainText('Character level 2');await expect(panel).toContainText('1 upgrade point');await expect(panel.getByRole('button',{name:'Learn Prism lance',exact:true})).toHaveCount(0);await expect(panel).not.toContainText('Celia');await expect(panel).not.toContainText('Kit');await expect(panel).not.toContainText('Petra');await expect(panel).toContainText('Orrin’s Steam lance');
   await panel.getByRole('button',{name:'Upgrade Lantern burst to 2',exact:true}).click();await expect(panel.getByRole('status')).toContainText('skill 2');await expect(panel.getByRole('button',{name:'Learn Mend',exact:true})).toBeDisabled();expect((await inspect(page)).state.skills.nell.burst).toBe(2);
   await panel.getByRole('button',{name:'Orrin · 1',exact:true}).click();await expect(panel).not.toContainText('Celia');await expect(panel).not.toContainText('Kit');await expect(panel).not.toContainText('Petra');await panel.getByRole('button',{name:'Learn Safety guard',exact:true}).click();expect((await inspect(page)).state.skills.orrin.guard).toBe(1);await capture(page,`skills-level-up-${device}`);
   await page.getByRole('button',{name:'Close',exact:true}).click();await page.getByRole('button',{name:'Continue the journey',exact:true}).click();await page.getByRole('button',{name:'Skip scene',exact:true}).click();await page.getByRole('button',{name:'Equipment',exact:true}).click();await page.getByRole('button',{name:'Skills',exact:true}).click();await expect(page.getByRole('dialog',{name:'Character skills'})).toContainText('Skill 2 / 3');
   await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).state.skills.nell.burst).toBe(2);expect((await inspect(page)).state.skills.orrin.guard).toBe(1);expect(errors).toEqual([]);await expect(page.locator('vite-error-overlay')).toHaveCount(0);
  });
  test('workshop ranks change the real Burst footprint and halve friendly damage at the final rank',async({page})=>{
   const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/?dev=workshop');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop');
   const input=page.getByRole('spinbutton',{name:'Nell level',exact:true});await input.fill('6');await input.press('Tab');await page.getByRole('button',{name:'Reset skill choices',exact:true}).click();
   for(const rank of [1,2,3]){
    if(rank>1)await page.getByRole('button',{name:`Upgrade Lantern burst to ${rank}`,exact:true}).click();
    await page.getByRole('navigation',{name:'Workshop panels'}).getByRole('button',{name:'Combat',exact:true}).click();await page.getByRole('button',{name:'Practice current workshop party',exact:true}).click();
    const b=(await inspect(page)).battle!,nell=b.units.find(u=>u.id==='nell')!,orrin=b.units.find(u=>u.id==='orrin')!;expect(nell.skills!.burst).toBe(rank);expect(nell.abilities).not.toContain('beacon');
    await page.getByRole('button',{name:/^3\s+Lantern burst$/}).click();await clickHex(page,rank===3?orrin.hex:offset(5,3));await expect(page.locator('#battle-hint')).toContainText(`Skill ${rank}`);await expect(page.getByRole('button',{name:'Confirm attack',exact:true})).toBeInViewport();await capture(page,`burst-rank-${rank}-${device}`);
    if(rank===3){const predicted=damage(nell as Unit,orrin as Unit,'burst');await expect(page.locator('#confirmation')).toContainText(`Orrin: −${predicted} HP`);await page.getByRole('button',{name:'Confirm attack',exact:true}).click();expect((await inspect(page)).battle!.units.find(u=>u.id==='orrin')!.hp).toBe(orrin.hp-predicted);}
    await expect.poll(async()=>(await inspect(page)).busy).toBe(false);await page.keyboard.press('Escape');if(rank<3)await page.getByRole('navigation',{name:'Workshop panels'}).getByRole('button',{name:'Character',exact:true}).click();
   }
   expect(errors).toEqual([]);await expect(page.locator('vite-error-overlay')).toHaveCount(0);
  });
  test('distant teammates animate and spend both actions without a positioning requirement',async({page})=>{
   const settings=newCharacterSettings();for(const id of settings.party)settings.characters[id]=defaultBuild(id,10);settings.characters.nell.movement=10;
   await page.addInitScript(s=>localStorage.setItem('borrowed-tomorrow:character-workshop:v3',JSON.stringify(s)),settings);await page.goto('/?dev=combat');await page.getByRole('button',{name:'Practice current workshop party',exact:true}).click();
   await page.getByRole('button',{name:/^1\s+Move$/}).click();await clickHex(page,offset(10,0));await page.getByRole('button',{name:/Confirm move/}).click();await expect.poll(async()=>(await inspect(page)).busy).toBe(false);
   await page.getByRole('button',{name:/Prism lance · Team/}).click();await clickHex(page,offset(7,3));await expect(page.locator('#confirmation')).toContainText('Nell + Orrin');await page.getByRole('button',{name:'Confirm attack',exact:true}).click();
   await expect.poll(async()=>(await inspect(page)).actors.filter(a=>['nell','orrin'].includes(a.hero)&&a.motion==='attack').length,{intervals:[20,30,50]}).toBe(2);await capture(page,`distant-team-${device}`);
   const b=(await inspect(page)).battle!;expect(b.queue).not.toContain('nell');expect(b.queue).not.toContain('orrin');expect(b.units.find(u=>u.id==='orrin')!.focus).toBe(3);
  });
 });
}
