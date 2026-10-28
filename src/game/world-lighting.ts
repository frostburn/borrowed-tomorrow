import Phaser from 'phaser';
import { worldActorScaleY } from '../content/actors';
import { properties, type TileMap } from '../content/tilemaps';
import { visibleSceneArt } from '../content/scene-art';
import type { GameState } from '../rules/state';
import { lightPixels, sceneLight, type WorldLight, type SceneIllumination } from './world-light';
import { lightGround, paintActorShadow } from './light-canvas';

let serial=0;
interface FrameSurface { pixels:ImageData; shadow:HTMLCanvasElement }

/** Canvas-only lighting. Maps opt in; neither source textures nor actor poses change. */
export class WorldLighting {
  private rig?:WorldLight;
  private ground?:Path2D;
  private actors=new Set<Phaser.GameObjects.Image>();
  private sample?:()=>WorldLight;
  private floorLight=false;
  private frames=new WeakMap<Phaser.Textures.Frame,FrameSurface>();
  constructor(private scene:Phaser.Scene){}
  current(){return this.sample?.()??this.rig;}
  clear(){this.sample=undefined;this.floorLight=false;this.rig=undefined;this.ground=undefined;this.actors.clear();this.frames=new WeakMap();}
  attach(world:Phaser.GameObjects.Container,map:TileMap|undefined,state:Pick<GameState,'flags'>,illumination?:SceneIllumination){
    this.clear();if(!map&&!illumination)return;
    this.sample=illumination?.sample;this.floorLight=!!illumination?.floorLight;
    this.rig=this.sample?.()??sceneLight(illumination?.scene??String(properties(map!).sceneArt),map?visibleSceneArt(map,state)??[]:[]);if(!this.rig)return;
    // One ground pass, clipped to real floor cells, beneath every sorted prop.
    this.ground=illumination?new Path2D(illumination.ground):lightGround(map!,state,p=>this.scene.textures.getFrame(p.key).source.image as CanvasImageSource);
    world.add(this.scene.add.existing(new GroundShadows(this.scene,this)).setDepth(-900));
    world.sort('depth');
  }
  actor(world:Phaser.GameObjects.Container,x:number,y:number,key:string){
    const image=this.illuminate(this.scene.add.image(x,y,key),true);
    image.setScale(1,worldActorScaleY(key));world.add(image);return image;
  }
  /** Keep the original image, animation frames and alpha-picking surface. */
  illuminate(image:Phaser.GameObjects.Image,shadow=false){
    if(!this.current())return image;
    const surface=new LitSurface(this.scene,this);
    Object.assign(image,{renderCanvas:surface.renderCanvas.bind(surface)});
    if(shadow)this.actors.add(image);
    image.once('destroy',()=>{surface.destroy();this.actors.delete(image);});
    return image;
  }
  /** Above scenery/grid, below actors, attack effects and labels. */
  focus(world:Phaser.GameObjects.Container){
    if(this.sample)world.add(this.scene.add.existing(new AttackFocus(this.scene,this)));
  }
  spotlight(ctx:CanvasRenderingContext2D){
    const focus=this.current()?.focus;if(!focus)return;
    const lit=new Path2D();
    for(const points of focus.polygons){
      lit.moveTo(points[0].x,points[0].y);for(const p of points.slice(1))lit.lineTo(p.x,p.y);lit.closePath();
    }
    const shade=new Path2D();shade.rect(0,0,1024,768);shade.addPath(lit);
    ctx.save();ctx.fillStyle=`rgba(7,12,24,${focus.strength})`;ctx.fill(shade,'evenodd');
    // Exact hex-shaped apertures: no glow bleeds into safe neighboring cells.
    ctx.fillStyle=`rgba(255,225,160,${focus.strength*.18})`;ctx.fill(lit);ctx.restore();
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
    const rig=this.current();if(!rig||!this.ground)return;
    ctx.save();ctx.clip(this.ground);ctx.imageSmoothingEnabled=false;
    if(this.floorLight){
      ctx.globalCompositeOperation='multiply';ctx.fillStyle=`rgb(${(rig.groundAmbient??rig.ambient).map(n=>Math.round(Math.min(1,n)*255)).join(',')})`;ctx.fillRect(0,0,1024,768);
      ctx.globalCompositeOperation='screen';
      for(const light of rig.lamps){
        const radius=light.radius*.65,color=(light.color??[1,.8,.5]).map(n=>Math.round(Math.min(1,n)*220));
        ctx.save();ctx.translate(light.x,light.y);ctx.scale(1,.55);
        const glow=ctx.createRadialGradient(0,0,0,0,0,radius),alpha=Math.min(.38,light.strength*.24)*(light.spill??1);
        glow.addColorStop(0,`rgba(${color.join(',')},${alpha})`);glow.addColorStop(.45,`rgba(${color.join(',')},${alpha*.28})`);glow.addColorStop(1,`rgba(${color.join(',')},0)`);
        ctx.fillStyle=glow;ctx.fillRect(-radius,-radius,radius*2,radius*2);ctx.restore();
      }
      ctx.globalCompositeOperation='source-over';
    }
    for(const actor of this.actors){
      if(!actor.active||!actor.visible||!actor.alpha||actor.getData('projection')||actor.getData('fallen'))continue;
      paintActorShadow(ctx,rig,{x:actor.x,y:actor.y,originX:actor.displayOriginX,originY:actor.displayOriginY,scaleX:actor.scaleX*(actor.flipX?-1:1),scaleY:actor.scaleY*(actor.flipY?-1:1),rotation:actor.rotation,alpha:actor.alpha,image:this.surface(actor.frame).shadow});
    }
    ctx.restore();
  }
}

class LitSurface {
  private lit?:Phaser.Textures.CanvasTexture;
  private output?:ImageData;
  private lastFrame?:Phaser.Textures.Frame;
  private lastPose='';
  private lastRig?:WorldLight;
  constructor(private scene:Phaser.Scene,private worldLighting:WorldLighting){}
  destroy(){if(this.lit){this.scene.textures.remove(this.lit.key);this.lit=undefined;}this.output=undefined;}
  renderCanvas(renderer:Phaser.Renderer.Canvas.CanvasRenderer,src:Phaser.GameObjects.Image,camera:Phaser.Cameras.Scene2D.Camera,parentMatrix:Phaser.GameObjects.Components.TransformMatrix){
    camera.addToRenderList(src);
    const rig=this.worldLighting.current();if(!rig)return;
    const frame=src.frame,pose=[Math.round(src.x),Math.round(src.y),src.scaleX,src.scaleY,src.rotation,src.originX,src.originY,src.flipX,src.flipY].join(':');
    if(!this.lit){this.lit=src.scene.textures.createCanvas(`actor-light-${serial++}`,frame.cutWidth,frame.cutHeight)!;this.lit.setFilter(Phaser.Textures.FilterMode.NEAREST);}
    if(this.lastFrame!==frame||this.lastPose!==pose||this.lastRig!==rig){
      const pixels=this.worldLighting.surface(frame).pixels;
      if(!this.output||this.output.width!==pixels.width||this.output.height!==pixels.height){this.lit.setSize(pixels.width,pixels.height);this.output=this.lit.context.createImageData(pixels.width,pixels.height);}
      lightPixels(pixels,this.output,rig,Math.round(src.x),Math.round(src.y),src.displayOriginX,src.displayOriginY,src.scaleX*(src.flipX?-1:1),src.scaleY*(src.flipY?-1:1),src.rotation);
      this.lit.context.putImageData(this.output,0,0);this.lastFrame=frame;this.lastPose=pose;this.lastRig=rig;
    }
    // batchSprite accepts a different frame: keep the original animation texture,
    // frame, origin, alpha and handedness on the actor itself.
    const round=camera.roundPixels;camera.roundPixels=false;
    try{renderer.batchSprite(src,this.lit.get(),camera,parentMatrix);}finally{camera.roundPixels=round;}
  }
}

class GroundShadows extends Phaser.GameObjects.Image {
  constructor(scene:Phaser.Scene,private worldLighting:WorldLighting){super(scene,0,0,'__WHITE');}
  renderCanvas(renderer:Phaser.Renderer.Canvas.CanvasRenderer,src:GroundShadows,camera:Phaser.Cameras.Scene2D.Camera,parentMatrix:Phaser.GameObjects.Components.TransformMatrix){
    camera.addToRenderList(src);const ctx=renderer.currentContext;
    if(Phaser.Renderer.Canvas.SetTransform(renderer,ctx,src,camera,parentMatrix)){this.worldLighting.shadows(ctx);ctx.restore();}
  }
}

class AttackFocus extends Phaser.GameObjects.Image {
  constructor(scene:Phaser.Scene,private worldLighting:WorldLighting){super(scene,0,0,'__WHITE');}
  renderCanvas(renderer:Phaser.Renderer.Canvas.CanvasRenderer,src:AttackFocus,camera:Phaser.Cameras.Scene2D.Camera,parentMatrix:Phaser.GameObjects.Components.TransformMatrix){
    camera.addToRenderList(src);const ctx=renderer.currentContext;
    if(Phaser.Renderer.Canvas.SetTransform(renderer,ctx,src,camera,parentMatrix)){this.worldLighting.spotlight(ctx);ctx.restore();}
  }
}
