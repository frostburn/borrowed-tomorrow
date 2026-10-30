import {expect,test,type Page} from '@playwright/test';
import {coastCheckpoint} from '../support/progress';
import {newSkillBook} from '../../src/rules/skills';
import {restoreParty} from '../../src/rules/state';
import {movement,type Battle} from '../../src/rules/combat';
import {toPixel} from '../../src/rules/hex';
import {importSave,approach} from './navigation';
import {capture,clickHex,inspect} from './controls';

export async function commandsFit(page:Page){
 const fit=await page.locator('.command-list').evaluate(list=>{
  const bounds=list.getBoundingClientRect();
  return {scroll:list.scrollHeight-list.clientHeight,clipped:[...list.querySelectorAll('button')].filter(b=>{const r=b.getBoundingClientRect();return r.top<bounds.top-1||r.bottom>bounds.bottom+1||r.left<bounds.left-1||r.right>bounds.right+1;}).map(b=>b.textContent)};
 });
 expect(fit.scroll,'all ordinary commands fit without scrolling').toBeLessThanOrEqual(1);expect(fit.clipped).toEqual([]);
}
export function battleMenuFlows(production=false){
 for(const [device,viewport,dpr]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const){
  test(`${production?'production ':''}field confirmation and a full campaign command grid on ${device}`,async({browser})=>{
   const context=await browser.newContext({viewport,deviceScaleFactor:dpr,reducedMotion:'reduce'}),page=await context.newPage();
   try{
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    const saved=coastCheckpoint('raidConfronted');saved.xp=8200;saved.skills=newSkillBook(15);restoreParty(saved);
    await page.goto('/');await importSave(page,saved);await approach(page,'loading-gate');
    await expect.poll(async()=>(await inspect(page)).mode).toBe('battle');
    await page.getByRole('button',{name:/^F\s+Defend$/}).click();
    await expect.poll(async()=>{const s=await inspect(page);return !s.busy&&s.battle?.queue[0];}).toBe('nell');
    await expect(page.locator('.actions button')).toHaveCount(10);await commandsFit(page);
    const before=(await inspect(page)).battle!;
    const team=page.getByRole('button',{name:/Lantern volley$/});await expect(team).toHaveClass(/unavailable/);await team.click();
    await expect(page.locator('#confirmation')).toContainText('Kit has already used their action');
    await expect(page.locator('#confirmation')).toBeInViewport();await expect(page.locator('#confirmation button')).toHaveCount(0);
    const anchored=await page.locator('#confirmation').boundingBox(),field=(await page.locator('.world-input').boundingBox())!;
    for(const [x,y]of [[.2,.2],[.8,.2],[.2,.8],[.8,.8]]){
     await page.mouse.move(field.x+field.width*x,field.y+field.height*y,{steps:8});
     expect(await page.locator('#confirmation').boundingBox(),'warnings stay anchored while hovering').toEqual(anchored);
    }
    await page.getByRole('button',{name:/Prism lance$/}).click();expect(await page.locator('#confirmation').boundingBox(),'skill information uses the same card').toEqual(anchored);const enemy=before.units.find(u=>u.side==='enemy')!;
    await clickHex(page,enemy.hex);await expect(page.getByRole('button',{name:'Confirm attack',exact:true})).toBeVisible();
    const card=await page.locator('#confirmation').boundingBox(),stage=await page.locator('.stage-wrap').boundingBox();
    expect(card,'confirmation uses the same fixed-size card').toEqual(anchored);
    expect(card!.x).toBeGreaterThanOrEqual(stage!.x);expect(card!.y).toBeGreaterThanOrEqual(stage!.y);
    expect(card!.x+card!.width).toBeLessThanOrEqual(stage!.x+stage!.width+1);expect(card!.y+card!.height).toBeLessThanOrEqual(stage!.y+stage!.height+1);
    const view=(await inspect(page)).view,world=(await page.locator('.world-input').boundingBox())!,p=toPixel(enemy.hex);
    const target={x:world.x+(p.x-view.scrollX)*world.width/view.width,y:world.y+(p.y-view.scrollY)*world.height/view.height};
    if(target.x>=world.x&&target.x<=world.x+world.width)expect(target.x<card!.x||target.x>card!.x+card!.width||target.y<card!.y||target.y>card!.y+card!.height,'confirmation leaves its selected hex uncovered').toBe(true);
    await capture(page,`battle-field-${production?'production':'dev'}-${device}`);
    await page.getByRole('button',{name:'Battle log',exact:true}).click();await expect(page.getByRole('dialog',{name:'Battle log',exact:true})).toBeVisible();
    await page.getByRole('button',{name:'Close',exact:true}).click();expect((await inspect(page)).battle).toEqual(before);
    await page.getByRole('button',{name:'Cancel',exact:true}).focus();await page.keyboard.press('Enter');
    await expect(page.getByRole('button',{name:'Confirm attack',exact:true})).toHaveCount(0);expect((await inspect(page)).battle).toEqual(before);
    await page.keyboard.press('l');await expect(page.getByRole('dialog',{name:'Battle log',exact:true})).toBeVisible();await page.keyboard.press('Escape');
    await page.keyboard.press('1');const b={...before,obstacles:new Set(before.obstacles),water:new Set(before.water),vents:new Set(before.vents)} as Battle,u=b.units.find(u=>u.id==='nell')!;
    const destination=[...movement(b,u).values()].find(v=>v.path.length)!.hex;
    await clickHex(page,destination);await expect(page.getByRole('button',{name:/^Confirm move/})).toBeVisible();
    await page.keyboard.press('Enter');await expect.poll(async()=>(await inspect(page)).busy).toBe(false);
    expect((await inspect(page)).battle!.units.find(u=>u.id==='nell')!.moved).toBe(true);
    await expect(page.getByRole('button',{name:/^1\s+Move \/ Strike$/})).toBeEnabled();await commandsFit(page);
    await importSave(page,saved);await expect(page.locator('#battle-overlay')).toBeHidden();await expect(page.locator('.world-party')).toBeVisible();
    await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
   }finally{await context.close();}
  });
 }
}
