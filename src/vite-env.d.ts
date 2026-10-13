/// <reference types="vite/client" />
import type { GameState } from './rules/state';
import type { Battle } from './rules/combat';
declare global {
  interface Window {
    borrowedTomorrowPixels:{inspect:()=>{width:number;height:number;physicalScale:number;cssScale:number;physicalLeft:number;physicalTop:number;palette:string[]}};
    borrowedTomorrow: { inspect: () => { mode: string; state: GameState; battle: (Omit<Battle,'obstacles'> & { obstacles: string[] }) | null } };
  }
}
