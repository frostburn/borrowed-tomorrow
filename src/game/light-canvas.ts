import { tileWalkable, type TileMap } from '../content/tilemaps';
import { castShadows, type WorldLight } from './world-light';

export function lightGround(map:TileMap,state:{flags:Record<string,boolean>}){
  const ground=new Path2D();
  for(let y=0;y<map.height;y++)for(let x=0;x<map.width;x++)if(tileWalkable(map,x,y,state))ground.rect(x*map.tilewidth,y*map.tileheight,map.tilewidth,map.tileheight);
  return ground;
}
export interface ShadowActor { x:number;y:number;originX:number;originY:number;scaleX:number;scaleY:number;rotation:number;alpha:number;image:CanvasImageSource }
/** Ground-space drawing shared by live actors and the Maps workshop. */
export function paintActorShadow(ctx:CanvasRenderingContext2D,rig:WorldLight,actor:ShadowActor){
  ctx.save();ctx.globalAlpha*=.18*actor.alpha;ctx.fillStyle='#172038';ctx.beginPath();ctx.ellipse(actor.x,actor.y-2,10*Math.abs(actor.scaleX),3,0,0,Math.PI*2);ctx.fill();ctx.restore();
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
