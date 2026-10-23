import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
for(const file of ['../assets/vector/chapter-six.py','../assets/characters/vector/chapter-six.py','../assets/bosses/export-sun-serpent.py']){
 const result=spawnSync('python3',[fileURLToPath(new URL(file,import.meta.url))],{stdio:'inherit'});
 if(result.error)throw result.error;
 if(result.status!==0)throw new Error(`Vector export failed: ${file}`);
}
