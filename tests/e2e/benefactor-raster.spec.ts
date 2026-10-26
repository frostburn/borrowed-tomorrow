import {test,expect,type Page} from '@playwright/test';
import {inspect,capture} from './controls';
import {RASTER_ACTORS} from '../../src/content/actor-art-skin';
import {benefactorDomainArt} from '../../src/content/scene-art';
import {mkdir,writeFile} from 'node:fs/promises';

const labels=['Campaign · the Benefactor','Campaign · hollow sun','Campaign · exposed heart'];
const stems=['benefactor-motion','benefactor-sun-motion','benefactor-heart-motion'];
test('idle poses preserve fixed details and rigid native pixel shapes',async({page})=>{
 await page.goto('/?dev=boss');
 const result=await page.evaluate(async stems=>{
  const report=[];
  for(const stem of stems){
   const pages=await Promise.all(['','-1'].map(async suffix=>{
    const image=new Image();image.src=`/art/raster-actors/benefactor/${stem}${suffix}.png`;await image.decode();
    const canvas=document.createElement('canvas');canvas.width=360;canvas.height=288;const ctx=canvas.getContext('2d')!;ctx.drawImage(image,0,0);return ctx;
   }));
   const frames=Array.from({length:8},(_,i)=>pages[Math.floor(i/4)].getImageData(i%2*180,Math.floor(i%4/2)*144,180,144).data),rest=frames[0];
   for(const pixels of frames){
    let fixed=0;
    const same=(x:number,y:number,dx=0,dy=0,alphaOnly=false)=>{
     const p=(y*180+x)*4,sx=x-dx,sy=y-dy,q=(sy*180+sx)*4;
     return (alphaOnly?[3]:[0,1,2,3]).every(c=>pixels[p+c]===(sx<0||sx>=180||sy<0||sy>=144?0:rest[q+c]));
    };
    if(stem==='benefactor-motion'){
     for(let y=0;y<144;y++)for(let x=0;x<180;x++){
      const cuff=y>=85&&y<=133&&(x<=58||x>=122),crystal=x>=77&&x<=104&&y>=56&&y<=85;
      if(!cuff&&!crystal&&!same(x,y))fixed++;
     }
     const hands=[-1,0].filter(dy=>[12,140].every(left=>Array.from({length:24*18},(_,p)=>same(left+p%24,100+Math.floor(p/24),0,dy)).every(Boolean)));
     report.push({fixed,rigid:hands.length===1});
    }else if(stem==='benefactor-sun-motion'){
     for(let y=0;y<144;y++)for(let x=0;x<180;x++)if(!(x>=68&&x<=110&&y>=40&&y<=99)&&!same(x,y))fixed++;
     // Its opaque aperture and complete ring/ray silhouette never deform.
     report.push({fixed,rigid:Array.from({length:180*144},(_,p)=>same(p%180,Math.floor(p/180),0,0,true)).every(Boolean)});
    }else{
     const offsets=[-2,-1,0].filter(dy=>Array.from({length:180*144},(_,p)=>{
      const x=p%180,y=Math.floor(p/180),core=x>=60&&x<=121&&y>=29&&y<=111;
      return same(x,y,0,dy,core);
     }).every(Boolean));
     report.push({fixed,rigid:offsets.length===1});
    }
   }
  }return report;
 },stems);
 expect(result).toHaveLength(24);expect(result.every(r=>r.fixed===0&&r.rigid)).toBe(true);
});
async function nativePixels(page:Page,form:number){
 const s=await inspect(page),actor=s.actors.find(a=>a.hero==='benefactor')!;
 return page.evaluate(async({actor,url})=>{
  const image=new Image();image.src='/'+url;await image.decode();
  const ref=document.createElement('canvas');ref.width=360;ref.height=288;const ctx=ref.getContext('2d')!;ctx.imageSmoothingEnabled=false;
  ctx.drawImage(image,0,0,180,144,0,0,360,288);
  const expected=ctx.getImageData(0,0,360,288).data,canvas=document.querySelector<HTMLCanvasElement>('.phaser-host canvas')!,actual=canvas.getContext('2d')!.getImageData(0,0,canvas.width,canvas.height).data;
  const view=window.borrowedTomorrow.inspect().view,left=Math.round(actor.x-180-view.scrollX),top=Math.round(actor.y-288-view.scrollY);
  let compared=0,wrong=0;
  for(let y=4;y<284;y++)for(let x=4;x<356;x++){
   const dx=left+x,dy=top+y,p=(y*360+x)*4;
   if(dx<0||dy<48||dx>=canvas.width||dy>=canvas.height||expected[p+3]!==255)continue;
   if([-2,2,-720,720].some(d=>expected[p+d*4+3]!==255))continue;
   compared++;if([0,1,2].some(c=>Math.abs(actual[(dy*canvas.width+dx)*4+c]-expected[p+c])>2))wrong++;
  }
  return {compared,wrong};
 },{actor,url:RASTER_ACTORS[`art/vector/benefactor/${stems[form]}.svg`].url});
}
const sample=(page:Page,ms:number)=>page.evaluate(ms=>new Promise<{frame:string;motion:string;pixels:string}[]>(resolve=>{
 const start=performance.now(),samples:{frame:string;motion:string;pixels:string}[]=[];let last='';
 const tick=()=>{const a=window.borrowedTomorrow.inspect().actors.find(a=>a.hero==='benefactor');if(a&&a.frame!==last){
  last=a.frame;samples.push({frame:a.frame,motion:a.motion,pixels:document.querySelector<HTMLCanvasElement>('.phaser-host canvas')!.toDataURL()});
 }if(performance.now()-start>=ms)resolve(samples);else requestAnimationFrame(tick);};tick();
}),ms);

for(const [device,viewport,dpr]of [['desktop',{width:1280,height:900},1],['phone',{width:390,height:844},1.25]]as const){
 test.describe(`painted final boss on ${device}`,()=>{
  test.use({viewport,deviceScaleFactor:dpr});
  for(let form=0;form<3;form++)test(`form ${form+1} assembles all pages, breathes and attacks`,async({page})=>{
   const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/?dev=boss');
   await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop');
   await page.getByRole('button',{name:labels[form],exact:true}).click();
   await expect.poll(async()=>(await inspect(page)).actors.find(a=>a.hero==='benefactor')?.motion).toBe('idle');
   expect((await inspect(page)).battle!.benefactor!.form).toBe(form);
   await expect.poll(async()=>{const p=await nativePixels(page,form);return p.compared>1000&&p.wrong===0;}).toBe(true);
   await capture(page,`painted-benefactor-${form}-${device}`);
   const stable=await sample(page,200);expect(new Set(stable.map(s=>s.pixels)).size).toBe(1);
   await page.emulateMedia({reducedMotion:'no-preference'});await page.mouse.move(0,0);
   const breathing=await sample(page,3300);expect(new Set(breathing.map(s=>s.frame))).toEqual(new Set(['0','1','2','3','4','5','6','7']));
   expect(new Set(breathing.map(s=>s.pixels)).size).toBeGreaterThanOrEqual(3);
   if(process.env.BT_QA_SCREENSHOTS&&device==='desktop'){
    const dir=`${process.env.BT_QA_SCREENSHOTS}/cycle-${form}`;await mkdir(dir,{recursive:true});
    await Promise.all(breathing.map(s=>writeFile(`${dir}/${s.frame}.png`,Buffer.from(s.pixels.split(',')[1],'base64'))));
   }
   const attacks=new Set<string>();
   for(let i=0;i<7&&attacks.size<4;i++){
    await expect(page.getByRole('button',{name:/^F\s+Defend$/})).toBeEnabled();
    const recording=sample(page,2200);await page.getByRole('button',{name:/^F\s+Defend$/}).click();
    for(const s of await recording)if(s.motion==='attack')attacks.add(s.frame);
   }
   expect(attacks).toEqual(new Set(['8','9','10','11']));
   await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
  });
 });
}

test('the arena and boss skins can be selected independently',async({page})=>{
 for(const [actor,map]of [['vector','raster'],['raster','vector']]as const){
  await page.goto('/');await page.evaluate(({actor,map})=>{localStorage.setItem('borrowed-tomorrow-actor-art',actor);localStorage.setItem('borrowed-tomorrow-map-art',map);},{actor,map});
  const paths:string[]=[];page.on('request',r=>paths.push(r.url()));
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/?dev=boss');
  await page.getByRole('button',{name:labels[0],exact:true}).click();await expect.poll(async()=>(await inspect(page)).mode).toBe('battle');
  expect(paths.some(p=>p.includes(actor==='raster'?'raster-actors/benefactor/benefactor-motion.png':'vector/benefactor/benefactor-motion.svg'))).toBe(true);
  const floor=await page.evaluate(async pieces=>{
   const ref=document.createElement('canvas');ref.width=1024;ref.height=480;
   const ctx=ref.getContext('2d')!;ctx.imageSmoothingEnabled=false;
   for(const p of pieces){const image=new Image();image.src='/'+p.url;await image.decode();ctx.drawImage(image,p.x,p.y,p.width,p.height);}
   const expected=ctx.getImageData(0,0,1024,480).data,canvas=document.querySelector<HTMLCanvasElement>('.phaser-host canvas')!,actual=canvas.getContext('2d')!.getImageData(0,0,canvas.width,canvas.height).data;
   const view=window.borrowedTomorrow.inspect().view;let compared=0,wrong=0;
   // The unlit front cutaway is clear of the grid, actors and UI overlays.
   for(const y of [470,474])for(let x=48;x<canvas.width-48;x++){
    const wx=x+view.scrollX,dy=y-view.scrollY;if(dy<0||dy>=canvas.height)continue;
    compared++;if([0,1,2].some(c=>Math.abs(actual[(dy*canvas.width+x)*4+c]-expected[(y*1024+wx)*4+c])>2))wrong++;
   }return {compared,wrong};
  },benefactorDomainArt(map));
  expect(floor.compared).toBeGreaterThan(500);expect(floor.wrong).toBe(0);
  await capture(page,`painted-benefactor-${actor}-actors-${map}-map`);
 }
});
