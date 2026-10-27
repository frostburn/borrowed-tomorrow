import { properties, tileWalkable, type TileMap } from '../content/tilemaps';
import { visibleSceneArt, type ScenePiece } from '../content/scene-art';
import { castShadows, type WorldLight } from './world-light';

/** Visible raised planes, with later floor surfaces cut out in paint order. */
export function foregroundSurface(map:TileMap,state:{flags:Record<string,boolean>},image:(piece:ScenePiece)=>CanvasImageSource|undefined){
  const pieces=visibleSceneArt(map,state);
  if(!pieces?.some(p=>map.layers.some(l=>l.id===p.layerId&&properties(l).shadowOccluder)))return;
  const mask=document.createElement('canvas');mask.width=map.width*map.tilewidth;mask.height=map.height*map.tileheight;
  const m=mask.getContext('2d')!;m.imageSmoothingEnabled=false;
  for(const piece of [...pieces!].sort((a,b)=>a.depth-b.depth)){
    const layer=map.layers.find(l=>l.id===piece.layerId)!;
    // Sorted props already cover the shadow pass. Ground light is an overlay,
    // not a surface that reveals or hides a rock silhouette.
    if(properties(layer).sort||piece.depth>=-900||piece.url.includes('/light-'))continue;
    const source=image(piece);if(!source)continue;
    m.globalCompositeOperation=properties(layer).shadowOccluder?'source-over':'destination-out';
    m.drawImage(source,piece.x,piece.y,piece.width,piece.height);
  }
  return mask;
}

export function lightGround(map:TileMap,state:{flags:Record<string,boolean>},image?:(piece:ScenePiece)=>CanvasImageSource|undefined){
  const ground=new Path2D();
  for(let y=0;y<map.height;y++)for(let x=0;x<map.width;x++)if(tileWalkable(map,x,y,state))ground.rect(x*map.tilewidth,y*map.tileheight,map.tilewidth,map.tileheight);
  if(!image)return ground;
  const mask=foregroundSurface(map,state,image);if(!mask)return ground;
  const canvas=document.createElement('canvas');canvas.width=map.width*map.tilewidth;canvas.height=map.height*map.tileheight;
  const ctx=canvas.getContext('2d',{willReadFrequently:true})!;ctx.fillStyle='white';ctx.fill(ground);
  ctx.globalCompositeOperation='destination-out';ctx.drawImage(mask,0,0);
  const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data,result=new Path2D();
  for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;){
    if(pixels[(y*canvas.width+x)*4+3]!==255){x++;continue;}
    const start=x;while(x<canvas.width&&pixels[(y*canvas.width+x)*4+3]===255)x++;
    result.rect(start,y,x-start,1);
  }
  return result;
}
export interface ShadowActor { x:number;y:number;originX:number;originY:number;scaleX:number;scaleY:number;rotation:number;alpha:number;image:CanvasImageSource }
/** Ground-space drawing shared by live actors and the Maps workshop. */
export function paintActorShadow(ctx:CanvasRenderingContext2D,rig:WorldLight,actor:ShadowActor){
  ctx.save();ctx.globalAlpha*=Math.min(.18,rig.shadowOpacity??.18)*actor.alpha;ctx.fillStyle='#172038';ctx.beginPath();ctx.ellipse(actor.x,actor.y-2,10*Math.abs(actor.scaleX),3,0,0,Math.PI*2);ctx.fill();ctx.restore();
  for(const cast of castShadows(rig,actor.x,actor.y)){
    ctx.save();ctx.globalAlpha*=cast.alpha*actor.alpha;ctx.translate(actor.x,actor.y-2);
    if(cast.light.beam){
      const light=cast.light,b=cast.light.beam,x=light.x-actor.x,y=light.y-actor.y+2,far=b.width+b.reach*b.spread;
      ctx.beginPath();ctx.moveTo(x-b.width,y);ctx.lineTo(x+b.width,y);ctx.lineTo(x+b.reach*.1+far,y+b.reach);ctx.lineTo(x+b.reach*.1-far,y+b.reach);ctx.closePath();ctx.clip();
    }
    ctx.transform(1,0,-cast.dx/58,-cast.dy/58,0,0);ctx.rotate(actor.rotation);ctx.scale(actor.scaleX,actor.scaleY);
    ctx.drawImage(actor.image,-actor.originX,-actor.originY);ctx.restore();
  }
}
