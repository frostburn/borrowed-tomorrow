import {expect,test} from '@playwright/test';
import {capture} from './controls';
import generation from '../../assets/raster-maps/generation.json' with {type:'json'};

for(const map of ['station','stillcity'])for(const zoom of [1,2]){
 test(`native raster ${map} reconstructs at workshop zoom ${zoom}`,async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  const hide=map==='station'?'6,22':'4';
  await page.goto(`/?dev=maps&map=${map}&mapZoom=${zoom}&mapOverlays=&mapHide=${hide}`);
  await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop');
  const host=page.locator('#map-workshop');await expect(host).toHaveAttribute('data-ready','true');
  await expect(host.locator('.map-meta')).toContainText('Indexed raster scene');
  // Verify the actual workshop output against the curated painting. This
  // catches half-size rendering, smoothing, palette remapping and cutout seams.
  const sources=Object.keys(generation.nativeSourcesSha256).filter(p=>p.startsWith(`${map}/painting-`));
  await expect.poll(()=>page.evaluate(async({sources,zoom})=>{
   const canvas=document.querySelector<HTMLCanvasElement>('#map-preview')!,actual=canvas.getContext('2d')!.getImageData(0,0,canvas.width,canvas.height).data;
   const expected=document.createElement('canvas');expected.width=canvas.width;expected.height=canvas.height;
   const ctx=expected.getContext('2d')!;ctx.imageSmoothingEnabled=false;
   for(const source of sources){
    const image=new Image();image.src=`/assets/raster-maps/${source}`;await image.decode();
    const [,x,y]=source.match(/painting-(\d+)-(\d+)\.png$/)!;
    ctx.drawImage(image,Number(x)*2*zoom,Number(y)*2*zoom,image.naturalWidth*2*zoom,image.naturalHeight*2*zoom);
   }
   const reference=ctx.getImageData(0,0,canvas.width,canvas.height).data;
   const x=Number(document.querySelector<HTMLInputElement>('#map-x')!.value)*24*zoom,y=Number(document.querySelector<HTMLInputElement>('#map-y')!.value)*24*zoom;
   let different=0;for(let py=0;py<canvas.height;py++)for(let px=0;px<canvas.width;px++){
    if(px>=x&&px<(x+24*zoom)&&py>=y&&py<(y+24*zoom))continue; // Selected-cell outline.
    const i=(py*canvas.width+px)*4;for(let c=0;c<4;c++)if(actual[i+c]!==reference[i+c])different++;
   }return different;
  },{sources,zoom})).toBe(0);
  if(zoom===1){
   const flag=map==='station'?'raidSeen':'capitalStreetFreed';
   await host.getByRole('button',{name:'Reset layers',exact:true}).click();await expect(host).toHaveAttribute('data-ready','true');
   const before=await host.locator('#map-preview').evaluate((c:HTMLCanvasElement)=>c.toDataURL());
   await host.locator('summary').filter({hasText:'Story flags'}).click();
   await host.getByRole('button',{name:flag,exact:true}).click();
   await expect(host.getByRole('button',{name:flag,exact:true})).toHaveAttribute('aria-pressed','true');
   await expect.poll(()=>host.locator('#map-preview').evaluate((c:HTMLCanvasElement)=>c.toDataURL())).not.toBe(before);
   await host.getByRole('button',{name:'Actors',exact:true}).click();
   await host.locator('summary').filter({hasText:'Scene cast'}).click();
   await host.getByRole('button',{name:map==='station'?'one-festival':'six-capital-release',exact:true}).click();
   await expect(host).toHaveAttribute('data-ready','true');
   await capture(page,`raster-${map}-workshop`);
  }
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 });
}
