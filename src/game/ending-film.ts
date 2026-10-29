import Phaser from 'phaser';
import {ENDING_FILMS,BAD_ENDING_HINT,endingFrame,endingShotStart,endingCreditTime,type EndingKind} from '../content/ending-film';
import {ENDING_CREDITS,ENDING_CREDIT_PAGE,endingCreditPage} from '../content/credits';
import {paintEndingFilm} from './ending-art';
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
 private credit=-1;
 private paintKey='';
 private readonly reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 private readonly previousRoom;
 private readonly previousMode;
 private readonly menu:readonly (readonly [HTMLButtonElement,boolean])[];
 constructor(private scene:Phaser.Scene,private ui:UI,private audio:Audio,private done:()=>void,initialShot=0,private review=false,private kind:EndingKind='good'){
  this.elapsed=endingShotStart(initialShot,this.kind);this.playing=!this.reduced.matches;
  this.previousRoom=audio.room;this.previousMode=audio.position().mode;
  const key='ending-film-'+serial++;
  this.texture=scene.textures.createCanvas(key,scene.scale.width,scene.scale.height)!;
  this.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
  this.image=scene.add.image(0,0,key).setOrigin(0).setScrollFactor(0).setDepth(100000);
  this.menu=['inventory-button','journal-button','save-button','help-button'].map(id=>{const button=document.getElementById(id) as HTMLButtonElement;const previous=button.disabled;button.disabled=true;return [button,previous] as const;});
  document.querySelector('.game-shell')!.classList.add('ending-film-open');
  this.ui.clearPanel();this.ui.battlePan.hidden=true;
  this.audio.setRoom(MAP_ROOMS[this.film.room]);this.audio.cinematicMix(.7);
  this.ui.location(this.film.title);
  this.ui.initiative.textContent=this.film.label+' · '+this.film.description;
  this.scene.events.on(Phaser.Scenes.Events.UPDATE,this.tick);
  this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN,this.close);
  window.addEventListener('keydown',this.key);
  document.addEventListener('visibilitychange',this.visibility);
  this.reduced.addEventListener('change',this.preference);
  this.resize();this.controls();this.paint();
 }
 private get film(){return ENDING_FILMS[this.kind];}
 get animating(){return !this.closed&&this.playing&&!this.reduced.matches;}
 private tick=(_now:number,delta:number)=>{
  if(this.closed)return;
  if(this.playing&&!document.hidden)this.elapsed=Math.min(this.film.duration,this.elapsed+Math.max(0,Math.min(delta,100)));
  if(endingFrame(this.elapsed,this.kind).ended){this.finish();return;}
  const frame=endingFrame(this.elapsed,this.kind);
  if(frame.index!==this.shot||(this.reduced.matches&&frame.index===this.film.creditShot&&endingCreditPage(endingCreditTime(frame.time,this.kind))!==this.credit))this.controls();
  this.paint();
 };
 private paint(){
  const frame=endingFrame(this.elapsed,this.kind);
  const position=this.reduced.matches?frame.shot.id+':'+endingCreditPage(endingCreditTime(frame.time,this.kind)):Math.floor(this.elapsed/50);
  const key=[position,this.reduced.matches,this.texture.width,this.texture.height].join(':');
  if(key===this.paintKey)return;this.paintKey=key;
  paintEndingFilm(this.texture.context,this.elapsed,this.reduced.matches,this.kind);
 }
 resize(){
  if(this.closed)return;
  this.texture.setSize(this.scene.scale.width,this.scene.scale.height);
  this.image.setTexture(this.texture.key);this.paintKey='';this.paint();
 }
 private seek(index:number){
  this.elapsed=endingShotStart(index,this.kind);this.paintKey='';this.controls();this.paint();
 }
 private toggle(){
  this.playing=!this.playing;this.controls();
 }
 private seekCredit(page=0){
  const selected=Math.max(0,Math.min(ENDING_CREDITS.length-1,page));
  // Seek inside the fractional page interval so scene-time subtraction is stable.
  this.elapsed=endingShotStart(this.film.creditShot,this.kind)+this.film.creditStart+selected*ENDING_CREDIT_PAGE+(this.reduced.matches?1:2500);
  if(this.reduced.matches)this.playing=false;
  this.paintKey='';this.controls();this.paint();
 }
 private controls(){
  const f=endingFrame(this.elapsed,this.kind),changed=f.index!==this.shot;this.shot=f.index;
  const cards=this.reduced.matches&&f.index===this.film.creditShot;this.credit=endingCreditPage(endingCreditTime(f.time,this.kind));
  const credit=ENDING_CREDITS[this.credit];
  if(changed){this.audio.setMode(f.shot.music);this.ui.location(f.shot.title);}
  this.ui.canvas.dataset.endingKind=this.kind;this.ui.canvas.dataset.endingShot=f.shot.id;this.ui.canvas.dataset.endingPlaying=String(this.playing);
  const fullCredits=ENDING_CREDITS.map(entry=>entry.role+(entry.lines.length?': '+entry.lines.join(', '):'')).join('. ');
  this.ui.canvas.setAttribute('aria-description',this.film.label+' cinematic. Space pauses or plays. Left and right change '+(cards?'credits':'shots')+'. Escape returns.'+(f.index===this.film.creditShot?' Credits: '+fullCredits: '')+(this.kind==='bad'?' '+BAD_ENDING_HINT:''));
  this.ui.controls.innerHTML='<section class="ending-controls" aria-label="Cinematic controls"><div><h2>Borrowed Tomorrow</h2><p role="status">'+(this.playing?'Playing':'Paused')+' · '+(cards?'Credits '+(this.credit+1)+' / '+ENDING_CREDITS.length:(f.index+1)+' / '+this.film.shots.length+' · '+f.shot.title)+'</p>'+(cards?'<p class="ending-credit-copy">'+credit.role+(credit.lines.length?' · '+credit.lines.join(' · '):'')+'</p>':'')+(cards&&this.kind==='bad'?'<p class="ending-hint">'+BAD_ENDING_HINT+'</p>':'')+'</div><div class="panel-actions" id="ending-actions"></div><p class="ending-keys">Space · play / pause　 Left / right · '+(cards?'credits':'shots')+'　 Escape · return</p></section>';
  this.ui.actionRow(this.ui.controls.querySelector('#ending-actions')!,[
   {label:this.playing?'Pause':'Play',action:()=>this.toggle()},
   {label:'Replay',action:()=>{this.playing=!this.reduced.matches;this.seek(0);}},
   ...(!cards?[
    {label:'Previous shot',disabled:f.index===0,action:()=>this.seek(f.index-1)},
    {label:'Next shot',disabled:f.index===this.film.shots.length-1,action:()=>this.seek(f.index+1)},
    {label:'Credits',action:()=>this.seekCredit()},
   ]:[]),
   ...(cards?[
    {label:'Previous credit',disabled:this.credit===0,action:()=>this.seekCredit(this.credit-1)},
    {label:'Next credit',disabled:this.credit===ENDING_CREDITS.length-1,action:()=>this.seekCredit(this.credit+1)},
   ]:[]),
   {label:this.review?'Back to workshop':'Skip cinematic',action:()=>this.finish()},
  ]);
 }
 private key=(event:KeyboardEvent)=>{
  if(event.ctrlKey||event.metaKey||event.altKey||event.repeat)return;
  const target=event.target as HTMLElement|null;
  if(event.key==='Escape'){event.preventDefault();this.finish();return;}
  if(target?.closest('button,input,textarea,select'))return;
  if(event.key===' '){event.preventDefault();this.toggle();}
  else if(event.key==='ArrowRight'){event.preventDefault();if(this.reduced.matches&&this.shot===this.film.creditShot)this.seekCredit(this.credit+1);else if(this.film.shots.length>1)this.seek(endingFrame(this.elapsed,this.kind).index+1);}
  else if(event.key==='ArrowLeft'){event.preventDefault();if(this.reduced.matches&&this.shot===this.film.creditShot)this.seekCredit(this.credit-1);else if(this.film.shots.length>1)this.seek(endingFrame(this.elapsed,this.kind).index-1);}
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
  this.ui.canvas.removeAttribute('data-ending-kind');this.ui.canvas.removeAttribute('data-ending-shot');this.ui.canvas.removeAttribute('data-ending-playing');this.ui.canvas.removeAttribute('aria-description');
  document.querySelector('.game-shell')?.classList.remove('ending-film-open');
  this.audio.cinematicMix(1);this.audio.setRoom(this.previousRoom);this.audio.setMode(this.previousMode);
 };
}
