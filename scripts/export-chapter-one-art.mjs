import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { exportVectorCharacters } from './export-vector-characters.mjs';

exportVectorCharacters();
for(const file of ['../assets/characters/vector/supporting.py','../assets/vector/chapter-one.py']){
  const result=spawnSync('python3',[fileURLToPath(new URL(file,import.meta.url))],{stdio:'inherit'});
  if(result.error)throw result.error;
  if(result.status!==0)throw new Error(`SVG export failed: ${file}`);
}

await import('./export-enemy-variants.mjs');
