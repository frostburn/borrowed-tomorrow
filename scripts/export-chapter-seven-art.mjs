import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
for(const file of ['../assets/characters/vector/companions.py','../assets/bosses/export-benefactor.py','../assets/bosses/export-benefactor-forms.py','../assets/vector/chapter-seven.py','../assets/vector/story_mechanisms.py']){
 const result=spawnSync('python3',[fileURLToPath(new URL(file,import.meta.url))],{stdio:'inherit'});
 if(result.error)throw result.error;if(result.status!==0)throw new Error(`Chapter Seven export failed: ${file}`);
}

const variants=spawnSync(process.execPath,[fileURLToPath(new URL('./export-enemy-variants.mjs',import.meta.url))],{stdio:'inherit'});if(variants.error)throw variants.error;if(variants.status!==0)throw new Error('Enemy recolor export failed');
