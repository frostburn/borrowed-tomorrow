import { expect, it } from 'vitest';
import { viewPoint } from '../src/art/actor-skin';
import { renderLayers, type SpriteLayer } from '../src/art/layered-sprite';

const ink=0x100e18,farColor=0x557799,nearColor=0xaa7755;
function panel(id:string,x:number,y:number,w:number,h:number,depth:number,color:number,contour?:SpriteLayer['contour']):SpriteLayer {
  return {id,contour,vertices:[[x,y],[x+w,y],[x+w,y+h],[x,y+h]].map(([sx,sy])=>viewPoint(sx,sy,depth,'front')),
    faces:[{points:[0,1,2,3],color,unlit:true}]};
}
const rgb=(pixels:Uint8ClampedArray,x:number,y:number)=>Array.from(pixels.slice((y*80+x)*4,(y*80+x)*4+3));
const color=(value:number)=>[value>>16&255,value>>8&255,value&255];
const legs=()=>[
  panel('far',30,42,13,23,2,farColor,{group:'far',color:ink,priority:0}),
  panel('near-upper',40,44,11,11,4,nearColor,{group:'near',color:ink,priority:1}),
  panel('near-lower',40,55,11,12,4,nearColor,{group:'near',color:ink,priority:1}),
];

it('leg contours keep one dark overlap edge and join parts of the same leg without a seam',()=>{
  const pixels=renderLayers(legs(),'front');
  expect(rgb(pixels,40,50)).toEqual(color(ink));
  expect(rgb(pixels,39,50)).toEqual(color(farColor));expect(rgb(pixels,41,50)).toEqual(color(nearColor));
  expect(rgb(pixels,45,54)).toEqual(color(nearColor));expect(rgb(pixels,45,55)).toEqual(color(nearColor));
  expect(rgb(pixels,29,50)).toEqual(color(ink));expect(rgb(pixels,51,60)).toEqual(color(ink));
});

it('an occluding ungrouped part hides the leg contour and ordinary layers retain their original outline',()=>{
  const occluder=0xeeddcc,pixels=renderLayers([...legs(),panel('hand',39,48,4,4,8,occluder)],'front');
  expect(rgb(pixels,40,50)).toEqual(color(occluder));expect(rgb(pixels,43,50)).toEqual(color(nearColor));
  expect(rgb(pixels,40,53)).toEqual(color(ink));
  const ordinary=renderLayers([panel('body',30,42,13,23,2,farColor)],'front');
  expect(rgb(ordinary,29,50)).toEqual(color(0x141f27));
});
