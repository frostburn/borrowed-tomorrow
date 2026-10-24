import {test,expect,type Page} from '@playwright/test';
import {MAPS} from '../../src/content/maps';
import {artPath} from '../../src/content/art-assets';
import {visibleSceneArt} from '../../src/content/scene-art';
import {palaceCheckpoint} from '../support/progress';
import {importSave} from './navigation';
import {capture,inspect} from './controls';

async function shadedActor(page:Page){
 const snapshot=await inspect(page),actor=snapshot.actors.find(a=>a.hero==='nell')!,map=MAPS[snapshot.state.location.map];
 return page.evaluate(async({actor,pieces,url,map})=>{
  const module='/src/game/world-light.ts',{sceneLight,lightPixels,castShadows}=await import(/* @vite-ignore */module);
  const decode=async(url:string)=>{const image=new Image();image.src=url;await image.decode();return image;};
  const native=document.querySelector<HTMLCanvasElement>('.phaser-host canvas')!,ctx=native.getContext('2d')!,view=window.borrowedTomorrow.inspect().view;
  const canvas=document.createElement('canvas');canvas.width=canvas.height=80;const c=canvas.getContext('2d')!;c.drawImage(await decode(url),0,0);
  const source=c.getImageData(0,0,80,80),lit=c.createImageData(80,80),rig=sceneLight(map.id,pieces)!;
  lightPixels(source,lit,rig,actor.x,actor.y,40,68);
  const actual=ctx.getImageData(Math.round(actor.x-40-view.scrollX),Math.round(actor.y-68-view.scrollY),80,80).data;
  let compared=0,wrong=0,changed=0;
  for(let i=0;i<actual.length;i+=4)if(source.data[i+3]>=254){
   compared++;if([0,1,2].some(k=>Math.abs(actual[i+k]-lit.data[i+k])>3))wrong++;
   if([0,1,2].some(k=>Math.abs(actual[i+k]-source.data[i+k])>8))changed++;
  }
  const floor=document.createElement('canvas');floor.width=map.width;floor.height=map.height;const f=floor.getContext('2d')!;
  for(const p of [...pieces].sort((a,b)=>a.depth-b.depth))f.drawImage(await decode('/'+p.url),p.x,p.y);
  let shadowPixels=0;
  for(const cast of castShadows(rig,actor.x,actor.y))for(let sy=5;sy<60;sy+=2)for(let sx=20;sx<60;sx+=2){
   if(source.data[(sy*80+sx)*4+3]<250)continue;
   const x=Math.round(actor.x+sx-40-(sy-68)*cast.dx/58),y=Math.round(actor.y-2-(sy-68)*cast.dy/58),lx=x-actor.x+40,ly=y-actor.y+68;
   if(lx>=0&&lx<80&&ly>=0&&ly<80&&source.data[(ly*80+lx)*4+3])continue;
   if(x<0||y<0||x>=map.width||y>=map.height||x-view.scrollX<0||y-view.scrollY<0||x-view.scrollX>=native.width||y-view.scrollY>=native.height)continue;
   const a=ctx.getImageData(Math.round(x-view.scrollX),Math.round(y-view.scrollY),1,1).data,b=f.getImageData(x,y,1,1).data;
   if(b[0]-a[0]+b[1]-a[1]+b[2]-a[2]>10)shadowPixels++;
  }
  return {compared,wrong,changed,shadowPixels};
 },{actor,pieces:visibleSceneArt(map.tiles!,snapshot.state)!,url:'/'+artPath(actor.texture),map:{id:map.id,width:map.tiles!.width*24,height:map.tiles!.height*24}});
}

for(const [device,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]as const){
 test(`Chapter Three actors keep native highlight planes and regional shadow strength on ${device}`,async({browser})=>{
  const context=await browser.newContext({viewport,deviceScaleFactor:1.25,reducedMotion:'reduce'}),page=await context.newPage();
  try{
   const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');
   for(const [map,x,y]of [['northglass',29,23],['relayhall',22,28],['conduit',23,26]]as const){
    const saved=palaceCheckpoint('conduitSeen');saved.location={map,x,y};await importSave(page,saved);
    await expect.poll(async()=>{const p=await shadedActor(page);return p.compared>300&&p.wrong===0&&(map!=='northglass'||p.changed>100&&p.shadowPixels>5);}).toBe(true);
    await capture(page,`three-lit-${map}-${device}`);
    await page.locator('#canvas').focus();await page.keyboard.press('ArrowRight',{delay:60});
    await expect.poll(async()=>{const s=await inspect(page);return !s.moving&&s.state.location.x===x+1;}).toBe(true);
    await expect.poll(async()=>{const p=await shadedActor(page);return p.compared>300&&p.wrong===0&&(map!=='northglass'||p.shadowPixels>5);}).toBe(true);
    expect((await inspect(page)).state.flags).toEqual(saved.flags);
   }
   await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
  }finally{await context.close();}
 });
}
