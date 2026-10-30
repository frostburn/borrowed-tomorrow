import type {ScenePiece} from '../content/scene-art';
import {lifeStep,waterLife,cloudLife,snowLife,type SteamSource} from '../content/map-life';
import {tileWalkable,type TileMap} from '../content/tilemaps';

export interface LifeMasks {water?:Path2D;sky?:Path2D;snow?:boolean;width:number;height:number}
/** Inspect the static terrain once. Exact authored water colors, conservative
 * 8px blocks and the navigation floor keep ripples off banks and bridges. */
export function lifeMasks(id:string,map:TileMap,flags:Record<string,boolean>,pieces:readonly ScenePiece[],surface:(piece:ScenePiece)=>CanvasImageSource|undefined):LifeMasks|undefined{
 const water=waterLife(id),clouds=cloudLife(id),snow=snowLife(id),width=map.width*map.tilewidth,height=map.height*map.tileheight;
 if(!water&&!clouds&&!snow)return;
 const floor=new Uint8Array(map.width*map.height);
 for(let y=0;y<map.height;y++)for(let x=0;x<map.width;x++)if(tileWalkable(map,x,y,{flags}))floor[y*map.width+x]=1;
 let wet:Path2D|undefined,sky:Path2D|undefined;
 if(water||clouds){
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d',{willReadFrequently:true})!;
  ctx.imageSmoothingEnabled=false;
  for(const p of [...pieces].filter(p=>p.depth<-900&&!p.motion).sort((a,b)=>a.depth-b.depth)){
   const image=surface(p);if(!image)return;ctx.drawImage(image,p.x,p.y,p.width,p.height);
  }
  const pixels=ctx.getImageData(0,0,width,height).data;
  const mask=(palette:readonly number[],minY:number,maxY=height,block=8)=>{
  const colors=new Set(palette),path=new Path2D();let runs=0;
  const color=(x:number,y:number)=>{const i=(y*width+x)*4;return pixels[i+3]>220&&colors.has(pixels[i]*65536+pixels[i+1]*256+pixels[i+2]);};
  for(let y=Math.ceil(minY/block)*block;y+block<=Math.min(maxY,height);y+=block){
   let start=-1;
   for(let x=0;x<=width;x+=block){
    const a=block===2?0:1,b=block===2?1:block-2;
    const valid=x+block<=width&&!floor[Math.floor((y+block/2)/24)*map.width+Math.floor((x+block/2)/24)]&&color(x+a,y+a)&&color(x+b,y+a)&&color(x+a,y+b)&&color(x+b,y+b);
    if(valid&&start<0)start=x;
    if(!valid&&start>=0){path.rect(start,y,x-start,block);runs++;start=-1;}
   }
  }
  return runs?path:undefined;
  };
  if(water)wet=mask(water.colors,water.minY);
  if(clouds)sky=mask(clouds.colors,0,clouds.maxY,2);
 }
 return wet||sky||snow?{water:wet,sky,snow,width,height}:undefined;
}
/** Same native Canvas treatment in the campaign and Maps workshop. */
export function paintMapLife(ctx:CanvasRenderingContext2D,id:string,masks:LifeMasks|undefined,time?:number){
 if(!masks||time===undefined)return;
 const {width,height}=masks,t=lifeStep(time);
 const clouds=cloudLife(id);
 if(masks.sky&&clouds){
  ctx.save();ctx.clip(masks.sky);ctx.globalAlpha*=.13;ctx.fillStyle=clouds.ink;
  for(let i=0;i<5;i++){
   const x=Math.round(((t*(.002+i*.00025)+i*389)%(width+500)-350)/2)*2,y=24+(i*53)%Math.max(40,clouds.maxY-70);
   ctx.beginPath();ctx.moveTo(x,y+12);ctx.lineTo(x+54,y);ctx.lineTo(x+157,y+2);ctx.lineTo(x+232,y+20);ctx.lineTo(x+181,y+30);ctx.lineTo(x+38,y+27);ctx.closePath();ctx.fill();
  }ctx.restore();
 }
 if(masks.snow){
  ctx.save();ctx.fillStyle='#d7e2df';ctx.globalAlpha*=.32;
  for(let i=0;i<24;i++){
   const x=Math.round(((i*137+t*.003)% (width+40)-20)/2)*2,y=Math.round(((i*83+t*(.006+i%3*.001))%530-16)/2)*2;
   ctx.fillRect(x,y,2,i%3===0?4:2);
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

/** Two soft puffs disperse above a real chimney; no particles or timers linger. */
export function paintSteam(ctx:CanvasRenderingContext2D,source:SteamSource,time?:number){
 if(time===undefined)return;
 const t=lifeStep(time);
 ctx.save();ctx.fillStyle='#cad7d3';
 for(let i=0;i<2;i++){
  const age=((t+source.phase+i*3000)%6000)/6000,spread=3+age*11;
  const x=source.x+Math.round(age*9/2)*2,y=source.y-Math.round(age*42/2)*2;
  ctx.globalAlpha=.16*Math.sin(age*Math.PI);
  ctx.beginPath();ctx.moveTo(x-spread,y);ctx.lineTo(x-spread*.7,y-7);ctx.lineTo(x+spread*.4,y-10);ctx.lineTo(x+spread,y-3);ctx.lineTo(x+spread*.6,y+4);ctx.lineTo(x-spread*.5,y+5);ctx.closePath();ctx.fill();
 }ctx.restore();
}
