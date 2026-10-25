import {test,expect} from '@playwright/test';
import {checkpoint} from '../support/progress';
import {importSave} from './navigation';
import {inspect,capture} from './controls';

for(const [device,viewport,dpr] of [['desktop',{width:1280,height:900},1],['phone',{width:390,height:844},1.25]]as const){
 test.describe(`raster actors on ${device}`,()=>{
  test.use({viewport,deviceScaleFactor:dpr});
  test('previews actual native frames and keeps the vector skin available',async({page})=>{
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    await page.goto('/?dev=sprites');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop');
    const review=page.getByRole('region',{name:'Sprite review',exact:true});await expect(review).toBeVisible();
    const stored=await page.evaluate(()=>JSON.stringify(localStorage));
    await page.getByRole('button',{name:'Ground guides',exact:true}).click();
    const frameHost=page.locator('#sprite-workshop');
    const selectFrame=async(frame:number)=>{
      const pause=page.getByRole('button',{name:'Pause',exact:true});if(await pause.isVisible())await pause.click();
      for(let i=0;i<7&&await frameHost.getAttribute('data-frame')!==String(frame);i++)await page.getByRole('button',{name:'Next frame',exact:true}).click();
      await expect(frameHost).toHaveAttribute('data-frame',String(frame));
    };
    for(const hero of ['Nell','Orrin','Kit','Celia','Petra']){
      await page.getByRole('button',{name:`Inspect ${hero}`,exact:true}).click();
      for(const direction of ['Front','Left','Right','Back']){
        await page.getByRole('group',{name:'Facing',exact:true}).getByRole('button',{name:direction,exact:true}).click();
        await page.getByRole('button',{name:'Walk',exact:true}).click();
        await selectFrame(0);
        // The workshop must display exact native PNG pixels with integer
        // expansion, including crops from the smaller motion atlas.
        await expect.poll(()=>review.locator('.sprite-detail').evaluate(async canvas=>{
          const host=canvas.closest('#sprite-workshop')!,url=host.querySelector('.sprite-file')!.textContent!.match(/^.*?\.png/)![0];
          const frame=Number((host as HTMLElement).dataset.frame),image=new Image();image.src='/'+url;await image.decode();
          const ref=document.createElement('canvas');ref.width=ref.height=240;const ctx=ref.getContext('2d')!;ctx.imageSmoothingEnabled=false;
          for(let y=0;y<240;y+=8)for(let x=0;x<240;x+=8){ctx.fillStyle=(x/8+y/8)%2?'#234047':'#182b32';ctx.fillRect(x,y,8,8);}
          ctx.drawImage(image,frame%2*40,Math.floor(frame/2)*40,40,40,40,40,160,160);
          const actual=(canvas as HTMLCanvasElement).getContext('2d')!.getImageData(0,0,240,240).data,expected=ctx.getImageData(0,0,240,240).data;
          return actual.every((v,i)=>v===expected[i]);
        })).toBe(true);
        const samples=new Set<string>();
        for(let i=0;i<6;i++){
          await expect(page.locator('#sprite-workshop')).toHaveAttribute('data-frame',String(i));
          await expect(review.locator('.sprite-file')).toContainText('.png');
          samples.add(await review.locator('.sprite-detail').evaluate(c=>(c as HTMLCanvasElement).toDataURL()));
          await page.getByRole('button',{name:'Next frame',exact:true}).click();
        }
        expect(samples.size,`${hero} ${direction} walk`).toBe(6);
        await page.getByRole('button',{name:'Attack',exact:true}).click();
        await selectFrame(6);
        await expect(page.locator('#sprite-workshop')).toHaveAttribute('data-frame','6');
        await page.getByRole('button',{name:'Next frame',exact:true}).click();await expect(page.locator('#sprite-workshop')).toHaveAttribute('data-frame','7');
      }
    }
    await page.getByRole('button',{name:'Inspect Nell',exact:true}).click();
    await page.getByRole('button',{name:'Idle',exact:true}).click();
    const skins=page.getByRole('group',{name:'Actor skin preview',exact:true});
    for(const name of ['Vector','Raster']){
      await skins.getByRole('button',{name,exact:true}).click();
      await expect(review.locator('.sprite-file')).toContainText(name==='Raster'?'.png':'.svg');
    }
    await review.locator('.sprite-detail').scrollIntoViewIfNeeded();await capture(page,`raster-actors-${device}`);
    expect(await page.evaluate(()=>JSON.stringify(localStorage))).toBe(stored);
    await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
  });
  test('switches campaign actors atomically without changing progress',async({page})=>{
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto('/');await importSave(page,checkpoint('festivalSeen'));
    const before=(await inspect(page)).state,images=[];
    for(const skin of ['Vector actors','Raster actors']){
      await page.getByRole('button',{name:'Controls and combat help'}).click();
      await page.getByRole('button',{name:skin,exact:true}).click();
      await expect(page.getByRole('button',{name:skin,exact:true})).toHaveClass('selected');
      await expect(page.getByRole('button',{name:skin,exact:true})).toBeEnabled();
      await page.getByRole('button',{name:'Close',exact:true}).click();
      const {playSeconds:elapsed,...after}=(await inspect(page)).state,{playSeconds:previous,...progress}=before;
      expect(after).toEqual(progress);expect(elapsed).toBeGreaterThanOrEqual(previous);
      for(const person of (await inspect(page)).people)expect([person.sourceWidth,person.sourceHeight]).toEqual([80,80]);
      images.push(await page.locator('.phaser-host canvas').evaluate(c=>(c as HTMLCanvasElement).toDataURL()));
    }
    expect(images[0]).not.toBe(images[1]);
    await capture(page,`raster-station-actors-${device}`);
    await page.reload();expect(await page.evaluate(()=>localStorage.getItem('borrowed-tomorrow-actor-art'))).toBe('raster');
    expect(errors).toEqual([]);
  });
 });
}
