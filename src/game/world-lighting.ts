import Phaser from 'phaser';
import { mapSize, TILE, walkable, type MapData } from '../content/maps';
import { visibleSceneArt } from '../content/scene-art';
import type { GameState } from '../rules/state';
import { castShadows, lightPixels, stationLight, type WorldLight } from './world-light';

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
  attach(world:Phaser.GameObjects.Container,map:MapData,state:GameState){
    this.clear();if(map.id!=='station'||!map.tiles)return;
    this.rig=stationLight(visibleSceneArt(map.tiles,state)??[]);
    // One ground pass, clipped to real floor cells, beneath every sorted prop.
    this.ground=new Path2D();const size=mapSize(map);
    for(let y=0;y<size.height/TILE;y++)for(let x=0;x<size.width/TILE;x++)if(walkable(map,x,y,state))this.ground.rect(x*TILE,y*TILE,TILE,TILE);
    world.add(this.scene.add.existing(new GroundShadows(this.scene,this)).setDepth(-900));
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
      if(!actor.active||!actor.visible||!actor.alpha||actor.getData('projection'))continue;
      ctx.save();ctx.globalAlpha*=.18*actor.alpha;ctx.fillStyle='#172038';ctx.beginPath();ctx.ellipse(actor.x,actor.y-2,10*Math.abs(actor.scaleX),3,0,0,Math.PI*2);ctx.fill();ctx.restore();
      for(const cast of castShadows(this.rig,actor.x,actor.y)){
      const frame=this.surface(actor.frame),ox=actor.displayOriginX,oy=actor.displayOriginY;
      // Project the live frame onto the ground from its sole pivot. Flattened
      // silhouettes change direction/length with position and retain the gait.
      ctx.save();ctx.globalAlpha*=cast.alpha*actor.alpha;ctx.translate(actor.x,actor.y-2);
      if(cast.light.beam){
        const light=cast.light,b=light.beam!,x=light.x-actor.x,y=light.y-actor.y+2,far=b.width+b.reach*b.spread;
        ctx.beginPath();ctx.moveTo(x-b.width,y);ctx.lineTo(x+b.width,y);ctx.lineTo(x+b.reach*.1+far,y+b.reach);ctx.lineTo(x+b.reach*.1-far,y+b.reach);ctx.closePath();ctx.clip();
      }
      ctx.transform(1,0,-cast.dx/58,-cast.dy/58,0,0);ctx.rotate(actor.rotation);ctx.scale(actor.scaleX,actor.scaleY);
      ctx.drawImage(frame.shadow,-ox,-oy);ctx.restore();
      }
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
    const frame=src.frame,pose=[Math.round(src.x),Math.round(src.y),src.scaleX,src.scaleY,src.rotation,src.originX,src.originY].join(':');
    if(!src.lit)src.lit=src.scene.textures.createCanvas(`actor-light-${serial++}`,frame.cutWidth,frame.cutHeight)!;
    if(src.lastFrame!==frame||src.lastPose!==pose){
      const pixels=src.worldLighting.surface(frame).pixels;
      if(!src.output||src.output.width!==pixels.width||src.output.height!==pixels.height){src.lit.setSize(pixels.width,pixels.height);src.output=src.lit.context.createImageData(pixels.width,pixels.height);}
      lightPixels(pixels,src.output,src.rig,Math.round(src.x),Math.round(src.y),src.displayOriginX,src.displayOriginY,src.scaleX,src.scaleY,src.rotation);
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
