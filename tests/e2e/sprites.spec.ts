import { artPath, vectorAsset } from '../../src/content/art-assets';
import { PLAYABLE_ACTORS } from '../../src/content/actors';
import { SPRITE_CATALOG } from '../../src/dev/sprite-catalog';
import { expect, test } from '@playwright/test';
import { capture } from './controls';
import { civilianPresentation } from '../../src/content/civilians';

for(const [device,viewport,dpr] of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]] as const){
 test.describe(`sprites on ${device}`,()=>{
  test.use({viewport,deviceScaleFactor:dpr});
  test('reviews native cast, directions and integer zoom without changing storage',async({page})=>{
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    await page.goto('/?dev=sprites');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop');
    const review=page.getByRole('region',{name:'Sprite review',exact:true});await expect(review).toBeVisible();
    const stored=await page.evaluate(()=>JSON.stringify(localStorage));
    const portraits=review.locator('.sprite-cast img');await expect(portraits).toHaveCount(5);
    for(const image of await portraits.all())expect(await image.evaluate(async i=>{const img=i as HTMLImageElement;await img.decode();const r=img.getBoundingClientRect(),scale=window.borrowedTomorrowPixels.inspect().cssScale;return [img.naturalWidth,img.naturalHeight,Math.round(r.width/scale),Math.round(r.height/scale)];})).toEqual([128,128,128,128]);
    // Check every exported actor's real alpha bounds, including the new reserve directions.
    const feet=await page.evaluate(async(paths)=>{
      const all=[];
      const party=['nell','orrin','kit','celia','petra'];
      const supporting=['master','clerk','tilda','elspeth','tomas','alban','bram','dena','emperor','relay-keeper','boiler-keeper','sluice-keeper','inspector','hound','crow','guardian','civilian-dockhand','civilian-traveler','civilian-family','civilian-patient','civilian-dockhand-rust','civilian-traveler-blue','civilian-family-blue','civilian-family-plum','civilian-patient-green'];
      for(const hero of [...party,...supporting])for(const suffix of party.includes(hero)?['','-left','-right','-back']:['']){
        const image=new Image();image.src=paths[hero+suffix];await image.decode();
        const canvas=document.createElement('canvas'),w=image.naturalWidth,h=image.naturalHeight;canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d')!;ctx.drawImage(image,0,0);
        const p=ctx.getImageData(0,0,w,h).data;let bottom=-1,top=h;
        for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(p[(y*w+x)*4+3]>127){top=Math.min(top,y);bottom=Math.max(bottom,y);}
        const visited=new Uint8Array(w*h);let components=0;
        for(let seed=0;seed<w*h;seed++){
          if(visited[seed]||!p[seed*4+3])continue;
          components++;const queue=[seed];visited[seed]=1;
          for(let at=0;at<queue.length;at++){
            const x=queue[at]%w,y=Math.floor(queue[at]/w);
            for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
              const nx=x+dx,ny=y+dy,next=ny*w+nx;
              if(nx<0||nx>=w||ny<0||ny>=h||visited[next]||!p[next*4+3])continue;
              visited[next]=1;queue.push(next);
            }
          }
        }
        all.push({hero,suffix,top,bottom,components,width:image.naturalWidth,height:image.naturalHeight});
      }return all;
    },Object.fromEntries([...PLAYABLE_ACTORS,...SPRITE_CATALOG.map(e=>e.sprite)].map(name=>[name,`/${artPath(name)}`])));
    for(const actor of feet){
      const fit=civilianPresentation(actor.hero);
      if(fit){expect([actor.width,actor.height]).toEqual([fit.width,fit.height]);expect([actor.top,actor.bottom]).toEqual([fit.bounds[1],fit.bounds[3]-1]);continue;}
      expect(actor.width).toBe(80);expect(actor.height).toBe(80);
      expect(actor.bottom,`${actor.hero}${actor.suffix} ground`).toBe(67);
      expect(actor.components,`${actor.hero}${actor.suffix} has no detached alpha fragments`).toBe(1);
      if(['hound','crow','guardian'].includes(actor.hero))continue;
      expect(actor.top).toBeGreaterThanOrEqual(vectorAsset(actor.hero)?2:4);expect(actor.top).toBeLessThanOrEqual(10);
    }
    await capture(page,`sprite-cast-${device}`);
    await review.getByRole('button',{name:'Inspect Celia',exact:true}).click();
    await review.getByRole('group',{name:'Facing',exact:true}).getByRole('button',{name:'Back',exact:true}).click();
    const zoom=review.getByRole('group',{name:'Sprite zoom',exact:true});await zoom.getByRole('button',{name:'3x',exact:true}).click();
    await review.getByRole('group',{name:'Preview background'}).getByRole('button',{name:'Paper',exact:true}).click();
    await review.getByRole('button',{name:'Ground guides',exact:true}).click();
    const detail=review.getByRole('img',{name:'Celia back at 3x',exact:true});
    await detail.scrollIntoViewIfNeeded();
    // Match the review canvas against nearest-neighbor expansion of the real source.
    await expect.poll(()=>detail.evaluate(async element=>{
      const canvas=element as HTMLCanvasElement,image=new Image();image.src='/art/celia-back.png';await image.decode();
      const reference=document.createElement('canvas');reference.width=reference.height=240;const ctx=reference.getContext('2d')!;ctx.imageSmoothingEnabled=false;
      for(let y=0;y<240;y+=8)for(let x=0;x<240;x+=8){ctx.fillStyle=(x/8+y/8)%2?'#f4e5be':'#dac9a0';ctx.fillRect(x,y,8,8);}ctx.drawImage(image,0,0,240,240);
      const expected=ctx.getImageData(0,0,240,240).data,actual=canvas.getContext('2d')!.getImageData(0,0,240,240).data;
      return actual.reduce((n,value,index)=>n+Number(value!==expected[index]),0);
    })).toBe(0);
    await expect.poll(()=>detail.evaluate(element=>{
      const canvas=element as HTMLCanvasElement,info=window.borrowedTomorrowPixels.inspect(),source=document.querySelector('.pixel-source')!.getBoundingClientRect(),r=canvas.getBoundingClientRect();
      const output=document.querySelector<HTMLCanvasElement>('.pixel-output')!,actual=output.getContext('2d')!.getImageData(0,0,output.width,output.height).data,expected=canvas.getContext('2d')!.getImageData(0,0,240,240).data;
      const left=info.physicalLeft+Math.round((r.left-source.left)/info.cssScale)*info.physicalScale,top=info.physicalTop+Math.round((r.top-source.top)/info.cssScale)*info.physicalScale;
      let mismatches=0;for(let y=0;y<240;y++)for(let x=0;x<240;x++)for(let c=0;c<4;c++)if(actual[((top+y*info.physicalScale)*output.width+left+x*info.physicalScale)*4+c]!==expected[(y*240+x)*4+c])mismatches++;
      return mismatches;
    })).toBe(0);
    await capture(page,`sprite-detail-${device}`);
    expect(await page.locator('.inventory-panel').evaluate(p=>p.scrollWidth<=p.clientWidth)).toBe(true);
    await page.getByRole('navigation',{name:'Workshop panels'}).getByRole('button',{name:'Character',exact:true}).click();
    await expect(page.getByRole('spinbutton',{name:'Nell level',exact:true})).toHaveValue('1');
    await page.getByRole('navigation',{name:'Workshop panels'}).getByRole('button',{name:'Sprites',exact:true}).click();
    await expect(page.getByRole('button',{name:'Inspect Celia',exact:true})).toHaveAttribute('aria-pressed','true');
    const collections=page.getByRole('group',{name:'Sprite collection',exact:true});
    await collections.getByRole('button',{name:'NPCs (21)',exact:true}).click();
    await expect(review.locator('[data-sprite-hero]')).toHaveCount(21);
    await review.getByRole('button',{name:'Inspect Stationmaster Ansel',exact:true}).click();
    await expect(review.getByRole('img',{name:'Stationmaster Ansel portrait',exact:true})).toHaveAttribute('src',/portrait-master\.svg$/);
    await expect(review.getByRole('group',{name:'Facing',exact:true}).getByRole('button',{name:'Left',exact:true})).toBeDisabled();
    await expect(review.locator('.sprite-file')).toContainText(artPath('master'));
    const npcLineup=review.getByRole('img',{name:'NPCs at native size',exact:true});
    expect(await npcLineup.evaluate(canvas=>{const c=canvas as HTMLCanvasElement;return [c.width,Math.round(c.getBoundingClientRect().width/window.borrowedTomorrowPixels.inspect().cssScale)];})).toEqual([2016,2016]);
    await capture(page,`sprite-npcs-${device}`);
    await collections.getByRole('button',{name:'Enemies (4)',exact:true}).click();
    await review.getByRole('button',{name:'Inspect Hound',exact:true}).click();
    const hound=review.getByRole('img',{name:'Hound actor',exact:true});
    expect(await hound.evaluate(async element=>{const i=element as HTMLImageElement;await i.decode();const scale=window.borrowedTomorrowPixels.inspect().cssScale,r=i.getBoundingClientRect();return [i.naturalWidth,i.naturalHeight,Math.round(r.width/scale),Math.round(r.height/scale)];})).toEqual([80,80,80,80]);
    await expect(review.locator('.sprite-reference')).toContainText('Portrait: not available');
    expect(await page.locator('.inventory-panel').evaluate(p=>p.scrollWidth<=p.clientWidth)).toBe(true);
    await capture(page,`sprite-enemies-${device}`);
    expect(await page.evaluate(()=>JSON.stringify(localStorage))).toBe(stored);await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
  });
 });
}
