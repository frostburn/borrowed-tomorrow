import { expect, test } from '@playwright/test';
import aDeparture from '../fixtures/disk-a-v1.json' with {type:'json'};
import cDeparture from '../fixtures/disk-c-v3.json' with {type:'json'};
import { decodeSave, enterDiskB, enterDiskD } from '../../src/rules/state';
import { importSave, approach } from './navigation';
import { capture, dialogue, inspect } from './controls';

async function nextTo(page:import('@playwright/test').Page,text:string){
  for(let i=0;i<20&&!((await page.locator('.dialogue p').textContent())??'').includes(text);i++)await page.locator('.dialogue-actions button').first().click();
  await expect(page.locator('.dialogue p')).toContainText(text);
}

test('the fresh opening stages the threat, keeps native inserts on a phone, and resumes safely after interruption',async({browser})=>{
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2.5});
  const page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await page.getByRole('button',{name:'Begin Disk A'}).click();
  await expect.poll(async()=>(await inspect(page)).cinematic).toBe('a-arrival');
  const before=await inspect(page);await page.keyboard.press('ArrowLeft');expect((await inspect(page)).state.location).toEqual(before.state.location);
  await nextTo(page,'It was on my seat');
  await expect(page.locator('.cinema-document')).toContainText('Thirty-one received. None substituted.');
  await expect(page.locator('.cinema-document')).toBeInViewport();await expect(page.locator('.dialogue-portrait')).toBeInViewport();
  await expect(page.getByRole('button',{name:'Skip scene'})).toBeInViewport();
  expect(await page.locator('.cinema-document canvas').evaluate(c=>({w:c.getAttribute('width'),h:c.getAttribute('height')}))).toEqual({w:'192',h:'32'});
  await capture(page,'opening-receipt-phone');
  await nextTo(page,'Hand it over');await expect(page.locator('.dialogue-portrait img')).toHaveAttribute('src',/portrait-inspector\.png$/);await capture(page,'opening-inspector-phone');
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();
  await expect.poll(async()=>(await inspect(page)).cinematic).toBe('a-arrival');
  expect((await inspect(page)).state.flags.aReceiptSeen).toBeUndefined();
  await page.getByRole('button',{name:'Skip scene'}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBeNull();
  const final=(await inspect(page)).state;expect(final.flags.aReceiptSeen).toBe(true);expect(final.flags.metMira).toBe(true);expect(final.journal.filter(id=>id==='a-receipt')).toHaveLength(1);
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();
  await expect.poll(async()=>(await inspect(page)).cinematic).toBeNull();
  expect((await inspect(page)).state.flags.aOpeningSeen).toBe(true);expect(errors).toEqual([]);await context.close();
});

test('Rillbridge pays off the receipt and supports old saves that never saw the new opening',async({page})=>{
  await page.goto('/');
  for(const seen of [false,true]){
    const state=enterDiskB(decodeSave(JSON.stringify(aDeparture)));
    Object.assign(state.flags,{bEvacuated:true,aReceiptSeen:seen});state.location={map:'station',x:13,y:10};
    await importSave(page,state);await expect.poll(async()=>(await inspect(page)).state.location.map).toBe('station');
    await approach(page,'master');await expect.poll(async()=>(await inspect(page)).cinematic).toBe('b-receipt');
    await nextTo(page,seen?'This is what Mira brought me':'before I signed');
    await expect(page.locator('.cinema-document canvas')).toHaveCount(2);await expect(page.locator('.cinema-document canvas').first()).toBeVisible();await capture(page,seen?'receipt-payoff':'receipt-legacy');
    await dialogue(page);expect((await inspect(page)).state.flags.bReceiptMatched).toBe(true);
    expect((await inspect(page)).state.flags.bLarkspurReceived).toBe(true);expect((await inspect(page)).state.flags.bEvacuated).toBe(true);
  }
});

test('skipping a cutscene preserves its choice, and the lamp-room reply survives a save',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:390,height:844});await page.goto('/');
  const state=enterDiskD(decodeSave(JSON.stringify(cDeparture)));
  Object.assign(state.flags,{dLetterRead:true,dLineHeld:true,dCrewReturned:true,dCircuitRead:true});state.location={map:'relayhall',x:31,y:25};
  await importSave(page,state);await expect.poll(async()=>(await inspect(page)).state.location.map).toBe('relayhall');await approach(page,'d-plan');
  await page.getByRole('button',{name:'Skip scene'}).click();
  expect((await inspect(page)).state.flags.dHoldRed).toBeUndefined();expect((await inspect(page)).state.flags.dHandBell).toBeUndefined();
  const choice=page.getByRole('button',{name:'Keep all signals red · close tonight'});await expect(choice).toBeInViewport();await choice.click();
  expect((await inspect(page)).state.flags.dHoldRed).toBe(true);expect((await inspect(page)).cinematic).toBeNull();
  Object.assign(state.flags,{dRelayStopped:true,dHoldRed:true});state.location={map:'relayhall',x:53,y:29};
  await importSave(page,state);await expect.poll(async()=>(await inspect(page)).state.location.x).toBe(53);await approach(page,'d-recorder');
  await nextTo(page,'Your handwriting has changed');await expect(page.locator('.cinema-document')).toContainText('FERRY LIST');
  await capture(page,'lamp-room-reply-phone');await nextTo(page,'CONTACT UNDER INSPECTION');await capture(page,'reply-intercepted-phone');await dialogue(page);
  const final=(await inspect(page)).state;expect(final.flags.dReplySent).toBe(true);expect(final.flags.dRecordRead).toBe(true);expect(final.journal).toContain('d-reply');
  expect(final.party).toEqual(state.party);expect(final.coins).toBe(state.coins);expect(final.flags.cTransferred).toBe(true);expect(final.flags.bEvacuated).toBe(true);
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();
  await expect.poll(async()=>(await inspect(page)).state.flags.dReplySent).toBe(true);expect((await inspect(page)).cinematic).toBeNull();expect(errors).toEqual([]);
});
