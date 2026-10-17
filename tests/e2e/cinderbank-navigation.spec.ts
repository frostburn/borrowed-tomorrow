import { expect, test } from '@playwright/test';
import departure from '../fixtures/disk-b-v2.json' with {type:'json'};
import { decodeSave, enterDiskC } from '../../src/rules/state';
import { MAPS } from '../../src/content/maps';
import { capture, clickWorld, dialogue, inspect } from './controls';
import { approach, importSave, travel } from './navigation';

for(const viewport of [{width:1280,height:800},{width:390,height:844}]){
  test(`Cinderbank's visible door and Dena both advance a warmed save, with a matching return entrance (${viewport.width})`,async({page})=>{
    await page.setViewportSize(viewport);
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto('/');await expect(page).toHaveTitle(/Borrowed Tomorrow/);
    const state=enterDiskC(decodeSave(JSON.stringify(departure)));
    state.flags.cWarmed=true;state.location={map:'cinderbank',x:41,y:13};
    await importSave(page,state);
    await expect.poll(async()=>(await inspect(page)).state.location.map).toBe('cinderbank');
    await expect(page.locator('.world-objective')).toContainText('Help Dena and Ivo');
    // Click the painted carriage door, above its marker and inside scenery collision.
    await clickWorld(page,42,8);
    await expect(page.locator('.dialogue h2')).toHaveText('The carriage door');
    await capture(page,`cinderbank-door-${viewport.width}`);await dialogue(page);
    await expect.poll(async()=>(await inspect(page)).state.flags.cManifestRefused).toBe(true);
    await expect(page.locator('.world-objective')).toContainText('Read the crew register');

    // The same pre-refusal save can continue by following Dena's explicit action.
    state.location={map:'cinderbank',x:28,y:14};await importSave(page,state);
    await expect.poll(async()=>(await inspect(page)).state.flags.cManifestRefused??false).toBe(false);
    await approach(page,'c-dena');
    const help=page.getByRole('button',{name:'Help at the carriage door',exact:true});
    await expect(help).toBeInViewport();await capture(page,`cinderbank-dena-help-${viewport.width}`);
    await help.click();await expect(page.locator('.dialogue h2')).toHaveText('The carriage door');await dialogue(page);
    await expect.poll(async()=>(await inspect(page)).state.flags.cManifestRefused).toBe(true);
    await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();
    await expect(page.locator('.world-objective')).toContainText('Read the crew register');
    await travel(page,'c-to-larkspur','station');await travel(page,'train','cinderbank');
    const returned=(await inspect(page)).state,exit=MAPS.cinderbank.objects.find(o=>o.id==='c-to-larkspur')!;
    expect(Math.abs(returned.location.x-exit.x)+Math.abs(returned.location.y-exit.y)).toBe(1);
    expect(returned.flags.cManifestRefused).toBe(true);
    await capture(page,`cinderbank-return-${viewport.width}`);
    expect(errors).toEqual([]);expect(await page.locator('vite-error-overlay').count()).toBe(0);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  });
}
