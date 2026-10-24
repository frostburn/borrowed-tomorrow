import {test,expect,type Page} from '@playwright/test';
import {anchorCheckpoint,dawnwatchCheckpoint,windmereCheckpoint} from '../support/anchors';
import {chapterFiveFinaleStart} from '../../src/dev/canonical-saves';
import {createBattle,awardVictory} from '../../src/rules/combat';
import {arrival,MAPS} from '../../src/content/maps';
import {BLOCKED_MARKER_COLOR,INTERACTION_MARKERS} from '../../src/content/interaction-markers';
import {importSave,approach} from './navigation';
import {inspect,capture,dialogue} from './controls';

async function markerColor(page:Page,map:keyof typeof MAPS,id:string,color:string){
 const o=MAPS[map].objects.find(o=>o.id===id)!;
 await expect.poll(()=>page.evaluate(({o,color})=>{
  const view=window.borrowedTomorrow.inspect().view,info=window.borrowedTomorrowPixels.inspect();
  const source=document.querySelector('.pixel-source')!.getBoundingClientRect(),world=document.querySelector('.world-input')!.getBoundingClientRect();
  const wx=Math.round((world.left-source.left)/info.cssScale),wy=Math.round((world.top-source.top)/info.cssScale);
  const cx=(o.x+.5)*24-view.scrollX,cy=(o.y+.5)*24-9-view.scrollY,c=document.querySelector<HTMLCanvasElement>('.pixel-output')!;
  const data=c.getContext('2d')!.getImageData(0,0,c.width,c.height).data,rgb=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16));let count=0;
  for(let y=-16;y<=16;y++)for(let x=-12;x<=12;x++){
   const px=info.physicalLeft+(wx+Math.round(cx)+x)*info.physicalScale,py=info.physicalTop+(wy+Math.round(cy)+y)*info.physicalScale;
   const at=(py*c.width+px)*4;if(rgb.every((v,i)=>Math.abs(data[at+i]-v)<=1))count++;
  }
  return count;
 },{o,color})).toBeGreaterThan(6);
}

test('Maps exposes marker-only prerequisites and paints their actual unlock colors',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/?dev=maps&map=windmere&mapOverlays=actors,markers');await expect(page).toHaveTitle(/Borrowed Tomorrow/);
 await expect(page.locator('#map-workshop')).toHaveAttribute('data-ready','true');await page.getByText('Story flags',{exact:true}).click();
 const colorCount=(color:string)=>page.locator('#map-preview').evaluate((canvas,color)=>{
  const c=canvas as HTMLCanvasElement,p=c.getContext('2d')!.getImageData(800,504,170,18).data,rgb=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16));let count=0;
  for(let i=0;i<p.length;i+=4)if(rgb.every((v,j)=>p[i+j]===v))count++;return count;
 },color);
 await expect.poll(()=>colorCount(BLOCKED_MARKER_COLOR)).toBeGreaterThan(6);
 await page.locator('[data-map-flag="waterLiftOpened"]').click();await expect(page.locator('[data-map-flag="waterLiftOpened"]')).toHaveAttribute('aria-pressed','true');
 await expect.poll(()=>colorCount(INTERACTION_MARKERS.story.color)).toBeGreaterThan(6);
 await capture(page,'workshop-marker-unlocked');await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
});

async function openingRay(page:Page){
 return page.evaluate(()=>{
  const view=window.borrowedTomorrow.inspect().view,info=window.borrowedTomorrowPixels.inspect(),source=document.querySelector('.pixel-source')!.getBoundingClientRect(),world=document.querySelector('.world-input')!.getBoundingClientRect();
  const wx=Math.round((world.left-source.left)/info.cssScale),wy=Math.round((world.top-source.top)/info.cssScale),c=document.querySelector<HTMLCanvasElement>('.pixel-output')!,data=c.getContext('2d')!.getImageData(0,0,c.width,c.height).data;
  let bright=0,core=0;const length=Math.hypot(295,72);
  for(let k=-14;k<=14;k++){
   const x=Math.round(797.5+72/length*k-view.scrollX),y=Math.round(226+295/length*k-view.scrollY);
   const at=((info.physicalTop+(wy+y)*info.physicalScale)*c.width+info.physicalLeft+(wx+x)*info.physicalScale)*4;
   const lit=data[at]>220&&data[at+1]>200&&data[at+2]>150;if(lit)bright++;if(lit&&Math.abs(k)<=2)core++;
  }
  return {bright,core};
 });
}

for(const [device,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]as const){
 test(`Chapter Five blocked ! and exit marks render grey and unlock on ${device}`,async({browser})=>{
  const context=await browser.newContext({viewport,deviceScaleFactor:1.25,reducedMotion:'reduce'}),page=await context.newPage(),errors:string[]=[];
  page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');
   for(const opened of [false,true]){
    const s=anchorCheckpoint(opened?'forgeApproachWon':'coolingSeen');s.location={map:'coolingworks',x:46,y:25};await importSave(page,s);
    await markerColor(page,'coolingworks','cooling-wheel',opened?INTERACTION_MARKERS.story.color:BLOCKED_MARKER_COLOR);
    if(!opened){await capture(page,`blocked-wheel-${device}`);await approach(page,'cooling-wheel');await expect(page.locator('.dialogue p')).toContainText('Clear the approach first');await dialogue(page);expect((await inspect(page)).state.flags.coolingOpened).toBeUndefined();}
   }
   for(const flag of ['watchGunsSeen','mortarWon','repeaterWon']as const){
    const s=dawnwatchCheckpoint(flag);s.location={map:'watchbarracks',x:33,y:24};await importSave(page,s);
    await markerColor(page,'watchbarracks','watch-wall',flag==='repeaterWon'?INTERACTION_MARKERS.exit.color:BLOCKED_MARKER_COLOR);
   }
   for(const flag of ['windmereSeen','waterLiftOpened','patientsTransferred']as const){
    const s=windmereCheckpoint(flag);s.location={map:'windmere',x:39,y:26};await importSave(page,s);
    await markerColor(page,'windmere','wind-mirrorward',flag==='patientsTransferred'?INTERACTION_MARKERS.exit.color:BLOCKED_MARKER_COLOR);
    if(flag==='windmereSeen')await markerColor(page,'windmere','wind-transfer',BLOCKED_MARKER_COLOR);
    await capture(page,`hospital-${flag}-${device}`);
   }
   await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
  }finally{await context.close();}
 });

 test(`Benefactor opening ray has a broad bright core at fractional DPR on ${device}`,async({browser})=>{
  const context=await browser.newContext({viewport,deviceScaleFactor:1.25}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');
   const s=chapterFiveFinaleStart();s.flags.flagshipApproachSeen=true;s.flags.flagshipConfronted=true;
   const b=createBattle('alban-flagship',s);b.result='victory';awardVictory(b,s);s.location=arrival('flagship','start');
   for(const reducedMotion of ['no-preference','reduce']as const){
    await page.emulateMedia({reducedMotion});await importSave(page,s);await expect.poll(async()=>(await inspect(page)).cinematic).toBe('five-benefactor-claim');
    for(let n=0;n<8;n++){if((await page.locator('.dialogue p').textContent())?.includes('A bright seam opens'))break;await page.locator('.dialogue-actions button').first().click();}
    await expect(page.locator('.dialogue p')).toContainText('A bright seam opens');await page.mouse.move(0,0);
    await expect.poll(async()=>(await openingRay(page)).core).toBeGreaterThanOrEqual(4);expect((await openingRay(page)).bright).toBeGreaterThanOrEqual(12);
    await capture(page,`benefactor-ray-${reducedMotion}-${device}`);expect((await inspect(page)).state.flags.albanDestroyed).toBeUndefined();
   }
   await page.getByRole('button',{name:'Skip scene',exact:true}).click();await expect.poll(async()=>(await inspect(page)).state.flags.albanDestroyed).toBe(true);
   await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
  }finally{await context.close();}
 });
}
