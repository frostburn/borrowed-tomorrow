import Phaser from 'phaser';
import type {MapData} from '../content/maps';
import {visibleSceneArt,type ScenePiece} from '../content/scene-art';
import {lifePaused,lifeStep,sceneryAngle,swayingScenery} from '../content/map-life';
import {lifeMasks,paintMapLife,type LifeMasks} from './life-canvas';
import type {GameState} from '../rules/state';

/** Low-rate environmental motion, with one shared update listener per map. */
export class MapLife {
 private foliage:{image:Phaser.GameObjects.Image;piece:ScenePiece;x:number;y:number}[]=[];
 private surface?:LifeSurface;
 private masks?:LifeMasks;
 private time?:number;
 private step=-1;
 private dirty=false;
 private enabled:boolean;
 private paint=()=>{
  const next=this.enabled&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches?lifeStep(this.scene.time.now):-1;
  if(next===this.step)return;this.step=next;this.time=next<0?undefined:next;this.dirty=true;
  for(const {image,piece,x,y}of this.foliage)if(image.active)image.setPosition(x,y).setRotation(sceneryAngle(piece,this.time));
 };
 constructor(private scene:Phaser.Scene,world:Phaser.GameObjects.Container,private map:MapData,state:Pick<GameState,'flags'>){
  this.enabled=!lifePaused(map.id,state.flags);
  for(const child of world.list){
   if(!(child instanceof Phaser.GameObjects.Image))continue;
   const piece=child.getData('scene-piece')as ScenePiece|undefined;if(!piece||!swayingScenery(piece))continue;
   const x=piece.x+piece.width/2,y=piece.y+piece.height;
   child.setOrigin(.5,1).setPosition(x,y);this.foliage.push({image:child,piece,x,y});
  }
  if(this.enabled&&map.tiles)this.masks=lifeMasks(map.id,map.tiles,state.flags,visibleSceneArt(map.tiles,state)??[],p=>scene.textures.exists(p.key)?scene.textures.get(p.key).getSourceImage()as CanvasImageSource:undefined);
  if(this.masks){this.surface=scene.add.existing(new LifeSurface(scene,this));world.add(this.surface.setDepth(-999.4));world.sort('depth');}
  if(this.enabled&&(this.foliage.length||this.masks)){this.scene.events.on(Phaser.Scenes.Events.UPDATE,this.paint);this.paint();}
 }
 takeFrame(){const changed=this.dirty;this.dirty=false;return changed;}
 inspect(){return {enabled:this.enabled,frame:this.step,foliage:this.foliage.length,water:!!this.masks?.water,clouds:!!this.masks?.sky};}
 draw(ctx:CanvasRenderingContext2D){paintMapLife(ctx,this.map.id,this.masks,this.time);}
 close(){this.scene.events.off(Phaser.Scenes.Events.UPDATE,this.paint);this.foliage=[];this.masks=undefined;this.surface=undefined;}
}
class LifeSurface extends Phaser.GameObjects.Image {
 constructor(scene:Phaser.Scene,private life:MapLife){super(scene,0,0,'__WHITE');}
 renderCanvas(renderer:Phaser.Renderer.Canvas.CanvasRenderer,src:LifeSurface,camera:Phaser.Cameras.Scene2D.Camera,parentMatrix:Phaser.GameObjects.Components.TransformMatrix){
  camera.addToRenderList(src);const ctx=renderer.currentContext;
  if(Phaser.Renderer.Canvas.SetTransform(renderer,ctx,src,camera,parentMatrix)){src.life.draw(ctx);ctx.restore();}
 }
}
