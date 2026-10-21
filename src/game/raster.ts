/** One screen pixel is a 2×2 game-space square, for text and artwork alike. */
export const RASTER_UNIT = 2;
export const snapRaster = (value:number) => Math.round(value/RASTER_UNIT)*RASTER_UNIT;

export function rasterize(source:HTMLCanvasElement,target:HTMLCanvasElement,unit=RASTER_UNIT){
  const width=Math.ceil(source.width/unit),height=Math.ceil(source.height/unit);
  if(target.width!==width||target.height!==height){target.width=width;target.height=height;}
  const ctx=target.getContext('2d')!;ctx.imageSmoothingEnabled=false;
  ctx.clearRect(0,0,width,height);ctx.drawImage(source,0,0,width*unit,height*unit,0,0,width,height);
}
