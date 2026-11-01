/** Stable game-space layout; sprite sources may be filtered to their authored display size. */
export const DESKTOP_WIDTH = 1024;
export const DISPLAY_HEIGHT = 768;
export const WORLD_VIEW_WIDTH = 1008;
export const WORLD_VIEW_HEIGHT = 480;
export const PHONE_HEADER = 40, PHONE_TURNS = 24, PHONE_FOOTER = 16;
export interface Insets {left:number;right:number;top:number;bottom:number}
const even=(n:number)=>Math.floor(n/2)*2;
const compactViewport=(width:number,height:number)=>width<DESKTOP_WIDTH||height<600;
/** Phones use the available landscape area at CSS scale 1, not a scaled-down
 * portrait console. Keep the desktop's established 1024×768 composition. */
export function layoutForViewport(width:number,height:number,insets:Insets={left:0,right:0,top:0,bottom:0}){
 const compact=compactViewport(width,height);
 const w=compact?even(width-insets.left-insets.right):DESKTOP_WIDTH;
 const h=compact?even(height-insets.top-insets.bottom):DISPLAY_HEIGHT;
 const sidebar=compact?Math.min(288,even(w*.38)):0;
 return {compact,portrait:compact&&height>width,width:w,height:h,sidebar,
  view:{width:compact?w-sidebar:WORLD_VIEW_WIDTH,height:compact?h-PHONE_HEADER-PHONE_TURNS-PHONE_FOOTER:WORLD_VIEW_HEIGHT},insets};
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
