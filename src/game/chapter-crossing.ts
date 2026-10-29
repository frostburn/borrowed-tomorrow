import Phaser from 'phaser';
import {CROSSING_SHOTS,CROSSING_DURATION,crossingFrame,crossingShotStart} from '../content/crossing';
import {paintChapterCrossing} from './crossing-art';
import {MAP_ROOMS} from '../content/rooms';
import type {Audio} from './audio';
import type {UI} from './ui';
import './ending-film.css';

let serial=0;
/** The film holds the departure until the existing asset-checked handoff succeeds. */
export class ChapterCrossing {
 private texture:Phaser.Textures.CanvasTexture;
 private image:Phaser.GameObjects.Image;
 private elapsed:number;
 private playing=true;
 private loading=false;
 private failed=false;
 private closed=false;
 private shot=-1;
 private previousStatus:string;
 private paintKey='';
 private readonly reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 private readonly menu:readonly (readonly [HTMLButtonElement,boolean])[];
 constructor(private scene:Phaser.Scene,private ui:UI,private audio:Audio,private arrive:()=>Promise<boolean>,private back:()=>void,private exportDeparture:()=>void,private review=false,initialShot=0){
  this.elapsed=crossingShotStart(initialShot);if(review&&this.reduced.matches)this.playing=false;
  const key='chapter-crossing-'+serial++;
  this.texture=scene.textures.createCanvas(key,scene.scale.width,scene.scale.height)!;this.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
  this.image=scene.add.image(0,0,key).setOrigin(0).setScrollFactor(0).setDepth(100000);
  this.menu=['inventory-button','journal-button','save-button','help-button'].map(id=>{const b=document.getElementById(id) as HTMLButtonElement;const before=b.disabled;b.disabled=true;return [b,before] as const;});
  this.previousStatus=this.ui.status.textContent??'';this.ui.status.textContent='Space · play / pause　Escape · skip crossing';
  this.ui.clearPanel();this.ui.battlePan.hidden=true;this.ui.initiative.textContent='Leaving Home → Prison Trains';
  document.querySelector('.game-shell')!.classList.add('crossing-film-open');
  this.audio.setRoom(MAP_ROOMS.coast);this.audio.cinematicMix(.8);
  this.audio.setMode('crossing');if(this.audio.enabled)void this.audio.play('crossing');
  scene.events.on(Phaser.Scenes.Events.UPDATE,this.tick);scene.events.once(Phaser.Scenes.Events.SHUTDOWN,this.close);
  window.addEventListener('keydown',this.key);document.addEventListener('visibilitychange',this.visibility);this.reduced.addEventListener('change',this.preference);
  this.resize();this.controls();
 }
 get animating(){return !this.closed&&this.playing&&!this.reduced.matches&&!this.loading;}
 private tick=(_now:number,delta:number)=>{
  if(this.closed)return;
  if(this.playing&&!document.hidden&&!this.loading)this.elapsed=Math.min(CROSSING_DURATION,this.elapsed+Math.max(0,Math.min(delta,100)));
  if(crossingFrame(this.elapsed).ended&&!this.failed&&!this.loading){void this.finish();return;}
  if(crossingFrame(this.elapsed).index!==this.shot)this.controls();this.paint();
 };
 resize(){if(this.closed)return;this.texture.setSize(this.scene.scale.width,this.scene.scale.height);this.image.setTexture(this.texture.key);this.paintKey='';this.paint();}
 private paint(){
  const frame=crossingFrame(this.elapsed),key=[this.reduced.matches?frame.index:this.elapsed,this.reduced.matches,this.texture.width,this.texture.height].join(':');
  if(key===this.paintKey)return;this.paintKey=key;paintChapterCrossing(this.texture.context,this.elapsed,this.reduced.matches);
 }
 private toggle(){if(this.loading||this.failed)return;this.playing=!this.playing;this.controls();}
 private seek(index:number){if(this.loading||this.failed)return;this.elapsed=crossingShotStart(index);this.paintKey='';this.controls();this.paint();}
 private controls(){
  const f=crossingFrame(this.elapsed);this.shot=f.index;
  this.ui.location(f.shot.title);this.ui.canvas.dataset.crossingShot=f.shot.id;this.ui.canvas.dataset.crossingPlaying=String(this.playing&&!this.loading);
  this.ui.canvas.setAttribute('aria-description','Nell and Orrin take their coal engine through the cliffs to the Iron Coast. Space pauses. Escape skips to Chapter Two.');
  this.ui.controls.innerHTML='<section class="ending-controls crossing-controls" aria-label="Chapter crossing controls"><div><h2>'+(this.shot===2?'Prison Trains':'Leaving Home')+'</h2><p aria-live="polite">'+(this.loading?'Loading the Iron Coast…':this.failed?'The departure is safe. Retry the journey, or return to the pass.':(this.playing?'Playing':'Paused')+' · '+(f.index+1)+' / 3 · '+f.shot.title)+'</p></div><div class="panel-actions" id="crossing-actions"></div><p class="ending-keys">Space · play / pause　 Escape · skip cinematic</p></section>';
  this.ui.actionRow(this.ui.controls.querySelector('#crossing-actions')!,[
   ...(!this.failed?[{label:this.playing?'Pause':'Play',disabled:this.loading,action:()=>this.toggle()}]:[]),
   ...(this.review||this.reduced.matches?[
    {label:'Previous shot',disabled:this.loading||this.failed||f.index===0,action:()=>this.seek(f.index-1)},
    {label:'Next shot',disabled:this.loading||this.failed||f.index===CROSSING_SHOTS.length-1,action:()=>this.seek(f.index+1)},
   ]:[]),
   {label:this.review?'Back to workshop':this.failed?'Retry crossing':'Skip cinematic',disabled:this.loading,action:()=>{void this.finish();}},
   ...(!this.review?[
    {label:'Return to the pass',disabled:this.loading,action:()=>{if(!this.loading)this.back();}},
    {label:'Export departure save',disabled:this.loading,action:()=>this.exportDeparture()},
   ]:[]),
  ]);
 }
 private async finish(){
  if(this.closed||this.loading)return;
  this.elapsed=CROSSING_DURATION;this.playing=false;this.loading=true;this.paintKey='';this.controls();this.paint();
  // Entry owns validation and the final state write. Failure keeps this last shot
  // visible with retry/return/export, instead of consuming the departure.
  let success=false;try{success=await this.arrive();}catch(error){this.ui.toast(error instanceof Error?error.message:'The departure is safe. Try the journey again.');}finally{
   if(!this.closed&&!success){this.loading=false;this.failed=true;this.controls();}
  }
 }
 private key=(e:KeyboardEvent)=>{
  if(e.repeat||e.ctrlKey||e.metaKey||e.altKey)return;
  if(e.key==='Escape'){e.preventDefault();void this.finish();return;}
  if((e.target as HTMLElement|null)?.closest('button,input,textarea,select'))return;
  if(e.key===' '){e.preventDefault();this.toggle();}
  if(this.review&&e.key==='ArrowRight'){e.preventDefault();this.seek(this.shot+1);}
  if(this.review&&e.key==='ArrowLeft'){e.preventDefault();this.seek(this.shot-1);}
 };
 private visibility=()=>{if(document.hidden&&this.playing){this.playing=false;this.controls();}};
 private preference=()=>{this.paintKey='';this.paint();this.controls();};
 close=()=>{
  if(this.closed)return;this.closed=true;
  this.scene.events.off(Phaser.Scenes.Events.UPDATE,this.tick);this.scene.events.off(Phaser.Scenes.Events.SHUTDOWN,this.close);
  window.removeEventListener('keydown',this.key);document.removeEventListener('visibilitychange',this.visibility);this.reduced.removeEventListener('change',this.preference);
  this.image.destroy();this.scene.textures.remove(this.texture.key);this.menu.forEach(([b,disabled])=>{b.disabled=disabled;});
  this.ui.canvas.removeAttribute('data-crossing-shot');this.ui.canvas.removeAttribute('data-crossing-playing');this.ui.canvas.removeAttribute('aria-description');
  document.querySelector('.game-shell')?.classList.remove('crossing-film-open');this.ui.status.textContent=this.previousStatus;this.audio.cinematicMix(1);
 };
}
