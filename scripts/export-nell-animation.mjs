import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const exporter=fileURLToPath(new URL('../assets/characters/export-nell-curated.py',import.meta.url));
const result=spawnSync('python3',[exporter],{stdio:'inherit'});
if(result.error)throw result.error;
process.exitCode=result.status??1;
