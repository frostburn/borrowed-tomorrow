import { expect, test, type Page } from '@playwright/test';
import { MAPS } from '../../src/content/maps';
import { artPath } from '../../src/content/art-assets';
import { visibleSceneArt } from '../../src/content/scene-art';
import { checkpoint } from '../support/progress';
import { capture, inspect } from './controls';
import { approach, importSave } from './navigation';

test.use({deviceScaleFactor:1.25});

async function renderedLight(page:Page){
  const snapshot=await inspect(page),actor=snapshot.actors.find(a=>a.hero==='nell')!;
  return page.evaluate(async({actor,pieces,url})=>{
    const module='/src/game/world-light.ts';const {lightPixels,stationLight,castShadows,shadowProjection}=await import(/* @vite-ignore */module);
    const decode=async(url:string)=>{const image=new Image();image.src=url;await image.decode();return image;};
    const native=document.querySelector<HTMLCanvasElement>('.phaser-host canvas')!,ctx=native.getContext('2d')!,view=window.borrowedTomorrow.inspect().view;
    const image=await decode(url),sprite=document.createElement('canvas');sprite.width=sprite.height=80;
    const s=sprite.getContext('2d')!;s.drawImage(image,0,0);const source=s.getImageData(0,0,80,80),lit=s.createImageData(80,80),rig=stationLight(pieces!);
    lightPixels(source,lit,rig,actor.x,actor.y,40,68);
    const left=Math.round(actor.x-40-view.scrollX),top=Math.round(actor.y-68-view.scrollY),actual=ctx.getImageData(left,top,80,80).data;
    let compared=0,wrong=0,red=0,blue=0;
    for(let i=0;i<actual.length;i+=4){if(source.data[i+3]<254)continue;compared++;red+=actual[i];blue+=actual[i+2];if([0,1,2].some(c=>Math.abs(actual[i+c]-lit.data[i+c])>3))wrong++;}
    const floor=document.createElement('canvas');floor.width=1008;floor.height=624;const f=floor.getContext('2d')!;
    for(const p of [...pieces!].sort((a,b)=>a.depth-b.depth))f.drawImage(await decode(`/${p.url}`),p.x,p.y);
    const cast=castShadows(rig,actor.x,actor.y)[0];let shadowPixels=0;
    if(cast){
      for(let sy=5;sy<60;sy++)for(let sx=20;sx<60;sx++){
        if(source.data[(sy*80+sx)*4+3]<250)continue;
        const [xx,xy,yx,yy]=shadowProjection(cast.dx,cast.dy),x=Math.round(actor.x+(sx-40)*xx+(sy-68)*yx),y=Math.round(actor.y-2+(sx-40)*xy+(sy-68)*yy);
        const localX=x-actor.x+40,localY=y-actor.y+68;
        if(localX>=0&&localX<80&&localY>=0&&localY<80&&source.data[(localY*80+localX)*4+3])continue;
        if(x<0||y<0||y>=624||x-view.scrollX<0||y-view.scrollY<0||x-view.scrollX>=native.width||y-view.scrollY>=native.height)continue;
        const a=ctx.getImageData(Math.round(x-view.scrollX),Math.round(y-view.scrollY),1,1).data,b=f.getImageData(x,y,1,1).data;
        if(b[0]-a[0]+b[1]-a[1]+b[2]-a[2]>10)shadowPixels++;
      }
    }
    return {compared,wrong,red:red/compared,blue:blue/compared,shadowPixels,shadowDx:cast?.dx,windowShadow:!!cast?.light.beam};
  },{actor,pieces:visibleSceneArt(MAPS.station.tiles!,snapshot.state),url:`/${artPath(actor.texture)}`});
}

test('station window beams illuminate Nell and cast her shadow into the square',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');const state=checkpoint('festivalSeen');state.location={map:'station',x:8,y:11};await importSave(page,state);
  await expect.poll(async()=>{const p=await renderedLight(page);return p.windowShadow&&p.compared>200&&p.wrong===0&&p.shadowPixels>5;}).toBe(true);
  await capture(page,'station-window-shadow');expect(errors).toEqual([]);
});

for(const [device,viewport] of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]] as const){
  test(`Larkspur actor lighting, moving shadows and unobscured supply keeper on ${device}`,async({page})=>{
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    await page.setViewportSize(viewport);await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');
    const state=checkpoint('festivalSeen');state.location={map:'station',x:15,y:13};await importSave(page,state);
    // Cross the northern lamp on real plaza floor, including its shadow extent.
    await expect.poll(async()=>{const p=await renderedLight(page);return p.compared>200&&p.wrong===0;}).toBe(true);
    await capture(page,`station-light-left-${device}`);
    const first=await renderedLight(page);expect(first.shadowDx).toBeLessThan(0);expect(first.shadowPixels).toBeGreaterThan(5);
    await page.locator('#canvas').focus();
    for(const x of [16,17,18]){await page.keyboard.press('ArrowRight',{delay:60});await expect.poll(async()=>{const s=await inspect(page);return !s.moving&&s.state.location.x===x;}).toBe(true);}
    await expect.poll(async()=>(await inspect(page)).actors.find(a=>a.hero==='nell')?.motion).toBe('idle');
    await expect.poll(async()=>{const p=await renderedLight(page);return p.compared>200&&p.wrong===0;}).toBe(true);
    const second=await renderedLight(page);expect(second.shadowDx).toBeGreaterThan(0);expect(second.shadowPixels).toBeGreaterThan(5);
    await capture(page,`station-light-right-${device}`);
    // Reduced motion must settle without pointer activity or accumulated shading.
    await page.emulateMedia({reducedMotion:'reduce'});await expect.poll(async()=>(await inspect(page)).ambient?.frame).toBe(-1);
    const stable=await page.locator('.phaser-host canvas').evaluate((c:HTMLCanvasElement)=>c.toDataURL());
    await page.waitForTimeout(180);expect(await page.locator('.phaser-host canvas').evaluate((c:HTMLCanvasElement)=>c.toDataURL())).toBe(stable);
    await approach(page,'iona');await expect(page.getByRole('dialog')).toContainText('Iona’s supplies');await capture(page,`station-supplies-${device}`);
    await page.getByRole('button',{name:'Rest · free',exact:true}).click();await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
  });
}
