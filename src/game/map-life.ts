import Phaser from 'phaser';
import type {MapData} from '../content/maps';
import {visibleSceneArt,type ScenePiece} from '../content/scene-art';
import {lifePaused,lifeStep,sceneryPose,movingScenery,swayingScenery,steamSources,type SteamSource} from '../content/map-life';
import {lifeMasks,paintMapLife,paintSteam,type LifeMasks} from './life-canvas';
import type {GameState} from '../rules/state';

/** Low-rate environmental motion on the world's clock, with no tweens/timers. */
export class MapLife {
 private scenery:{image:Phaser.GameObjects.Image;piece:ScenePiece;x:number;y:number}[]=[];
 private surfaces:LifeSurface[]=[];
 private steam:SteamSource[]=[];
 private masks?:LifeMasks;
 private time?:number;
 private elapsed=0;
 private step=-1;
 private dirty=false;
 private enabled:boolean;
 private reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 update(delta:number,paused=false){
  if(!this.enabled||!this.scenery.length&&!this.masks&&!this.steam.length)return;
  if(!this.reduced.matches&&paused)return;
  if(!this.reduced.matches)this.elapsed+=Math.min(120,Math.max(0,delta));
  const next=!this.reduced.matches?lifeStep(this.elapsed):-1;
  if(next===this.step)return;this.step=next;this.time=next<0?undefined:next;this.dirty=true;
  for(const {image,piece,x,y}of this.scenery)if(image.active){const pose=sceneryPose(piece,this.time,this.flags);image.setPosition(x+pose.dx,y+pose.dy).setRotation(pose.rotation);}
 }
 private flags:Record<string,boolean>;
 constructor(scene:Phaser.Scene,world:Phaser.GameObjects.Container,private map:MapData,state:Pick<GameState,'flags'>){
  this.flags=state.flags;
  this.enabled=!lifePaused(map.id,state.flags);
  for(const child of world.list){
   if(!(child instanceof Phaser.GameObjects.Image))continue;
   const piece=child.getData('scene-piece')as ScenePiece|undefined;if(!piece||!movingScenery(piece))continue;
   const foliage=swayingScenery(piece),x=piece.x+(foliage?piece.width/2:0),y=piece.y+(foliage?piece.height:0);
   child.setOrigin(foliage ? .5 : 0,foliage ? 1 : 0).setPosition(x,y);this.scenery.push({image:child,piece,x,y});
  }
  const pieces=map.tiles?visibleSceneArt(map.tiles,state)??[]:[];
  if(this.enabled&&map.tiles)this.masks=lifeMasks(map.id,map.tiles,state.flags,pieces,p=>scene.textures.exists(p.key)?scene.textures.get(p.key).getSourceImage()as CanvasImageSource:undefined);
  if(this.enabled)this.steam=steamSources(pieces);
  const surface=(depth:number,draw:(ctx:CanvasRenderingContext2D)=>void)=>{
   const image=scene.add.existing(new LifeSurface(scene,draw));world.add(image.setDepth(depth));this.surfaces.push(image);
  };
  if(this.masks)surface(-999.4,ctx=>paintMapLife(ctx,this.map.id,this.masks,this.time));
  for(const source of this.steam)surface(source.depth,ctx=>paintSteam(ctx,source,this.time));
  world.sort('depth');this.update(0);
 }
 takeFrame(){const changed=this.dirty;this.dirty=false;return changed;}
 inspect(){return {enabled:this.enabled,frame:this.step,foliage:this.scenery.filter(s=>swayingScenery(s.piece)).length,boats:this.scenery.filter(s=>!!s.piece.motion).length,steam:this.steam.length,water:!!this.masks?.water,clouds:!!this.masks?.sky,snow:!!this.masks?.snow};}
 close(){for(const s of this.surfaces)s.destroy();this.surfaces=[];this.scenery=[];this.steam=[];this.masks=undefined;this.enabled=false;this.dirty=false;}
}
class LifeSurface extends Phaser.GameObjects.Image {
 constructor(scene:Phaser.Scene,private draw:(ctx:CanvasRenderingContext2D)=>void){super(scene,0,0,'__WHITE');}
 renderCanvas(renderer:Phaser.Renderer.Canvas.CanvasRenderer,src:LifeSurface,camera:Phaser.Cameras.Scene2D.Camera,parentMatrix:Phaser.GameObjects.Components.TransformMatrix){
  camera.addToRenderList(src);const ctx=renderer.currentContext;
  if(Phaser.Renderer.Canvas.SetTransform(renderer,ctx,src,camera,parentMatrix)){src.draw(ctx);ctx.restore();}
 }
}
