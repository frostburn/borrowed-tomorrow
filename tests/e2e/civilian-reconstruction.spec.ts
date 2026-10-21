import {test,expect} from '@playwright/test';
import {capture} from './controls';

for(const [device,viewport,dpr] of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]] as const){
 test.describe(`reconstructed civilians on ${device}`,()=>{
  test.use({viewport,deviceScaleFactor:dpr});
  test('reviews real recovered dimensions without fitting or altering saves',async({page})=>{
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto('/?dev=sprites');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop');
    const stored=await page.evaluate(()=>JSON.stringify(localStorage));
    await page.getByRole('button',{name:'NPCs (21)',exact:true}).click();
    for(const [role,name,width,height] of [['dockhand','Dock worker',128,128],['traveler','Traveler',137,133],['family','Parent and child',136,127],['patient','Ward patient',128,128]] as const){
      await page.getByRole('button',{name:`Inspect ${name}`,exact:true}).click();
      const review=page.getByRole('region',{name:'Pixel Art Fixer review',exact:true});
      await expect(review).toContainText('Held for review');
      const canvas=review.getByRole('img',{name:`Recovered grid ${role} at 1x`,exact:true});
      await expect(canvas).toHaveAttribute('width',String(width));await expect(canvas).toHaveAttribute('height',String(height));
      await review.getByRole('group',{name:'Reconstruction zoom'}).getByRole('button',{name:'2x',exact:true}).click();
      const zoomed=review.getByRole('img',{name:`Recovered grid ${role} at 2x`,exact:true});await zoomed.scrollIntoViewIfNeeded();
      await expect.poll(()=>zoomed.evaluate(async(element,role)=>{
        const actual=element as HTMLCanvasElement,expected=document.createElement('canvas');expected.width=actual.width;expected.height=actual.height;
        const ctx=expected.getContext('2d')!,image=new Image();image.src=`/src/dev/art/civilian-review/${role}-fixed.png`;await image.decode();
        ctx.imageSmoothingEnabled=false;
        for(let y=0;y<expected.height;y+=8)for(let x=0;x<expected.width;x+=8){ctx.fillStyle=(x/8+y/8)%2?'#234047':'#182b32';ctx.fillRect(x,y,8,8);}
        ctx.drawImage(image,0,0,image.width*2,image.height*2);
        const a=actual.getContext('2d')!.getImageData(0,0,actual.width,actual.height).data,b=ctx.getImageData(0,0,expected.width,expected.height).data;
        return a.reduce((n,c,i)=>n+Number(c!==b[i]),0);
      },role)).toBe(0);
      expect(await zoomed.evaluate(c=>Math.round(c.getBoundingClientRect().width/window.borrowedTomorrowPixels.inspect().cssScale))).toBe(width*2);
      if(role==='family')await capture(page,`civilian-reconstruction-${device}`);
    }
    expect(await page.evaluate(()=>JSON.stringify(localStorage))).toBe(stored);
    await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
  });
 });
}
