import type {Audio} from './audio';
const key='borrowed-tomorrow:sound';
/** Campaign preference, independent of saves and workshop transport controls. */
export function installSoundPreferences(root:HTMLElement,audio:Audio,changed:(on:boolean)=>void,failed:()=>void){
 let known=false,wanted=false,pending:Promise<void>|undefined;
 try{const saved=localStorage.getItem(key);known=saved==='on'||saved==='off';wanted=saved==='on';}catch{/* Storage is optional. */}
 const remember=()=>{known=true;try{localStorage.setItem(key,wanted?'on':'off');}catch{/* Play normally without persistence. */}};
 const close=()=>{root.removeEventListener('pointerdown',first,true);root.removeEventListener('keydown',first,true);};
 const enable=()=>{
  close();if(wanted&&pending)return pending;
  wanted=true;remember();
  if(audio.enabled){changed(true);return Promise.resolve();}
  const request=audio.play(audio.position().mode).then(()=>{changed(audio.enabled);},()=>{changed(audio.enabled);failed();}).finally(()=>{if(pending===request)pending=undefined;});
  pending=request;return request;
 };
 const toggle=()=>{
  close();
  if(wanted){wanted=false;remember();audio.pause();changed(false);return Promise.resolve();}
  return enable();
 };
 function first(event:Event){
  if(!event.isTrusted)return;
  close();
  if((event.target as Element).closest('#sound-button'))return;
  if(wanted)void enable();
 }
 root.addEventListener('pointerdown',first,true);root.addEventListener('keydown',first,true);
 return {enable,toggle,close,get known(){return known;}};
}
