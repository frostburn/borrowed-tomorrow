// Check the actual staged bytes before any GitHub API call or commit.
import { execFileSync } from 'node:child_process';
const paths=execFileSync('git',['diff','--cached','--name-only','--diff-filter=ACM','-z'],{encoding:'utf8'}).split('\0').filter(p=>/\.(svg|png|webp|jpe?g|gif|avif)$/i.test(p));
let failed=false;
for(const path of paths){
  const content=execFileSync('git',['show',`:${path}`],{maxBuffer:64*1024*1024}),bytes=content.length;
  // Two bounded indexed-raster map pilots; do not relax unrelated art uploads.
  const limit=/^(?:public\/art|assets)\/raster-maps\/(station|stillcity)\/.*\.png$/.test(path)?262144:131072;
  if(bytes>limit){console.error(`${path}: ${bytes} bytes exceeds ${limit/1024} KB. Reduce vector complexity or export bounded raster pages before uploading or committing.`);failed=true;}
  else if(path.endsWith('.svg')&&/<image\b|data:|<script\b|<foreignObject\b|(?:href|src)\s*=\s*["'](?!#)/i.test(content.toString())){console.error(`${path}: SVG artwork must be self-contained vectors, without embedded rasters or external resources.`);failed=true;}
  else console.log(`${path}: ${bytes} bytes`);
}
if(failed)process.exitCode=1;
else console.log(`${paths.length} staged image(s) within the per-file upload budget (128 KB; 256 KB for Station/Stillcity raster pilots).`);
