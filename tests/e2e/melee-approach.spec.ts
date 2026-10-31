import {test,expect} from '@playwright/test';
import {newCharacterSettings,defaultBuild} from '../../src/rules/characters';
import {approachAttack} from '../../src/game/battle-basic';
import {abilityFor} from '../../src/rules/skills';
import type {Battle} from '../../src/rules/combat';
import {inspect,clickHex,capture} from './controls';

for(const [device,viewport,dpr]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const)
for(const [id,name,hero]of [['crush','Crushing blow','petra'],['bash','Shield bash','petra'],['sweep','Saber sweep','petra'],['repulse','Pressure wave','orrin']]as const)
test(`${name} confirms its approach and skill together on ${device}`,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:dpr,reducedMotion:device==='phone'?'reduce':'no-preference'}),page=await context.newPage(),errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  const settings=newCharacterSettings();settings.party=['petra','orrin','kit'];
  for(const fighter of settings.party){settings.characters[fighter]=defaultBuild(fighter,15);settings.characters[fighter].speed=fighter===hero?30:1;settings.characters[fighter].movement=6;}
  await page.addInitScript(s=>localStorage.setItem('borrowed-tomorrow:character-workshop:v3',JSON.stringify(s)),settings);
  await page.goto('/?dev=combat');await page.getByRole('button',{name:'Practice current workshop party',exact:true}).click();
  await expect.poll(async()=>{const s=await inspect(page);return !s.busy&&s.battle?.queue[0];}).toBe(hero);
  const before=(await inspect(page)).battle!,b={...before,obstacles:new Set(before.obstacles),water:new Set(before.water),vents:new Set(before.vents)}as Battle;
  const actor=b.units.find(u=>u.id===hero)!,enemy=b.units.find(u=>u.side==='enemy'&&approachAttack(b,actor,id,u.hex)?.visit)!;
  expect(enemy).toBeTruthy();const plan=approachAttack(b,actor,id,enemy.hex)!;
  await page.getByRole('button',{name:new RegExp(name)}).click();await clickHex(page,enemy.hex);
  const confirm=page.getByRole('button',{name:`Confirm move + ${name}`,exact:true});await expect(confirm).toBeVisible();
  await expect(page.locator('#confirmation')).toContainText(`Move ${plan.visit!.path.length} hexes`);
  expect(await confirm.evaluate(b=>b.scrollHeight-b.clientHeight)).toBeLessThanOrEqual(1);
  expect((await inspect(page)).battle).toEqual(before);await page.getByRole('button',{name:'Cancel',exact:true}).click();expect((await inspect(page)).battle).toEqual(before);
  await clickHex(page,enemy.hex);await capture(page,`approach-${id}-${device}`);
  if(device==='desktop')await page.keyboard.press('Enter');else await confirm.click();
  await expect.poll(async()=>(await inspect(page)).busy,{timeout:15000}).toBe(false);
  const after=(await inspect(page)).battle!,mover=after.units.find(u=>u.id===hero)!,victim=after.units.find(u=>u.id===enemy.id)!;
  expect(mover.hex).toEqual(plan.visit!.hex);expect(mover.moved).toBe(true);expect(mover.focus).toBe(actor.focus-abilityFor(actor,id).cost);
  if(id==='bash'){expect(victim.hp).toBe(enemy.hp);expect(mover.bonusUsed).toBe(true);expect(after.queue[0]).toBe(hero);}
  else expect(victim.hp).toBeLessThan(enemy.hp);
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await context.close();}
});
