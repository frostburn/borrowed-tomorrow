import {test,expect} from '@playwright/test';
import {checkpoint} from '../support/progress';
import {importSave,approach} from './navigation';
import {inspect,clickHex,capture} from './controls';
import {offset} from '../../src/rules/hex';
import {damage,type Unit} from '../../src/rules/combat';
import {newCharacterSettings,defaultBuild} from '../../src/rules/characters';
import {chapterFiveStart} from '../../src/dev/canonical-saves';

for(const [device,viewport,deviceScaleFactor]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const){
 test.describe(`skill choices ${device}`,()=>{
  test.use({viewport,deviceScaleFactor});
  test('canonical banked points explain the next level and only spendable points prompt an upgrade',async({page})=>{
   const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');
   await page.getByRole('button',{name:'Begin Chapter Five (canonical)',exact:true}).click();await page.getByRole('button',{name:'Skip scene',exact:true}).click();
   await expect(page.getByRole('button',{name:/^Upgrade skills/})).toHaveCount(0);
   await page.getByRole('button',{name:'Equipment',exact:true}).click();await page.getByRole('button',{name:'Skills',exact:true}).click();
   const panel=page.getByRole('dialog',{name:'Character skills'});
   await expect(panel.locator('.skill-summary')).toHaveText('1 banked pointNext upgrade available at character level 10.');
   await expect(panel.getByRole('button',{name:'Nell · 1 banked',exact:true})).toBeVisible();await capture(page,`skills-banked-${device}`);
   await page.getByRole('button',{name:'Close',exact:true}).click();
   // A valid partially allocated current-format save: one available upgrade plus a banked point.
   const s=chapterFiveStart();s.flags.airfieldSeen=true;s.skills.celia.celestialbolt=2;await importSave(page,s);
   await page.getByRole('button',{name:'Upgrade skills · 1',exact:true}).click();
   await expect(panel.locator('.skill-identity')).toContainText('Celia');await expect(panel.locator('.skill-summary')).toContainText('1 can be spent now');
   await panel.getByRole('button',{name:'Upgrade Celestial bolt to 3',exact:true}).click();
   await expect(panel.locator('.skill-summary')).toContainText('1 banked point');await expect(panel.locator('.skill-summary')).toContainText('character level 10');
   await page.getByRole('button',{name:'Close',exact:true}).click();await expect(page.getByRole('button',{name:/^Upgrade skills/})).toHaveCount(0);
   await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();
   await expect(page.getByRole('button',{name:'Equipment',exact:true})).toBeEnabled();await expect(page.getByRole('button',{name:/^Upgrade skills/})).toHaveCount(0);
   expect((await inspect(page)).state.skills.celia.celestialbolt).toBe(3);expect(errors).toEqual([]);await expect(page.locator('vite-error-overlay')).toHaveCount(0);
  });
  test('the canonical final refuge shows mastery without a useless upgrade prompt',async({page})=>{
   const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');
   await page.getByRole('button',{name:'Begin final refuge (canonical)',exact:true}).click();await page.getByRole('button',{name:'Skip scene',exact:true}).click();await expect(page.getByRole('button',{name:'Equipment',exact:true})).toBeEnabled();
   await expect(page.getByRole('button',{name:/^Upgrade skills/})).toHaveCount(0);
   await page.getByRole('button',{name:'Equipment',exact:true}).click();await page.getByRole('button',{name:'Skills',exact:true}).click();
   const panel=page.getByRole('dialog',{name:'Character skills'});
   await expect(panel.locator('.skill-summary')).toContainText('All skills mastered');
   await panel.getByRole('button',{name:'Celia · Mastered',exact:true}).click();await expect(panel.locator('.skill-summary')).toContainText('All skills mastered');
   await capture(page,`skills-mastered-${device}`);expect(errors).toEqual([]);await expect(page.locator('vite-error-overlay')).toHaveCount(0);
  });
  test('a real level-up offers independent character choices and saves the selected rank',async({page})=>{
   const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await importSave(page,checkpoint('collectorConfronted'));
   await approach(page,'collector');await page.getByRole('button',{name:'Win battle',exact:true}).click();await expect(page.getByRole('heading',{name:'The line is clear',exact:true})).toBeVisible();await page.getByRole('button',{name:'Upgrade skills',exact:true}).click();
   const panel=page.getByRole('dialog',{name:'Character skills'});await expect(panel).toContainText('Character level 2');await expect(panel).toContainText('1 upgrade point');await expect(panel.getByRole('button',{name:'Learn Prism lance',exact:true})).toHaveCount(0);await expect(panel).not.toContainText('Celia');await expect(panel).not.toContainText('Kit');await expect(panel).not.toContainText('Petra');await expect(panel).toContainText('Orrin’s Steam lance');
   await panel.getByRole('button',{name:'Upgrade Lantern burst to 2',exact:true}).click();await expect(panel.getByRole('status')).toContainText('skill 2');await expect(panel.getByRole('button',{name:'Learn Mend',exact:true})).toBeDisabled();expect((await inspect(page)).state.skills.nell.burst).toBe(2);await expect(page.locator('[data-victory-skills]')).toHaveCount(1);
   await panel.getByRole('button',{name:'Orrin · 1',exact:true}).click();await expect(panel).not.toContainText('Celia');await expect(panel).not.toContainText('Kit');await expect(panel).not.toContainText('Petra');await panel.getByRole('button',{name:'Learn Safety guard',exact:true}).click();expect((await inspect(page)).state.skills.orrin.guard).toBe(1);await capture(page,`skills-level-up-${device}`);
   await page.getByRole('button',{name:'Close',exact:true}).click();await expect(page.getByRole('button',{name:'Upgrade skills',exact:true})).toHaveCount(0);await expect(page.getByRole('button',{name:'Continue the journey',exact:true})).toBeFocused();await capture(page,`skills-points-spent-${device}`);await page.getByRole('button',{name:'Continue the journey',exact:true}).click();await page.getByRole('button',{name:'Skip scene',exact:true}).click();await page.getByRole('button',{name:'Equipment',exact:true}).click();await page.getByRole('button',{name:'Skills',exact:true}).click();await expect(page.getByRole('dialog',{name:'Character skills'})).toContainText('Skill 2 / 3');
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
   const b=(await inspect(page)).battle!;expect(b.queue).not.toContain('nell');expect(b.queue).toContain('orrin');expect(b.units.find(u=>u.id==='orrin')!.focus).toBe(3);
  });
 });
}

for(const [device,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]as const){
 test(`Kit spends both canonical loading-gate points on ${device}`,async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize(viewport);await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  await page.getByRole('button',{name:'Begin Chapter Two (canonical)',exact:true}).click();await page.getByRole('button',{name:'Skip scene',exact:true}).click();
  await approach(page,'kit-contact');await page.getByRole('button',{name:'Skip scene',exact:true}).click();await approach(page,'loading-gate');await page.getByRole('button',{name:'Breach the loading gate',exact:true}).click();
  await page.getByRole('button',{name:'Skip scene',exact:true}).click();await page.getByRole('button',{name:'Win battle',exact:true}).click();
  await page.getByRole('button',{name:'Upgrade skills',exact:true}).click();const skills=page.getByRole('dialog',{name:'Character skills'});
  await skills.getByRole('button',{name:'Kit · 2',exact:true}).click();await expect(skills).toContainText('Character level 3');
  await skills.getByRole('button',{name:'Learn Feint',exact:true}).click();await skills.getByRole('button',{name:'Upgrade Feint to 2',exact:true}).click();await expect(skills.getByRole('button',{name:'Kit · 0',exact:true})).toBeVisible();await capture(page,`kit-spent-points-${device}`);
  expect((await inspect(page)).state.skills.kit.feint).toBe(2);expect((await inspect(page)).state.skills.kit.pin).toBe(0);expect((await inspect(page)).state.skills.kit.ricochet).toBe(0);
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).state.skills.kit.feint).toBe(2);expect(errors).toEqual([]);
 });
}
