import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {importSave} from './navigation';
import {capture,inspect} from './controls';
import {palaceCheckpoint} from '../support/progress';

test('Chapter One Maps casts use the campaign highlight planes at native size',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/?dev=maps&map=yard&mapScene=Scene:one-orrin');
 await expect(page.locator('#map-workshop')).toHaveAttribute('data-ready','true');
 await expect.poll(()=>page.evaluate(async()=>{
  const module='/src/game/world-light.ts',{chapterOneLight,lightPixels}=await import(/* @vite-ignore */module);
  const maps='/src/content/maps.ts',art='/src/content/scene-art.ts';
  const {MAPS}=await import(/* @vite-ignore */maps),{visibleSceneArt}=await import(/* @vite-ignore */art);
  const image=new Image();image.src='/art/vector/nell.svg';await image.decode();
  const native=document.createElement('canvas');native.width=native.height=80;const ctx=native.getContext('2d')!;ctx.drawImage(image,0,0);
  const source=ctx.getImageData(0,0,80,80),expected=ctx.createImageData(80,80);
  lightPixels(source,expected,chapterOneLight('yard',visibleSceneArt(MAPS.yard.tiles,{flags:{}})),660,379,40,68);
  const actual=document.querySelector<HTMLCanvasElement>('#map-preview')!.getContext('2d')!.getImageData(620,311,80,80).data;
  let compared=0,wrong=0;
  for(let i=0;i<actual.length;i+=4)if(source.data[i+3]>=254){compared++;if([0,1,2].some(c=>Math.abs(actual[i+c]-expected.data[i+c])>1))wrong++;}
  return compared>200&&!wrong;
 })).toBe(true);
 await capture(page,'maps-lit-yard');
 await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
});

for(const [device,viewport,dpr] of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]] as const){
 test.describe(`maps on ${device}`,()=>{
  test.use({viewport,deviceScaleFactor:dpr,permissions:['clipboard-read','clipboard-write']});
  test('identifies art, restores a review link and exports a native crop without changing saves',async({page})=>{
   const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('/');await importSave(page,palaceCheckpoint('tomasRescued'));
   const before=(await inspect(page)).state;
   await page.goto('/?dev=maps&map=northglass&cell=47,9');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop');
   const host=page.locator('#map-workshop'),review=page.getByRole('region',{name:'Map review',exact:true});
   await expect(host).toHaveAttribute('data-ready','true');await expect(review).toBeVisible();
   const stored=await page.evaluate(()=>JSON.stringify(localStorage));
   await review.getByRole('button',{name:'Only Grand palace portico',exact:true}).click();
   await expect(review.getByRole('button',{name:'Show Medical platform',exact:true})).toHaveAttribute('aria-pressed','false');
   expect(await review.locator('#map-preview').evaluate(el=>Array.from((el as HTMLCanvasElement).getContext('2d')!.getImageData(0,0,1,1).data))).toEqual([8,15,25,255]);
   await review.getByRole('button',{name:'Reset layers',exact:true}).click();
   await review.locator('summary').filter({hasText:'Story flags'}).click();await review.getByRole('button',{name:'tomasRescued',exact:true}).click();
   await review.locator('summary').filter({hasText:'Scene cast'}).click();await review.getByRole('button',{name:'three-refusal',exact:true}).click();
   for(const name of ['Actors','Grid','Collision'])await review.getByRole('button',{name,exact:true}).click();
   await review.getByRole('button',{name:'2x',exact:true}).click();
   await review.getByRole('spinbutton',{name:'Map X',exact:true}).fill('47');await review.getByRole('spinbutton',{name:'Map Y',exact:true}).fill('13');
   await review.getByRole('button',{name:'Go to cell',exact:true}).click();
   const canvas=review.locator('#map-preview');await review.locator('.map-viewport').scrollIntoViewIfNeeded();
   const box=(await canvas.boundingBox())!;await page.mouse.click(box.x+(48.5)*24*box.width/1536,box.y+(12.5)*24*box.height/1008);
   await expect(review.getByRole('region',{name:'Selected map cell',exact:true})).toContainText('Cell (48, 12)');
   await review.getByRole('button',{name:'Copy reference',exact:true}).click();
   const reference=await page.evaluate(()=>navigator.clipboard.readText());expect(reference).toContain('Map: northglass');expect(reference).toContain('Cell: (48, 12)');expect(reference).toContain('Grand palace portico');expect(reference).toContain('tomasRescued');
   const url=page.url();await page.reload();await expect(host).toHaveAttribute('data-ready','true');
   expect(page.url()).toBe(url);await expect(review.getByRole('button',{name:'2x',exact:true})).toHaveAttribute('aria-pressed','true');
   await expect(review.getByRole('button',{name:'Collision',exact:true})).toHaveAttribute('aria-pressed','true');
   await expect(review.getByRole('region',{name:'Selected map cell',exact:true})).toContainText('Cell (48, 12)');
   await review.locator('.map-viewport').scrollIntoViewIfNeeded();
   // The map canvas also passes through the shared physical-pixel framebuffer.
   await expect.poll(()=>page.evaluate(()=>{
    const source=document.querySelector<HTMLCanvasElement>('#map-preview')!,output=document.querySelector<HTMLCanvasElement>('.pixel-output')!,origin=document.querySelector('.pixel-source')!.getBoundingClientRect(),r=source.getBoundingClientRect(),info=window.borrowedTomorrowPixels.inspect();
    const x=(48*24+8)*2,y=(12*24+8)*2,size=16,expected=source.getContext('2d')!.getImageData(0,0,source.width,source.height).data,actual=output.getContext('2d')!.getImageData(0,0,output.width,output.height).data;
    const left=info.physicalLeft+(Math.round((r.left-origin.left)/info.cssScale)+x)*info.physicalScale,top=info.physicalTop+(Math.round((r.top-origin.top)/info.cssScale)+y)*info.physicalScale;
    const gx=Math.round((r.left-origin.left)/info.cssScale)+x,gy=Math.round((r.top-origin.top)/info.cssScale)+y,u=info.rasterUnit;
    let different=0;for(let yy=0;yy<size;yy++)for(let xx=0;xx<size;xx++)for(let c=0;c<4;c++){const sx=x+Math.floor((gx+xx)/u)*u-gx,sy=y+Math.floor((gy+yy)/u)*u-gy;if(actual[((top+yy*info.physicalScale)*output.width+left+xx*info.physicalScale)*4+c]!==expected[(sy*source.width+sx)*4+c])different++;}return different;
   })).toBe(0);
   await capture(page,`maps-review-${device}`);
   const download=page.waitForEvent('download');await review.getByRole('button',{name:'Download view PNG',exact:true}).click();
   const file=await download;expect(file.suggestedFilename()).toBe('northglass-48-12.png');const png=await readFile((await file.path())!);
   expect([png.readUInt32BE(16),png.readUInt32BE(20)]).toEqual(await review.locator('.map-viewport').evaluate(el=>[el.clientWidth,el.clientHeight]));
   const scroller=review.locator('.map-viewport');await scroller.scrollIntoViewIfNeeded();const pan=(await scroller.boundingBox())!,left=await scroller.evaluate(el=>el.scrollLeft);
   await page.mouse.move(pan.x+pan.width/2,pan.y+pan.height/2);await page.mouse.down();await page.mouse.move(pan.x+pan.width/2-40,pan.y+pan.height/2,{steps:8});await page.mouse.up();
   await expect.poll(()=>scroller.evaluate(el=>el.scrollLeft)).toBeGreaterThan(left);await expect.poll(()=>new URL(page.url()).searchParams.get('mapView')).not.toBe(new URL(url).searchParams.get('mapView'));
   await expect(review.getByRole('region',{name:'Selected map cell',exact:true})).toContainText('Cell (48, 12)');
   await review.getByRole('button',{name:'Battle',exact:true}).click();await review.getByRole('button',{name:'battle-heart-feeds',exact:true}).click();await expect(host).toHaveAttribute('data-ready','true');
   await expect(review.locator('.map-meta')).toContainText('battle-heart-feeds');
   await page.getByRole('navigation',{name:'Workshop panels'}).getByRole('button',{name:'Sprites',exact:true}).click();await expect(page.getByRole('region',{name:'Sprite review',exact:true})).toBeVisible();
   await page.getByRole('navigation',{name:'Workshop panels'}).getByRole('button',{name:'Maps',exact:true}).click();await expect(review.locator('.map-meta')).toContainText('battle-heart-feeds');
   expect(await page.evaluate(()=>JSON.stringify(localStorage))).toBe(stored);expect(await page.locator('.inventory-panel').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
   await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
   await page.goto('/');await page.getByRole('button',{name:'Continue',exact:true}).click();
   // Later-chapter scenery is fetched after choosing Continue, rather than at
   // the chapter-one title. Wait for restoration before comparing the save.
   await expect.poll(async()=>(await inspect(page)).state.chapter).toBe(before.chapter);
   const after=(await inspect(page)).state;expect(after).toMatchObject({chapter:before.chapter,location:before.location,flags:before.flags,inventory:before.inventory,party:before.party,activeParty:before.activeParty,coins:before.coins,xp:before.xp});
  });
 });
}

test('Chapter Four vector maps report missing artwork and retry without losing the reference',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/art/vector/chapter-four/refuge-coast.svg',route=>route.abort());await page.goto('/?dev=maps&map=refuge&cell=32,27');
 const host=page.locator('#map-workshop');await expect(host.locator('#map-load')).toContainText('artwork is unavailable');
 const url=page.url();await page.unroute('**/art/vector/chapter-four/refuge-coast.svg');await host.getByRole('button',{name:'Retry missing art',exact:true}).click();await expect(host).toHaveAttribute('data-ready','true');expect(page.url()).toBe(url);
 await expect(host.locator('.map-meta')).toContainText('SVG scene');expect(errors).toEqual([]);
});
