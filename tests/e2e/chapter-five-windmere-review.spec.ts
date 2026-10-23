import { test,expect,type Page } from '@playwright/test';
import { windmereCheckpoint } from '../support/anchors';
import { importSave,approach } from './navigation';
import { inspect,capture } from './controls';
async function shot(page:Page,lift:boolean){
 const s=windmereCheckpoint(lift?'windLiftWon':'waterLiftOpened');s.location=lift?{map:'dispensary',x:42,y:26}:{map:'windmere',x:34,y:26};await importSave(page,s);await approach(page,lift?'wind-lift-wheel':'wind-transfer');
 for(let n=0;n<12;n++){if((await page.locator('.dialogue p').textContent())?.includes(lift?'Water fills':'The first bed rolls'))return;await page.locator('.dialogue-actions button').first().click();}throw Error('Hospital movement shot missing');
}
async function hashes(page:Page,ms:number){return page.evaluate(ms=>new Promise<number[]>(resolve=>{
 const hashes=new Set<number>(),start=performance.now();let last=0;
 const tick=()=>{const now=performance.now();if(now-last>80){last=now;const c=document.querySelector<HTMLCanvasElement>('.pixel-output')!,r=c.getBoundingClientRect(),w=document.querySelector('.world-input')!.getBoundingClientRect(),scale=c.width/r.width,p=c.getContext('2d')!.getImageData(Math.round((w.left-r.left)*scale),Math.round((w.top-r.top)*scale),Math.floor(w.width*scale),Math.floor(w.height*.8*scale)).data;let hash=2166136261;for(let i=0;i<p.length;i+=16)hash=Math.imul(hash^p[i],16777619);hashes.add(hash>>>0);}if(now-start>=ms)resolve([...hashes]);else requestAnimationFrame(tick);};tick();
 }),ms);}
for(const [device,viewport,dpr]of [['desktop',{width:1280,height:800},1.25],['phone',{width:390,height:844},1.5]]as const)for(const lift of [false,true])test(`Windmere ${lift?'lift':'patients'} move on passive time; skip cleans up on ${device}`,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:dpr,reducedMotion:'no-preference'}),page=await context.newPage();page.setDefaultTimeout(15000);
 try{await page.goto('/');await shot(page,lift);await page.mouse.move(0,0);await page.waitForTimeout(500);expect((await hashes(page,900)).length).toBeGreaterThan(2);expect((await inspect(page)).state.flags[lift?'waterLiftOpened':'patientsTransferred']).toBeUndefined();await capture(page,`windmere-${lift?'lift':'transfer'}-motion-${device}`);await page.getByRole('button',{name:'Skip scene',exact:true}).click();const state=(await inspect(page));expect(state.state.flags[lift?'waterLiftOpened':'patientsTransferred']).toBe(true);await page.waitForTimeout(1700);expect((await inspect(page)).people).toEqual(state.people);await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).state.flags[lift?'waterLiftOpened':'patientsTransferred']).toBe(true);}finally{await context.close();}
});
test('reduced-motion hospital scenes settle immediately and remain still',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');for(const lift of [true,false]){await shot(page,lift);await page.mouse.move(0,0);await page.waitForTimeout(300);expect((await hashes(page,650)).length).toBe(1);await page.getByRole('button',{name:'Skip scene',exact:true}).click();const before=(await inspect(page)).people;await page.waitForTimeout(1600);expect((await inspect(page)).people).toEqual(before);}
});

test('ward engine retains the fired mirror and beam across round rollover, then cleans up on restart',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/?dev=workshop');await page.evaluate(async()=>{
  // @ts-expect-error Observe only the isolated development practice host.
  const {Adventure}:typeof import('../../src/game/adventure')=await import('/src/game/adventure.ts');const original=Adventure.prototype.previewBattle;Adventure.prototype.previewBattle=function(...args){(window as any).wardScene=this;original.apply(this,args);};
 });await page.getByRole('button',{name:'Test battle',exact:true}).click();
 const fired=await page.evaluate(async()=>{
  // @ts-expect-error Use real campaign rules and native presentation in this isolated fixture.
  const {createBattle}:typeof import('../../src/rules/combat')=await import('/src/rules/combat.ts');
  // @ts-expect-error Vite serves the authored encounter registry.
  const {ENCOUNTERS}:typeof import('../../src/content/encounters')=await import('/src/content/encounters.ts');
  // @ts-expect-error Vite serves the authored dev fixture.
  const {chapterFiveStart}:typeof import('../../src/dev/canonical-saves')=await import('/src/dev/canonical-saves.ts');
  // @ts-expect-error Vite serves the production optical boss presentation.
  const {wardPresentation,WARD_ASSETS}:typeof import('../../src/game/ward-presentation')=await import('/src/game/ward-presentation.ts');
  // @ts-expect-error Load the same whole native arena as the campaign.
  const {sceneAssets}:typeof import('../../src/content/scene-art')=await import('/src/content/scene-art.ts');
  // @ts-expect-error Vite serves the real battle map registry.
  const {BATTLE_MAPS}:typeof import('../../src/content/battle-maps')=await import('/src/content/battle-maps.ts');
  // @ts-expect-error Vite serves shared hex positions.
  const {toPixel}:typeof import('../../src/rules/hex')=await import('/src/rules/hex.ts');
  const w=window as any,scene=w.wardScene;const assets=[...WARD_ASSETS,...sceneAssets(BATTLE_MAPS['wind-engine'])].filter(a=>!scene.textures.exists(a.key));if(assets.length)await new Promise<void>(resolve=>{scene.load.once('complete',resolve);for(const a of assets)scene.load.image(a.key,a.url);scene.load.start();});
  const b=createBattle('wind-engine',chapterFiveStart()),core=b.units.find(u=>u.id==='wind-ward-engine')!,mirror=b.units.find(u=>u.id===core.intent!.via)!;b.queue=[core.id];
  const presentation=wardPresentation(ENCOUNTERS['wind-engine']),effect=presentation.attackEffect!,graphics=scene.add.graphics.bind(scene.add);let recording=false;w.wardRays=[];
  scene.add.graphics=(...args:any[])=>{const g=graphics(...args);if(recording){const line=g.lineBetween.bind(g);g.lineBetween=(x1:number,y1:number,x2:number,y2:number)=>{w.wardRays.push([x1,y1,x2,y2]);return line(x1,y1,x2,y2);};}return g;};
  presentation.attackEffect=(...args)=>{recording=true;try{return effect(...args);}finally{recording=false;}};
  const cells=structuredClone(core.intent!.cells),via=core.intent!.via,p=toPixel(mirror.hex);scene.previewBattle(b,()=>{},presentation);return {cells,via,mirror:{x:p.x,y:p.y-25}};
 });
 const hold=async(impact:boolean)=>{await page.waitForFunction(impact=>{const s=(window as any).wardScene;if(!s.enemyAttack||s.enemyAttack.impact!==impact)return false;s.time.timeScale=0;s.tweens.timeScale=0;return true;},impact);return page.evaluate(()=>(window as any).wardScene.enemyAttack);};
 const resume=()=>page.evaluate(()=>{const s=(window as any).wardScene;s.time.timeScale=1;s.tweens.timeScale=1;});
 expect((await hold(false)).cells).toEqual(fired.cells);expect((await inspect(page)).battle!.round).toBe(2);expect((await inspect(page)).battle!.units.find(u=>u.id==='wind-ward-engine')!.intent!.via).not.toBe(fired.via);await resume();expect((await hold(true)).cells).toEqual(fired.cells);
 await expect.poll(()=>page.evaluate(({x,y})=>(window as any).wardRays.some((p:number[])=>Math.abs(p[2]-x)<.1&&Math.abs(p[3]-y)<.1),fired.mirror)).toBe(true);await capture(page,'ward-engine-reflected-impact');await page.getByRole('button',{name:'Restart battle',exact:true}).click();await resume();expect(await page.evaluate(()=>(window as any).wardScene.enemyAttack??null)).toBeNull();await page.getByRole('button',{name:'Win battle',exact:true}).click();await expect(page.getByRole('heading',{name:'Practice complete',exact:true})).toBeVisible();await page.waitForTimeout(1100);expect(await page.evaluate(()=>(window as any).wardScene.enemyAttack??null)).toBeNull();expect(errors).toEqual([]);
});

test('Windmere Music library and live engine use the authored regional themes',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/?dev=music');await page.getByRole('button',{name:'Ch 5',exact:true}).click();for(const mode of ['windmere','dispensary','mirrorward','wind-battle','wind-engine']){await page.locator(`[data-cue="${mode}"]`).click();await expect(page.locator('.music-description').first()).toContainText('31-EDO');await expect(page.locator('.music-description').first()).toContainText(mode==='windmere'||mode==='dispensary'?'3/4':'4/4');await expect(page.locator('.music-description').first()).toContainText('32 bars');}await page.locator('#music-play').click();await expect(page.locator('#music-position')).toContainText('Playing');await page.locator('#music-stop').click();
 await page.goto('/');await page.evaluate(async()=>{
  // @ts-expect-error Observe the real mixer without adding any production API.
  const {Audio}:typeof import('../../src/game/audio')=await import('/src/game/audio.ts');const original=Audio.prototype.setMode;Audio.prototype.setMode=function(mode){(window as any).windMusic=()=>({...this.position(),enabled:this.enabled});original.call(this,mode);};
 });await page.emulateMedia({reducedMotion:'reduce'});await importSave(page,windmereCheckpoint('windGalleryWon'));await page.getByRole('button',{name:'Sound off',exact:true}).click();await expect.poll(()=>page.evaluate(()=>(window as any).windMusic().mode),{timeout:6000}).toBe('mirrorward');await approach(page,'wind-engine');await page.getByRole('button',{name:'Stop the mirrored ward engine',exact:true}).click();await expect.poll(()=>page.evaluate(()=>(window as any).windMusic().mode),{timeout:6000}).toBe('wind-engine');await page.getByRole('button',{name:'Restart battle',exact:true}).click();await expect.poll(()=>page.evaluate(()=>(window as any).windMusic().mode),{timeout:6000}).toBe('wind-engine');await page.getByRole('button',{name:'Sound on',exact:true}).click();expect(await page.evaluate(()=>(window as any).windMusic().enabled)).toBe(false);expect(errors).toEqual([]);
});
test('all Windmere loops and seams render through the real rack without clipping or single-sample snaps',async({page},testInfo)=>{
 test.setTimeout(120000);await page.goto('/');const results=await page.evaluate(async()=>{
  // @ts-expect-error Vite serves the production procedural score.
  const {ARRANGEMENTS}:typeof import('../../src/game/score')=await import('/src/game/score.ts');
  // @ts-expect-error Use the live clock for rubato, including holds across a bar line.
  const {scoreTime,performanceBar}:typeof import('../../src/game/score-performance')=await import('/src/game/score-performance.ts');
  // @ts-expect-error Vite serves the real instrument rack.
  const {Synth}:typeof import('../../src/game/synth')=await import('/src/game/synth.ts');const results=[],rate=22050;
  for(const mode of ['windmere','dispensary','mirrorward','wind-battle','wind-engine']as const){const a=ARRANGEMENTS[mode],base=scoreTime(mode,-a.beats),seconds=scoreTime(mode,33*a.beats)-base,c=new OfflineAudioContext(2,Math.ceil((seconds+2)*rate),rate),gain=c.createGain();gain.gain.value=.52;gain.connect(c.destination);const synth=new Synth(c,gain);for(let bar=-1;bar<33;bar++)for(const n of performanceBar(mode,bar).notes)synth.note(n.instrument,n.pitch,.03+scoreTime(mode,bar*a.beats)-base+n.time,n.seconds,n.velocity,n.pan,n.expression);const rendered=await c.startRendering();let peak=0,sum=0,jump=0,samples=0;for(let ch=0;ch<2;ch++){const data=rendered.getChannelData(ch);for(let i=Math.ceil((.03-base)*rate);i<Math.floor(seconds*rate);i++){const v=data[i];if(!Number.isFinite(v))throw Error('Invalid audio');peak=Math.max(peak,Math.abs(v));sum+=v*v;jump=Math.max(jump,Math.abs(v-data[i-1]));samples++;}}results.push({mode,peak,rms:Math.sqrt(sum/samples),jump});}return results;
 });await testInfo.attach('full-loop-levels',{body:JSON.stringify(results,null,2),contentType:'application/json'});for(const r of results){expect(r.peak,JSON.stringify(r)).toBeLessThan(.9);expect(r.rms,JSON.stringify(r)).toBeGreaterThan(.005);expect(r.jump,JSON.stringify(r)).toBeLessThan(.25);}
});
