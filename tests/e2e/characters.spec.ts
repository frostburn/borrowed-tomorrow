import { expect, test, type Page } from '@playwright/test';
import departure from '../fixtures/disk-b-v2.json' with {type:'json'};
import { decodeSave, enterDiskC } from '../../src/rules/state';
import { importSave, approach } from './navigation';
import { capture, dialogue, inspect } from './controls';

async function portrait(page:Page,name:string){
  await expect(page.locator('.dialogue h2')).toHaveText(name);
  await expect(page.locator('.dialogue-portrait img')).toHaveAttribute('alt',name);
  // Compare every displayed pixel with the new native portrait, including alpha.
  await expect.poll(()=>page.evaluate(()=>{
    const image=document.querySelector<HTMLImageElement>('.dialogue-portrait img');
    if(!image?.complete||image.naturalWidth!==128||image.naturalHeight!==128)return -1;
    const info=window.borrowedTomorrowPixels.inspect(),origin=document.querySelector('.pixel-source')!.getBoundingClientRect(),box=image.getBoundingClientRect();
    if(Math.round(box.width/info.cssScale)!==128||Math.round(box.height/info.cssScale)!==128)return -2;
    const reference=document.createElement('canvas');reference.width=128;reference.height=128;
    const ctx=reference.getContext('2d')!;ctx.fillStyle=getComputedStyle(image.parentElement!).backgroundColor;ctx.fillRect(0,0,128,128);ctx.drawImage(image,0,0);
    const expected=ctx.getImageData(0,0,128,128).data;
    const output=document.querySelector<HTMLCanvasElement>('.pixel-output')!,actual=output.getContext('2d')!.getImageData(0,0,output.width,output.height).data;
    const x=info.physicalLeft+Math.round((box.left-origin.left)/info.cssScale)*info.physicalScale;
    const y=info.physicalTop+Math.round((box.top-origin.top)/info.cssScale)*info.physicalScale;
    let differences=0;
    for(let row=0;row<128;row++)for(let col=0;col<128;col++)for(let channel=0;channel<4;channel++){
      if(actual[((y+row*info.physicalScale)*output.width+x+col*info.physicalScale)*4+channel]!==expected[(row*128+col)*4+channel])differences++;
    }
    return differences;
  })).toBe(0);
}

test('named NPCs keep their own sprites and full portraits on desktop and phone',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  const missing:string[]=[];page.on('response',r=>{if(r.url().includes('/art/')&&r.status()>=400)missing.push(r.url());});
  await page.goto('/');await expect(page).toHaveTitle(/Borrowed Tomorrow/);
  const state=enterDiskC(decodeSave(JSON.stringify(departure)));state.location={map:'station',x:23,y:18};
  await importSave(page,state);
  await approach(page,'b-family-larkspur');await expect(page.locator('.dialogue h2')).toHaveText('Mira');
  await page.locator('.dialogue-actions button').first().click();await portrait(page,'Bram');await capture(page,'npc-bram-portrait');await dialogue(page);
  await approach(page,'c-tilda');await portrait(page,'Tilda');await capture(page,'npc-tilda-portrait');await dialogue(page);
  await approach(page,'b-elspeth-larkspur');await portrait(page,'Elspeth');await capture(page,'npc-elspeth-portrait');await dialogue(page);
  await capture(page,'npc-larkspur-cast');
  await approach(page,'clerk');await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByAltText('Iona')).toBeVisible();await page.getByRole('button',{name:'Close',exact:true}).click();
  await page.setViewportSize({width:390,height:844});
  state.location={map:'cinderbank',x:28,y:14};await importSave(page,state);
  await expect.poll(async()=>(await inspect(page)).state.location.map).toBe('cinderbank');
  await approach(page,'c-dena');await portrait(page,'Dena');await capture(page,'npc-dena-phone');
  await page.getByRole('button',{name:'Back to the loading apron',exact:true}).click();
  state.flags.cTransferred=true;state.location={map:'infirmary',x:53,y:18};await importSave(page,state);
  await expect.poll(async()=>(await inspect(page)).state.location.map).toBe('infirmary');
  await approach(page,'c-celia');await portrait(page,'Celia');await capture(page,'npc-celia-phone');await dialogue(page);
  await approach(page,'c-patients');await portrait(page,'Ivo');await capture(page,'npc-ivo-phone');await dialogue(page);
  expect(errors).toEqual([]);expect(missing).toEqual([]);
  expect(await page.locator('vite-error-overlay').count()).toBe(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
