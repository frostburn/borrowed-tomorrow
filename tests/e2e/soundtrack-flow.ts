import {test,expect,type Page} from '@playwright/test';
import {inspect,capture} from './controls';

async function audioState(page:Page){
 return page.evaluate(()=>{
  const state=window as unknown as {soundtrackContexts:AudioContext[];soundtrackStarts:number[]};
  return {contexts:state.soundtrackContexts.map(c=>c.state),starts:[...state.soundtrackStarts]};
 });
}
async function observeAudio(page:Page){
 await page.addInitScript(()=>{
  localStorage.setItem('borrowed-tomorrow:sound','off');
  const state=window as unknown as {soundtrackContexts:AudioContext[];soundtrackStarts:number[]};state.soundtrackContexts=[];state.soundtrackStarts=[];
  window.AudioContext=new Proxy(window.AudioContext,{construct(target,args){
   const context=Reflect.construct(target,args) as AudioContext,index=state.soundtrackContexts.length;
   state.soundtrackContexts.push(context);state.soundtrackStarts.push(0);
   const create=context.createOscillator.bind(context);
   context.createOscillator=()=>{const node=create(),start=node.start.bind(node);node.start=(when=0)=>{state.soundtrackStarts[index]++;start(when);};return node;};
   return context;
  }});
 });
}
const playerChunk=/\/(?:src\/game\/soundtrack\.ts(?:\?.*)?|assets\/soundtrack-[^/]+\.js)$/;
const scoreChunk=/\/(?:src\/game\/music-runtime\.ts(?:\?.*)?|assets\/music-runtime-[^/]+\.js)$/;

export function soundtrackFlows(production=false){
 for(const [device,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]as const)test(`public soundtrack ${production?'production ':''}${device}: browse acts, play, seek, close and restore the host`,async({browser})=>{
  const context=await browser.newContext({viewport,deviceScaleFactor:1.25}),page=await context.newPage(),errors:string[]=[],scoreRequests:string[]=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('request',r=>{if(scoreChunk.test(r.url()))scoreRequests.push(r.url());});
  try{
   await observeAudio(page);await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');
   const storage=await page.evaluate(()=>({...localStorage}));
   await page.getByRole('button',{name:'Soundtrack',exact:true}).click();const dialog=page.getByRole('dialog',{name:'Soundtrack',exact:true});
   await expect(dialog.getByRole('heading',{name:'Larkspur festival',exact:true})).toBeVisible();
   expect(scoreRequests).toHaveLength(0);expect((await audioState(page)).contexts).toHaveLength(0);
   await dialog.getByRole('button',{name:/Chapter Five/}).click();
   await expect(dialog.locator('h4')).toHaveText(['The shared voyage','Act I · Hammerplain','Act II · Dawnwatch','Act III · Windmere','Act IV · The flagship']);
   await dialog.getByRole('button',{name:'Iron Above the Clouds',exact:true}).click();
   await dialog.getByRole('button',{name:'Play',exact:true}).click();
   await expect(dialog.locator('#soundtrack-status')).toContainText('Playing');
   await expect(dialog.locator('#soundtrack-meta')).toContainText('10/8');await expect(dialog.locator('#soundtrack-meta')).toContainText('2-bar opening');
   await expect.poll(async()=>(await audioState(page)).starts[0]).toBeGreaterThan(0);
   await expect(dialog.getByRole('button',{name:'Pause',exact:true})).toBeFocused();
   await capture(page,`soundtrack-${production?'production-':''}${device}`);
   await dialog.getByRole('button',{name:'Lower soundtrack volume',exact:true}).click();await expect(dialog.locator('#soundtrack-volume')).toHaveText('Volume 70%');
   const bar=dialog.getByRole('spinbutton',{name:'Bar',exact:true});await expect(bar).toHaveAttribute('max','34');
   await bar.fill('0');await dialog.getByRole('button',{name:'Seek',exact:true}).click();await expect(dialog.getByRole('alert')).toContainText('Choose a bar from 1 to 34.');
   await bar.fill('34');await dialog.getByRole('button',{name:'Seek',exact:true}).click();await expect(dialog.locator('#soundtrack-status')).toContainText('bar 34');
   await expect.poll(async()=>Number(await bar.inputValue())).toBeLessThan(8);expect(Number(await bar.inputValue())).toBeGreaterThanOrEqual(3);
   await expect(dialog.locator('#soundtrack-status')).toContainText('Loop');
   await dialog.getByRole('button',{name:'Pause',exact:true}).click();const held=await bar.inputValue();
   await expect.poll(async()=>(await audioState(page)).contexts[0]).toBe('suspended');
   const time=await page.evaluate(()=>(window as unknown as {soundtrackContexts:AudioContext[]}).soundtrackContexts[0].currentTime);
   await page.waitForTimeout(400);await expect(bar).toHaveValue(held);
   expect(await page.evaluate(()=>(window as unknown as {soundtrackContexts:AudioContext[]}).soundtrackContexts[0].currentTime)).toBe(time);
   await dialog.getByRole('button',{name:'Play',exact:true}).click();await expect(dialog.locator('#soundtrack-status')).toContainText('Playing');
   await expect.poll(async()=>(await audioState(page)).contexts[0]).toBe('running');
   await dialog.getByRole('button',{name:'Pause',exact:true}).click();
   await dialog.getByRole('button',{name:'Next',exact:true}).click();await expect(dialog.getByRole('heading',{name:'The Sky Answers',exact:true})).toBeVisible();await expect(dialog.locator('#soundtrack-status')).toContainText('Stopped');
   await dialog.getByRole('button',{name:/Chapter Six/}).click();await expect(dialog.locator('h4')).toHaveText(['The sealed capital','Namar · Desert expedition','Iria · River expedition','Skeld · Northern expedition','The capital assault']);
   await dialog.getByRole('button',{name:'The Hand on the Shutter',exact:true}).click();await dialog.getByRole('button',{name:'Play',exact:true}).click();await expect(dialog.locator('#soundtrack-status')).toContainText('Playing');
   await dialog.getByRole('button',{name:'Close',exact:true}).click();await expect(dialog).toHaveCount(0);
   await expect.poll(async()=>(await audioState(page)).contexts[0]).toBe('closed');
   await expect(page.getByRole('button',{name:'Sound off',exact:true})).toBeVisible();expect(await page.evaluate(()=>({...localStorage}))).toEqual(storage);
   await page.getByRole('button',{name:'Sound off',exact:true}).click();await expect(page.getByRole('button',{name:'Sound on',exact:true})).toBeVisible();
   const onStorage=await page.evaluate(()=>({...localStorage}));await page.locator('#help-button').click();
   await page.getByRole('dialog',{name:'On the line',exact:true}).getByRole('button',{name:'Soundtrack',exact:true}).click();
   await expect(dialog.getByRole('heading',{name:'Larkspur festival',exact:true})).toBeVisible();
   await dialog.getByRole('button',{name:'Play',exact:true}).click();await expect(dialog.locator('#soundtrack-status')).toContainText('Playing');
   await dialog.getByRole('button',{name:'Back to help',exact:true}).click();await expect(page.getByRole('dialog',{name:'On the line',exact:true})).toBeVisible();
   await expect(page.getByRole('button',{name:'Sound on',exact:true})).toBeVisible();await page.getByRole('button',{name:'Close',exact:true}).click();await expect(page.locator('#help-button')).toBeFocused();
   const after=await audioState(page);await expect.poll(async()=>(await audioState(page)).contexts.filter(state=>state==='closed').length).toBe(2);expect(after.contexts.filter(state=>state==='running').length).toBeGreaterThanOrEqual(1);
   expect(await page.evaluate(()=>({...localStorage}))).toEqual(onStorage);
   await page.getByRole('button',{name:'Begin Chapter One',exact:true}).click();await page.getByRole('button',{name:'Skip scene',exact:true}).click();
   const before=(await inspect(page)).state;
   await page.locator('#help-button').click();await page.getByRole('dialog',{name:'On the line',exact:true}).getByRole('button',{name:'Soundtrack',exact:true}).click();
   await expect(dialog.getByRole('heading',{name:'Larkspur festival',exact:true})).toBeVisible();await page.keyboard.press('Escape');
   expect((await inspect(page)).state).toEqual({...before,playSeconds:expect.any(Number)});await expect(dialog).toHaveCount(0);
   await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
  }finally{await context.close();}
 });
 for(const pending of ['player','score']as const)test(`public soundtrack ${production?'production ':''}closing during ${pending} loading cancels playback`,async({page})=>{
  await observeAudio(page);await page.goto('/');let release!:()=>void,held=false;
  const gate=new Promise<void>(resolve=>{release=resolve;});
  await page.route(pending==='player'?playerChunk:scoreChunk,async route=>{held=true;await gate;await route.continue();});
  try{
   await page.getByRole('button',{name:'Soundtrack',exact:true}).click();
   const dialog=page.getByRole('dialog',{name:'Soundtrack',exact:true});
   if(pending==='score'){await expect(dialog.getByRole('heading',{name:'Larkspur festival',exact:true})).toBeVisible();await dialog.getByRole('button',{name:'Play',exact:true}).click();}
   await expect.poll(()=>held).toBe(true);await dialog.getByRole('button',{name:'Close',exact:true}).click();release();
   await expect.poll(async()=>pending==='score'?(await audioState(page)).contexts.every(state=>state==='closed'):true).toBe(true);
   await page.getByRole('button',{name:'Soundtrack',exact:true}).click();await expect(dialog.getByRole('heading',{name:'Larkspur festival',exact:true})).toBeVisible();
   expect((await audioState(page)).starts.every(count=>count===0)).toBe(true);
   await dialog.getByRole('button',{name:'Play',exact:true}).click();await expect(dialog.locator('#soundtrack-status')).toContainText('Playing');
   await expect.poll(async()=>(await audioState(page)).starts.at(-1)).toBeGreaterThan(0);
   await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);
  }finally{release();}
 });
}
