import {test,expect,type Page} from '@playwright/test';
import {mechanismCases} from '../support/mechanisms';
import {importSave,approach} from './navigation';
import {inspect,capture} from './controls';
type Case=typeof mechanismCases[number];
async function liftAttendant(page:Page){
 const people=(await inspect(page)).people.filter(p=>p.id.startsWith('lift-attendant-'));expect(people).toHaveLength(1);
 const p=people[0];expect(p.x).toBe(948);expect(p.y).toBeGreaterThanOrEqual(667);expect(p.y).toBeLessThanOrEqual(675);return {x:p.x,y:p.y};
}
async function actionLine(page:Page,c:Case){
 await expect.poll(async()=>(await inspect(page)).cinematic).toBe(c.scene);
 for(let i=0;i<24;i++){
  if((await page.locator('.dialogue p').textContent())?.includes(c.text))return;
  await page.locator('.dialogue-actions button').first().click();
 }
 throw Error(`Missing mechanism line: ${c.text}`);
}
/** Visible output only; restrict samples to the prop and follow camera coordinates. */
async function hashes(page:Page,c:Case,ms=380){return page.evaluate(({roi,ms})=>new Promise<number[]>(resolve=>{
 const values=new Set<number>(),start=performance.now();let sampled=0;
 const tick=()=>{
  const now=performance.now();
  if(now-sampled>55){
   sampled=now;const info=window.borrowedTomorrowPixels.inspect(),v=window.borrowedTomorrow.inspect().view,source=document.querySelector('.pixel-source')!.getBoundingClientRect(),world=document.querySelector('.world-input')!.getBoundingClientRect(),out=document.querySelector<HTMLCanvasElement>('.pixel-output')!;
   const left=Math.max(0,roi.x-v.scrollX),top=Math.max(0,roi.y-v.scrollY),right=Math.min(v.width,roi.x+roi.w-v.scrollX),bottom=Math.min(v.height-240,roi.y+roi.h-v.scrollY);
   const x=Math.round(info.physicalLeft+((world.left-source.left)/info.cssScale+left)*info.physicalScale),y=Math.round(info.physicalTop+((world.top-source.top)/info.cssScale+top)*info.physicalScale);
   const w=Math.max(1,Math.round((right-left)*info.physicalScale)),h=Math.max(1,Math.round((bottom-top)*info.physicalScale));
   const pixels=out.getContext('2d')!.getImageData(x,y,w,h).data;let hash=2166136261;
   for(let i=0;i<pixels.length;i+=4)for(let j=0;j<3;j++)hash=Math.imul(hash^pixels[i+j],16777619);values.add(hash>>>0);
  }
  if(now-start>=ms)resolve([...values]);else requestAnimationFrame(tick);
 };tick();
}),{roi:c.roi,ms});}
for(const [device,viewport,dpr,reduced]of [
 ['desktop',{width:1280,height:800},1,false],['phone',{width:390,height:844},1.25,false],['reduced',{width:390,height:844},1.25,true],
]as const)for(const c of mechanismCases)test(`${c.name} mechanism moves, settles and commits on ${device}`,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:dpr,reducedMotion:reduced?'reduce':'no-preference'}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');await importSave(page,c.save());if(c.object)await approach(page,c.object);
  await actionLine(page,c);await page.mouse.move(0,0);const before=(await inspect(page)).state;
  const attendant=c.name==='lift'?await liftAttendant(page):undefined;
  expect(before.flags[c.flag]).toBeFalsy();await page.waitForTimeout(c.name==='coach'||c.name==='seasons'?120:950);
  const samples=await hashes(page,c);if(reduced)expect(samples.length,'reduced motion is steady').toBe(1);else expect(samples.length,`${c.name} prop pixels advance with a parked cursor`).toBeGreaterThan(1);
  if(attendant)expect(await liftAttendant(page),'the loading attendant does not rise with the platform').toEqual(attendant);
  await capture(page,`mechanism-${c.name}-${device}`);
  await page.locator('.dialogue-actions button').first().click();await page.waitForTimeout(1050);expect((await hashes(page,c,250)).length,'advancing dialogue settles the prop').toBe(1);
  expect((await inspect(page)).state.flags[c.flag]).toBeFalsy();await page.getByRole('button',{name:'Skip scene',exact:true}).click();
  const after=(await inspect(page)).state;expect(after.flags[c.flag]).toBe(true);expect(after.inventory).toEqual(before.inventory);expect(after.party).toEqual(before.party);expect(after.xp).toBe(before.xp);expect(after.coins).toBe(before.coins);
  if(attendant){await liftAttendant(page);await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).state.flags.waterLiftOpened).toBe(true);await liftAttendant(page);}
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await context.close();}
});
test('an interrupted harbor opening replays and skipping leaves no late prop motion',async({page})=>{
 const c=mechanismCases.find(c=>c.name==='harbor')!,errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await importSave(page,c.save());await actionLine(page,c);await page.waitForTimeout(250);
 await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe(c.scene);expect((await inspect(page)).state.flags.harborOpened).toBeFalsy();
 await actionLine(page,c);await page.getByRole('button',{name:'Skip scene',exact:true}).click();const after=(await inspect(page)).state;expect(after.flags.harborOpened).toBe(true);
 await page.waitForTimeout(3500);expect((await inspect(page)).state).toMatchObject({flags:after.flags,inventory:after.inventory,party:after.party});expect((await inspect(page)).cinematic).toBeNull();expect(errors).toEqual([]);
});
test('the Breakwater ferry stays moored while the gate opens',async({page})=>{
 const c=mechanismCases.find(c=>c.name==='harbor')!;await page.goto('/');await importSave(page,c.save());await actionLine(page,c);
 await page.mouse.move(0,0);await page.waitForTimeout(1100);
 const ferry={...c,roi:{x:1270,y:270,w:160,h:130}};
 expect((await hashes(page,ferry,1000)).length,'the ferry remains still while the gate finishes opening').toBe(1);
 await page.locator('.dialogue-actions button').first().click();expect((await hashes(page,ferry,400)).length).toBe(1);
 await capture(page,'breakwater-ferry-moored');
});
test('gate leaves recede into the passage and match the saved open artwork',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(async()=>{
  const pixels=async(url:string,frame=0)=>{
   const image=new Image();image.src=url;await image.decode();const canvas=document.createElement('canvas');canvas.width=312;canvas.height=192;
   const ctx=canvas.getContext('2d')!;ctx.drawImage(image,frame*312,0,312,192,0,0,312,192);return ctx.getImageData(0,0,312,192).data;
  };
  const open=await pixels('/art/vector/chapter-four/harbor-gate-open.svg'),frames=await Promise.all([0,4,8,12,16].map(i=>pixels('/art/vector/story-mechanisms/harbor-gate.svg',i)));
  const mask=(p:Uint8ClampedArray,x:number,y:number)=>p[(y*312+x)*4+3]>128;
  const asymmetry=(p:Uint8ClampedArray)=>{let count=0;for(let y=0;y<192;y++)for(let x=0;x<156;x++)if(mask(p,x,y)!==mask(p,311-x,y))count++;return count;};
  let savedDifference=0;for(let y=0;y<192;y++)for(let x=0;x<312;x++)if(mask(open,x,y)!==mask(frames[4],x,y))savedDifference++;
  return {asymmetry:frames.map(asymmetry),savedDifference,freeEdges:[mask(open,70,80),mask(open,241,80)]};
 });
 for(const mismatch of result.asymmetry)expect(mismatch,'the two leaves share mirrored perspective into the passage').toBeLessThan(32);
 expect(result.savedDifference,'finishing the scene keeps the same gate silhouette').toBeLessThan(32);expect(result.freeEdges).toEqual([true,true]);
});
for(const [map,flag,sheet,width,x,y,px,py]of [
 ['coast','prisonersFreed','coach-door',264,504,168,222,86],
 ['signalwall','dawnwatchFreed','watch-anchor',320,620,135,162,108],
]as const)test(`Maps review restores the saved ${sheet} pose`,async({page})=>{
 await page.goto(`/?dev=maps&map=${map}&mapFlags=${flag}&mapOverlays=&cell=0,0`);
 await expect(page.locator('.map-review').locator('..')).toHaveAttribute('data-ready','true');
 const pixels=await page.locator('#map-preview').evaluate(async(canvas,args)=>{
  const img=new Image();img.src=`/art/vector/story-mechanisms/${args.sheet}.svg`;await img.decode();const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;c.getContext('2d')!.drawImage(img,0,0);
  return {expected:[...c.getContext('2d')!.getImageData(16*args.width+args.px,args.py,1,1).data],actual:[...(canvas as HTMLCanvasElement).getContext('2d')!.getImageData(args.x+args.px,args.y+args.py,1,1).data]};
 },{sheet,width,x,y,px,py});expect(pixels.actual).toEqual(pixels.expected);
});
