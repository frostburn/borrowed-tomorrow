import {expect,test,type Page} from '@playwright/test';
import {MAPS,walkable} from '../../src/content/maps';
import {interactionMarker} from '../../src/content/interaction-markers';
import {ABILITIES,active,legalAim,type Battle} from '../../src/rules/combat';
import {cells,distance,toPixel} from '../../src/rules/hex';
import {chapterFiveStart} from '../../src/dev/canonical-saves';
import {anchorCheckpoint} from '../support/anchors';
import {checkpoint} from '../support/progress';
import {importSave,approach} from './navigation';
import {capture,clickHex,inspect} from './controls';

async function markerPixels(page:Page,id:string,color:string){
 const o=MAPS.station.objects.find(o=>o.id===id)!;
 return page.evaluate(({o,color})=>{
  const view=window.borrowedTomorrow.inspect().view,info=window.borrowedTomorrowPixels.inspect();
  const source=document.querySelector('.pixel-source')!.getBoundingClientRect(),world=document.querySelector('.world-input')!.getBoundingClientRect();
  const output=document.querySelector<HTMLCanvasElement>('.pixel-output')!;
  const x=info.physicalLeft+(Math.round((world.left-source.left)/info.cssScale)+(o.x+.5)*24-view.scrollX)*info.physicalScale;
  const y=info.physicalTop+(Math.round((world.top-source.top)/info.cssScale)+(o.y+.5)*24-(o.sprite?74:9)-view.scrollY)*info.physicalScale;
  const left=Math.max(0,Math.floor(x-12*info.physicalScale)),top=Math.max(0,Math.floor(y-16*info.physicalScale));
  const p=output.getContext('2d')!.getImageData(left,top,Math.min(output.width-left,24*info.physicalScale),Math.min(output.height-top,32*info.physicalScale)).data;
  const rgb=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16));let count=0;
  for(let i=0;i<p.length;i+=4)if(rgb.every((v,c)=>Math.abs(p[i+c]-v)<10))count++;
  return count;
 },{o,color});
}
for(const [device,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]as const){
 test.describe(`interface issues on ${device}`,()=>{
  test.use({viewport,deviceScaleFactor:1.25,reducedMotion:'reduce'});
  test('markers, objective space, fixed dialogue navigation and inline range feedback',async({page})=>{
   const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');
   const gantry=anchorCheckpoint('forgeGantrySeen');gantry.activeParty=['nell','petra','celia'];await importSave(page,gantry);
   const layout=await page.evaluate(()=>{
    const scale=window.borrowedTomorrowPixels.inspect().cssScale,objective=document.querySelector('.world-objective')!,controls=document.querySelector('.controls')!.getBoundingClientRect();
    return {width:objective.getBoundingClientRect().width/scale,bottom:objective.querySelector('p')!.getBoundingClientRect().bottom-controls.bottom,
     stacked:[...document.querySelectorAll('.world-hero')].every(hero=>{const [hp,lv]=hero.querySelectorAll('small');return hp.textContent!.startsWith('HP ')&&lv.textContent!.startsWith('Lv ')&&lv.getBoundingClientRect().top>=hp.getBoundingClientRect().bottom;})};
   });
   expect(layout.stacked).toBe(true);expect(layout.width).toBeGreaterThanOrEqual(device==='desktop'?300:240);expect(layout.bottom).toBeLessThanOrEqual(0);await capture(page,`objective-space-${device}`);
   for(const id of ['tomas','iona','ansel','west-yard']){
    const s=checkpoint('festivalSeen'),o=MAPS.station.objects.find(o=>o.id===id)!;
    const at=[{x:o.x,y:o.y+2},{x:o.x+1,y:o.y},{x:o.x,y:o.y}].find(p=>walkable(MAPS.station,p.x,p.y,s))!;s.location={map:'station',...at};
    await importSave(page,s);const marker=interactionMarker(o,s)!;
    await expect.poll(()=>markerPixels(page,id,marker.color)).toBeGreaterThan(4);await capture(page,`marker-${o.kind}-${device}`);
   }
   await page.getByRole('button',{name:'Controls and combat help',exact:true}).click();await expect(page.getByRole('dialog')).toContainText('gold ! for story actions');await page.getByRole('button',{name:'Close',exact:true}).click();

   await importSave(page,chapterFiveStart());const corners:{x:number;y:number;width:number;height:number}[]=[];
   while(await page.locator('.dialogue').isVisible()){
    const next=page.locator('.dialogue-actions button');await expect(next).toHaveCount(1);const box=(await next.boundingBox())!;corners.push(box);
    if((await page.locator('.dialogue h2').textContent())==='Superintendent Durn')await capture(page,`fixed-next-${device}`);
    await next.click();
   }
   expect(corners.length).toBeGreaterThan(10);
   for(const box of corners)for(const key of ['x','y','width','height']as const)expect(Math.abs(box[key]-corners[0][key]),`Next ${key}`).toBeLessThan(1);
   expect((await inspect(page)).state.flags.airfieldSeen).toBe(true);

   await importSave(page,gantry);await approach(page,'forge-carrier');await page.getByRole('button',{name:'Hold off the furnace carrier',exact:true}).click();
   await expect.poll(async()=>{const s=await inspect(page);return s.mode==='battle'&&!s.busy&&s.battle&&active(s.battle as unknown as Battle)?.side==='party';}).toBeTruthy();
   const raw=(await inspect(page)).battle!,b={...raw,obstacles:new Set(raw.obstacles),water:new Set(raw.water),vents:new Set(raw.vents)}as Battle,u=active(b)!;
   expect(u.abilities).toContain('burst');await page.locator('.actions').getByRole('button',{name:new RegExp(`^\\d\\s+${ABILITIES.burst.name}$`)}).click();
   const bad=cells().filter(h=>toPixel(h).y>300&&!legalAim(b,u,'burst',h)).sort((a,z)=>distance(u.hex,z)-distance(u.hex,a))[0];
   const good=cells().find(h=>toPixel(h).y>300&&legalAim(b,u,'burst',h))!;
   const toast=await page.locator('#toast').textContent();await clickHex(page,bad);
   await expect(page.locator('#confirmation .invalid-target')).toHaveText('Out of range or blocked.');expect(await page.locator('#toast').textContent()).toBe(toast);await capture(page,`inline-range-${device}`);
   expect((await inspect(page)).battle!.units).toEqual(raw.units);
   await clickHex(page,good);await expect(page.getByRole('button',{name:'Confirm attack',exact:true})).toBeVisible();await expect(page.locator('.invalid-target')).toHaveCount(0);
   await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
  });
 });
}
