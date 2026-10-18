import { expect, test } from '@playwright/test';
import { capture, clickHex, inspect } from './controls';
import { approach, importSave } from './navigation';
import { checkpoint } from '../support/progress';
import { offset } from '../../src/rules/hex';

for(const [device,viewport] of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]] as const){
  test(`development battle tools restore, restart and resolve practice on ${device}`,async({page})=>{
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    await page.setViewportSize(viewport);await page.goto('/?dev=workshop');
    await expect(page.getByRole('group',{name:'Development battle tools'})).toHaveCount(0);
    const focus=page.getByRole('spinbutton',{name:'Nell Starting focus',exact:true});await focus.fill('0');
    await page.getByRole('button',{name:'Apply base stats',exact:true}).click();
    const before=(await inspect(page)).state;
    await page.getByRole('button',{name:'Test battle',exact:true}).click();
    const tools=page.getByRole('group',{name:'Development battle tools',exact:true});await expect(tools).toBeVisible();
    for(const name of ['Win battle','Lose battle','Refill party','Restart battle'])await expect(tools.getByRole('button',{name,exact:true})).toBeInViewport();
    const start=(await inspect(page)).battle!;expect(start.units.find(u=>u.id==='nell')!.focus).toBe(1);
    await capture(page,`testing-tools-${device}`);
    await tools.getByRole('button',{name:'Refill party',exact:true}).click();
    let battle=(await inspect(page)).battle!;
    for(const unit of battle.units.filter(u=>u.side==='party'))expect(unit).toMatchObject({hp:unit.maxHp,focus:6});
    expect(battle.units.filter(u=>u.side==='enemy')).toEqual(start.units.filter(u=>u.side==='enemy'));
    await page.locator('.actions').getByRole('button',{name:/^1\s+Move$/}).click();await clickHex(page,offset(2,2));
    await page.getByRole('button',{name:/^Confirm move/}).click();
    // Restart during movement animation; its delayed callback must not touch the new battle.
    await tools.getByRole('button',{name:'Restart battle',exact:true}).click();
    await page.waitForTimeout(450);expect((await inspect(page)).battle).toEqual(start);
    await tools.getByRole('button',{name:'Lose battle',exact:true}).click();
    await expect(page.getByRole('heading',{name:'Practice defeated',exact:true})).toBeVisible();
    await expect(tools.getByRole('button',{name:'Win battle',exact:true})).toBeDisabled();
    await page.getByRole('button',{name:'Back to workshop',exact:true}).click();
    await expect(tools).toHaveCount(0);
    await page.getByRole('spinbutton',{name:'Nell Speed',exact:true}).fill('1');
    await page.getByRole('button',{name:'Apply base stats',exact:true}).click();
    await page.getByRole('group',{name:'Character',exact:true}).getByRole('button',{name:'Orrin',exact:true}).click();
    await page.getByRole('spinbutton',{name:'Orrin Speed',exact:true}).fill('1');
    await page.getByRole('button',{name:'Apply base stats',exact:true}).click();
    await page.getByRole('button',{name:'Test battle',exact:true}).click();
    // Win with an enemy timer pending, then ensure it cannot replace the result panel.
    const opening=(await inspect(page)).battle!;
    expect(opening.units.find(u=>u.id===opening.queue[0])!.side).toBe('enemy');
    await tools.getByRole('button',{name:'Win battle',exact:true}).click();
    await expect(page.getByRole('heading',{name:'Practice complete',exact:true})).toBeVisible();
    await page.waitForTimeout(1000);await expect(page.getByRole('heading',{name:'Practice complete',exact:true})).toBeVisible();
    battle=(await inspect(page)).battle!;expect(battle.result).toBe('victory');expect(battle.units.filter(u=>u.side==='enemy').every(u=>u.hp===0)).toBe(true);
    await page.getByRole('button',{name:'Back to workshop',exact:true}).click();
    expect((await inspect(page)).state).toMatchObject({xp:before.xp,coins:before.coins,flags:before.flags,gear:before.gear,party:before.party});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([]);
  });
}

test('forced campaign defeat and victory use the normal retry, rewards, continuation and save path',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');const initial=checkpoint('raidSeen');initial.party[0].hp=7;initial.party[0].focus=0;
  await importSave(page,initial);await approach(page,'pursuit');
  const tools=page.getByRole('group',{name:'Development battle tools',exact:true});
  await expect(tools).toBeVisible();
  expect((await inspect(page)).battle!.units[0].hp).toBe(7);
  await tools.getByRole('button',{name:'Refill party',exact:true}).click();
  expect((await inspect(page)).battle!.units[0]).toMatchObject({hp:42,focus:6});
  expect((await inspect(page)).state.party).toEqual(initial.party);
  await tools.getByRole('button',{name:'Lose battle',exact:true}).click();
  await expect(page.getByRole('heading',{name:'The line can wait',exact:true})).toBeVisible();
  expect((await inspect(page)).state).toMatchObject({xp:initial.xp,coins:initial.coins,flags:initial.flags});
  await page.getByRole('button',{name:'Retry battle',exact:true}).click();
  await tools.getByRole('button',{name:'Win battle',exact:true}).click();
  await expect(page.getByRole('heading',{name:'The line is clear',exact:true})).toBeVisible();
  await page.waitForTimeout(1000);
  expect((await inspect(page)).state).toMatchObject({xp:40,coins:36,flags:{escapeWon:true},journal:expect.arrayContaining(['escape'])});
  await expect(tools.getByRole('button',{name:'Win battle',exact:true})).toBeDisabled();
  await page.getByRole('button',{name:'Continue the journey',exact:true}).click();await expect(tools).toHaveCount(0);
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();
  await expect.poll(async()=>(await inspect(page)).state.flags.escapeWon).toBe(true);
  expect((await inspect(page)).state).toMatchObject({xp:40,coins:36});expect(errors).toEqual([]);
});
