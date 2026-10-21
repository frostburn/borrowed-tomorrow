import {test,expect} from '@playwright/test';
import {palaceCheckpoint} from '../support/progress';
import {importSave} from './navigation';
import {capture,clickWorld,inspect,nativeActor} from './controls';

for(const [device,viewport] of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]] as const){
 test(`Equipment immediately replaces visible companions without travel on ${device}`,async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize(viewport);await page.goto('/');
  const saved=palaceCheckpoint('petraJoined');saved.location={map:'northglass',x:35,y:25};await importSave(page,saved);
  const before=await inspect(page),leader=before.actors.find(a=>a.hero==='nell')!;
  const visible=async()=>(await inspect(page)).actors.map(a=>a.hero).sort();
  await expect.poll(visible).toEqual(['kit','nell','orrin']);
  await page.getByRole('button',{name:'Equipment',exact:true}).click();
  const inventory=page.getByRole('dialog',{name:'Character inventory'}),characters=inventory.getByRole('group',{name:'Character',exact:true});
  await characters.getByRole('button',{name:'Orrin',exact:true}).click();await inventory.getByRole('button',{name:'Move to reserve',exact:true}).click();
  await expect.poll(visible).toEqual(['kit','nell']);
  await characters.getByRole('button',{name:'Petra',exact:true}).click();await inventory.getByRole('button',{name:'Set active',exact:true}).click();
  await expect.poll(visible).toEqual(['kit','nell','petra']);
  // An equipment-only edit keeps the actors and their positions intact.
  const formed=(await inspect(page)).actors;
  await inventory.getByRole('button',{name:/^Balanced saber hilt/}).click();await inventory.getByRole('button',{name:'Equip on Petra',exact:true}).click();
  expect((await inspect(page)).actors).toEqual(formed);
  await inventory.getByRole('button',{name:'Close',exact:true}).click();
  const after=await inspect(page);expect(after.state.location).toEqual(saved.location);expect(after.view).toEqual(before.view);
  expect(after.actors.find(a=>a.hero==='nell')).toEqual(leader);expect(after.state.activeParty).toEqual(['nell','kit','petra']);
  await expect(page.locator('.world-party')).toContainText('Petra');await expect(page.locator('.world-party')).not.toContainText('Orrin');
  const petra=after.actors.find(a=>a.hero==='petra')!;
  await nativeActor(page,'petra',{x:petra.x/24-.5,y:(petra.y-7)/24-.5});
  await capture(page,`party-swapped-${device}`);
  // New companions join the following chain; removed companions never return.
  await clickWorld(page,38,25);await expect.poll(async()=>{const s=await inspect(page);return !s.moving&&s.state.location.x===38;}).toBe(true);
  await expect.poll(visible).toEqual(['kit','nell','petra']);
  expect((await inspect(page)).actors.find(a=>a.hero==='petra')!.x).not.toBe(formed.find(a=>a.hero==='petra')!.x);
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(visible).toEqual(['kit','nell','petra']);
  expect((await inspect(page)).state.inventory.characters.petra.fitting).toBe('saber-hilt');expect(errors).toEqual([]);
 });
}
