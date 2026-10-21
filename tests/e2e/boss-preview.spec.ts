import {test,expect,type Page} from '@playwright/test';
import {inspect,capture,clickHex} from './controls';
import {importSave} from './navigation';
import {checkpoint} from '../support/progress';
import {occupiedHexes} from '../../src/rules/footprint';
import {toPixel} from '../../src/rules/hex';
import {key,equal} from '../../src/rules/hex';
import {ABILITIES,active,damage,legalAim,movement,targets,type AbilityId,type Battle} from '../../src/rules/combat';

async function clickBody(page:Page){
  const view=(await inspect(page)).view,box=(await page.locator('#canvas canvas').boundingBox())!;
  await page.mouse.click(box.x+(463-view.scrollX)*box.width/view.width,box.y+120*box.height/view.height);
}

test('@journey the finale preset defeats both attack phases through ordinary combat',async({page})=>{
  test.setTimeout(240000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/?dev=boss');await page.getByRole('button',{name:'Start finale preset',exact:true}).click();const phases=new Set<string>();
  for(let step=0;step<300;step++){
    const snapshot=await inspect(page),saved=snapshot.battle!;
    if(saved.result==='victory'){await expect(page.getByRole('heading',{name:'Practice complete',exact:true})).toBeVisible();await capture(page,'boss-victory');expect(phases.size).toBe(2);expect(errors).toEqual([]);return;}
    expect(saved.result).not.toBe('defeat');if(snapshot.busy||active(saved as unknown as Battle)?.side!=='party'){await page.waitForTimeout(150);continue;}
    const b={...saved,obstacles:new Set(saved.obstacles),water:new Set(saved.water),vents:new Set(saved.vents)} as Battle;
    const u=active(b)!,boss=b.units.find(u=>u.id==='benefactor')!;phases.add(boss.intent!.phase);
    const danger=new Set(boss.intent!.cells.map(key)),original=u.hex;
    let best:{position:typeof original;ability:AbilityId;aim:typeof original;score:number}|undefined;
    for(const reach of movement(b,u).values()){
      u.hex=reach.hex;
      for(const id of u.abilities){
        const ability=ABILITIES[id];if(ability.effect)continue;
        const aims=ability.range===0?[u.hex]:[...occupiedHexes(boss),...b.units.filter(v=>v.side==='party').map(v=>v.hex)];
        for(const aim of aims){
          if(!legalAim(b,u,id,aim))continue;
          let score=-reach.cost*.1-(danger.has(key(reach.hex))?300:0);
          for(const target of targets(b,u,id,aim)){
            const amount=damage(u,target,id);
            score+=ability.heal?(target.hp<target.maxHp*.65?amount*1.4:0):target.side!==u.side?Math.min(target.hp,amount):amount*-4;
          }
          if(id==='strike'&&!boss.retaliated&&boss.hp>damage(u,boss,id))score-=damage(boss,u,'strike')*.75;
          if(score>0&&(!best||score>best.score))best={position:reach.hex,ability:id,aim,score};
        }
      }
    }
    u.hex=original;
    if(best&&!equal(best.position,original)){
      await page.getByRole('button',{name:/^1\s+Move$/}).click();await clickHex(page,best.position);await page.getByRole('button',{name:/^Confirm move/}).click();
    }else if(best){
      await page.locator('.actions').getByRole('button',{name:new RegExp(`^\\d\\s+${ABILITIES[best.ability].name}$`)}).click();
      if(ABILITIES[best.ability].range!==0)await clickHex(page,best.aim);
      await page.getByRole('button',{name:ABILITIES[best.ability].heal?'Confirm healing':'Confirm attack',exact:true}).click({timeout:5000});
    }else{
      const safe=[...movement(b,u).values()].find(p=>!danger.has(key(p.hex))&&p.path.length);
      if(danger.has(key(u.hex))&&safe){await page.getByRole('button',{name:/^1\s+Move$/}).click();await clickHex(page,safe.hex);await page.getByRole('button',{name:/^Confirm move/}).click();}
      else await page.getByRole('button',{name:/^F\s+Defend$/}).click();
    }
  }
  throw new Error('The finale preset did not win within the action budget.');
});
/** Compare native SVG chest pixels with the common 2px physical framebuffer. */
async function nativeBoss(page:Page,portrait:string){
  await expect.poll(()=>page.evaluate(async portrait=>{
    const canvas=document.createElement('canvas');canvas.width=360;canvas.height=288;const ctx=canvas.getContext('2d')!;
    const img=new Image();img.src=new URL('benefactor.svg',new URL(portrait,location.href)).href;await img.decode();ctx.drawImage(img,0,0);
    const expected=ctx.getImageData(0,0,360,288).data,view=window.borrowedTomorrow.inspect().view,info=window.borrowedTomorrowPixels.inspect();
    const source=document.querySelector('.pixel-source')!.getBoundingClientRect(),world=document.querySelector('.world-input')!.getBoundingClientRect(),output=document.querySelector<HTMLCanvasElement>('.pixel-output')!;
    const actual=output.getContext('2d')!.getImageData(0,0,output.width,output.height).data;
    const gx=Math.round((world.left-source.left)/info.cssScale)+283+164-view.scrollX,gy=Math.round((world.top-source.top)/info.cssScale)+50+112;
    const left=info.physicalLeft+gx*info.physicalScale,top=info.physicalTop+gy*info.physicalScale;
    let different=0,compared=0;
    for(let y=0;y<48;y++)for(let x=0;x<32;x++){
      const sx=164+Math.floor((gx+x)/info.rasterUnit)*info.rasterUnit-gx,sy=112+Math.floor((gy+y)/info.rasterUnit)*info.rasterUnit-gy,index=(sy*360+sx)*4;
      if(expected[index+3]!==255)continue;
      for(let c=0;c<4;c++){
        compared++;if(Math.abs(actual[((top+y*info.physicalScale)*output.width+left+x*info.physicalScale)*4+c]-expected[index+c])>1)different++;
      }
    }
    return compared>1000?different:-1;
  },portrait)).toBe(0);
}

for(const [device,viewport,dpr] of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]] as const){
 test.describe(`boss preview on ${device}`,()=>{
  test.use({viewport,deviceScaleFactor:dpr});
  test('faces the giant, targets its whole body, resolves warnings and preserves campaign saves',async({page})=>{
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await importSave(page,checkpoint('orrinJoined'));const original=(await inspect(page)).state;
    await page.goto('/?dev=boss');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop');
    await expect(page.getByRole('region',{name:'Boss battle preview'})).toBeVisible();
    const portrait=(await page.locator('img[alt="The hollow sun"]').getAttribute('src'))!;
    expect(portrait).toContain('benefactor-portrait.svg');
    await page.getByRole('button',{name:'Start finale preset',exact:true}).click();
    await expect.poll(async()=>(await inspect(page)).battle?.encounter).toBe('dev-benefactor');
    const start=await inspect(page),boss=start.battle!.units.find(u=>u.id==='benefactor')!;
    expect(occupiedHexes(boss)).toHaveLength(19);expect(start.battle!.units.filter(u=>u.side==='party')).toHaveLength(3);
    expect(start.actors.filter(a=>['nell','petra','celia'].includes(a.hero)).every(a=>a.texture.endsWith('-back'))).toBe(true);
    expect(start.battle!.units.filter(u=>u.side==='party').every(u=>toPixel(u.hex).y>Math.max(...occupiedHexes(boss).map(h=>toPixel(h).y)))).toBe(true);
    await nativeBoss(page,portrait);await capture(page,`boss-arrival-${device}`);
    await page.getByRole('button',{name:/^3\s+Lantern burst$/}).click();await clickBody(page);
    await expect(page.locator('#confirmation')).toContainText('The Benefactor');await page.getByRole('button',{name:'Confirm attack',exact:true}).click();
    await expect.poll(async()=>(await inspect(page)).battle!.units.find(u=>u.id==='benefactor')!.hp).toBe(boss.hp-27);
    for(let i=0;i<2;i++){await expect.poll(async()=>(await inspect(page)).busy).toBe(false);await page.getByRole('button',{name:/^F\s+Defend$/}).click();}
    await expect.poll(async()=>(await inspect(page)).battle?.round).toBe(2);await expect.poll(async()=>(await inspect(page)).busy).toBe(false);
    expect((await inspect(page)).battle!.units.find(u=>u.id==='benefactor')!.intent?.name).toBe('Sundering rays');await capture(page,`boss-rays-${device}`);
    await page.getByRole('button',{name:'Restart battle',exact:true}).click();expect((await inspect(page)).battle!.round).toBe(1);
    await page.locator('#canvas').focus();await page.keyboard.press('ArrowUp');await page.keyboard.press('Enter');
    await expect(page.getByRole('button',{name:/^Confirm move/})).toBeVisible();
    await page.getByRole('button',{name:'Win battle',exact:true}).click();await expect(page.getByRole('heading',{name:'Practice complete',exact:true})).toBeVisible();
    await page.getByRole('button',{name:'Back to workshop',exact:true}).click();await page.getByRole('button',{name:'Start phase two',exact:true}).click();
    expect((await inspect(page)).battle!.units.find(u=>u.id==='benefactor')!.intent?.phase).toBe('The hollow heart');await capture(page,`boss-heart-${device}`);
    await page.keyboard.press('Escape');await page.getByRole('button',{name:'Use workshop party',exact:true}).click();expect((await inspect(page)).battle!.units.filter(u=>u.side==='party').map(u=>u.id)).toEqual(['nell','orrin']);
    await page.keyboard.press('Escape');await expect(page.getByRole('region',{name:'Boss battle preview'})).toBeVisible();
    await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
    await page.goto('/');await page.getByRole('button',{name:'Continue',exact:true}).click();const returned=(await inspect(page)).state;
    expect({...returned,playSeconds:original.playSeconds}).toEqual(original);
  });
 });
}

for(const [device,viewport,dpr]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const){
 test.describe(`boss motion on ${device}`,()=>{
  test.use({viewport,deviceScaleFactor:dpr});
  test('breathes, gathers judgment before contact, recovers and cancels a restarted attack',async({page})=>{
   const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
   await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/?dev=boss');
   await page.getByRole('button',{name:'Start finale preset',exact:true}).click();
   const frames=async(ms:number)=>page.evaluate(ms=>new Promise<{frame:string;motion:string;busy:boolean;x:number;y:number}[]>(resolve=>{
    const samples:{frame:string;motion:string;busy:boolean;x:number;y:number}[]=[],start=performance.now();
    const tick=()=>{const s=window.borrowedTomorrow.inspect(),a=s.actors.find(a=>a.hero==='benefactor');if(a)samples.push({frame:a.frame,motion:a.motion,busy:s.busy,x:a.x,y:a.y});if(performance.now()-start>=ms)resolve(samples);else requestAnimationFrame(tick)};tick();
   }),ms);
   const breathing=await frames(3300);
   expect(new Set(breathing.map(s=>s.frame))).toEqual(new Set(['0','1','2','3','4','5','6','7']));
   expect(breathing.every(s=>s.motion==='breathe'&&!s.busy)).toBe(true);
   expect(new Set(breathing.map(s=>`${s.x},${s.y}`)).size).toBe(1);
   for(let i=0;i<2;i++){await page.getByRole('button',{name:/^F\s+Defend$/}).click();await expect.poll(async()=>(await inspect(page)).busy).toBe(false);}
   const striking=frames(2200);await page.getByRole('button',{name:/^F\s+Defend$/}).click();
   const seen=await striking;
   for(const frame of ['8','9','10','11'])expect(seen.some(s=>s.frame===frame&&s.motion==='attack'&&s.busy)).toBe(true);
   await expect.poll(async()=>{const s=await inspect(page);return s.battle!.round===2&&!s.busy&&s.actors.find(a=>a.hero==='benefactor')?.motion==='breathe';}).toBe(true);
   await capture(page,`boss-breathing-${device}`);
   await page.getByRole('button',{name:'Restart battle',exact:true}).click();
   for(let i=0;i<3;i++){await expect.poll(async()=>(await inspect(page)).busy).toBe(false);await page.getByRole('button',{name:/^F\s+Defend$/}).click();}
   await expect.poll(async()=>(await inspect(page)).actors.find(a=>a.hero==='benefactor')?.frame).toBe('8');
   await capture(page,`boss-windup-${device}`);
   await page.getByRole('button',{name:'Restart battle',exact:true}).click();
   const restarted=await frames(1200);expect(restarted.every(s=>Number(s.frame)<8&&s.motion==='breathe')).toBe(true);
   expect((await inspect(page)).battle!.round).toBe(1);
   await page.emulateMedia({reducedMotion:'reduce'});
   await expect.poll(async()=>(await inspect(page)).actors.find(a=>a.hero==='benefactor')?.motion).toBe('idle');
   expect((await inspect(page)).actors.find(a=>a.hero==='benefactor')?.frame).toBe('0');
   expect(errors).toEqual([]);
  });
 });
}
