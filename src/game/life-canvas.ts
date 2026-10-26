import type {ScenePiece} from '../content/scene-art';
import {lifeStep,waterLife,cloudLife} from '../content/map-life';
import {tileWalkable,type TileMap} from '../content/tilemaps';

export interface LifeMasks {water?:Path2D;sky?:Path2D;width:number;height:number}
/** Inspect the static terrain once. Exact authored water colors, conservative
 * 8px blocks and the navigation floor keep ripples off banks and bridges. */
export function lifeMasks(id:string,map:TileMap,flags:Record<string,boolean>,pieces:readonly ScenePiece[],surface:(piece:ScenePiece)=>CanvasImageSource|undefined):LifeMasks|undefined{
 const water=waterLife(id),clouds=cloudLife(id),width=map.width*map.tilewidth,height=map.height*map.tileheight;
 if(!water&&!clouds)return;
 const floor=new Uint8Array(map.width*map.height),sky=clouds?new Path2D():undefined;sky?.rect(0,0,width,height);
 for(let y=0;y<map.height;y++)for(let x=0;x<map.width;x++)if(tileWalkable(map,x,y,{flags})){floor[y*map.width+x]=1;sky?.rect(x*24,y*24,24,24);}
 let wet:Path2D|undefined;
 if(water){
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d',{willReadFrequently:true})!;
  ctx.imageSmoothingEnabled=false;
  for(const p of [...pieces].filter(p=>p.depth<-900).sort((a,b)=>a.depth-b.depth)){
   const image=surface(p);if(!image)return;ctx.drawImage(image,p.x,p.y,p.width,p.height);
  }
  const pixels=ctx.getImageData(0,0,width,height).data,colors=new Set(water.colors),path=new Path2D();let runs=0;
  const color=(x:number,y:number)=>{const i=(y*width+x)*4;return pixels[i+3]>220&&colors.has(pixels[i]*65536+pixels[i+1]*256+pixels[i+2]);};
  for(let y=Math.ceil(water.minY/8)*8;y+8<height;y+=8){
   let start=-1;
   for(let x=0;x<=width;x+=8){
    const valid=x+8<width&&!floor[Math.floor((y+4)/24)*map.width+Math.floor((x+4)/24)]&&color(x+1,y+1)&&color(x+6,y+1)&&color(x+1,y+6)&&color(x+6,y+6);
    if(valid&&start<0)start=x;
    if(!valid&&start>=0){path.rect(start,y,x-start,8);runs++;start=-1;}
   }
  }
  if(runs)wet=path;
 }
 return wet||sky?{water:wet,sky,width,height}:undefined;
}
/** Same native Canvas treatment in the campaign and Maps workshop. */
export function paintMapLife(ctx:CanvasRenderingContext2D,id:string,masks:LifeMasks|undefined,time?:number){
 if(!masks||time===undefined)return;
 const {width,height}=masks,t=lifeStep(time);
 if(masks.sky){
  ctx.save();ctx.clip(masks.sky,'evenodd');ctx.globalAlpha*=.085;ctx.fillStyle='#c1ced0';
  for(let i=0;i<5;i++){
   const x=Math.round(((t*.005+i*389)%(width+500)-350)/2)*2,y=i%2?height-150-i*13:66+i*33;
   ctx.beginPath();ctx.moveTo(x,y+12);ctx.lineTo(x+54,y);ctx.lineTo(x+157,y+2);ctx.lineTo(x+232,y+20);ctx.lineTo(x+181,y+30);ctx.lineTo(x+38,y+27);ctx.closePath();ctx.fill();
  }ctx.restore();
 }
 const water=waterLife(id);
 if(water&&masks.water){
  ctx.save();ctx.clip(masks.water);ctx.strokeStyle=water.ink;ctx.lineWidth=2;
  for(let row=0;row<Math.ceil(height/83);row++)for(let col=0;col<Math.ceil(width/191);col++){
   const n=row*17+col*31,x=Math.round(((col*191+row*53+t*(.009+n%3*.002))%width)/2)*2;
   const y=row*83+28+Math.round(Math.sin(t/2100+n)*2)*2,length=16+n%27;
   ctx.globalAlpha=.09+(Math.sin(t/1700+n)+1)*.05;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+length*.6,y-2);ctx.lineTo(x+length,y);ctx.stroke();
  }ctx.restore();
 }
}
