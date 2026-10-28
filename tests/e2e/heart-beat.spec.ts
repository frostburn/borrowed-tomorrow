import {test,expect,type Page} from '@playwright/test';
import {inspect,capture} from './controls';
async function heartPixels(page:Page){return page.evaluate(()=>{
 const s=window.borrowedTomorrow.inspect(),actor=s.actors.find(a=>a.hero==='benefactor')!,info=window.borrowedTomorrowPixels.inspect();
 const source=document.querySelector('.pixel-source')!.getBoundingClientRect(),world=document.querySelector('.world-input')!.getBoundingClientRect();
 const x=info.physicalLeft+(Math.round((world.left-source.left)/info.cssScale)+actor.x-40-s.view.scrollX)*info.physicalScale,y=info.physicalTop+(Math.round((world.top-source.top)/info.cssScale)+actor.y-175-s.view.scrollY)*info.physicalScale;
 const pixels=document.querySelector<HTMLCanvasElement>('.pixel-output')!.getContext('2d')!.getImageData(Math.round(x),Math.round(y),80*info.physicalScale,70*info.physicalScale).data;
 let hash=2166136261;for(let i=0;i<pixels.length;i+=4)for(let c=0;c<3;c++)hash=Math.imul(hash^pixels[i+c],16777619);return hash>>>0;
});}
for(const [device,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]as const)test(`exposed heart beats with a parked cursor, attacks and settles on ${device}`,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:1.25}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 try{
  await page.clock.install();await page.goto('/?dev=boss');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop',{timeout:30000});await page.locator('[data-final-form="2"]').click();await expect.poll(async()=>(await inspect(page)).mode).toBe('battle');await page.mouse.move(1,1);
  await page.clock.pauseAt(new Date(Date.now()+200));await page.clock.runFor(100);
  const poses=new Set<string>(),hashes=new Set<number>();const original=(await inspect(page)).actors.find(a=>a.hero==='benefactor')!;
  for(let i=0;i<16;i++){
   const actor=(await inspect(page)).actors.find(a=>a.hero==='benefactor')!;expect(actor.motion).toBe('heartbeat');expect([actor.x,actor.y]).toEqual([original.x,original.y]);
   poses.add(actor.frame);hashes.add(await heartPixels(page));if(actor.frame==='1'||actor.frame==='3')await capture(page,`heart-beat-${actor.frame}-${device}`);await page.clock.runFor(150);
  }
  expect(poses.size).toBe(8);expect(hashes.size).toBeGreaterThan(3);
  // Normal Defend/AI actions exercise judgment and the impact redraw.
  let attack=false,resumed=false;
  for(let i=0;i<140;i++){
   const s=await inspect(page),actor=s.actors.find(a=>a.hero==='benefactor')!;
   if(actor.motion==='attack')attack=true;
   if(attack&&!s.busy&&actor.motion==='heartbeat'){resumed=true;break;}
   if(!s.busy){const defend=page.getByRole('button',{name:/^F\s+Defend$/});if(await defend.isVisible())await defend.dispatchEvent('click');}
   await page.clock.runFor(100);
  }
  expect(attack).toBe(true);expect(resumed).toBe(true);
  await page.emulateMedia({reducedMotion:'reduce'});await page.clock.runFor(200);const still=await heartPixels(page);await page.clock.runFor(1400);expect(await heartPixels(page)).toBe(still);expect((await inspect(page)).actors.find(a=>a.hero==='benefactor')?.frame).toBe('0');await capture(page,`heart-rest-${device}`);
  await page.getByRole('button',{name:'Restart battle',exact:true}).dispatchEvent('click');await page.clock.runFor(100);expect((await inspect(page)).battle!.round).toBe(1);expect((await inspect(page)).actors.find(a=>a.hero==='benefactor')?.motion).toBe('idle');
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await context.close();}
});

test('native beat rotates rigid crystal halves while its surrounding rays stay fixed',async({page})=>{
 await page.goto('/?dev=boss');
 const result=await page.evaluate(async()=>{
  const image=new Image();image.src='/art/vector/benefactor/benefactor-heart-motion.svg';await image.decode();const c=document.createElement('canvas');c.width=720;c.height=1728;const ctx=c.getContext('2d')!;ctx.drawImage(image,0,0);
  const frames=Array.from({length:8},(_,i)=>ctx.getImageData(i%2*360,Math.floor(i/2)*288,360,288).data);let rays=0,changed=0;const widths=[];
  for(const data of frames){let left=360,right=0;for(let y=120;y<160;y++)for(let x=100;x<250;x++)if(data[(y*360+x)*4+3]){left=Math.min(left,x);right=Math.max(right,x);}widths.push(right-left);}
  for(let i=1;i<8;i++)for(let y=0;y<288;y++)for(let x=0;x<360;x++){
   const p=(y*360+x)*4;if(x<120||x>240||y<68||y>214){if([0,1,2,3].some(k=>frames[0][p+k]!==frames[i][p+k]))rays++;}else if(frames[0][p+3]!==frames[i][p+3])changed++;
  }
  const svg=new DOMParser().parseFromString(await (await fetch(image.src)).text(),'image/svg+xml'),poses=[...svg.documentElement.children].filter(e=>e.tagName==='svg');
  const halves=['left','right'].map(side=>poses.map(p=>{
   const group=p.querySelector(`[data-heart-half="${side}"]`)!;
   return {geometry:group.innerHTML,angle:Number(group.getAttribute('transform')!.match(/rotate\(([-\d.]+)/)![1])};
  }));
  return {rays,changed,widths,halves};
 });
 for(const half of result.halves){expect(new Set(half.map(p=>p.geometry)).size).toBe(1);expect(half).toHaveLength(12);}
 for(let i=0;i<12;i++)expect(result.halves[0][i].angle+result.halves[1][i].angle).toBe(0);
 expect(result.rays).toBe(0);expect(result.changed).toBeGreaterThan(100);expect(result.widths[1]).toBeGreaterThan(result.widths[3]);expect(result.widths[3]).toBeGreaterThan(result.widths[0]);expect(result.widths.slice(5)).toEqual([result.widths[0],result.widths[0],result.widths[0]]);
});
