import type Phaser from 'phaser';
import { snapRasterWithin } from './raster';

/** Install once when the scene creates its bounded main camera.
 * Phaser clamps after follow/pan calculation and before building the view matrix.
 * Snapping here keeps rendering, worldView and pointer coordinates in agreement.
 */
export function alignCameraScroll(camera:Pick<Phaser.Cameras.Scene2D.Camera,'clampX'|'clampY'>){
  const aligned=(clamp:(value:number)=>number)=>(value:number)=>snapRasterWithin(clamp(value),clamp(-Infinity),clamp(Infinity));
  camera.clampX=aligned(camera.clampX.bind(camera));
  camera.clampY=aligned(camera.clampY.bind(camera));
}
