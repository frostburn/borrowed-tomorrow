import { test, expect, type Page } from '@playwright/test';
import { inspect, capture, clickHex } from './controls';
import { importSave } from './navigation';
import { checkpoint } from '../support/progress';
import { occupiedHexes } from '../../src/rules/footprint';
import { ABILITIES, active, damage, legalAim, movement, targets, type AbilityId, type Battle } from '../../src/rules/combat';
import { equal, key, toPixel } from '../../src/rules/hex';

const route='/?dev=boss&boss=flagship';
const ready=(page:Page)=>expect.poll(async()=>(await inspect(page)).busy).toBe(false);
async function clickBody(page:Page,x:number,y:number){
 const view=(await inspect(page)).view,box=(await page.locator('#canvas canvas').boundingBox())!;
 await page.mouse.click(box.x+(x-view.scrollX)*box.width/view.width,box.y+y*box.height/view.height);
}
for(const [device,viewport,dpr]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const){
 test(`flagship picker, body targeting, presets and campaign isolation on ${device}`,async({browser})=>{
  const context=await browser.newContext({viewport,deviceScaleFactor:dpr,reducedMotion:'reduce'}),page=await context.newPage();
  try{
   const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await page.goto('/');await importSave(page,checkpoint('orrinJoined'));const original=(await inspect(page)).state;
   await page.goto(route);await expect(page.getByRole('heading',{name:'Alban’s flagship',exact:true})).toBeVisible();await capture(page,`flagship-picker-${device}`);
   await page.getByRole('button',{name:'Start Chapter Five preset',exact:true}).click();
   const start=await inspect(page),b=start.battle!,gun=b.units.find(u=>u.id==='flagship-port')!,nell=b.units.find(u=>u.id==='nell')!;
   expect(b.encounter).toBe('dev-flagship');expect(b.units.filter(u=>u.footprint?.length===3)).toHaveLength(3);
   expect(b.units.filter(u=>u.side==='party').map(u=>u.id)).toEqual(['nell','orrin','petra']);
   expect(start.actors.filter(a=>['nell','orrin','petra'].includes(a.hero)).every(a=>a.texture.endsWith('-back'))).toBe(true);
   expect(b.units.filter(u=>u.side==='party').every(u=>toPixel(u.hex).y>Math.max(...occupiedHexes(gun).map(h=>toPixel(h).y)))).toBe(true);
   await capture(page,`flagship-battle-${device}`);
   await page.getByRole('button',{name:/^3\s+Lantern burst$/}).click();
   // A painted gun barrel above its occupied hexes still picks its nearest legal contact.
   await clickBody(page,281,190);await expect(page.locator('#confirmation')).toContainText('Port battery');
   await capture(page,`flagship-target-${device}`);await page.getByRole('button',{name:'Confirm attack',exact:true}).click();
   await expect.poll(async()=>(await inspect(page)).battle!.units.find(u=>u.id===gun.id)!.hp).toBe(gun.hp-damage(nell,gun,'burst'));
   await page.getByRole('button',{name:'Restart battle',exact:true}).click();expect((await inspect(page)).battle!.units.find(u=>u.id===gun.id)!.hp).toBe(100);
   await page.getByRole('button',{name:'Win battle',exact:true}).click();await expect(page.getByRole('heading',{name:'Practice complete',exact:true})).toBeVisible();await page.getByRole('button',{name:'Back to workshop',exact:true}).click();
   await page.getByRole('button',{name:'Start exposed bridge',exact:true}).click();const exposed=(await inspect(page)).battle!;
   expect(exposed.units.filter(u=>u.id==='flagship-port'||u.id==='flagship-starboard').every(u=>u.hp===0&&!u.intent)).toBe(true);
   expect(exposed.units.find(u=>u.id==='flagship-bridge')).toMatchObject({sealed:false,intent:{name:'Emergency broadside'}});await capture(page,`flagship-bridge-${device}`);
   await page.getByRole('button',{name:'Lose battle',exact:true}).click();await expect(page.getByRole('heading',{name:'Practice defeated',exact:true})).toBeVisible();await page.getByRole('button',{name:'Back to workshop',exact:true}).click();
   await page.getByRole('button',{name:'Use workshop party',exact:true}).click();expect((await inspect(page)).battle!.units.filter(u=>u.side==='party').map(u=>u.id)).toEqual(['nell','orrin']);await page.keyboard.press('Escape');
   await page.reload();await expect(page.getByRole('heading',{name:'Alban’s flagship',exact:true})).toBeVisible();
   await page.getByRole('button',{name:'Heart regulator',exact:true}).click();await expect(page.getByRole('button',{name:'Start Chapter Three preset',exact:true})).toBeVisible();
   await page.getByRole('button',{name:'The Benefactor',exact:true}).click();await expect(page.getByRole('button',{name:'Start finale preset',exact:true})).toBeVisible();
   await page.goto('/');await page.getByRole('button',{name:'Continue',exact:true}).click();const returned=(await inspect(page)).state;expect({...returned,playSeconds:original.playSeconds}).toEqual(original);
   expect(errors).toEqual([]);
  }finally{await context.close();}
 });
}

test('the whole flagship sways without moving hexes, respects reduced motion, and cancels recoil on restart',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'no-preference'});
 await page.goto(route);await page.getByRole('button',{name:'Start Chapter Five preset',exact:true}).click();await page.mouse.move(0,0);
 const sample=()=>page.evaluate(()=>{const c=document.querySelector<HTMLCanvasElement>('.pixel-output')!,p=c.getContext('2d')!.getImageData(0,0,c.width,c.height).data;let h=2166136261;for(let i=0;i<p.length;i+=4)h=Math.imul(h^p[i],16777619);return h>>>0;});
 const original=(await inspect(page)).battle!.units.map(u=>({...u.hex})),frames=new Set<number>(),positions:{x:number;y:number}[]=[];
 for(let i=0;i<9;i++){
  await page.waitForTimeout(1000);frames.add(await sample());const s=await inspect(page);
  const parts=['flagship-port','flagship-starboard','flagship-bridge'].map(texture=>s.actors.find(a=>a.texture===texture)!);
  const shift=parts.map((a,j)=>({x:a.x-[281,645,493][j],y:a.y-[286,286,233][j]}));positions.push(shift[0]);
  for(const d of shift){expect(d.x).toBeCloseTo(shift[0].x,6);expect(d.y).toBeCloseTo(shift[0].y,6);expect(Math.abs(d.x)).toBeLessThanOrEqual(2);expect(Math.abs(d.y)).toBeLessThanOrEqual(3);}
  expect(s.battle!.units.map(u=>u.hex)).toEqual(original);
 }
 expect(frames.size).toBeGreaterThan(2);expect(Math.max(...positions.map(p=>p.y))-Math.min(...positions.map(p=>p.y))).toBeGreaterThan(4);

 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(200);const still=await sample();await page.waitForTimeout(400);expect(await sample()).toBe(still);const settled=(await inspect(page)).actors;expect(settled.find(a=>a.texture==='flagship-port')).toMatchObject({x:281,y:286});expect(settled.find(a=>a.texture==='flagship-bridge')).toMatchObject({x:493,y:233});
 await page.emulateMedia({reducedMotion:'no-preference'});
 for(let i=0;i<3;i++){await ready(page);await page.getByRole('button',{name:/^F\s+Defend$/}).click();}
 await expect.poll(async()=>(await inspect(page)).actors.some(a=>a.texture==='flagship-port-fire'),{timeout:15000,intervals:[50]}).toBe(true);await capture(page,'flagship-cannon-recoil');
 await page.getByRole('button',{name:'Restart battle',exact:true}).click();await page.mouse.move(0,0);await page.waitForTimeout(1500);
 const restarted=await inspect(page);expect(restarted.battle!.round).toBe(1);expect(restarted.battle!.units.filter(u=>u.side==='party').every(u=>u.hp===u.maxHp)).toBe(true);expect(restarted.actors.some(a=>a.texture.endsWith('-fire'))).toBe(false);
 await page.keyboard.press('Escape');await expect(page.getByRole('heading',{name:'Alban’s flagship',exact:true})).toBeVisible();expect(errors).toEqual([]);
});

test('@journey the flagship is defeated through ordinary component combat',async({page})=>{
 test.setTimeout(240000);await page.emulateMedia({reducedMotion:'reduce'});const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(route);await page.getByRole('button',{name:'Start Chapter Five preset',exact:true}).click();let exposed=false;
 for(let step=0;step<300;step++){
  const s=await inspect(page),saved=s.battle!,bridge=saved.units.find(u=>u.id==='flagship-bridge')!;exposed||=!bridge.sealed;
  if(saved.result==='victory'){await expect(page.getByRole('heading',{name:'Practice complete',exact:true})).toBeVisible();await capture(page,'flagship-victory');expect(exposed).toBe(true);expect(saved.units.filter(u=>u.side==='enemy').every(u=>u.hp===0)).toBe(true);expect(errors).toEqual([]);return;}
  expect(saved.result).not.toBe('defeat');if(s.busy||active(saved as unknown as Battle)?.side!=='party'){await page.waitForTimeout(150);continue;}
  const b={...saved,obstacles:new Set(saved.obstacles),water:new Set(saved.water),vents:new Set(saved.vents)} as Battle,u=active(b)!,original=u.hex;
  const danger=new Set(b.units.filter(v=>v.side==='enemy'&&v.hp>0).flatMap(v=>v.intent?.cells.map(key)??[]));
  let best:{position:typeof original;ability:AbilityId;aim:typeof original;score:number}|undefined;
  for(const reach of movement(b,u).values()){
   u.hex=reach.hex;
   for(const id of u.abilities){
    const a=ABILITIES[id];if(a.effect)continue;
    const aims=a.range===0?[u.hex]:b.units.filter(v=>v.hp>0).flatMap(v=>occupiedHexes(v));
    for(const aim of aims){
     if(!legalAim(b,u,id,aim))continue;
     let score=-reach.cost*.1-(danger.has(key(reach.hex))?150:0);
     for(const v of targets(b,u,id,aim)){const amount=damage(u,v,id);score+=a.heal?(v.hp<v.maxHp*.65?amount*1.6:0):v.side!==u.side?Math.min(v.hp,amount)+(v.hp<=amount?10:0):-amount*4;}
     if(score>0&&(!best||score>best.score))best={position:reach.hex,ability:id,aim,score};
    }
   }
  }
  u.hex=original;
  if(!best){await page.getByRole('button',{name:/^F\s+Defend$/}).click();continue;}
  if(!equal(best.position,original)){
   await page.getByRole('button',{name:/^1\s+Move$/}).click();await clickHex(page,best.position);await page.getByRole('button',{name:/^Confirm move/}).click();
  }else{
   const a=ABILITIES[best.ability];await page.getByRole('button',{name:new RegExp(`^\\d\\s+${a.name}$`)}).click();await clickHex(page,best.aim);
   await page.getByRole('button',{name:a.heal?'Confirm healing':'Confirm attack',exact:true}).click();
  }
  await page.waitForTimeout(130);
 }
 throw Error('Flagship combat exceeded the action budget.');
});
