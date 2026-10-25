import{spawnSync}from'node:child_process';
import{resolve}from'node:path';
const root=resolve(import.meta.dirname,'..');
const result=spawnSync('python3',[resolve(root,'assets/raster-benefactor/export.py')],{stdio:'inherit',cwd:root});
if(result.error)throw result.error;if(result.status!==0)process.exit(result.status??1);
