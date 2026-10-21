import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
for(const [file,...args] of [['../assets/characters/vector/chapter-three.py'],['../assets/vector/chapter-one.py','--chapter','three']]){
 const r=spawnSync('python3',[fileURLToPath(new URL(file,import.meta.url)),...args],{stdio:'inherit'});if(r.error)throw r.error;if(r.status!==0)throw new Error(`Vector export failed: ${file}`);
}
