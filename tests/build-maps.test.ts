import { readdirSync,readFileSync } from 'node:fs';
import { describe,it,expect } from 'vitest';
import { compactTiledMap,compactTileCatalog,packTileRuns } from '../scripts/build/tiled';
import { expandTileRuns } from '../src/content/tile-runs';
import { expandTileCatalog } from '../src/content/tile-catalog';
import tilePages from '../assets/tiles/tile-definitions';

describe('distribution map packing',()=>{
  it('preserves every field, tile ID, layer and object in every campaign map',()=>{
    const chapters=readdirSync('src/content').filter(name=>name.startsWith('chapter-'));
    let originalBytes=0,packedBytes=0,maps=0;
    for(const chapter of chapters)for(const file of readdirSync(`src/content/${chapter}/maps`)){
      if(!file.endsWith('.json'))continue;
      const source=readFileSync(`src/content/${chapter}/maps/${file}`,'utf8'),packed=compactTiledMap(source);
      expect(expandTileRuns(JSON.parse(packed)),`${chapter}/${file}`).toEqual(JSON.parse(source));
      originalBytes+=JSON.stringify(JSON.parse(source)).length;packedBytes+=packed.length;maps++;
    }
    expect(maps).toBeGreaterThan(100);
    expect(packedBytes).toBeLessThan(originalBytes*.4);
  });
  it('retains unsigned flipped tile IDs, long runs, zeros and decreasing sequences',()=>{
    const data=[0xffffffff,0x80000001,0,0,0,...Array.from({length:2000},(_,i)=>2000-i),...Array(2000).fill(7)];
    expect(expandTileRuns({layers:[{data:packTileRuns(data)}]}).layers[0].data).toEqual(data);
    expect(expandTileRuns({layers:[{data:[]},{data:[1]}]})).toEqual({layers:[{data:[]},{data:[1]}]});
  });
  it('preserves the complete editor tile catalogue while interning repeated properties',()=>{
    const packed=compactTileCatalog(tilePages),[pages,profiles]=JSON.parse(packed);
    expect(expandTileCatalog(pages,profiles)).toEqual(tilePages);
    expect(packed.length).toBeLessThan(JSON.stringify(tilePages).length*.45);
  });
});
