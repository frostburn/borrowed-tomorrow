import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
for(const file of ['../assets/bosses/export-imperial.py','../assets/vector/chapter-six-capital.py','../assets/characters/vector/chapter-six.py','../assets/characters/vector/jungle.py','../assets/characters/vector/north.py','../assets/bosses/export-sun-serpent.py']){
 const result=spawnSync('python3',[fileURLToPath(new URL(file,import.meta.url))],{stdio:'inherit'});
 if(result.error)throw result.error;
 if(result.status!==0)throw new Error(`Vector export failed: ${file}`);
}

const variants=spawnSync(process.execPath,[fileURLToPath(new URL('./export-enemy-variants.mjs',import.meta.url))],{stdio:'inherit'});
if(variants.error)throw variants.error;
if(variants.status!==0)throw new Error('Enemy recolor export failed');
