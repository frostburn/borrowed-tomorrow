import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
for(const file of ['../assets/vector/chapter-five.py','../assets/characters/vector/chapter-five.py','../assets/bosses/export-flagship.py','../assets/characters/vector/supporting.py']){
 const r=spawnSync('python3',[fileURLToPath(new URL(file,import.meta.url))],{stdio:'inherit'});
 if(r.error)throw r.error;if(r.status!==0)throw new Error(`Vector export failed: ${file}`);
}
const variants=spawnSync(process.execPath,[fileURLToPath(new URL('./export-enemy-variants.mjs',import.meta.url))],{stdio:'inherit'});
if(variants.error)throw variants.error;if(variants.status!==0)throw new Error('Enemy export failed.');
