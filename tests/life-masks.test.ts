import {afterEach,expect,it,vi} from 'vitest';
import {lifeMasks} from '../src/game/life-canvas';
import {MAPS} from '../src/content/maps';

afterEach(()=>vi.unstubAllGlobals());
it('clips cloud and water motion to their own materials, excluding the walking floor',()=>{
 class Mask {
  rectangles:number[][]=[];
  rect(...r:number[]){this.rectangles.push(r);}
  contains(x:number,y:number){return this.rectangles.some(([a,b,w,h])=>x>=a&&x<a+w&&y>=b&&y<b+h);}
 }
 vi.stubGlobal('Path2D',Mask);
 const width=72,height=288,pixels=new Uint8ClampedArray(width*height*4);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const i=(y*width+x)*4,color=y<160?[0x78,0x8e,0x9c]:[0x23,0x42,0x5d];pixels.set([...color,255],i);
 }
 const ctx={drawImage(){},getImageData:()=>({data:pixels})};
 vi.stubGlobal('document',{createElement:()=>({getContext:()=>ctx})});
 const surroundings=Array<number>(36).fill(5),walking=Array<number>(36).fill(0);walking[31]=3;
 const map={...MAPS.coast.tiles!,width:3,height:12,layers:[
  {id:1,name:'Surroundings',type:'tilelayer',visible:true,data:surroundings},
  {id:2,name:'Walking surfaces',type:'tilelayer',visible:true,data:walking},
 ]};
 const masks=lifeMasks('coast',map,{},[],()=>undefined)!;
 const sky=masks.sky as unknown as Mask,water=masks.water as unknown as Mask;
 expect(sky.contains(10,40)).toBe(true);expect(sky.contains(10,250)).toBe(false);
 expect(water.contains(10,250)).toBe(true);expect(water.contains(10,40)).toBe(false);
 expect(water.contains(30,250)).toBe(false);
});
