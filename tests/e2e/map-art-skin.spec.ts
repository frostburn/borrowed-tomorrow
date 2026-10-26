import {test,expect} from '@playwright/test';
import {checkpoint} from '../support/progress';
import {chapterSixFinaleStart} from '../../src/dev/canonical-saves';
import {arrival} from '../../src/content/maps';
import {importSave} from './navigation';
import {inspect} from './controls';
for(const [name,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]as const){
 test(`map skins switch and persist without changing the journey on ${name}`,async({page})=>{
  await page.setViewportSize(viewport);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');
  for(const map of ['station','stillcity']as const){
   const state=map==='station'?checkpoint('festivalSeen'):chapterSixFinaleStart(true);state.location=arrival(map,'start');
   await importSave(page,state);const before=(await inspect(page)).state;
   const pictures=[];
   for(const skin of ['Vector maps','Raster maps']){
    await page.getByRole('button',{name:'Controls and combat help'}).click();
    await page.getByRole('button',{name:skin,exact:true}).click();
    await expect.poll(()=>page.evaluate(()=>localStorage.getItem('borrowed-tomorrow-map-art'))).toBe(skin==='Vector maps'?'vector':'raster');
    await expect(page.getByRole('button',{name:skin,exact:true})).toBeEnabled();
    await page.getByRole('button',{name:'Close',exact:true}).click();
    pictures.push(await page.locator('.phaser-host canvas').evaluate((c:HTMLCanvasElement)=>c.toDataURL()));
    const {playSeconds:elapsed,...after}=(await inspect(page)).state;
    const {playSeconds:previousElapsed,...progress}=before;
    expect(after).toEqual(progress);expect(elapsed).toBeGreaterThanOrEqual(previousElapsed);
   }
   expect(pictures[0]).not.toBe(pictures[1]);
  }
  await page.reload();expect(await page.evaluate(()=>localStorage.getItem('borrowed-tomorrow-map-art'))).toBe('raster');
  await page.goto('/?dev=maps&map=station');await expect(page.locator('#map-workshop')).toHaveAttribute('data-ready','true');
  await page.getByRole('group',{name:'Map skin',exact:true}).getByRole('button',{name:'Vector',exact:true}).click();
  await expect(page.locator('.map-meta')).toContainText('Traced SVG scene');
  await page.reload();await expect(page.locator('#map-workshop')).toHaveAttribute('data-ready','true');await expect(page.locator('.map-meta')).toContainText('Traced SVG scene');
  expect(errors).toEqual([]);
 });
}
