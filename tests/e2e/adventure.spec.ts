import { expect, test, type Page } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { active, damage, legalAim, movement, targets, type Battle, type AbilityId } from '../../src/rules/combat';
import { cells, equal, toPixel, type Hex } from '../../src/rules/hex';
import { newGame, recruitOrrin } from '../../src/rules/state';

async function inspect(page: Page) { return page.evaluate(()=>window.borrowedTomorrow.inspect()); }
async function clickWorld(page: Page, x: number, y: number) {
  const box=(await page.locator('#canvas canvas').boundingBox())!;
  await page.mouse.click(box.x+(x+.5)*24*box.width/1008,box.y+(y+.5)*24*box.height/624);
}
async function clickHex(page: Page, h: Hex) {
  const box=(await page.locator('#canvas canvas').boundingBox())!,p=toPixel(h);
  await page.mouse.click(box.x+p.x*box.width/1008,box.y+p.y*box.height/480);
}
async function dialogue(page: Page) {
  await expect(page.locator('.dialogue')).toBeVisible({timeout:15000});
  while(await page.locator('.dialogue').isVisible())await page.locator('.dialogue-actions button').first().click();
}
async function talk(page: Page, x: number, y: number) { await clickWorld(page,x,y);await dialogue(page); }
async function capture(page: Page, name: string) { if(process.env.BT_QA_SCREENSHOTS)await page.screenshot({path:`${process.env.BT_QA_SCREENSHOTS}/${name}.png`}); }

function playerPlan(b: Battle): { action:'move'|AbilityId|'defend';hex?:Hex } {
  const u=active(b)!;
  for(const ally of b.units.filter(v=>v.side==='party'&&v.hp>0&&v.hp<v.maxHp*.45))for(const id of ['bandage','mend'] as AbilityId[])
    if(legalAim(b,u,id,ally.hex))return {action:id,hex:ally.hex};
  let best:{action:AbilityId;hex:Hex;pos:Hex;score:number}|undefined;
  const original=u.hex;
  for(const visit of movement(b,u).values()){
    u.hex=visit.hex;
    for(const id of u.abilities.filter(id=>!['mend','bandage'].includes(id)))for(const h of cells()){
      if(!legalAim(b,u,id,h))continue;
      const score=targets(b,u,id,h).reduce((sum,v)=>sum+(v.side!==u.side?1:-4)*(Math.min(v.hp,damage(u,v,id))+(v.hp<=damage(u,v,id)?8:0)),0)-visit.path.length*.1;
      if(score>0&&(!best||score>best.score))best={action:id,hex:h,pos:visit.hex,score};
    }
  }
  u.hex=original;
  if(!best)return {action:'defend'};
  return equal(best.pos,original)?{action:best.action,hex:best.hex}:{action:'move',hex:best.pos};
}
async function battle(page: Page, screenshot?: string) {
  await expect.poll(async()=> (await inspect(page)).mode).toBe('battle');
  if(screenshot)await capture(page,screenshot);
  for(let turns=0;turns<260;turns++){
    if(await page.getByRole('heading',{name:'The line is clear',exact:true}).isVisible()){
      await page.getByRole('button',{name:'Continue the journey'}).click();return;
    }
    if(await page.getByRole('heading',{name:'The line can wait'}).isVisible())throw new Error('The party was defeated during the browser playthrough.');
    const snapshot=(await inspect(page)).battle!;
    if(snapshot.result){await page.waitForTimeout(400);continue;}
    const b={...snapshot,obstacles:new Set(snapshot.obstacles)} as Battle;
    const u=active(b)!;
    if(u.side!=='party'){await page.waitForTimeout(250);continue;}
    const decision=playerPlan(b);
    const label=decision.action==='move'?/^1\s+Move$/:decision.action==='defend'?/^F\s+Defend$/:new RegExp(`^\\d\\s+${decision.action==='burst'?'Lantern burst':decision.action==='steam'?'Steam lance':decision.action==='bandage'?'Bandage':decision.action==='mend'?'Mend':'Strike'}$`);
    const action=page.locator('.actions').getByRole('button',{name:label});
    await expect(action).toBeEnabled();await action.click();
    if(decision.hex){await clickHex(page,decision.hex);if(screenshot&&decision.action==='burst'){await capture(page,'aoe-preview');screenshot=undefined;}await page.getByRole('button',{name:decision.action==='move'?/^Confirm move/:/^Confirm attack$/}).click();}
    await page.waitForTimeout(420);
  }
  throw new Error('Battle did not resolve within the turn budget.');
}

test('Disk A plays through to a durable Disk B arrival using real controls',async({page})=>{
  test.setTimeout(300000);
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');
  await capture(page,'title');await page.getByRole('button',{name:'Begin Disk A'}).click();await dialogue(page);
  await capture(page,'station');
  await talk(page,27,10);await talk(page,17,14);
  await expect.poll(async()=> (await inspect(page)).state.party.length).toBe(2);
  await talk(page,20,12);
  await clickWorld(page,2,11);await expect.poll(async()=> (await inspect(page)).state.location.map,{timeout:15000}).toBe('yard');
  await talk(page,24,14);await battle(page,'battle');
  await talk(page,12,10);
  await talk(page,30,20);await battle(page);
  await clickWorld(page,9,8);await expect.poll(async()=> (await inspect(page)).state.location.map,{timeout:15000}).toBe('tunnel');
  await talk(page,19,12);await battle(page);
  await talk(page,21,8);await talk(page,22,19);
  await talk(page,33,13);await battle(page);
  await talk(page,39,13);await expect(page.getByRole('heading',{name:'Insert Disk B'})).toBeVisible();
  await capture(page,'boundary');
  const before=(await inspect(page)).state;
  if(process.env.BT_QA_SAVE_OUTPUT)await writeFile(process.env.BT_QA_SAVE_OUTPUT,JSON.stringify(before,null,2)+'\n');
  expect(before.boundary).toBe('disk-b:rillbridge-arrival');expect(before.flags.diskAComplete).toBe(true);
  await page.getByRole('button',{name:'Return to the line'}).click();
  await page.getByRole('button',{name:'Save',exact:true}).click();
  await page.locator('[data-slot="slot-1"]').getByRole('button',{name:'Save',exact:true}).click();
  await expect(page.getByRole('status')).toContainText('Place saved.');
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();
  await expect.poll(async()=> (await inspect(page)).state.boundary).toBe('disk-b:rillbridge-arrival');
  expect((await inspect(page)).state.gear).toEqual(before.gear);
  expect(errors).toEqual([]);
});

test('small-screen controls, journal and imported saves remain usable',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.setViewportSize({width:390,height:844});await page.goto('/');
  await page.getByRole('button',{name:'Begin Disk A'}).click();await dialogue(page);
  await expect(page.locator('.dpad')).toBeVisible();await expect(page.getByRole('button',{name:'Controls and combat help'})).toBeInViewport();await capture(page,'mobile');
  await page.getByRole('button',{name:'Sound off'}).click();await expect(page.getByRole('button',{name:'Sound on'})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'Sound on'}).click();
  await page.getByRole('button',{name:'Journal',exact:true}).last().click();await expect(page.getByRole('heading',{name:'Travel journal'})).toBeVisible();
  await page.getByRole('button',{name:'Close',exact:true}).click();
  const s=newGame();recruitOrrin(s);s.flags.metMira=true;s.flags.promisedHome=true;s.coins=41;s.gear=['brass-lantern'];
  await page.getByRole('button',{name:'Save',exact:true}).click();
  const chooser=page.waitForEvent('filechooser');await page.getByRole('button',{name:'Import save file'}).click();
  await (await chooser).setFiles({name:'save.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(s))});
  await expect.poll(async()=> (await inspect(page)).state.coins).toBe(41);
  expect((await inspect(page)).state.flags.promisedHome).toBe(true);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
