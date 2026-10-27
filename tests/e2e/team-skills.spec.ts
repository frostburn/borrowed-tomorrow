import {test,expect} from '@playwright/test';
import {capture,clickHex,inspect} from './controls';
import {defaultBuild,newCharacterSettings} from '../../src/rules/characters';
import {offset} from '../../src/rules/hex';

for(const [device,viewport,deviceScaleFactor]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const){
 test.describe(`derived teams ${device}`,()=>{
  test.use({viewport,deviceScaleFactor});
  test('a spent partner leaves a gray inspectable command and a named explanation through pointer and keyboard',async({page})=>{
   const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});
   const settings=newCharacterSettings();for(const hero of settings.party)settings.characters[hero]=defaultBuild(hero,10);settings.characters.orrin.speed=10;
   await page.addInitScript(s=>localStorage.setItem('borrowed-tomorrow:character-workshop:v3',JSON.stringify(s)),settings);
   await page.goto('/?dev=combat');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop');await page.getByRole('button',{name:'Practice current workshop party',exact:true}).click();
   await expect.poll(async()=>(await inspect(page)).battle!.queue[0]).toBe('orrin');await page.getByRole('button',{name:/^F\s+Defend$/}).click();
   await expect.poll(async()=>{const s=await inspect(page);return !s.busy&&s.battle?.queue[0];}).toBe('nell');
   const team=page.getByRole('button',{name:/Prism lance · Team/});await expect(team).toHaveClass(/unavailable/);await expect(team).toHaveAttribute('aria-description','Orrin has already used their action this round.');
   const before=(await inspect(page)).battle;await team.click();await expect(page.locator('#confirmation')).toHaveText('Orrin has already used their action this round.');await expect(page.locator('#confirmation .team-unavailable')).toBeInViewport();await expect(page.locator('#confirmation button')).toHaveCount(0);
   const shortcut=(await team.textContent())!.trim()[0];await page.getByRole('button',{name:/^2\s+Strike$/}).click();await page.keyboard.press(shortcut);await expect(team).toHaveClass(/selected/);await expect(page.locator('#confirmation .team-unavailable')).toBeInViewport();await expect(page.locator('#confirmation')).toContainText('Orrin');
   expect((await inspect(page)).battle).toEqual(before);await capture(page,`team-busy-${device}`);await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
  });
  test('distinct team effects run through impact without losing the effect layer or leaving the UI busy',async({page})=>{
   const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await page.goto('/?dev=combat');
   for(const [name,short]of [['Falling stars','stars'],['Prism lance','prism'],['Crossfire','crossfire'],['Daybreak','daybreak'],['Lantern volley','lantern']]as const){
    await page.getByRole('button',{name:`Practice ${name}`,exact:true}).click();await page.getByRole('button',{name:new RegExp(`${name} · Team`)}).click();
    if(short!=='daybreak')await clickHex(page,offset(7,3));
    await expect(page.locator('#confirmation')).toContainText(short==='stars'?'Celestial bolt':short==='prism'?'Horizon light':short==='crossfire'?'Ricochet':short==='lantern'?'Lantern burst':'Heal');
    if(short==='lantern')await capture(page,`lantern-footprint-${device}`);
    await page.getByRole('button',{name:short==='daybreak'?'Confirm healing':'Confirm attack',exact:true}).click();
    // Capture real running frames, including the falling phase and the landing flare.
    await page.waitForTimeout(short==='stars'?160:80);await capture(page,`team-${short}-flight-${device}`);
    if(short==='stars'){await page.waitForTimeout(260);await capture(page,`team-${short}-impact-${device}`);}
    await expect.poll(async()=>(await inspect(page)).busy).toBe(false);await capture(page,`team-${short}-after-${device}`);await page.keyboard.press('Escape');
   }
   await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
  });
  test('the assisting fighter can move or end their turn after their team attack was spent',async({page})=>{
   const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/?dev=combat');
   for(const choice of ['move','end']as const){
    await page.getByRole('button',{name:'Practice Prism lance',exact:true}).click();await page.getByRole('button',{name:/Prism lance · Team/}).click();await clickHex(page,offset(7,3));await page.getByRole('button',{name:'Confirm attack',exact:true}).click();
    await expect.poll(async()=>{const s=await inspect(page);return !s.busy&&s.battle?.queue[0];}).toBe('celia');await page.getByRole('button',{name:/^F\s+Defend$/}).click();
    await expect.poll(async()=>{const s=await inspect(page);return !s.busy&&s.battle?.queue[0];}).toBe('orrin');
    const before=(await inspect(page)).battle!,orrin=before.units.find(u=>u.id==='orrin')!;expect(orrin.focus).toBe(3);expect(orrin.teamSpentRound).toBe(before.round);
    await expect(page.locator('.actions button')).toHaveCount(2);await expect(page.getByRole('button',{name:/^F\s+End turn$/})).toBeInViewport();await expect(page.locator('#status')).toContainText('Attack spent');await page.keyboard.press('2');await expect(page.locator('.actions button')).toHaveCount(2);await capture(page,`remaining-move-${choice}-${device}`);
    if(choice==='move'){await page.getByRole('button',{name:/^1\s+Move$/}).click();await clickHex(page,offset(3,4));await page.getByRole('button',{name:/Confirm move/}).click();}else await page.keyboard.press('f');
    const after=(await inspect(page)).battle!,helper=after.units.find(u=>u.id==='orrin')!;expect(after.queue).not.toContain('orrin');expect(helper.focus).toBe(orrin.focus);expect(helper.defending).toBe(false);expect(helper.hex).toEqual(choice==='move'?offset(3,4):orrin.hex);
    await expect.poll(async()=>(await inspect(page)).busy).toBe(false);await page.keyboard.press('Escape');
   }
   await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
  });
 });
}
