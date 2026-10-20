import Phaser from 'phaser';
import { layerVisible, properties, TILESET, tilePages, tileFrame, tileProperties, type TileMap } from '../content/tilemaps';
import type { GameState } from '../rules/state';

// Phaser's rounded Canvas Image path expands destination frames by 0.5px.
// Keep its rounded camera transform while drawing native prop frames at 1:1.
class NativeTile extends Phaser.GameObjects.Image {
  renderCanvas(renderer:Phaser.Renderer.Canvas.CanvasRenderer,src:Phaser.GameObjects.Image,camera:Phaser.Cameras.Scene2D.Camera,parentMatrix:Phaser.GameObjects.Components.TransformMatrix){
    camera.addToRenderList(src);const round=camera.roundPixels;camera.roundPixels=false;
    try{renderer.batchSprite(src,src.frame,camera,parentMatrix);}finally{camera.roundPixels=round;}
  }
}

/** Native Tiled layers, with foreground props sorted at their ground anchors. */
export function drawTileMap(scene:Phaser.Scene,world:Phaser.GameObjects.Container,data:TileMap,state:GameState,x=0,y=0){
  const key='world-map',pages=tilePages(data);
  scene.cache.tilemap.add(key,{format:Phaser.Tilemaps.Formats.TILED_JSON,data:{...data,layers:data.layers.filter(l=>l.data&&!properties(l).sort&&layerVisible(l,state)),tilesets:pages.map(({source,url,...page})=>({...page,tiles:TILESET.tiles.slice(page.firstgid-1,page.firstgid-1+page.tilecount).map(t=>({...t,id:t.id-page.firstgid+1}))}))}});
  const map=scene.make.tilemap({key,insertNull:true}),sets=pages.map(page=>map.addTilesetImage(page.name,page.name)!);
  let depth=-1000;
  for(const layer of data.layers){
    if(!layer.data||!layerVisible(layer,state))continue;
    if(properties(layer).sort){
      for(let i=0;i<layer.data.length;i++){
        const gid=layer.data[i];if(!gid||tileProperties[gid-1]?.empty)continue;
        const xx=i%data.width*data.tilewidth,yy=Math.floor(i/data.width)*data.tileheight;
        const offset=Number(tileProperties[gid-1]?.sortOffset??24);
        const frame=tileFrame(gid);
        const prop=new NativeTile(scene,x+xx,y+yy,frame.key,frame.frame).setOrigin(0).setDepth(y+yy+offset).setData('tile-prop',true);
        scene.add.existing(prop);world.add(prop);
      }
    }else world.add(map.createLayer(layer.name,sets,x,y)!.setDepth(depth++));
  }
  world.once('destroy',()=>map.destroy());
  world.sort('depth');
}
