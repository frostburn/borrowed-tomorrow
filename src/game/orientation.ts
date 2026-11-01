import type Phaser from 'phaser';
import type {Adventure} from './adventure';
import {portraitScreen} from './resolution';

/** A real orientation gate, not a portrait game hidden behind a dismiss button.
 * Pause scene timers/tweens too, so a turn or a film cannot finish unseen. */
export function orientationGuard(root:HTMLElement,source:HTMLElement,game:Phaser.Game,adventure:Adventure){
 const gate=document.createElement('section');gate.className='orientation-gate';gate.hidden=true;
 gate.setAttribute('role','dialog');gate.setAttribute('aria-modal','true');gate.setAttribute('aria-labelledby','rotate-title');
 gate.innerHTML='<div class="rotate-phone" aria-hidden="true">↻</div><h2 id="rotate-title" tabindex="-1">Turn your phone sideways</h2><p>Borrowed Tomorrow plays in landscape.</p><p class="rotate-detail">Your game pauses here while you rotate.</p>';
 root.append(gate);
 let blocked=false,paused=false,focus:HTMLElement|undefined;
 const sync=()=>{
  const portrait=portraitScreen();
  if(portrait!==blocked){
   blocked=portrait;source.inert=portrait;gate.hidden=!portrait;
   if(portrait){focus=document.activeElement as HTMLElement;gate.querySelector<HTMLElement>('h2')!.focus();}
   else if(focus?.isConnected)focus.focus();
  }
  // The first portrait check can happen before Phaser boots its scene.
  // ScenePlugin.resume queues the operation until the next game step. Use the
  // manager's immediate resume so resizeView sees an active scene right now.
  if(portrait&&adventure.sys.isActive()){game.scene.pause(adventure);paused=true;}
  else if(!portrait&&paused){paused=false;game.scene.resume(adventure);adventure.input.keyboard?.resetKeys();adventure.resizeView();}
 };
 window.addEventListener('resize',sync);game.events.on('prerender',sync);sync();
 game.events.once('destroy',()=>{window.removeEventListener('resize',sync);game.events.off('prerender',sync);gate.remove();source.inert=false;});
}
