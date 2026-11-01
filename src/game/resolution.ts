/** Stable game-space layout; sprite sources may be filtered to their authored display size. */
export const DESKTOP_WIDTH = 1024;
export const DISPLAY_HEIGHT = 768;
export const WORLD_VIEW_WIDTH = 1008;
export const WORLD_VIEW_HEIGHT = 480;
export const PHONE_HEADER = 40, PHONE_TURNS = 24, PHONE_FOOTER = 16;
export interface Insets {left:number;right:number;top:number;bottom:number}
const even=(n:number)=>Math.floor(n/2)*2;
const compactViewport=(width:number,height:number)=>width<DESKTOP_WIDTH||height<600;
/** Controls stay at CSS scale 1. Portrait gives the world a half-scale stage
 * above them; desktop and landscape retain their established composition. */
export function layoutForViewport(width:number,height:number,insets:Insets={left:0,right:0,top:0,bottom:0}){
 const compact=compactViewport(width,height);
 const w=compact?even(width-insets.left-insets.right):DESKTOP_WIDTH;
 const h=compact?even(height-insets.top-insets.bottom):DISPLAY_HEIGHT;
 const portrait=compact&&height>width,header=portrait?72:PHONE_HEADER;
 const sidebar=compact&&!portrait?Math.min(288,even(w*.38)):0;
 const worldScale=portrait?.5:1;
 const stageHeight=portrait?even(Math.min(240,Math.max(104,h-header-PHONE_TURNS-PHONE_FOOTER-(h<700?336:370)))):h-header-PHONE_TURNS-PHONE_FOOTER;
 return {compact,portrait,width:w,height:h,sidebar,header,stageHeight,worldScale,
  view:{width:compact?(w-sidebar)/worldScale:WORLD_VIEW_WIDTH,height:compact?stageHeight/worldScale:WORLD_VIEW_HEIGHT},insets};
}
export function screenLayout(){
 const probe=typeof document==='undefined'?null:document.getElementById('screen-insets'),s=probe?getComputedStyle(probe):undefined;
 const n=(v:string|undefined)=>Number.parseFloat(v??'0')||0;
 return layoutForViewport(window.innerWidth,window.innerHeight??DISPLAY_HEIGHT,{left:n(s?.paddingLeft),right:n(s?.paddingRight),top:n(s?.paddingTop),bottom:n(s?.paddingBottom)});
}
export function narrowScreen() { return compactViewport(window.innerWidth,window.innerHeight); }
export function portraitScreen() { return narrowScreen()&&window.innerHeight>window.innerWidth; }
export function displayWidth() { return screenLayout().width; }
export function worldView() {
  return screenLayout().view;
}
