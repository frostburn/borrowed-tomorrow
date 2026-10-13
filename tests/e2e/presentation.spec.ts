import { expect, test } from '@playwright/test';

const modes=['station','yard','tunnel','battle','inspector','ending'] as const;
const effects=['click','move','strike','burst','flare','steam','mend','bandage','peck','defend','win'] as const;

test('the whole screen uses one palette and integer physical pixels at fractional DPR',async({browser})=>{
  const context=await browser.newContext({viewport:{width:1170,height:780},deviceScaleFactor:1.25});
  const page=await context.newPage();await page.goto('/');await expect(page.getByRole('button',{name:'Begin Disk A'})).toBeVisible({timeout:15000});
  await expect.poll(()=>page.evaluate(()=>{
    const canvas=document.querySelector<HTMLCanvasElement>('.pixel-output')!,ctx=canvas.getContext('2d')!;
    return ctx.getImageData(0,0,canvas.width,canvas.height).data.some((v,i)=>i%4!==3&&v>100);
  })).toBe(true);
  const result=await page.evaluate(()=>{
    const canvas=document.querySelector<HTMLCanvasElement>('.pixel-output')!,r=canvas.getBoundingClientRect(),dpr=devicePixelRatio;
    const p=canvas.getContext('2d')!.getImageData(0,0,canvas.width,canvas.height).data;
    const palette=new Set(window.borrowedTomorrowPixels.inspect().palette.map(c=>parseInt(c.slice(1),16)));
    let outside=0;for(let i=0;i<p.length;i+=4)if(!palette.has((p[i]<<16)|(p[i+1]<<8)|p[i+2])||p[i+3]!==255)outside++;
    const info=window.borrowedTomorrowPixels.inspect(),k=info.physicalScale;let uneven=0;
    for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
      const start=((info.physicalTop+y*k)*canvas.width+info.physicalLeft+x*k)*4;
      for(let dy=0;dy<k;dy++)for(let dx=0;dx<k;dx++){
        const at=start+(dy*canvas.width+dx)*4;
        if(p[at]!==p[start]||p[at+1]!==p[start+1]||p[at+2]!==p[start+2])uneven++;
      }
    }
    // The backing raster is already enlarged into equal physical blocks.
    return {outside,uneven,physicalScale:k,xScale:r.width*dpr/canvas.width,yScale:r.height*dpr/canvas.height,left:r.left*dpr,top:r.top*dpr};
  });
  expect(result.outside).toBe(0);expect(result.uneven).toBe(0);expect(result.physicalScale).toBe(2);expect(result.xScale).toBeCloseTo(1,4);expect(result.yScale).toBeCloseTo(1,4);
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

test('the actual Web Audio instruments render distinct scores and action sounds without clipping',async({page})=>{
  await page.goto('/');
  const output=await page.evaluate(async({modes,effects})=>{
    // @ts-expect-error Vite serves this browser-only module import.
    const {Synth}:typeof import('../../src/game/synth')=await import('/src/game/synth.ts');
    // @ts-expect-error Vite serves this browser-only module import.
    const {scoreBar,ARRANGEMENTS}:typeof import('../../src/game/score')=await import('/src/game/score.ts');
    const summarize=(buffer:AudioBuffer,start=0,end=buffer.duration)=>{
      const data=buffer.getChannelData(0);let sum=0,peak=0,hash=0;const a=Math.round(start*buffer.sampleRate),z=Math.min(data.length,Math.round(end*buffer.sampleRate));
      for(let i=a;i<z;i++){const n=data[i];sum+=n*n;peak=Math.max(peak,Math.abs(n));if(i%211===0)hash=(Math.imul(hash,31)+Math.round(n*10000))|0;}
      return {rms:Math.sqrt(sum/(z-a)),peak,hash};
    };
    const scores=[];
    for(const mode of modes){
      const beat=60/ARRANGEMENTS[mode].bpm,c=new OfflineAudioContext(2,Math.ceil((16*beat+2)*22050),22050);
      const gain=c.createGain();gain.gain.value=.52;gain.connect(c.destination);const synth=new Synth(c,gain);
      for(let bar=0;bar<4;bar++)for(const n of scoreBar(mode,bar))synth.note(n.instrument,n.midi,.03+bar*4*beat+n.beat*beat,n.duration*beat,n.velocity,n.pan);
      scores.push({mode,...summarize(await c.startRendering())});
    }
    const c=new OfflineAudioContext(2,(effects.length*3+1)*22050,22050),gain=c.createGain();gain.gain.value=.58;gain.connect(c.destination);
    const synth=new Synth(c,gain);effects.forEach((effect,i)=>synth.effect(effect,i*3+.03,'yard',i));
    const buffer=await c.startRendering();
    return {scores,effects:effects.map((effect,i)=>({effect,...summarize(buffer,i*3,i*3+2.8)}))};
  },{modes,effects});
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
