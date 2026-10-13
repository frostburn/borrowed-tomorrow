import Phaser from 'phaser';
import './style.css';
import { Adventure } from './game/adventure';
import { UI } from './game/ui';
import { worldView } from './game/resolution';
import { PixelDisplay } from './game/pixel-display';

const adventure=new Adventure();
const ui=new UI(document.getElementById('app')!,{
  journal:()=>adventure.journal(),saves:()=>{void adventure.saves();},sound:()=>{void adventure.toggleSound();},help:()=>adventure.help(),pan:direction=>adventure.panBattle(direction),
});
adventure.attach(ui);
document.getElementById('app')!.addEventListener('click',event=>{const button=(event.target as HTMLElement).closest('button');if(button&&button.id!=='sound-button')adventure.audio.effect('click');});
const display=new PixelDisplay(document.getElementById('app')!,(x,y,click)=>adventure.point(x,y,click));
// Canvas rendering keeps the compositor on one raster pipeline, avoiding GPU readback.
const sceneCanvas=document.createElement('canvas');sceneCanvas.getContext('2d',{willReadFrequently:true});
const viewport=worldView();
const game=new Phaser.Game({
  type:Phaser.CANVAS,canvas:sceneCanvas,parent:display.host,backgroundColor:'#0a171a',pixelArt:true,antialias:false,
  width:viewport.width,height:viewport.height,scale:{mode:Phaser.Scale.NONE},
  scene:[adventure],audio:{noAudio:true},banner:false,
});
// Finish all Phaser resize handlers, then sync before the next input event.
game.scale.on('resize',()=>queueMicrotask(()=>{if(game.canvas){display.attach(game.canvas);display.fitWorld();}}));
game.events.on('postrender',()=>{display.attach(game.canvas);display.paint(adventure.animating);});

window.addEventListener('resize',()=>adventure.resizeView());
