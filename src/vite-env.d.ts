/// <reference types="vite/client" />
import type { GameState } from './rules/state';
import type { Battle } from './rules/combat';
declare global {
  interface Window {
    borrowedTomorrowPixels:{inspect:()=>{width:number;height:number;physicalScale:number;cssScale:number;physicalLeft:number;physicalTop:number;rasterUnit:number;palette:string[]}};
    borrowedTomorrow: { inspect: () => { mode: string; busy:boolean; moving:boolean; cinematic:string|null; actors:{hero:string;texture:string;frame:string;motion:string;x:number;y:number}[]; people:{id:string;texture:string;alpha:number;x:number;y:number;depth:number;scale:number;originX:number;originY:number;sourceWidth:number;sourceHeight:number;filter:number}[]; view:{width:number;height:number;scrollX:number;scrollY:number;roundPixels:boolean}; state: GameState; battle: (Omit<Battle,'obstacles'|'water'|'vents'> & { obstacles: string[]; water:string[]; vents:string[] }) | null } };
  }
}
