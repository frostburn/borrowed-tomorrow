import {test,expect} from '@playwright/test';
import {offset,toPixel} from '../../src/rules/hex';
import {inspect,capture} from './controls';
for(const [device,viewport,dpr]of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]]as const)test(`vertical hex borders occupy complete chunky columns on ${device}`,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:dpr,reducedMotion:'reduce'}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('/?dev=boss');await page.getByRole('button',{name:'Start finale preset',exact:true}).click();
  for(let row=0;row<7;row++){
   const p=toPixel(offset(0,row));let view=(await inspect(page)).view;
   for(let pan=0;pan<6&&p.x<view.scrollX+36;pan++){await page.getByRole('button',{name:'Pan battlefield left',exact:true}).click();view=(await inspect(page)).view;}
   const box=(await page.locator('#canvas canvas').boundingBox())!;
   await page.mouse.move(box.x+(p.x-view.scrollX)*box.width/view.width,box.y+(p.y-view.scrollY)*box.height/view.height);
   await expect.poll(()=>page.evaluate(p=>{
    const view=window.borrowedTomorrow.inspect().view,c=document.querySelector<HTMLCanvasElement>('.phaser-host canvas')!,ctx=c.getContext('2d')!;
    const data=ctx.getImageData(p.x-view.scrollX+28,p.y-view.scrollY-10,2,20).data;
    let solid=0;for(let i=0;i<data.length;i+=4)if(data[i]>190&&data[i+1]>190&&data[i+2]>190)solid++;return solid;
   },p)).toBe(40);
  }
  await capture(page,`hex-grid-${device}`);await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await context.close();}
});
