import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
for(const file of ['../assets/vector/chapter-four.py','../assets/characters/vector/chapter-four.py']){
 const r=spawnSync('python3',[fileURLToPath(new URL(file,import.meta.url))],{stdio:'inherit'});
 if(r.error)throw r.error;if(r.status!==0)throw new Error(`Vector export failed: ${file}`);
}
