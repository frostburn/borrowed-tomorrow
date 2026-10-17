import { expect, test, type Page } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import arrival from '../fixtures/disk-a-v1.json' with { type: 'json' };
import { MAPS, visibleObjects, walkable, worldPath } from '../../src/content/maps';
import { decodeSave, enterDiskB } from '../../src/rules/state';
import { inspect,clickWorld,dialogue,capture,battle } from './controls';

async function importSave(page:Page,state:unknown){
  await page.getByRole('button',{name:/^Save files$|^Save$/}).first().click();
  const chooser=page.waitForEvent('filechooser');await page.getByRole('button',{name:'Import save file'}).click();
  await (await chooser).setFiles({name:'arrival.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(state))});
}
/** Walk the larger maps through visible waypoints; never teleport or mutate the game. */
async function approach(page:Page,id:string){
  for(let leg=0;leg<30;leg++){
    const {state,view}=await inspect(page),map=MAPS[state.location.map],objects=visibleObjects(map,state),object=objects.find(o=>o.id===id)!;
    expect(object,`Object ${id} in ${map.id}`).toBeTruthy();
    const visible=(p:{x:number;y:number})=>(p.x+.5)*24>view.scrollX+36&&(p.x+.5)*24<view.scrollX+view.width-36&&(p.y+.5)*24>view.scrollY+40&&(p.y+.5)*24<view.scrollY+view.height-36;
    if(visible(object)){await clickWorld(page,object.x,object.y);return;}
    const approaches=[object,{x:object.x-1,y:object.y},{x:object.x+1,y:object.y},{x:object.x,y:object.y-1},{x:object.x,y:object.y+1}];
    const paths=approaches.filter(p=>walkable(map,p.x,p.y,state)).map(p=>worldPath(map,state.location,p,state)).filter(p=>p.length).sort((a,b)=>a.length-b.length);
    const waypoint=[...paths[0]].reverse().find(p=>visible(p)&&objects.every(o=>Math.hypot(o.x-p.x,o.y-p.y)>=1.8));
    expect(waypoint,`Visible waypoint to ${id}`).toBeTruthy();
    await clickWorld(page,waypoint!.x,waypoint!.y);
    await expect.poll(async()=>{const x=await inspect(page);return !x.moving&&x.state.location.x===waypoint!.x&&x.state.location.y===waypoint!.y;},{timeout:20000}).toBe(true);
  }
  throw new Error(`Could not reach ${id}`);
}
async function visit(page:Page,id:string){await approach(page,id);await dialogue(page);}
async function travel(page:Page,id:string,map:string){await approach(page,id);await expect.poll(async()=>(await inspect(page)).state.location.map,{timeout:20000}).toBe(map);}

test('version-1 arrival continues through Disk B and preserves the Disk C departure on return visits',async({page})=>{
  test.setTimeout(420000);
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await importSave(page,arrival);
  await expect(page.getByRole('heading',{name:'Insert Disk B'})).toBeVisible();
  // A failed chapter download must leave the original pending arrival usable.
  await page.route('**/art/sluice.webp',route=>route.abort());
  await page.getByRole('button',{name:'Begin Disk B',exact:true}).click();
  await expect(page.getByRole('status')).toContainText('arrival save is intact',{timeout:20000});
  expect((await inspect(page)).state.boundary).toBe('disk-b:rillbridge-arrival');
  await page.unroute('**/art/sluice.webp');
  await page.getByRole('button',{name:'Begin Disk B',exact:true}).click();await dialogue(page);
  const entered=(await inspect(page)).state;
  expect(entered.version).toBe(2);expect(entered.chapter).toBe('disk-b');expect(entered.party).toEqual(arrival.party);
  expect(entered.coins).toBe(arrival.coins);expect(entered.gear).toEqual(arrival.gear);expect(entered.boundary).toBeNull();
  await capture(page,'disk-b-arrival');await visit(page,'b-bram');
  await travel(page,'b-to-sluice','sluice');await visit(page,'b-overflow');await battle(page,'disk-b-overflow');
  await visit(page,'b-gauge');await visit(page,'b-worksheet');
  await travel(page,'b-to-town','rillbridge');await visit(page,'b-baker');await visit(page,'b-carriage');
  await travel(page,'b-to-sluice','sluice');await visit(page,'b-trolley');await battle(page);
  await travel(page,'b-to-town','rillbridge');await visit(page,'b-school-gate');await visit(page,'b-schoolhouse');
  await travel(page,'b-to-sluice','sluice');await approach(page,'b-wheel');
  await expect(page.locator('.dialogue')).toBeVisible({timeout:20000});
  while(!(await page.getByRole('button',{name:'Open the millrace · wade to the keeper',exact:true}).isVisible()))await page.locator('.dialogue-actions button').first().click();
  await capture(page,'disk-b-outfall');await page.getByRole('button',{name:'Open the millrace · wade to the keeper',exact:true}).click();
  await visit(page,'b-keeper');expect((await inspect(page)).battle!.water.length).toBeGreaterThan(0);await battle(page,'disk-b-keeper');
  await travel(page,'b-to-town','rillbridge');await visit(page,'b-crossing');
  await expect.poll(async()=>(await inspect(page)).state.location.map).toBe('station');
  await visit(page,'master');await capture(page,'disk-b-larkspur');await visit(page,'b-family-larkspur');
  await visit(page,'train');await expect(page.getByRole('heading',{name:'Insert Disk C',exact:true})).toBeVisible();
  const finished=(await inspect(page)).state;
  expect(finished.flags.bEvacuated).toBe(true);expect(finished.flags.diskBComplete).toBe(true);expect(finished.flags.bWorksheetRead).toBe(true);
  expect(finished.boundary).toBe('disk-c:ambulance-siding');expect(finished.party.map(p=>p.id)).toEqual(['nell','orrin']);
  if(process.env.BT_QA_SAVE_OUTPUT)await writeFile(process.env.BT_QA_SAVE_OUTPUT.replace('.json','-disk-b.json'),JSON.stringify(finished,null,2)+'\n');
  await capture(page,'disk-c-boundary');await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Insert Disk C',exact:true})).toBeVisible();await page.getByRole('button',{name:'Return to the line'}).click();
  await travel(page,'to-yard','yard');await travel(page,'to-tunnel','tunnel');await travel(page,'disk-b','rillbridge');
  expect((await inspect(page)).state.boundary).toBe('disk-c:ambulance-siding');
  await visit(page,'b-crossing');expect((await inspect(page)).state.flags.bMillraceChannel).toBe(true);
  expect(errors).toEqual([]);
});

test('the outfall choice fits a phone and the orchard decision survives a saved revisit',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/');
  const state=enterDiskB(decodeSave(JSON.stringify(arrival)));
  Object.assign(state.flags,{bFatherFound:true,bOverflowCleared:true,bFloodEvidence:true,bTownWarned:true,bRegistryRefused:true,bTrolleyFreed:true,bNeighborsReady:true});
  state.location={map:'sluice',x:32,y:15};await importSave(page,state);
  await expect.poll(async()=>(await inspect(page)).state.location.map).toBe('sluice');
  await approach(page,'b-wheel');await expect(page.locator('.dialogue')).toBeVisible();
  const choice=page.getByRole('button',{name:'Open the orchard channel · flood the trees',exact:true});
  while(!await choice.isVisible())await page.locator('.dialogue-actions button').first().click();
  await expect(choice).toBeInViewport();await expect(page.getByRole('button',{name:'Open the millrace · wade to the keeper',exact:true})).toBeInViewport();
  await capture(page,'disk-b-phone-choice');await choice.click();
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();
  await expect.poll(async()=>(await inspect(page)).state.flags.bOrchardChannel).toBe(true);
  await approach(page,'b-wheel');await expect(page.locator('.dialogue p')).toContainText('dry');await dialogue(page);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('Elspeth is behind a solid fence and a persistent schoolhouse gate',async({page})=>{
  const state=enterDiskB(decodeSave(JSON.stringify(arrival)));
  Object.assign(state.flags,{bFatherFound:true,bOverflowCleared:true,bFloodEvidence:true,bTownWarned:true,bRegistryRefused:true,bTrolleyFreed:true});
  state.location={map:'rillbridge',x:42,y:35};await page.goto('/');await importSave(page,state);
  await expect.poll(async()=>(await inspect(page)).state.location.map).toBe('rillbridge');
  await page.locator('#canvas').focus();await page.keyboard.down('ArrowRight');await page.waitForTimeout(500);await page.keyboard.up('ArrowRight');
  expect((await inspect(page)).state.location).toEqual(state.location);
  await approach(page,'b-schoolhouse');await page.waitForTimeout(500);
  expect(await page.locator('.dialogue').isVisible()).toBe(false);expect((await inspect(page)).state.flags.bNeighborsReady).toBeUndefined();
  await capture(page,'schoolhouse-gate-closed');await visit(page,'b-school-gate');
  expect((await inspect(page)).state.flags.bSchoolGateOpen).toBe(true);
  await visit(page,'b-schoolhouse');expect((await inspect(page)).state.flags.bNeighborsReady).toBe(true);
  expect((await inspect(page)).state.location.y).toBeLessThan(38);
  await expect.poll(()=>page.evaluate(()=>{
    const info=window.borrowedTomorrowPixels.inspect(),source=document.querySelector('.pixel-source')!.getBoundingClientRect(),world=document.querySelector('.world-input')!.getBoundingClientRect();
    const output=document.querySelector<HTMLCanvasElement>('.pixel-output')!,ctx=output.getContext('2d')!;
    const x=info.physicalLeft+(Math.round((world.left-source.left)/info.cssScale)+8)*info.physicalScale;
    const y=info.physicalTop+(Math.round((world.top-source.top)/info.cssScale)+16)*info.physicalScale;
    const pixels=ctx.getImageData(x,y,32*info.physicalScale,32*info.physicalScale).data,colors=new Set<number>();
    for(let i=0;i<pixels.length;i+=4)colors.add((pixels[i]<<16)+(pixels[i+1]<<8)+pixels[i+2]);
    return colors.size;
  })).toBeGreaterThan(32);
  await capture(page,'schoolhouse-gate-open');await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();
  await expect.poll(async()=>(await inspect(page)).state.flags.bSchoolGateOpen).toBe(true);
});
