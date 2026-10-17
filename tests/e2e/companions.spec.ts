import { expect, test, type Page } from '@playwright/test';
import { defaultBuild, newCharacterSettings } from '../../src/rules/characters';
import { equipItem, newInventory, receiveItem } from '../../src/rules/inventory';
import { offset } from '../../src/rules/hex';
import { battle, capture, clickHex, inspect } from './controls';

async function choose(page:Page,name:string){await page.getByRole('group',{name:'Character',exact:true}).getByRole('button',{name,exact:true}).click();}
async function tab(page:Page,name:string){await page.getByRole('navigation',{name:'Workshop panels'}).getByRole('button',{name,exact:true}).click();}
async function level(page:Page,name:string,value:number){const input=page.getByRole('spinbutton',{name:`${name} level`,exact:true});await input.fill(String(value));await input.press('Tab');}
async function stats(page:Page,name:string,values:Record<string,number>){for(const [stat,value] of Object.entries(values))await page.getByRole('spinbutton',{name:`${name} ${stat}`,exact:true}).fill(String(value));await page.getByRole('button',{name:'Apply base stats',exact:true}).click();}

for(const [device,viewport] of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]] as const){
  test(`future companions form a persistent three-person party and use their roles on ${device}`,async({page})=>{
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    await page.setViewportSize(viewport);await page.goto('/?dev=workshop');
    await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop');
    for(const name of ['Nell','Orrin','Kit','Celia','Petra'])await expect(page.getByRole('group',{name:'Character',exact:true}).getByRole('button',{name,exact:true})).toBeInViewport();
    await choose(page,'Kit');await expect(page.getByRole('region',{name:'Kit equipment'})).toContainText('Nell thanks him');
    await page.getByRole('button',{name:'Add Kit to party',exact:true}).click();await capture(page,`companions-roster-${device}`);await level(page,'Kit',5);await stats(page,'Kit',{'Starting focus':1});
    await capture(page,`companions-kit-${device}`);
    await tab(page,'Equipment');await page.getByRole('button',{name:/^Courier sight/}).click();await page.getByRole('button',{name:'Equip on Kit',exact:true}).click();
    await choose(page,'Celia');await expect(page.getByRole('button',{name:'Add Celia to party',exact:true})).toBeDisabled();
    await expect(page.getByRole('region',{name:'Practice party',exact:true})).toContainText('3 / 3');
    await choose(page,'Orrin');await page.getByRole('button',{name:'Remove Orrin from party',exact:true}).click();
    await choose(page,'Celia');await page.getByRole('button',{name:'Add Celia to party',exact:true}).click();await tab(page,'Character');await level(page,'Celia',5);await stats(page,'Celia',{Speed:30});
    await tab(page,'Equipment');await page.getByRole('button',{name:/^Medic clasp/}).click();await page.getByRole('button',{name:'Equip on Celia',exact:true}).click();
    await choose(page,'Nell');await page.getByRole('button',{name:'Remove Nell from party',exact:true}).click();
    await choose(page,'Petra');await page.getByRole('button',{name:'Add Petra to party',exact:true}).click();await tab(page,'Character');await level(page,'Petra',3);
    await stats(page,'Petra',{'Max HP':120,Attack:1,Speed:29,Movement:10,'Starting focus':2});
    await page.reload();await expect(page.getByRole('region',{name:'Practice party',exact:true})).toContainText('Kit · Celia · Petra');
    await expect(page.getByRole('button',{name:'Add Nell to party',exact:true})).toBeDisabled();
    for(const name of ['Kit','Celia','Petra']){
      await choose(page,name);const image=page.getByRole('region',{name:`${name} equipment`}).getByRole('img',{name,exact:true});
      await expect(image).toHaveAttribute('src',new RegExp(`/portrait-${name.toLowerCase()}\\.png$`));
      await expect.poll(()=>image.evaluate(i=>({w:(i as HTMLImageElement).naturalWidth,h:(i as HTMLImageElement).naturalHeight}))).toEqual({w:128,h:128});
    }
    await page.getByRole('button',{name:'Test battle',exact:true}).click();
    await expect.poll(async()=>(await inspect(page)).battle?.queue[0]).toBe('celia');
    const initial=(await inspect(page)).battle!,party=initial.units.filter(u=>u.side==='party');
    expect(party.map(u=>u.id)).toEqual(['kit','celia','petra']);expect(new Set(party.map(u=>`${u.hex.q},${u.hex.r}`)).size).toBe(3);
    expect(party[0]).toMatchObject({bonus:10,speed:10,focus:1});expect(party[1]).toMatchObject({armor:1,speed:31});expect(party[2]).toMatchObject({armor:1,level:3});
    await capture(page,`companions-trio-${device}`);
    await page.locator('.actions').getByRole('button',{name:/^5\s+Rally$/}).click();await clickHex(page,party[0].hex);
    await expect(page.locator('.prediction')).toContainText('Kit: +2 focus');await page.getByRole('button',{name:'Confirm ability',exact:true}).click();
    await expect.poll(async()=>(await inspect(page)).battle!.units.find(u=>u.id==='kit')!.focus).toBe(3);
    await expect(page.locator('.actions').getByRole('button',{name:/^1\s+Move$/})).toBeEnabled();await page.locator('.actions').getByRole('button',{name:/^1\s+Move$/}).click();await clickHex(page,offset(5,3));
    await page.getByRole('button',{name:/^Confirm move/}).click();await expect(page.locator('.actions').getByRole('button',{name:/^6\s+Saber sweep$/})).toBeEnabled();
    await page.locator('.actions').getByRole('button',{name:/^6\s+Saber sweep$/}).click();await expect(page.getByRole('button',{name:'Confirm attack',exact:true})).toBeInViewport();
    await expect(page.locator('.prediction')).toContainText('Track hound: −3 HP');await capture(page,`companions-sweep-${device}`);await page.getByRole('button',{name:'Confirm attack',exact:true}).click();
    await expect.poll(async()=>(await inspect(page)).battle!.units.find(u=>u.kind==='hound')!.hp).toBe(23);expect((await inspect(page)).battle!.units.find(u=>u.id==='petra')!.hp).toBe(120);
    await expect(page.locator('.actions').getByRole('button',{name:/^1\s+Move$/})).toBeEnabled();await page.locator('.actions').getByRole('button',{name:/^1\s+Move$/}).click();await clickHex(page,offset(4,3));
    await page.getByRole('button',{name:/^Confirm move/}).click();await expect(page.locator('.actions').getByRole('button',{name:/^3\s+Quick shot$/})).toBeEnabled();await page.locator('.actions').getByRole('button',{name:/^3\s+Quick shot$/}).click();await clickHex(page,offset(6,3));
    await expect(page.locator('.prediction')).toContainText('Track hound: −20 HP');await page.getByRole('button',{name:'Confirm attack',exact:true}).click();
    await expect.poll(async()=>(await inspect(page)).battle!.units.find(u=>u.kind==='hound')!.hp).toBe(3);
    await page.getByRole('button',{name:'Workshop',exact:true}).click();await choose(page,'Petra');await page.getByRole('button',{name:'Remove Petra from party',exact:true}).click();await choose(page,'Kit');await page.getByRole('button',{name:'Remove Kit from party',exact:true}).click();
    await choose(page,'Celia');await expect(page.getByRole('button',{name:'Remove Celia from party',exact:true})).toBeDisabled();
    await page.getByRole('button',{name:'Reset workshop',exact:true}).click();await expect(page.getByRole('region',{name:'Practice party',exact:true})).toContainText('Nell · Orrin');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([]);
  });
}

test('old workshop builds and equipment migrate without losing existing edits',async({page})=>{
  await page.goto('/');
  await page.evaluate(({settings,inventory})=>{localStorage.setItem('borrowed-tomorrow:character-workshop:v1',JSON.stringify(settings));localStorage.setItem('borrowed-tomorrow:inventory-workshop:v1',JSON.stringify(inventory));},{
    settings:{version:1,characters:{nell:{...defaultBuild('nell',4),attack:24},orrin:defaultBuild('orrin',2)}},
    inventory:{version:1,bag:{'work-coat':1,'brass-reflector':0},characters:{nell:{fitting:'brass-reflector',coat:'work-coat'},orrin:{fitting:null,coat:null}}},
  });
  await page.goto('/?dev=workshop');await expect(page.getByRole('spinbutton',{name:'Nell level',exact:true})).toHaveValue('4');await expect(page.getByRole('spinbutton',{name:'Nell Attack',exact:true})).toHaveValue('24');
  await expect(page.getByRole('region',{name:'Nell equipment'})).toContainText('Brass reflector');await choose(page,'Kit');await expect(page.getByRole('spinbutton',{name:'Kit level',exact:true})).toHaveValue('1');
  await page.getByRole('button',{name:'Add Kit to party',exact:true}).click();await page.reload();
  await expect(page.getByRole('region',{name:'Practice party',exact:true})).toContainText('Nell · Orrin · Kit');
  await expect(page.getByRole('spinbutton',{name:'Nell Attack',exact:true})).toHaveValue('24');
  const stored=await page.evaluate(()=>({settings:JSON.parse(localStorage.getItem('borrowed-tomorrow:character-workshop:v1')!),inventory:JSON.parse(localStorage.getItem('borrowed-tomorrow:inventory-workshop:v1')!)}));
  expect(stored.settings.version).toBe(2);expect(stored.inventory.version).toBe(2);expect(stored.inventory.bag['work-coat']).toBe(1);
});

test('the replaced courier keeps his saved party, build and equipment after reload',async({page})=>{
  const settings=newCharacterSettings();settings.party=['kit','celia','petra'];settings.characters.kit={...defaultBuild('kit',5),attack:29};
  const inventory=newInventory();receiveItem(inventory,'courier-sight');receiveItem(inventory,'work-coat',3);
  equipItem(inventory,'kit','courier-sight');equipItem(inventory,'kit','work-coat');
  const {kit:build,...builds}=settings.characters,{kit:gear,...loadouts}=inventory.characters;
  await page.goto('/');await page.evaluate(({settings,inventory})=>{
    localStorage.setItem('borrowed-tomorrow:character-workshop:v1',JSON.stringify(settings));
    localStorage.setItem('borrowed-tomorrow:inventory-workshop:v1',JSON.stringify(inventory));
  },{settings:{...settings,characters:{...builds,esme:build},party:['esme','celia','petra']},inventory:{...inventory,characters:{...loadouts,esme:gear}}});
  await page.goto('/?dev=workshop');await expect(page.getByRole('region',{name:'Practice party',exact:true})).toContainText('Kit · Celia · Petra');
  await choose(page,'Kit');await expect(page.getByRole('spinbutton',{name:'Kit level',exact:true})).toHaveValue('5');
  await expect(page.getByRole('spinbutton',{name:'Kit Attack',exact:true})).toHaveValue('29');
  await expect(page.getByRole('region',{name:'Kit equipment'})).toContainText('Courier sight');
  await page.getByRole('button',{name:'Apply base stats',exact:true}).click();await page.reload();await choose(page,'Kit');
  await expect(page.getByRole('spinbutton',{name:'Kit Attack',exact:true})).toHaveValue('29');
  const stored=await page.evaluate(()=>({settings:JSON.parse(localStorage.getItem('borrowed-tomorrow:character-workshop:v1')!),inventory:JSON.parse(localStorage.getItem('borrowed-tomorrow:inventory-workshop:v1')!)}));
  expect(stored.settings).toEqual(settings);expect(stored.inventory).toEqual(inventory);
});

test('future-companion portraits keep their native geometry on a compact phone',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:320,height:844});await page.goto('/?dev=workshop');
  for(const name of ['Kit','Celia','Petra']){
    await choose(page,name);
    const image=page.getByRole('region',{name:`${name} equipment`}).getByRole('img',{name,exact:true});
    await expect.poll(()=>image.evaluate(i=>{
      const box=i.getBoundingClientRect(),scale=window.borrowedTomorrowPixels.inspect().cssScale,img=i as HTMLImageElement;
      return {width:box.width/scale,height:box.height/scale,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight};
    })).toEqual({width:128,height:128,naturalWidth:128,naturalHeight:128});
    expect(await page.locator('.inventory-panel').evaluate(p=>p.scrollWidth<=p.clientWidth)).toBe(true);
  }
  await capture(page,'companions-compact-phone');expect(errors).toEqual([]);
});

test('@journey the future-companion trio wins practice and keeps its selected party',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/?dev=workshop');await page.getByRole('button',{name:'Remove Nell from party',exact:true}).click();
  await choose(page,'Kit');await page.getByRole('button',{name:'Add Kit to party',exact:true}).click();
  await choose(page,'Orrin');await page.getByRole('button',{name:'Remove Orrin from party',exact:true}).click();
  for(const name of ['Celia','Petra']){await choose(page,name);await page.getByRole('button',{name:`Add ${name} to party`,exact:true}).click();}
  await tab(page,'Equipment');
  for(const [name,fitting] of [['Kit','Courier sight'],['Celia','Medic clasp'],['Petra','Balanced saber hilt']]){
    await choose(page,name);await page.getByRole('button',{name:new RegExp(`^${fitting}`)}).click();await page.getByRole('button',{name:`Equip on ${name}`,exact:true}).click();
    await page.getByRole('button',{name:/^Reinforced work coat/}).click();await page.getByRole('button',{name:`Equip on ${name}`,exact:true}).click();
  }
  await page.getByRole('button',{name:'Test battle',exact:true}).click();await battle(page,'companions-practice',true);
  await expect(page.getByRole('region',{name:'Practice party',exact:true})).toContainText('Kit · Celia · Petra');
  const state=(await inspect(page)).state;expect(state.xp).toBe(0);expect(state.coins).toBe(0);expect(state.gear).toEqual([]);expect(errors).toEqual([]);
});
