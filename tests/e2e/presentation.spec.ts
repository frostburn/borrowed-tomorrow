import { expect, test } from '@playwright/test';
import { capture, dialogue, inspect, nativeScene } from './controls';
import { approach } from './navigation';

const modes=['refuge','breakwater','sanctuary','four-battle','four-warden','conduit','coast','coast-battle','petra-battle','station','yard','tunnel','battle','inspector','ending','rillbridge','sluice','flood','cinderbank','infirmary','shunting','northglass','relayhall','switching'] as const;
const effects=['click','move','strike','burst','flare','steam','mend','bandage','peck','defend','win','punch','return-call','paper','resonance'] as const;

test('art and text share chunky square pixels at fractional DPR',async({browser})=>{
  const context=await browser.newContext({viewport:{width:1170,height:780},deviceScaleFactor:2.5});
  const page=await context.newPage();await page.goto('/');await expect(page.getByRole('button',{name:'Begin Chapter One'})).toBeVisible({timeout:15000});
  await expect.poll(()=>page.evaluate(()=>{
    const canvas=document.querySelector<HTMLCanvasElement>('.pixel-output')!,ctx=canvas.getContext('2d')!;
    return ctx.getImageData(0,0,canvas.width,canvas.height).data.some((v,i)=>i%4!==3&&v>100);
  })).toBe(true);
  const result=await page.evaluate(()=>{
    const canvas=document.querySelector<HTMLCanvasElement>('.pixel-output')!,r=canvas.getBoundingClientRect(),dpr=devicePixelRatio;
    const p=canvas.getContext('2d')!.getImageData(0,0,canvas.width,canvas.height).data;
    const info=window.borrowedTomorrowPixels.inspect(),k=info.physicalScale*info.rasterUnit;let uneven=0;
    for(let y=0;y<Math.floor(info.height/info.rasterUnit);y++)for(let x=0;x<Math.floor(info.width/info.rasterUnit);x++){
      const start=((info.physicalTop+y*k)*canvas.width+info.physicalLeft+x*k)*4;
      for(let dy=0;dy<k;dy++)for(let dx=0;dx<k;dx++){
        const at=start+(dy*canvas.width+dx)*4;
        if(p[at]!==p[start]||p[at+1]!==p[start+1]||p[at+2]!==p[start+2])uneven++;
      }
    }
    // The backing raster is already enlarged into equal physical blocks.
    return {width:info.width,height:info.height,uneven,physicalScale:info.physicalScale,rasterUnit:info.rasterUnit,xScale:r.width*dpr/canvas.width,yScale:r.height*dpr/canvas.height,left:r.left*dpr,top:r.top*dpr};
  });
  expect(result.width).toBe(1024);expect(result.height).toBe(768);expect(result.uneven).toBe(0);expect(result.physicalScale).toBe(2);expect(result.rasterUnit).toBe(2);expect(result.xScale).toBeCloseTo(1,4);expect(result.yScale).toBeCloseTo(1,4);
  // CSS layout stores 1/64px units; the device raster rounds this subpixel error.
  expect(result.left).toBeCloseTo(Math.round(result.left),1);expect(result.top).toBeCloseTo(Math.round(result.top),1);
  // Compare the browser's displayed pixels, not just the canvas backing store.
  await page.evaluate(()=>document.fonts.ready);
  const screenshot=await page.screenshot({scale:'device'});
  const rendered=await page.evaluate(async(encoded)=>{
    const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));
    const bitmap=await createImageBitmap(new Blob([bytes],{type:'image/png'}));
    const capture=document.createElement('canvas');capture.width=bitmap.width;capture.height=bitmap.height;
    const ctx=capture.getContext('2d',{willReadFrequently:true})!;ctx.drawImage(bitmap,0,0);bitmap.close();
    const actual=ctx.getImageData(0,0,capture.width,capture.height).data;
    const visible=document.querySelector<HTMLCanvasElement>('.pixel-output')!;
    const expected=visible.getContext('2d')!.getImageData(0,0,visible.width,visible.height).data;
    // The viewport can end in a partial device pixel at fractional DPR. Compare
    // the complete console, including its border, rather than the letterbox edge.
    const info=window.borrowedTomorrowPixels.inspect();let mismatches=0;
    for(let y=info.physicalTop;y<info.physicalTop+info.height*info.physicalScale;y++){
      for(let x=info.physicalLeft;x<info.physicalLeft+info.width*info.physicalScale;x++){
        const i=(y*visible.width+x)*4;
        for(let channel=0;channel<4;channel++)if(actual[i+channel]!==expected[i+channel])mismatches++;
      }
    }
    return {mismatches,width:capture.width,height:capture.height,expectedWidth:visible.width,expectedHeight:visible.height};
  },screenshot.toString('base64'));
  expect(rendered.width).toBe(rendered.expectedWidth);expect(rendered.height).toBe(rendered.expectedHeight);expect(rendered.mismatches).toBe(0);
  await page.getByRole('button',{name:'Save',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button',{name:'Close',exact:true}).click();
  await context.close();
});

test('portraits, HUD sprites and scenery share the display raster without palette reduction',async({page})=>{
  await page.goto('/');await page.getByRole('button',{name:'Begin Chapter One'}).click();
  while(await page.locator('.dialogue h2').textContent()!=='Nell')await page.locator('.dialogue-actions button').click();
  await expect(page.locator('.dialogue h2')).toHaveText('Nell');
  await expect.poll(()=>page.evaluate(()=>{
    const image=document.querySelector<HTMLImageElement>('.dialogue-portrait img');
    if(!image?.complete||!image.naturalWidth)return -1;
    const info=window.borrowedTomorrowPixels.inspect(),source=document.querySelector('.pixel-source')!.getBoundingClientRect(),box=image.getBoundingClientRect();
    const reference=document.createElement('canvas');reference.width=image.naturalWidth;reference.height=image.naturalHeight;
    const ctx=reference.getContext('2d',{willReadFrequently:true})!;ctx.fillStyle=getComputedStyle(image.parentElement!).backgroundColor;ctx.fillRect(0,0,reference.width,reference.height);ctx.drawImage(image,0,0);
    const expected=ctx.getImageData(0,0,reference.width,reference.height).data;
    const output=document.querySelector<HTMLCanvasElement>('.pixel-output')!;
    const actual=output.getContext('2d')!.getImageData(0,0,output.width,output.height).data;
    const left=info.physicalLeft+Math.round((box.left-source.left)/info.cssScale)*info.physicalScale;
    const top=info.physicalTop+Math.round((box.top-source.top)/info.cssScale)*info.physicalScale;
    let missing=0;
    if(reference.width!==128||reference.height!==128||Math.round(box.width/info.cssScale)!==128||Math.round(box.height/info.cssScale)!==128)return -2;
    for(let y=0;y<128;y++)for(let x=0;x<128;x++)for(let c=0;c<4;c++){
      const at=((top+y*info.physicalScale)*output.width+left+x*info.physicalScale)*4+c;
      const gx=Math.round((box.left-source.left)/info.cssScale),gy=Math.round((box.top-source.top)/info.cssScale),u=info.rasterUnit,sx=Math.floor((gx+x)/u)*u-gx,sy=Math.floor((gy+y)/u)*u-gy;
      if(sx>=0&&sy>=0&&sx<128&&sy<128&&actual[at]!==expected[(sy*128+sx)*4+c])missing++;
    }
    return missing;
  }),{timeout:15000}).toBe(0);
  if(process.env.BT_QA_SCREENSHOTS)await page.screenshot({path:`${process.env.BT_QA_SCREENSHOTS}/native-portrait.png`});
  while(await page.locator('.dialogue').isVisible())await page.locator('.dialogue-actions button').click();
  const actor=await page.locator('.world-hero img').evaluate(image=>{
    const img=image as HTMLImageElement,scale=window.borrowedTomorrowPixels.inspect().cssScale,b=img.getBoundingClientRect();
    return {width:b.width/scale,height:b.height/scale,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight};
  });
  expect(actor).toEqual({width:80,height:80,naturalWidth:80,naturalHeight:80});
  await nativeScene(page,'station');
  if(process.env.BT_QA_SCREENSHOTS)await page.screenshot({path:`${process.env.BT_QA_SCREENSHOTS}/native-station.png`});
  await approach(page,'tomas');await expect(page.locator('.dialogue')).toBeVisible();
  while(await page.locator('.dialogue h2').textContent()!=='The broken crystal')await page.locator('.dialogue-actions button').click();
  await capture(page,'lantern-resonance');await dialogue(page);await approach(page,'pursuit');
  await expect.poll(async()=>(await inspect(page)).mode).toBe('battle');
  await nativeScene(page,'station',144);await capture(page,'escape-desktop');
});

test('the actual Web Audio instruments render distinct scores and action sounds without clipping',async({page})=>{
  test.setTimeout(process.env.BT_FULL_QA==='1'?360000:180000);
  await page.goto('/');
  const output=await page.evaluate(async({modes,effects,full})=>{
    // @ts-expect-error Vite serves this browser-only module import.
    const {Synth}:typeof import('../../src/game/synth')=await import('/src/game/synth.ts');
    // @ts-expect-error Vite serves this browser-only module import.
    const {scoreBar,scoreLength,ARRANGEMENTS}:typeof import('../../src/game/score')=await import('/src/game/score.ts');
    const summarize=(buffer:AudioBuffer,start=0,end=buffer.duration)=>{
      const data=buffer.getChannelData(0);let sum=0,peak=0,hash=0;const a=Math.round(start*buffer.sampleRate),z=Math.min(data.length,Math.round(end*buffer.sampleRate));
      for(let i=a;i<z;i++){const n=data[i];sum+=n*n;peak=Math.max(peak,Math.abs(n));if(i%211===0)hash=(Math.imul(hash,31)+Math.round(n*10000))|0;}
      return {rms:Math.sqrt(sum/(z-a)),peak,hash};
    };
    const scores=[];
    for(const mode of modes){
      const bars=full?scoreLength(mode):4;
      const {beats,bpm}=ARRANGEMENTS[mode],beat=60/bpm,parts=[];
      // Bound each offline graph. Two preceding bars retain held voices at the
      // section boundary; the first section also checks the loop's return.
      for(let start=0;start<bars;start+=8){
        const count=Math.min(8,bars-start),leadIn=full?2:0;
        const c=new OfflineAudioContext(2,Math.ceil(((count+leadIn)*beats*beat+2)*22050),22050);
        const gain=c.createGain();gain.gain.value=.52;gain.connect(c.destination);const synth=new Synth(c,gain);
        for(let bar=start-leadIn;bar<start+count;bar++)for(const n of scoreBar(mode,bar))synth.note(n.instrument,n.pitch,.03+(bar-start+leadIn)*beats*beat+n.beat*beat,n.duration*beat,n.velocity,n.pan);
        parts.push(summarize(await c.startRendering(),.03+leadIn*beats*beat,.03+(leadIn+count)*beats*beat));
      }
      scores.push({mode,rms:Math.sqrt(parts.reduce((sum,p)=>sum+p.rms*p.rms,0)/parts.length),peak:Math.max(...parts.map(p=>p.peak)),hash:parts.reduce((hash,p)=>(Math.imul(hash,31)+p.hash)|0,0)});
    }
    const c=new OfflineAudioContext(2,(effects.length*3+1)*22050,22050),gain=c.createGain();gain.gain.value=.58;gain.connect(c.destination);
    const synth=new Synth(c,gain);effects.forEach((effect,i)=>synth.effect(effect,i*3+.03,'yard',i));
    const buffer=await c.startRendering();
    return {scores,effects:effects.map((effect,i)=>({effect,...summarize(buffer,i*3,i*3+2.8)}))};
  },{modes,effects,full:process.env.BT_FULL_QA==='1'});
  for(const sample of [...output.scores,...output.effects]){
    expect(sample.rms).toBeGreaterThan(.0005);expect(sample.peak).toBeLessThan(.95);
    expect(Number.isFinite(sample.rms)).toBe(true);
  }
  expect(new Set(output.scores.map(s=>s.hash)).size).toBe(modes.length);
  expect(new Set(output.effects.map(s=>s.hash)).size).toBe(effects.length);
  // Steam lasts longer than an impact or menu tick; these aren't renamed beeps.
  const steam=output.effects.find(s=>s.effect==='steam')!,click=output.effects.find(s=>s.effect==='click')!;
  expect(steam.rms).toBeGreaterThan(click.rms*3);
});
