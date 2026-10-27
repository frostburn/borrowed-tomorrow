import {test,expect} from '@playwright/test';
import {checkpoint} from '../support/progress';
import {importSave} from './navigation';
import {inspect,capture} from './controls';

for(const [name,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]as const){
 test(`cave ledges occlude shadows while floor keeps them on ${name}`,async({page})=>{
  await page.setViewportSize(viewport);await page.emulateMedia({reducedMotion:'reduce'});
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');
  const state=checkpoint('passSeen');state.location={map:'tunnel',x:19,y:16};await importSave(page,state);
  const result=await page.evaluate(async()=>{
   const maps='/src/content/maps.ts',lights='/src/game/light-canvas.ts',art='/src/content/scene-art.ts';
   const {MAPS}=await import(/* @vite-ignore */maps),{lightGround}=await import(/* @vite-ignore */lights),{visibleSceneArt}=await import(/* @vite-ignore */art);
   const map=MAPS.tunnel.tiles,pieces=visibleSceneArt(map,window.borrowedTomorrow.inspect().state),images=new Map();
   for(const p of pieces){const i=new Image();i.src='/'+p.url;await i.decode();images.set(p.key,i);}
   const flags=window.borrowedTomorrow.inspect().state,plain=lightGround(map,flags),clipped=lightGround(map,flags,(p:any)=>images.get(p.key));
   const c=document.createElement('canvas').getContext('2d')!;let hidden=0,floor=0;
   for(let y=0;y<624;y++)for(let x=0;x<1008;x++)if(c.isPointInPath(plain,x+.5,y+.5)){if(c.isPointInPath(clipped,x+.5,y+.5))floor++;else hidden++;}
   // A transparent opening must survive while visible pixels cut the shadow.
   const mask=document.createElement('canvas');mask.width=1008;mask.height=624;
   mask.getContext('2d')!.fillRect(455,390,4,4);
   const synthetic=lightGround(map,flags,(p:any)=>p.layerId===27?mask:undefined);
   return {hidden,floor,solid:c.isPointInPath(synthetic,456,391),opening:c.isPointInPath(synthetic,462,391)};
  });
  expect(result.hidden).toBeGreaterThan(20);expect(result.floor).toBeGreaterThan(10000);expect(result.solid).toBe(false);expect(result.opening).toBe(true);
  await capture(page,`cave-shadow-occlusion-${name}`);
  await page.locator('#canvas').focus();await page.keyboard.press('ArrowRight',{delay:60});
  await expect.poll(async()=>{const s=await inspect(page);return !s.moving&&s.state.location.x===20;}).toBe(true);
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 });
}

test('Maps refreshes cached shadow ground when a cave occluder is hidden and restored',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/?dev=maps&map=tunnel&mapScene=Scene:one-captain');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop');
 const host=page.locator('#map-workshop'),canvas=page.locator('#map-preview');await expect(host).toHaveAttribute('data-ready','true');
 const before=await canvas.evaluate((c:HTMLCanvasElement)=>c.toDataURL());
 await page.getByRole('button',{name:'Show Cave ledges',exact:true}).click();
 await expect.poll(()=>canvas.evaluate((c:HTMLCanvasElement)=>c.toDataURL())).not.toBe(before);
 await page.getByRole('button',{name:'Reset layers',exact:true}).click();
 await expect.poll(()=>canvas.evaluate((c:HTMLCanvasElement)=>c.toDataURL())).toBe(before);
 await capture(page,'cave-shadow-workshop');await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
});
