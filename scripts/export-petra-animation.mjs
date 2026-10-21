import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const r=spawnSync('python3',[fileURLToPath(new URL('../assets/characters/vector/chapter-two.py',import.meta.url))],{stdio:'inherit'});
if(r.error)throw r.error;if(r.status!==0)throw new Error('Vector export failed');
