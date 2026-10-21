import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export function exportVectorCharacters(hero){
  const exporter=fileURLToPath(new URL('../assets/characters/vector/draw.py',import.meta.url));
  const result=spawnSync('python3',[exporter,...(hero?['--hero',hero]:[])],{stdio:'inherit'});
  if(result.error)throw result.error;
  if(result.status!==0)throw new Error('Vector character export failed.');
}

if(process.argv[1]===fileURLToPath(import.meta.url))exportVectorCharacters();
