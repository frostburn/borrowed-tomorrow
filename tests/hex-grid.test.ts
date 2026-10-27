import {it,expect} from 'vitest';
import {blast,cells,offset,neighbors} from '../src/rules/hex';
import {gridEdges,type HexOutline} from '../src/game/hex-grid';
it('draws all interior and boundary edges once with the same weight',()=>{
 const edges=gridEdges(cells().map(hex=>({hex,color:1,width:1,priority:0})));
 expect(edges).toHaveLength(266);expect(new Set(edges.map(e=>JSON.stringify([e.a,e.b]))).size).toBe(266);
 expect(edges.every(e=>e.width===2)).toBe(true);
});
it('resolves highlighted shared edges independently of drawing order',()=>{
 const styles:HexOutline[]=[{hex:offset(0,0),color:1,width:1,priority:0},{hex:offset(1,0),color:2,width:2,priority:9}];
 const a=gridEdges(styles),b=gridEdges([...styles].reverse());
 expect(a).toHaveLength(11);expect(a.find(e=>e.a.x===190&&e.b.x===190)?.color).toBe(2);
 expect(a.sort((a,b)=>JSON.stringify(a.a).localeCompare(JSON.stringify(b.a)))).toEqual(b.sort((a,b)=>JSON.stringify(a.a).localeCompare(JSON.stringify(b.a))));
});

it('merges outer and inner aura boundaries into the same edge network without duplicating strokes',()=>{
 const base=cells().map(hex=>({hex,color:1,width:2,priority:0}));
 for(const [area,count]of [[blast(offset(5,3)),18],[neighbors(offset(5,3)),24]]as const){
  const edges=gridEdges(base,[area.map(hex=>({hex,color:9,width:2,priority:4}))]);
  expect(edges).toHaveLength(266);expect(edges.filter(e=>e.color===9)).toHaveLength(count);
  expect(new Set(edges.map(e=>JSON.stringify([e.a,e.b]))).size).toBe(266);
 }
});
