import {test,expect,type Page} from '@playwright/test';
import {GLYPHS} from '../../src/game/pixel-font';
import compact from '../../src/game/small-font.json' with {type:'json'};
import {toPixel,offset} from '../../src/rules/hex';
import {capture,clickHex,inspect} from './controls';

async function crispLabels(page:Page){
 await expect.poll(async()=>{
  const state=await inspect(page);
  const labels=state.battle!.units.filter(u=>u.hp>0).flatMap(u=>{
   const p=toPixel(u.hex),hp=String(u.hp),result=[{text:hp,x:p.x,y:p.y+28,width:hp.length*12,height:18,compact:false,color:[244,229,190]}];
   if(u.guard){const text=`Guard ${u.guard}`;result.push({text,x:p.x,y:p.y+44,width:text.length*8,height:14,compact:true,color:[135,163,162]});}
   return result;
  });
  return page.evaluate(({labels,normal,small})=>{
   const view=window.borrowedTomorrow.inspect().view,info=window.borrowedTomorrowPixels.inspect();
   const source=document.querySelector('.pixel-source')!.getBoundingClientRect(),world=document.querySelector('.world-input')!.getBoundingClientRect();
   const wx=Math.round((world.left-source.left)/info.cssScale),wy=Math.round((world.top-source.top)/info.cssScale),u=info.rasterUnit;
   const output=document.querySelector<HTMLCanvasElement>('.pixel-output')!,data=output.getContext('2d')!.getImageData(0,0,output.width,output.height).data;
   let checked=0,mismatches=0;
   for(const label of labels){
    const left=Math.round((label.x-view.scrollX-label.width/2)/u)*u,top=Math.round((label.y-view.scrollY-label.height/2)/u)*u;
    if(left<0||top<0||left+label.width>view.width||top+label.height>view.height)continue;
    const mask=new Uint8Array(label.width*label.height);let cursor=0;
    for(const char of label.text){
     const rows=(label.compact?small[char.toUpperCase()]:normal[char])!;
     rows.forEach((row,y)=>[...row].forEach((value,x)=>{if(value==='1')for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++)mask[(2+y*2+dy)*label.width+cursor+x*2+dx]=1;}));
     cursor+=label.compact?8:12;
    }
    for(let y=0;y<label.height;y++)for(let x=0;x<label.width;x++){
     const sx=Math.floor((wx+left+x)/u)*u-wx-left,sy=Math.floor((wy+top+y)/u)*u-wy-top;
     if(sx<0||sy<0||sx>=label.width||sy>=label.height)continue;
     const px=info.physicalLeft+(wx+left+x)*info.physicalScale,py=info.physicalTop+(wy+top+y)*info.physicalScale;
     const i=(py*output.width+px)*4,ink=label.color.every((c,k)=>data[i+k]===c);
     if(ink!==!!mask[sy*label.width+sx])mismatches++;
    }
    checked++;
   }
   return checked>=2?mismatches:-1;
  },{labels,normal:GLYPHS,small:compact as Record<string,string[]>});
 }).toBe(0);
}

for(const [device,viewport,dpr] of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]] as const){
 test(`HP and status glyphs stay exact on alternating hex rows on ${device}`,async({browser})=>{
  const context=await browser.newContext({viewport,deviceScaleFactor:dpr,reducedMotion:'reduce'}),page=await context.newPage();
  try{
   const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/?dev=workshop');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop');
   await page.getByRole('group',{name:'Character',exact:true}).getByRole('button',{name:'Orrin',exact:true}).click();
   await page.getByRole('spinbutton',{name:'Orrin level',exact:true}).fill('3');await page.getByRole('spinbutton',{name:'Orrin level',exact:true}).blur();
   await page.getByRole('spinbutton',{name:'Orrin Speed',exact:true}).fill('15');await page.getByRole('button',{name:'Apply base stats',exact:true}).click();
   await page.getByRole('button',{name:'Test battle',exact:true}).click();await expect.poll(async()=>(await inspect(page)).battle?.queue[0]).toBe('orrin');
   await crispLabels(page);await capture(page,`battle-labels-initial-${device}`);
   await page.locator('.actions').getByRole('button',{name:/Safety guard/}).click();await clickHex(page,(await inspect(page)).battle!.units.find(u=>u.id==='nell')!.hex);
   await page.getByRole('button',{name:'Confirm ability',exact:true}).click();await expect.poll(async()=>!(await inspect(page)).busy).toBe(true);
   expect((await inspect(page)).battle!.units.find(u=>u.id==='nell')!.guard).toBe(10);await crispLabels(page);
   await page.locator('.actions').getByRole('button',{name:/^1\s+Move \/ Strike$/}).click();await clickHex(page,offset(2,3));await page.getByRole('button',{name:/^Confirm move/}).click();
   await expect.poll(async()=>!(await inspect(page)).busy).toBe(true);expect((await inspect(page)).battle!.units.find(u=>u.id==='nell')!.hex).toEqual(offset(2,3));
   await crispLabels(page);await capture(page,`battle-labels-odd-row-${device}`);await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
  }finally{await context.close();}
 });
}
