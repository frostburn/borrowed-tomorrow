import type {Audio} from './audio';
import type {UI} from './ui';

/** Keep the listener, catalogue and styles out of the silent startup bundle. */
export function openSoundtrack(ui:UI,audio:Audio,back?:()=>void){
 let cancelled=false,opening=false;
 ui.showModal('Soundtrack','<p role="status">Loading soundtrack…</p>',back?[{label:'Back to help',action:back}]:[],()=>{if(!opening)cancelled=true;});
 void import('./soundtrack').then(({showSoundtrack})=>{
  if(!cancelled){opening=true;showSoundtrack(ui,audio,back);}
 }).catch(()=>{
  if(cancelled)return;
  ui.showModal('Soundtrack','<p role="alert">The soundtrack could not load. Try again.</p>',[
   {label:'Retry',action:()=>openSoundtrack(ui,audio,back)},...(back?[{label:'Back to help',action:back}]:[]),
  ]);
 });
}
