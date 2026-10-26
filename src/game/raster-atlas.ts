import type Phaser from 'phaser';
import {actorArtSkin,actorAtlasPageKey,actorTextureDimensions} from '../content/actor-art-skin';

const prepared=new WeakSet<Phaser.Textures.Texture>();
/** Assemble small PNG pages once, before the existing native frame crops run. */
export function prepareRasterAtlas(scene:Phaser.Scene,texture:Phaser.Textures.Texture){
  const asset=actorTextureDimensions(texture.key);
  if(actorArtSkin()!=='raster'||!asset?.pages||prepared.has(texture))return;
  const canvas=document.createElement('canvas');canvas.width=asset.width;canvas.height=asset.height;
  const ctx=canvas.getContext('2d')!;ctx.imageSmoothingEnabled=false;
  for(const [i,page] of asset.pages.entries()){
    const key=actorAtlasPageKey(texture.key,i);
    if(!scene.textures.exists(key))throw new Error(`Missing raster atlas page ${key}`);
    ctx.drawImage(scene.textures.get(key).getSourceImage() as CanvasImageSource,page.x,page.y,page.width,page.height);
  }
  const source=texture.source[0];source.source=source.image=canvas;source.isCanvas=true;
  source.updateSize(canvas.width,canvas.height);source.update();texture.get('__BASE').setSize(canvas.width,canvas.height);
  texture.setFilter(0);prepared.add(texture);
}
