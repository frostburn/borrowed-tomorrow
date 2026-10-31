import {test,expect,type Page} from '@playwright/test';
import {offset} from '../../src/rules/hex';
import {capture,inspect,clickHex} from './controls';

type Attack={actorId:string;ability:string;cells:{q:number;r:number}[];impact:boolean};
async function hold(page:Page,impact:boolean){
 await page.waitForFunction(impact=>{
  const scene=(window as unknown as {attackScene:{enemyAttack?:Attack;time:{timeScale:number};tweens:{timeScale:number}}}).attackScene;
  if(!scene.enemyAttack||scene.enemyAttack.impact!==impact)return false;
  scene.time.timeScale=0;scene.tweens.timeScale=0;return true;
 },impact);
 await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 return page.evaluate(()=>{const {actorId,ability,cells,impact}=(window as unknown as {attackScene:{enemyAttack:Attack}}).attackScene.enemyAttack;return structuredClone({actorId,ability,cells,impact});});
}
async function resume(page:Page){await page.evaluate(()=>{const s=(window as unknown as {attackScene:{time:{timeScale:number};tweens:{timeScale:number}}}).attackScene;s.time.timeScale=1;s.tweens.timeScale=1;});}

async function observeScene(page:Page){
 await page.evaluate(async()=>{
  // @ts-expect-error Vite serves the real scene; keep observation out of production APIs.
  const {Adventure}:typeof import('../../src/game/adventure')=await import('/src/game/adventure.ts');
  const original=Adventure.prototype.previewBattle;
  Adventure.prototype.previewBattle=function(...args){(window as unknown as {attackScene:InstanceType<typeof Adventure>}).attackScene=this;original.apply(this,args);};
 });
}

for(const [device,viewport,dpr,reduced]of [['desktop',{width:1280,height:800},1,false],['phone',{width:390,height:844},1.25,true]]as const){
 test.describe(`enemy footprints on ${device}`,()=>{
  test.use({viewport,deviceScaleFactor:dpr,reducedMotion:reduced?'reduce':'no-preference'});
  for(const kind of ['single','line','blast']as const){
   test(`${kind} uses the AI's actual aim, lights empty hexes and clears after impact`,async({page})=>{
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    await page.goto('/?dev=workshop');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop');
    await observeScene(page);
    await page.getByRole('button',{name:'Test battle',exact:true}).click();
    const expected=await page.evaluate(async kind=>{
     // @ts-expect-error Test fixtures use the same production factory and AI as campaign battles.
     const {createBattle,enemyTurn,shape}:typeof import('../../src/rules/combat')=await import('/src/rules/combat.ts');
     // @ts-expect-error Vite serves the authored campaign state rules.
     const {newGame,recruitOrrin}:typeof import('../../src/rules/state')=await import('/src/rules/state.ts');
     // @ts-expect-error Vite serves the shared axial geometry.
     const {offset}:typeof import('../../src/rules/hex')=await import('/src/rules/hex.ts');
     // @ts-expect-error Vite serves the isolated practice host.
     const {Adventure}:typeof import('../../src/game/adventure')=await import('/src/game/adventure.ts');
     const state=newGame();recruitOrrin(state);
     const b=createBattle(kind==='single'?'pursuit':kind==='line'?'collector':'captain',state),actor=b.units.find(u=>u.side==='enemy')!,nell=b.units[0],orrin=b.units[1];
     for(const unit of b.units.filter(u=>u.side==='enemy'&&u!==actor))unit.hp=0;
     actor.hex=offset(kind==='single'?5:7,2);actor.movement=kind==='single'?3:0;
     nell.hex=offset(kind==='single'?3:5,2);nell.retaliated=true;
     orrin.hex=offset(kind==='blast'?5:2,kind==='blast'?3:5);orrin.retaliated=true;
     b.queue=[actor.id,nell.id,orrin.id];
     const copy=structuredClone(b);let attack:Attack|undefined;
     enemyTurn(copy,undefined,(ability,aim,affected)=>{attack={actorId:actor.id,ability,cells:affected??shape(copy,copy.units.find(u=>u.id===actor.id)!,ability,aim),impact:false};});
     const scene=(window as unknown as {attackScene:InstanceType<typeof Adventure>}).attackScene;
     scene.previewBattle(b,()=>{});return attack!;
    },kind);
    expect(expected.ability).toBe(kind==='single'?'strike':kind==='line'?'steam':'flare');
    expect(expected.cells).toHaveLength(kind==='single'?1:kind==='line'?2:7);
    // A line stops at the authored rock, retaining the empty cell before Nell.
    if(kind==='line'){expect(expected.cells).toContainEqual(offset(6,2));expect(expected.cells).not.toContainEqual(offset(4,2));}
    if(!reduced){const windup=await hold(page,false);expect(windup).toEqual(expected);await capture(page,`enemy-${kind}-windup-${device}`);await resume(page);}
    const impact=await hold(page,true);expect(impact).toEqual({...expected,impact:true});await capture(page,`enemy-${kind}-impact-${device}`);
    await expect(page.locator('vite-error-overlay')).toHaveCount(0);
    await resume(page);await expect.poll(()=>page.evaluate(()=>(window as unknown as {attackScene:{enemyAttack?:Attack}}).attackScene.enemyAttack??null)).toBeNull();
    expect((await inspect(page)).mode).toBe('battle');expect(errors).toEqual([]);
   });
  }
 });
}

test('boss impact retains the fired pattern across round rollover and cancels on restart',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/?dev=boss&boss=conduit&route=pressure');await observeScene(page);
 await page.getByRole('button',{name:'Start Chapter Three preset',exact:true}).click();
 const fired=await page.evaluate(async()=>{
  // @ts-expect-error Vite serves the same campaign boss presentation.
  const {conduitPresentation}:typeof import('../../src/game/conduit-presentation')=await import('/src/game/conduit-presentation.ts');
  // @ts-expect-error Vite-only authored preview encounter.
  const {CONDUIT_ENCOUNTERS}:typeof import('../../src/dev/conduit-battle')=await import('/src/dev/conduit-battle.ts');
  // @ts-expect-error Vite serves the isolated practice scene.
  const {Adventure}:typeof import('../../src/game/adventure')=await import('/src/game/adventure.ts');
  const scene=(window as unknown as {attackScene:InstanceType<typeof Adventure>}).attackScene,b=structuredClone(scene.battle!),boss=b.units.find(u=>u.id==='conduit-regulator')!;
  b.queue=[boss.id];const cells=structuredClone(boss.intent!.cells);
  scene.previewBattle(b,()=>{},conduitPresentation(CONDUIT_ENCOUNTERS.pressure));return cells;
 });
 const windup=await hold(page,false);expect(windup.cells).toEqual(fired);
 const next=(await inspect(page)).battle!;expect(next.round).toBe(2);expect(next.units.find(u=>u.id==='conduit-regulator')!.intent!.cells).not.toEqual(fired);
 await resume(page);const impact=await hold(page,true);expect(impact.cells).toEqual(fired);await capture(page,'enemy-boss-fired-pattern');
 await page.getByRole('button',{name:'Restart battle',exact:true}).click();await resume(page);
 expect(await page.evaluate(()=>(window as unknown as {attackScene:{enemyAttack?:Attack}}).attackScene.enemyAttack??null)).toBeNull();
 await page.getByRole('button',{name:'Win battle',exact:true}).click();await expect(page.getByRole('heading',{name:'Practice complete',exact:true})).toBeVisible();
 await page.waitForTimeout(1200);expect(await page.evaluate(()=>(window as unknown as {attackScene:{enemyAttack?:Attack}}).attackScene.enemyAttack??null)).toBeNull();expect(errors).toEqual([]);
});

test('enemy retaliation marks the attacker’s hex and shows its own impact',async({page})=>{
 await page.goto('/?dev=workshop');await observeScene(page);await page.getByRole('button',{name:'Test battle',exact:true}).click();
 await page.evaluate(async()=>{
  // @ts-expect-error Vite serves the production rules for the isolated fixture.
  const {createBattle}:typeof import('../../src/rules/combat')=await import('/src/rules/combat.ts');
  // @ts-expect-error Vite serves the real state factory.
  const {newGame,recruitOrrin}:typeof import('../../src/rules/state')=await import('/src/rules/state.ts');
  // @ts-expect-error Vite serves the same geometry.
  const {offset}:typeof import('../../src/rules/hex')=await import('/src/rules/hex.ts');
  // @ts-expect-error Vite serves the isolated practice host.
  const {Adventure}:typeof import('../../src/game/adventure')=await import('/src/game/adventure.ts');
  const state=newGame();recruitOrrin(state);const b=createBattle('workshop',state);b.units[0].hex=offset(5,3);b.queue=['nell','orrin','hound-0'];
  (window as unknown as {attackScene:InstanceType<typeof Adventure>}).attackScene.previewBattle(b,()=>{});
 });
 await page.locator('.actions').getByRole('button',{name:/^1\s+Move \/ Strike$/}).click();await clickHex(page,offset(6,3));await page.getByRole('button',{name:'Confirm attack',exact:true}).click();
 const impact=await hold(page,true);expect(impact).toEqual({actorId:'hound-0',ability:'strike',cells:[offset(5,3)],impact:true});await capture(page,'enemy-retaliation');
 expect((await inspect(page)).battle!.log.some(t=>t.includes('Track hound retaliates'))).toBe(true);await resume(page);
 await expect.poll(()=>page.evaluate(()=>(window as unknown as {attackScene:{enemyAttack?:Attack}}).attackScene.enemyAttack??null)).toBeNull();
});

for(const support of ['mortar','repeater']as const)test(`Dawnwatch ${support} support uses ground impacts and preserves the fired warning across round rollover`,async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await page.goto('/?dev=workshop');await observeScene(page);await page.getByRole('button',{name:'Test battle',exact:true}).click();
 const fired=await page.evaluate(async support=>{
  // @ts-expect-error Vite serves the real campaign factory.
  const {createBattle}:typeof import('../../src/rules/combat')=await import('/src/rules/combat.ts');
  // @ts-expect-error Use the authored dev fixture, separate from campaign saves.
  const {chapterFiveStart}:typeof import('../../src/dev/canonical-saves')=await import('/src/dev/canonical-saves.ts');
  // @ts-expect-error Vite serves the isolated practice host.
  const {Adventure}:typeof import('../../src/game/adventure')=await import('/src/game/adventure.ts');
  const b=createBattle(support==='mortar'?'dawn-repeater-first':'dawn-mortar-first',chapterFiveStart()),spotter=b.units.find(u=>u.id==='dawn-spotter')!;b.queue=[spotter.id];const cells=structuredClone(spotter.intent!.cells);
  (window as unknown as {attackScene:InstanceType<typeof Adventure>}).attackScene.previewBattle(b,()=>{});return cells;
 },support);
 const windup=await hold(page,false);expect(windup).toEqual({actorId:'dawn-spotter',ability:'barrage',cells:fired,impact:false});await expect(page.locator('#status')).toContainText('Artillery barrage');await resume(page);const impact=await hold(page,true);expect(impact.cells).toEqual(fired);expect((await inspect(page)).battle!.round).toBe(2);await capture(page,`dawnwatch-${support}-impact`);await resume(page);await expect.poll(()=>page.evaluate(()=>(window as unknown as {attackScene:{enemyAttack?:Attack}}).attackScene.enemyAttack??null)).toBeNull();expect(errors).toEqual([]);
});
