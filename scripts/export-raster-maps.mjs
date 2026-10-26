// Rasterize the existing vector masks offline; no game dependency or image API.
import {chromium} from '@playwright/test';
import {readFile,writeFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
const root=resolve(import.meta.dirname,'..'),config=JSON.parse(await readFile(join(root,'assets/raster-maps/maps.json'),'utf8'));
const temp=await mkdtemp(join(tmpdir(),'borrowed-tomorrow-raster-'));
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,args:['--no-sandbox']});
try{
 const page=await browser.newPage(),maps={};
 for(const [id,settings]of Object.entries(config)){
  const pieces=JSON.parse(await readFile(join(root,`src/content/chapter-${settings.chapter}/scene-art.json`),'utf8'))[id];maps[id]=pieces;
  for(const [i,piece]of pieces.entries()){
   const svg=await readFile(join(root,'public',piece.url),'utf8');
   const png=await page.evaluate(async({svg,width,height})=>{
    const image=new Image();image.src='data:image/svg+xml,'+encodeURIComponent(svg);await image.decode();
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
    canvas.getContext('2d').drawImage(image,0,0,width,height);
    return canvas.toDataURL('image/png').split(',')[1];
   },{svg,width:piece.width,height:piece.height});
   await writeFile(join(temp,`${id}-${i}.png`),Buffer.from(png,'base64'));
  }
 }
 await writeFile(join(temp,'pieces.json'),JSON.stringify(maps));
 const result=spawnSync('python3',[join(root,'assets/raster-maps/export.py'),temp],{stdio:'inherit',cwd:root});
 if(result.error)throw result.error;if(result.status!==0)throw new Error('Raster map export failed');
}finally{await browser.close();await rm(temp,{recursive:true,force:true});}
