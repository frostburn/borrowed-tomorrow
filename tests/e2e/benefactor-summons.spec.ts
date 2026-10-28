import {expect,test,type Page} from '@playwright/test';
import {chapterSevenRefugeStart} from '../../src/dev/canonical-saves';
import {capture,inspect} from './controls';
import {approach,importSave} from './navigation';

async function choose(page:Page,label:string){
 const next=page.locator('.dialogue-actions').getByRole('button',{name:/Next$/});
 while(await next.count())await next.click();
 await page.locator('.dialogue-actions').getByRole('button',{name:label,exact:true}).click();
}
for(const [device,viewport,dpr,reduced]of [['desktop',{width:1280,height:800},1,false],['phone',{width:390,height:844},1.25,true]]as const)test.describe(`final reinforcements on ${device}`,()=>{
 test.use({viewport,deviceScaleFactor:dpr,reducedMotion:reduced?'reduce':'no-preference'});
 for(const [form,label]of [[1,'Campaign · hollow sun'],[2,'Campaign · exposed heart']]as const)test(`${label} reveals summoned actors at impact and restart removes them`,async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('/?dev=boss');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop',{timeout:30000});
  await page.evaluate(async()=>{
   // @ts-expect-error Vite serves the isolated preview host; observation stays out of production.
   const {Adventure}:typeof import('../../src/game/adventure')=await import('/src/game/adventure.ts');
   const preview=Adventure.prototype.previewBattle;
   Adventure.prototype.previewBattle=function(...args){(window as unknown as {summonScene:InstanceType<typeof Adventure>}).summonScene=this;preview.apply(this,args);};
  });
  await page.getByRole('button',{name:label,exact:true}).click();await expect.poll(async()=>(await inspect(page)).mode).toBe('battle');
  await page.evaluate(async form=>{
   // @ts-expect-error Use the actual campaign form, with only its initiative advanced for this presentation fixture.
   const {benefactorCampaignPreview}:typeof import('../../src/dev/benefactor-campaign-preview')=await import('/src/dev/benefactor-campaign-preview.ts');
   // @ts-expect-error Vite serves the real scene.
   const {Adventure}:typeof import('../../src/game/adventure')=await import('/src/game/adventure.ts');
   const scene=(window as unknown as {summonScene:InstanceType<typeof Adventure>}).summonScene,{battle,presentation}=benefactorCampaignPreview(form);
   battle.queue=['benefactor',...battle.queue.filter(id=>id!=='benefactor')];scene.previewBattle(battle,()=>{},presentation);
  },form);
  const hold=async(impact:boolean)=>page.waitForFunction(impact=>{
   const scene=(window as unknown as {summonScene:{enemyAttack?:{impact:boolean};time:{timeScale:number};tweens:{timeScale:number}}}).summonScene;
   if(scene.enemyAttack?.impact!==impact)return false;scene.time.timeScale=0;scene.tweens.timeScale=0;return true;
  },impact);
  const resume=async()=>page.evaluate(()=>{const scene=(window as unknown as {summonScene:{time:{timeScale:number};tweens:{timeScale:number}}}).summonScene;scene.time.timeScale=1;scene.tweens.timeScale=1;});
  if(!reduced){await hold(false);expect((await inspect(page)).actors.filter(a=>['herald','glasswing'].includes(a.hero))).toHaveLength(0);await capture(page,`summon-${form}-windup-${device}`);await resume();}
  await hold(true);const seen=await inspect(page),arrivals=seen.battle!.units.filter(u=>u.id.startsWith('benefactor-minion-'));
  expect(arrivals).toHaveLength(2);expect(seen.actors.filter(a=>['herald','glasswing'].includes(a.hero))).toHaveLength(2);
  expect(arrivals.every(u=>!seen.battle!.queue.includes(u.id))).toBe(true);expect(seen.battle!.queue[0]).toBe('benefactor');
  await capture(page,`summon-${form}-impact-${device}`);await resume();
  await expect.poll(async()=>!(await inspect(page)).busy).toBe(true);
  await expect(page.locator('#battle-hint')).toContainText('Calls up to two minions');
  await page.getByRole('button',{name:'Restart battle',exact:true}).click();
  expect((await inspect(page)).battle!.units.some(u=>u.id.startsWith('benefactor-minion-'))).toBe(false);
  await page.getByRole('button',{name:'Win battle',exact:true}).click();await expect(page.getByRole('heading',{name:'Practice complete',exact:true})).toBeVisible();
  await page.waitForTimeout(1100);expect((await inspect(page)).actors.filter(a=>['herald','glasswing'].includes(a.hero))).toHaveLength(0);
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 });
 test('the final refuge sells the river training and lantern housing and reloads both purchases',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');const s=chapterSevenRefugeStart();s.coins=1000;
  await importSave(page,s);if(await page.getByRole('button',{name:'Skip scene',exact:true}).isVisible())await page.getByRole('button',{name:'Skip scene',exact:true}).click();
  await approach(page,'refuge-seven-rest');await choose(page,'Training · permanent improvements');await choose(page,'Specialist improvements');
  await choose(page,'River courier training · 450 marks');await capture(page,`river-training-confirm-${device}`);await choose(page,'Cancel improvement');expect((await inspect(page)).state.coins).toBe(1000);
  for(const [name,cost]of [['River courier training',450],['Reinforced lantern housing',400]]as const){await choose(page,`${name} · ${cost} marks`);await choose(page,`Confirm · ${cost} marks`);}
  const next=page.locator('.dialogue-actions').getByRole('button',{name:/Next$/});while(await next.count())await next.click();
  for(const name of ['River courier training','Reinforced lantern housing'])await expect(page.getByRole('button',{name:`${name} · Completed`,exact:true})).toBeDisabled();
  await capture(page,`final-specialties-${device}`);await choose(page,'Back to training');await choose(page,'Leave training');
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).state.coins).toBe(150);
  const state=(await inspect(page)).state;expect(state.flags['improved-kit-footing']).toBe(true);expect(state.flags['improved-nell-housing']).toBe(true);expect(state.party).toEqual(s.party);
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 });
});
