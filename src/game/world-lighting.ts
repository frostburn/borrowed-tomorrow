import Phaser from 'phaser';
import { properties, type TileMap } from '../content/tilemaps';
import { visibleSceneArt } from '../content/scene-art';
import type { GameState } from '../rules/state';
import { lightPixels, chapterOneLight, type WorldLight } from './world-light';
import { lightGround, paintActorShadow } from './light-canvas';

let serial=0;
interface FrameSurface { pixels:ImageData; shadow:HTMLCanvasElement }

/** Canvas-only lighting. Maps opt in; neither source textures nor actor poses change. */
export class WorldLighting {
  private rig?:WorldLight;
  private ground?:Path2D;
  private actors=new Set<LitActor>();
  private frames=new WeakMap<Phaser.Textures.Frame,FrameSurface>();
  constructor(private scene:Phaser.Scene){}
  clear(){this.rig=undefined;this.ground=undefined;this.actors.clear();this.frames=new WeakMap();}
  attach(world:Phaser.GameObjects.Container,map:TileMap|undefined,state:Pick<GameState,'flags'>){
    this.clear();if(!map)return;
    this.rig=chapterOneLight(String(properties(map).sceneArt),visibleSceneArt(map,state)??[]);if(!this.rig)return;
    // One ground pass, clipped to real floor cells, beneath every sorted prop.
    this.ground=lightGround(map,state);
    world.add(this.scene.add.existing(new GroundShadows(this.scene,this)).setDepth(-900));
    world.sort('depth');
  }
  actor(world:Phaser.GameObjects.Container,x:number,y:number,key:string){
    const image=this.rig?this.scene.add.existing(new LitActor(this.scene,x,y,key,this,this.rig)):this.scene.add.image(x,y,key);
    if(image instanceof LitActor){this.actors.add(image);image.once('destroy',()=>this.actors.delete(image));}
    world.add(image);return image;
  }
  surface(frame:Phaser.Textures.Frame){
    let cached=this.frames.get(frame);if(cached)return cached;
    const canvas=document.createElement('canvas');canvas.width=frame.cutWidth;canvas.height=frame.cutHeight;
    const ctx=canvas.getContext('2d',{willReadFrequently:true})!;ctx.imageSmoothingEnabled=false;
    ctx.drawImage(frame.source.image as CanvasImageSource,frame.cutX,frame.cutY,frame.cutWidth,frame.cutHeight,0,0,canvas.width,canvas.height);
    const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);
    ctx.globalCompositeOperation='source-in';ctx.fillStyle='#172038';ctx.fillRect(0,0,canvas.width,canvas.height);
    cached={pixels,shadow:canvas};this.frames.set(frame,cached);return cached;
  }
  shadows(ctx:CanvasRenderingContext2D){
    if(!this.rig||!this.ground)return;
    ctx.save();ctx.clip(this.ground);ctx.imageSmoothingEnabled=false;
    for(const actor of this.actors){
      if(!actor.active||!actor.visible||!actor.alpha||actor.getData('projection')||actor.getData('fallen'))continue;
      paintActorShadow(ctx,this.rig,{x:actor.x,y:actor.y,originX:actor.displayOriginX,originY:actor.displayOriginY,scaleX:actor.scaleX*(actor.flipX?-1:1),scaleY:actor.scaleY*(actor.flipY?-1:1),rotation:actor.rotation,alpha:actor.alpha,image:this.surface(actor.frame).shadow});
    }
    ctx.restore();
  }
}

class LitActor extends Phaser.GameObjects.Image {
  private lit?:Phaser.Textures.CanvasTexture;
  private output?:ImageData;
  private lastFrame?:Phaser.Textures.Frame;
  private lastPose='';
  constructor(scene:Phaser.Scene,x:number,y:number,key:string,private worldLighting:WorldLighting,private rig:WorldLight){
    super(scene,x,y,key);
    this.once('destroy',()=>{if(this.lit){scene.textures.remove(this.lit.key);this.lit=undefined;}this.output=undefined;});
  }
  renderCanvas(renderer:Phaser.Renderer.Canvas.CanvasRenderer,src:LitActor,camera:Phaser.Cameras.Scene2D.Camera,parentMatrix:Phaser.GameObjects.Components.TransformMatrix){
    camera.addToRenderList(src);
    const frame=src.frame,pose=[Math.round(src.x),Math.round(src.y),src.scaleX,src.scaleY,src.rotation,src.originX,src.originY,src.flipX,src.flipY].join(':');
    if(!src.lit){src.lit=src.scene.textures.createCanvas(`actor-light-${serial++}`,frame.cutWidth,frame.cutHeight)!;src.lit.setFilter(Phaser.Textures.FilterMode.NEAREST);}
    if(src.lastFrame!==frame||src.lastPose!==pose){
      const pixels=src.worldLighting.surface(frame).pixels;
      if(!src.output||src.output.width!==pixels.width||src.output.height!==pixels.height){src.lit.setSize(pixels.width,pixels.height);src.output=src.lit.context.createImageData(pixels.width,pixels.height);}
      lightPixels(pixels,src.output,src.rig,Math.round(src.x),Math.round(src.y),src.displayOriginX,src.displayOriginY,src.scaleX*(src.flipX?-1:1),src.scaleY*(src.flipY?-1:1),src.rotation);
      src.lit.context.putImageData(src.output,0,0);src.lastFrame=frame;src.lastPose=pose;
    }
    // batchSprite accepts a different frame: keep the original animation texture,
    // frame, origin, alpha and handedness on the actor itself.
    const round=camera.roundPixels;camera.roundPixels=false;
    try{renderer.batchSprite(src,src.lit.get(),camera,parentMatrix);}finally{camera.roundPixels=round;}
  }
}

class GroundShadows extends Phaser.GameObjects.Image {
  constructor(scene:Phaser.Scene,private worldLighting:WorldLighting){super(scene,0,0,'__WHITE');}
  renderCanvas(renderer:Phaser.Renderer.Canvas.CanvasRenderer,src:GroundShadows,camera:Phaser.Cameras.Scene2D.Camera,parentMatrix:Phaser.GameObjects.Components.TransformMatrix){
    camera.addToRenderList(src);const ctx=renderer.currentContext;
    if(Phaser.Renderer.Canvas.SetTransform(renderer,ctx,src,camera,parentMatrix)){src.worldLighting.shadows(ctx);ctx.restore();}
  }
}
