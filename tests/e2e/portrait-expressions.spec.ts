import {test,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import {portraitExpressions} from '../../src/content/portrait-expressions';
import {jungleCheckpoint} from '../support/jungle';
import {importSave} from './navigation';
import {capture,inspect} from './controls';

test.setTimeout(45000);
for(const [device,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]as const)test(`expressions follow dialogue, reset and replay on ${device}`,async({page})=>{
 await page.setViewportSize(viewport);await page.emulateMedia({reducedMotion:'reduce'});const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto('/');await page.getByRole('button',{name:'Begin Chapter One',exact:true}).click();
 const next=()=>page.locator('.dialogue-actions button').first().click(),image=page.locator('.dialogue-portrait img');await next();await next();
 await expect(image).toHaveAttribute('src',/portrait-nell-happy\.svg$/);await expect.poll(()=>image.evaluate(i=>(i as HTMLImageElement).naturalWidth)).toBe(128);await capture(page,`portrait-festival-${device}`);
 await next();await expect(image).toHaveAttribute('src',/portrait-master\.svg$/);await expect(image).toHaveAttribute('data-expression','neutral');
 await page.getByRole('button',{name:'Skip scene',exact:true}).click();
 await importSave(page,jungleCheckpoint('nellRecovered'));await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-river-rest');
 await next();await next();await expect(image).toHaveAttribute('src',/portrait-nell-bashful\.svg$/);await capture(page,`portrait-river-${device}`);
 await next();await expect(image).toHaveAttribute('src',/portrait-kit-bashful\.svg$/);await next();await expect(image).toHaveAttribute('src',/portrait-nell\.svg$/);
 await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-river-rest');await next();await next();await expect(image).toHaveAttribute('src',/portrait-nell-bashful\.svg$/);
 await page.getByRole('button',{name:'Skip scene',exact:true}).click();expect((await inspect(page)).state.flags.riverRestSeen).toBe(true);expect(errors).toEqual([]);
});

test('every expression preserves identity outside the features and survives the shared chunky raster',async({page})=>{
 await page.goto('/?dev=sprites');
 const catalog=['nell','orrin','kit','celia','petra','tomas'].map(hero=>({hero,expressions:portraitExpressions(`portrait-${hero}`)}));
 const result=await page.evaluate(async catalog=>{
  const decode=async(name:string)=>{const img=new Image();img.src=`/art/vector/portrait-${name}.svg`;await img.decode();return img;};
  const sheet=document.createElement('canvas');sheet.width=7*136;sheet.height=6*152;const s=sheet.getContext('2d')!;s.fillStyle='#182b32';s.fillRect(0,0,sheet.width,sheet.height);s.imageSmoothingEnabled=false;
  const stats=[];
  for(const [row,{hero,expressions}]of catalog.entries()){
   const neutral=await decode(hero),canvas=document.createElement('canvas');canvas.width=canvas.height=128;const ctx=canvas.getContext('2d')!;ctx.drawImage(neutral,0,0);const original=ctx.getImageData(0,0,128,128).data;
   for(const [col,expression]of expressions.entries()){
    const img=expression==='neutral'?neutral:await decode(`${hero}-${expression}`);ctx.clearRect(0,0,128,128);ctx.drawImage(img,0,0);const actual=ctx.getImageData(0,0,128,128).data;let outside=0,changed=0,chunky=0;
    for(let y=0;y<128;y++)for(let x=0;x<128;x++){
     const at=(y*128+x)*4,diff=[0,1,2,3].some(c=>actual[at+c]!==original[at+c]);
     if(diff){changed++;if(x<38||x>88||y<38||y>89)outside++;if(x%2===0&&y%2===0)chunky++;}
    }
    // The actual final framebuffer samples one native pixel per 2x2 square.
    const small=document.createElement('canvas');small.width=small.height=64;const smallCtx=small.getContext('2d')!;smallCtx.imageSmoothingEnabled=false;smallCtx.drawImage(img,0,0,64,64);s.drawImage(small,col*136,row*152,128,128);
    s.fillStyle='#f4e5be';s.font='12px monospace';s.fillText(`${hero}: ${expression}`,col*136,row*152+142);
    stats.push({hero,expression,outside,changed,chunky,width:img.naturalWidth,height:img.naturalHeight});
   }
  }
  return {stats,png:sheet.toDataURL('image/png')};
 },catalog);
 for(const r of result.stats){expect(r.width).toBe(128);expect(r.height).toBe(128);expect(r.outside,`${r.hero} ${r.expression} changes identity`).toBe(0);if(r.expression!=='neutral'){expect(r.changed).toBeGreaterThan(35);expect(r.chunky).toBeGreaterThan(8);}}
 if(process.env.BT_QA_SCREENSHOTS)await writeFile(`${process.env.BT_QA_SCREENSHOTS}/portrait-contact-sheet.png`,Buffer.from(result.png.split(',')[1],'base64'));
 // Review controls use those same assets and preserve the actor inspector.
 const panel=page.getByRole('region',{name:'Portrait expressions',exact:true});await panel.getByRole('button',{name:'Sad',exact:true}).click();await expect(panel.locator('img')).toHaveAttribute('src',/portrait-nell-sad\.svg$/);
 await page.getByRole('button',{name:'Inspect Celia',exact:true}).click();await expect(panel.getByRole('button',{name:'Bashful',exact:true})).toHaveCount(0);await panel.getByRole('button',{name:'Worried',exact:true}).click();await expect(panel.locator('img')).toHaveAttribute('src',/portrait-celia-worried\.svg$/);await capture(page,'portrait-workshop');
});

test('human portrait pupils stay paired at every chunky sampling phase',async({page})=>{
 const {readFileSync}=await import('node:fs');
 const {CHARACTERS}=await import('../../src/content/characters');
 const entries=Object.values(CHARACTERS).flatMap(character=>portraitExpressions(character.portrait).flatMap(expression=>{
  const name=expression==='neutral'?character.portrait:`${character.portrait}-${expression}`;
  const svg=readFileSync(new URL(`../../public/art/vector/${name}.svg`,import.meta.url),'utf8');
  const match=[...svg.matchAll(/<path d="M(\d+) (\d+)H(\d+)V(\d+)H\d+Z M(\d+) (\d+)H(\d+)V(\d+)H\d+Z" fill="(#[0-9a-f]+)"\/>/g)].find(m=>+m[3]-+m[1]===4&&+m[7]-+m[5]===4&&+m[2]>=46&&+m[2]<=55);
  if(!match)return [];
  return [{name,boxes:[[+match[1],+match[2],+match[3],+match[4]],[+match[5],+match[6],+match[7],+match[8]]],colors:[match[9],...(name.includes('tomas')?['#25372b']:[])]}];
 }));
 expect(entries).toHaveLength(62);await page.goto('/');
 const failures=await page.evaluate(async entries=>{
  const failures=[];
  for(const entry of entries){
   const img=new Image();img.src=`/art/vector/${entry.name}.svg`;await img.decode();
   const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const ctx=canvas.getContext('2d')!;ctx.drawImage(img,0,0);
   const pixels=ctx.getImageData(0,0,128,128).data,colors=entry.colors.map(color=>[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)));
   for(let py=0;py<2;py++)for(let px=0;px<2;px++){
    const counts=entry.boxes.map(([left,top,right,bottom])=>{
     let count=0;
     for(let y=top;y<bottom;y++)for(let x=left;x<right;x++){
      if(x%2!==px||y%2!==py)continue;
      const at=(y*128+x)*4;if(colors.some(color=>color.every((v,i)=>pixels[at+i]===v)))count++;
     }
     return count;
    });
    if(counts.some(count=>count!==4))failures.push({name:entry.name,px,py,counts});
   }
  }
  return failures;
 },entries);
 expect(failures).toEqual([]);
});
