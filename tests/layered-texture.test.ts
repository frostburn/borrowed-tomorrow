import { expect, it } from 'vitest';
import { renderLayers, type PixelTexture, type SpriteLayer } from '../src/art/layered-sprite';

function quad(depth:number,color:number):SpriteLayer {
  return {id:'patch',vertices:[[40,40],[44,40],[44,44],[40,44]].map(([x,y])=>({x:40-x,y:depth,z:68+depth*.45-y})),
    faces:[{points:[0,1,2,3],color,unlit:true}]};
}
const texture:PixelTexture={width:2,height:2,pixels:new Uint8ClampedArray([255,0,0,255,0,255,0,255,0,0,255,255,0,0,0,0])};
const pixel=(rgba:Uint8ClampedArray,x:number,y:number)=>Array.from(rgba.slice((y*80+x)*4,(y*80+x)*4+4));

it('textured faces copy discrete source colors without blending or recoloring',()=>{
  const layer=quad(1,0xffffff);layer.faces[0].texture=texture;layer.faces[0].uv=[{u:0,v:0},{u:2,v:0},{u:2,v:2},{u:0,v:2}];
  const rgba=renderLayers([layer],'front');
  expect(pixel(rgba,40,40)).toEqual([255,0,0,255]);expect(pixel(rgba,43,40)).toEqual([0,255,0,255]);expect(pixel(rgba,40,43)).toEqual([0,0,255,255]);
});

it('transparent texture pixels leave the far layer visible regardless of draw order',()=>{
  const far=quad(0,0x102030),near=quad(1,0xffffff);near.faces[0].texture=texture;near.faces[0].uv=[{u:0,v:0},{u:2,v:0},{u:2,v:2},{u:0,v:2}];
  for(const layers of [[far,near],[near,far]]){
    const rgba=renderLayers(layers,'front');expect(pixel(rgba,43,43)).toEqual([16,32,48,255]);expect(pixel(rgba,40,40)).toEqual([255,0,0,255]);
  }
});
