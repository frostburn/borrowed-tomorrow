import Phaser from 'phaser';
import { snapRaster } from './raster';

/** Battle labels have translated parents, including fractional hex/motion positions. */
export class PixelLabel extends Phaser.GameObjects.Image {
  private pixelParent=new Phaser.GameObjects.Components.TransformMatrix();

  renderCanvas(renderer:Phaser.Renderer.Canvas.CanvasRenderer,src:Phaser.GameObjects.Image,camera:Phaser.Cameras.Scene2D.Camera,parentMatrix?:Phaser.GameObjects.Components.TransformMatrix){
    const parent=this.pixelParent;
    if(parentMatrix)parent.copyFrom(parentMatrix);else parent.loadIdentity();
    // Align the destination's top-left after parent and camera translation.
    // Only the render matrix changes: movement/tweens keep their exact positions.
    const x=parent.tx+src.x-src.displayOriginX-camera.scrollX*src.scrollFactorX;
    const y=parent.ty+src.y-src.displayOriginY-camera.scrollY*src.scrollFactorY;
    parent.tx+=snapRaster(x)-x;parent.ty+=snapRaster(y)-y;
    camera.addToRenderList(src);
    const round=camera.roundPixels;camera.roundPixels=false;
    // Phaser's roundPixels path expands frames by 0.5px; keep a native 1:1 draw.
    try{renderer.batchSprite(src,src.frame,camera,parent);}finally{camera.roundPixels=round;}
  }
}
