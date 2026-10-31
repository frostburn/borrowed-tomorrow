import {test,expect,type Page} from '@playwright/test';
import {inspect,capture,clickHex} from './controls';
import {active,movement,type Battle} from '../../src/rules/combat';
import {key,toPixel,type Hex} from '../../src/rules/hex';

/** Sample the exposed side edges in the visible, pixelated framebuffer. */
async function dangerRed(page:Page,h:Hex){
 await clickHex(page,h); // Also pans the character into view on phones.
 return page.evaluate(p=>{
  const {view}=window.borrowedTomorrow.inspect(),info=window.borrowedTomorrowPixels.inspect();
  const source=document.querySelector('.pixel-source')!.getBoundingClientRect(),world=document.querySelector('.world-input')!.getBoundingClientRect();
  const canvas=document.querySelector<HTMLCanvasElement>('.pixel-output')!,pixels=canvas.getContext('2d')!.getImageData(0,0,canvas.width,canvas.height).data;
  const x=Math.round((world.left-source.left)/info.cssScale)+p.x-view.scrollX,y=Math.round((world.top-source.top)/info.cssScale)+p.y-view.scrollY;
  let red=0;
  for(let dy=-12;dy<=16;dy++)for(let dx=-32;dx<=32;dx++){
   if(Math.abs(dx)<26)continue;
   const xx=Math.round(info.physicalLeft+(x+dx)*info.physicalScale),yy=Math.round(info.physicalTop+(y+dy)*info.physicalScale);
   if(xx<0||yy<0||xx>=canvas.width||yy>=canvas.height)continue;
   const i=(yy*canvas.width+xx)*4,r=pixels[i],g=pixels[i+1],b=pixels[i+2];
   if(r>170&&r-g>65&&Math.abs(g-b)<25)red++;
  }
  return red;
 },toPixel(h));
}

for(const [device,viewport,dpr]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const)test(`scheduled boss attacks stay red under active and waiting characters on ${device}`,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:dpr,reducedMotion:'reduce'}),page=await context.newPage();
 try{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('/?dev=boss');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop');await page.getByRole('button',{name:'Start phase two',exact:true}).click();
  const snapshot=(await inspect(page)).battle!,b={...snapshot,obstacles:new Set(snapshot.obstacles),water:new Set(snapshot.water),vents:new Set(snapshot.vents)}as Battle,u=active(b)!;
  const danger=new Set(b.units.flatMap(v=>v.intent?.cells.map(key)??[])),threatened=b.units.filter(v=>v.side==='party'&&danger.has(key(v.hex)));
  expect(threatened.some(v=>v.id===u.id)).toBe(true);expect(threatened.some(v=>v.id!==u.id)).toBe(true);
  for(const hero of threatened)await expect.poll(()=>dangerRed(page,hero.hex)).toBeGreaterThan(25);
  await capture(page,`occupied-danger-${device}`);
  await page.getByRole('button',{name:/Lantern burst$/}).click();await expect.poll(()=>dangerRed(page,u.hex)).toBeGreaterThan(25);
  await capture(page,`occupied-danger-preview-${device}`);await page.getByRole('button',{name:'Cancel',exact:true}).click();
  const safe=[...movement(b,u).values()].find(v=>v.path.length&&!danger.has(key(v.hex)))!.hex;
  await clickHex(page,safe);await page.getByRole('button',{name:/^Confirm move/}).click();await expect.poll(async()=>(await inspect(page)).busy).toBe(false);
  await expect.poll(async()=>(await inspect(page)).battle!.units.find(v=>v.id===u.id)!.hex).toEqual(safe);
  await expect.poll(()=>dangerRed(page,safe)).toBeLessThan(20);await expect.poll(()=>dangerRed(page,u.hex)).toBeLessThan(20);
  await capture(page,`escaped-danger-${device}`);await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await context.close();}
});

for(const [device,viewport,dpr]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const)test(`threatened movement stays blue and selectable on ${device}`,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:dpr,reducedMotion:'reduce'}),page=await context.newPage();
 try{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/?dev=boss');
  await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop');await page.getByRole('button',{name:'Start finale preset',exact:true}).click();
  const snapshot=(await inspect(page)).battle!,b={...snapshot,obstacles:new Set(snapshot.obstacles),water:new Set(snapshot.water),vents:new Set(snapshot.vents)} as Battle,u=active(b)!;
  const danger=new Set(b.units.flatMap(v=>v.intent?.cells.map(key)??[]));
  const destination=[...movement(b,u).values()].filter(v=>v.path.length&&danger.has(key(v.hex))).sort((a,b)=>b.hex.r-a.hex.r)[0].hex;
  await clickHex(page,destination);await expect(page.getByRole('button',{name:/^Confirm move/})).toBeVisible();
  await expect(page.locator('#confirmation')).toContainText('Threatened destination');
  await expect(page.locator('#battle-hint')).toContainText('blue interiors remain reachable');
  const colors=await page.evaluate(p=>{
   const s=window.borrowedTomorrow.inspect(),c=document.querySelector<HTMLCanvasElement>('.phaser-host canvas')!,ctx=c.getContext('2d')!;
   const x=Math.round(p.x-s.view.scrollX),y=Math.round(p.y-s.view.scrollY),pixels=ctx.getImageData(0,0,c.width,c.height).data;
   let blue=0,cross=0;
   for(let dy=-30;dy<=30;dy++)for(let dx=-31;dx<=31;dx++){
    const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=c.width||yy>=c.height)continue;
    const i=(yy*c.width+xx)*4,r=pixels[i],g=pixels[i+1],b=pixels[i+2];
    if(g>140&&g-r>25&&b-r>25)blue++;
    if(Math.abs(dx)<=8&&dy>=-27&&dy<=-13&&r>200&&g>150&&b<190)cross++;
   }return {blue,cross};
  },toPixel(destination));
  expect(colors.blue).toBeGreaterThan(25);expect(colors.cross).toBeGreaterThan(5);await capture(page,`reachable-danger-${device}`);
  await page.getByRole('button',{name:/^Confirm move/}).click();await expect.poll(async()=>(await inspect(page)).battle!.units.find(v=>v.id===u.id)!.hex).toEqual(destination);
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await context.close();}
});
