import {test,expect} from '@playwright/test';
import {inspect,capture,clickHex} from './controls';
import {active,movement,type Battle} from '../../src/rules/combat';
import {key,toPixel} from '../../src/rules/hex';

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
