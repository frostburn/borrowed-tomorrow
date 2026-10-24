import { describe, expect, it } from 'vitest';
import { castShadow, lightPixels, lampStrength, NIGHT_AMBIENT, type WorldLight } from '../src/game/world-light';

const lamp={x:100,y:100,height:108,radius:235,strength:1.15};
const rig:WorldLight={ambient:NIGHT_AMBIENT,lamps:[lamp]};
// ImageData's data layout is available in Node without introducing a DOM shim.
const pixels=(values:number[])=>({data:new Uint8ClampedArray(values),width:values.length/4,height:1,colorSpace:'srgb'}) as ImageData;
describe('world-space actor lighting',()=>{
  it('preserves native dimensions, exact alpha and the source when shading',()=>{
    const source=pixels([150,100,80,255,80,90,100,117,0,0,0,0]),before=source.data.slice(),output=pixels(Array(12).fill(0));
    lightPixels(source,output,rig,150,130,1,60);
    expect([...output.data].filter((_,i)=>i%4===3)).toEqual([255,117,0]);
    expect(source.data).toEqual(before);expect(output.data.length).toBe(source.data.length);
    expect([...output.data.slice(8)]).toEqual([0,0,0,0]);
  });
  it('warms and brightens a nearby actor, returns to cool ambient beyond the radius',()=>{
    const source=pixels([140,140,140,255]),near=pixels([0,0,0,0]),far=pixels([0,0,0,0]);
    lightPixels(source,near,rig,115,115,0,60);lightPixels(source,far,rig,600,600,0,60);
    expect([...far.data]).toEqual([87,98,123,255]);
    expect(near.data[0]).toBeGreaterThan(far.data[0]+30);
    expect(near.data[0]/near.data[2]).toBeGreaterThan(far.data[0]/far.data[2]);
    expect(lampStrength(lamp,600,600)).toBe(0);
  });
  it('casts away from the lamp on both sides, stays bounded and fades out',()=>{
    expect(castShadow(rig,60,140)!.dx).toBeLessThan(0);
    expect(castShadow(rig,140,140)!.dx).toBeGreaterThan(0);
    expect(castShadow(rig,100,170)!.dy).toBeGreaterThan(0);
    expect(castShadow(rig,600,600)).toBeUndefined();
    const low={...rig,lamps:[{...lamp,height:40}]};
    expect(Math.abs(castShadow(low,140,140)!.dx)).toBeLessThanOrEqual(105);
  });
});
