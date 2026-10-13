import Phaser from 'phaser';
import './style.css';
import { Adventure } from './game/adventure';
import { UI } from './game/ui';
import { WIDTH, HEIGHT } from './content/disk-a/maps';
import { PixelDisplay } from './game/pixel-display';

const adventure=new Adventure();
const ui=new UI(document.getElementById('app')!,{
  journal:()=>adventure.journal(),saves:()=>{void adventure.saves();},sound:()=>{void adventure.toggleSound();},help:()=>adventure.help(),
});
adventure.attach(ui);
document.getElementById('app')!.addEventListener('click',event=>{const button=(event.target as HTMLElement).closest('button');if(button&&button.id!=='sound-button')adventure.audio.effect('click');});
const display=new PixelDisplay(document.getElementById('app')!,(x,y,click)=>adventure.point(x,y,click));
// Canvas rendering keeps the compositor on one raster pipeline, avoiding GPU readback.
const sceneCanvas=document.createElement('canvas');sceneCanvas.getContext('2d',{willReadFrequently:true});
const game=new Phaser.Game({
  type:Phaser.CANVAS,canvas:sceneCanvas,parent:display.host,backgroundColor:'#0a171a',pixelArt:true,antialias:false,
  width:WIDTH,height:HEIGHT,scale:{mode:Phaser.Scale.NONE},
  scene:[adventure],audio:{noAudio:true},banner:false,
});
game.events.on('postrender',()=>{display.attach(game.canvas);display.paint(adventure.animating);});

window.addEventListener('resize',()=>adventure.resizeView());
