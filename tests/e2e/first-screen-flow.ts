import {test,expect,type Page} from '@playwright/test';
import {inspect,capture} from './controls';
import {approach} from './navigation';

async function musicLevel(page:Page){return page.evaluate(()=>(window as unknown as {issueGains:GainNode[]}).issueGains[1]?.gain.value);}
export function firstScreenFlows(production=false){
 for(const [device,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]as const)test(`first-screen repairs ${production?'production ':''}${device}: saves, music, portrait, escort and memorial`,async({browser})=>{
  const context=await browser.newContext({viewport,deviceScaleFactor:1.25}),page=await context.newPage(),errors:string[]=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  try{
   await page.addInitScript(()=>{
    if(!localStorage.getItem('borrowed-tomorrow:sound'))localStorage.setItem('borrowed-tomorrow:sound','off');
    const state=window as unknown as {issueGains:GainNode[]};state.issueGains=[];
    window.AudioContext=new Proxy(window.AudioContext,{construct(target,args){const c=Reflect.construct(target,args) as AudioContext,create=c.createGain.bind(c);c.createGain=()=>{const g=create();state.issueGains.push(g);return g;};return c;}});
   });
   await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');await page.waitForFunction(()=>!!window.borrowedTomorrow);
   const title=page.locator('.title-panel');await expect(title.getByRole('button',{name:'Continue',exact:true})).toHaveCount(0);await expect(title.getByRole('button',{name:'Save files',exact:true})).toHaveCount(0);
   // Import remains reachable through the ordinary top-bar Save menu.
   await page.getByRole('button',{name:'Save',exact:true}).click();await expect(page.getByRole('button',{name:'Import save file',exact:true})).toBeVisible();await page.getByRole('button',{name:'Close',exact:true}).click();
   await capture(page,`first-title-${production?'production-':''}${device}`);
   await page.getByRole('button',{name:'Sound off',exact:true}).click();await expect(page.getByRole('button',{name:'Sound on',exact:true})).toBeVisible();
   await page.getByRole('button',{name:'Begin Chapter One',exact:true}).click();await expect.poll(()=>musicLevel(page)).toBeCloseTo(.52*.7,3);
   const next=()=>page.locator('.dialogue-actions button').first().click();await next();await next();await expect(page.locator('.dialogue-portrait img')).toHaveAttribute('src',/portrait-nell-happy.svg$/);await capture(page,`first-happy-${production?'production-':''}${device}`);
   await page.getByRole('button',{name:'Skip scene',exact:true}).click();await expect.poll(()=>musicLevel(page)).toBeCloseTo(.52,3);
   await page.reload();await expect(title.getByRole('button',{name:'Continue',exact:true})).toBeVisible();await expect(title.getByRole('button',{name:'Save files',exact:true})).toBeVisible();await title.getByRole('button',{name:'Continue',exact:true}).click();
   await approach(page,'tomas');for(let i=0;i<3;i++)await next();
   await expect.poll(async()=>{const p=(await inspect(page)).people.find(p=>p.id==='raid-soldier');return p&&[p.x,p.y];}).toEqual([684,307]);
   for(let i=0;i<12;i++){
    if((await page.locator('.dialogue-copy p').textContent())?.includes('Ansel catches'))break;
    await next();
   }
   await expect.poll(()=>musicLevel(page)).toBeCloseTo(0,3);
   for(let i=0;i<8;i++){
    if((await page.locator('.dialogue-copy p').textContent())?.includes('Nell! Find Orrin.'))break;
    await next();
   }
   await expect(page.locator('.dialogue h2')).toHaveText('Tomas');await expect.poll(()=>musicLevel(page)).toBeCloseTo(.52*.7,3);
   await expect.poll(async()=>{const p=(await inspect(page)).people.find(p=>p.id==='raid-soldier');return p&&[p.x,p.y];}).toEqual([732,283]);
   await expect.poll(async()=>(await inspect(page)).actors.some(a=>a.hero==='tomas'&&a.x===756&&a.y===283)).toBe(true);const escort=await inspect(page);expect(escort.state.flags.raidSeen).toBeUndefined();await capture(page,`first-escort-${production?'production-':''}${device}`);
   await next();expect((await inspect(page)).people.find(p=>p.id==='raid-soldier')).toBeUndefined();await expect.poll(()=>musicLevel(page)).toBeCloseTo(0,3);
   await page.getByRole('button',{name:'Skip scene',exact:true}).click();await expect.poll(()=>musicLevel(page)).toBeCloseTo(.52,3);expect((await inspect(page)).state.flags.raidSeen).toBe(true);
   await approach(page,'memorial');await expect(page.locator('.dialogue-copy p')).toContainText('his hat on the desk');await capture(page,`first-memorial-${production?'production-':''}${device}`);
   await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
  }finally{await context.close();}
 });
}
