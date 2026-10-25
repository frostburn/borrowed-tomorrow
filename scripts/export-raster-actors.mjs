// Task-environment authoring only. Chromium decodes the editable SVG rigs;
// Pillow/NumPy/SciPy paint the registered raster skin and retarget its poses.
import {chromium} from '@playwright/test';
import {readFile,writeFile,mkdtemp,rm,readdir,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,join,dirname} from 'node:path';
import {spawnSync} from 'node:child_process';
const root=resolve(import.meta.dirname,'..'),vector=join(root,'public/art/vector');
const files=(await readdir(vector,{recursive:true})).filter(path=>{
 if(!path.endsWith('.svg')||path.includes('portrait'))return false;
 if(!path.includes('/')||path.startsWith('animation/'))return true;
 return /^(?:bosses\/(?:conduit-regulator(?:-motion)?|flagship-(?:hull|port(?:-fire)?|starboard(?:-fire)?|bridge(?:-fire)?))|chapter-five\/(?:furnace-carrier-battle|ward-engine-battle|gantry-carrier)|chapter-six\/(?:winter-dragon|dragon-(?:inhale|breath|shatter)|serpent-(?:head|inhale|fire|west|east)|imperial-(?:idle|charge|cast|fallen|support|support-broken)|lightbearer-(?:idle|rise|cast|resist))|benefactor\/benefactor(?:-sun|-heart)?-motion)\.svg$/.test(path);
}).sort();
const temp=await mkdtemp(join(tmpdir(),'borrowed-tomorrow-actors-'));
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,args:['--no-sandbox']});
try{
 const page=await browser.newPage();
 for(const path of files){
  const svg=await readFile(join(vector,path),'utf8');
  const data=await page.evaluate(async svg=>{
   const image=new Image();image.src='data:image/svg+xml,'+encodeURIComponent(svg);await image.decode();
   const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
   const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.drawImage(image,0,0);
   return canvas.toDataURL('image/png').split(',')[1];
  },svg);
  const target=join(temp,path.replace(/\.svg$/,'.png'));await mkdir(dirname(target),{recursive:true});
  await writeFile(target,Buffer.from(data,'base64'));
 }
 await writeFile(join(temp,'files.json'),JSON.stringify(files));
 const result=spawnSync('python3',[join(root,'assets/raster-actors/export.py'),temp],{stdio:'inherit',cwd:root});
 if(result.error)throw result.error;if(result.status!==0)throw new Error('Raster actor export failed');
}finally{await browser.close();await rm(temp,{recursive:true,force:true});}
