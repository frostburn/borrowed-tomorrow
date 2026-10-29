import {SOUNDTRACK_CHAPTERS,SOUNDTRACK_ORDER,soundtrackSections,type SoundtrackTrack} from '../content/soundtrack';
import {Audio} from './audio';
import type {UI} from './ui';
import type {MusicMode} from './score';
import './soundtrack.css';

type Score=typeof import('./music-runtime');
type Transport='stopped'|'loading'|'playing'|'paused';

/** A listener owns one disposable audio rack; the campaign keeps its settings. */
class SoundtrackPlayer {
 private readonly player=new Audio();
 private restore?:()=>Promise<void>;
 private root?:HTMLElement;
 private score?:Score;
 private track:SoundtrackTrack=SOUNDTRACK_ORDER[0];
 private chapter=this.track.group;
 private bar=0;
 private volume=75;
 private editing=false;
 private held=false;
 private state:Transport='stopped';
 private generation=0;
 private disposed=false;
 private timer?:number;
 constructor(private ui:UI,private host:Audio){}
 mount(root:HTMLElement){
  this.root=root;this.restore=this.host.suspend();this.ui.sound(false);this.player.setRoom('dry');
  root.innerHTML='<section class="soundtrack-player" aria-label="Soundtrack player"><p class="soundtrack-kicker">Borrowed Tomorrow · Original soundtrack</p><h3 id="soundtrack-title"></h3><p id="soundtrack-meta"></p><p id="soundtrack-status" role="status"></p><div class="soundtrack-transport" id="soundtrack-transport"></div><div class="soundtrack-seek"><button id="soundtrack-previous-bar" aria-label="Previous bar" disabled>Previous</button><label for="soundtrack-bar">Bar</label><input id="soundtrack-bar" type="number" min="1" value="1" disabled><button id="soundtrack-next-bar" aria-label="Next bar" disabled>Next</button><button id="soundtrack-restart">Restart</button></div><div class="soundtrack-volume"><button id="soundtrack-quieter" aria-label="Lower soundtrack volume">−</button><span id="soundtrack-volume">Volume 75%</span><button id="soundtrack-louder" aria-label="Raise soundtrack volume">+</button></div><label class="soundtrack-autoplay"><input id="soundtrack-autoplay" type="checkbox"> Autoplay</label><p class="soundtrack-note">Tracks loop unless Autoplay is checked.</p><p class="soundtrack-error" role="alert" id="soundtrack-error"></p></section><section class="soundtrack-library" aria-label="Soundtrack library"><nav class="soundtrack-chapters" aria-label="Soundtrack chapters"></nav><h3 id="soundtrack-chapter"></h3><div class="soundtrack-tracks" tabindex="0" aria-label="Tracks"></div></section>';
  this.ui.actionRow(root.querySelector('#soundtrack-transport')!,[
   {label:'Previous',title:'Previous track',action:()=>this.adjacent(-1)},
   {label:'Play',action:()=>{if(this.state==='playing'||this.state==='loading')this.pause();else void this.play();}},
   {label:'Stop',action:()=>this.stop()},
   {label:'Next',title:'Next track',action:()=>this.adjacent(1)},
  ]);
  root.querySelectorAll<HTMLButtonElement>('#soundtrack-transport button')[1].id='soundtrack-play';
  root.querySelector<HTMLInputElement>('#soundtrack-bar')!.oninput=()=>{this.editing=true;};
  root.querySelector<HTMLInputElement>('#soundtrack-bar')!.onchange=()=>this.seek();
  root.querySelector<HTMLButtonElement>('#soundtrack-previous-bar')!.onclick=()=>this.skipBar(-1);
  root.querySelector<HTMLButtonElement>('#soundtrack-next-bar')!.onclick=()=>this.skipBar(1);
  root.querySelector<HTMLInputElement>('#soundtrack-autoplay')!.onchange=event=>{this.player.loop=!(event.target as HTMLInputElement).checked;};
  root.querySelector<HTMLInputElement>('#soundtrack-bar')!.onkeydown=event=>{if(event.key==='Enter'){event.preventDefault();this.seek();}};
  root.querySelector<HTMLButtonElement>('#soundtrack-restart')!.onclick=()=>{this.bar=0;this.editing=false;this.held=false;void this.play();};
  root.querySelector<HTMLButtonElement>('#soundtrack-quieter')!.onclick=()=>this.setVolume(-5);
  root.querySelector<HTMLButtonElement>('#soundtrack-louder')!.onclick=()=>this.setVolume(5);
  this.library();this.transport();this.tick();
  this.timer=window.setInterval(()=>this.tick(),150);
 }
 private error(message=''){this.root!.querySelector('#soundtrack-error')!.textContent=message;}
 private async play(){
  if(this.disposed)return;
  const generation=++this.generation,mode=this.track.mode,bar=this.bar,resume=this.held;this.held=false;
  this.error();this.state='loading';this.transport();this.tick();
  try{
   // Both start on the user's gesture; Web Audio must resume before an await.
   const [score]=await Promise.all([import('./music-runtime'),resume?this.player.resume():this.player.play(mode,bar)]);
   if(this.disposed||generation!==this.generation)return;
   this.score=score;this.state='playing';this.transport();this.tick();
  }catch{
   if(this.disposed||generation!==this.generation)return;
   this.player.pause();this.state='stopped';this.transport();this.tick();this.error('Audio could not start. Press Play to try again.');
  }
 }
 private pause(){
  const holding=this.state==='playing';
  if(holding&&this.score)this.bar=this.score.scorePosition(this.track.mode,this.player.position().bar);
  const generation=++this.generation;this.held=holding;
  if(holding)void this.player.hold().catch(()=>{
   if(this.disposed||generation!==this.generation)return;
   this.held=false;this.player.pause();this.error('Audio could not pause. Press Play to restart this bar.');
  });
  else this.player.pause();
  this.state='paused';this.transport();this.tick();
 }
 private stop(){
  this.generation++;this.held=false;this.player.pause();this.state='stopped';this.bar=0;this.editing=false;this.error();this.transport();this.tick();
 }
 private select(mode:MusicMode){
  const playing=this.state==='playing'||this.state==='loading';
  this.generation++;this.held=false;this.player.pause();this.track=SOUNDTRACK_ORDER.find(track=>track.mode===mode)!;
  this.chapter=this.track.group;this.bar=0;this.editing=false;this.state='stopped';this.error();this.library();this.transport();this.tick();
  if(playing)void this.play();
 }
 private adjacent(delta:number){
  const index=SOUNDTRACK_ORDER.findIndex(track=>track.mode===this.track.mode);
  this.select(SOUNDTRACK_ORDER[(index+delta+SOUNDTRACK_ORDER.length)%SOUNDTRACK_ORDER.length].mode);
  this.root!.querySelector('[aria-current="true"]')?.scrollIntoView({block:'nearest'});
 }
 private skipBar(delta:number){
  if(!this.score)return;
  const length=this.score.scoreLength(this.track.mode);
  this.root!.querySelector<HTMLInputElement>('#soundtrack-bar')!.value=String((this.bar+delta+length)%length+1);this.seek();
 }
 private seek(){
  if(!this.score)return;
  const input=this.root!.querySelector<HTMLInputElement>('#soundtrack-bar')!,bar=Number(input.value)-1;
  const length=this.score.scoreLength(this.track.mode);
  if(input.value===''||!Number.isInteger(bar)||bar<0||bar>=length){this.error(`Choose a bar from 1 to ${length}.`);return;}
  const playing=this.state==='playing'||this.state==='loading';
  this.bar=bar;this.editing=false;this.held=false;this.player.pause();this.error();if(playing)void this.play();else this.tick();
 }
 private setVolume(delta:number){
  this.volume=Math.max(0,Math.min(100,this.volume+delta));this.player.setVolume(this.volume/100);
  this.root!.querySelector('#soundtrack-volume')!.textContent=`Volume ${this.volume}%`;
 }
 private library(){
  const root=this.root!,escape=this.ui.escape;
  const focused=document.activeElement as HTMLElement|null,chapterFocus=focused?.dataset.chapter,trackFocus=focused?.dataset.track;
  root.querySelector('.soundtrack-chapters')!.innerHTML=SOUNDTRACK_CHAPTERS.map(chapter=>'<button data-chapter="'+chapter.id+'" aria-label="'+escape(chapter.label)+'" aria-pressed="'+(chapter.id===this.chapter)+'" class="'+(chapter.id===this.chapter?'selected':'')+'">'+(chapter.id==='Library'?'Extras':'Ch '+chapter.id)+'</button>').join('');
  root.querySelector('#soundtrack-chapter')!.textContent=SOUNDTRACK_CHAPTERS.find(chapter=>chapter.id===this.chapter)!.label;
  root.querySelector('.soundtrack-tracks')!.innerHTML=soundtrackSections(this.chapter).map(section=>'<section class="soundtrack-act">'+(section.title?'<h4>'+escape(section.title)+'</h4>':'')+section.tracks.map(track=>'<button data-track="'+track.mode+'" aria-current="'+(track.mode===this.track.mode)+'" class="'+(track.mode===this.track.mode?'selected':'')+'">'+escape(track.title)+'</button>').join('')+'</section>').join('');
  for(const button of root.querySelectorAll<HTMLButtonElement>('[data-chapter]'))button.onclick=()=>{this.chapter=button.dataset.chapter!;this.library();};
  for(const button of root.querySelectorAll<HTMLButtonElement>('[data-track]'))button.onclick=()=>this.select(button.dataset.track as MusicMode);
  if(chapterFocus)root.querySelector<HTMLButtonElement>('[data-chapter="'+this.chapter+'"]')?.focus();
  else if(trackFocus)root.querySelector<HTMLButtonElement>('[aria-current="true"]')?.focus();
 }
 private transport(){
  const root=this.root!;
  root.querySelector('#soundtrack-title')!.textContent=this.track.title;
  root.querySelector<HTMLButtonElement>('#soundtrack-play')!.textContent=this.state==='playing'?'Pause':this.state==='loading'?'Cancel':'Play';
 }
 private tick(){
  if(this.disposed||!this.root)return;
  const root=this.root!,score=this.score,position=this.player.position();
  if(this.state==='playing'&&score){
   if(!this.player.loop&&(this.player.finished||position.bar>=score.scoreLength(this.track.mode))){this.adjacent(1);return;}
   this.bar=score.scorePosition(this.track.mode,position.bar);
  }
  const length=score?.scoreLength(this.track.mode),a=score?.ARRANGEMENTS[this.track.mode];
  const meta=a?`${score!.scoreMeter(this.track.mode)} · ${a.bpm} BPM · ${length} bars${a.introBars?' · '+a.introBars+'-bar opening, then loop':''}`:'31-tone equal temperament · Play to listen';
  if(root.querySelector('#soundtrack-meta')!.textContent!==meta)root.querySelector('#soundtrack-meta')!.textContent=meta;
  const phase=a?.introBars?(this.bar<a.introBars?' · Opening':' · Loop'):'';
  const status=`${this.state==='loading'?'Loading':this.state==='playing'?'Playing':this.state==='paused'?'Paused':'Stopped'} · bar ${this.bar+1}${length?' / '+length:''}${phase}`;
  if(root.querySelector('#soundtrack-status')!.textContent!==status)root.querySelector('#soundtrack-status')!.textContent=status;
  const input=root.querySelector<HTMLInputElement>('#soundtrack-bar')!;
  if(!this.editing&&document.activeElement!==input)input.value=String(this.bar+1);
  input.disabled=!score;if(length)input.max=String(length);
  for(const id of ['soundtrack-previous-bar','soundtrack-next-bar'])root.querySelector<HTMLButtonElement>('#'+id)!.disabled=!score;
 }
 close(){
  if(this.disposed)return;this.disposed=true;this.generation++;
  if(this.timer)clearInterval(this.timer);this.timer=undefined;this.player.close();
  void this.restore?.().then(()=>this.ui.sound(this.host.enabled)).catch(()=>{this.ui.sound(this.host.enabled);this.ui.toast('Audio could not resume. Use the Sound button to try again.');});
 }
}

export function showSoundtrack(ui:UI,host:Audio,back?:()=>void){
 const player=new SoundtrackPlayer(ui,host);
 ui.showModal('Soundtrack','<div class="soundtrack"></div>',back?[{label:'Back to help',action:back}]:[],()=>player.close());
 ui.modal.querySelector('.modal')!.classList.add('soundtrack-dialog');
 player.mount(ui.modal.querySelector('.soundtrack')!);
}
