import {it,expect} from 'vitest';
import {cells,toPixel,fromPixel,hexVertices,DIRECTIONS,add} from '../src/rules/hex';
it('tiles with shared edges and complete chunky vertices, including inset borders',()=>{
 for(const h of cells()){
  const center=toPixel(h);expect(center.x%2).toBe(0);expect(center.y%2).toBe(0);
  for(const inset of [0,2,4,6,8])for(const p of hexVertices(h,inset)){expect(p.x%2).toBe(0);expect(p.y%2).toBe(0);}
  const points=hexVertices(h);
  for(const d of DIRECTIONS){const other=hexVertices(add(h,d));expect(points.filter(p=>other.some(o=>o.x===p.x&&o.y===p.y))).toHaveLength(2);}
  for(const p of points)expect(fromPixel(center.x+(p.x-center.x)*.99,center.y+(p.y-center.y)*.99)).toEqual(h);
 }
});
