import Phaser from 'phaser';
import {GOOD_ENDING_SHOTS,GOOD_ENDING_DURATION,endingFrame,endingShotStart} from '../content/ending-film';
import {paintGoodEnding} from './ending-art';
import type {Audio} from './audio';
import type {UI} from './ui';
import {MAP_ROOMS} from '../content/rooms';
import './ending-film.css';

let serial=0;
/** One shared player for campaign completion, replay and isolated workshop review. */
export class EndingFilm {
 private texture:Phaser.Textures.CanvasTexture;
 private image:Phaser.GameObjects.Image;
 private elapsed:number;
 private playing:boolean;
 private closed=false;
 private shot=-1;
 private paintKey='';
 private readonly reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 private readonly previousRoom;
 private readonly previousMode;
 private readonly menu:readonly (readonly [HTMLButtonElement,boolean])[];
 constructor(private scene:Phaser.Scene,private ui:UI,private audio:Audio,private done:()=>void,initialShot=0,private review=false){
  this.elapsed=endingShotStart(initialShot);this.playing=!this.reduced.matches;
  this.previousRoom=audio.room;this.previousMode=audio.position().mode;
  const key='ending-film-'+serial++;
  this.texture=scene.textures.createCanvas(key,scene.scale.width,scene.scale.height)!;
  this.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
  this.image=scene.add.image(0,0,key).setOrigin(0).setScrollFactor(0).setDepth(100000);
  this.menu=['inventory-button','journal-button','save-button','help-button'].map(id=>{const button=document.getElementById(id) as HTMLButtonElement;const previous=button.disabled;button.disabled=true;return [button,previous] as const;});
  document.querySelector('.game-shell')!.classList.add('ending-film-open');
  this.ui.clearPanel();this.ui.battlePan.hidden=true;
  this.ui.canvas.setAttribute('aria-description','Good ending cinematic. Space pauses or plays. Left and right change shots. Escape returns.');
  this.audio.setRoom(MAP_ROOMS.seaholiday);this.audio.cinematicMix(.7);
  this.ui.location('The days return');
  this.ui.initiative.textContent='Good ending · a journey to the real sea';
  this.scene.events.on(Phaser.Scenes.Events.UPDATE,this.tick);
  this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN,this.close);
  window.addEventListener('keydown',this.key);
  document.addEventListener('visibilitychange',this.visibility);
  this.reduced.addEventListener('change',this.preference);
  this.resize();this.controls();this.paint();
 }
 get animating(){return !this.closed&&this.playing&&!this.reduced.matches;}
 private tick=(_now:number,delta:number)=>{
  if(this.closed)return;
  if(this.playing&&!document.hidden)this.elapsed=Math.min(GOOD_ENDING_DURATION,this.elapsed+Math.max(0,Math.min(delta,100)));
  if(endingFrame(this.elapsed).ended){this.finish();return;}
  const index=endingFrame(this.elapsed).index;
  if(index!==this.shot)this.controls();
  this.paint();
 };
 private paint(){
  const key=[Math.floor(this.elapsed/50),this.reduced.matches,this.texture.width,this.texture.height].join(':');
  if(key===this.paintKey)return;this.paintKey=key;
  paintGoodEnding(this.texture.context,this.elapsed,this.reduced.matches);
 }
 resize(){
  if(this.closed)return;
  this.texture.setSize(this.scene.scale.width,this.scene.scale.height);
  this.image.setTexture(this.texture.key);this.paintKey='';this.paint();
 }
 private seek(index:number){
  this.elapsed=endingShotStart(index);this.paintKey='';this.controls();this.paint();
 }
 private toggle(){
  this.playing=!this.playing;this.controls();
 }
 private controls(){
  const f=endingFrame(this.elapsed),changed=f.index!==this.shot;this.shot=f.index;
  if(changed)this.audio.setMode(f.shot.music);
  this.ui.canvas.dataset.endingShot=f.shot.id;this.ui.canvas.dataset.endingPlaying=String(this.playing);
  this.ui.controls.innerHTML='<section class="ending-controls" aria-label="Cinematic controls"><div><h2>Borrowed Tomorrow</h2><p role="status">'+(this.playing?'Playing':'Paused')+' · '+(f.index+1)+' / '+GOOD_ENDING_SHOTS.length+' · '+f.shot.title+'</p></div><div class="panel-actions" id="ending-actions"></div><p class="ending-keys">Space · play / pause　 Left / right · shots　 Escape · return</p></section>';
  this.ui.actionRow(this.ui.controls.querySelector('#ending-actions')!,[
   {label:this.playing?'Pause':'Play',action:()=>this.toggle()},
   {label:'Replay',action:()=>{this.playing=!this.reduced.matches;this.seek(0);}},
   {label:'Previous shot',disabled:f.index===0,action:()=>this.seek(f.index-1)},
   {label:'Next shot',disabled:f.index===GOOD_ENDING_SHOTS.length-1,action:()=>this.seek(f.index+1)},
   {label:this.review?'Back to workshop':'Skip cinematic',action:()=>this.finish()},
  ]);
 }
 private key=(event:KeyboardEvent)=>{
  if(event.ctrlKey||event.metaKey||event.altKey||event.repeat)return;
  const target=event.target as HTMLElement|null;
  if(event.key==='Escape'){event.preventDefault();this.finish();return;}
  if(target?.closest('button,input,textarea,select'))return;
  if(event.key===' '){event.preventDefault();this.toggle();}
  else if(event.key==='ArrowRight'){event.preventDefault();this.seek(endingFrame(this.elapsed).index+1);}
  else if(event.key==='ArrowLeft'){event.preventDefault();this.seek(endingFrame(this.elapsed).index-1);}
 };
 private visibility=()=>{if(document.hidden&&this.playing){this.playing=false;this.controls();}};
 private preference=()=>{if(this.reduced.matches)this.playing=false;this.paintKey='';this.controls();this.paint();};
 private finish(){if(this.closed)return;this.close();this.done();}
 close=()=>{
  if(this.closed)return;this.closed=true;
  this.scene.events.off(Phaser.Scenes.Events.UPDATE,this.tick);this.scene.events.off(Phaser.Scenes.Events.SHUTDOWN,this.close);
  window.removeEventListener('keydown',this.key);document.removeEventListener('visibilitychange',this.visibility);this.reduced.removeEventListener('change',this.preference);
  this.image.destroy();this.scene.textures.remove(this.texture.key);
  this.menu.forEach(([button,disabled])=>{button.disabled=disabled;});
  this.ui.canvas.removeAttribute('data-ending-shot');this.ui.canvas.removeAttribute('data-ending-playing');this.ui.canvas.removeAttribute('aria-description');
  document.querySelector('.game-shell')?.classList.remove('ending-film-open');
  this.audio.cinematicMix(1);this.audio.setRoom(this.previousRoom);this.audio.setMode(this.previousMode);
 };
}
