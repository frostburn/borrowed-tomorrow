import {expect,test} from '@playwright/test';
import {battleMenuFlows,commandsFit} from './battle-menu-flow';
import {defaultBuild,newCharacterSettings} from '../../src/rules/characters';
import type {CompanionId} from '../../src/rules/party';
import {capture,clickHex,inspect} from './controls';
import {offset,fromPixel,equal,distance} from '../../src/rules/hex';
import {movement,damage,type Battle} from '../../src/rules/combat';
import {occupiedHexes} from '../../src/rules/footprint';
import {basicStrike} from '../../src/game/battle-basic';
battleMenuFlows();

const parties:CompanionId[][]=[['nell','orrin','kit'],['orrin','nell','celia'],['kit','nell','petra'],['celia','orrin','petra'],['petra','celia','kit']];
for(const [device,viewport,dpr]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25],['narrow phone',{width:320,height:740},1]]as const){
 test(`every level-15 command fits on ${device}`,async({browser})=>{
  const context=await browser.newContext({viewport,deviceScaleFactor:dpr,reducedMotion:'reduce'});
  try{for(const party of parties){
   const hero=party[0],settings=newCharacterSettings();settings.party=party;
   for(const id of party){settings.characters[id]=defaultBuild(id,15);settings.characters[id].speed=id===hero?30:1;}
   const page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(s=>localStorage.setItem('borrowed-tomorrow:character-workshop:v3',JSON.stringify(s)),settings);
   await page.goto('/?dev=combat');await page.getByRole('button',{name:'Practice current workshop party',exact:true}).click();
   expect((await inspect(page)).battle!.queue[0]).toBe(hero);await expect(page.locator('.actions button')).toHaveCount(10);await commandsFit(page);
   if(hero==='nell'||hero==='petra')await capture(page,`battle-all-skills-${hero}-${device.replace(' ','-')}`);
   if(hero==='nell'){
    const before=(await inspect(page)).battle!;await clickHex(page,offset(3,3));
    await expect(page.locator('.stage-wrap #confirmation')).toHaveCount(0);await commandsFit(page);await expect(page.getByRole('button',{name:'Confirm attack',exact:true})).toBeVisible();
    await page.getByRole('button',{name:'Move here',exact:true}).click();await expect(page.getByRole('button',{name:/^Confirm move/})).toBeVisible();
    await page.getByRole('button',{name:'Cancel',exact:true}).click();expect((await inspect(page)).battle).toEqual(before);
    await clickHex(page,offset(7,3));await expect(page.locator('#confirmation')).toContainText('Out of range');await expect(page.locator('#confirmation button')).toHaveCount(0);expect((await inspect(page)).battle).toEqual(before);
   }
   expect(errors).toEqual([]);await page.close();
  }}finally{await context.close();}
 });
}

for(const [device,viewport,dpr]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const)test(`basic command targets the regulator body on ${device}`,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:dpr,reducedMotion:'reduce'}),page=await context.newPage();
 try{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/?dev=boss&boss=conduit&route=pressure');
  await page.getByRole('button',{name:'Start Chapter Three preset',exact:true}).click();
  const snapshot=(await inspect(page)).battle!,boss=snapshot.units.find(u=>u.id==='conduit-regulator')!,body={x:463,y:150};
  expect(occupiedHexes(boss).some(h=>equal(h,fromPixel(body.x,body.y)))).toBe(false);
  const tap=async()=>{const view=(await inspect(page)).view,box=(await page.locator('.world-input').boundingBox())!;await page.mouse.click(box.x+(body.x-view.scrollX)*box.width/view.width,box.y+body.y*box.height/view.height);};
  const initialBattle={...snapshot,obstacles:new Set(snapshot.obstacles),water:new Set(snapshot.water),vents:new Set(snapshot.vents)} as Battle;
  const initialActor=initialBattle.units.find(u=>u.id===initialBattle.queue[0])!,approach=basicStrike(initialBattle,initialActor,boss.hex);
  await tap();
  if(approach?.visit){await expect(page.getByRole('button',{name:'Confirm move + strike',exact:true})).toBeVisible();await page.getByRole('button',{name:'Cancel',exact:true}).click();}
  else{await expect(page.locator('#confirmation')).toContainText('Out of range');await expect(page.locator('#confirmation button')).toHaveCount(0);}
  expect((await inspect(page)).battle).toEqual(snapshot);
  const b={...snapshot,obstacles:new Set(snapshot.obstacles),water:new Set(snapshot.water),vents:new Set(snapshot.vents)} as Battle,u=b.units.find(u=>u.id===b.queue[0])!;
  const visit=[...movement(b,u).values()].filter(v=>v.path.length&&occupiedHexes(boss).some(h=>distance(v.hex,h)===1)).sort((a,b)=>a.path.length-b.path.length)[0];expect(visit).toBeTruthy();
  await page.keyboard.press('1');await clickHex(page,visit.hex);await page.getByRole('button',{name:/^Confirm move/}).click();await expect.poll(async()=>(await inspect(page)).busy).toBe(false);
  await page.getByRole('button',{name:/^1\s+Move \/ Strike$/}).click();await tap();await expect(page.getByRole('button',{name:'Confirm attack',exact:true})).toBeVisible();await expect(page.locator('#confirmation')).toContainText('Heart regulator');
  const ready=(await inspect(page)).battle!,actor=ready.units.find(v=>v.id===u.id)!,target=ready.units.find(v=>v.id===boss.id)!;const hit=damage(actor,target,'strike');
  await capture(page,`basic-boss-body-${device}`);await page.getByRole('button',{name:'Confirm attack',exact:true}).click();expect((await inspect(page)).battle!.units.find(v=>v.id===boss.id)!.hp).toBe(target.hp-hit);expect(errors).toEqual([]);
 }finally{await context.close();}
});

for(const [device,viewport,dpr]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const)test(`enemy click confirms approach and strike together on ${device}`,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:dpr,reducedMotion:'reduce'}),page=await context.newPage();
 try{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  const settings=newCharacterSettings();settings.party=['nell','orrin','kit'];
  for(const id of settings.party){settings.characters[id]=defaultBuild(id,15);settings.characters[id].speed=id==='nell'?30:1;settings.characters[id].movement=6;}
  await page.addInitScript(s=>localStorage.setItem('borrowed-tomorrow:character-workshop:v3',JSON.stringify(s)),settings);
  await page.goto('/?dev=combat');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop');await page.getByRole('button',{name:'Practice current workshop party',exact:true}).click();
  const before=(await inspect(page)).battle!,b={...before,obstacles:new Set(before.obstacles),water:new Set(before.water),vents:new Set(before.vents)} as Battle,u=b.units.find(u=>u.id==='nell')!;
  const enemy=b.units.find(v=>v.side==='enemy'&&basicStrike(b,u,v.hex)?.visit)!;expect(enemy).toBeTruthy();const approach=basicStrike(b,u,enemy.hex)!;
  await clickHex(page,enemy.hex);await expect(page.getByRole('button',{name:'Confirm move + strike',exact:true})).toBeVisible();await expect(page.locator('#confirmation')).toContainText(`Move ${approach.visit!.path.length} hexes`);
  expect(await page.getByRole('button',{name:'Confirm move + strike',exact:true}).evaluate(b=>b.scrollHeight-b.clientHeight)).toBeLessThanOrEqual(1);
  expect((await inspect(page)).battle).toEqual(before);await page.getByRole('button',{name:'Cancel',exact:true}).click();expect((await inspect(page)).battle).toEqual(before);
  await clickHex(page,enemy.hex);await capture(page,`approach-strike-${device}`);await page.getByRole('button',{name:'Confirm move + strike',exact:true}).click();
  const after=(await inspect(page)).battle!,actor=after.units.find(v=>v.id===u.id)!,victim=after.units.find(v=>v.id===enemy.id)!;
  expect(actor.hex).toEqual(approach.visit!.hex);expect(actor.moved).toBe(true);expect(victim.hp).toBeLessThan(enemy.hp);expect(after.queue).not.toContain(u.id);
  await expect.poll(async()=>(await inspect(page)).busy).toBe(false);await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await context.close();}
});
