import {test,expect} from '@playwright/test';
import {inspect,capture,clickHex} from './controls';
import {occupiedHexes} from '../../src/rules/footprint';

for(const [device,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]as const)test(`hollow sun, Lightbearer and imperial footprints render and target correctly on ${device}`,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:1.25,reducedMotion:'reduce'}),page=await context.newPage(),errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 try{
  for(const id of ['sun','lightbearer','emperor','dragon']){
   await page.goto('/?dev=boss'+(id==='sun'?'':'&boss='+id));await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop',{timeout:30000});
   if(id==='sun')await page.locator('[data-final-form="1"]').click();else await page.getByRole('button',{name:'Start Chapter Six preset',exact:true}).click();
   await expect.poll(async()=>(await inspect(page)).mode).toBe('battle');await page.mouse.move(1,1);
   const b=(await inspect(page)).battle!,core=b.units.find(u=>u.side==='enemy'&&!u.passive)!;
   await page.getByRole('button',{name:/Quick shot/}).click();
   const contact=occupiedHexes(core).sort((a,b)=>b.r-a.r)[0];await clickHex(page,contact);
   await expect(page.locator('#confirmation')).toContainText(core.name);
   await capture(page,`boss-art-${id}-${device}`);
   await page.getByRole('button',{name:'Restart battle',exact:true}).click();
   expect((await inspect(page)).battle!.units.map(u=>[u.id,u.hex,u.footprint])).toEqual(b.units.map(u=>[u.id,u.hex,u.footprint]));
  }
  const alpha=await page.evaluate(async()=>{
   const img=new Image();img.src='/art/vector/benefactor/benefactor-sun-motion.svg';await img.decode();
   const canvas=document.createElement('canvas');canvas.width=720;canvas.height=1728;const ctx=canvas.getContext('2d')!;ctx.drawImage(img,0,0);const data=ctx.getImageData(0,0,720,1728).data;
   const sample=(i:number,x:number,y:number)=>data[((Math.floor(i/2)*288+Math.round(y))*720+i%2*360+Math.round(x))*4+3];
   let aperture=0,solid=0;
   for(let i=0;i<12;i++){
    const cy=139+(i<8?Math.sin(i/8*Math.PI*2)*2:[-3,-6,2,0][i-8]);
    for(let a=0;a<360;a+=15)aperture=Math.max(aperture,sample(i,180+Math.cos(a*Math.PI/180)*55,cy+Math.sin(a*Math.PI/180)*55));
    for(const a of [0,90,225])if(sample(i,180+Math.cos(a*Math.PI/180)*87,cy+Math.sin(a*Math.PI/180)*87)>250)solid++;
   }
   return {aperture,solid,width:img.naturalWidth,height:img.naturalHeight};
  });
  expect(alpha).toEqual({aperture:0,solid:36,width:720,height:1728});
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await context.close();}
});

test('side lighting gives real actor silhouettes ground depth on both sides',async({page})=>{
 await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');
 const results=await page.evaluate(async()=>{
  const url='/src/game/light-canvas.ts',artURL='/src/content/art-assets.ts';
  const {paintActorShadow}=await import(/* @vite-ignore */url),{artPath}=await import(/* @vite-ignore */artURL);
  const image=new Image();image.src='/'+artPath('nell');await image.decode();
  const silhouette=document.createElement('canvas');silhouette.width=silhouette.height=80;const s=silhouette.getContext('2d')!;s.drawImage(image,0,0);s.globalCompositeOperation='source-in';s.fillStyle='#172038';s.fillRect(0,0,80,80);
  return [-1,1].map(sign=>{
   const c=document.createElement('canvas');c.width=240;c.height=100;const ctx=c.getContext('2d')!;
   paintActorShadow(ctx,{ambient:[1,1,1],lamps:[{x:120-sign*100,y:70+8/.45,height:116,radius:500,strength:1}]},{x:120,y:70,originX:40,originY:68,scaleX:1,scaleY:1,rotation:0,alpha:1,image:silhouette});
   const pixels=ctx.getImageData(0,0,240,100).data;let min=100,max=0,count=0;
   for(let y=0;y<100;y++)for(let x=0;x<240;x++)if(sign*(x-120)>25&&pixels[(y*240+x)*4+3]>5){min=Math.min(min,y);max=Math.max(max,y);count++;}
   return {depth:max-min+1,count};
  });
 });
 for(const r of results){expect(r.depth).toBeGreaterThanOrEqual(8);expect(r.count).toBeGreaterThan(150);}
});
