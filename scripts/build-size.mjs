import { readFile,readdir,stat } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';

const root='dist';
let manifest;
try{manifest=JSON.parse(await readFile(join(root,'.vite/manifest.json'),'utf8'));}
catch{console.error('Build output is missing. Run npm run build first.');process.exit(1);}
const initial=new Set();
function visit(key){
  if(initial.has(key))return;
  initial.add(key);for(const imported of manifest[key].imports??[])visit(imported);
}
for(const [key,entry] of Object.entries(manifest))if(entry.isEntry)visit(key);
const chunks=await Promise.all(Object.entries(manifest).filter(([,entry])=>entry.file.endsWith('.js')).map(async([key,entry])=>{
  const data=await readFile(join(root,entry.file));
  return {file:entry.file,bytes:data.length,gzip:gzipSync(data).length,initial:initial.has(key)};
}));
chunks.sort((a,b)=>b.bytes-a.bytes);
console.table(chunks.map(c=>({chunk:c.file,'raw kB':+(c.bytes/1000).toFixed(2),'gzip kB':+(c.gzip/1000).toFixed(2),load:c.initial?'startup':'on demand'})));
const sum=(list,key)=>list.reduce((total,chunk)=>total+chunk[key],0);
console.log(`JavaScript total: ${(sum(chunks,'bytes')/1e6).toFixed(2)} MB raw / ${(sum(chunks,'gzip')/1000).toFixed(2)} kB gzip`);
console.log(`Startup JavaScript: ${(sum(chunks.filter(c=>c.initial),'bytes')/1e6).toFixed(2)} MB raw / ${(sum(chunks.filter(c=>c.initial),'gzip')/1000).toFixed(2)} kB gzip`);
let distribution=0;
for(const file of await readdir(root,{recursive:true,withFileTypes:true}))if(file.isFile())distribution+=(await stat(join(file.parentPath,file.name))).size;
console.log(`Complete distribution, including unchanged artwork: ${(distribution/1e6).toFixed(2)} MB`);
console.log('Gzip figures estimate HTTP compression; configure the deployment server to send it.');
