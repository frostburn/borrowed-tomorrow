import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname,resolve } from 'node:path';
import type { Plugin } from 'vite';

/** Repeated deltas cover empty areas, repeated tiles and patterned floor rows. */
export function packTileRuns(data:readonly number[]):string {
  const runs:{delta:number;count:number}[]=[];
  let previous=0;
  for(const value of data){
    const delta=value-previous,last=runs.at(-1);previous=value;
    if(last?.delta===delta)last.count++;else runs.push({delta,count:1});
  }
  return runs.map(({delta,count})=>`${delta.toString(36)}${count===1?'':`.${count.toString(36)}`}`).join(',');
}

export function compactTiledMap(source:string):string {
  const map=JSON.parse(source);
  for(const layer of map.layers){
    if(!Array.isArray(layer.data)||!layer.data.length)continue;
    const packed=packTileRuns(layer.data);
    if(packed.length+2<JSON.stringify(layer.data).length)layer.data=packed;
  }
  return JSON.stringify(map);
}

type TilePage={tiles:{type?:string;properties?:Record<string,unknown>[]}[]};
/** The catalogue repeats the same property lists on thousands of named tiles. */
export function compactTileCatalog(pages:TilePage[]):string {
  const profiles:(Record<string,unknown>|null)[][]=[],indices=new Map<string,number>();
  const packed=pages.map(page=>({...page,tiles:page.tiles.map(tile=>{
    if(!tile.properties)return tile;
    const profile=tile.properties.map(p=>p.name==='name'&&p.type==='string'&&p.value===tile.type&&Object.keys(p).length===3?null:p);
    const key=JSON.stringify(profile);
    if(!indices.has(key)){indices.set(key,profiles.length);profiles.push(profile);}
    return {...tile,properties:indices.get(key)!};
  })}));
  return JSON.stringify([packed,profiles]);
}

/** Keep authoring JSON untouched and avoid feeding packed modules to Vite's JSON loader. */
export function compactTiledMaps():Plugin {
  const prefix='\0tiled-grid:',decoder=fileURLToPath(new URL('../../src/content/tile-runs.ts',import.meta.url));
  return {
    name:'compact-tiled-grids',apply:'build',enforce:'pre',
    async resolveId(source,importer){
      if(!source.endsWith('.json')||!importer)return;
      const resolved=await this.resolve(source,importer,{skipSelf:true});
      if(resolved&&/[\\/]src[\\/]content[\\/]chapter-[a-z]+[\\/]maps[\\/][^?]+\.json$/.test(resolved.id))return `${prefix}${resolved.id}.js`;
    },
    async load(id){
      if(/[\\/]assets[\\/]tiles[\\/]tile-definitions\.ts$/.test(id)){
        const source=await readFile(id,'utf8'),files=[...source.matchAll(/^import \w+ from '([^']+\.json)'/gm)].map(match=>resolve(dirname(id),match[1]));
        if(!files.length)throw new Error('No tile catalogue pages found.');
        const pages=await Promise.all(files.map(file=>{this.addWatchFile(file);return readFile(file,'utf8').then(JSON.parse);}));
        const catalogDecoder=fileURLToPath(new URL('../../src/content/tile-catalog.ts',import.meta.url));
        return `import {expandTileCatalog} from ${JSON.stringify(catalogDecoder)};export default expandTileCatalog(...${compactTileCatalog(pages)});`;
      }
      if(!id.startsWith(prefix))return;
      const file=id.slice(prefix.length,-3);this.addWatchFile(file);
      return `import {expandTileRuns} from ${JSON.stringify(decoder)};export default expandTileRuns(${compactTiledMap(await readFile(file,'utf8'))});`;
    },
  };
}
