// Check the actual staged bytes before any GitHub API call or commit.
import { execFileSync } from 'node:child_process';
const paths=execFileSync('git',['diff','--cached','--name-only','--diff-filter=ACM','-z'],{encoding:'utf8'}).split('\0').filter(p=>/\.(png|webp|jpe?g|gif|avif)$/i.test(p));
let failed=false;
for(const path of paths){
  const bytes=execFileSync('git',['show',`:${path}`],{maxBuffer:64*1024*1024}).length;
  if(bytes>65536){console.error(`${path}: ${bytes} bytes exceeds 64 KB. Export small image tiles/pages before uploading or committing.`);failed=true;}
  else console.log(`${path}: ${bytes} bytes`);
}
if(failed)process.exitCode=1;
else console.log(`${paths.length} staged image(s) within the 64 KB per-file upload budget.`);
