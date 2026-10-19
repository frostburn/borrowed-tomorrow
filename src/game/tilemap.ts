import Phaser from 'phaser';
import { layerVisible, properties, TILESET, TILE_TEXTURE, tileProperties, type TileMap } from '../content/tilemaps';
import type { GameState } from '../rules/state';

/** Native Tiled layers, with foreground props sorted at their ground anchors. */
export function drawTileMap(scene:Phaser.Scene,world:Phaser.GameObjects.Container,data:TileMap,state:GameState,x=0,y=0){
  const key='chapter-one-map';
  scene.cache.tilemap.add(key,{format:Phaser.Tilemaps.Formats.TILED_JSON,data:{...data,tilesets:[{...TILESET,firstgid:1}]}});
  const map=scene.make.tilemap({key}),set=map.addTilesetImage(TILESET.name,TILE_TEXTURE)!;
  let depth=-1000;
  for(const layer of data.layers){
    if(!layer.data||!layerVisible(layer,state))continue;
    if(properties(layer).sort){
      for(let i=0;i<layer.data.length;i++){
        const gid=layer.data[i];if(!gid)continue;
        const xx=i%data.width*data.tilewidth,yy=Math.floor(i/data.width)*data.tileheight;
        const offset=Number(tileProperties[gid-1]?.sortOffset??(tileProperties[gid-1]?.name==='lamp-top'?48:24));
        world.add(scene.add.image(x+xx,y+yy,TILE_TEXTURE,gid-1).setOrigin(0).setDepth(y+yy+offset).setData('tile-prop',true));
      }
    }else world.add(map.createLayer(layer.name,set,x,y)!.setDepth(depth++));
  }
  world.once('destroy',()=>map.destroy());
  world.sort('depth');
}
