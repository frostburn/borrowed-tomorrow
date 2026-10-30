import {test,expect} from '@playwright/test';
import {automaticSkillFlows} from './automatic-skills-flow';
import {inspect,clickHex,capture} from './controls';
import {offset} from '../../src/rules/hex';
import {damage,type Unit} from '../../src/rules/combat';
import {newCharacterSettings,defaultBuild} from '../../src/rules/characters';
automaticSkillFlows();
for(const [device,viewport,deviceScaleFactor]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const){
 test.describe(`automatic workshop skills ${device}`,()=>{
  test.use({viewport,deviceScaleFactor});
  test('changing level automatically changes the real Burst footprint and friendly damage',async({page})=>{
   const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/?dev=workshop');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop');
   for(const [rank,level]of [[1,1],[2,3],[3,10]]as const){
    const input=page.getByRole('spinbutton',{name:'Nell level',exact:true});await input.fill(String(level));await input.press('Tab');await expect(page.locator('[data-ability="burst"]')).toContainText(`Skill ${rank} / 3`);await expect(page.getByRole('button',{name:'Reset skill choices',exact:true})).toHaveCount(0);
    await page.getByRole('navigation',{name:'Workshop panels'}).getByRole('button',{name:'Combat',exact:true}).click();await page.getByRole('button',{name:'Practice current workshop party',exact:true}).click();
    const b=(await inspect(page)).battle!,nell=b.units.find(u=>u.id==='nell')!,orrin=b.units.find(u=>u.id==='orrin')!;expect(nell.skills!.burst).toBe(rank);
    await page.getByRole('button',{name:/^3\s+Lantern burst$/}).click();await clickHex(page,rank===3?orrin.hex:offset(5,3));await expect(page.locator('#battle-hint')).toContainText(`Skill ${rank}`);await expect(page.getByRole('button',{name:'Confirm attack',exact:true})).toBeInViewport();await capture(page,`automatic-burst-rank-${rank}-${device}`);
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
