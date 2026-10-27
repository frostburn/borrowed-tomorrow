import {test,expect,type Page} from '@playwright/test';
import {checkpoint} from '../support/progress';
import {importSave,approach} from './navigation';
import {inspect,capture} from './controls';

async function markerPixels(page:Page,color:number[]){
 const {view}=await inspect(page);
 return page.locator('.phaser-host canvas').evaluate((canvas:HTMLCanvasElement,{view,color})=>{
  const ctx=canvas.getContext('2d')!,x=Math.round(780-view.scrollX),y=Math.round(267-view.scrollY);let count=0;
  const data=ctx.getImageData(x-20,y-16,40,32).data;
  for(let i=0;i<data.length;i+=4)if(color.every((c,k)=>Math.abs(data[i+k]-c)<2))count++;
  return count;
 },{view,color});
}
for(const [name,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]as const)test(`Rillbridge exit is grey while blocked and blue when freed on ${name}`,async({page})=>{
 await page.setViewportSize(viewport);await page.emulateMedia({reducedMotion:'reduce'});
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');
 const blocked=checkpoint('villageSeen');blocked.location={map:'rillbridge',x:31,y:11};await importSave(page,blocked);
 await expect.poll(()=>markerPixels(page,[124,137,144])).toBeGreaterThan(5);await capture(page,`rillbridge-exit-blocked-${name}`);
 await approach(page,'east-pass');await expect(page.getByText('The collector has stopped the crossing. Reach the eastern carriage.',{exact:true})).toBeVisible();
 expect((await inspect(page)).state.location.map).toBe('rillbridge');
 const open=checkpoint('villageFreed');open.location={map:'rillbridge',x:31,y:11};await importSave(page,open);
 await expect.poll(()=>markerPixels(page,[118,198,223])).toBeGreaterThan(5);await capture(page,`rillbridge-exit-open-${name}`);
 await approach(page,'east-pass');await expect.poll(async()=>(await inspect(page)).state.location.map).toBe('tunnel');
 await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
});
