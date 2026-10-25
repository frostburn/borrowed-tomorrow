import {expect,it} from 'vitest';
import {alignCameraScroll} from '../src/game/raster-camera';
import {snapRasterWithin} from '../src/game/raster';

it('keeps scroll steps on the raster inside odd, fractional and negative bounds',()=>{
 for(const [min,max]of [[0,633],[.5,41.5],[-13,15]] as const){
  for(let value=min-3;value<max+3;value+=.37){
   const result=snapRasterWithin(value,min,max);
   expect(Math.abs(result%2)).toBe(0);expect(result).toBeGreaterThanOrEqual(min);expect(result).toBeLessThanOrEqual(max);
  }
 }
 expect(snapRasterWithin(633,0,633)).toBe(632);
 expect(snapRasterWithin(99,0,0)).toBe(0);
});
it('recomputes aligned bounds after a viewport resize without changing the clamping receiver',()=>{
 const camera={right:633,bottom:191,clampX(x:number){return Math.max(0,Math.min(this.right,x));},clampY(y:number){return Math.max(0,Math.min(this.bottom,y));}};
 alignCameraScroll(camera);
 expect([camera.clampX(221.3),camera.clampY(61.7)]).toEqual([222,62]);
 expect([camera.clampX(999),camera.clampY(999)]).toEqual([632,190]);
 camera.right=649;camera.bottom=167;
 expect([camera.clampX(999),camera.clampY(999)]).toEqual([648,166]);
});
