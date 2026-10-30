import {test,expect} from '@playwright/test';
import {checkpoint,coastCheckpoint} from '../support/progress';
import {importSave,approach} from './navigation';
import {battle,capture,inspect} from './controls';
import {chapterFiveStart} from '../../src/dev/canonical-saves';
import {newSkillBook} from '../../src/rules/skills';

export function automaticSkillFlows(production=false){
 for(const [device,viewport,deviceScaleFactor]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const){
  test.describe(`${production?'production':'development'} automatic skills ${device}`,()=>{
   test.use({viewport,deviceScaleFactor});test.setTimeout(90_000);
   test('current saves receive read-only level progression with keyboard-accessible effects',async({page})=>{
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');
    const s=chapterFiveStart();s.flags.airfieldSeen=true;s.skills.nell={burst:3,mend:2,dazzle:2,sunline:1};s.skills.celia={celestialbolt:3,heal:2,rally:2,sanctuary:1};await importSave(page,s);
    await expect(page.getByRole('button',{name:/^Upgrade skills/})).toHaveCount(0);
    await page.getByRole('button',{name:'Equipment',exact:true}).click();await page.getByRole('button',{name:'Skills',exact:true}).click();
    const panel=page.getByRole('dialog',{name:'Character skills'});await expect(panel.locator('.skill-summary')).toHaveText('Automatic progressionNext improvement at character level 10.');
    await expect(panel.locator('[data-skill]')).toHaveCount(0);await expect(panel).not.toContainText('point');await expect(panel.locator('[data-ability="burst"]')).toContainText('Skill 2 / 3');
    await panel.getByRole('button',{name:'Celia',exact:true}).focus();await page.keyboard.press('Tab');
    const disclosure=panel.locator('.skill-current summary').first();await expect(disclosure).toBeFocused();await page.keyboard.press('Enter');await expect(panel.locator('.skill-current').first()).toHaveAttribute('open','');await page.keyboard.press('Enter');
    const last=panel.locator('.skill-current summary').last();await last.focus();await page.keyboard.press('Tab');await expect(page.getByRole('button',{name:'Close',exact:true})).toBeFocused();await page.keyboard.press('Shift+Tab');await expect(last).toBeFocused();
    await capture(page,`automatic-skills-${production?'production-':''}${device}`);await page.getByRole('button',{name:'Close',exact:true}).click();
    expect((await inspect(page)).state.skills).toEqual(newSkillBook(9));
    await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).state.skills).toEqual(newSkillBook(9));
    await expect(page.locator('.skill-gains')).toHaveCount(0);await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
   });
   test('victory announces learned skills and applies them without a purchase',async({page})=>{
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await importSave(page,checkpoint('collectorConfronted'));await approach(page,'collector');
    if(production)await battle(page,undefined,false,{pauseOnVictory:true});else await page.getByRole('button',{name:'Win battle',exact:true}).click();
    const improvements=page.getByRole('list',{name:'Skill improvements'});await expect(improvements).toContainText('Nell learns Mend.');await expect(improvements).toContainText('Orrin learns Rivet shot.');await expect(improvements).not.toContainText('Kit');
    expect((await inspect(page)).state.skills.nell.mend).toBe(1);expect((await inspect(page)).state.skills.orrin.rivet).toBe(1);await capture(page,`automatic-level-up-${production?'production-':''}${device}`);
    await page.locator('.panel-actions').getByRole('button',{name:'Skills',exact:true}).click();const skills=page.getByRole('dialog',{name:'Character skills'});
    await expect(skills).toContainText('Character level 2');await expect(skills.locator('[data-ability="mend"]')).toContainText('Skill 1 / 3');await expect(skills).not.toContainText('Team:');await expect(skills.locator('[data-skill]')).toHaveCount(0);
    await page.getByRole('button',{name:'Close',exact:true}).click();await expect(page.locator('.panel-actions').getByRole('button',{name:'Skills',exact:true})).toBeFocused();
    await page.getByRole('button',{name:'Continue the journey',exact:true}).click();await page.getByRole('button',{name:'Skip scene',exact:true}).click();
    await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).state.skills.nell.mend).toBe(1);expect((await inspect(page)).state.skills.orrin.rivet).toBe(1);
    await expect(page.locator('.skill-gains')).toHaveCount(0);await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
   });
   test('team commands wait for both solo skills and remain inspectable after a trained partner acts',async({page})=>{
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
    for(const [level,xp]of [[6,520],[7,700]]as const){
     if(level===7)await page.reload();const s=coastCheckpoint('kitJoined');s.xp=xp;await importSave(page,s);await approach(page,'loading-gate');await page.getByRole('button',{name:'Breach the loading gate',exact:true}).click();await page.getByRole('button',{name:'Skip scene',exact:true}).click();
     await expect.poll(async()=>(await inspect(page)).battle?.queue[0]).toBe('kit');await expect(page.getByRole('button',{name:/Lantern volley · Team/})).toHaveCount(level===7?1:0);
     await page.getByRole('button',{name:/^F\s+Defend$/}).click();await expect.poll(async()=>{const s=await inspect(page);return !s.busy&&s.battle?.queue[0];}).toBe('nell');
     const volley=page.getByRole('button',{name:/Lantern volley · Team/}),prism=page.getByRole('button',{name:/Prism lance · Team/});await expect(volley).toHaveCount(level===7?1:0);await expect(prism).toHaveCount(level===7?1:0);
     if(level===7){await expect(volley).toHaveClass(/unavailable/);await volley.click();await expect(page.locator('#confirmation')).toHaveText('Kit has already used their action this round.');await expect(page.locator('#confirmation button')).toHaveCount(0);}
     await capture(page,`automatic-team-level-${level}-${production?'production-':''}${device}`);
    }
    await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
   });
  });
 }
}
