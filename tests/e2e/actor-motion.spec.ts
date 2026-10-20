import { expect, test, type Page } from '@playwright/test';
import { active, ABILITIES, legalAim, movement, targets, type AbilityId, type Battle } from '../../src/rules/combat';
import { toPixel, type Hex } from '../../src/rules/hex';
import { checkpoint } from '../support/progress';
import { approach, importSave } from './navigation';
import { capture, clickHex, clickWorld, inspect } from './controls';
import { ATTACK_CONTACT_FRAME, ATTACK_WINDUP_FRAME, WALK_CYCLE_MS, WALK_FRAMES } from '../../src/content/actor-motion';

const record=(page:Page,ms=750)=>page.evaluate(ms=>new Promise<{busy:boolean;actors:ReturnType<Window['borrowedTomorrow']['inspect']>['actors']}[]>(resolve=>{
  const start=performance.now(),samples:{busy:boolean;actors:ReturnType<Window['borrowedTomorrow']['inspect']>['actors']}[]=[];
  const tick=()=>{const s=window.borrowedTomorrow.inspect();samples.push({busy:s.busy,actors:s.actors});if(performance.now()-start>=ms)resolve(samples);else requestAnimationFrame(tick);};tick();
}),ms);

test('Nell and Orrin walk in four directions, stop in idle and survive a skipped moving cutscene',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/');
  const state=checkpoint('orrinJoined');state.location={map:'yard',x:20,y:16};await importSave(page,state);
  for(const [x,y,direction] of [[25,16,'right'],[25,13,'back'],[20,13,'left'],[20,16,'front']] as const){
    const samples=record(page);await clickWorld(page,x,y);const observed=await samples;
    for(const hero of ['nell','orrin']){
      const frames=observed.flatMap(s=>s.actors.filter(a=>a.hero===hero&&a.texture===`${hero}-motion-${direction}`).map(a=>a.frame));
      expect(new Set(frames).size,`${hero} ${direction} gait`).toBeGreaterThanOrEqual(3);
      expect(frames.every(frame=>Number(frame)>=0&&Number(frame)<WALK_FRAMES)).toBe(true);
    }
    await expect.poll(async()=>{const s=await inspect(page);return !s.moving&&s.actors.every(a=>a.motion==='idle');}).toBe(true);
    expect((await inspect(page)).state.location).toEqual({map:'yard',x,y});
  }
  const pass=checkpoint('passSeen');pass.location={map:'tunnel',x:30,y:14};await importSave(page,pass);await approach(page,'captain');
  for(let line=0;line<3;line++)await page.locator('.dialogue-actions button').click();
  const moving=record(page,550);await page.locator('.dialogue-actions button').click();
  await expect.poll(async()=>(await inspect(page)).actors.some(a=>a.hero==='nell'&&a.motion==='walk')).toBe(true);
  expect((await inspect(page)).actors.filter(a=>a.hero==='nell')).toHaveLength(1);
  await capture(page,'nell-cutscene-walk');await page.getByRole('button',{name:'Skip scene',exact:true}).click();await moving;
  await expect.poll(async()=>(await inspect(page)).mode).toBe('battle');
  expect((await inspect(page)).actors.filter(a=>a.hero==='nell')).toHaveLength(1);expect(errors).toEqual([]);
});

for(const [device,viewport] of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]] as const){
  test(`sprite workshop plays, pauses and steps native motion frames on ${device}`,async({page})=>{
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize(viewport);await page.goto('/?dev=sprites');
    const review=page.getByRole('region',{name:'Sprite review',exact:true}),controls=review.getByRole('group',{name:'Animation preview',exact:true});await expect(review).toBeVisible();
    const stored=await page.evaluate(()=>JSON.stringify(localStorage));
    await controls.getByRole('button',{name:'Walk',exact:true}).click();
    const frames=await review.evaluate((element,count)=>new Promise<string[]>(resolve=>{const seen=new Set<string>(),start=performance.now();const tick=()=>{seen.add((element.parentElement as HTMLElement).dataset.frame??'');if(seen.size>=count||performance.now()-start>1500)resolve([...seen]);else requestAnimationFrame(tick);};tick();}),WALK_FRAMES);
    expect(new Set(frames)).toEqual(new Set(['0','1','2','3','4','5']));
    await controls.getByRole('button',{name:'Pause',exact:true}).click();
    await review.getByRole('group',{name:'Sprite zoom',exact:true}).getByRole('button',{name:'3x',exact:true}).click();await review.getByRole('button',{name:'Ground guides',exact:true}).click();
    for(const hero of ['nell','orrin']){
      await review.getByRole('button',{name:`Inspect ${hero==='nell'?'Nell':'Orrin'}`,exact:true}).click();
      await review.getByRole('group',{name:'Facing',exact:true}).getByRole('button',{name:'Right',exact:true}).click();
      for(const motion of ['Walk','Attack']){
      await controls.getByRole('button',{name:motion,exact:true}).click();await controls.getByRole('button',{name:'Pause',exact:true}).click();
      const stopped=await review.evaluate(element=>(element.parentElement as HTMLElement).dataset.frame);
      await page.waitForTimeout(120);expect(await review.evaluate(element=>(element.parentElement as HTMLElement).dataset.frame)).toBe(stopped);
      const seen=new Set<string>();
      for(let i=0;i<(motion==='Walk'?WALK_FRAMES:3);i++){
        await controls.getByRole('button',{name:'Next frame',exact:true}).click();
        seen.add((await review.evaluate(element=>(element.parentElement as HTMLElement).dataset.frame))!);
        const detail=review.locator('.sprite-detail');await detail.scrollIntoViewIfNeeded();
        await expect.poll(()=>detail.evaluate(async(canvas,hero)=>{
          const host=canvas.closest('#sprite-workshop') as HTMLElement,frame=host.dataset.frame;
          const image=new Image();image.src=frame==='idle'?`/art/${hero}-right.png`:`/art/animation/${hero}-right.png`;await image.decode();
          const ref=document.createElement('canvas');ref.width=ref.height=240;const ctx=ref.getContext('2d')!;ctx.imageSmoothingEnabled=false;
          for(let y=0;y<240;y+=8)for(let x=0;x<240;x+=8){ctx.fillStyle=(x/8+y/8)%2?'#234047':'#182b32';ctx.fillRect(x,y,8,8);}
          if(frame==='idle')ctx.drawImage(image,0,0,240,240);else{const f=Number(frame);ctx.drawImage(image,f%2*80,Math.floor(f/2)*80,80,80,0,0,240,240);}
          const actual=(canvas as HTMLCanvasElement).getContext('2d')!.getImageData(0,0,240,240).data,expected=ctx.getImageData(0,0,240,240).data;
          return actual.reduce((n,v,i)=>n+Number(v!==expected[i]),0);
        },hero)).toBe(0);
      }
      expect(seen).toEqual(motion==='Walk'?new Set(['0','1','2','3','4','5']):new Set([String(ATTACK_WINDUP_FRAME),String(ATTACK_CONTACT_FRAME),'idle']));
      if(motion==='Walk'){
        await controls.getByRole('button',{name:'Play',exact:true}).click();await page.waitForTimeout(WALK_CYCLE_MS+100);
        await controls.getByRole('button',{name:'Pause',exact:true}).click();
      }
      }
    }
    await capture(page,`actor-animation-${device}`);expect(await page.locator('.inventory-panel').evaluate(p=>p.scrollWidth<=p.clientWidth)).toBe(true);
    await review.getByRole('button',{name:'Inspect Celia',exact:true}).click();await expect(controls.getByRole('button',{name:'Walk',exact:true})).toBeDisabled();
    expect(await page.evaluate(()=>JSON.stringify(localStorage))).toBe(stored);expect(errors).toEqual([]);
  });
}

async function combatSnapshot(page:Page){const s=(await inspect(page)).battle!;return {...s,obstacles:new Set(s.obstacles),water:new Set(s.water),vents:new Set(s.vents)} as Battle;}
async function aimAfterMoving(page:Page,ability:AbilityId){
  const b=await combatSnapshot(page),u=active(b)!;let choice:{position:Hex;aim:Hex;path:Hex[]}|undefined;
  for(const visit of [...movement(b,u).values()].sort((a,b)=>b.path.length-a.path.length)){
    const original=u.hex;u.hex=visit.hex;const target=b.units.find(v=>v.side!==u.side&&v.hp>0&&legalAim(b,u,ability,v.hex)&&targets(b,u,ability,v.hex).some(t=>t.id===v.id)&&targets(b,u,ability,v.hex).every(t=>t.side!==u.side));u.hex=original;
    if(target){choice={position:visit.hex,aim:target.hex,path:visit.path};break;}
  }
  expect(choice).toBeTruthy();
  if(choice!.path.length){
    await page.locator('.actions').getByRole('button',{name:/^1\s+Move$/}).click();await clickHex(page,choice!.position);
    const sampling=record(page,choice!.path.length*95+180);await page.getByRole('button',{name:/^Confirm move/}).click();const samples=await sampling;
    const actors=samples.flatMap(s=>s.actors.filter(a=>a.hero===u.kind&&a.motion==='walk'));
    expect(actors.length).toBeGreaterThan(0);
    if(choice!.path.length>=2)expect(new Set(actors.map(a=>a.frame))).toEqual(new Set(['0','1','2','3','4','5']));
    for(const hex of choice!.path.slice(0,-1)){const p=toPixel(hex);expect(actors.some(a=>Math.hypot(a.x-p.x,a.y-p.y-9)<20)).toBe(true);}
    await expect.poll(async()=>!(await inspect(page)).busy).toBe(true);
  }
  return choice!;
}

test('walked battle paths and both attack poses finish before the next action; dev outcomes cancel pending hits',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/?dev=workshop');
  await page.getByRole('spinbutton',{name:'Nell Movement',exact:true}).fill('5');await page.getByRole('button',{name:'Apply base stats',exact:true}).click();
  await page.getByRole('button',{name:'Test battle',exact:true}).click();await expect.poll(async()=>(await inspect(page)).mode).toBe('battle');
  for(const [hero,ability] of [['nell','burst'],['orrin','steam']] as const){
    await expect.poll(async()=>active(await combatSnapshot(page))?.kind).toBe(hero);
    const choice=await aimAfterMoving(page,ability);const u=active(await combatSnapshot(page))!;
    await page.locator('.actions').getByRole('button',{name:new RegExp(`^\\d\\s+${ABILITIES[ability].name}$`)}).click();await clickHex(page,choice.aim);
    const samples=record(page,550);await page.getByRole('button',{name:'Confirm attack',exact:true}).click();const frames=(await samples).flatMap(s=>s.actors.filter(a=>a.hero===hero&&a.motion==='attack').map(a=>a.frame));
    expect(frames).toContain(String(ATTACK_WINDUP_FRAME));expect(frames).toContain(String(ATTACK_CONTACT_FRAME));await expect.poll(async()=>!(await inspect(page)).busy).toBe(true);
    expect((await inspect(page)).battle!.log.some(line=>line.startsWith(`${u.name}: ${ABILITIES[ability].name}`))).toBe(true);
    await capture(page,`${hero}-attack-finished`);
  }
  await page.getByRole('button',{name:'Restart battle',exact:true}).click();const choice=await aimAfterMoving(page,'strike');
  await page.locator('.actions').getByRole('button',{name:/^\d\s+Strike$/}).click();await clickHex(page,choice.aim);await page.getByRole('button',{name:'Confirm attack',exact:true}).click();
  const samples=record(page,550);await page.getByRole('button',{name:'Win battle',exact:true}).click();await samples;
  await expect(page.getByRole('heading',{name:'Practice complete',exact:true})).toBeVisible();expect((await inspect(page)).battle!.result).toBe('victory');expect(errors).toEqual([]);
});
