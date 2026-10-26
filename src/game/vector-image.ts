import type Phaser from 'phaser';
import { actorTextureDimensions, rasterActorDimensions } from '../content/actor-art-skin';
const decoded = new WeakMap<HTMLImageElement,{url:string;canvas:HTMLCanvasElement}>();

/** Decode art once at its logical size. SVGs retain their declared size;
 * registered raster actors expand by an exact integer with nearest sampling.
 * Canvas renderers otherwise replay SVGs for every cropped tile/frame.
 */
export function vectorSurface(image:HTMLImageElement,logical=rasterActorDimensions(image.src)){
  const cached=decoded.get(image);
  if(cached?.url===image.src&&cached.canvas.width===(logical?.width??image.naturalWidth)&&cached.canvas.height===(logical?.height??image.naturalHeight))return cached.canvas;
  const canvas=document.createElement('canvas');
  canvas.width=logical?.width??image.naturalWidth;canvas.height=logical?.height??image.naturalHeight;
  const ctx=canvas.getContext('2d')!;ctx.imageSmoothingEnabled=false;
  ctx.drawImage(image,0,0,canvas.width,canvas.height);
  decoded.set(image,{url:image.src,canvas});
  return canvas;
}

/** Both skins expose identical logical sizes, frame crops and lighting masks. */
export function prepareArtTexture(texture:Phaser.Textures.Texture,logical=actorTextureDimensions(texture.key)){
  for(const source of texture.source)if(source.image instanceof HTMLImageElement){
    // Phaser's XHR loader uses a blob: URL, so the image URL alone cannot
    // identify a raster actor. Resolve its logical dimensions by texture key.
    const canvas=vectorSurface(source.image,logical);
    source.source=source.image=canvas;source.isCanvas=true;
    source.updateSize(canvas.width,canvas.height);source.update();
    texture.get('__BASE').setSize(canvas.width,canvas.height);
  }
  texture.setFilter(0);return texture;
}
