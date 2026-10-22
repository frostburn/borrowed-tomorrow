import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

// Change only literal SVG colors: retain every contour, outline width and anchor.
const root=new URL('../',import.meta.url);
const variants=JSON.parse(readFileSync(new URL('src/content/enemy-variants.json',root),'utf8'));
for(const [id,variant] of Object.entries(variants)){
 const source=readFileSync(new URL(`public/art/vector/${variant.kind}.svg`,root),'utf8');
 for(const color of Object.keys(variant.colors))if(!source.includes(color))throw new Error(`${id}: base color ${color} is missing`);
 const svg=source.replace(/#[0-9a-f]{6}/gi,color=>variant.colors[color]??color);
 writeFileSync(fileURLToPath(new URL(`public/art/vector/${id}.svg`,root)),svg);
}
console.log(`Exported ${Object.keys(variants).length} native SVG enemy recolors`);
