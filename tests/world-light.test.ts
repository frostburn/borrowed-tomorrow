import { describe, expect, it } from 'vitest';
import { castShadows, lightPixels, lampStrength, stationLight, NIGHT_AMBIENT, type WorldLight } from '../src/game/world-light';

const lamp={x:100,y:100,height:108,radius:235,strength:1.15};
const rig:WorldLight={ambient:NIGHT_AMBIENT,lamps:[lamp]};
// ImageData's data layout is available in Node without introducing a DOM shim.
const pixels=(values:number[])=>({data:new Uint8ClampedArray(values),width:values.length/4,height:1,colorSpace:'srgb'}) as ImageData;
describe('world-space actor lighting',()=>{
  it('casts window shadows inside the painted beams, with no light behind the house',()=>{
    const windows=stationLight([{x:120,y:48,url:'/station-house.svg'}]);
    expect(windows.lamps).toHaveLength(3);
    expect(castShadows(windows,204,283)[0]?.light.beam).toBeDefined();
    expect(castShadows(windows,204,283)[0]!.dy).toBeGreaterThan(0);
    expect(castShadows(windows,204,240)[0]).toBeUndefined();
    expect(castShadows(windows,260,283)[0]).toBeUndefined();
  });
  it('fills the entrance and arrest staging with festival warmth with restrained overlapping shadows',()=>{
    const festival=stationLight([{x:456,y:192,url:'/bunting.svg'}]);
    for(const [x,y] of [[516,403],[492,307],[636,331],[780,283]]){
      expect(festival.lamps.reduce((sum,l)=>sum+lampStrength(l,x,y),0)).toBeGreaterThan(.2);
      expect(castShadows(festival,x,y).length).toBeLessThanOrEqual(3);
    }
  });
  it('retains several sources while bounding count and cumulative darkness',()=>{
    const crowded={...rig,lamps:Array.from({length:8},(_,i)=>({...lamp,x:60+i*12}))};
    const shadows=castShadows(crowded,100,140);
    expect(shadows).toHaveLength(3);
    expect(shadows.reduce((sum,s)=>sum+s.alpha,0)).toBeLessThanOrEqual(.450001);
    expect(new Set(shadows.map(s=>s.dx)).size).toBe(3);
  });
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
    expect(castShadows(rig,60,140)[0]!.dx).toBeLessThan(0);
    expect(castShadows(rig,140,140)[0]!.dx).toBeGreaterThan(0);
    expect(castShadows(rig,100,170)[0]!.dy).toBeGreaterThan(0);
    expect(castShadows(rig,600,600)[0]).toBeUndefined();
    const low={...rig,lamps:[{...lamp,height:40}]};
    expect(Math.abs(castShadows(low,140,140)[0]!.dx)).toBeLessThanOrEqual(105);
  });
});
